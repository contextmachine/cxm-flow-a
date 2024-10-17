import ProjectMetadata from "./entities/project-metadata";

import ProjectAuthor from "./entities/project_author";
import * as RX from "rxjs";
import {
  ParamBoolean,
  ParamEntity,
  ParamEnum,
  ParamNumber,
  ParamRange,
  ParamString,
} from "./entities/params";
import { gql } from "@apollo/client";
import { getGQLData, mutateGQLData } from "@/src/data-access/utils";
import Viewer from "@/src/viewer/viewer";

interface ProjectSettings {
  camera_near: number;
  camera_far: number;
  camera_fov: number;
  background_color: string;
  param_namespace: string;
}

class ProjectSettingsService {
  private _paramNamespaceQuery: any;
  private _subscriptions: RX.Unsubscribable[] = [];

  private _viewer: Viewer;

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

  constructor(viewer: Viewer) {
    this._viewer = viewer;
    this._projectMetadata = new ProjectMetadata();
    this._projectSettings = this.initProjectSettings();
    this._projectAuthor = new ProjectAuthor();

    this._paramNamespaces = new Map();

    this._subscriptions.push(
      this._viewer.sceneService.$sceneMetadata
        .pipe(RX.first())
        .subscribe((e) => {
          this.fetchProjectSettings();
        })
    );

    this._projectSettingsObservable
      .pipe(RX.debounceTime(2000))
      .subscribe(() => {
        this.postProjectSettings();
      });
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

  private initProjectSettings() {
    const settings: ProjectSettings = {
      camera_near: 0.001,
      camera_far: 100,
      camera_fov: 75,
      background_color: "#ecf4f3",
      param_namespace: "none",
    };

    return settings;
  }

  private async fetchProjectSettings() {
    const query = gql`
      query GetSettings($id: Int!) {
        appv3_scene_by_pk(id: $id) {
          settings
        }
      }
    `;

    const variables = {
      id: this._viewer.sceneService.sceneId,
    };

    const response = await getGQLData(query, variables);
    const settings = response.data.appv3_scene_by_pk.settings;

    this._projectSettings = {
      ...this._projectSettings,
      ...settings,
    };
    this._projectSettingsObservable.next({ ...this._projectSettings });
  }

  public updateProjectSettings(settings: Partial<ProjectSettings>) {
    this._projectSettings = {
      ...this._projectSettings,
      ...settings,
    };
    this._projectSettingsObservable.next({ ...this._projectSettings });
  }

  private postProjectSettings() {
    const mutation = gql`
      mutation UpdateSettings($id: Int!, $settings: jsonb!) {
        update_appv3_scene_by_pk(
          pk_columns: { id: $id }
          _set: { settings: $settings }
        ) {
          id
        }
      }
    `;

    const variables = {
      id: this._viewer.sceneService.sceneId,
      settings: { ...this._projectSettings },
    };

    const response = mutateGQLData(mutation, variables);
  }

  /**
   * Cleans up resources and resets the service state.
   * This method is called to reset the service's internal state and dispose of resources.
   */
  public dispose() {
    this._subscriptions.forEach((x) => x.unsubscribe());
    this._projectMetadata = new ProjectMetadata();

    this._paramNamespaces = new Map();
    this._defaultParamNamespace = null;
    this._paramNamespacesLoaded = false;
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
