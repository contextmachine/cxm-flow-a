import { ProjectModel } from "../project-model";
import * as THREE from "three";
import { ProjectObject, ProjectObjectProps, ViewerObjectType } from "./project-object";



import UserdataObject from "../../viewer/loader/objects/userdata-object";

import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { ProjectMesh } from "./project-mesh";
import { UserData } from "../../viewer/loader/objects/user-data.types";
import { defaultMaterial, lineDefaultMaterial } from "../materials/object-materials";


export class MeshGroup implements ProjectObject {
	private _id: string
	private _model: ProjectModel;
	private _object3d: THREE.Group

	private _center = new THREE.Vector3();
	private _type: ViewerObjectType = 'meshGroup'

	private _name: string;

	private _collisionMesh: THREE.Mesh | undefined;
	private _meshIdMap = new Map<number, string>();
	private _isInteractive = true;


	private _singleMesh: THREE.Mesh
	private _meshLines: THREE.LineSegments;


	private _bbox = new THREE.Box3Helper(
		new THREE.Box3(),
		new THREE.Color("lightblue")
	);

	private _selected = false;
	private _visibility = true;
	private _bboxVisibility = false;
	private _linesVisibility = false;

	private _selectable = true;

	private _childrenPO: ProjectObject[] = [];

	private _props: ProjectObjectProps | undefined;
	private _userdata: UserdataObject | undefined;

	private _defaultMaterial: THREE.Material = defaultMaterial;
	private _overrideMaterial: THREE.Material | undefined;

	private _groupIndex: number | undefined;

	constructor(object: THREE.Group, model: ProjectModel) {

		this._id = object.uuid
		this._model = model;
		this._object3d = object


		const { singleMesh, lineSegments } = this.initMeshGroup(object)

		this._singleMesh = singleMesh
		this._meshLines = lineSegments

		this._name = object.name;

		this.initUserdata();
		this.initProperties();
		this.initBoundingBox();

	}

	public get id(): string {
		return this._id;
	}

	public get objects(): THREE.Object3D[] {
		return [this._singleMesh, this._meshLines]
	}

	public get isProjectObject(): boolean {
		return true
	}

	public get name(): string {
		return this._name;
	}

	public get model(): ProjectModel {
		return this._model;
	}

	public get bbox(): THREE.Box3Helper {
		return this._bbox;
	}

	public get type(): ViewerObjectType {
		return this._type;
	}

	public get defaultMaterial(): THREE.Material {
		return this._defaultMaterial;
	}

	public get children(): ProjectObject[] {
		return this._childrenPO;
	}

	public get visibility(): boolean {
		return this._visibility;
	}

	public get props(): ProjectObjectProps | undefined {
		return this._props;
	}

	public get userdata(): UserdataObject | undefined {
		return this._userdata;
	}

	public get center(): THREE.Vector3 {
		return this._center;
	}

	public get isSelectable(): boolean {
		return this._selectable;
	}

	public get collisionMesh(): THREE.Mesh | undefined {
		return this._collisionMesh;
	}

	public get meshIdMap(): Map<number, string> {
		return this._meshIdMap;
	}

	public initMeshGroup(object3d: THREE.Group) {
		const children: ProjectMesh[] = [];

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

				const po = new ProjectMesh(child, this._model);
				children.push(po);

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
				meshMaterials.push(po.defaultMaterial);
				meshGroups.push(meshGroup);

				edgesGeometry.push(linesBuffer);
				lineMaterials.push(lineDefaultMaterial);
				lineGroups.push(lineGroup);

				po.setGroupIndex(i);

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

			if (this._isInteractive) {
				this.computeBVH(object3d);
			}

			singleMesh.geometry.computeVertexNormals()
			this._childrenPO = children

			children.forEach(x => x.setMeshGroup(this))

			return {
				singleMesh,
				lineSegments
			}

		} else {

			throw new Error('init group error')
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
			this.meshIdMap.set(id, o.uuid);

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

	public setSelectable(enabled: boolean) {
		this._selectable = enabled;
	}

	public setMeshGroupMaterial(groupIndex: number, material: THREE.Material) {
		(this._singleMesh.material as THREE.Material[])[groupIndex] = material;
	}

	public setMeshLineGroupMaterial(
		groupIndex: number,
		material: THREE.Material
	) {
		(this._meshLines.material as THREE.Material[])[groupIndex] = material;
	}


	private initProperties() {
		if (this._object3d.userData.properties) {
			this._props = new Map(
				Object.entries(this._object3d.userData.properties) as [string, any][]
			) as ProjectObjectProps;
		}
	}

	private initUserdata() {
		this._userdata = new UserdataObject(this._object3d.userData as UserData);
		this._userdata.supplyEntries(this._model.projectObject);
	}

	public initBoundingBox() {
		const bbox = new THREE.Box3().expandByObject(this._object3d);
		bbox.getCenter(this._center);
		this._bbox.box = bbox;
		this._bbox.applyMatrix4(this._object3d.matrixWorld);
	}

	public setVisibility(visible: boolean) {
		this._visibility = visible;
		this._singleMesh.visible = visible
		this.updateBbox()
	}

	private updateBbox() {
		if (this._visibility && this._bboxVisibility) {
			this._model.viewer.addToScene(this._bbox)
		} else {
			this._model.viewer.removeFromScene(this._bbox)
		}
	}

	public showLineEdges(show: boolean) {
		this._linesVisibility = show;
		this.updateLineMaterial()
	}

	public setBboxVisibilty(show: boolean) {
		this._bboxVisibility = show;
		this.updateBbox()
	}

	private updateLineMaterial(material?: THREE.LineBasicMaterial) {
	}

	public select() {
		this._selected = true;
	}

	public deselect() {
		this._selected = false;
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