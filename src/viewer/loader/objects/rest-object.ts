import { v4 as uuidv4 } from "uuid";
import { ProjectModel } from "../../../objects/project-model";
import GqlObject from "./gql-object";
import ApiHandler from "@/src/viewer/loader/api-service";
import { ApiEntry, ApiEntryStatus, ApiQueryDependecy, ApiRestType } from "@/src/viewer/loader/objects/api-service.types";
import Viewer from "@/viewer/viewer";
import { SceneJSON } from "./user-data.types";

class RestObject {
  private _id: string = uuidv4();
  private _title: string = "";

  private _author_id: string = "";
  private _created_at: string = "";

  private _updated_at: string = "";
  private _update_author_id: string = "";

  private _endpoint: string = "";
  private _status: ApiEntryStatus = "idle";

  private _type: ApiRestType = "rest";

  private _sceneJSON: SceneJSON | undefined;
  private _projectModel: ProjectModel | undefined;

  private _queryDependenciesMap: Map<string, ApiQueryDependecy> = new Map();

  private _needsLoad: boolean = false;

  constructor(private _apiHandler: ApiHandler, private _viewer: Viewer) { }

  public update(entry?: ApiEntry) {
    if (entry) {
      this._id = entry.id;
      this._title = entry.title;

      this._author_id = entry.author_id;
      this._created_at = entry.created_at;

      this._updated_at = entry.updated_at;
      this._update_author_id = entry.update_author_id;

      this._type = entry.type as ApiRestType;

      // Обновляем зависимые запросы
      this._queryDependenciesMap.clear();
      entry.query_dependencies.forEach((queryDependency) => {
        this._queryDependenciesMap.set(
          queryDependency.dependent_query_id,
          queryDependency
        );
      });

      // Обновляем только если изменился endpoint или query
      if (this._endpoint !== entry.body.endpoint) {
        this._status = "idle";
        this._needsLoad = true;
      }

      this._endpoint = entry.body.endpoint;
    } else {
      // Если нет входного Entry, то форсим перезагрузку
      this._needsLoad = true;
    }

    // Если нужно загрузить, то загружаем
    if (this._needsLoad) {
      this._load();
    }
  }

  public updateDB({ id, ...attrs }: { id: string;[key: string]: any }) {
    let item: { id: string;[key: string]: any } = { id };
    item.title = this._title;
    item.type = this._type;
    item.body = { endpoint: this._endpoint };
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

  private _load() {
    if (this._type == "REST" || this._type == "restScene") {
      if (!this._projectModel) {
        console.log("load model");
        this._viewer.versionControl.loadModel(this);
      } else {
        console.log("reload model");
        this._viewer.versionControl.reloadModel(this._projectModel);
      }
    } else if (this._type === "controlPoints") {
    }

    this._needsLoad = false;
  }

  public set sceneJSON(scene: SceneJSON | undefined) {
    this._sceneJSON = scene;
  }

  public get sceneJSON(): SceneJSON | undefined {
    return this._sceneJSON;
  }

  public set projectModel(projectModel: ProjectModel) {
    this._projectModel = projectModel;
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

  public get type(): ApiRestType {
    return this._type;
  }

  public get endpoint(): string {
    return this._endpoint;
  }

  public get updated_at(): string {
    return this._updated_at;
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

  public dispose() { }
}

export default RestObject;
