import * as THREE from "three";
import { PropertyType } from "../../view-filter/filter-widget/filter-condition";

export interface Tag {
  id: string;
  label: string;
  position: THREE.Vector3;
  projectedPosition: THREE.Vector2 | null;
  textSvg: SVGTextElement | null;
  backgroundSvg: SVGRectElement | null;
}

export interface UniqueTag {
  type: PropertyType;
  count: number;
}

export interface TagGroup {
  x: number;
  y: number;
  tags: Set<Tag>;
}

export interface TagCondition {
  name: string;
  operator: "EQUAL" | "NOT_EQUAL";
  enabled: boolean;
}

export interface TagCategory {
  name: string;
  count: number;
}
