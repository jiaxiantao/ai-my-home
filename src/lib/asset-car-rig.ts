import * as THREE from "three";

export const ASSET_DOOR_MAX_OPEN_RADIANS = (70 * Math.PI) / 180;
export const ASSET_TRUNK_MAX_OPEN_RADIANS = (75 * Math.PI) / 180;

export type AssetCarRig = {
  bounds: THREE.Box3;
  leftDoorPivot: THREE.Group | null;
  rightDoorPivot: THREE.Group | null;
  trunkPivot: THREE.Group | null;
  sunroofNodes: THREE.Object3D[];
  headLightMaterials: THREE.MeshStandardMaterial[];
  tailLightMaterials: THREE.MeshStandardMaterial[];
  hazardMaterials: THREE.MeshStandardMaterial[];
  frontWheels: THREE.Object3D[];
  rearWheels: THREE.Object3D[];
  headLightAnchors: THREE.Vector3[];
  tailLightAnchors: THREE.Vector3[];
};

type MeshEntry = {
  mesh: THREE.Mesh;
  name: string;
  center: THREE.Vector3;
  volume: number;
};

function hierarchicalName(object: THREE.Object3D): string {
  const parts: string[] = [];
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name) {
      parts.unshift(current.name);
    }
    current = current.parent;
  }
  return parts.join("/").toLowerCase();
}

function getWorldCenter(mesh: THREE.Mesh, target = new THREE.Vector3()) {
  const box = new THREE.Box3().setFromObject(mesh);
  return box.getCenter(target);
}

function getMeshVolume(mesh: THREE.Mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  return Math.max(size.x * size.y * size.z, 1e-6);
}

function ensureStandardMaterial(mesh: THREE.Mesh): THREE.MeshStandardMaterial | null {
  const source = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  if (!(source instanceof THREE.MeshStandardMaterial)) {
    return null;
  }
  const cached = mesh.userData.showroomMaterial as THREE.MeshStandardMaterial | undefined;
  if (cached) {
    return cached;
  }
  const cloned = source.clone();
  cloned.userData.showroomBaseEmissive = cloned.emissive.clone();
  cloned.userData.showroomBaseEmissiveIntensity = cloned.emissiveIntensity;
  mesh.userData.showroomMaterial = cloned;
  mesh.material = cloned;
  return cloned;
}

function isExcludedPart(name: string) {
  return /(wheel|tire|rim|brake|caliper|interior|seat|steer|column|camera|helper|gizmo|locator)/i.test(
    name,
  );
}

function isLightPart(name: string) {
  return /(head\s*light|headlight|tail\s*light|taillight|rear\s*light|stop\s*light|brake\s*light|indicator|turn|hazard|illum|_led|glass_red|red_illum|plate)/i.test(
    name,
  );
}

function isGlassPart(name: string) {
  return /(glass|window|windshield|windscreen)/i.test(name);
}

function isSunroofPart(name: string) {
  return /(sunroof|moon\s*roof|roof\s*glass)/i.test(name);
}

