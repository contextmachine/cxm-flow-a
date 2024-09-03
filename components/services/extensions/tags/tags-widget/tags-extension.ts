import ExtensionEntity from "@/components/services/extension-service/entity/extension-entity";
import { ProductsDto } from "@/components/services/product-service/products.types";
import Viewer from "@/src/viewer/viewer";
import {
  BehaviorSubject,
  debounceTime,
  fromEvent,
  merge,
  Observable,
  Subscription,
} from "rxjs";
import { Tag, TagCategory } from "./tags-extension.types";
import CameraControl from "@/src/viewer/camera-control";
import * as THREE from "three";
import EntityControl from "@/src/viewer/entity-control";
import { Entity } from "@/src/objects/entities/entity";

class TagsExtension extends ExtensionEntity {
  private _tagSvg: SVGSVGElement | undefined;
  private _scene: THREE.Scene;

  private _cameraControl: CameraControl;
  private _entityControl: EntityControl;

  private _tags: Map<string, Tag> = new Map<string, Tag>();
  private _categories: Map<string, TagCategory> = new Map<
    string,
    TagCategory
  >();

  public $categories = new BehaviorSubject<Map<string, TagCategory>>(
    this._categories
  );

  // New state to track the SVG elements
  private _tagElements: Map<
    string,
    { text: SVGTextElement; rect: SVGRectElement }
  > = new Map();

  private _activeCategory: TagCategory | undefined;
  public $activeCategory = new BehaviorSubject<TagCategory | undefined>(
    undefined
  );

  private _entityControl$: Subscription | undefined;
  private _cameraControl$: Subscription | undefined;

  public labelsVisible$ = new BehaviorSubject<boolean>(true);
  public themingColorsApplied$ = new BehaviorSubject<boolean>(true);

  constructor(viewer: Viewer, productData: ProductsDto) {
    super(viewer);
    this.name = "tags-widget";
    this.id = productData.id;

    this._scene = this._viewer.scene;
    this._cameraControl = this._viewer.controls;
    this._entityControl = this._viewer.entityControl;

    this._tagSvg = this._viewer.tagCanvas;
  }

  public updateTags = (entities: Map<string, Entity>) => {
    // get tall categories
    entities.forEach((entity) => {
      const props = entity.props;
      if (props) {
        Array.from(props.keys()).forEach((key) => {
          this._categories.set(key, { name: key });
        });
      }
    });

    console.log("updateTags", entities);

    if (!this._activeCategory && this._categories.size > 0) {
      this._activeCategory = Array.from(this._categories.values())[0];
    }

    this.$categories.next(this._categories);
    this.$activeCategory.next(this._activeCategory);
    this._tags.clear();

    if (!this._activeCategory) return;

    // get all tags based on active category
    entities.forEach((entity) => {
      const props = entity.props;
      if (props) {
        const tag = props.get(this._activeCategory!.name);
        if (tag) {
          this._tags.set(entity.id, {
            id: entity.id,
            label: tag,
            position: entity.center,
          });
        }
      }
    });

    // Render tags as badges on the SVG canvas
    this.renderTags();
  };

  private renderTags() {
    const tagSvg = document.getElementById("tags") as any as SVGSVGElement;
    if (tagSvg) {
      this._tagSvg = tagSvg;
    }

    if (!this._tagSvg) return;

    // Clear previous tags
    while (this._tagSvg.firstChild) {
      this._tagSvg.removeChild(this._tagSvg.firstChild);
    }

    // Render each tag as an SVG element
    this._tags.forEach((tag) => {
      const { position, label } = tag;

      // Convert 3D position to 2D screen position
      const screenPosition = this.toScreenPosition(position);

      // Create an SVG text element for the tag label
      const textElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      textElement.setAttribute("x", `${screenPosition.x}`);
      textElement.setAttribute("y", `${screenPosition.y}`);
      textElement.setAttribute("fill", "white");
      textElement.setAttribute("font-size", "10");
      textElement.textContent = label;

      // Append the text element to the SVG first
      this._tagSvg!.appendChild(textElement);

      // Now that the text element is in the DOM, get its bounding box
      const textBox = textElement.getBBox();

      // Optional: Add a background for the text (badge)
      const rectElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      const padding = 4;
      rectElement.setAttribute("x", `${textBox.x - padding}`);
      rectElement.setAttribute("y", `${textBox.y - padding}`);
      rectElement.setAttribute("width", `${textBox.width + 2 * padding}`);
      rectElement.setAttribute("height", `${textBox.height + 2 * padding}`);
      rectElement.setAttribute("fill", "black");
      rectElement.setAttribute("fill-opacity", "0.8");
      //rectElement.setAttribute("stroke", "black");
      // add a borderRadius
      rectElement.setAttribute("rx", "4");

      // Append the rectangle before the text to serve as a background
      this._tagSvg!.insertBefore(rectElement, textElement);
    });
  }

  private toScreenPosition(position: THREE.Vector3): { x: number; y: number } {
    const width = this._tagSvg!.clientWidth;
    const height = this._tagSvg!.clientHeight;

    const vector = position.clone().project(this._viewer.camera);
    const x = (vector.x * 0.5 + 0.5) * width;
    const y = (-vector.y * 0.5 + 0.5) * height;

    return { x, y };
  }

  public async load() {
    if (this._entityControl$ || this._cameraControl$) {
      this.unload();
    }

    this._entityControl$ = this._entityControl.$entities.subscribe(
      (entities) => {
        this.updateTags(entities);
      }
    );

    this.updateTags(this._entityControl.entities);

    // Create an observable for control events
    const controlEvent$ = fromEvent(this._cameraControl.controls, "control");

    // Create an observable for window resize events
    const resizeEvent$ = fromEvent(window, "resize");

    // Merge the two observables and debounce them to avoid excessive calls
    const merged$ = merge(controlEvent$, resizeEvent$).pipe();

    this._cameraControl$ = merged$.subscribe(() => {
      this.renderTags();
    });

    this.renderTags();
  }

  public async setLabelVisibility(visible: boolean) {
    this.labelsVisible$.next(visible);
  }

  public async setThemingColorsApplied(applied: boolean) {
    this.themingColorsApplied$.next(applied);
  }

  public async unload() {
    if (this._entityControl$) {
      this._entityControl$.unsubscribe();
      this._entityControl$ = undefined;
    }

    if (this._cameraControl$) {
      this._cameraControl$.unsubscribe();
      this._cameraControl$ = undefined;
    }
  }
}

export default TagsExtension;
