import * as THREE from "three";

export interface Tag {
  id: string;
  label: string;
  position: THREE.Vector3;
  projectedPosition: THREE.Vector2 | null;
  textSvg: SVGTextElement | null;
  backgroundSvg: SVGRectElement | null;
}

export interface TagGroup {
  x: number;
  y: number;
  tags: Set<Tag>;
}

export interface TagCategory {
  name: string;
}
