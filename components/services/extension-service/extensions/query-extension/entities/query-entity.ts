import { BehaviorSubject, combineLatest, map } from "rxjs";
import {
  QueryEntityTreeItem,
  QueryRawData,
  QueryType,
} from "./query-entity.types";
import axios from "axios";
import QueryExtension from "../query-extension";
import SceneService from "@/components/services/scene-service/scene-service";
import { ProjectModel } from "@/src/objects/project-model";
import { v4 as uuidv4 } from "uuid";

class QueryEntity {
  private _id: number;
  private _endpoint: string;
  private _type: QueryType;
  private _name: string;

  private _loading$ = new BehaviorSubject<boolean>(false);
  private _queryLoaded$ = new BehaviorSubject<boolean>(false);
  private _modelLoaded$ = new BehaviorSubject<boolean>(false);
  private _failed$ = new BehaviorSubject<boolean>(false);
  private _logId$ = new BehaviorSubject<string>(uuidv4());

  private _rawData: any;

  private _sceneService: SceneService;

  private _projectModel: ProjectModel | null = null;

  constructor(private _queryExtension: QueryExtension, rawData: QueryRawData) {
    const query = rawData.query;
    this._id = query.id;
    this._endpoint = query.endpoint;
    this._type = query.type;
    this._name = query.name;

    this._sceneService = this._queryExtension.sceneService!;

    // Combine loading, queryLoaded, modelLoaded, and failed observables
    const combined$ = combineLatest([
      this._loading$,
      this._queryLoaded$,
      this._modelLoaded$,
      this._failed$,
      this._logId$,
    ]).pipe(
      // Map the combined values to a single value
      map(([loading, queryLoaded, modelLoaded, failed, logId]) => ({
        loading,
        queryLoaded,
        modelLoaded,
        failed,
        logId,
      }))
    );

    // Subscribe to the combined observable and trigger assembleTreeData
    combined$.subscribe(() => this._queryExtension.assembleTreeData());
  }

  public async load() {
    this._failed$.next(false);
    this._queryLoaded$.next(false);
    this._modelLoaded$.next(false);
    this._loading$.next(true);

    // Fetch data
    const data = await this.fetch();
    if (!data) {
      this._loading$.next(false);
      return;
    }

    try {
      // load Model
      const projectModel =
        await this._sceneService!.viewer!.loader.loadQueryModel(this);
      this._projectModel = projectModel;

      this._modelLoaded$.next(true);
      this._loading$.next(false);
    } catch (error) {
      this._failed$.next(true);
      this._loading$.next(false);
    }

    console.log("end load");
  }

  private async fetch(): Promise<any | null> {
    // Fetch data
    try {
      const response = await axios.get(this._endpoint);
      this._rawData = response.data;

      this._queryLoaded$.next(true);
      return response.data;
    } catch (error) {
      this._failed$.next(true);

      return null;
    }
  }

  public async unload() {
    if (this._projectModel) {
      await this._sceneService.viewer!.entityControl.removeModel(
        this._projectModel!
      );
      this._projectModel = null;
    }

    this._queryLoaded$.next(false);
    this._modelLoaded$.next(false);
    this._failed$.next(false);
  }

  public async update(rawData: QueryRawData) {
    let needsReload = false;
    let newLogId = false;

    if (this._endpoint !== rawData.query.endpoint) {
      this._endpoint = rawData.query.endpoint;
      needsReload = true;
      newLogId = true;
    }

    if (this._name !== rawData.query.name) {
      this._name = rawData.query.name;
      newLogId = true;
    }

    if (needsReload) {
      this.unload();

      this._rawData = rawData;
      this._endpoint = rawData.query.endpoint;
      this._type = rawData.query.type;
      this._name = rawData.query.name;

      await this.load();
    } else {
      if (newLogId) {
        this._logId$.next(uuidv4());
      }
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

  public get name() {
    return this._name;
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

  public get queryLoaded$() {
    return this._queryLoaded$.asObservable();
  }

  public get modelLoaded$() {
    return this._modelLoaded$.asObservable();
  }

  public get failed$() {
    return this._failed$.asObservable();
  }

  public get treeItem(): QueryEntityTreeItem {
    return {
      id: `rest-${this._id}`,
      endpoint: this._endpoint,
      type: this._type,
      label: this._name,
      children: [],
      loading: this._loading$.value,
      queryLoaded: this._queryLoaded$.value,
      modelLoaded: this._modelLoaded$.value,
      failed: this._failed$.value,
      queryId: this._id,
    };
  }
}

export default QueryEntity;
