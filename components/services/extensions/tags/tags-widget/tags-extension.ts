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
import { Tag, TagCategory, TagGroup } from "./tags-extension.types";
import CameraControl from "@/src/viewer/camera-control";
import * as THREE from "three";
import EntityControl from "@/src/viewer/entity-control";
import { Entity } from "@/src/objects/entities/entity";
import stc from "string-to-color";

class TagsExtension extends ExtensionEntity {
  private _tagSvg: SVGSVGElement | undefined;
  private _tagGroupSvg: SVGSVGElement | undefined;
  private _scene: THREE.Scene;

  private _cameraControl: CameraControl;
  private _entityControl: EntityControl;

  private _tags: Map<string, Tag> = new Map<string, Tag>();
  public $tags = new BehaviorSubject<Map<string, Tag>>(this._tags);

  private _tagGroups: Map<string, TagGroup> = new Map<string, TagGroup>();
  private _categories: Map<string, TagCategory> = new Map<
    string,
    TagCategory
  >();

  public $categories = new BehaviorSubject<Map<string, TagCategory>>(
    this._categories
  );

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
  private _cameraControl$: Subscription | undefined;
  private _cameraGroupingControl$: Subscription | undefined;

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

    // get tall categories
    entities.forEach((entity) => {
      const props = entity.props;
      if (props) {
        Array.from(props.keys()).forEach((key) => {
          this._categories.set(key, { name: key });
        });
      }
    });

    /* if (!this._activeCategory && this._categories.size > 0) {
      this._activeCategory = Array.from(this._categories.values())[0];
    } */

    this.$categories.next(this._categories);
    this.$activeCategory.next(this._activeCategory);
    this._tags.clear();
    this.$tags.next(new Map());

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
            if (entity.type === "mesh") {
              if (this._activeCategory) {
                entity.applyThemingColor(color);
              }
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

    this.renderAll();
  };

  /**
   * This method will render the tags, apply grouping logic, and then render the groups.
   */
  private renderAll = () => {
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

      // Create an SVG circle element for the group with dark mode styling
      const circleElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circleElement.setAttribute("cx", `${screenPosition.x}`);
      circleElement.setAttribute("cy", `${screenPosition.y}`);
      circleElement.setAttribute("r", `${this._edgeThreshold}`);

      // Dark mode styles
      circleElement.setAttribute("fill", "rgba(0, 0, 0, 0.8)"); // Dark, semi-transparent fill
      circleElement.setAttribute("stroke", "black"); // Black stroke for contrast
      circleElement.setAttribute("stroke-width", "1.5");

      // Append the circle element to the SVG
      this._tagGroupSvg!.appendChild(circleElement);

      if (this._showDetailedLabels) {
        // Detailed label rendering logic
        // Count occurrences of each label
        const labelCounts: { [label: string]: number } = {};
        tags.forEach((tag) => {
          labelCounts[tag.label] = (labelCounts[tag.label] || 0) + 1;
        });

        // Get unique labels and handle "Others" if there are more than 3
        let labelArray = Object.keys(labelCounts);
        const maxVisibleLabels = 2;
        let othersCount = 0;

        if (labelArray.length > maxVisibleLabels) {
          othersCount = labelArray
            .slice(maxVisibleLabels)
            .reduce((sum, label) => sum + labelCounts[label], 0);
          labelArray = labelArray.slice(0, maxVisibleLabels);
        }

        // Calculate the offset to center the labels vertically inside the circle
        const lineHeight = 18; // Adjust line height based on your preference
        const totalHeight =
          lineHeight * (labelArray.length + (othersCount > 0 ? 1 : 0)); // Add space for "Others"
        const startY = screenPosition.y - totalHeight / 2 + lineHeight / 2;

        // Add each unique label and its count as an SVG text element, stacked vertically inside the circle
        labelArray.forEach((label, index) => {
          const textElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          textElement.setAttribute("x", `${screenPosition.x}`);
          textElement.setAttribute("y", `${startY + index * lineHeight}`);

          // Dark mode text styles
          textElement.setAttribute("fill", "#ffffff"); // White text for dark mode
          textElement.setAttribute("font-size", "10");
          textElement.setAttribute("text-anchor", "middle"); // Center align text
          textElement.textContent = `${label} - ${labelCounts[label]}`; // Show label and count

          // Append the text element to the SVG
          this._tagGroupSvg!.appendChild(textElement);
        });

        // If there are more than 3 labels, add an "Others" label
        if (othersCount > 0) {
          const othersTextElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          othersTextElement.setAttribute("x", `${screenPosition.x}`);
          othersTextElement.setAttribute(
            "y",
            `${startY + labelArray.length * lineHeight}`
          );

          // Dark mode text styles for "Others"
          othersTextElement.setAttribute("fill", "#ffffff"); // White text for dark mode
          othersTextElement.setAttribute("font-size", "9");
          othersTextElement.setAttribute("text-anchor", "middle"); // Center align text
          othersTextElement.textContent = `Others - ${othersCount}`; // Show "Others" and count

          // Append the "Others" text element to the SVG
          this._tagGroupSvg!.appendChild(othersTextElement);
        }
      } else {
        // Show only the total number of tags
        const totalTags = tags.size;

        // Add a single text element showing the total number of tags
        const textElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        textElement.setAttribute("x", `${screenPosition.x}`);
        textElement.setAttribute("y", `${screenPosition.y}`);

        // Dark mode text styles
        textElement.setAttribute("fill", "#ffffff"); // White text for dark mode
        textElement.setAttribute("font-size", "14");
        textElement.setAttribute("text-anchor", "middle"); // Center align text
        textElement.textContent = `${totalTags}`; // Show total count

        // Append the text element to the SVG
        this._tagGroupSvg!.appendChild(textElement);
      }

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

    // Merge the two observables for immediate renderTags execution
    const immediateRender$ = merge(controlEvent$, resizeEvent$);

    // Debounced observable for applyGrouping
    const debouncedGrouping$ = immediateRender$.pipe(
      debounceTime(this._groupingDelay)
    );

    // Subscribe to the immediate observable for rendering tags immediately
    this._cameraControl$ = immediateRender$.subscribe(() => {
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

    this._tags.clear();
    this._categories.clear();

    this.$categories.unsubscribe();
    this.$activeCategory.unsubscribe();
    this.$labelsEnabled.unsubscribe();
    this.$themingColorsEnabled.unsubscribe;
    this.labelsVisible$.unsubscribe();
    this.themingColorsApplied$.unsubscribe();
  }
}

export default TagsExtension;