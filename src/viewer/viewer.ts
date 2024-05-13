import * as THREE from "three";
import * as RX from "rxjs";
import CameraControls from "camera-controls";
import Stats from "three/examples/jsm/libs/stats.module";

import ComposerPipe from "./composer-pipe";
import CameraControl from "./camera-control";
import Loader from "./loader/loader";
import EntityControl from "./entity-control";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { appLogicError, assertDefined } from "@/utils";
import ProjectSettingsService from "../services/project-settings/project-settings-service";
import SelectionControl from "./selection/selection-tool";
import SceneService from "@/components/services/scene-service/scene-service";

CameraControls.install({ THREE: THREE });

export class Viewer {
  private _rootElement: HTMLDivElement | undefined;
  private _scene = new THREE.Scene();

  private _sceneService: SceneService;

  private _renderer: THREE.WebGLRenderer;
  private _stats: Stats;
  private _showRendererInfo = false;
  private _renderingEnabled = true;
  private _isInitialized = false;
  private _renderNeeded = false;

  private _composerPerspective: ComposerPipe;

  private _subscriptions: RX.Unsubscribable[] = [];
  private _clock = new THREE.Clock();

  // SERVICES
  private _projectSettingsService: ProjectSettingsService;
  private _cameraService: CameraControl;
  private _entityControl: EntityControl;
  private _selectionControl: SelectionControl;
  private _loader: Loader;
  // private _taggingService: TaggingService

  private _lights = [
    new THREE.DirectionalLight(0xeeeeee, 1),
    new THREE.AmbientLight(0xffffff, 3),
  ];

  private _client: ApolloClient<NormalizedCacheObject> | undefined;

  constructor(sceneService: SceneService) {
    this._sceneService = sceneService;

    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });

    this._stats = new Stats();

    this._projectSettingsService = new ProjectSettingsService();
    this._cameraService = new CameraControl(this);
    this._composerPerspective = new ComposerPipe(
      this._renderer,
      this._cameraService.camera,
      this._scene
    );

    this._entityControl = new EntityControl(this);
    // this._taggingService = new TaggingService(this)

    this._scene.background = new THREE.Color(
      this._projectSettingsService.settings.background_color
    );
    this._lights.forEach((x) => this._scene.add(x));

    this._entityControl = new EntityControl(this);
    this._loader = new Loader(this);

    this._selectionControl = new SelectionControl(this);

    // Subscribe
    this._subscriptions.push(
      RX.fromEvent(window, "resize").subscribe(() => this.resize())
    );
    this._subscriptions.push(
      this._projectSettingsService.$settings.subscribe((settings) => {
        this._scene.background = new THREE.Color(settings.background_color);
        this.updateViewer();
      })
    );
  }

  public get scene(): THREE.Scene {
    return this._scene;
  }

  public get canvas(): HTMLCanvasElement {
    return this._renderer.domElement;
  }

  public get loader(): Loader {
    return this._loader;
  }

  public get sceneService(): SceneService {
    return this._sceneService;
  }

  // public get taggingService(): TaggingService {
  //     return this._taggingService;
  // }

  public get selectionTool(): SelectionControl {
    return this._selectionControl;
  }

  public get entityControl(): EntityControl {
    return this._entityControl;
  }

  public get controls(): CameraControl {
    return this._cameraService;
  }

  public get projectSettingsService(): ProjectSettingsService {
    return this._projectSettingsService;
  }

  public get loader(): Loader {
    return this._loader;
  }

  public get camera() {
    return this._cameraService.camera;
  }

  private get activeComposer(): ComposerPipe {
    return this._composerPerspective;
  }

  private resize() {
    const rootElement = assertDefined(this._rootElement);
    const width = rootElement.clientWidth;
    const height = rootElement.clientHeight;
    this._renderer.setSize(width, height);
    this._composerPerspective.resize();
    this._renderNeeded = true;
  }

  public init(rootElement: HTMLDivElement) {
    console.log("init");
    if (this._isInitialized) throw appLogicError("Viewer already initialized");

    const width = window.innerWidth;
    const height = window.innerHeight;

    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    this._rootElement = rootElement;

    this.resize();
    rootElement.appendChild(this.canvas);
    this.canvas.tabIndex = 1;

    // FPS stats element
    if (this._stats) {
      this._stats.showPanel(0);
      document.body.appendChild(this._stats.dom);
      this._stats.dom.style.right = "0";
      this._stats.dom.style.left = "";
      this._stats.dom.style.marginRight = "300px";
      this._stats.begin();
    }

    this._isInitialized = true;
    this.activeComposer.composer.render();
    this._render();
  }

  public updateViewer() {
    this._renderNeeded = true;
  }

  public addToScene(object: THREE.Object3D) {
    if (this._scene && !this._scene.getObjectById(object.id)) {
      this._scene.add(object);
    }
  }

  public removeFromScene(object: THREE.Object3D) {
    if (this._scene) {
      this._scene.remove(object);
    }
  }

  private _render = () => {
    const clockDelta = this._clock.getDelta();
    const hasControlsUpdated = this._cameraService.controls.update(clockDelta);

    const renderNeeded = hasControlsUpdated || this._renderNeeded;
    if (this._showRendererInfo) {
      this._showRendererInfo = false;
      const data = {
        memory: this._renderer.info.memory,
        programs: this._renderer.info.programs,
      };
    }
    if (this._renderingEnabled) {
      if (renderNeeded) {
        this.activeComposer.composer.renderer.clear();
        this.activeComposer?.composer.render();
      }
      this._renderer.info.reset();
      if (this._stats) this._stats.update();
      window.requestAnimationFrame(this._render);
    }

    this._renderNeeded = false;
  };

  public dispose(): void {
    console.log("dispose viewer");

    this.loader.dispose();
    document.body.removeChild(this._stats.dom);
    // this.selectionService.dispose();

    this._subscriptions.forEach((x) => x.unsubscribe());

    this._renderingEnabled = false;

    if (this._rootElement) {
      const canvas = this._renderer.domElement;
      this._rootElement.removeChild(canvas);
    }
    this._renderer.dispose();
    this._cameraService.dispose();
  }
}

export default Viewer;
