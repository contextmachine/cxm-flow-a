import * as THREE from "three";
import RestObject from "../viewer/loader/objects/api-object";
import Viewer from "@/viewer/viewer";
import ApiObject from "../viewer/loader/objects/api-object";
import UnionMesh from "./entities/utility/union-mesh";
import { Entity, initEntity } from "./entities/entity";
import { Group } from "./entities/group";
import { Mesh } from "./entities/mesh";
import { DefaultObject } from "./entities/default-object";



// сущность проекта, загружаемая с сервера за один импорт
export class ProjectModel {
  protected _id: string;

  private _entity: Entity
  private _unions: UnionMesh[] = []
  private _objects: THREE.Object3D[] = []

  private _viewer: Viewer

  constructor(
    viewer: Viewer,
    object3d: THREE.Object3D,
    private _apiObject: ApiObject
  ) {

    this._viewer = viewer
    this._id = object3d.uuid;

    object3d.traverse((x) => x.updateMatrixWorld());

    this._entity = this.initModel(object3d);
  }

  public updateProjectModel(object: THREE.Object3D) {
    this._entity = this.initModel(object);
  }

  public get objects(): THREE.Object3D[] {
    return this._objects
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

  public get unions(): UnionMesh[] {
    return this._unions
  }

  public get entity(): Entity {
    return this._entity;
  }

  public initModel(object: THREE.Object3D): Entity {

    let entity: Entity
    if (object instanceof THREE.Group) {

      // this._unions = new UnionMesh(object, this)
      this._objects = this._unions.objects

      entity = new Group(object, this, undefined)

    } else if (object instanceof THREE.Mesh) {

      this._objects = [object]

      entity = new Mesh(object, this, undefined)

    } else {

      this._objects = [object]

      entity = new DefaultObject(object, this, undefined)

    }

    return entity

  }

}