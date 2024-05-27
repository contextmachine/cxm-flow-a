import { PointCloudFieldHandler } from "../point-cloud-extension.types";
import * as THREE from "three";

export const addPrimitive = (
  point: PointCloudFieldHandler,
  visible: boolean
): THREE.Mesh<THREE.CylinderGeometry> => {
  const { position, height, size } = point;

  const geometry = new THREE.CylinderGeometry(5, 5, height, 5); // Base geometry for cylinder
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    wireframe: true,
    visible: visible,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // Apply non-uniform scaling to create elliptical cross-section
  mesh.scale.set(size[0], 1, size[1]);

  // Position randomly within a predefined area
  mesh.position.set(position[0], position[1], position[2]);

  mesh.rotation.x = 0.5 * Math.PI; // Random rotation around x-axis

  // Ensure the transformations are updated globally
  mesh.updateMatrix(); // Updates local transformation matrix
  mesh.updateMatrixWorld(true); // Updates the world transformation matrix, true forces the update down the hierarchy

  return mesh;
};
