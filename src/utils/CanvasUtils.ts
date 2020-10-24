import { GridNodeProps } from "../types/TGridNode";

export const drawBorder = (
  context: CanvasRenderingContext2D | null | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  thickness = 0.1
) => {
  if (!context) {
    return;
  }

  context.fillStyle = "#000";
  context.fillRect(
    x - thickness,
    y - thickness,
    width + thickness * 2,
    height + thickness * 2
  );
};

export const getFillStyle = (node: GridNodeProps) => {
  if (node.isFinish) {
    return "#6F58C9";
  }

  if (node.isStart) {
    return "#26413C";
  }

  if (node.isShortestPath) {
    return "#FF9E00";
  }

  if (node.isWall) {
    return "darkslategray";
  }

  if (node.isVisited) {
    return "aqua";
  }

  return getFillStyleBasedOnDistance(node);
};

const getFillStyleBasedOnDistance = (node: GridNodeProps) => {
  if (node.distance === Infinity) {
    return "white";
  }
  // as the function expects a value between 0 and 1, and red = 0° and green = 120°
  // we convert the input to the appropriate hue value
  var hue = (node.distance * 1.2) / 360;
  // we convert hsl to rgb (saturation 100%, lightness 50%)
  var rgb = hslToRgb(hue, 1, 0.5);
  // we format to css value and return
  return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
};

const hslToRgb = (h: number, s: number, l: number) => {
  var r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
};

const hue2rgb = (p: number, q: number, t: number) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

  return p;
};
