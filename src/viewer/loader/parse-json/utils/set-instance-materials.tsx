import { Object3D } from "three";
import * as THREE from "three";

const setInstanceMaterials = (object: Object3D) => {
  // Create a Map to store materials.
  // The keys will be a string representation of the material properties.
  const materialsMap = new Map();

  object.traverse((obj: any) => {
    if (obj instanceof THREE.Mesh) {
      let material = obj.material;

      // If the object has an array of materials, process each one.
      if (Array.isArray(material)) {
        obj.material = material.map((mat) =>
          getSharedMaterial(mat, materialsMap)
        );
      }
      // If the object has a single material, replace it with the shared instance.
      else if (material instanceof THREE.Material) {
        obj.material = getSharedMaterial(material, materialsMap);
      }
    }
  });
};

// This function generates a key from the material's properties.
function getKeyFromMaterial(material: any) {
  const colorKey = material.color ? material.color.getHexString() : "";
  const emissiveKey = material.emissive ? material.emissive.getHexString() : "";
  const transparentKey = material.transparent ? "1" : "0";
  const opacityKey =
    material.opacity !== undefined ? material.opacity.toString() : "";
  const visibleKey = material.visible ? "1" : "0";
  const typeKey = material.type ? material.type : "";

  // Combine all the parts into one key.
  return [
    colorKey,
    emissiveKey,
    transparentKey,
    opacityKey,
    visibleKey,
    typeKey,
  ].join("-");
}

// This function returns a shared instance of the material.
// If the material is already in the map, it returns the existing instance.
// Otherwise, it adds the material to the map and returns it.
function getSharedMaterial(material: any, materialsMap: any) {
  const key = getKeyFromMaterial(material);

  if (materialsMap.has(key)) {
    // If a material with the same key is found, use it.
    return materialsMap.get(key);
  } else {
    // Otherwise, add the new material to the map.
    materialsMap.set(key, material);
    return material;
  }
}
export default setInstanceMaterials;
