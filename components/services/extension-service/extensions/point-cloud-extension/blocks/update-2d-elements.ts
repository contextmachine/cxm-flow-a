import { PointCloudPointSvg } from "../point-cloud-extension.types";

export const update2dElement = (
  pointSvg: PointCloudPointSvg,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  center: [number, number]
) => {
  const polygonSvg = pointSvg.blurCircle;
  polygonSvg.setAttribute("cx", centerX.toString());
  polygonSvg.setAttribute("cy", centerY.toString());
  polygonSvg.setAttribute("rx", (width / 2).toString());
  polygonSvg.setAttribute("ry", (height / 2).toString());

  const dashPolygonSvg = pointSvg.dashedCircle;
  dashPolygonSvg.setAttribute("cx", centerX.toString());
  dashPolygonSvg.setAttribute("cy", centerY.toString());
  dashPolygonSvg.setAttribute("rx", (width / 2).toString());
  dashPolygonSvg.setAttribute("ry", (height / 2).toString());

  const pointsSvg = pointSvg.point;
  pointsSvg.style.left = center[0] + "px";
  pointsSvg.style.top = center[1] - 9 + "px";
};
