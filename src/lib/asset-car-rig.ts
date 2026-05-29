import * as THREE from "three";
import { resolveMarketRigProfile, type MarketRigProfile } from "@/lib/market-rig-profiles";
import {
  createSyntheticGroundWheels,
  hideMisplacedTemplateWheels,
} from "@/lib/asset-showroom-wheels";

export const ASSET_DOOR_MAX_OPEN_RADIANS = (70 * Math.PI) / 180;
export const ASSET_TRUNK_MAX_OPEN_RADIANS = (75 * Math.PI) / 180;

/** Upper bound for GLB headlamp emissive (toneMapped off on lens materials). */
export const SHOWROOM_HEADLAMP_INTENSITY = {
  on: 10,
  engineOn: 12,
  minEmissive: 16,
  emissiveScale: 3.4,
} as const;

/** Hazard blink — keep saturation; high HDR intensity reads white on screen. */
export const SHOWROOM_HAZARD_INTENSITY = {
  on: 5.5,
  withHeadlights: 2.2,
  /** Cap emissive so red stays red (not blown out to white). */
  tailMax: 6.2,
  tailMin: 2.8,
} as const;

export const SHOWROOM_TAIL_LAMP_COLOR = 0xc81e1e;

export type ShowroomSpinAxis = "x" | "y" | "z";

export type AssetCarRig = {
  bounds: THREE.Box3;
  leftDoorPivot: THREE.Group | null;
  rightDoorPivot: THREE.Group | null;
  trunkPivot: THREE.Group | null;
  sunroofNodes: THREE.Object3D[];
  headLightMaterials: ShowroomMaterial[];
  /** World-space lamp centers for showroom spotlight placement. */
  headLightPositions: THREE.Vector3[];
  /** Body paint materials (profile-driven or auto-discovered). */
  paintMaterials: ShowroomMaterial[];
  tailLightMaterials: ShowroomMaterial[];
  hazardMaterials: ShowroomMaterial[];
  /** Spin pivots centered on each accepted wheel (rotated about the axle). */
  frontWheels: THREE.Object3D[];
  rearWheels: THREE.Object3D[];
  /** Steering pivots wrapping the front spin pivots (rotated about vertical Y). */
  frontSteerPivots: THREE.Object3D[];
  /** Human-readable summary for UI / debugging. */
  capabilities: {
    leftDoor: boolean;
    rightDoor: boolean;
    trunk: boolean;
    sunroof: boolean;
    headLights: boolean;
    tailLights: boolean;
    wheels: boolean;
    /** True when corner rollers are procedural (body has no separable wheel meshes). */
    wheelsSynthetic: boolean;
  };
};

type MeshEntry = {
  mesh: THREE.Mesh;
  name: string;
  materialName: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
  volume: number;
};

function getSourceMaterialName(mesh: THREE.Mesh) {
  const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return source?.name ?? "";
}

type ShowroomMaterial = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;

const DOOR_EXCLUDE =
  /(tail[_\s-]?lamp|door[_\s-]?int|door_int|interior|boot|lock|carpet|icon|speaker|seat|rubber|clamp|wind|windsh|glass_red|hl_cover|technology|primeam)/i;
const DOOR_INCLUDE =
  /(door[_\s-]?black|door[_\s-]?soft|door[_\s-]?rubber|door[_\s-]?plastic|door[_\s-]?noise)/i;

function hierarchicalName(object: THREE.Object3D): string {
  const parts: string[] = [];
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name) {
      parts.unshift(current.name);
    }
    current = current.parent;
  }
  return parts.join("/");
}

function matchesAny(name: string, patterns?: RegExp[]) {
  if (!patterns?.length) {
    return false;
  }
  return patterns.some((pattern) => pattern.test(name));
}

function getMeshVolume(mesh: THREE.Mesh) {
  const size = new THREE.Vector3();
  new THREE.Box3().setFromObject(mesh).getSize(size);
  return Math.max(size.x * size.y * size.z, 1e-6);
}

