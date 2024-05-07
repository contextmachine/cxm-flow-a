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

class ProjectSettingsService {

  private _paramNamespaceQuery: any;

  // Project settings
  private _projectSettings: ProjectSettings;
  private _projectMetadata: ProjectMetadata;
  private _projectAuthor: ProjectAuthor;

  // Param namespaces
  private _paramNamespaces: Map<string, ParamNamespace>;
  private _defaultParamNamespace: ParamNamespace | null = null;
  private _paramNamespacesLoaded: boolean = false;

  private _paramLibrary = new Map<string, ParamEntity>();

  // Subjects
  private _projectSettingsObservable = new RX.Subject<ProjectSettings>();
  private _paramLibraryObservable = new RX.Subject<Map<string, ParamEntity>>();

  private _wasMounted: boolean = false;

  constructor() {
    this._projectMetadata = new ProjectMetadata();
    this._projectSettings = new ProjectSettings(this);
    this._projectAuthor = new ProjectAuthor();

    this._paramNamespaces = new Map();
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
   * Cleans up resources and resets the service state.
   * This method is called to reset the service's internal state and dispose of resources.
   */
  public dispose() {


    this._projectMetadata = new ProjectMetadata();
    this._projectSettings = new ProjectSettings(this);


    this._paramNamespaces = new Map();
    this._defaultParamNamespace = null;
    this._paramNamespacesLoaded = false;


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



export default ProjectSettingsService;
