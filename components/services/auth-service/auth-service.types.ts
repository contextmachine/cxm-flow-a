export interface UserMetadata {
  created_at: string;
  email: string;
  id: number;
  password: string;
  username: string;
}

export type UserMetadataResponse = UserMetadata | null;