export function ensureShowroomMaterial(mesh: THREE.Mesh): ShowroomMaterial | null {
  const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  if (
    !(source instanceof THREE.MeshStandardMaterial) &&
    !(source instanceof THREE.MeshPhysicalMaterial)
  ) {
    return null;
  }
  const cached = mesh.userData.showroomMaterial as ShowroomMaterial | undefined;
  if (cached) {
    return cached;
  }
  const cloned = source.clone();
  const emissiveHsl = { h: 0, s: 0, l: 0 };
  source.emissive.getHSL(emissiveHsl);
  const hasAuthoredEmissive = (source.emissiveIntensity ?? 0) > 0.02 || emissiveHsl.l > 0.02;
  const emissiveBase = hasAuthoredEmissive
    ? source.emissive.clone()
    : source.color
      ? source.color.clone()
      : new THREE.Color(0, 0, 0);
  cloned.userData.showroomBaseEmissive = emissiveBase;
  cloned.userData.showroomBaseEmissiveIntensity = source.emissiveIntensity ?? 0;
  mesh.userData.showroomMaterial = cloned;
  mesh.material = cloned;
  return cloned;
}

/** Clone body-paint materials separately from lamp clones. */
export function ensureShowroomPaintMaterial(mesh: THREE.Mesh): ShowroomMaterial | null {
  const cached = mesh.userData.showroomPaintMaterial as ShowroomMaterial | undefined;
  if (cached) {
    return cached;
  }
  const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  if (
    !(source instanceof THREE.MeshStandardMaterial) &&
    !(source instanceof THREE.MeshPhysicalMaterial)
  ) {
    return null;
  }
  const cloned = source.clone();
  cloned.userData.showroomBaseColor = source.color.clone();
  mesh.userData.showroomPaintMaterial = cloned;
  mesh.material = cloned;
  return cloned;
}

function isExcludedPart(name: string) {
  return /(camera|helper|gizmo|locator|steer|column)/i.test(name);
}

function isInteriorLight(name: string) {
  return /(interior|int_|roof.*lamp|roof.*light|icon|speaker|control_light)/i.test(name);
}

function isHeadLightPart(name: string, center: THREE.Vector3, frontX: number) {
  if (isInteriorLight(name)) {
    return false;
  }
  if (/(^|\/)(light1|lightled|glowtext)(_|\.|$)/i.test(name)) {
    return false;
  }
  // Keep `nlightsf` for Brabus inner lenses; exclude other nlights* via profile only.
  if (/(^|\/)nlights(?!f)/i.test(name)) {
    return false;
  }
  return (
    /(?:^|[^a-z])hl\d|[^a-z]hl_|head\s*light|headlight|projection[_\s-]?lamp|hl_chrome|hl_cover|hl_inner|lights_lod0/i.test(
      name,
    ) || (center.x < frontX && /lamp|chrome[_\s-]?light/i.test(name) && !/tail|rear/i.test(name))
  );
}

function isOffroadHeadlampMesh(name: string) {
  return /lights_lod0|lamp_alpha|\/\d+_lights_0|nlightsf/i.test(name);
}

function isBmwM2HeadlampMaterial(materialName: string) {
  return /LightA_Material/i.test(materialName);
}

function isBmwM2TailMaterial(materialName: string) {
  return /red_glass|LightEmissiveA/i.test(materialName);
}

function isSuvHeadlampMesh(name: string) {
  if (/tail|taillamp|door_tail|int_|interior|door_int|roof_control/i.test(name)) {
    return false;
  }
  return (
    /\bHL\d_Mesh/i.test(name) ||
    /Hl_Projection_lamp|Hl_inner_glass/i.test(name) ||
    /HL_Chrome|Hl_Cover/i.test(name)
  );
}

function isExcludedFromHeadlightDiscovery(name: string) {
  return /tail|taillamp|door_tail_lamp|int_|interior|door_int.*light|roof_control/i.test(
    name,
  );
}

