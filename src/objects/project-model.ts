import * as THREE from "three";
import GqlObject from "../viewer/loader/objects/gql-object";
import RestObject from "../viewer/loader/objects/rest-object";
import Viewer from "@/viewer/viewer";
import { MeshGroup } from "./entities/mesh-group";
import { DefaultObject } from "./entities/default-object";



export type ModelBaseObject = MeshGroup | DefaultObject


// сущность проекта, загружаемая с сервера за один импорт
export class ProjectModel {
  protected _id: string;

  private _projectObject: ModelBaseObject

  private _viewer: Viewer

  constructor(
    viewer: Viewer,
    object3d: THREE.Object3D,
    private _apiObject: GqlObject | RestObject
  ) {

    this._viewer = viewer
    this._id = object3d.uuid;

    object3d.traverse((x) => x.updateMatrixWorld());

    this._projectObject = this.initModel(object3d);;
  }

  public updateProjectModel(object: THREE.Object3D) {
    this._projectObject = this.initModel(object);;
  }


  public get viewer(): Viewer {
    return this._viewer
  }

  public get id(): string {
    return this._id;
  }

  public get apiObject(): GqlObject | RestObject {
    return this._apiObject;
  }

  public get projectObject(): ModelBaseObject {
    return this._projectObject;
  }

  public initModel(object3d: THREE.Object3D): ModelBaseObject {

    if (object3d instanceof THREE.Group) {

      const meshGroup = new MeshGroup(object3d, this)
      console.log('MeshGroup created', meshGroup)

      this._apiObject.status = "success";

      return meshGroup
    } else {
      console.log('init as default')
      return this.initModelAsDefault(object3d)
    }
  }

  // создает модель для объектов, которые не являются ни группой, ни синглмешью
  private initModelAsDefault(object: THREE.Object3D) {

    const po = new DefaultObject(object, this)
    return po

  }





}









