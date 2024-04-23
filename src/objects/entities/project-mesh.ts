import { ProjectModel } from "../project-model";
import * as THREE from "three";
import { ProjectObject, ProjectObjectProps, ViewerObjectType } from "./project-object";

import {
  defaultMaterial,
  lineDefaultMaterial,
  lineSelectedMaterial,
  selectedMaterial,
  transparentMaterial,
} from "../materials/object-materials";
import UserdataObject from "../../viewer/loader/objects/userdata-object";
import { MeshGroup } from "./mesh-group";
import { assertDefined } from "@/utils";
import { UserData } from "../../viewer/loader/objects/user-data.types";




export class ProjectMesh implements ProjectObject {
  private _id: string
  private _model: ProjectModel;
  private _object3d: THREE.Mesh


  private _volume = 0;
  private _center = new THREE.Vector3();
  private _type: ViewerObjectType = 'projectMesh'

  private _name: string;

  private _meshGroup: MeshGroup | undefined

  // private _lineEdges: THREE.LineSegments | undefined;
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

  constructor(object: THREE.Mesh, model: ProjectModel) {

    this._id = object.uuid
    this._model = model;
    this._object3d = object

    this._name = object.name;

    this.initUserdata();
    this.initProperties();
    this.initBoundingBox();
    this.initMaterial()

  }

  public get id(): string {
    return this._id;
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

  public setMeshGroup(meshGroup: MeshGroup) {
    this._meshGroup = meshGroup;
  }

  public setGroupIndex(index: number) {
    this._groupIndex = index;
  }

  public setSelectable(enabled: boolean) {
    this._selectable = enabled;
  }

  public initChildren(projectObjectsMap: Map<string, ProjectObject>) {
    this._childrenPO = [];

    this._object3d.children.forEach((child) => {
      const po = projectObjectsMap.get(child.uuid);

      if (po) this._childrenPO.push(po);
    });

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

  private initMaterial() {
    const mesh = this._object3d

    if (mesh.material) {
      const material = mesh.material

      if (material instanceof THREE.MeshStandardMaterial) {
        material.flatShading = true
      }

      this._defaultMaterial = material as THREE.Material
    }
  }

  public initBoundingBox() {
    const bbox = new THREE.Box3().expandByObject(this._object3d);
    const size = bbox.getSize(new THREE.Vector3());
    this._volume = size.x * size.y * size.z;
    bbox.getCenter(this._center);
    this._bbox.box = bbox;
    this._bbox.applyMatrix4(this._object3d.matrixWorld);
  }

  private updateBbox() {
    if (this._visibility && this._bboxVisibility) {
      this._model.viewer.addToScene(this._bbox)
    } else {
      this._model.viewer.removeFromScene(this._bbox)
    }
  }

  public setVisibility(visible: boolean) {
    this._visibility = visible;
    this.updateVisibility();
  }

  private updateVisibility() {
    this.updateBbox()
    this.updateMaterial();
    this.updateLineMaterial();
  }

  public showLineEdges(show: boolean) {

    this._linesVisibility = show;
    this.updateLineMaterial()
  }

  public setBboxVisibilty(show: boolean) {
    this._bboxVisibility = show;
    this.updateBbox()
  }

  private updateMeshMaterial() {

    const visible = this._visibility && this._meshGroup?.visibility

    if (this._groupIndex !== undefined) {
      const newMaterial = !visible
        ? transparentMaterial
        : this._selected
          ? selectedMaterial
          : this._overrideMaterial
            ? this._overrideMaterial
            : this._defaultMaterial;

      if (newMaterial) {
        assertDefined(this._meshGroup).setMeshGroupMaterial(this._groupIndex, newMaterial)
      }
    }
  }

  private updateLineMaterial(material?: THREE.LineBasicMaterial) {

    if (this._groupIndex !== undefined) {
      const newMaterial = !this._visibility && !this._linesVisibility
        ? transparentMaterial
        : this._selected
          ? lineSelectedMaterial
          : material
            ? material
            : lineDefaultMaterial;

      if (newMaterial) {
        assertDefined(this._meshGroup).setMeshLineGroupMaterial(this._groupIndex, newMaterial);
      }
    }
  }

  public updateMaterial(
    material?: THREE.Material,
    linesMaterial?: THREE.LineBasicMaterial
  ) {

    if (material) {
      this._overrideMaterial = material;
    } else {
      this._overrideMaterial = undefined;
    }

    this.updateMeshMaterial();
    this.updateLineMaterial(linesMaterial);
  }


  public clearColor() {
    this.updateMeshMaterial()
    this.updateLineMaterial()
  }



  public select() {
    this._selected = true;

    this.updateLineMaterial();
    this.updateMeshMaterial();

  }

  public deselect() {
    this._selected = false;

    this.updateLineMaterial();
    this.updateMeshMaterial();
  }

}