function applyShowroomHeadlampLens(material: ShowroomMaterial) {
  const lampColor = new THREE.Color(0xffffff);
  material.userData.showroomHeadlampLens = true;
  material.userData.showroomBaseEmissive = lampColor;
  material.userData.showroomBaseEmissiveIntensity = 0;
  material.emissive.copy(lampColor);
}

function applyShowroomTailLamp(material: ShowroomMaterial) {
  const lampColor = new THREE.Color(SHOWROOM_TAIL_LAMP_COLOR);
  material.userData.showroomTailLamp = true;
  material.userData.showroomBaseEmissive = lampColor;
  material.userData.showroomBaseEmissiveIntensity = 0;
  material.emissive.copy(lampColor);
}

function taillampPositionAllowed(
  profile: MarketRigProfile | null,
  profileTailLight: boolean,
  materialName: string,
  meshCenter: THREE.Vector3,
  bounds: THREE.Box3,
) {
  if (profile?.id === "bmw-m2" && profileTailLight && isBmwM2TailMaterial(materialName)) {
    if (/LightEmissiveA/i.test(materialName)) {
      return true;
    }
    const size = bounds.getSize(new THREE.Vector3());
    return meshCenter.x >= bounds.max.x - size.x * 0.28;
  }
  return true;
}

function shouldApplyHeadlampLensPreset(
  profile: MarketRigProfile | null,
  profileHeadLight: boolean,
) {
  return (
    profileHeadLight &&
    (profile?.id === "offroad-brabus" ||
      profile?.id === "suv-q3" ||
      profile?.id === "bmw-m2")
  );
}

function headlampPositionAllowed(
  profile: MarketRigProfile | null,
  profileHeadLight: boolean,
  name: string,
  materialName: string,
  meshCenter: THREE.Vector3,
  meshSize: THREE.Vector3,
  bounds: THREE.Box3,
  carCenter: THREE.Vector3,
  depth: number,
  width: number,
) {
  if (profile?.id === "offroad-brabus" && profileHeadLight && isOffroadHeadlampMesh(name)) {
    return true;
  }
  if (profile?.id === "suv-q3" && profileHeadLight && isSuvHeadlampMesh(name)) {
    return true;
  }
  if (profile?.id === "bmw-m2" && profileHeadLight && isBmwM2HeadlampMaterial(materialName)) {
    return true;
  }
  const isLocalizedPanel =
    meshSize.x <= depth * 0.55 && meshSize.z <= width * 0.62;
  return (
    isPlausibleHeadlampPosition(meshCenter, bounds, carCenter) ||
    (profileHeadLight && isLocalizedPanel)
  );
}

/** Headlamps sit at the front corners, not the grille badge or roof LED strip. */
function isPlausibleHeadlampPosition(
  center: THREE.Vector3,
  bounds: THREE.Box3,
  carCenter: THREE.Vector3,
) {
  const size = bounds.getSize(new THREE.Vector3());
  const nearFront = center.x <= bounds.min.x + size.x * 0.22;
  const sideMounted = Math.abs(center.z - carCenter.z) >= size.z * 0.1;
  const notRoofStrip = center.y <= bounds.min.y + size.y * 0.72;
  return nearFront && sideMounted && notRoofStrip;
}

function isTailLightPart(name: string, center: THREE.Vector3, rearX: number) {
  if (isInteriorLight(name)) {
    return false;
  }
  return (
    /tail[_\s-]?lamp|taillight|tail\s*light|rear\s*light|stop\s*light|brake\s*light|tail_upper|tail_inner|tail_cover/i.test(
      name,
    ) ||
    (/(emiss|red_cover)/i.test(name) && center.x > rearX)
  );
}

function isHazardPart(name: string) {
  return /(hazard|indicator|turn|emiss|amber)/i.test(name) && /(tail|lamp|light|rear)/i.test(name);
}

function isTrunkPart(name: string) {
  return (
    /boot[_\s-]?ext/i.test(name) &&
    !/wind|windsh|int|interior|net|nameboard|clamp/i.test(name)
  );
}

