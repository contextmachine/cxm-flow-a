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
import {
  Tag,
  TagCategory,
  TagCondition,
  TagGroup,
  UniqueTag,
} from "./tags-extension.types";
import CameraControl from "@/src/viewer/camera-control";
import * as THREE from "three";
import EntityControl from "@/src/viewer/entity-control";
import { Entity } from "@/src/objects/entities/entity";
import stc from "string-to-color";
import { FilterItem } from "../../view-filter/view-filter-extension";

class TagsExtension extends ExtensionEntity {
  private _tagSvg: SVGSVGElement | undefined;
  private _tagGroupSvg: SVGSVGElement | undefined;
  private _scene: THREE.Scene;

  private _cameraControl: CameraControl;
  private _entityControl: EntityControl;

  private _tags: Map<string, Tag> = new Map<string, Tag>();
  public $tags = new BehaviorSubject<Map<string, Tag>>(this._tags);
  public $uniqueTags = new BehaviorSubject<Map<string, number>>(new Map());

  private _tagGroups: Map<string, TagGroup> = new Map<string, TagGroup>();
  private _categories: Map<string, TagCategory> = new Map<
    string,
    TagCategory
  >();

  public $categories = new BehaviorSubject<Map<string, TagCategory>>(
    this._categories
  );
  public $subFilters = new BehaviorSubject<TagCondition[]>([]);

  public $labelsEnabled = new BehaviorSubject<boolean>(true);
  public $themingColorsEnabled = new BehaviorSubject<boolean>(true);

  private _edgeThreshold = 60 / 2;
  private _distanceThreshold = 120 / 2;
  private _groupingDelay = 200; // ms
  private _minGroupSize = 2;
  private _showDetailedLabels = false;

  private _activeCategory: TagCategory | undefined;
  public $activeCategory = new BehaviorSubject<TagCategory | undefined>(
    undefined
  );

  private _entityControl$: Subscription | undefined;
  private _subFilterControl$: Subscription | undefined;
  private _cameraControl$: Subscription | undefined;
  private _cameraGroupingControl$: Subscription | undefined;
  private _configsControl$: Subscription | undefined;

  public labelsVisible$ = new BehaviorSubject<boolean>(true);
  public themingColorsApplied$ = new BehaviorSubject<boolean>(true);

  private _testCircle: SVGCircleElement | undefined;

  public applyMatrixWorld$ = new BehaviorSubject<boolean>(false);
  public enableGrouping$ = new BehaviorSubject<boolean>(true);

  constructor(viewer: Viewer, productData: ProductsDto) {
    super(viewer);
    this.name = "tags-widget";
    this.id = productData.id;

    this._scene = this._viewer.scene;
    this._cameraControl = this._viewer.controls;
    this._entityControl = this._viewer.entityControl;

    this._tagSvg = this._viewer.tagCanvas;
  }

  public updateTags = (
    entities: Map<string, Entity>,
    keepSubFilters?: boolean
  ) => {
    if (this._tagSvg) {
      while (this._tagSvg.firstChild) {
        this._tagSvg.removeChild(this._tagSvg.firstChild);
      }
    }

    if (this._tagGroupSvg) {
      while (this._tagGroupSvg.firstChild) {
        this._tagGroupSvg.removeChild(this._tagGroupSvg.firstChild);
      }
    }

    this._tags.forEach((tag) => {
      if (tag.textSvg && tag.backgroundSvg) {
        tag.textSvg.remove();
        tag.backgroundSvg.remove();
      }
    });

    // get tall categories
    entities.forEach((entity) => {
      const props = entity.props;
      if (props) {
        Array.from(props.keys()).forEach((key) => {
          if (this._categories.has(key)) {
            const category = this._categories.get(key)!;
            category.count += 1;
          } else {
            this._categories.set(key, { name: key, count: 1 });
          }
        });
      }
    });

    this.$categories.next(this._categories);
    this.$activeCategory.next(this._activeCategory);
    this._tags.clear();
    this.$tags.next(new Map());
    this.$uniqueTags.next(new Map());

    // get all tags based on active category
    entities.forEach((entity) => {
      if (this._activeCategory) {
        const props = entity.props;
        if (props) {
          const tag = props.get(this._activeCategory!.name);
          if (tag) {
            this._tags.set(entity.id, {
              id: entity.id,
              label: tag,
              position: entity.center,
              projectedPosition: null,
              textSvg: null,
              backgroundSvg: null,
            });

            // Generate color from tag using stc
            const color = stc(tag);

            // Apply material to the entity's mesh or group
            if (
              entity.type === "mesh" &&
              this._activeCategory &&
              this.isTagValidForSubfilter(tag)
            ) {
              entity.applyThemingColor(color);
            } else {
              entity.applyThemingColor("white", true);
            }
          } else {
            entity.applyThemingColor("white", true);
          }
        }
      } else {
        entity.clearThemingColor();
      }
    });

    this.$tags.next(new Map(this._tags));
    this._getUniqueTags();

    this.renderAll();

    if (!keepSubFilters) {
      this.$subFilters.next([]);
    }
  };

