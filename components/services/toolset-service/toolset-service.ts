import { gql } from "@apollo/client";
import SceneService from "../scene-service/scene-service";
import AuthService from "../auth-service/auth-service";
import client from "@/components/graphql/client/client";
import { ToolsetDto } from "./toolset-service.types";
import { ProductsDto } from "../product-service/products.types";
import { v4 as uuidv4 } from "uuid";
import { BehaviorSubject } from "rxjs";

class ToolsetService {
  private _authService: AuthService;

  private _toolsets: Map<number, ToolsetDto>;
  private _activeToolset: ToolsetDto | null;

  private _temporaryTodos: string[];

  private _toolsets$ = new BehaviorSubject<ToolsetDto[]>([]);
  private _activeToolset$ = new BehaviorSubject<ToolsetDto | null>(null);
  private _restProducts$ = new BehaviorSubject<ProductsDto[]>([]);
  private _activeProducts$ = new BehaviorSubject<ProductsDto[]>([]);
  private _activePLogId$ = new BehaviorSubject<string>("");
  private _error$ = new BehaviorSubject<string>("");

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

      this._toolsets$.next([...toolsets]);
      this._activeToolset$.next(this._activeToolset);
    } catch (error) {
      this._error$.next("Error loading toolsets");
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

      this._error$.next(`Toolset ${this._toolsets.size + 1} added`);
      this.fetchUserToolsets();
    } catch (error) {
      this._error$.next("Error adding toolset");
      console.error(error);
    }
  }

  public updateActiveToolsetProducts(widgetProducts: ProductsDto[]) {
    const activeToolset = this._activeToolset;
    if (!activeToolset) {
      this._activeProducts$.next([]);
      this._restProducts$.next([]);

      return;
    }

    const activeProducts = activeToolset.toolset_products
      .map((toolsetProduct) => {
        return widgetProducts.find(
          (product) => product.id === toolsetProduct.product_id
        )!;
      })
      .filter((product) => product);

    const restProducts = widgetProducts.filter((product) => {
      return !activeToolset.toolset_products.some(
        (toolsetProduct) => toolsetProduct.product_id === product.id
      );
    });

    this._activeProducts$.next([...activeProducts]);
    this._restProducts$.next([...restProducts]);

    this._activePLogId$.next(uuidv4());
  }

  public setActiveToolset(toolsetId: number) {
    this._activeToolset = this._toolsets.get(toolsetId) || null;
    this._activeToolset$.next(this._activeToolset);
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

      this._error$.next("Toolset products updated");
    } catch (error) {
      this._error$.next("Error updating toolset products");
      console.error("Error updating toolset products:", error);
    }
  }

  public get toolsets$() {
    return this._toolsets$.asObservable();
  }

  public get activeToolset$() {
    return this._activeToolset$.asObservable();
  }

  public get restProducts$() {
    return this._restProducts$.asObservable();
  }

  public get activeProducts$() {
    return this._activeProducts$.asObservable();
  }

  public get activePLogId$() {
    return this._activePLogId$.asObservable();
  }

  public get error$() {
    return this._error$.asObservable();
  }

  public dispose() {
    this._toolsets.clear();
    this._activeToolset = null;

    this._temporaryTodos = [];

    this._toolsets$.complete();
    this._activeToolset$.complete();
    this._restProducts$.complete();
    this._activeProducts$.complete();
    this._activePLogId$.complete();
    this._error$.complete();
  }
}

export default ToolsetService;