function isDoorCandidate(name: string, profile: MarketRigProfile | null) {
  if (DOOR_EXCLUDE.test(name)) {
    return false;
  }
  if (profile && (matchesAny(name, profile.leftDoor) || matchesAny(name, profile.rightDoor))) {
    return true;
  }
  if (!/door/i.test(name)) {
    return false;
  }
  return DOOR_INCLUDE.test(name) || /door[_\s-]?black|door[_\s-]?soft/i.test(name);
}

function isSunroofPart(name: string) {
  return /(sunroof|moon\s*roof)/i.test(name) || (/roof/i.test(name) && /glass/i.test(name));
}

function collectMeshes(root: THREE.Object3D) {
  const entries: MeshEntry[] = [];
  root.updateWorldMatrix(true, true);
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.visible) {
      return;
    }
    const name = hierarchicalName(mesh);
    if (isExcludedPart(name)) {
      return;
    }
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    entries.push({
      mesh,
      name,
      materialName: getSourceMaterialName(mesh),
      center,
      size,
      volume: Math.max(size.x * size.y * size.z, 1e-6),
    });
  });
  return entries;
}

function createSideDoorPivot(
  root: THREE.Object3D,
  meshes: THREE.Mesh[],
  side: "left" | "right",
) {
  if (meshes.length === 0) {
    return null;
  }

  const pivot = new THREE.Group();
  const doorBox = new THREE.Box3();
  for (const mesh of meshes) {
    doorBox.expandByObject(mesh);
  }

  const hingeX = doorBox.min.x + (doorBox.max.x - doorBox.min.x) * 0.06;
  const hingeY = doorBox.min.y + (doorBox.max.y - doorBox.min.y) * 0.32;
  const hingeZ = side === "left" ? doorBox.max.z : doorBox.min.z;
  pivot.position.set(hingeX, hingeY, hingeZ);
  pivot.userData.showroomHingeAxis = "y";
  root.add(pivot);

  for (const mesh of meshes) {
    pivot.attach(mesh);
  }

  pivot.userData.showroomSide = side;
  return pivot;
}

function createTrunkPivot(root: THREE.Object3D, meshes: THREE.Mesh[]) {
  if (meshes.length === 0) {
    return null;
  }

  const pivot = new THREE.Group();
  const trunkBox = new THREE.Box3();
  for (const mesh of meshes) {
    trunkBox.expandByObject(mesh);
  }

  pivot.position.set(
    trunkBox.max.x,
    trunkBox.min.y + (trunkBox.max.y - trunkBox.min.y) * 0.68,
    (trunkBox.min.z + trunkBox.max.z) / 2,
  );
  pivot.userData.showroomHingeAxis = "z";
  root.add(pivot);

  for (const mesh of meshes) {
    pivot.attach(mesh);
  }

  return pivot;
}

function detectSpinAxis(mesh: THREE.Mesh): ShowroomSpinAxis {
  const size = new THREE.Vector3();
  new THREE.Box3().setFromObject(mesh).getSize(size);
  if (size.x <= size.y && size.x <= size.z) {
    return "x";
  }
  if (size.z <= size.x && size.z <= size.y) {
    return "z";
  }
  return "y";
}

/** Names that contain "wheel" but are not road wheels (spare, steering, trim). */
function isWheelMeshName(name: string) {
  if (
    /(spare|sparewheel|leather.?wheel|steering.?wheel|wheel_track|rimdetail|hubcap|diamondcutrim)/i.test(
      name,
    )
  ) {
    return false;
  }
  if (/(caliper|brake\s*disc|brake\s*pad|fender|arch)/i.test(name)) {
    return false;
  }
  return /(wheel|tire|tyre|rim)/i.test(name);
}

function resolveWheelNode(child: THREE.Object3D, root: THREE.Object3D) {
  const mesh = child as THREE.Mesh;
  if (!mesh.isMesh) {
    return child;
  }

  let node: THREE.Object3D = child;
  const parent = child.parent;
  if (
    parent &&
    parent !== root &&
    /(DEF-Wheel|Q3_Tyre|left_wheel|right_wheel)/i.test(parent.name)
  ) {
    const parentBox = new THREE.Box3().setFromObject(parent);
    const parentCenter = parentBox.getCenter(new THREE.Vector3());
    const meshBox = new THREE.Box3().setFromObject(child);
    const meshCenter = meshBox.getCenter(new THREE.Vector3());
    if (parentCenter.distanceTo(meshCenter) > 0.02) {
      node = parent;
    }
  }

  return node;
}

