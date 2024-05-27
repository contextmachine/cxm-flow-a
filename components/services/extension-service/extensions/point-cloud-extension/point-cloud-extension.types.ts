import * as THREE from "three";

export interface PointCloudFieldHandler {
  id: string;
  name: string;
  position: PointCloudFieldPosition;
  height: number;
  size: PointCloudFieldSize;
  shape: "ellipse" | "rectangle";
  active: boolean;
}

export type PointCloudFieldShape = "ellipse" | "rectangle";

export type PointCloudFieldSize = [number, number];
export type PointCloudFieldPosition = [number, number, number];

export interface PointCloudPointSvg {
  blurred: SVGEllipseElement | SVGRectElement;
  dashed: SVGEllipseElement | SVGRectElement;
  shape: PointCloudFieldShape;
  point: HTMLDivElement;
}

export interface PointCloudFloarParamWindow {
  position: THREE.Vector3;
  id: string;
  div: HTMLDivElement;
}

export interface OverallPointCloudField {
  min_step: OverallPCFConfig;
  max_step: OverallPCFConfig;
  blur: OverallPCFConfig;
}

export interface OverallPCFConfig {
  min: number;
  max: number;
  value: number;
  step: number;
}
