import { ProjectModel } from "../project-model";
import * as THREE from "three";
import { Entity, ProjectObjectProps, ViewerObjectType } from "./entity";
import { meshDefaultMaterial } from "../materials/object-materials";
import { Group } from "./group";

export class DefaultObject implements Entity {
  private _id: string;
  private _model: ProjectModel;
  private _object3d: THREE.Object3D;

  private _center = new THREE.Vector3();
  private _type: ViewerObjectType = "default";

  private _name: string;

  private _collisionMesh: THREE.Mesh | undefined;
  private _meshIdMap = new Map<number, string>();

  private _bbox = new THREE.Box3Helper(new THREE.Box3(), new THREE.Color());

  private _visibility = true;
  private _bboxVisibility = false;
  private _linesVisibility = false;

  private _selectable = true;
  private _selected = false;
  private _parentSelected = false;
  private _disable = false;

  private _defaultMaterial: THREE.Material = meshDefaultMaterial;

  constructor(object: THREE.Object3D, model: ProjectModel, parent?: Group) {
    this._id = object.uuid;
    this._model = model;
    this._object3d = object;
    if (Object.hasOwn(object, "material")) {
      //@ts-ignore
      this._defaultMaterial = object.material;
    }
    this._name = object.name;

    this.initBoundingBox();
  }

  public get id(): string {
    return this._id;
  }

  public get objects(): THREE.Object3D[] {
    return [this._object3d];
  }

  public get isProjectObject(): boolean {
    return true;
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

  public get parent() {
    return undefined;
  }

  public get children() {
    return undefined;
  }

  public get visibility(): boolean {
    return this._visibility;
  }

  public get props(): ProjectObjectProps | undefined {
    return undefined;
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

  public updateMaterial() {
    return;
  }

  public initBoundingBox() {
    const bbox = new THREE.Box3().expandByObject(this._object3d);
    const size = bbox.getSize(new THREE.Vector3());
    bbox.getCenter(this._center);
    this._bbox.box = bbox;
    this._bbox.applyMatrix4(this._object3d.matrixWorld);
  }

  public setVisibility(visible: boolean) {
    this._visibility = visible;
    this._object3d.visible = visible;
    this.updateBbox();
  }

  public showLineEdges(show: boolean) {}

  private updateBbox() {
    if (this._visibility && this._bboxVisibility) {
      this._model.viewer.addToScene(this._bbox);
    } else {
      this._model.viewer.removeFromScene(this._bbox);
    }
  }

  public setBboxVisibilty(show: boolean) {
    this._bboxVisibility = show;
    this.updateBbox();
  }

  public onSelect() {
    this.setBboxVisibilty(true);
    this._selected = true;
  }

  public onDeselect() {
    this.setBboxVisibilty(false);
    this._selected = false;
  }

  public onParentSelect() {
    this._parentSelected = true;
  }

  public onParentDeselect() {
    this._parentSelected = false;
  }

  public onDisable() {
    this._disable = true;
  }

  public onEnable() {
    this._disable = false;
  }
}
