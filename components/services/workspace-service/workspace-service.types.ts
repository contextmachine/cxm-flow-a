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

export interface MinifiedWorkspaceDto {
  id: number;
  name: string;
}

export interface CollectionDto {
  id: number;
  name: string;
  tmp_type: string;
  created_at: string;
  collection_workspaces: { workspace: MinifiedWorkspaceDto }[];
  __typename: string;
}

export interface WorkspaceUserDto {
  user: {
    id: number;
    username: string;
  };
  role: { id: number; name: string };
}

export const RoleTypes = {
  ADMIN: 1,
  EDITOR: 2,
  VIEWER: 3,
};