  public isTagValidForSubfilter = (tag: string): boolean => {
    const subFilters = this.$subFilters.value;

    if (subFilters.length === 0 || subFilters.every(({ enabled }) => !enabled))
      return true;

    const valid = subFilters.some((filter) => {
      if (filter.name === tag) {
        if (filter.operator === "EQUAL" && filter.enabled) {
          return true;
        }
      }

      return false;
    });

    return valid;
  };

  public addSubFilter = (condition: TagCondition) => {
    const subFilters = this.$subFilters.value;

    // Check if the same condition already exists
    const exists = subFilters.some(
      (filter) =>
        filter.name === condition.name && filter.operator === condition.operator
    );

    if (!exists) {
      this.$subFilters.next([...subFilters, condition]);
    }
  };

  public removeSubFilter = (condition: TagCondition) => {
    const subFilters = this.$subFilters.value.filter(
      (filter) => filter.name !== condition.name
    );

    this.$subFilters.next(subFilters);
  };

  public updateSubFilter = (condition: TagCondition) => {
    const subFilters = this.$subFilters.value.map((filter) => {
      if (filter.name === condition.name) {
        return condition;
      }

      return filter;
    });

    this.$subFilters.next([...subFilters]);
  };

  // Method to get unique tags and their counts
  private _getUniqueTags = () => {
    const tags = this._tags;

    const uniqueTags = new Map<string, number>();

    tags.forEach((tag) => {
      const label = tag.label;

      if (uniqueTags.has(label)) {
        uniqueTags.set(label, uniqueTags.get(label)! + 1);
      } else {
        uniqueTags.set(label, 1);
      }
    });

    this.$uniqueTags.next(uniqueTags);
  };

  /**
   * This method will render the tags, apply grouping logic, and then render the groups.
   */
  private renderAll = () => {
    if (this.applyMatrixWorld$.value) {
      this._viewer.controls.camera.updateMatrixWorld();
    }

    // Render tags as badges on the SVG canvas
    this.renderTags();

    // Apply grouping logic to tags
    this.calculateGroups();

    // Render tag groups as circles on the SVG canvas
    this.renderGroups();
  };

  private renderTags() {
    const tagSvg = document.getElementById("tags") as any as SVGSVGElement;
    if (tagSvg) {
      this._tagSvg = tagSvg;
    }

    if (!this._tagSvg) return;

    // Render each tag as an SVG element
    this._tags.forEach((tag) => {
      const { position, label } = tag;

      // Convert 3D position to 2D screen position
      const screenPosition = this.toScreenPosition(position);
      tag.projectedPosition = new THREE.Vector2(
        screenPosition.x,
        screenPosition.y
      );

      // Check if the tag already has SVG elements
      if (tag.textSvg && tag.backgroundSvg) {
        // Show the text and background if labels are enabled
        tag.textSvg.style.display = "block";
        tag.backgroundSvg.style.display = "block";

        // Update position and content of existing text element
        tag.textSvg.setAttribute("x", `${screenPosition.x}`);
        tag.textSvg.setAttribute("y", `${screenPosition.y}`);
        tag.textSvg.textContent = label;

        // Update the bounding box of the text
        const textBox = tag.textSvg.getBBox();
        const padding = 4;

        // Update position and size of the background rect
        tag.backgroundSvg.setAttribute("x", `${textBox.x - padding}`);
        tag.backgroundSvg.setAttribute("y", `${textBox.y - padding}`);
        tag.backgroundSvg.setAttribute(
          "width",
          `${textBox.width + 2 * padding}`
        );
        tag.backgroundSvg.setAttribute(
          "height",
          `${textBox.height + 2 * padding}`
        );
      } else {
        // Create new SVG elements if they don't exist

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
        rectElement.setAttribute("rx", "4");

        // Append the rectangle before the text to serve as a background
        this._tagSvg!.insertBefore(rectElement, textElement);

        // Save the SVG elements to the tag object
        tag.textSvg = textElement;
        tag.backgroundSvg = rectElement;
      }
    });
  }

