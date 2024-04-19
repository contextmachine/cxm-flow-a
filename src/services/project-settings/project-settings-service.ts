import {
  ApolloClient,
  ApolloQueryResult,
  FetchResult,
  NormalizedCacheObject,
} from "@apollo/client";
import ProjectMetadata from "./entities/project-metadata";
import ProjectSettings from "./entities/project-settings";

import { NextRouter } from "next/router";
import ProjectAuthor from "./entities/project_author";
import * as RX from 'rxjs'
import {
  ParamBoolean,
  ParamEntity,
  ParamEnum,
  ParamNumber,
  ParamRange,
  ParamString
} from "./entities/params";
import { CREATE_SCENE, GET_CATEGORIES, GET_PARAM_NAMESPACES, GET_SCENE, UPDATE_SCENE } from "./queries";

class ProjectSettingsService {
  private _router: NextRouter | undefined;
  private _client: ApolloClient<NormalizedCacheObject> | undefined;

  private _projectQuery: any;
  private _categoryQuery: any;
  private _paramNamespaceQuery: any;

  // Project settings
  private _projectSettings: ProjectSettings;
  private _projectMetadata: ProjectMetadata;
  private _projectAuthor: ProjectAuthor;

  // Categories
  private _categories: Map<string, Category>;
  private _categoriesLoaded: boolean = false;

  // Param namespaces
  private _paramNamespaces: Map<string, ParamNamespace>;
  private _defaultParamNamespace: ParamNamespace | null = null;
  private _paramNamespacesLoaded: boolean = false;

  private _paramLibrary = new Map<string, ParamEntity>();

  // Subjects
  private _projectSettingsObservable = new RX.Subject<ProjectSettings>();
  private _paramLibraryObservable = new RX.Subject<Map<string, ParamEntity>>();

  // States
  private $setReady: any;
  private $setSettings: any;
  private $setMetadata: any;
  private $setCategories: any;
  private $setParams: any;
  private $setAuthor: any;

  private _wasMounted: boolean = false;

  constructor() {
    this._projectMetadata = new ProjectMetadata();
    this._projectSettings = new ProjectSettings(this);
    this._projectAuthor = new ProjectAuthor();

    this._categories = new Map();
    this._paramNamespaces = new Map();
  }

