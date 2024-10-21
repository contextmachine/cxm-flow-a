import { ProjectModel } from "../project-model";
import * as THREE from "three";
import { Entity, ProjectObjectProps, ViewerObjectType } from "./entity";

import {
  meshDefaultMaterial,
  transparentMaterial,
  selectedColor,
  selectedGroupBoxHelperColor,
} from "../materials/object-materials";
import { Group } from "./group";
import CollisionMesh from "./utility/collision-mesh";
import { MeshBVHHelper } from "three-mesh-bvh";

export class Points implements Entity {
  private _id: string;
  private _model: ProjectModel;
  private _object3d: THREE.Points;

  private _center = new THREE.Vector3();
  private _type: ViewerObjectType = "points";

  private _name: string;

  private _parent: Entity | undefined;

  private _bbox = new THREE.Box3Helper(new THREE.Box3(), new THREE.Color());

  private _visibility = true;
  private _bboxVisibility = false;
  private _linesVisibility = true;
  private _parentVisible = true;

  private _selectable = true;
  private _selected = false;
  private _parentSelected = false;
  private _disable = false;

  private _props: ProjectObjectProps | undefined;

  private _defaultMaterial: THREE.Material = meshDefaultMaterial;
  private _overrideMaterial: THREE.Material | undefined;
  private _selectedMaterial: THREE.Material = meshDefaultMaterial;

  constructor(object: THREE.Points, model: ProjectModel, parent?: Group) {
    this._id = object.uuid;
    this._model = model;
    this._object3d = object;
    this._parent = parent;

    this._name = object.name;

    this.initProperties();
    this.initBoundingBox();
    this.initMaterial();
    this.initBVH();
  }

  public get id(): string {
    return this._id;
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

  public get objects() {
    return [this._object3d];
  }

  public get parent() {
    return this._parent;
  }

  public get children() {
    return undefined;
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

  public get visibility(): boolean {
    return this._visibility;
  }

  public get props(): ProjectObjectProps | undefined {
    return this._props;
  }

  public get center(): THREE.Vector3 {
    return this._center;
  }

  public get isSelectable(): boolean {
    return this._selectable;
  }

  public setParentVisible(visible: boolean) {
    this._parentVisible = visible;
  }

  public setMeshGroup(meshGroup: Group) {
    this._parent = meshGroup;
  }

  public setSelectable(enabled: boolean) {
    this._selectable = enabled;
  }

  private initProperties() {
    if (this._object3d.userData.properties) {
      this._props = new Map(
        Object.entries(this._object3d.userData.properties) as [string, any][]
      ) as ProjectObjectProps;
    }
  }

  private initMaterial() {
    const points = this._object3d;

    this._defaultMaterial = points.material as THREE.PointsMaterial;
    this._defaultMaterial.depthFunc = 3;

    this._selectedMaterial = this._defaultMaterial.clone();
    (this._selectedMaterial as THREE.PointsMaterial).color = new THREE.Color(
      selectedColor
    );
  }

  public initBVH() {
    console.log("here");

    const meshIdMap = new Map<number, string>();
    const object = this._object3d;

    meshIdMap.set(0, this._id);

    const indices = [];
    const bvhGeometry = object.geometry.clone();

    bvhGeometry.applyMatrix4(object.matrixWorld);

    let verticesLength = bvhGeometry.attributes.position.count;
    for (let i = 0, l = verticesLength; i < l; i++) {
      indices.push(i, i, i);
    }

    bvhGeometry.setIndex(indices);
    const bvhMesh = new THREE.Mesh(bvhGeometry);

    bvhMesh.geometry.computeBoundsTree();

    const collisionMesh = new CollisionMesh(bvhMesh, meshIdMap, "points");

    const helper = new MeshBVHHelper(bvhMesh, 3);
    helper.name = "bvh-helper";

    this._model.collisionMeshes.push(collisionMesh);
  }

  public initBoundingBox() {
    const bbox = new THREE.Box3().expandByObject(this._object3d);
    bbox.getCenter(this._center);
    this._bbox.box = bbox;
    this._bbox.applyMatrix4(this._object3d.matrixWorld);

    // this._model.viewer.addToScene(this._bbox.clone());
  }

  private updateBbox() {
    if (this._visibility && this._bboxVisibility) {
      this._model.viewer.addToScene(this._bbox);
    } else {
      this._model.viewer.removeFromScene(this._bbox);
    }
  }

  public setVisibility(visible: boolean) {
    this._visibility = visible;
    this.updateVisibility();
  }

  private updateVisibility() {
    this.updateBbox();
    this.updateMaterial();
  }

  public showLineEdges(show: boolean) {
    this._linesVisibility = show;
  }

  public setBboxVisibilty(show: boolean, color?: string) {
    this._bboxVisibility = show;
    this.updateBbox();
  }

  private updatePointsMaterial() {
    const visible = this._visibility && this._parentVisible;
    const selected = this._selected || this._parentSelected;

    let newMaterial: THREE.Material;

    if (!visible) {
      newMaterial = transparentMaterial;
    } else if (this._disable) {
      newMaterial = transparentMaterial;
    } else if (selected) {
      newMaterial = this._selectedMaterial;
    } else if (this._overrideMaterial) {
      newMaterial = this._overrideMaterial;
    } else {
      newMaterial = this._defaultMaterial;
    }

    this.setMaterial(newMaterial);
  }

  public updateMaterial(material?: THREE.Material) {
    if (material) {
      this._overrideMaterial = material;
    } else {
      this._overrideMaterial = undefined;
    }

    this.updateMaterials();
  }

  private setMaterial(material: THREE.Material) {
    this._object3d.material = material;
  }

  private updateMaterials() {
    this._parentVisible = getParentVisibility(this);

    this.updatePointsMaterial();
  }

  public onSelect() {
    this._selected = true;
    this.setBboxVisibilty(true, selectedGroupBoxHelperColor);

    this.updateMaterials();
  }

  public onDeselect() {
    this._selected = false;
    this.setBboxVisibilty(false);
    this.updateMaterials();
  }

  public onParentSelect() {
    this._parentSelected = true;

    this.updateMaterials();
  }

  public onParentDeselect() {
    this._parentSelected = false;

    this.updateMaterials();
  }

  public onDisable() {
    this._disable = true;
    this._selectable = false;

    this.updateMaterials();
  }

  public onEnable() {
    this._disable = false;
    this._selectable = true;

    this.updateMaterials();
  }
}

const getParentVisibility = (enitiy: Entity): boolean => {
  const parent = enitiy.parent;
  if (parent) {
    if (parent.visibility) {
      return getParentVisibility(parent);
    } else {
      return false;
    }
  } else {
    return true;
  }
};
