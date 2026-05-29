import * as THREE from "three";

/** Longest axis after normalize; slightly above geometric `BODY_LENGTH` (3.2) for presence. */
export const MARKET_MODEL_TARGET_LENGTH = 4;

const HELPER_NAME_PATTERN = /(camera|cam|target|helper|gizmo|locator|control)/i;

function hideHelperMeshes(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const ownName = mesh.name.toLowerCase();
    const parentName = mesh.parent?.name?.toLowerCase() ?? "";
    if (HELPER_NAME_PATTERN.test(ownName) || HELPER_NAME_PATTERN.test(parentName)) {
      mesh.visible = false;
    }
  });
}

/**
 * Center, scale, ground, and orient a Sketchfab / market GLB for the showroom.
 * Uses world-space bounds so FBX root scales (e.g. 0.01) are included correctly.
 */
export function normalizeMarketModel(
  root: THREE.Object3D,
  targetLength = MARKET_MODEL_TARGET_LENGTH,
): THREE.Box3 {
  hideHelperMeshes(root);
  root.updateWorldMatrix(true, true);

  const bounds = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  root.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
  const scaleFactor = targetLength / maxDim;
  root.scale.multiplyScalar(scaleFactor);

  root.updateWorldMatrix(true, true);
  const groundedBounds = new THREE.Box3().setFromObject(root);
  root.position.y -= groundedBounds.min.y;

  // Market GLBs are usually Z-forward; showroom camera presets assume -X forward.
  root.rotation.y = -Math.PI / 2;
  root.updateWorldMatrix(true, true);

  return new THREE.Box3().setFromObject(root);
}
