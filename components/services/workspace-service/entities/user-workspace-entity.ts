import { WorkspaceUserDto } from "../workspace-service.types";
import SceneEntity from "./scene-entity";
import WorkspaceEntity from "./workspace-entity";
import { v4 as uuidv4 } from "uuid";

class UserWorkspaceEntity {
  private _id: string;
  private _role: { id: number; name: string };
  private _user: { id: number; username: string };

  constructor(
    private _workspaceEntity: WorkspaceEntity,
    userWorkspaceData: WorkspaceUserDto
  ) {
    this._id = uuidv4();
    this._role = userWorkspaceData.role;
    this._user = userWorkspaceData.user;
  }

  public get id() {
    return this._id;
  }

  public get role() {
    return this._role;
  }

  public get user() {
    return this._user;
  }

  public get data() {
    return {
      id: this._id,
      role: { ...this._role },
      user: { ...this._user },
    };
  }
}

export default UserWorkspaceEntity;
