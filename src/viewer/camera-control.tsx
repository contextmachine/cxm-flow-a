import CameraControls from "camera-controls";
import * as RX from "rxjs";

import * as THREE from "three";
import Viewer from "./viewer";

class CameraControl {

  private _subscriptions: RX.Unsubscribable[] = []

  private _controls: CameraControls;
  private _navigationSubject = new RX.Subject<boolean>();

  constructor(private _viewer: Viewer) {

    const width = window.innerWidth
    const height = window.innerHeight

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000000)
    camera.near = this._viewer.projectSettingsService.settings.camera_near
    camera.far = this._viewer.projectSettingsService.settings.camera_far
    camera.fov = this._viewer.projectSettingsService.settings.camera_fov

    camera.position.set(200, 200, 200)
    camera.lookAt(0, 0, 0)
    camera.up.set(0, 0, 1)

    const orbitCameraControls = new CameraControls(camera, _viewer.canvas);

    orbitCameraControls.dollyToCursor = true
    orbitCameraControls.dollySpeed = .4
    orbitCameraControls.draggingSmoothTime = 0
    orbitCameraControls.smoothTime = 0
    orbitCameraControls.mouseButtons.right = CameraControls.ACTION.ROTATE
    orbitCameraControls.mouseButtons.left = CameraControls.ACTION.NONE
    const filterNavigationMouseButtons = (e: MouseEvent) => e.button === 1 || e.button === 2

    this._subscriptions.push(RX.fromEvent<MouseEvent>(document, 'mousedown')
      .pipe(RX.filter(filterNavigationMouseButtons))
      .subscribe((e) => {
        if (e.shiftKey) {
          orbitCameraControls.mouseButtons.right = CameraControls.ACTION.TRUCK
        }
        this._navigationSubject.next(true)
      }))
    this._subscriptions.push(RX.fromEvent<MouseEvent>(document, 'mouseup')
      .pipe(RX.filter(filterNavigationMouseButtons))
      .subscribe(() => {
        this._navigationSubject.next(false)
        orbitCameraControls.mouseButtons.right = CameraControls.ACTION.ROTATE
      }))

    this._subscriptions.push(this._viewer.projectSettingsService.$settings.subscribe(() => {

      this.camera.near = this._viewer.projectSettingsService.settings.camera_near
      this.camera.far = this._viewer.projectSettingsService.settings.camera_far
      if (this.camera instanceof THREE.PerspectiveCamera) {
        this.camera.fov = this._viewer.projectSettingsService.settings.camera_fov
      }
      this._controls.camera.updateProjectionMatrix();
      this._viewer.updateViewer()

    }))

    this._controls = orbitCameraControls

  }


  public get $navigationSubject() {
    return this._navigationSubject;
  }

  public get cameraPosition() {
    return this._controls.getPosition(new THREE.Vector3())
  }

  public get camera() {
    return this._controls.camera;
  }

  public get controls() {
    return this._controls
  }

  public fitToScene() {
    this.fitToObjects(
      [...this._viewer.entityControl.projectModels.values()]
        .map((x) => x.entity.bbox.box)
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

  public dispose() {

    this._subscriptions.forEach(x => x.unsubscribe())
    this._controls.dispose()
  }


}

export default CameraControl
