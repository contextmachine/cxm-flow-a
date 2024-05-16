import { Entity } from "../objects/entities/entity";
import { Group } from "../objects/entities/group";
import { ProjectModel } from "../objects/project-model";
import Viewer from "./viewer";
import * as RX from "rxjs";

export type EntitiesMap = Map<string, Entity>;
export type ProjectModelsMap = Map<string, ProjectModel>;

class EntityControl {
  private _viewer: Viewer;

  private _entities: EntitiesMap = new Map<string, Entity>();
  private _entitiesObservable = new RX.Subject<EntitiesMap>();

  private _projectModels: ProjectModelsMap = new Map<string, ProjectModel>();
  private _projectModelsObservable = new RX.Subject<ProjectModelsMap>();

  constructor(viewer: Viewer) {
    this._viewer = viewer;
  }

  public get entities(): EntitiesMap {
    return this._entities;
  }

  public get $entities(): RX.Observable<EntitiesMap> {
    return this._entitiesObservable;
  }

  public get projectModels(): ProjectModelsMap {
    return this._projectModels;
  }

  public get $projectModels(): RX.Observable<ProjectModelsMap> {
    return this._projectModelsObservable;
  }

  public get objectsOnCurrentLevel(): Entity[] {
    const currentGroup = this._viewer.selectionTool.currentGroup;
    if (currentGroup) {
      return currentGroup.children;
    } else {
      return [...this._projectModels.values()].map((x) => x.entity);
    }
  }

  private updateProjectObjects() {
    this._entitiesObservable.next(this._entities);
  }

  private updateProjectModels() {
    this._projectModelsObservable.next(this._projectModels);
  }

  private addProjectObject(po: Entity) {
    this._entities.set(po.id, po);
    po.children?.forEach((x) => this.addProjectObject(x));
  }

  private deleteProjectObject(po: Entity) {
    this._entities.delete(po.id);
    po.children?.forEach((x) => this.deleteProjectObject(x));
  }

  public addModel(model: ProjectModel) {
    model.objects.forEach((x) => this._viewer.addToScene(x));

    this._projectModels.set(model.id, model);
    this.addProjectObject(model.entity);

    this.updateProjectModels();
    this.updateProjectObjects();

    this._viewer.updateViewer();
  }

  public removeModel(model: ProjectModel) {
    model.objects.forEach((x) => this._viewer.removeFromScene(x));

    this._projectModels.delete(model.id);

    this.deleteProjectObject(model.entity);

    this.updateProjectModels();
    this.updateProjectObjects();

    this._viewer.updateViewer();
  }
}

export default EntityControl;
