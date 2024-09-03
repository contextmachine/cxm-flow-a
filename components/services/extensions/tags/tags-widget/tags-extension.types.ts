import * as THREE from "three";

export interface Tag {
  id: string;
  label: string;
  position: THREE.Vector3;
}

export interface TagCategory {
  name: string;
}
