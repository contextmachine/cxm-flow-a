import { ProjectObject } from "../objects/entities/project-object";
import { ProjectModel } from "../objects/project-model";
import Viewer from "./viewer";
import * as RX from 'rxjs'

export type ProjectObjectsMap = Map<string, ProjectObject>;
export type ProjectModelsMap = Map<string, ProjectModel>;

class EntityControl {

    private _viewer: Viewer

    private _projectObjects: ProjectObjectsMap = new Map<string, ProjectObject>();
    private _projectObjectsObservable = new RX.Subject<ProjectObjectsMap>();

    private _projectModels: ProjectModelsMap = new Map<string, ProjectModel>();
    private _projectModelsObservable = new RX.Subject<ProjectModelsMap>();

    constructor(viewer: Viewer) {

        this._viewer = viewer

    }

    public get projectObjects(): ProjectObjectsMap {
        return this._projectObjects;
    }

    public get $projectObjects(): RX.Observable<ProjectObjectsMap> {
        return this._projectObjectsObservable;
    }

    public get projectModels(): ProjectModelsMap {
        return this._projectModels;
    }

    public get $projectModels(): RX.Observable<ProjectModelsMap> {
        return this._projectModelsObservable;
    }

    private updateProjectObjects() {
        this._projectObjectsObservable.next(this._projectObjects)
    }

    private updateProjectModels() {
        this._projectModelsObservable.next(this._projectModels)
    }

    private addProjectObject(po: ProjectObject) {
        this._projectObjects.set(po.id, po);
        po.children.forEach((x) => this.addProjectObject(x));
    }

    private deleteProjectObject(po: ProjectObject) {
        this._projectObjects.delete(po.id);
        po.children.forEach((x) => this.deleteProjectObject(x));
    }

    public addModel(model: ProjectModel) {
        model.projectObject.objects.forEach((x) => this._viewer.addToScene(x));

        this._projectModels.set(model.id, model);
        this.addProjectObject(model.projectObject);

        this.updateProjectModels();
        this.updateProjectObjects();

        this._viewer.updateViewer();
    }

    public removeModel(model: ProjectModel) {
        model.projectObject.objects.forEach((x) => this._viewer.removeFromScene(x));

        this._projectModels.delete(model.id);

        this.deleteProjectObject(model.projectObject);

        this.updateProjectModels();
        this.updateProjectObjects();

        this._viewer.updateViewer();
    }


}

export default EntityControl