import { gql } from "@apollo/client";
import SceneService from "../scene-service/scene-service";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import { ToolsetDto } from "./toolset-service.types";
import { ProductsDto } from "../product-service/products.types";
import { v4 as uuidv4 } from "uuid";

class ToolsetService {
  private _authService: AuthService;

  private _toolsets: Map<number, ToolsetDto>;
  private _activeToolset: ToolsetDto | null;

  private _temporaryTodos: string[];

  public $setToolsets: any;
  public $setActiveToolset: any;
  public $setRestProducts: any;
  public $setActiveProducts: any;
  public $setActivePLogId: any;
  public $setError: any;

  constructor(private _sceneService: SceneService) {
    this._authService = this._sceneService.authService;

    this._toolsets = new Map();
    this._activeToolset = null;

    this._temporaryTodos = [];

    this.fetchUserToolsets = this.fetchUserToolsets.bind(this);
    this.addToolset = this.addToolset.bind(this);
  }

  public async fetchUserToolsets() {
    const userMetadata = this._authService.userMetadata;
    const sceneMetadata = this._sceneService.sceneMetadata;

    if (!userMetadata || !sceneMetadata) return;

    const userId = this._authService.userMetadata!.id;
    const workspaceId = this._sceneService.sceneMetadata!.workspace_id;
    const sceneId = this._sceneService.sceneMetadata!.id;

    // Load the scene using the sceneId
    const query = gql`
      query getUserToolsets($userId: Int!, $workspaceId: Int!, $sceneId: Int!) {
        appv3_toolset(
          where: {
            user_id: { _eq: $userId }
            workspace_id: { _eq: $workspaceId }
            scene_id: { _eq: $sceneId }
          }
        ) {
          created_at
          description
          id
          name
          scene_id
          user_id
          workspace_id
          toolset_products {
            product_id
            toolset_id
          }
        }
      }
    `;

    try {
      const variables = {
        userId,
        workspaceId,
        sceneId,
      };

      const response = await client.query({
        query,
        variables,
        fetchPolicy: "network-only",
      });
      const toolsets = response.data.appv3_toolset;

      if (!toolsets.length) {
        this.addToolset();
        return;
      }

      this._toolsets.clear();
      toolsets.forEach((toolset: any) => {
        this._toolsets.set(toolset.id, toolset);
      });

      if (!this._activeToolset)
        this._activeToolset = toolsets[toolsets.length - 1];

      this.$setToolsets([...toolsets]);
      this.$setActiveToolset(this._activeToolset);
    } catch (error) {
      this.$setError("Error loading scene");
      console.error("Error loading scene:", error);
    }
  }

  public async addToolset() {
    const userMetadata = this._authService.userMetadata;
    const sceneMetadata = this._sceneService.sceneMetadata;

    if (!userMetadata || !sceneMetadata) return;

    const userId = this._authService.userMetadata!.id;
    const workspaceId = this._sceneService.sceneMetadata!.workspace_id;
    const sceneId = this._sceneService.sceneMetadata!.id;

    const mutation = gql`
      mutation addToolset(
        $name: String!
        $workspaceId: Int!
        $userId: Int!
        $sceneId: Int!
      ) {
        insert_appv3_toolset(
          objects: {
            name: $name
            scene_id: $sceneId
            user_id: $userId
            workspace_id: $workspaceId
          }
        ) {
          affected_rows
        }
      }
    `;

    try {
      await client.mutate({
        mutation,
        variables: {
          name: `Toolset ${this._toolsets.size + 1}`,
          userId,
          workspaceId,
          sceneId,
        },
      });

      this.$setError(`Toolset ${this._toolsets.size + 1} added`);
      this.fetchUserToolsets();
    } catch (error) {
      this.$setError("Error adding toolset");
      console.error(error);
    }
  }

  public updateActiveToolsetProducts(outputProducts: ProductsDto[]) {
    if (!this.$setActiveProducts || !this.$setRestProducts) return;

    const activeToolset = this._activeToolset;
    if (!activeToolset) {
      this.$setActiveProducts([]);
      this.$setRestProducts([]);

      return;
    }

    const activeProducts = activeToolset.toolset_products
      .map((toolsetProduct) => {
        return outputProducts.find(
          (product) => product.id === toolsetProduct.product_id
        )!;
      })
      .filter((product) => product);

    const restProducts = outputProducts.filter((product) => {
      return !activeToolset.toolset_products.some(
        (toolsetProduct) => toolsetProduct.product_id === product.id
      );
    });

    this.$setActiveProducts([...activeProducts]);
    this.$setRestProducts([...restProducts]);

    this.$setActivePLogId(uuidv4());
  }

  public setActiveToolset(toolsetId: number) {
    this._activeToolset = this._toolsets.get(toolsetId) || null;
    this.$setActiveToolset(this._activeToolset);
  }

  public updateTemporaryTodos(todos: string[]) {
    this._temporaryTodos = todos;
  }

  public async saveToolsetProducts() {
    const productService = this._sceneService.productService;
    const activeToolset = this._activeToolset;

    if (!activeToolset) return;

    const products = productService.products;
    const productsArr = Array.from(products.values());

    const toolsetProducts: { product_id: number; toolset_id: number }[] = [];

    this._temporaryTodos.forEach((todo: string) => {
      const product = productsArr.find((product) => product.name === todo);
      if (product) {
        toolsetProducts.push({
          product_id: product.id,
          toolset_id: activeToolset.id,
        });
      }
    });

    // Hasura mutation
    const mutation = gql`
      mutation updateToolsetProducts(
        $toolsetId: Int!
        $objects: [appv3_toolset_product_insert_input!]!
      ) {
        delete_appv3_toolset_product(
          where: { toolset_id: { _eq: $toolsetId } }
        ) {
          affected_rows
        }
        insert_appv3_toolset_product(objects: $objects) {
          affected_rows
        }
      }
    `;

    try {
      const data = await client.mutate({
        mutation,
        variables: {
          toolsetId: activeToolset.id,
          objects: toolsetProducts,
        },
      });

      this.fetchUserToolsets();

      this.$setError("Toolset products updated");
    } catch (error) {
      this.$setError("Error updating toolset products");
      console.error("Error updating toolset products:", error);
    }
  }

  public provideStates(states: any) {
    this.$setToolsets = states.setToolsets;
    this.$setActiveToolset = states.setActiveToolset;
    this.$setRestProducts = states.setRestProducts;
    this.$setActiveProducts = states.setActiveProducts;
    this.$setActivePLogId = states.setActivePLogId;
    this.$setError = states.setError;
  }

  public dispose() {
    this._toolsets.clear();
    this._activeToolset = null;

    this._temporaryTodos = [];
  }
}

export default ToolsetService;
