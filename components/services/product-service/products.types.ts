export interface ProductsDto {
  created_at: string;
  description: string;
  id: number;
  name: string;
  price: number;
  type: string;
  __typename: string;
}

export interface RoleProductDto {
  id: number;
  product_roles: {
    product_id: number;
  }[];
  name: string;
}
