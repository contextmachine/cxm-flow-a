import { UserMetadata } from "../auth-service/auth-service.types";

export interface SceneDto {
  created_at: string;
  description: string;
  id: number;
  name: string;
  __typename: string;
}

export interface WorkspaceDto {
  created_at: string;
  description: string;
  id: number;
  name: string;
  scenes: SceneDto[];
  user_workspaces: { user: UserMetadata }[];
  __typename: string;
}

export interface WorkspaceUserDto {
  user: {
    id: number;
    username: string;
  };
  role: { id: number; name: string };
}
