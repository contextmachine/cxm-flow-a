import { QueryRawData } from "@/src/data-access/queries";
import { ProjectModel } from "@/src/objects/project-model";
import { v4 as uuidv4 } from "uuid";

export type QueryType = "rest";

class ApiObject {
  private _id: number;
  private _endpoint: string;
  private _name: string;
  private _type: QueryType;
  private _loaded: boolean;
  private _scene_id: number;

  private _model: ProjectModel | undefined;

  constructor(query: QueryRawData) {
    this._id = query.id;
    this._endpoint = query.endpoint;
    this._name = query.name;
    this._type = query.type;
    this._scene_id = query.scene_id;
    this._loaded = false;
  }

  public get id() {
    return this._id;
  }

  public get name() {
    return this._name;
  }

  public get type() {
    return this._type;
  }

  public get scene_id() {
    return this._endpoint;
  }

  public get endpoint() {
    return this._endpoint;
  }

  public get model() {
    return this._model;
  }

  public setModel(model: ProjectModel) {
    this._model = model;
  }

  public updateApiObject(query: QueryRawData) {
    this._id = query.id;
    this._endpoint = query.endpoint;
    this._name = query.name;
    this._type = query.type;
    this._scene_id = query.scene_id;
  }
}

export default ApiObject;
