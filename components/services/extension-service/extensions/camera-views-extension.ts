import { Scene } from "three";
import ExtensionEntity from "../entity/extension-entity";
import SceneService from "../../scene-service/scene-service";
import { ExtensionEntityInterface } from "../entity/extension-entity.types";
import { DetailedViewState } from "@/src/viewer/camera-control.types";
import viewStates from "./data/view-states.json";
import * as THREE from "three";
import { update } from "@tweenjs/tween.js";

class CameraViewsExtensions
  extends ExtensionEntity
  implements ExtensionEntityInterface
{
  public name: string;

  private _totalPathLength: number; // Total distance between all view states
  private _currentPathLength: number; // Distance covered in the animation

  private _viewStates: DetailedViewState[];

  private _panel: HTMLElement | null;
  private _cameraViewsContainer: HTMLElement | null;
  private _addButton: HTMLElement | null;
  private _progressBar: HTMLElement | null;

  constructor() {
    super();

    this.name = "CameraViewsExtensions";

    this._viewStates = this._formatData(viewStates.filter((_, i) => i !== 3));

    this._panel = null;
    this._cameraViewsContainer = null;
    this._addButton = null;
    this._progressBar = null;

    this._totalPathLength = 0;
    this._currentPathLength = 0;

    this._calculateTotalPathLength();
  }

  public load() {
    console.log("CameraViewsExtensions loaded");

    this._panel = document.getElementById("footer-options-panel");
    this._createUI();

    this._addCameraSubscription();
  }

  public unload() {
    console.log("CameraViewsExtensions unloaded");

    this._panel = null;
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

  private _addCameraViewUI(type: "add" | "view", view?: DetailedViewState) {
    const cameraViewsContainer = this._cameraViewsContainer!;

    const cameraView = createCameraView(type);

    // Add event listener to restore the camera view
    if (type === "view") {
      cameraView.addEventListener("click", () => {
        const sceneService = this._sceneService!;
        const cameraControls = sceneService.viewer!.controls;
        cameraControls.restoreState(view!, true, 300);
      });
    }
    // Add event listener to add a new camera view
    else {
      cameraView.addEventListener("click", () => {
        const sceneService = this._sceneService!;
        const viewer = sceneService.viewer!;
        const cameraControls = viewer.controls;
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
    const sceneService = this._sceneService!;
    const cameraControls = sceneService.viewer!.controls;

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
    const sceneService = this._sceneService!;
    const cameraControls = sceneService.viewer!.controls;

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
    const cameraControls = this._sceneService!.viewer!.controls.controls;

    console.log("cameraControls", cameraControls);

    cameraControls.addEventListener("update", (e) => {
      console.log("a");

      const camera = cameraControls.camera;

      console.log(camera);
    });

    cameraControls.addEventListener("control", (e) => {
      console.log("b");

      const camera = cameraControls.camera;

      console.log(camera);
    });

    cameraControls.addEventListener("sleep", (e) => {
      console.log("c");

      const camera = cameraControls.camera;

      console.log(camera);
    });

    cameraControls.addEventListener("wake", (e) => {
      console.log("d");

      const camera = cameraControls.camera;

      console.log(camera);
    });
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
