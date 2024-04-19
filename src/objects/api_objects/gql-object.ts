
import { ProjectModel } from "../project-model";

import { v4 as uuidv4 } from "uuid";
import RestObject from "./rest-object";
import { ApiEntry, ApiEntryStatus, ApiGqlType, ApiQueryDependecy } from "@/components/services/api-service/api-service.types";
import ApiHandler from "@/components/services/api-service/api-service";
import Viewer from "@/src/viewer/viewer";

class GqlObject {
  private _id: string = uuidv4();
  private _title: string = "";

  private _author_id: string = "";
  private _created_at: string = "";

  private _updated_at: string = "";
  private _update_author_id: string = "";

  private _endpoint: string = "";
  private _query: string = "";

  private _header: Record<string, any>;

  private _status: ApiEntryStatus = "idle";

  private _type: ApiGqlType = "gql";

  private _sceneJSON: SceneJson | undefined;
  private _projectModel: ProjectModel | undefined;

  private _queryDependenciesMap: Map<string, ApiQueryDependecy> = new Map();

  private _needsLoad: boolean = false;

  constructor(private _apiHandler: ApiHandler, private _viewer: Viewer) {
    this._header = {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": "mysecretkey",
    };
  }

  public updateDB({ id, ...attrs }: { id: string;[key: string]: any }) {
    let item: { id: string;[key: string]: any } = { id };
    item.title = this._title;
    item.type = this._type;
    item.body = { endpoint: this._endpoint, query: this._query };
    item.author_id = this._author_id;
    item.created_at = this._created_at;
    item.updated_at = new Date().toISOString();
    item.update_type = "entire";
    item.update_author_id = this._author_id;

    Object.entries(attrs).map(([key, value]) => {
      item[key] = value;
    });

    this._apiHandler.updateDB(item);
  }

  public update(entry?: ApiEntry) {
    if (entry) {
      this._id = entry.id;
      this._title = entry.title;

      this._author_id = entry.author_id;
      this._created_at = entry.created_at;

      this._updated_at = entry.updated_at;
      this._update_author_id = entry.update_author_id;

      // Обновляем только если изменился endpoint или query
      if (
        this._endpoint !== entry.body.endpoint ||
        this._query !== entry.body.query
      ) {
        this._status = "idle";
        this._needsLoad = true;
      }

      this._type = entry.type as ApiGqlType;

      // Обновляем зависимые запросы
      this._queryDependenciesMap.clear();
      entry.query_dependencies.forEach((queryDependency) => {
        this._queryDependenciesMap.set(
          queryDependency.dependent_query_id,
          queryDependency
        );
      });

      this._endpoint = entry.body.endpoint;
      this._query = entry.body.query;
    } else {
      // Если нет входного Entry, то форсим перезагрузку
      this._needsLoad = true;
    }

    // Если нужно загрузить, то загружаем
    if (this._needsLoad) {
      this._load();
    }
  }

  public set sceneJSON(scene: SceneJson | undefined) {
    this._sceneJSON = scene;
  }

  public get sceneJSON(): SceneJson | undefined {
    return this._sceneJSON;
  }

  public get endpoint(): string {
    return this._endpoint;
  }

  public get query(): string {
    return this._query;
  }

  public get header(): Record<string, any> {
    return this._header;
  }

  public get id(): string {
    return this._id;
  }

  public get title(): string {
    return this._title;
  }

  public get status(): ApiEntryStatus {
    return this._status;
  }

  public set status(status: ApiEntryStatus) {
    this._status = status;

    this._apiHandler.updateApiObjects();
  }

  private _load() {
    if (this._type === "gql" || this._type === "GRAPHQL") {
      if (!this._projectModel) {
        this._viewer.versionControl.loadModel(this);
      } else {
        this._viewer.versionControl.reloadModel(this._projectModel);
      }
    }

    this._needsLoad = false;
  }

  public set projectModel(projectModel: ProjectModel) {
    this._projectModel = projectModel;
  }

  public updateDependencies() {
    const queryDependenciesEntries: ApiQueryDependecy[] = Array.from(
      this._queryDependenciesMap.values()
    );

    const apiObjects: (RestObject | GqlObject)[] = Array.from(
      this._apiHandler.apiObjects.values()
    );

    const dependentApiObjects = apiObjects.filter((apiObject) => {
      return queryDependenciesEntries.some((queryDependency) => {
        return queryDependency.dependent_query_id === apiObject.id;
      });
    });

    dependentApiObjects.forEach((dependentApiObject) => {
      dependentApiObject.update();
    });
  }

  public dispose() {
    // Удалить дочерний projectModel
    if (this._projectModel) {
      this._viewer.entityControl.removeModel(this._projectModel);
      this._projectModel = undefined;
    }
  }
}

interface SceneJson {
  metadata: {
    version: number;
    type: string;
    generator: string;
  };
  geometries: Array<{
    uuid: string;
    type: string;
    data: any;
  }>;
  materials: Array<{
    uuid: string;
    type: string;
    name?: string;
    [propName: string]: any;
  }>;
  textures?: Array<{
    uuid: string;
    name?: string;
    image: string;
  }>;
  images?: Array<{
    uuid: string;
    url: string;
  }>;
  object: {
    uuid: string;
    type: string;
    name?: string;
    children?: SceneJson["object"][];
    geometry?: string;
    material?: string;
    matrix?: number[];
  };
  animations?: Array<{
    name?: string;
    duration: number;
    tracks: Array<{
      type: string;
      name: string;
      times: number[];
      values: number[];
      [propName: string]: any; // Additional properties based on the track type
    }>;
  }>;
  [propName: string]: any;
}

export default GqlObject;
