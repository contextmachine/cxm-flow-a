import { BehaviorSubject } from "rxjs";
import { QueryRawData, QueryType } from "./query-entity.types";
import axios from "axios";
import QueryExtension from "../query-extension";
import SceneService from "@/components/services/scene-service/scene-service";
import { ProjectModel } from "@/src/objects/project-model";

class QueryEntity {
  private _id: number;
  private _endpoint: string;
  private _type: QueryType;

  private _loading$ = new BehaviorSubject<boolean>(false);
  private _loaded$ = new BehaviorSubject<boolean>(false);
  private _failed$ = new BehaviorSubject<boolean>(false);

  private _rawData: any;

  private _sceneService: SceneService;

  private _projectModel: ProjectModel | null = null;

  constructor(private _queryExtension: QueryExtension, rawData: QueryRawData) {
    const query = rawData.query;
    this._id = query.id;
    this._endpoint = query.endpoint;
    this._type = query.type;

    this._sceneService = this._queryExtension.sceneService!;
  }

  public async load() {
    // Fetch data
    await this.fetch();

    // load Model
    const projectModel =
      await this._sceneService!.viewer!.loader.loadQueryModel(this);

    //this._projectModel = projectModel;
  }

  private async fetch() {
    this._failed$.next(false);
    this._loaded$.next(false);
    this._loading$.next(true);

    // Fetch data
    try {
      const response = await axios.get(this._endpoint);
      this._rawData = response.data;

      this._loading$.next(false);
      this._loaded$.next(true);
    } catch (error) {
      this._loading$.next(false);
      this._failed$.next(true);
    }
  }

  public unload() {
    if (this._projectModel) {
      this._sceneService.viewer!.entityControl.removeModel(this._projectModel!);
      this._projectModel = null;
    }
  }

  public get id() {
    return this._id;
  }

  public get endpoint() {
    return this._endpoint;
  }

  public get type() {
    return this._type;
  }

  public get rawData() {
    return this._rawData;
  }

  public get projectModel() {
    return this._projectModel;
  }

  public get loading$() {
    return this._loading$.asObservable();
  }

  public get loaded$() {
    return this._loaded$.asObservable();
  }
}

export default QueryEntity;
