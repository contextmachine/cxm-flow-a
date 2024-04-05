export interface ToolsetDto {
  created_at: string;
  description: string | null;
  id: number;
  name: string;
  scene_id: number;
  user_id: number;
  workspace_id: number;
  toolset_products: { product_id: number; toolset_id: number }[];
  __typename: string;
}
