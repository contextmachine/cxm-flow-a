import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { meshDefaultMaterial, lineDefaultMaterial } from "../../materials/object-materials";
import { ProjectModel } from "../../project-model";
import { Entity } from "../entity";



class UnionMesh {

    private _model: ProjectModel
    private _unionMesh: THREE.Mesh
    private _meshLines: THREE.LineSegments;

    private _collisionMesh: THREE.Mesh | undefined;
    private _meshIdMap = new Map<number, string>();

    private _children: Entity[] = []
    private _indiciesMap: Map<string, number>

    constructor(object: THREE.Object3D, model: ProjectModel) {

        this._model = model

        const { singleMesh, lineSegments, indiciesMap } = this.initUnionMesh(object)

        this._unionMesh = singleMesh
        this._meshLines = lineSegments
        this._indiciesMap = indiciesMap

    }

    public get objects(): THREE.Object3D[] {
        return [this._unionMesh, this._meshLines]
    }

    public get collisionMesh() {
        return this._collisionMesh
    }

    public get meshIdMap() {
        return this._meshIdMap
    }

    public initMaterials() {

    }

    public setMeshMaterialToFragment(entityId: string, meshMaterial: THREE.Material) {

        const index = this._indiciesMap.get(entityId);

        if (index) {
            (this._unionMesh.material as THREE.Material[])[index] = meshMaterial;
        }

    }

    public setLineMaterialToFragment(entityId: string, lineMaterial: THREE.Material) {

        const index = this._indiciesMap.get(entityId);

        if (index) {
            (this._meshLines.material as THREE.Material[])[index] = lineMaterial;
        }

    }

    public initUnionMesh(object3d: THREE.Object3D) {

        const indiciesMap = new Map<string, number>()

        let meshBuffers: THREE.BufferGeometry[] = [];
        let meshGroups: { start: number; count: number; materialIndex: number }[] =
            [];
        let meshMaterials: THREE.Material[] = [];

        let edgesGeometry: THREE.BufferGeometry[] = [];
        let lineGroups: { start: number; count: number; materialIndex: number }[] =
            [];
        let lineMaterials: THREE.Material[] = [];

        let meshCoutner = 0;
        let linesCounter = 0;
        let i = 0;

        normalizeAttribute(object3d)

        object3d.traverse((child) => {

            if (child instanceof THREE.Mesh) {

                const mesh = child as THREE.Mesh;

                const buffer = mesh.geometry
                    .clone()
                    .toNonIndexed()
                    .applyMatrix4(mesh.matrixWorld);

                const meshLen = buffer.getAttribute("position").count;
                const meshGroup = {
                    start: meshCoutner,
                    count: meshLen,
                    materialIndex: i,
                };

                const linesBuffer = new THREE.EdgesGeometry(buffer.clone(), 50);
                const linesLen = linesBuffer.getAttribute("position").count;
                const lineGroup = {
                    start: linesCounter,
                    count: linesLen,
                    materialIndex: i,
                };

                meshBuffers.push(buffer);
                meshMaterials.push(meshDefaultMaterial);
                meshGroups.push(meshGroup);

                edgesGeometry.push(linesBuffer);
                lineMaterials.push(lineDefaultMaterial);
                lineGroups.push(lineGroup);

                indiciesMap.set(child.uuid, i)

                meshCoutner = meshCoutner += meshLen;
                linesCounter = linesCounter += linesLen;
                i += 1;
            }
        });


        if (meshBuffers.length > 0) {
            const union = BufferGeometryUtils.mergeGeometries(meshBuffers);
            meshGroups.forEach((x) =>
                union.addGroup(x.start, x.count, x.materialIndex)
            );
            const singleMesh = new THREE.Mesh(union, meshMaterials);

            const linesUnion =
                BufferGeometryUtils.mergeGeometries(edgesGeometry);
            lineGroups.forEach((x) =>
                linesUnion.addGroup(x.start, x.count, x.materialIndex)
            );

            const lineSegments = new THREE.LineSegments(linesUnion, lineMaterials);
            lineSegments.renderOrder = 100;

            this.computeBVH(object3d);

            singleMesh.geometry.computeVertexNormals()

            return {
                singleMesh,
                lineSegments,
                indiciesMap
            }

        } else {

            throw new Error('error while generating UnionMesh for model')
        }
    }

    private computeBVH(object: THREE.Object3D) {
        if (this._collisionMesh) {
            this._collisionMesh.geometry.disposeBoundsTree();
        }
        this._meshIdMap = new Map();

        const meshes: THREE.Mesh[] = [];

        object.traverse((o) => {
            if (o instanceof THREE.Mesh) {
                meshes.push(o);
            }
        });

        let buffers = meshes.map((o, i) => {
            const id = i;
            const mesh = o.clone() as THREE.Mesh;
            const pointCount =
                (mesh.geometry.getAttribute("position") as THREE.BufferAttribute).array
                    .length / 3;

            const objIndex = new Array<number>(pointCount).fill(id);
            this._meshIdMap.set(id, o.uuid);

            const geo = mesh.geometry
                .clone()
                .deleteAttribute("uv")
                .deleteAttribute("normal")
                .setAttribute("meshId", new THREE.Int32BufferAttribute(objIndex, 1))
                .applyMatrix4(mesh.matrixWorld);

            return geo;
        });

        if (buffers.length) {
            const geometry = BufferGeometryUtils.mergeGeometries(buffers);
            const unionMesh = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({
                    color: "#00FFFF",
                    side: THREE.DoubleSide,
                    depthWrite: false,
                })
            );

            geometry.computeBoundsTree();
            geometry.computeBoundingBox();

            this._collisionMesh = unionMesh;

            this._collisionMesh;

            buffers.forEach((x) => x.dispose());
        }
    }
}

const normalizeAttribute = (object: THREE.Object3D) => {
    const attributeDiff = new Set<string>()

    const uniqueAttSet = new Set<string>()
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            Object.keys(child.geometry.attributes).forEach((name) => {
                uniqueAttSet.add(name)
            });
        }
    })

    const uniqueAtt = [...uniqueAttSet]

    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            Object.keys(child.geometry.attributes).forEach((name) => {

                const objAtt = Object.keys(child.geometry.attributes)
                const diff = uniqueAtt.filter(x => !objAtt.includes(x))

                diff.forEach(x => attributeDiff.add(x))

            });
        }
    })

    if (attributeDiff.size > 0) {
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                attributeDiff.forEach(x => {
                    child.geometry.deleteAttribute(x)
                })
            }
        })
    }

}

export default UnionMesh