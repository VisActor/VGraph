import { invert, pointMultiply, translate, rotate, scale } from '../../utils/math/matrix';
import { ShapeBase } from '../shape';
import LAYER_TYPES from '../../consts/layer_types';
import SHAPE_TYPES from '../../consts/shape_types';
import { Canvas } from '../canvas';
import { LayerBase } from '../layers/base';
import { BBox, Point } from '../../typings/renderer';
import lineUtil, { getProjectionDist as getLineDist } from '../utils/line';
import quadraticUtil from '../utils/quadratic';
import cubicUtil from '../utils/cubic';
import { Path } from '../shapes/path';
import { Polygon } from '../shapes/polygon';
import { getArrowBorder, getArrowByLineWidth, isPointOnSimpleArrow } from '../utils/arrow';
import { isPointInPolygon, isPointInPolygonStroke } from '../utils/polygon';

export default class CanvasEvents {
  canvas: Canvas;
  viewportPoint;
  canvasDom: HTMLCanvasElement;
  innerCanvas: HTMLCanvasElement;
  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.canvasDom = canvas.painter.getDomNode();
    const innerCanvas = document.createElement('canvas');
    innerCanvas.width = 1;
    innerCanvas.height = 1;
    this.innerCanvas = innerCanvas;
    this.viewportPoint = { x: 0, y: 0 };
  }

  getShape(e: MouseEvent): ShapeBase | null {
    const { clientX, clientY } = e;
    const canvas = this.canvas;
    const point = canvas.clientToCanvas(clientX, clientY);
    const pixelRatio = canvas.get('pixelRatio') || 1;
    this.viewportPoint = {
      x: point.x / pixelRatio,
      y: point.y / pixelRatio,
    };
    return this.getShapeInLayer(point, this.canvas);
  }

  getShapeInLayer(point: Point, layer: LayerBase): ShapeBase | null {
    let result = null;
    if (!layer.visible || !layer.capture || layer.get('opacity') === 0) {
      return result;
    }
    if (layer.type === LAYER_TYPES.NODE || layer.type === LAYER_TYPES.GROUP) {
      const bbox = layer.getBBoxForHit();
      if (!isPointInRect(bbox, point)) {
        return result;
      }
    }
    const target = this.getActualPoint(point, layer);
    const children = layer.children;
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].isLayer()) {
        result = this.getShapeInLayer(target, children[i] as LayerBase);
      } else if (this.isPointInShape(target, children[i], false, this.viewportPoint)) {
        result = children[i];
      }
      if (result) {
        break;
      }
    }
    if (!result && (layer.type === LAYER_TYPES.NODE || layer.type === LAYER_TYPES.GROUP)) {
      if (layer.exactMatch) {
        return null;
      }
      return layer;
    }
    return result;
  }

  isPointInShape(point: Point, shape: ShapeBase, fill = false, viewPoint: Point): boolean {
    if (!shape.visible || !shape.capture || shape.get('opacity') === 0) {
      return false;
    }
    const target = shape.get('fixed') ? viewPoint : this.getActualPoint(point, shape);
    const clip = shape.get('clip');
    if (clip && !this.isPointInShape(point, clip, true, viewPoint)) {
      return false;
    }
    if ([SHAPE_TYPES.TEXT, SHAPE_TYPES.IMAGE, SHAPE_TYPES.ICON, SHAPE_TYPES.RECT].includes(shape.type)) {
      const bbox = shape.calculateBBox();
      if (bbox.width === 0 || bbox.height === 0) {
        return false;
      }
      return isPointInRect(bbox, target);
      // dom 不走这套逻辑
    }
    const { fillStyle, strokeStyle, startArrow, endArrow } = shape.configs;
    if ((fillStyle || fill) && this.isPointInFill(target, shape)) {
      return true;
    }
    if (strokeStyle && this.isPointInStroke(target, shape)) {
      return true;
    }
    if ((startArrow || endArrow) && this.isPointOnArrow(target, shape)) {
      return true;
    }
    return false;
  }

  isPointInFill(point: Point, shape: ShapeBase) {
    const ctx = this.innerCanvas.getContext('2d')!;
    switch (shape.type) {
      case SHAPE_TYPES.RECT:
        return isPointInRect(shape.getBBox(), point);
      case SHAPE_TYPES.CIRCLE:
        // eslint-disable-next-line no-case-declarations
        const { cx, cy, r } = shape.configs;
        return Math.hypot(cx - point.x, cy - point.y) <= r;
      case SHAPE_TYPES.QUADRATIC:
        // eslint-disable-next-line no-case-declarations
        let { points } = shape.configs;
        quadraticUtil.drawPath(ctx, points[0], points[1], points[2]);
        ctx?.fill();
        return ctx?.isPointInPath(point.x, point.y);
      case SHAPE_TYPES.CUBIC:
        points = shape.get('points');
        cubicUtil.drawPath(ctx, points[0], points[1], points[2], points[3]);
        ctx?.fill();
        return ctx?.isPointInPath(point.x, point.y);
      case SHAPE_TYPES.PATH:
        ctx?.beginPath();
        // eslint-disable-next-line no-case-declarations
        const segments = (shape as Path).getSegments();
        for (const segment of segments) {
          points = segment.configs.points;
          if (segment.configs.move) {
            ctx?.moveTo(points[0].x, points[0].y);
          }
          switch (segment.type) {
            case 'line':
              ctx?.lineTo(points[1].x, points[1].y);
              break;
            case 'arc':
              lineUtil.drawArc(ctx, segment);
              break;
            case 'cubic':
              ctx?.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y);
              break;
            case 'quadratic':
              ctx?.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
              break;
            default:
              break;
          }
        }
        ctx?.fill();
        return ctx?.isPointInPath(point.x, point.y);
      case SHAPE_TYPES.POLYGON:
        points = (shape as Polygon).getVertices();
        return isPointInPolygon([point.x, point.y], points);
      case SHAPE_TYPES.RHOMBUS:
        // eslint-disable-next-line no-case-declarations
        const { left, top, width, height } = shape.configs;
        // eslint-disable-next-line no-case-declarations
        const ps = [
          [left + width / 2, top],
          [left + width, top + height / 2],
          [left + width / 2, top + height],
          [left, top + height / 2],
        ];
        return isPointInPolygon([point.x, point.y], ps);
      default:
        return false;
    }
  }

  isPointInStroke(point: Point, shape: ShapeBase) {
    const hitWidth = shape.getHitWidth();
    switch (shape.type) {
      case SHAPE_TYPES.RECT:
        // eslint-disable-next-line no-case-declarations
        let { left, top, width, height } = shape.configs;
        return (
          isPointOnLine(left, top, left + width, top, hitWidth, point) || // 上
          isPointOnLine(left, top, left, top + height, hitWidth, point) || // 左
          isPointOnLine(left, top + height, left + width, top + height, hitWidth, point) || // 下
          isPointOnLine(left + width, top, left + width, top + height, hitWidth, point)
        ); // 右
      case SHAPE_TYPES.CIRCLE:
        // eslint-disable-next-line no-case-declarations
        const { cx, cy, r } = shape.configs;
        return isPointOnCircle(cx, cy, r, hitWidth, point);
      case SHAPE_TYPES.QUADRATIC:
        // eslint-disable-next-line no-case-declarations
        let points = shape.get('points');
        return quadraticUtil.getProjectionDist([point.x, point.y], points[0], points[1], points[2]) <= hitWidth / 2;
      case SHAPE_TYPES.CUBIC:
        points = shape.get('points');
        return (
          cubicUtil.getProjectionDist([point.x, point.y], points[0], points[1], points[2], points[3]) <= hitWidth / 2
        );
      case SHAPE_TYPES.POLYGON:
        points = (shape as Polygon).getVertices();
        return isPointInPolygonStroke([point.x, point.y], points, hitWidth);
      case SHAPE_TYPES.RHOMBUS:
        left = shape.get('left');
        top = shape.get('top');
        width = shape.get('width');
        height = shape.get('height');
        return (
          isPointOnLine(left + width / 2, top, left + width, top + height / 2, hitWidth, point) || // 上
          isPointOnLine(left + width, top + height / 2, left + width / 2, top + height, hitWidth, point) || // 左
          isPointOnLine(left + width / 2, top + height, left, top + height / 2, hitWidth, point) || // 下
          isPointOnLine(left, top + height / 2, left + width / 2, top, hitWidth, point)
        ); // 右
      case SHAPE_TYPES.PATH:
        // eslint-disable-next-line no-case-declarations
        const segments = (shape as Path).getSegments();
        for (const segment of segments) {
          if (segment.type === 'line') {
            const [p0, p1] = segment.configs.points;
            if (isPointOnLine(p0.x, p0.y, p1.x, p1.y, hitWidth, point)) {
              return true;
            }
          } else if (segment.type === 'arc') {
            if (isPointOnArc(segment.configs.params, hitWidth, point)) {
              return true;
            }
          } else if (segment.type === 'cubic') {
            const [p1, p2, p3, p4] = segment.configs.points;
            if (
              cubicUtil.getProjectionDist([point.x, point.y], [p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], [p4.x, p4.y]) <=
              hitWidth
            ) {
              return true;
            }
          } else if (segment.type === 'quadratic') {
            const [p1, p2, p3] = segment.configs.points;
            if (
              quadraticUtil.getProjectionDist([point.x, point.y], [p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y]) <= hitWidth
            ) {
              return true;
            }
          }
        }
        return false;
      default:
        return false;
    }
  }

  isPointOnArrow(point: Point, shape: ShapeBase) {
    const { startArrow, endArrow, lineWidth } = shape.configs;
    let startPoint = null;
    let endPoint = null;
    switch (shape.type) {
      case 'quadratic':
        // eslint-disable-next-line no-case-declarations
        let { points } = shape.configs;
        startPoint = points[0];
        endPoint = points[2];
        break;
      case 'cubic':
        points = shape.get('points');
        startPoint = points[0];
        endPoint = points[3];
        break;
      case 'path':
        // eslint-disable-next-line no-case-declarations
        const segments = (shape as Path).getSegments();
        startPoint = segments[0].configs.points[0];
        startPoint = [startPoint.x, startPoint.y];
        endPoint = segments[segments.length - 1].configs.points[1];
        endPoint = [endPoint.x, endPoint.y];
        break;
      default:
        return false;
    }
    if (startArrow) {
      const { length, angle } = getArrowByLineWidth(lineWidth, startArrow);
      const startRad = (shape as Path).getStartRad(length);
      const points = getArrowBorder(startRad.rad, startPoint, length, angle);
      if (isPointOnSimpleArrow([point.x, point.y], points)) {
        return true;
      }
    }
    if (endArrow) {
      const { length, angle } = getArrowByLineWidth(lineWidth, endArrow);
      const endRad = (shape as Path).getEndRad(length);
      const points = getArrowBorder(endRad.rad, endPoint, length, angle);
      if (isPointOnSimpleArrow([point.x, point.y], points)) {
        return true;
      }
    }
    return false;
  }

  getActualPoint(point: Point, shape: ShapeBase) {
    if (shape.hasTransform()) {
      const matrix = [...shape.getMatrix()];
      invert(matrix);
      if (matrix) {
        return pointMultiply(point, matrix);
      }
    }
    return point;
  }
}

