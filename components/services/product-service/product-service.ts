import { gql } from "@apollo/client";
import AuthService from "../auth-service/auth-service";
import SceneService from "../scene-service/scene-service";
import client from "@/components/graphql/client/client";
import { ProductsDto, RoleProductDto } from "./products.types";

class ProductService {
  private _authService: AuthService;

  private _products: Map<number, ProductsDto>;
  private _workspaceProducts: Map<number, ProductsDto>;
  private _roleProducts: Map<number, any>;

  private $setProducts: any;
  private $setWorkspaceProducts: any;
  private $setRoleProducts: any;

  constructor(private _sceneService: SceneService) {
    this._authService = this._sceneService.authService;

    this._products = new Map();
    this._workspaceProducts = new Map();
    this._roleProducts = new Map();
  }

  async fetchProducts(): Promise<ProductsDto[]> {
    const query = gql`
      query GetProducts {
        appv3_product {
          type
          created_at
          description
          id
          name
          price
        }
      }
    `;

    try {
      const response = await client.query({
        query,
        fetchPolicy: "network-only",
      });

      const products: ProductsDto[] = response.data.appv3_product;

      this._products.clear();
      products.forEach((product) => {
        this._products.set(product.id, product);
      });

      this.$setProducts([...products]);

      if (!products) throw new Error("Products not found");

      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async fetchWorkspaceProducts(workspaceId: number): Promise<ProductsDto[]> {
    const query = gql`
      query GetWorkspaceProducts($workspaceId: Int!) {
        appv3_product(
          where: { workspace_products: { workspace_id: { _eq: $workspaceId } } }
        ) {
          type
          created_at
          description
          id
          name
          price
        }
      }
    `;

    try {
      const response = await client.query({
        query,
        variables: {
          workspaceId,
        },
        fetchPolicy: "network-only",
      });

      const products: ProductsDto[] = response.data.appv3_product;

      this._workspaceProducts.clear();
      products.forEach((product) => {
        this._workspaceProducts.set(product.id, product);
      });

      console.log("products", products);

      this.$setWorkspaceProducts([...products]);

      if (!products) throw new Error("Products not found");

      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async fetchRoleProducts() {
    const query = gql`
      query MyQuery {
        appv3_role {
          id
          product_roles {
            product_id
          }
          name
        }
      }
    `;

    try {
      const response = await client.query({
        query,
        fetchPolicy: "network-only",
      });

      const roles = response.data.appv3_role as RoleProductDto[];

      this._roleProducts.clear();
      roles.forEach((role) => {
        this._roleProducts.set(role.id, role);
      });

      this.$setRoleProducts([...roles]);

      return roles;
    } catch (error) {
      console.error("Error fetching role products:", error);
      throw error;
    }
  }

  public async updateWorkspaceProductLink(
    productId: number,
    isActive: boolean
  ) {
    if (isActive) {
      const query = gql`
        mutation AddWorkspaceProdictLink(
          $product_id: Int!
          $workspace_id: Int!
        ) {
          insert_appv3_workspace_product(
            objects: { product_id: $product_id, workspace_id: $workspace_id }
          ) {
            affected_rows
          }
        }
      `;

      try {
        const response = await client.mutate({
          mutation: query,
          variables: {
            product_id: productId,
            workspace_id: this._sceneService.workspaceId,
          },
        });

        console.log("response", response);

        if (!response.data.insert_appv3_workspace_product.affected_rows)
          throw new Error("Error updating workspace product link");
      } catch (error) {
        console.error("Error updating workspace product link:", error);
        throw error;
      }
    } else {
      const query = gql`
        mutation RemoveWorkspaceProductLink(
          $product_id: Int!
          $workspace_id: Int!
        ) {
          delete_appv3_workspace_product(
            where: {
              product_id: { _eq: $product_id }
              workspace_id: { _eq: $workspace_id }
            }
          ) {
            affected_rows
          }
        }
      `;

      try {
        const response = await client.mutate({
          mutation: query,
          variables: {
            product_id: productId,
            workspace_id: this._sceneService.workspaceId,
          },
        });

        if (!response.data.delete_appv3_workspace_product.affected_rows)
          throw new Error("Error updating workspace product link");
      } catch (error) {
        console.error("Error updating workspace product link:", error);
        throw error;
      }
    }

    this.fetchWorkspaceProducts(this._sceneService.workspaceId!);
  }

  public async updateRoleProductLink(
    roleId: number,
    productId: number,
    isActive: boolean
  ) {
    if (isActive) {
      const query = gql`
        mutation AddRoleProductLink($product_id: Int!, $role_id: Int!) {
          insert_appv3_product_role(
            objects: { product_id: $product_id, role_id: $role_id }
          ) {
            affected_rows
          }
        }
      `;

      try {
        const response = await client.mutate({
          mutation: query,
          variables: {
            product_id: productId,
            role_id: roleId,
          },
        });

        if (!response.data.insert_appv3_product_role.affected_rows)
          throw new Error("Error updating role product link");
      } catch (error) {
        console.error("Error updating role product link:", error);
        throw error;
      }
    } else {
      const query = gql`
        mutation RemoveRoleProductLink($product_id: Int!, $role_id: Int!) {
          delete_appv3_product_role(
            where: {
              product_id: { _eq: $product_id }
              role_id: { _eq: $role_id }
            }
          ) {
            affected_rows
          }
        }
      `;

      try {
        const response = await client.mutate({
          mutation: query,
          variables: {
            product_id: productId,
            role_id: roleId,
          },
        });

        if (!response.data.delete_appv3_product_role.affected_rows)
          throw new Error("Error updating role product link");
      } catch (error) {
        console.error("Error updating role product link:", error);
        throw error;
      }
    }

    this.fetchRoleProducts();
  }

  public async init() {
    if (typeof this._sceneService.workspaceId !== "number") return;
    if (!this.$setProducts || !this.$setWorkspaceProducts) return;

    await this.fetchProducts();
    await this.fetchWorkspaceProducts(this._sceneService.workspaceId!);
    await this.fetchRoleProducts();
  }

  public provideStates(states: any) {
    this.$setProducts = states.setProducts;
    this.$setWorkspaceProducts = states.setWorkspaceProducts;
    this.$setRoleProducts = states.setRoleProducts;

    this.init();
  }

  dispose() {
    this._products.clear();
    this._workspaceProducts.clear();
    this._roleProducts.clear();
  }
}

export default ProductService;
