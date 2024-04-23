import { ProjectModel } from "../project-model";
import * as THREE from "three";
import { ProjectObject, ProjectObjectProps, ViewerObjectType } from "./project-object";


import UserdataObject from "../../viewer/loader/objects/userdata-object";
import { defaultMaterial } from "../materials/object-materials";


export class DefaultObject implements ProjectObject {
    private _id: string
    private _model: ProjectModel;
    private _object3d: THREE.Object3D


    private _volume = 0;
    private _center = new THREE.Vector3();
    private _type: ViewerObjectType = 'meshGroup'

    private _name: string;

    private _collisionMesh: THREE.Mesh | undefined;
    private _meshIdMap = new Map<number, string>();

    private _bbox = new THREE.Box3Helper(
        new THREE.Box3(),
        new THREE.Color("lightblue")
    );

    private _selected = false;
    private _visibility = true;
    private _bboxVisibility = false;
    private _linesVisibility = false;

    private _selectable = false;

    private _childrenPO: ProjectObject[] = [];

    private _defaultMaterial: THREE.Material = defaultMaterial;

    constructor(object: THREE.Object3D, model: ProjectModel) {

        this._id = object.uuid
        this._model = model;
        this._object3d = object

        this._name = object.name;

        this.initBoundingBox();

    }

    public get id(): string {
        return this._id;
    }

    public get objects(): THREE.Object3D[] {
        return [this._object3d]
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
        return undefined
    }

    public get userdata(): UserdataObject | undefined {
        return undefined
    }

    public get volume(): number {
        return this._volume;
    }

    public get center(): THREE.Vector3 {
        return this._center;
    }

    public get isSelectable(): boolean {
        return this._selectable;
    }

    public setSelectable(enabled: boolean) {
        this._selectable = enabled;
    }

    public get collisionMesh(): THREE.Mesh | undefined {
        return this._collisionMesh;
    }

    public get meshIdMap(): Map<number, string> {
        return this._meshIdMap;
    }

    public initBoundingBox() {

        const bbox = new THREE.Box3().expandByObject(this._object3d);
        const size = bbox.getSize(new THREE.Vector3());
        this._volume = size.x * size.y * size.z;
        bbox.getCenter(this._center);
        this._bbox.box = bbox;
        this._bbox.applyMatrix4(this._object3d.matrixWorld);

    }

    public setVisibility(visible: boolean) {
        this._visibility = visible;
        this._object3d.visible = visible
        this.updateBbox()
    }

    public showLineEdges(show: boolean) {

    }

    private updateBbox() {
        if (this._visibility && this._bboxVisibility) {
            this._model.viewer.addToScene(this._bbox)
        } else {
            this._model.viewer.removeFromScene(this._bbox)
        }
    }

    public setBboxVisibilty(show: boolean) {
        this._bboxVisibility = show;
        this.updateBbox()
    }

    public select() {
        this._selected = true;
    }

    public deselect() {
        this._selected = false;

    }
}