export function isPointInRect(bbox: BBox, point: Point): boolean {
  return (
    bbox.left <= point.x &&
    point.x <= bbox.left + bbox.width &&
    bbox.top <= point.y &&
    point.y <= bbox.top + bbox.height
  );
}

export function isPointOnLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number,
  point: Point
): boolean {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const bbox = {
    left: minX - lineWidth / 2,
    top: minY - lineWidth / 2,
    width: maxX - minX + lineWidth,
    height: maxY - minY + lineWidth,
  };
  if (!isPointInRect(bbox, point)) {
    return false;
  }
  const dist = getLineDist(point, x1, y1, x2, y2);
  return dist <= lineWidth / 2;
}

export function isPointOnCircle(cx: number, cy: number, r: number, lineWidth: number, point: Point): boolean {
  const dist = Math.sqrt(Math.pow(cx - point.x, 2) + Math.pow(cy - point.y, 2));
  const halfWidth = lineWidth / 2;
  return dist >= r - halfWidth && dist <= r + halfWidth;
}

export function isPointOnArc(params: any, lineWidth: number, point: Point): boolean {
  const [, cx, cy, rx, ry, theta, dTheta, psi, fs] = params;
  const r = rx > ry ? rx : ry;
  const scaleX = rx > ry ? 1 : rx / ry;
  const scaleY = rx > ry ? ry / rx : 1;
  let target = { ...point };
  const m = [1, 0, 0, 1, 0, 0];
  translate(m, -cx, -cy);
  rotate(m, -psi, true);
  scale(m, 1 / scaleX, 1 / scaleY);
  target = pointMultiply(target, m);
  return lineUtil.getArcProjectionDist(target, 0, 0, r, theta, theta + dTheta, 1 - fs) <= lineWidth / 2;
}
