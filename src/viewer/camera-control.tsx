import CameraControls from "camera-controls";
import * as RX from "rxjs";

import * as THREE from "three";
import Viewer from "./viewer";
import { ControlsViewState, ViewState } from "./camera-control.types";
import TWEEN from "@tweenjs/tween.js";
import { distinctByKeys } from "../utils";

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
              CameraControls.ACTION.OFFSET;
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
      this._viewer.projectSettingsService.$settings.subscribe((settings) => {
        console.log("alo", settings);
      })
    );

    this._subscriptions.push(
      distinctByKeys(this._viewer.projectSettingsService.$settings, [
        "camera_near",
        "camera_far",
        "camera_fov",
      ]).subscribe((settings) => {
        this.camera.near = settings.camera_near;
        this.camera.far = settings.camera_far;
        if (this.camera instanceof THREE.PerspectiveCamera) {
          this.camera.fov = settings.camera_fov;
        }
        this._controls.camera.updateProjectionMatrix();
        this._viewer.updateViewer();

        console.log("camera only");
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

  public setOrbit(point: THREE.Vector3) {
    this._controls.setOrbitPoint(point.x, point.y, point.z);
    this._viewer.updateViewer();
  }

  public fitObjects() {
    const selected = this._viewer.selectionTool.selected;

    if (selected.length > 0) {
      this.fitToObjects(selected.map((x) => x.bbox.box));
    } else {
      this.fitToScene();
    }
  }

  public fitToScene() {
    this.fitToObjects(
      [...this._viewer.entityControl.projectModels.values()].map(
        (x) => x.entity.bbox.box
      )
    );
    this._viewer.updateViewer();
  }

  public fitToBox(box: THREE.Box3) {
    const x = box.getBoundingSphere(new THREE.Sphere());

    this._controls.fitToSphere(x, false);

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

  public getState(): ControlsViewState {
    const _target = this.controls.getTarget(new THREE.Vector3(), true);
    const _position = this.controls.getPosition(new THREE.Vector3(), true);
    const _focalOffset = this.controls.getFocalOffset(
      new THREE.Vector3(),
      true
    );

    const _fov =
      this.camera instanceof THREE.PerspectiveCamera ? this.camera.fov : null;

    return {
      target: _target.toArray(),
      position: _position.toArray(),
      focalOffset: _focalOffset.toArray(),
      fov: _fov,
    };
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

  public async restoreState(
    viewState: ControlsViewState | ViewState,
    animate: boolean = false,
    duration: number = 400,
    options?: Record<string, any>
  ): Promise<void> {
    // Check if the viewState is a ControlsViewState or a ViewState
    const isControlsViewState = (state: any): state is ControlsViewState => {
      return (
        "position" in state &&
        "target" in state &&
        "focalOffset" in state &&
        "fov" in state
      );
    };

    if (!isControlsViewState(viewState)) return;

    if (animate) {
      return new Promise((resolve) => {
        const start = this.getState();
        const end = viewState;

        const tween = new TWEEN.Tween(start)
          .to(end, duration)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onStart(() => {
            this._tweenRunning = true;
            this._renderIfTweenRunning();
          })
          .onUpdate(() => {
            this.controls.setPosition(
              start.position[0],
              start.position[1],
              start.position[2]
            );
            this.controls.setTarget(
              start.target[0],
              start.target[1],
              start.target[2]
            );
            this.controls.setFocalOffset(
              start.focalOffset[0],
              start.focalOffset[1],
              start.focalOffset[2]
            );

            if (viewState.fov !== null) {
              (this.camera as THREE.PerspectiveCamera).fov =
                start.fov as number;
              this.camera.updateProjectionMatrix();
            }

            this._viewer.updateViewer();
          })
          .onComplete(() => {
            this.controls.setPosition(
              end.position[0],
              end.position[1],
              end.position[2]
            );
            this.controls.setTarget(
              end.target[0],
              end.target[1],
              end.target[2]
            );
            this.controls.setFocalOffset(
              end.focalOffset[0],
              end.focalOffset[1],
              end.focalOffset[2]
            );

            if (viewState.fov !== null) {
              (this.camera as THREE.PerspectiveCamera).fov = end.fov as number;
              this.camera.updateProjectionMatrix();
            }

            this._tweenRunning = false;
            this._viewer.updateViewer();
            resolve();
          });

        this._tweenRunning = true;
        this._renderIfTweenRunning();
        tween.start();
      });
    } else {
      // Instantly restore the state without animation
      this.controls.setPosition(
        viewState.position[0],
        viewState.position[1],
        viewState.position[2]
      );
      this.controls.setTarget(
        viewState.target[0],
        viewState.target[1],
        viewState.target[2]
      );
      this.controls.setFocalOffset(
        viewState.focalOffset[0],
        viewState.focalOffset[1],
        viewState.focalOffset[2]
      );

      if (viewState.fov !== null) {
        (this.camera as THREE.PerspectiveCamera).fov = viewState.fov;
        this.camera.updateProjectionMatrix();
      }

      this._viewer.updateViewer(); // Ensure the scene is refreshed

      return Promise.resolve();
    }
  }

  public dispose() {
    this._subscriptions.forEach((x) => x.unsubscribe());
    this._controls.dispose();
  }
}

function normalizeQuaternion(q: any) {
  return q.normalize();
}

function getShortestQuaternion(start: any, end: any) {
  const dot = start.dot(end);
  if (dot < 0.0) {
    end = new THREE.Quaternion(-end.x, -end.y, -end.z, -end.w); // Ensure shortest path
  }
  return end.normalize(); // Always normalize quaternions
}

function getCurrentZoom(camera: any, lookAt: any) {
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
    camera.quaternion
  );
  const point = camera.position.clone().add(direction);
  return camera.position.distanceTo(point);
}

export default CameraControl;