function isNearGroundWheel(center: THREE.Vector3, bounds: THREE.Box3, carSize: THREE.Vector3) {
  return center.y <= bounds.min.y + carSize.y * 0.26;
}

/** Rear tailgate / roof-mounted spare rigs (e.g. Brabus G900 spare cluster). */
function isTailgateMountedWheel(
  center: THREE.Vector3,
  bounds: THREE.Box3,
  carSize: THREE.Vector3,
  carCenter: THREE.Vector3,
) {
  const highMount = center.y > bounds.min.y + carSize.y * 0.32;
  const rearMount = center.x > carCenter.x + carSize.x * 0.1;
  return highMount && rearMount;
}

function clusterHasSparePart(nodes: THREE.Object3D[]) {
  return nodes.some((node) => /spare/i.test(hierarchicalName(node)));
}

type WheelCandidate = {
  node: THREE.Object3D;
  center: THREE.Vector3;
  size: THREE.Vector3;
};

type WheelCluster = {
  center: THREE.Vector3;
  size: THREE.Vector3;
  nodes: THREE.Object3D[];
};

function findWheelNodes(root: THREE.Object3D, profile: MarketRigProfile | null) {
  const frontWheels: THREE.Object3D[] = [];
  const rearWheels: THREE.Object3D[] = [];
  const frontSteerPivots: THREE.Object3D[] = [];

  const bounds = new THREE.Box3().setFromObject(root);
  const carCenter = bounds.getCenter(new THREE.Vector3());
  const carSize = bounds.getSize(new THREE.Vector3());

  const seen = new Set<string>();
  const candidates: WheelCandidate[] = [];
  root.traverse((child) => {
    const name = hierarchicalName(child);
    const isWheel =
      matchesAny(name, profile?.wheel) || isWheelMeshName(name);
    if (!isWheel) {
      return;
    }

    const node = resolveWheelNode(child, root);
    if (seen.has(node.uuid)) {
      return;
    }
    seen.add(node.uuid);

    const box = new THREE.Box3().setFromObject(node);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    candidates.push({ node, center, size });
  });

  const clusters: WheelCluster[] = [];
  const clusterTolerance = Math.max(carSize.x, carSize.z) * 0.12;
  for (const cand of candidates) {
    const existing = clusters.find((cluster) => cluster.center.distanceTo(cand.center) <= clusterTolerance);
    if (existing) {
      existing.nodes.push(cand.node);
      existing.center.lerp(cand.center, 0.5);
      existing.size.max(cand.size);
    } else {
      clusters.push({ center: cand.center.clone(), size: cand.size.clone(), nodes: [cand.node] });
    }
  }

  const buildPivot = (cluster: WheelCluster) => {
    const spinPivot = new THREE.Group();
    spinPivot.position.copy(cluster.center);
    root.add(spinPivot);
    for (const node of cluster.nodes) {
      spinPivot.attach(node);
    }
    spinPivot.userData.showroomSpinAxis = detectSpinAxis(spinPivot as unknown as THREE.Mesh);
    return spinPivot;
  };

  const accepted: WheelCluster[] = [];
  for (const cluster of clusters) {
    if (clusterHasSparePart(cluster.nodes)) {
      continue;
    }
    if (!isNearGroundWheel(cluster.center, bounds, carSize)) {
      continue;
    }
    if (isTailgateMountedWheel(cluster.center, bounds, carSize, carCenter)) {
      continue;
    }

    const merged = cluster.size.x > carSize.x * 0.45 || cluster.size.z > carSize.z * 0.6;
    const atCenter =
      Math.abs(cluster.center.x - carCenter.x) < carSize.x * 0.12 &&
      Math.abs(cluster.center.z - carCenter.z) < carSize.z * 0.12;
    if (merged || atCenter) {
      continue;
    }

    accepted.push(cluster);
  }

  // At most one spin pivot per corner (FL / FR / RL / RR).
  const quadrantBest = new Map<string, WheelCluster>();
  for (const cluster of accepted) {
    const front = cluster.center.x < carCenter.x;
    const left = cluster.center.z > carCenter.z;
    const key = `${front ? "F" : "R"}${left ? "L" : "R"}`;
    const prev = quadrantBest.get(key);
    if (!prev || cluster.center.y < prev.center.y) {
      quadrantBest.set(key, cluster);
    }
  }

  for (const cluster of quadrantBest.values()) {
    const spinPivot = buildPivot(cluster);
    const isFront = cluster.center.x < carCenter.x;
    if (isFront) {
      const steerPivot = new THREE.Group();
      steerPivot.position.copy(cluster.center);
      root.add(steerPivot);
      steerPivot.attach(spinPivot);
      frontSteerPivots.push(steerPivot);
      frontWheels.push(spinPivot);
    } else {
      rearWheels.push(spinPivot);
    }
  }

  return { frontWheels, rearWheels, frontSteerPivots };
}

