import * as THREE from "three";
import RestObject from "../viewer/loader/objects/api-object";
import Viewer from "@/viewer/viewer";
import ApiObject from "../viewer/loader/objects/api-object";
import UnionMesh from "./entities/utility/union-mesh";
import { Entity, initEntity } from "./entities/entity";



// сущность проекта, загружаемая с сервера за один импорт
export class ProjectModel {
  protected _id: string;

  private _entity: Entity
  private _unionMesh: UnionMesh | undefined

  private _viewer: Viewer


  constructor(
    viewer: Viewer,
    object3d: THREE.Object3D,
    private _apiObject: ApiObject
  ) {

    this._viewer = viewer
    this._id = object3d.uuid;

    object3d.traverse((x) => x.updateMatrixWorld());

    this._entity = this.initModel(object3d);;
  }

  public updateProjectModel(object: THREE.Object3D) {
    this._entity = this.initModel(object);;
  }

  public get objects(): THREE.Object3D[] {
    if (this._unionMesh) {
      return this._unionMesh.objects
    } else {
      return []
    }
  }

  public get viewer(): Viewer {
    return this._viewer
  }

  public get id(): string {
    return this._id;
  }

  public get apiObject(): RestObject {
    return this._apiObject;
  }

  public get unionMesh(): UnionMesh | undefined {
    return this._unionMesh
  }

  public get entity(): Entity {
    return this._entity;
  }

  public initModel(object3d: THREE.Object3D): Entity {

    this._unionMesh = new UnionMesh(object3d, this)
    const entity = initEntity(object3d, this)

    return entity

  }

}









