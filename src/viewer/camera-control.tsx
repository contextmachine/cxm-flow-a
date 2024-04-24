import CameraControls from "camera-controls";
import * as RX from "rxjs";

import * as THREE from "three";
import Viewer from "./viewer";
import { ViewState } from "./camera-control.types";
import TWEEN from "@tweenjs/tween.js";

class CameraControl {
  private _subscriptions: RX.Unsubscribable[] = [];

  private _controls: CameraControls;
  private _navigationSubject = new RX.Subject<boolean>();

  private _tweenRunning = false;

  constructor(private _viewer: Viewer) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000000);
    camera.near = this._viewer.projectSettingsService.settings.camera_near;
    camera.far = this._viewer.projectSettingsService.settings.camera_far;
    camera.fov = this._viewer.projectSettingsService.settings.camera_fov;

    camera.position.set(200, 200, 200);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const orbitCameraControls = new CameraControls(camera, _viewer.canvas);

    orbitCameraControls.dollyToCursor = true;
    orbitCameraControls.dollySpeed = 0.4;
    orbitCameraControls.draggingSmoothTime = 0;
    orbitCameraControls.smoothTime = 0;
    orbitCameraControls.mouseButtons.right = CameraControls.ACTION.ROTATE;
    orbitCameraControls.mouseButtons.left = CameraControls.ACTION.NONE;
    const filterNavigationMouseButtons = (e: MouseEvent) =>
      e.button === 1 || e.button === 2;

    this._subscriptions.push(
      RX.fromEvent<MouseEvent>(document, "mousedown")
        .pipe(RX.filter(filterNavigationMouseButtons))
        .subscribe((e) => {
          if (e.shiftKey) {
            orbitCameraControls.mouseButtons.right =
              CameraControls.ACTION.TRUCK;
          }
          this._navigationSubject.next(true);
        })
    );
    this._subscriptions.push(
      RX.fromEvent<MouseEvent>(document, "mouseup")
        .pipe(RX.filter(filterNavigationMouseButtons))
        .subscribe(() => {
          this._navigationSubject.next(false);
          orbitCameraControls.mouseButtons.right = CameraControls.ACTION.ROTATE;
        })
    );

    this._subscriptions.push(
      this._viewer.projectSettingsService.$settings.subscribe(() => {
        this.camera.near =
          this._viewer.projectSettingsService.settings.camera_near;
        this.camera.far =
          this._viewer.projectSettingsService.settings.camera_far;
        if (this.camera instanceof THREE.PerspectiveCamera) {
          this.camera.fov =
            this._viewer.projectSettingsService.settings.camera_fov;
        }
        this._controls.camera.updateProjectionMatrix();
        this._viewer.updateViewer();
      })
    );

    this._controls = orbitCameraControls;
  }

  public get $navigationSubject() {
    return this._navigationSubject;
  }

  public get cameraPosition() {
    return this._controls.getPosition(new THREE.Vector3());
  }

  public get camera() {
    return this._controls.camera;
  }

  public get controls() {
    return this._controls;
  }

  public fitToScene() {
    this.fitToObjects(
      [...this._viewer.entityControl.projectModels.values()].map(
        (x) => x.projectObject.bbox.box
      )
    );
    this._viewer.updateViewer();
  }

  public fitToBox(box: THREE.Box3) {
    this._controls.fitToBox(box, true, {
      cover: false,
      paddingLeft: 0.1,
      paddingRight: 0.1,
      paddingBottom: 0.1,
      paddingTop: 0.1,
    });

    // Compute the box's size and adjust the camera's far value
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z);

    const cameraPosition = this._controls.camera.position;
    const boxCenter = new THREE.Vector3();
    box.getCenter(boxCenter);

    const distanceToBoxCenter = cameraPosition.distanceTo(boxCenter);

    const far = distanceToBoxCenter + maxDimension / 2;
    this._controls.camera.far = Math.max(this._controls!.camera.far, far);

    this._controls.camera.updateProjectionMatrix();
    this._viewer.updateViewer();
  }

  public fitToObjects(boxes: THREE.Box3[]) {
    const bbox = new THREE.Box3();
    boxes.forEach((box) => {
      bbox.union(box);
    });

    this.fitToBox(bbox);
  }

  public getState(): ViewState {
    const position = this.cameraPosition;
    const quaternion = this.camera.quaternion.clone();

    const lookAtDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      quaternion
    );
    const lookAt = position.clone().add(lookAtDirection);

    const zoom = position.distanceTo(lookAt);

    const cameraType =
      this.camera instanceof THREE.PerspectiveCamera
        ? "perspective"
        : "orthographic";

    const fieldOfView =
      this.camera instanceof THREE.PerspectiveCamera ? this.camera.fov : null;

    const view: ViewState = {
      position,
      quaternion,
      lookAt,
      fieldOfView,
      zoom,
      cameraType,
    };

    return view;
  }

  private _renderIfTweenRunning() {
    if (this._tweenRunning) {
      requestAnimationFrame(() => {
        TWEEN.update();
        this._viewer.updateViewer(); // Render the scene
        this._renderIfTweenRunning(); // Keep checking if the tween is still running
      });
    }
  }

  public restoreState(
    viewState: ViewState,
    animate: boolean = false,
    duration: number = 2000
  ) {
    if (animate) {
      // Animate from the current camera state to the new state
      const currentPosition = this.camera.position.clone();
      const currentQuaternion = this.camera.quaternion.clone();

      // Assume the camera's current position is currentPosition
      // Assume the camera's quaternion/orientation is currentQuaternion

      // Start with a forward direction vector
      const forwardDirection = new THREE.Vector3(0, 0, -1);

      // Apply the quaternion to get the new look-at direction
      const lookAtDirection = forwardDirection
        .clone()
        .applyQuaternion(currentQuaternion);

      // To calculate the zoom or distance between the camera and its look-at point
      const lookAtPoint = currentPosition.clone().add(lookAtDirection);
      const currentZoom = currentPosition.distanceTo(lookAtPoint);

      // Now you can use currentZoom to simulate the dolly distance or camera zoom level

      const start = {
        position: currentPosition,
        quaternion: currentQuaternion,
        zoom: currentZoom,
      };

      const end = {
        position: viewState.position,
        quaternion: viewState.quaternion,
        zoom: viewState.zoom,
      };

      console.log("Start", start);
      console.log("End", end);

      const tween = new TWEEN.Tween(start)
        .to(end, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onStart(() => {
          this._tweenRunning = true; // Mark that the tween is running
          this._renderIfTweenRunning(); // Start the rendering loop if not running already
        })
        .onUpdate(() => {
          console.log("Tween update", start);

          this.camera.position.copy(start.position);
          this.camera.quaternion.copy(start.quaternion);

          if (viewState.cameraType === "perspective") {
            this.camera.updateProjectionMatrix();
          }

          if (typeof start.zoom === "number") {
            const lookAtPoint = viewState.lookAt;
            const targetX = lookAtPoint.x;
            const targetY = lookAtPoint.y;
            const targetZ = lookAtPoint.z;

            this.controls.setLookAt(
              start.position.x,
              start.position.y,
              start.position.z,
              targetX,
              targetY,
              targetZ,
              false
            );
            this.controls.dollyTo(start.zoom, false);
          }

          this.controls.update(1 / 60); // Default delta for smooth update
          this._viewer.updateViewer(); // Ensure the scene is refreshed
        })
        .onComplete(() => {
          this._tweenRunning = false;
          this._viewer.updateViewer(); // Ensure the scene is refreshed
        });

      tween.start(); // Start the animation
    } else {
      // Instantly restore the state without animation
      this.camera.position.copy(viewState.position);
      this.camera.quaternion.copy(viewState.quaternion);

      if (viewState.cameraType === "perspective" && viewState.fieldOfView) {
        (this.camera as any).fov = viewState.fieldOfView;
        this.camera.updateProjectionMatrix();
      }

      if (typeof viewState.zoom === "number") {
        const lookAtPoint = viewState.lookAt;
        this.controls.setLookAt(
          viewState.position.x,
          viewState.position.y,
          viewState.position.z,
          lookAtPoint.x,
          lookAtPoint.y,
          lookAtPoint.z,
          false
        );
        this.controls.dollyTo(viewState.zoom, false);
      }

      this.controls.update(1 / 60); // Default delta

      this._viewer.updateViewer(); // Ensure the scene is refreshed
    }
  }

  public dispose() {
    this._subscriptions.forEach((x) => x.unsubscribe());
    this._controls.dispose();
  }
}

export default CameraControl;
