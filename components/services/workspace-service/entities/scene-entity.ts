import { SceneDto } from "../workspace-service.types";
import WorkspaceEntity from "./workspace-entity";

class SceneEntity {
  private _id: number;
  private _name: string;
  private _description: string;
  private _created_at: string;

  constructor(private _parentWorkspace: WorkspaceEntity, sceneDto: SceneDto) {
    this._id = sceneDto.id;
    this._name = sceneDto.name;
    this._description = sceneDto.description;
    this._created_at = sceneDto.created_at;
  }

  public get id() {
    return this._id;
  }

  public get name() {
    return this._name;
  }

  public get description() {
    return this._description;
  }

  public get created_at() {
    return this._created_at;
  }

  public get data() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      created_at: this._created_at,
    };
  }
}

export default SceneEntity;
