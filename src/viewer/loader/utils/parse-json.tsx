import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";
import * as THREE from "three";
import setInstanceMaterials from "./set-instance-materials";

const parseJSON = async (childrenJSON: any): Promise<THREE.Object3D> => {
  const removeTypename = (obj: any) => {
    for (const key in obj) {
      if (key === "__typename") {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        removeTypename(obj[key]);
      }
    }
  };

  const removeNullValues: any = (obj: any) => {
    if (Array.isArray(obj)) {
      return obj
        .filter((item) => item !== null)
        .map((item: any) =>
          typeof item === "object" ? removeNullValues(item) : item
        );
    } else if (typeof obj === "object") {
      const result: any = {};
      for (const key in obj) {
        if (obj[key] === null) {
          continue;
        }
        if (typeof obj[key] === "object") {
          result[key] = removeNullValues(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
      return result;
    }
    return obj;
  };

  return new Promise((resolve, reject) => {
    try {
      const loader = new THREE.ObjectLoader();

      // Check if the provided JSON data is an object and has required properties
      if (
        !childrenJSON ||
        typeof childrenJSON !== "object" ||
        !childrenJSON.object
      ) {
        throw new Error("#12362; Invalid JSON data");
      }

      // Remove null values from JSON data
      const cleanedJSON = removeNullValues(childrenJSON);

      // Remove the "__typename" properties from the JSON data
      removeTypename(cleanedJSON);

      // Parse the JSON data into Three.js objects
      let parsed = loader.parse(cleanedJSON);

      setInstanceMaterials(parsed);

      // Traverse the parsed object and compute BVH for meshes
      // parsed.traverse((object: any) => {
      //   if (object.isMesh && object.geometry.isBufferGeometry) {
      //     try {
      //       object.geometry.computeBoundsTree = computeBoundsTree;
      //       object.geometry.computeBoundsTree();

      //       // Compute the bounding sphere for the current object
      //       object.geometry.computeBoundingBox();
      //       object.geometry.computeBoundingSphere();

      //       object.raycast = acceleratedRaycast;
      //     } catch (error) {
      //       console.error(
      //         `#129923; Error here computing bounds tree for mesh ${object.name}: ${error}`
      //       );
      //     }
      //   }
      // });
      resolve(parsed);
    } catch (error) {
      console.error("#932932; Error while parsing JSON data:", error);
      console.error(
        "#230488; Problematic JSON data:",
        JSON.stringify(childrenJSON, null, 2)
      );
      reject(error);
    }
  });
};

export default parseJSON;
