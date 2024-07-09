export interface UserMetadata {
  created_at: string;
  email: string;
  id: number;
  password: string;
  username: string;
  user_theme: {
    theme: {
      id: number;
      name: string;
    };
    id: number;
  } | null;
}

export interface Theme {
  id: number;
  name: string;
}

export type UserMetadataResponse = UserMetadata | null;

export type FeatureType = "isDarkMode";
