import * as THREE from "three";

export interface PointCloudFieldHandler {
  id: string;
  name: string;
  position: PointCloudFieldPosition;
  height: number;
  size: PointCloudFieldSize;
}

export type PointCloudFieldSize = [number, number];
export type PointCloudFieldPosition = [number, number, number];

export interface PointCloudPointSvg {
  blurCircle: SVGEllipseElement;
  dashedCircle: SVGEllipseElement;
  point: HTMLDivElement;
}

export interface PointCloudFloarParamWindow {
  position: THREE.Vector3;
  id: string;
  div: HTMLDivElement;
}
