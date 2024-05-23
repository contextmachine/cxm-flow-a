import ExtensionEntity from "../../extension-service/entity/extension-entity";
import { ExtensionEntityInterface } from "../../extension-service/entity/extension-entity.types";
import {
  DetailedViewState,
  ViewState,
} from "@/src/viewer/camera-control.types";
import viewStates from "./data/view-states.json";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import CameraViewsDbService from "./camera-views-extension.db";
import Viewer from "@/src/viewer/viewer";

class CameraViewsExtensions
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public id: string;
  public name: string;

  private _totalPathLength: number; // Total distance between all view states
  private _currentPathLength: number; // Distance covered in the animation

  private _viewStates: DetailedViewState[];

  private _panel: HTMLElement | null;
  private _cameraViewsContainer: HTMLElement | null;
  private _addButton: HTMLElement | null;
  private _progressBar: HTMLElement | null;

  private _cameraSubscription: null | Map<string, any>;

  private _dbService: CameraViewsDbService;

  constructor(viewer: Viewer) {
    super(viewer);

    this._dbService = new CameraViewsDbService(this, viewer);

    this.id = uuidv4();
    this.name = "views";

    this._viewStates = this._formatData(viewStates.filter((_, i) => i !== 3));

    this._panel = null;
    this._cameraViewsContainer = null;
    this._addButton = null;
    this._progressBar = null;

    this._totalPathLength = 0;
    this._currentPathLength = 0;

    this._cameraSubscription = null;

    this._calculateTotalPathLength();
  }

  public load() {
    this._dbService.load();
    console.log("CameraViewsExtensions loaded");

    this._addCameraSubscription();
  }

  public unload() {
    console.log("CameraViewsExtensions unloaded");

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
  public restoreState(state: ViewState) {
    const cameraControls = this._viewer.controls;

    const viewState = this._formatViewState(state);

    cameraControls.restoreState(viewState as any, true, 300);
  }

  private _addCameraViewUI(type: "add" | "view", view?: DetailedViewState) {
    const cameraViewsContainer = this._cameraViewsContainer!;

    const cameraView = createCameraView(type);

    // Add event listener to restore the camera view
    if (type === "view") {
      cameraView.addEventListener("click", () => {
        const cameraControls = this._viewer.controls;
        cameraControls.restoreState(view!, true, 300);
      });
    }
    // Add event listener to add a new camera view
    else {
      cameraView.addEventListener("click", () => {
        this._dbService.addView();

        const cameraControls = this._viewer.controls;
        const viewState = cameraControls.getState();

        const detailedViewState: DetailedViewState = {
          ...viewState,
          id: `${this._viewStates.length + 1}`,
          name: `View ${this._viewStates.length + 1}`,
          pinPosition: viewState.position,
        };

        this._viewStates.push(detailedViewState);

        // Add the new camera view to the UI
        this._addCameraViewUI("view", detailedViewState);
      });
    }

    cameraViewsContainer.appendChild(cameraView);

    if (type === "view") {
      if (this._addButton) {
        try {
          cameraViewsContainer.removeChild(this._addButton);
        } catch (e) {
          console.log(e);
        }
      }

      this._addButton = this._addCameraViewUI("add");
    }

    return cameraView;
  }

  private async _playForward(duration: number = 2000, delay: number = 500) {
    const cameraControls = this._viewer.controls;

    let i = 0;

    this._currentPathLength = 0; // Reset the current progress

    for (const viewState of this._viewStates) {
      const from = this._viewStates[i];
      const to = this._viewStates[i + 1];

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
  }

  // Play through all view states in reverse order
  private async _playBackward(duration: number = 2000, delay: number = 500) {
    const cameraControls = this._viewer.controls;

    let cameraViewIndex = 0;

    for (const viewState of this._viewStates.slice().reverse()) {
      await cameraControls.restoreState(viewState, true, duration); // Animate the transition

      if (cameraViewIndex) {
        await this._delay(delay); // Wait before transitioning to the next state
      }

      cameraViewIndex++;
    }
  }

  // Helper function to create a delay
  private async _delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Create the UI components
  private _createUI() {
    const panel = this._panel;
    if (!panel) return;

    // Create a container for the UI components
    const uiContainer = createUIContainer();

    // Add the panel with camera views (red circles)
    const cameraViewsContainer = createCameraViewsContainer();
    this._cameraViewsContainer = cameraViewsContainer;

    this._viewStates.forEach((view) => this._addCameraViewUI("view", view));

    uiContainer.appendChild(cameraViewsContainer);

    // Add decorative icons (white circles)
    const whiteCirclesContainer = createNavigation();

    for (let i = 0; i < 2; i++) {
      const circle = createNavigationButton();

      if (i === 0) {
        circle.textContent = "< Play";

        circle.addEventListener("click", () => this._playBackward());
      } else {
        circle.textContent = "Play >";

        circle.addEventListener("click", () => this._playForward());
      }

      whiteCirclesContainer.appendChild(circle);
    }

    uiContainer.appendChild(whiteCirclesContainer);

    // Append the entire UI container to the panel
    panel.appendChild(uiContainer);
  }

  // Remove the UI components
  private _removeUI() {
    if (!this._panel) return;

    this._panel.innerHTML = "";
    this._panel = null;
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

  // Format the data to match the DetailedViewState type
  private _formatData(data: any): DetailedViewState[] {
    return data.map((item: any) => {
      return {
        ...item,
        position: new THREE.Vector3(
          item.position.x,
          item.position.y,
          item.position.z
        ),
        quaternion: new THREE.Quaternion(
          item.quaternion[0],
          item.quaternion[1],
          item.quaternion[2],
          item.quaternion[3]
        ),
        lookAt: new THREE.Vector3(item.lookAt.x, item.lookAt.y, item.lookAt.z),
        pinPosition: new THREE.Vector3(
          item.pinPosition.x,
          item.pinPosition.y,
          item.pinPosition.z
        ),
      };
    });
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

  public updateTitle(id: number, name: string) {
    this._dbService.updateView(id, { name });
  }

  public get dbService() {
    return this._dbService;
  }
}

function createUIContainer(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.gap = "8px";

  return container;
}

function createCameraViewsContainer(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.justifyContent = "space-between";
  container.style.gap = "40px";

  return container;
}

function createNavigation(): HTMLElement {
  const whiteCirclesContainer = document.createElement("div");
  whiteCirclesContainer.style.display = "flex";

  return whiteCirclesContainer;
}

function createNavigationButton(): HTMLElement {
  const circle = document.createElement("div");
  circle.style.width = "max-content";
  circle.style.padding = "0px 5px";
  circle.style.height = "20px";
  circle.style.backgroundColor = "white";
  circle.style.borderRadius = "2px";
  circle.style.border = "1px solid black";

  circle.style.cursor = "pointer";
  circle.style.display = "flex";
  circle.style.justifyContent = "center";
  circle.style.alignItems = "center";

  return circle;
}

function createCameraView(type: "add" | "view") {
  const cameraView = document.createElement("div");
  cameraView.style.width = "25px";
  cameraView.style.height = "25px";
  cameraView.style.backgroundColor = "lightcoral";
  cameraView.style.borderRadius = "50%";
  cameraView.style.border = "1px solid black";
  cameraView.style.display = "flex";
  cameraView.style.justifyContent = "center";
  cameraView.style.alignItems = "center";
  cameraView.style.cursor = "pointer";

  if (type === "add") {
    cameraView.style.backgroundColor = "#51A1FF";
    cameraView.style.color = "white";
    cameraView.style.fontSize = "18px";
    cameraView.style.border = "none";
    // add content '+'
    cameraView.textContent = "+";
  }

  return cameraView;
}

export default CameraViewsExtensions;
