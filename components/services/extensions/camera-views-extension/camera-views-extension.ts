import ExtensionEntity from "../../extension-service/entity/extension-entity";
import { ExtensionEntityInterface } from "../../extension-service/entity/extension-entity.types";
import {
  DetailedViewState,
  ViewState,
} from "@/src/viewer/camera-control.types";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import CameraViewsDbService, {
  ViewStateItem,
} from "./camera-views-extension.db";
import { BehaviorSubject, Subscription } from "rxjs";
import Viewer from "@/src/viewer/viewer";

class CameraViewsExtensions
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public id: string;
  public name: string;

  private _totalPathLength: number; // Total distance between all view states
  private _currentPathLength: number; // Distance covered in the animation

  private _viewStates: ViewState[];
  private _viewStatesSub$: Subscription | null;

  private _cameraSubscription: null | Map<string, any>;

  private _dbService: CameraViewsDbService;

  private _isPlaying$ = new BehaviorSubject<boolean>(false);
  private _playingViewIndex$ = new BehaviorSubject<number | null>(null);

  constructor(viewer: Viewer) {
    super(viewer);

    this._dbService = new CameraViewsDbService(this, viewer);

    this.id = uuidv4();
    this.name = "views";

    this._viewStates = [];
    this._viewStatesSub$ = null;

    this._totalPathLength = 0;
    this._currentPathLength = 0;

    this._cameraSubscription = null;

    this._calculateTotalPathLength();
  }

  public load() {
    this._dbService.load();
    console.log("CameraViewsExtensions loaded");

    this._addCameraSubscription();

    if (this._viewStatesSub$) this._viewStatesSub$.unsubscribe();
    this._viewStatesSub$ = this._dbService.animationViews$!.subscribe(
      (views) => {
        const states = views
          .map((view) => view.state)
          .filter((a) => a)
          .map((a) => this._formatViewState(a));

        this._viewStates = states;
      }
    );
  }

  public unload() {
    console.log("CameraViewsExtensions unloaded");

    if (this._viewStatesSub$) this._viewStatesSub$.unsubscribe();

    this._removeCameraSubscription();
    this._dbService.unload();
  }

  private _calculateTotalPathLength() {
    let totalLength = 0;

    for (let i = 0; i < this._viewStates.length - 1; i++) {
      const from = this._viewStates[i].position;
      const to = this._viewStates[i + 1].position;

      totalLength += from.distanceTo(to); // Sum the distances between each state
    }

    this._totalPathLength = totalLength;
  }

  public addView() {
    return this._dbService.addView();
  }

  public deleteView(id: number) {
    return this._dbService.deleteView(id);
  }

  // Save the current camera state
  public restoreState(state: ViewState, animate: boolean, duration?: number) {
    const cameraControls = this._viewer!.controls;

    const viewState = this._formatViewState(state);

    cameraControls.restoreState(viewState as any, animate, duration || 300);
  }

  public async playForward(duration: number = 2000, delay: number = 500) {
    this._isPlaying$.next(true);

    const cameraControls = this._viewer!.controls;

    let i = 0;

    this._currentPathLength = 0; // Reset the current progress

    for (const viewState of this._viewStates) {
      const from = this._viewStates[i];
      const to = this._viewStates[i + 1];

      this._playingViewIndex$.next(i);

      // Restore the state and track the progress
      await cameraControls.restoreState(viewState, true, duration, {
        update: () => {
          // Update the progress bar
          //TODO

          return;
        },
      }); // Animate the transition

      if (to) {
        this._currentPathLength += from.position.distanceTo(to.position); // Update progress
      }

      const progressPercentage =
        (this._currentPathLength / this._totalPathLength) * 100; // Calculate percentage
      console.log(`Progress: ${progressPercentage.toFixed(2)}%`);

      if (i) {
        await this._delay(delay); // Wait before transitioning to the next state
      }

      i++;
    }

    this._playingViewIndex$.next(null);
    this._isPlaying$.next(false);
  }

  // Play through all view states in reverse order
  private async _playBackward(duration: number = 2000, delay: number = 500) {
    this._isPlaying$.next(true);
    const cameraControls = this._viewer.controls;

    let cameraViewIndex = 0;

    for (const viewState of this._viewStates.slice().reverse()) {
      await cameraControls.restoreState(viewState, true, duration); // Animate the transition

      if (cameraViewIndex) {
        await this._delay(delay); // Wait before transitioning to the next state
      }

      cameraViewIndex++;
    }

    this._isPlaying$.next(false);
  }

  // Helper function to create a delay
  private async _delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private _formatViewState(viewState: any): any {
    return {
      ...viewState,
      position: new THREE.Vector3(
        viewState.position.x,
        viewState.position.y,
        viewState.position.z
      ),
      quaternion: new THREE.Quaternion(
        viewState.quaternion[0],
        viewState.quaternion[1],
        viewState.quaternion[2],
        viewState.quaternion[3]
      ),
      lookAt: new THREE.Vector3(
        viewState.lookAt.x,
        viewState.lookAt.y,
        viewState.lookAt.z
      ),
    };
  }

  /// render the camera views pins within the scene
  private _addCameraSubscription() {
    const cameraControls = this._viewer.controls.controls;

    this._cameraSubscription = new Map();

    const update = cameraControls.addEventListener("update", (e) => {
      const camera = cameraControls.camera;
    });
    this._cameraSubscription.set("update", update);

    const control = cameraControls.addEventListener("control", (e) => {
      const camera = cameraControls.camera;
    });
    this._cameraSubscription.set("control", control);

    const sleep = cameraControls.addEventListener("sleep", (e) => {
      const camera = cameraControls.camera;
    });
    this._cameraSubscription.set("sleep", sleep);

    const wake = cameraControls.addEventListener("wake", (e) => {
      const camera = cameraControls.camera;
    });
    this._cameraSubscription.set("wake", wake);
  }

  private _removeCameraSubscription() {
    if (!this._cameraSubscription) return;

    this._cameraSubscription.forEach((value, key: any) => {
      this._viewer.controls.controls.removeEventListener(key, value);
    });

    this._cameraSubscription = null;
  }

  public get allViews$() {
    return this._dbService.allViews$;
  }

  public get animationViews$() {
    return this._dbService.animationViews$;
  }

  public get isPlaying$() {
    return this._isPlaying$;
  }

  public get playingViewIndex$() {
    return this._playingViewIndex$;
  }

  public async updateTitle(id: number, name: string) {
    await this._dbService.updateView(id, { name });
  }

  public async updateViewsOrder(
    views: ViewStateItem[],
    parentType: "animation" | "all"
  ) {
    await this._dbService.updateViewsOrder(views, parentType);
  }

  public async updateAnimationViews(views: ViewStateItem[]) {
    await this._dbService.updateAnimationViews(views);
  }

  public get dbService() {
    return this._dbService;
  }
}

export default CameraViewsExtensions;
