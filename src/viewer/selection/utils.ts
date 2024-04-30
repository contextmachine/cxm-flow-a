import * as THREE from "three";
import { CONTAINED, INTERSECTED, MeshBVH, NOT_INTERSECTED } from "three-mesh-bvh";


export const getPointer = (event: MouseEvent, canvas: HTMLCanvasElement) => {
    const { left, top } = canvas.getBoundingClientRect();

    const pointer = new THREE.Vector2(
        ((event.clientX - left) / canvas.clientWidth) * 2 - 1,
        -((event.clientY - top) / canvas.clientHeight) * 2 + 1)

    return pointer
}

export const getMeshUuidByPointIndex = (unionMesh: THREE.Mesh, index: number, meshIdMap: Map<number, string>): string => {

    const indexAttribute = unionMesh.geometry.index as THREE.BufferAttribute
    const meshIdAttribute = unionMesh.geometry.getAttribute('meshId') as THREE.BufferAttribute

    const i = indexAttribute.getX(index)

    const meshId = meshIdAttribute.getX(i)
    const meshUuid = meshIdMap.get(meshId) as string

    return meshUuid
}

export const getMeshUuidByPointIndex2 = (unionMesh: THREE.Mesh, index: number, meshIdMap: Map<number, string>): string => {

    const indexAttribute = unionMesh.geometry.index as THREE.BufferAttribute
    const meshIdAttribute = unionMesh.geometry.getAttribute('meshId') as THREE.BufferAttribute

    const i = indexAttribute.getX(index)

    const meshId = meshIdAttribute.getX(index)
    const meshUuid = meshIdMap.get(meshId) as string

    return meshUuid
}

export const sphereCollision = (bvh: MeshBVH, sphere: THREE.Sphere) => {

    const indices: number[] = []

    const tempVec = new THREE.Vector3();
    bvh.shapecast({

        intersectsBounds: (box) => {
            const intersects = sphere.intersectsBox(box);
            const { min, max } = box;
            if (intersects) {
                for (let x = 0; x <= 1; x++) {
                    for (let y = 0; y <= 1; y++) {
                        for (let z = 0; z <= 1; z++) {
                            tempVec.set(
                                x === 0 ? min.x : max.x,
                                y === 0 ? min.y : max.y,
                                z === 0 ? min.z : max.z
                            );
                            if (!sphere.containsPoint(tempVec)) {
                                return INTERSECTED;
                            }
                        }
                    }
                }
                return CONTAINED;
            }
            return intersects ? INTERSECTED : NOT_INTERSECTED;
        },

        intersectsTriangle: (tri, i, contained) => {
            if (contained || tri.intersectsSphere(sphere)) {
                const i3 = 3 * i;
                indices.push(i3);
            }
            return false;
        }

    });

    return indices

}