function findWheelNodes(root: THREE.Object3D) {
  const frontWheels: THREE.Object3D[] = [];
  const rearWheels: THREE.Object3D[] = [];
  const seen = new Set<string>();

  const register = (node: THREE.Object3D, bucket: THREE.Object3D[]) => {
    if (seen.has(node.uuid)) {
      return;
    }
    seen.add(node.uuid);
    bucket.push(node);
  };

  root.traverse((child) => {
    const name = hierarchicalName(child);
    if (!/(wheel|tire|rim)/i.test(name) || /(steering|interior|leather)/i.test(name)) {
      return;
    }

    const pivot =
      child.name.match(/^DEF-Wheel/i) || child.name.match(/^wheel\.(Ft|Bk)\.(L|R)/i)
        ? child
        : child.parent &&
            /(wheel|tire)/i.test(child.parent.name) &&
            child.parent !== root
          ? child.parent
          : child;

    if (/(ft\.l|ft\.r|front.*left|front.*right|fl|fr|_fl|_fr)/i.test(name)) {
      register(pivot, frontWheels);
      return;
    }
    if (/(bk\.l|bk\.r|rear.*left|rear.*right|rl|rr|_rl|_rr|back)/i.test(name)) {
      register(pivot, rearWheels);
      return;
    }
    if (/left/i.test(name) && /wheel|tire/i.test(name)) {
      register(pivot, /front|ft|_fl/i.test(name) ? frontWheels : rearWheels);
      return;
    }
    if (/right/i.test(name) && /wheel|tire/i.test(name)) {
      register(pivot, /front|ft|_fr/i.test(name) ? frontWheels : rearWheels);
      return;
    }
    if (/left_wheel|wheel_left/i.test(name)) {
      register(pivot, /front|ft|spare/i.test(name) ? rearWheels : frontWheels);
      return;
    }
    if (/right_wheel|wheel_right/i.test(name)) {
      register(pivot, /front|ft|spare/i.test(name) ? rearWheels : frontWheels);
    }
  });

  return { frontWheels, rearWheels };
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
    entries.push({
      mesh,
      name,
      center: getWorldCenter(mesh),
      volume: getMeshVolume(mesh),
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

  const hingeX = doorBox.min.x;
  const hingeY = doorBox.min.y + (doorBox.max.y - doorBox.min.y) * 0.32;
  const hingeZ = side === "left" ? doorBox.max.z : doorBox.min.z;
  pivot.position.set(hingeX, hingeY, hingeZ);
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

  pivot.position.set(trunkBox.max.x, trunkBox.max.y, (trunkBox.min.z + trunkBox.max.z) / 2);
  root.add(pivot);

  for (const mesh of meshes) {
    pivot.attach(mesh);
  }

  return pivot;
}

export function discoverAssetCarRig(root: THREE.Object3D): AssetCarRig {
  const bounds = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const entries = collectMeshes(root);
  const headLightMaterials: THREE.MeshStandardMaterial[] = [];
  const tailLightMaterials: THREE.MeshStandardMaterial[] = [];
  const hazardMaterials: THREE.MeshStandardMaterial[] = [];
  const headLightAnchors: THREE.Vector3[] = [];
  const tailLightAnchors: THREE.Vector3[] = [];
  const sunroofNodes: THREE.Object3D[] = [];
  const leftDoorMeshes: THREE.Mesh[] = [];
  const rightDoorMeshes: THREE.Mesh[] = [];
  const trunkMeshes: THREE.Mesh[] = [];

  const depth = Math.max(size.x, 0.001);
  const width = Math.max(size.z, 0.001);
  const frontX = bounds.min.x + depth * 0.2;
  const rearX = bounds.max.x - depth * 0.2;

  for (const entry of entries) {
    const { mesh, name, center } = entry;

    if (isSunroofPart(name)) {
      sunroofNodes.push(mesh);
      continue;
    }

    if (isLightPart(name) || isGlassPart(name)) {
      const material = ensureStandardMaterial(mesh);
      if (!material) {
        continue;
      }

      const isFront = center.x < frontX || /front|head/i.test(name);
      const isRear = center.x > rearX || /tail|rear|brake|stop/i.test(name);
      const anchor = center.clone();

      if (/(hazard|indicator|turn|illum)/i.test(name)) {
        hazardMaterials.push(material);
      }

      if (isFront && !isRear) {
        headLightMaterials.push(material);
        headLightAnchors.push(anchor);
      } else if (isRear) {
        tailLightMaterials.push(material);
        tailLightAnchors.push(anchor);
      } else if (/(red|illum|led)/i.test(name)) {
        if (center.x > rearX - depth * 0.08) {
          tailLightMaterials.push(material);
          tailLightAnchors.push(anchor);
        }
      }
      continue;
    }

    const isLeftSide = center.z > bounds.min.z + width * 0.18;
    const isRightSide = center.z < bounds.max.z - width * 0.18;
    const isMidBody =
      center.x > bounds.min.x + depth * 0.12 && center.x < bounds.max.x - depth * 0.12;
    const isRearBody = center.x > bounds.max.x - depth * 0.2;
    const isBodyHeight =
      center.y > bounds.min.y + size.y * 0.2 && center.y < bounds.max.y - size.y * 0.05;

    if (isRearBody && isBodyHeight && /(trunk|tailgate|hatch|boot|gate|rear)/i.test(name)) {
      trunkMeshes.push(mesh);
      continue;
    }

    if (isMidBody && isBodyHeight && isLeftSide && /door/i.test(name)) {
      leftDoorMeshes.push(mesh);
      continue;
    }

    if (isMidBody && isBodyHeight && isRightSide && /door/i.test(name)) {
      rightDoorMeshes.push(mesh);
      continue;
    }

    if (isMidBody && isBodyHeight && isLeftSide && !isGlassPart(name)) {
      leftDoorMeshes.push(mesh);
      continue;
    }

    if (isMidBody && isBodyHeight && isRightSide && !isGlassPart(name)) {
      rightDoorMeshes.push(mesh);
      continue;
    }

    if (isRearBody && isBodyHeight && !/(glass|window)/i.test(name)) {
      trunkMeshes.push(mesh);
    }
  }

  const leftDoorPivot = createSideDoorPivot(root, leftDoorMeshes, "left");
  const rightDoorPivot = createSideDoorPivot(root, rightDoorMeshes, "right");
  const trunkCandidates = trunkMeshes
    .sort((a, b) => getMeshVolume(b) - getMeshVolume(a))
    .slice(0, 8);
  const trunkPivot = createTrunkPivot(root, trunkCandidates);
  const { frontWheels, rearWheels } = findWheelNodes(root);

  if (headLightAnchors.length === 0) {
    headLightAnchors.push(
      new THREE.Vector3(bounds.min.x, bounds.min.y + size.y * 0.45, bounds.max.z - width * 0.2),
      new THREE.Vector3(bounds.min.x, bounds.min.y + size.y * 0.45, bounds.min.z + width * 0.2),
    );
  }
  if (tailLightAnchors.length === 0) {
    tailLightAnchors.push(
      new THREE.Vector3(bounds.max.x, bounds.min.y + size.y * 0.42, bounds.max.z - width * 0.2),
      new THREE.Vector3(bounds.max.x, bounds.min.y + size.y * 0.42, bounds.min.z + width * 0.2),
    );
  }

  return {
    bounds,
    leftDoorPivot,
    rightDoorPivot,
    trunkPivot,
    sunroofNodes,
    headLightMaterials,
    tailLightMaterials,
    hazardMaterials,
    frontWheels,
    rearWheels,
    headLightAnchors,
    tailLightAnchors,
  };
}

export function getWheelSpinTarget(wheelRoot: THREE.Object3D) {
  const tireChild = wheelRoot.children.find((child) => /tire|wheel/i.test(child.name));
  if (tireChild) {
    return tireChild;
  }
  let meshChild: THREE.Object3D | null = null;
  wheelRoot.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && !meshChild) {
      meshChild = child;
    }
  });
  return meshChild ?? wheelRoot;
}

export function setMaterialEmissive(
  materials: THREE.MeshStandardMaterial[],
  color: THREE.Color,
  intensity: number,
  delta: number,
) {
  for (const material of materials) {
    const baseColor =
      (material.userData.showroomBaseEmissive as THREE.Color | undefined) ?? new THREE.Color(0, 0, 0);
    const baseIntensity =
      (material.userData.showroomBaseEmissiveIntensity as number | undefined) ?? 0;
    const targetColor = intensity > 0.05 ? color : baseColor;
    const targetIntensity = intensity > 0.05 ? intensity : baseIntensity;
    material.emissive.lerp(targetColor, THREE.MathUtils.clamp(delta * 9, 0, 1));
    material.emissiveIntensity = THREE.MathUtils.damp(
      material.emissiveIntensity,
      targetIntensity,
      9,
      delta,
    );
  }
}