export function discoverAssetCarRig(root: THREE.Object3D, modelUrl?: string): AssetCarRig {
  const profile = resolveMarketRigProfile(modelUrl);
  const bounds = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const entries = collectMeshes(root);
  const headLightMaterials: ShowroomMaterial[] = [];
  const headLightPositions: THREE.Vector3[] = [];
  const paintMaterials: ShowroomMaterial[] = [];
  const tailLightMaterials: ShowroomMaterial[] = [];
  const hazardMaterials: ShowroomMaterial[] = [];
  const sunroofNodes: THREE.Object3D[] = [];
  const leftDoorMeshes: THREE.Mesh[] = [];
  const rightDoorMeshes: THREE.Mesh[] = [];
  const trunkMeshes: THREE.Mesh[] = [];

  const depth = Math.max(size.x, 0.001);
  const width = Math.max(size.z, 0.001);
  const frontX = bounds.min.x + depth * 0.2;
  const rearX = bounds.max.x - depth * 0.2;
  const frontDoorX = bounds.min.x + depth * 0.58;
  const leftZ = bounds.min.z + width * 0.32;
  const rightZ = bounds.max.z - width * 0.32;

  // A genuine door / trunk lid is a localized panel, never a body-spanning mesh.
  // Reject meshes whose footprint covers most of the car (merged/material-grouped bodies).
  const isLocalizedPanel = (meshSize: THREE.Vector3) =>
    meshSize.x <= depth * 0.55 && meshSize.z <= width * 0.62;

  for (const entry of entries) {
    const { mesh, name, materialName, center: meshCenter, size: meshSize } = entry;
    const nameLower = name.toLowerCase();
    const materialLower = materialName.toLowerCase();
    const label = `${nameLower} ${materialLower}`;

    if (matchesAny(name, profile?.sunroof) || isSunroofPart(nameLower)) {
      if (!isInteriorLight(nameLower)) {
        sunroofNodes.push(mesh);
      }
      continue;
    }

    if (matchesAny(name, profile?.paintMaterial) || matchesAny(materialName, profile?.paintMaterial)) {
      const material = ensureShowroomPaintMaterial(mesh);
      if (material) {
        paintMaterials.push(material);
      }
      continue;
    }

    const profileHeadLight =
      matchesAny(name, profile?.headLight) ||
      matchesAny(materialName, profile?.headLightMaterial);
    const headLightCandidate =
      profileHeadLight || isHeadLightPart(label, meshCenter, frontX);
    if (
      !isExcludedFromHeadlightDiscovery(nameLower) &&
      headLightCandidate &&
      headlampPositionAllowed(
        profile,
        profileHeadLight,
        name,
        materialName,
        meshCenter,
        meshSize,
        bounds,
        center,
        depth,
        width,
      )
    ) {
      const material = ensureShowroomMaterial(mesh);
      if (material) {
        if (shouldApplyHeadlampLensPreset(profile, profileHeadLight)) {
          applyShowroomHeadlampLens(material);
        }
        headLightMaterials.push(material);
        // Full-width lamp bars span the bumper; anchor at the front face (showroom forward = -X).
        if (meshSize.z > width * 0.32) {
          if (headLightPositions.length < 2) {
            const lampFrontX = meshCenter.x - meshSize.x * 0.46;
            const halfZ = meshSize.z * 0.42;
            headLightPositions.push(
              new THREE.Vector3(lampFrontX, meshCenter.y, meshCenter.z + halfZ),
              new THREE.Vector3(lampFrontX, meshCenter.y, meshCenter.z - halfZ),
            );
          }
        } else if (meshCenter.x <= frontX) {
          headLightPositions.push(meshCenter.clone());
        }
      }
      continue;
    }

    const profileTailLight =
      matchesAny(name, profile?.tailLight) ||
      matchesAny(materialName, profile?.tailLightMaterial);
    const profileHazardLight =
      matchesAny(name, profile?.hazardLight) ||
      matchesAny(materialName, profile?.hazardLightMaterial);
    if (
      profileHazardLight ||
      isHazardPart(label) ||
      profileTailLight ||
      isTailLightPart(label, meshCenter, rearX)
    ) {
      if (
        profileTailLight &&
        !taillampPositionAllowed(profile, profileTailLight, materialName, meshCenter, bounds)
      ) {
        continue;
      }
      const material = ensureShowroomMaterial(mesh);
      if (!material) {
        continue;
      }
      applyShowroomTailLamp(material);
      tailLightMaterials.push(material);
      if (
        profileHazardLight ||
        isHazardPart(label) ||
        /emiss|red_cover|red_glass/i.test(label)
      ) {
        hazardMaterials.push(material);
      }
      continue;
    }

    const profileTrunk = matchesAny(name, profile?.trunk);
    if (profileTrunk || (isTrunkPart(nameLower) && isLocalizedPanel(meshSize))) {
      trunkMeshes.push(mesh);
      continue;
    }

    const profileDoor =
      matchesAny(name, profile?.leftDoor) || matchesAny(name, profile?.rightDoor);
    if (!profileDoor && !isDoorCandidate(nameLower, profile)) {
      continue;
    }

    // Geometry gate: skip whole-body panels that merely contain "door" in their name.
    if (!profileDoor && !isLocalizedPanel(meshSize)) {
      continue;
    }

    if (meshCenter.x > frontDoorX) {
      continue;
    }

    if (matchesAny(name, profile?.leftDoor) || meshCenter.z > leftZ) {
      leftDoorMeshes.push(mesh);
      continue;
    }

    if (matchesAny(name, profile?.rightDoor) || meshCenter.z < rightZ) {
      rightDoorMeshes.push(mesh);
    }
  }

  const leftDoorPivot = createSideDoorPivot(root, leftDoorMeshes, "left");
  const rightDoorPivot = createSideDoorPivot(root, rightDoorMeshes, "right");
  const trunkSorted = trunkMeshes.sort((a, b) => getMeshVolume(b) - getMeshVolume(a)).slice(0, 6);
  const trunkPivot = createTrunkPivot(root, trunkSorted);

  let frontWheels: THREE.Object3D[] = [];
  let rearWheels: THREE.Object3D[] = [];
  let frontSteerPivots: THREE.Object3D[] = [];
  let wheelsSynthetic = false;

  if (!profile?.bakedWheels) {
    hideMisplacedTemplateWheels(root, bounds);
    const realWheels = findWheelNodes(root, profile);
    frontWheels = realWheels.frontWheels;
    rearWheels = realWheels.rearWheels;
    frontSteerPivots = realWheels.frontSteerPivots;
    if (frontWheels.length + rearWheels.length < 2) {
      const synthetic = createSyntheticGroundWheels(root, bounds);
      frontWheels = synthetic.frontWheels;
      rearWheels = synthetic.rearWheels;
      frontSteerPivots = synthetic.frontSteerPivots;
      wheelsSynthetic = synthetic.synthetic;
    }
  }

  if (hazardMaterials.length === 0 && tailLightMaterials.length > 0) {
    hazardMaterials.push(...tailLightMaterials.slice(0, 6));
  }

  return {
    bounds,
    leftDoorPivot,
    rightDoorPivot,
    trunkPivot,
    sunroofNodes,
    headLightMaterials,
    headLightPositions,
    paintMaterials,
    tailLightMaterials,
    hazardMaterials,
    frontWheels,
    rearWheels,
    frontSteerPivots,
    capabilities: {
      leftDoor: Boolean(leftDoorPivot),
      rightDoor: Boolean(rightDoorPivot),
      trunk: Boolean(trunkPivot),
      sunroof: sunroofNodes.length > 0,
      headLights: headLightMaterials.length > 0,
      tailLights: tailLightMaterials.length > 0,
      wheels: frontWheels.length + rearWheels.length > 0,
      wheelsSynthetic,
    },
  };
}

