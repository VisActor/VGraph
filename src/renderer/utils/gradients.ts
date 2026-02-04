import { parseLinearGradientValues, parseRadialGradientValues } from '../../utils/color/gradient';
import { ShapeBase } from '../shape';
import { BBox } from '../../typings/renderer';

type GradientStop = {
  stop: number;
  color: string;
};

export function getGradient(color: string, shape: ShapeBase, ctx: CanvasRenderingContext2D) {
  if (!shape[color]) {
    let gradient: CanvasGradient | null = null;
    const bbox = shape.getBBox();
    if (color[0] === 'l') {
      gradient = parseLinearGradient(color, bbox, ctx);
    } else {
      // color[0] === 'r'
      gradient = parseRadialGradient(color, bbox, ctx);
    }
    shape[color] = gradient;
  }
  return shape[color];
}

export function parseLinearGradient(color: string, bbox: BBox, ctx: CanvasRenderingContext2D) {
  const values = parseLinearGradientValues(color);
  if (!values) {
    return null;
  }
  const { x0, y0, x1, y1, stops } = values;
  const { left, top, width, height } = bbox;
  const gradient = ctx.createLinearGradient(
    left + width * x0,
    top + height * y0,
    left + width * x1,
    top + height * y1
  );
  addStops(gradient, stops);
  return gradient;
}

export function parseRadialGradient(color: string, bbox: BBox, ctx: CanvasRenderingContext2D) {
  const values = parseRadialGradientValues(color);
  if (!values) {
    return null;
  }
  const { x0, y0, r0, x1, y1, r1, stops } = values;
  const { left, top, width, height } = bbox;
  const r = Math.max(width, height);
  const gradient = ctx.createRadialGradient(
    left + width * x0,
    top + height * y0,
    r0 * r,
    left + width * x1,
    top + height * y1,
    r1 * r
  );
  addStops(gradient, stops);
  return gradient;
}

function addStops(gradient: CanvasGradient, stops: GradientStop[]) {
  stops.forEach((stop: GradientStop) => {
    gradient.addColorStop(stop.stop, stop.color);
  });
  return gradient;
}