  // Add the applyGrouping method to handle your custom grouping logic
  private calculateGroups = () => {
    if (!this.enableGrouping$.value) {
      this._tagGroups.clear();
      return;
    }

    const grouped: TagGroup[] = [];
    const tags = Array.from(this._tags.values());

    // Group tags based on distance
    tags.forEach((tag, i) => {
      const { projectedPosition } = tag;

      if (!projectedPosition) return;

      const x = projectedPosition.x;
      const y = projectedPosition.y;

      const groupedWith = grouped.find(
        (group) =>
          Math.hypot(group.x - x, group.y - y) < this._distanceThreshold
      );

      if (groupedWith) {
        groupedWith.tags.add(tag);
      } else {
        grouped.push({
          x,
          y,
          tags: new Set([tag]),
        });
      }
    });

    this._tagGroups.clear();
    grouped.forEach((group, i) => {
      if (group.tags.size >= this._minGroupSize) {
        this._tagGroups.set(`${i}`, group);
      }
    });
  };

  private renderGroups = () => {
    const tagGroupCanvas = document.getElementById(
      "tag-groups"
    ) as any as SVGSVGElement;

    if (!this._tagGroupSvg) {
      this._tagGroupSvg = tagGroupCanvas;
    }

    if (!this._tagGroupSvg) return;

    // Clear previous groups
    while (this._tagGroupSvg.firstChild) {
      this._tagGroupSvg.removeChild(this._tagGroupSvg.firstChild);
    }

    // Render each group as an SVG element
    this._tagGroups.forEach((group) => {
      const { tags } = group;
      const firstTag = Array.from(tags)[0];

      const screenPosition = this.toScreenPosition(firstTag.position);

      // Determine the dimensions of the main rectangle
      let rectangleWidth = 50; // Adjust this value based on the width you prefer
      const rectangleHeight = 30; // Adjust height based on your design preference

      // Render each tag as a small rectangle inside the main background rectangle
      const smallRectangleWidth = 15; // Width of each small rectangle
      const clashOffset = 2; // Overlap amount for the "clash" effect

      const uniqueLabels = new Set(Array.from(tags).map((tag) => tag.label));

      const minWidthNeeded =
        uniqueLabels.size * (smallRectangleWidth - clashOffset);
      rectangleWidth = Math.max(minWidthNeeded, rectangleWidth);

      // Create a dark background rectangle for the group
      const backgroundRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      backgroundRect.setAttribute(
        "x",
        `${screenPosition.x - rectangleWidth / 2}`
      );
      backgroundRect.setAttribute(
        "y",
        `${screenPosition.y - rectangleHeight / 2}`
      );
      backgroundRect.setAttribute("width", `${rectangleWidth}`);
      backgroundRect.setAttribute("height", `${rectangleHeight}`);

      // Dark mode styles for background rectangle
      backgroundRect.setAttribute("fill", "rgba(0, 0, 0, 0.8)");
      backgroundRect.setAttribute("stroke", "black");
      backgroundRect.setAttribute("stroke-width", "1.5");
      backgroundRect.setAttribute("rx", "10");
      backgroundRect.setAttribute("ry", "10");

      // Append the background rectangle to the SVG
      this._tagGroupSvg!.appendChild(backgroundRect);

      Array.from(uniqueLabels).forEach((label, index) => {
        const smallRect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );

        // Calculate position for each small rectangle with overlap
        const xPosition =
          screenPosition.x -
          rectangleWidth / 2 +
          index * (smallRectangleWidth - clashOffset);
        const yPosition = screenPosition.y - rectangleHeight / 4; // Center vertically

        smallRect.setAttribute("x", `${xPosition}`);
        smallRect.setAttribute("y", `${yPosition}`);
        smallRect.setAttribute("width", `${smallRectangleWidth}`);
        smallRect.setAttribute("height", `${rectangleHeight / 2}`);
        smallRect.setAttribute("rx", "10");
        smallRect.setAttribute("ry", "10");

        // Set color based on stc(label)
        const color = stc(label);
        smallRect.setAttribute("fill", color);

        // Append each small rectangle to the SVG
        this._tagGroupSvg!.appendChild(smallRect);
      });

      // Hide all individual tags in the group
      tags.forEach((tag) => {
        if (tag.textSvg && tag.backgroundSvg) {
          tag.textSvg.style.display = "none";
          tag.backgroundSvg.style.display = "none";
        }
      });
    });
  };

  // Method to toggle label rendering state
  public toggleDetailedLabels(showDetailed: boolean) {
    this._showDetailedLabels = showDetailed;
    this.renderGroups();
  }

  private toScreenPosition(position: THREE.Vector3): { x: number; y: number } {
    if (
      !this._viewer ||
      !this._viewer.camera ||
      !this._viewer.camera.matrixWorldInverse
    )
      return { x: 0, y: 0 };

    const width = this._tagSvg ? this._tagSvg.clientWidth : window.innerWidth;
    const height = this._tagSvg
      ? this._tagSvg.clientHeight
      : window.innerHeight;

    // Clone the position and apply model-view transformations
    const vector = position.clone();

    const projectedVector = vector.project(this._viewer.controls.camera);

    // Convert the NDC (-1 to 1) to screen coordinates
    const x = (projectedVector.x * 0.5 + 0.5) * width;
    const y = (1 - (projectedVector.y * 0.5 + 0.5)) * height;

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

    this._subFilterControl$ = this.$subFilters.subscribe((subFilters) => {
      this.updateTags(this._entityControl.entities, true);
    });

    const configChanges$ = merge(
      this.enableGrouping$,
      this.applyMatrixWorld$,
      this.labelsVisible$
    );

    this._configsControl$ = configChanges$.subscribe(() => {
      this.renderAll();
    });

    // Create an observable for control events
    const controlEvent$ = fromEvent(this._cameraControl.controls, "control");

    // Create an observable for window resize events
    const resizeEvent$ = fromEvent(window, "resize");

    // Merge the two observables for immediate renderTags execution
    const immediateRender$ = merge(controlEvent$, resizeEvent$);

    // Debounced observable for applyGrouping
    const debouncedGrouping$ = immediateRender$.pipe(
      debounceTime(this._groupingDelay)
    );

    // Subscribe to the immediate observable for rendering tags immediately
    this._cameraControl$ = immediateRender$.subscribe(() => {
      if (this.applyMatrixWorld$.value) {
        this._viewer.controls.camera.updateMatrixWorld();
      }

      this.renderTags();
      this.renderGroups();
    });

    // Subscribe to the debounced observable for applying grouping logic
    this._cameraGroupingControl$ = debouncedGrouping$.subscribe(() => {
      this.calculateGroups();
    });

    this.renderAll();
  }

  public async setLabelVisibility(visible: boolean) {
    this.labelsVisible$.next(visible);
  }

  public async setThemingColorsApplied(applied: boolean) {
    this.themingColorsApplied$.next(applied);
  }

  public setActiveCategory = (_category: TagCategory | string | null) => {
    let category: TagCategory | undefined;

    if (typeof _category === "string") {
      category = this._categories.get(_category);
    }

    if (category) {
      this._activeCategory = category;
    } else {
      this._activeCategory = undefined;
    }

    this.$activeCategory.next(this._activeCategory);
    this.updateTags(this._entityControl.entities);
  };

  public updateFilterCondition = (filterItem: FilterItem) => {
    console.log("Filter item updated", filterItem);
  };

  // Add this method inside your TagsExtension class
  public drawSingleProjectedCircle() {
    // Define the 3D position to project
    const position = new THREE.Vector3(0, 0, 0);

    // Get the screen coordinates of the projected 3D point
    const screenPosition = this.toScreenPosition(position);

    if (!this._testCircle) {
      // Create the circle element at the projected position
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );

      circle.setAttribute("cx", `${screenPosition.x}`);
      circle.setAttribute("cy", `${screenPosition.y}`);
      circle.setAttribute("r", "10"); // Set radius of the circle
      circle.setAttribute("fill", "blue"); // Set color of the circle
      circle.setAttribute("opacity", "0.8");

      // Append the circle to the SVG container
      this._tagSvg!.appendChild(circle);

      this._testCircle = circle;
    } else {
      const circle = this._testCircle;
      circle.setAttribute("cx", `${screenPosition.x}`);
      circle.setAttribute("cy", `${screenPosition.y}`);
    }
  }

  public setApplyMatrixWorld(apply: boolean) {
    this.applyMatrixWorld$.next(apply);
  }

  public setGroupingEnabled(enabled: boolean) {
    this.enableGrouping$.next(enabled);
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

    if (this._cameraGroupingControl$) {
      this._cameraGroupingControl$.unsubscribe();
      this._cameraGroupingControl$ = undefined;
    }

    if (this._subFilterControl$) {
      this._subFilterControl$.unsubscribe();
      this._subFilterControl$ = undefined;
    }

    if (this._configsControl$) {
      this._configsControl$.unsubscribe();
      this._configsControl$ = undefined;
    }

    this._tags.clear();
    this._tagGroups.clear();
    this._categories.clear();

    this.$tags.unsubscribe();
    this.$uniqueTags.unsubscribe();
    this.$categories.unsubscribe();
    this.$subFilters.unsubscribe();
    this.$activeCategory.unsubscribe();
    this.$labelsEnabled.unsubscribe();
    this.$themingColorsEnabled.unsubscribe;
    this.labelsVisible$.unsubscribe();
    this.themingColorsApplied$.unsubscribe();

    this.enableGrouping$.unsubscribe();
    this.applyMatrixWorld$.unsubscribe();
  }
}

export default TagsExtension;
