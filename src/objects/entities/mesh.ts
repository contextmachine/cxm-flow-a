import { ProjectModel } from "../project-model";
import * as THREE from "three";
import { Entity, ProjectObjectProps, ViewerObjectType } from "./entity";

import {
  meshDefaultMaterial,
  lineDefaultMaterial,
  lineSelectedMaterial,
  selectedMaterial,
  transparentMaterial,
  lineDisabledMaterial,
} from "../materials/object-materials";
import { Group } from "./group";
import { escape } from "lodash";

type MeshType = "bvhFragment" | "common";

export class Mesh implements Entity {
  private _id: string;
  private _model: ProjectModel;
  private _object3d: THREE.Mesh;

  private _center = new THREE.Vector3();
  private _type: ViewerObjectType = "mesh";

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

  private _meshType: MeshType;

  private _defaultMaterial: THREE.Material = meshDefaultMaterial;
  private _overrideMaterial: THREE.Material | undefined;

  constructor(object: THREE.Mesh, model: ProjectModel, parent?: Group) {
    this._id = object.uuid;
    this._model = model;
    this._object3d = object;
    this._parent = parent;

    this._meshType = model.unionMesh?.entitiesScope.has(this._id)
      ? "bvhFragment"
      : "common";

    this._name = object.name;

    this.initProperties();
    this.initBoundingBox();
    this.initMaterial();
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
    const mesh = this._object3d;

    if (mesh.material) {
      const material = mesh.material;

      if (material instanceof THREE.MeshStandardMaterial) {
        material.flatShading = true;
      }

      this._defaultMaterial = material as THREE.Material;

      this._model.unionMesh?.setMeshMaterialToFragment(
        this._id,
        this._defaultMaterial
      );
    }
  }

  public initBoundingBox() {
    const bbox = new THREE.Box3().expandByObject(this._object3d);
    bbox.getCenter(this._center);
    this._bbox.box = bbox;
    this._bbox.applyMatrix4(this._object3d.matrixWorld);
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
    this.updateLineMaterial();
  }

  public showLineEdges(show: boolean) {
    this._linesVisibility = show;
    this.updateLineMaterial();
  }

  public setBboxVisibilty(show: boolean) {
    this._bboxVisibility = show;
    this.updateBbox();
  }

  private updateMeshMaterial() {
    const visible = this._visibility && this._parentVisible;
    const selected = this._selected || this._parentSelected;

    let newMaterial: THREE.Material;

    if (!visible) {
      newMaterial = transparentMaterial;
    } else if (this._disable) {
      newMaterial = transparentMaterial;
    } else if (selected) {
      newMaterial = selectedMaterial;
    } else if (this._overrideMaterial) {
      newMaterial = this._overrideMaterial;
    } else {
      newMaterial = this._defaultMaterial;
    }

    this.setMeshMaterial(newMaterial);
  }

  private updateLineMaterial(material?: THREE.LineBasicMaterial) {
    let newMaterial: THREE.Material;

    const visible =
      this._visibility && this._linesVisibility && this._parentVisible;
    const selected = this._selected || this._parentSelected;

    if (!visible && !selected) {
      newMaterial = transparentMaterial;
    } else if (this._disable) {
      newMaterial = lineDisabledMaterial;
    } else if (selected) {
      newMaterial = lineSelectedMaterial;
    } else {
      newMaterial = lineDefaultMaterial;
    }

    this.setLineMaterial(newMaterial);
  }

  public updateMaterial(material?: THREE.Material) {
    if (material) {
      this._overrideMaterial = material;
    } else {
      this._overrideMaterial = undefined;
    }

    this.updateMaterials();
  }

  private setMeshMaterial(material: THREE.Material) {
    if (this.model.unionMesh) {
      this.model.unionMesh.setMeshMaterialToFragment(this.id, material);
    }
  }

  private setLineMaterial(material: THREE.Material) {
    if (this.model.unionMesh) {
      this.model.unionMesh.setLineMaterialToFragment(this.id, material);
    }
  }

  private updateMaterials() {
    this._parentVisible = getParentVisibility(this);

    this.updateLineMaterial();
    this.updateMeshMaterial();
  }

  public onSelect() {
    this._selected = true;

    this.updateMaterials();
  }

  public onDeselect() {
    this._selected = false;

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
