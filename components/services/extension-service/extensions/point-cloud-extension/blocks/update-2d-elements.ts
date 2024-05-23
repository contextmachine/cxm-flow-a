import {
  PointCloudFieldShape,
  PointCloudPointSvg,
} from "../point-cloud-extension.types";

export const update2dElement = (
  pointSvg: PointCloudPointSvg,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  center: [number, number],
  shape: PointCloudFieldShape
) => {
  if (shape === "ellipse") {
    const polygonSvg = pointSvg.blurred;
    polygonSvg.setAttribute("cx", centerX.toString());
    polygonSvg.setAttribute("cy", centerY.toString());
    polygonSvg.setAttribute("rx", (width / 2).toString());
    polygonSvg.setAttribute("ry", (height / 2).toString());

    const dashPolygonSvg = pointSvg.dashed;
    dashPolygonSvg.setAttribute("cx", centerX.toString());
    dashPolygonSvg.setAttribute("cy", centerY.toString());
    dashPolygonSvg.setAttribute("rx", (width / 2).toString());
    dashPolygonSvg.setAttribute("ry", (height / 2).toString());

    const pointsSvg = pointSvg.point;
    pointsSvg.style.left = center[0] + "px";
    pointsSvg.style.top = center[1] - 9 + "px";
  } else if (shape === "rectangle") {
    const blurRect = pointSvg.blurred;
    blurRect.setAttribute("x", (centerX - width / 2).toString());
    blurRect.setAttribute("y", (centerY - height / 2).toString());
    blurRect.setAttribute("width", width.toString());
    blurRect.setAttribute("height", height.toString());

    const dashRect = pointSvg.dashed;
    dashRect.setAttribute("x", (centerX - width / 2).toString());
    dashRect.setAttribute("y", (centerY - height / 2).toString());
    dashRect.setAttribute("width", width.toString());
    dashRect.setAttribute("height", height.toString());

    const pointsSvg = pointSvg.point;
    pointsSvg.style.left = center[0] + "px";
    pointsSvg.style.top = center[1] - 9 + "px";
  }
};
