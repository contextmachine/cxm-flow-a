export const initializeSVGOverlay = () => {
  const threeCanvas = document.getElementById("three-canvas");

  if (!threeCanvas) return;

  // Create SVG element
  const svgCanvas = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgCanvas.style.position = "absolute";
  svgCanvas.style.top = "0";
  svgCanvas.style.left = "0";
  svgCanvas.style.width = "100%";
  svgCanvas.style.height = "100%";
  svgCanvas.style.pointerEvents = "none"; // Make SVG click-through

  // Create div element
  const divCanvas = document.createElement("div");
  divCanvas.style.position = "absolute";
  divCanvas.style.top = "0";
  divCanvas.style.left = "0";
  divCanvas.style.width = "100%";
  divCanvas.style.height = "100%";
  divCanvas.style.pointerEvents = "none"; // Make div click-through

  // Append SVG and div to threeCanvas
  threeCanvas.appendChild(svgCanvas);
  threeCanvas.appendChild(divCanvas);

  return { svgCanvas, divCanvas };
};
