import { ProjectModel } from "../project-model";
import * as THREE from "three";
import {
  Entity,
  ProjectObjectProps,
  ViewerObjectType,
  initEntity,
} from "./entity";
import {
  meshDefaultMaterial,
  selectedGroupBoxHelperColor,
} from "../materials/object-materials";

export class Group implements Entity {
  private _id: string;
  private _model: ProjectModel;
  private _object3d: THREE.Group;

  private _center = new THREE.Vector3();
  private _type: ViewerObjectType = "group";

  private _name: string;

  private _isInteractive = true;

  private _bbox = new THREE.Box3Helper(new THREE.Box3(), new THREE.Color());

  private _objects = undefined;

  private _visibility = true;
  private _bboxVisibility = false;
  private _linesVisibility = false;

  private _selectable = true;
  private _selected = false;
  private _parentSelected = false;
  private _disable = false;

  private _children: Entity[] = [];
  private _parent: Entity | undefined;

  private _props: ProjectObjectProps | undefined;

  private _defaultMaterial: THREE.Material = meshDefaultMaterial;
  private _overrideMaterial: THREE.Material | undefined;

  constructor(
    object: THREE.Group,
    model: ProjectModel,
    parent: Entity | undefined
  ) {
    this._id = object.uuid;
    this._model = model;
    this._object3d = object;
    this._parent = parent;

    this._name = object.name;

    this.initChildren(object);
    this.initProperties();
    this.initBoundingBox();
  }

  private initChildren(object: THREE.Object3D) {
    object.children.forEach((x) => {
      const entity = initEntity(x, this._model, this);
      this._children.push(entity);
    });
  }

  public get id(): string {
    return this._id;
  }

  public get objects() {
    return undefined;
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
    return this._parent;
  }

  public get children(): Entity[] {
    return this._children;
  }

  public get visibility(): boolean {
    return this._visibility;
  }

  public get isSelectable(): boolean {
    return this._selectable;
  }

  public get props(): ProjectObjectProps | undefined {
    return this._props;
  }

  public get center(): THREE.Vector3 {
    return this._center;
  }

  private initProperties() {
    if (this._object3d.userData.properties) {
      this._props = new Map(
        Object.entries(this._object3d.userData.properties) as [string, any][]
      ) as ProjectObjectProps;
    }
  }

  public initBoundingBox() {
    const bbox = new THREE.Box3().expandByObject(this._object3d);
    bbox.getCenter(this._center);
    this._bbox.box = bbox;
    // this._bbox.applyMatrix4(this._object3d.matrixWorld);
  }

  public updateMaterial() {
    this.children.forEach((x) => x.updateMaterial());
  }

  public setVisibility(visible: boolean) {
    this._visibility = visible;
    this.updateBbox();
    this.updateMaterial();
  }

  private updateBbox() {
    if (this._visibility && this._bboxVisibility) {
      this._model.viewer.addToScene(this._bbox);
    } else {
      this._model.viewer.removeFromScene(this._bbox);
    }
  }

  public showLineEdges(show: boolean) {
    this._linesVisibility = show;
  }

  public setBboxVisibilty(show: boolean, color?: string) {
    console.log("bbox visibility", show);
    if (color) {
      (this._bbox.material as THREE.LineBasicMaterial).color = new THREE.Color(
        color
      );
    }
    this._bboxVisibility = show;
    this.updateBbox();
  }

  public onSelect() {
    this._selected = true;
    this.setBboxVisibilty(true, selectedGroupBoxHelperColor);
    this._children.forEach((x) => x.onParentSelect());
  }

  public onDeselect() {
    this._selected = false;
    this.setBboxVisibilty(false);
    this._children.forEach((x) => x.onParentDeselect());
  }

  public onParentSelect() {
    this._parentSelected = true;
    this._children.forEach((x) => x.onParentSelect());
  }

  public onParentDeselect() {
    this._parentSelected = false;
    this._children.forEach((x) => x.onParentDeselect());
  }

  public onDisable() {
    this._disable = true;
    this._children.forEach((x) => x.onDisable());
  }

  public onEnable() {
    this._disable = false;
    this._children.forEach((x) => x.onEnable());
  }
}
