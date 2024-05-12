export const createBlurredCircle = (
  svgCanvas: SVGElement
): SVGEllipseElement => {
  const ellipse = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "ellipse"
  );

  ellipse.setAttribute(
    "style",
    "fill: rgba(255, 255, 255, 0.8); stroke: none; stroke-width: 1; filter: blur(10px); transition: opacity 0.3s;"
  );

  svgCanvas.appendChild(ellipse);

  return ellipse;
};

export const createDashedCircle = (
  svgCanvas: SVGElement
): SVGEllipseElement => {
  const ellipse = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "ellipse"
  );

  ellipse.setAttribute(
    "style",
    "fill: none; stroke: rgba(0,0,0,0.8); stroke-width: 1; stroke-dasharray: 5; transition: opacity 0.3s;"
  );

  svgCanvas.appendChild(ellipse);

  return ellipse;
};

export const createPoint = (
  divCanvas: HTMLDivElement,
  name: string
): HTMLDivElement => {
  // create element div
  const pointWrapper = document.createElement("div");
  pointWrapper.style.position = "absolute";
  pointWrapper.style.width = "max-content";
  pointWrapper.style.height = "max-content";
  pointWrapper.style.cursor = "pointer";
  pointWrapper.style.transform = "translate(-50%, -50%)";
  pointWrapper.style.display = "flex";
  pointWrapper.style.flexDirection = "column";
  pointWrapper.style.justifyContent = "center";
  pointWrapper.style.alignItems = "center";
  pointWrapper.style.gap = "5px";
  pointWrapper.style.transition = "opacity 0.3s";

  // add Text there
  const text = document.createElement("p");
  text.style.color = "black";
  text.style.fontSize = "10px";
  text.style.fontWeight = "bold";
  text.innerText = name || "Point";

  pointWrapper.appendChild(text);

  // add Point there
  const point = document.createElement("div");
  point.style.width = "10px";
  point.style.height = "10px";
  point.style.borderRadius = "50%";
  point.style.backgroundColor = "black";

  pointWrapper.appendChild(point);

  divCanvas.appendChild(pointWrapper);

  return pointWrapper;
};