export function applyWheelSpin(
  spinner: THREE.Object3D,
  axis: ShowroomSpinAxis,
  angle: number,
) {
  spinner.rotation.x = axis === "x" ? angle : 0;
  spinner.rotation.y = axis === "y" ? angle : 0;
  spinner.rotation.z = axis === "z" ? angle : 0;
}

/** Boost each lamp material using its own GLB emissive / diffuse — no external tint. */
export function boostShowroomMaterialEmissive(
  materials: ShowroomMaterial[],
  active: boolean,
  litIntensity: number,
  delta: number,
  options?: { minActiveIntensity?: number },
) {
  for (const material of materials) {
    const storedBase = material.userData.showroomBaseEmissive as THREE.Color | undefined;
    const baseColor = storedBase?.clone() ?? material.color.clone().multiplyScalar(0.65);
    const baseIntensity =
      (material.userData.showroomBaseEmissiveIntensity as number | undefined) ?? 0;
    const isHeadlampLens = Boolean(material.userData.showroomHeadlampLens);
    const isTailLamp = Boolean(material.userData.showroomTailLamp);
    const { minEmissive, emissiveScale } = SHOWROOM_HEADLAMP_INTENSITY;
    const minLit = isHeadlampLens
      ? minEmissive
      : (options?.minActiveIntensity ?? (isTailLamp ? 0 : 0.6));
    const { tailMax, tailMin } = SHOWROOM_HAZARD_INTENSITY;
    const headlampWhite =
      (material.userData.showroomBaseEmissive as THREE.Color | undefined)?.clone() ??
      new THREE.Color(0xffffff);
    if (active && isHeadlampLens) {
      headlampWhite.multiplyScalar(1.35);
    }
    const hazardRed =
      (material.userData.showroomBaseEmissive as THREE.Color | undefined)?.clone() ??
      new THREE.Color(SHOWROOM_TAIL_LAMP_COLOR);

    let targetIntensity: number;
    let targetColor: THREE.Color;
    if (active && isTailLamp) {
      targetColor = hazardRed;
      targetIntensity = THREE.MathUtils.clamp(
        Math.max(litIntensity, tailMin),
        tailMin,
        tailMax,
      );
    } else if (active && isHeadlampLens) {
      targetColor = headlampWhite;
      targetIntensity = Math.max(litIntensity * emissiveScale, baseIntensity * 2.5, minLit);
    } else if (active) {
      targetColor = baseColor;
      targetIntensity = Math.max(litIntensity, baseIntensity * 2.5, minLit);
    } else {
      targetColor = storedBase ?? baseColor;
      targetIntensity = baseIntensity;
    }

    if (active && isHeadlampLens) {
      material.toneMapped = false;
    } else {
      material.toneMapped = true;
    }
    material.emissive.lerp(targetColor, THREE.MathUtils.clamp(delta * 9, 0, 1));
    material.emissiveIntensity = THREE.MathUtils.damp(
      material.emissiveIntensity,
      targetIntensity,
      9,
      delta,
    );
  }
}