  public async createProject(): Promise<boolean> {
    const scene_id = this._router!.query.scene_id;
    if (!scene_id) return false;

    try {
      const projectMetadata = this._buildProjectMetadataPayload();

      const object = {
        ...projectMetadata,
        id: scene_id,
        category_id: this._assignCategory(),
      };

      const a: FetchResult<any> = await this._client!.mutate({
        mutation: CREATE_SCENE,
        variables: {
          object,
        },
      });

      this._projectQuery = a;

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Initializes fetching of project data based on the current scene ID.
   * This method fetches the project's metadata and settings from the GraphQL API.
   */
  public async initGetProject(): Promise<void> {
    try {
      // Extract the scene_id from the router's query parameters
      const { scene_id } = this._router!.query;

      // Wait for the Apollo client's query to complete
      const a: ApolloQueryResult<any> = await this._client!.query({
        query: GET_SCENE,
        variables: { id: scene_id },
      });

      // Assign the result of the query to _projectQuery
      this._projectQuery = a;

      // check if not empty
      const metadata = this._projectQuery.data.app_scenes_by_pk;

      // Proceed only if metadata exists or a new project can be successfully created
      if (!metadata) {
        const creationResult = await this.createProject();

        // Assuming `createProject` returns a truthy value on success and falsy on failure
        if (!creationResult) {
          console.error("Failed to create a new project");
          return; // Exit the method early
        }
      }

      // Update the project from the query and check if all data has been loaded
      this.updateProjectFromQuery();
      this.checkAllDataLoaded();
    } catch (e) {
      // Log any errors that occur during the query
      console.error(e);
    }
  }

  /**
   * Initializes the fetching of categories from the GraphQL API.
   * Categories are used within the project settings for categorization purposes.
   */
  public async initGetCategories(): Promise<void> {
    try {
      const a: ApolloQueryResult<any> = await this._client!.query({
        query: GET_CATEGORIES,
      });

      this._categoryQuery = a;
      this.updateCategoriesFromQuery();
      this.checkAllDataLoaded();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Initializes the fetching of param_namespaces from the GraphQL API.
   * Param namespaces are used within the project settings for categorization purposes.
   */
  public async initGetParamNamespaces(): Promise<void> {
    try {
      const a: ApolloQueryResult<any> = await this._client!.query({
        query: GET_PARAM_NAMESPACES,
      });

      this._paramNamespaceQuery = a;
      this.updateParamNamespacesFromQuery();
      this.checkAllDataLoaded();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Updates project metadata and settings from the fetched project query result.
   * This method is called after successfully fetching project data.
   */
  public updateProjectFromQuery(): void {
    const a = this._projectQuery;

    this._projectMetadata.updateFromQuery(a);
    this._projectSettings.updateFromQuery(a);
    this._projectAuthor.updateFromQuery(a);

    if (this._projectMetadata.isReady && this._projectSettings.isReady) {
      this.$setMetadata(this._projectMetadata.getValues());
      this.$setSettings(this._projectSettings.getValues());
      this.$setAuthor(this._projectAuthor.getValues());
    }
  }

  public updateParamLibraryFromQuery(): void {

  }

  /**
   * Updates local project metadata state.
   * @param data - Partial project metadata to update.
   */
  public updateMetadata(data: Partial<ProjectMetadata>): void {
    this._projectMetadata.updateLocally(data);

    if (this._projectMetadata.isReady) {
      this.$setMetadata(this._projectMetadata.getValues());
    }
  }

  /**
   * Updates local project settings state.
   * @param data - Partial project settings to update.
   */
  public updateSettings(data: Partial<ProjectSettings>): void {
    this._projectSettings.updateLocally(data);

    if (this._projectSettings.isReady) {
      this.$setSettings(this._projectSettings.getValues());
    }
    this._projectSettingsObservable.next(this._projectSettings)

  }

  /**
   * Assembles the project metadata payload for saving.
   * This includes serialization of project settings.
   * @returns The assembled project metadata object ready for sending to the GraphQL API.
   */
  private _buildProjectMetadataPayload() {
    const { id, ...restMetadata } = this._projectMetadata.getValues();
    const settings = this._projectSettings.getValues();

    const projectSettings = JSON.stringify(settings);
    const projectMetadata = {
      ...restMetadata,
      project_settings: projectSettings,
    };

    return projectMetadata;
  }

  /**
   * Assigns a default category to the project if no category is assigned.
   */
  private _assignCategory(): string {
    // check category
    const { categoryId } = this._router!.query;

    // set default category
    let defaultCategory = "";
    this._categories.forEach((category) => {
      if (category.is_default) {
        defaultCategory = category.id;
      }
    });

    // check if category from exists
    if (categoryId) {
      if (this._categories.has(categoryId as string)) {
        defaultCategory = categoryId as string;
      }
    }

    return defaultCategory;
  }

  /**
   * Saves the current project metadata and settings by performing a GraphQL mutation.
   * This method asynchronously persists project changes.
   * @async
   * @returns A promise that resolves upon successful completion of the save operation.
   * @throws Error if the save operation fails.
   */
  public async saveProject(): Promise<void> {
    const projectMetadata = this._buildProjectMetadataPayload();

    try {
      const a: FetchResult = await this._client!.mutate({
        mutation: UPDATE_SCENE,
        variables: {
          id: this._projectMetadata.id,
          _set: projectMetadata,
        },
      });

      this._projectQuery = a;

      this.updateProjectFromQuery();
    } catch (e) {
      console.error(e);
      throw new Error("Failed to save project");
    }
  }

  /**
   * Updates the categories state from the fetched category query result.
   * This method populates the local categories map and updates the state.
   */
  public updateCategoriesFromQuery() {
    const query = this._categoryQuery;

    if (query.data && !query.loading) {
      this._categories.clear();

      const categories = query.data.app_categories;

      if (categories) {
        for (const category of categories) {
          const item: Category = {
            id: category.id,
            title: category.title,
            is_default: category.is_default,
          };

          this._categories.set(item.id, item);
        }
      }
    }

    this._categoriesLoaded = true;
    this.$setCategories(Array.from(this._categories.values()));
  }

  /**
   * Updates the param namespaces state from the fetched param namespace query result.
   * This method populates the local param namespaces map and updates the state.
   */
  public updateParamNamespacesFromQuery() {
    const query = this._paramNamespaceQuery;

    if (query.data && !query.loading) {
      this._paramNamespaces.clear();

      const paramNamespaces = query.data.app_params as any[];
      if (paramNamespaces) {
        for (const paramNamespace of paramNamespaces) {
          let params: ParamEntity[] = [];

          if (paramNamespace?.params) {
            const _params = JSON.parse(paramNamespace.params);

            for (const param of _params) {
              switch (param.type) {
                case "enum":
                  params.push(new ParamEnum(param));
                  break;
                case "boolean":
                  params.push(new ParamBoolean(param));
                  break;
                case "number":
                  params.push(new ParamNumber(param));
                  break;
                case "range":
                  params.push(new ParamRange(param));
                case "string":
                  params.push(new ParamString(param));
                  break;
              }
            }
          }

          const item: ParamNamespace = {
            id: paramNamespace.id,
            name: paramNamespace.name,
            params,
          };

          // Set the default param namespace
          if (paramNamespace.name.toLowerCase() === "default") {
            this._defaultParamNamespace = item;
          }

          this._paramNamespaces.set(paramNamespace.id, item);
        }
      }
    }

    this._paramNamespacesLoaded = true;
    this.$setParams(Array.from(this._paramNamespaces.values()));

    this._paramLibrary = new Map(this._paramNamespaces
      .get(this._projectSettings.param_namespace!)?.params
      .map(x => ([x.name, x])))

    console.log('params', this._projectSettings.param_namespace, this._paramLibrary)
  }

  /**
   * Checks if all necessary data has been loaded and sets the ready state accordingly.
   * This method ensures that the project is fully loaded before setting the ready state.
   */
  private checkAllDataLoaded() {
    if (
      this._categoriesLoaded &&
      this._paramNamespacesLoaded &&
      this._projectSettings.isReady &&
      this._projectMetadata.isReady
    ) {
      this.$setReady(true);
      // Perform any additional actions needed when the service is fully initialized
    }
  }

  public get metadata() {
    return this._projectMetadata;
  }

  public get settings() {
    return this._projectSettings;
  }

  public get $settings() {
    return this._projectSettingsObservable;
  }

  public get paramLibrary(): Map<string, ParamEntity> {
    return this._paramLibrary;
  }

  public get $paramLibrary(): RX.Observable<Map<string, ParamEntity>> {
    return this._paramLibraryObservable;
  }

  public get defaultParamNamespace() {
    return this._defaultParamNamespace;
  }

  public get author() {
    return this._projectAuthor;
  }

  /**
   * Provides external states to the service, including the Apollo client and router.
   * @param states - Object containing the states to be provided.
   */
  public async provideStates(states: States) {
    this._client = states.client;

    if (!this._client || this._wasMounted) return;

    this._router = states.router;

    this.$setReady = states.setReady;
    this.$setSettings = states.setSettings;
    this.$setMetadata = states.setMetadata;
    this.$setCategories = states.setCategories;
    this.$setParams = states.setParams;
    this.$setAuthor = states.setAuthor;

    this._wasMounted = true;

    await this.initGetCategories();
    await this.initGetProject();
    await this.initGetParamNamespaces();
  }

  /**
   * Cleans up resources and resets the service state.
   * This method is called to reset the service's internal state and dispose of resources.
   */
  public dispose() {
    this.$setReady = null;
    this.$setSettings = null;
    this.$setCategories = null;
    this.$setMetadata = null;
    this.$setAuthor = null;

    this._projectMetadata = new ProjectMetadata();
    this._projectSettings = new ProjectSettings(this);

    this._categories = new Map();
    this._categoriesLoaded = false;

    this._paramNamespaces = new Map();
    this._defaultParamNamespace = null;
    this._paramNamespacesLoaded = false;

    this._router = undefined;
    this._client = undefined;

    this._projectQuery = null;
    this._categoryQuery = null;

    this._wasMounted = false;
  }
}

export interface Category {
  id: string;
  title: string;
  is_default: boolean;
}



export interface ParamNamespace {
  id: string;
  name: string;
  params: ParamEntity[];
}

interface States {
  router: NextRouter;
  client: ApolloClient<NormalizedCacheObject>;
  setReady: any;
  setSettings: any;
  setMetadata: any;
  setCategories: any;
  setParams: any;
  setExtensions: any;
  setAuthor: any;
}

export default ProjectSettingsService;
