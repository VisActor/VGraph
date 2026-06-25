import { ArrowType } from "../../../typings/renderer";
import { ShapeBase } from "../../shape";
import cubicUtil from "../../utils/cubic";
import quadraticUtil from "../../utils/quadratic";
import lineUtil from "../../utils/line";
import polygon from "../../utils/polygon";
import {
  ARROW_LINE_WIDTH,
  getArrowByLineWidth,
  getArrowPoints,
} from "../../utils/arrow";

export default {
  rectPath(ctx: any, shape: ShapeBase) {
    const { left, top, width, height, radius } = shape.configs;
    if (!radius) {
      ctx.beginPath();
      ctx.rect(left, top, width, height);
      return;
    }
    let drawRadius = radius;
    if (typeof radius === "number") {
      drawRadius = [radius, radius, radius, radius];
    } else if (radius.length === 2) {
      // 左上 右上 右下 左下
      drawRadius = [radius[0], radius[1], radius[1], radius[0]];
    }
    const right = left + width;
    const bottom = top + height;
    ctx.beginPath();
    // 左上
    ctx.moveTo(left + drawRadius[0], top);
    // 右上
    ctx.lineTo(right - drawRadius[1], top);
    ctx.arc(
      right - drawRadius[1],
      top + drawRadius[1],
      drawRadius[1],
      -Math.PI / 2,
      0,
      false
    );
    // 右下
    ctx.lineTo(right, bottom - drawRadius[2]);
    ctx.arc(
      right - drawRadius[2],
      bottom - drawRadius[2],
      drawRadius[2],
      0,
      Math.PI / 2,
      false
    );
    // 左下
    ctx.lineTo(left + drawRadius[3], bottom);
    ctx.arc(
      left + drawRadius[3],
      bottom - drawRadius[3],
      drawRadius[3],
      Math.PI / 2,
      Math.PI,
      false
    );
    // 左上
    ctx.lineTo(left, top + drawRadius[0]);
    ctx.arc(
      left + drawRadius[0],
      top + drawRadius[0],
      drawRadius[0],
      Math.PI,
      (Math.PI * 3) / 2,
      false
    );
  },

  circlePath(ctx: any, shape: ShapeBase) {
    ctx.beginPath();
    const { cx, cy, r } = shape.configs;
    ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
  },

  pathPath(ctx: any, shape: any) {
    const segments = shape.getSegments();
    const { startArrow, endArrow, lineWidth } = shape.configs;
    const [p0] = segments[0].configs.points;
    const lastSegment = segments[segments.length - 1];
    const [p2] = lastSegment.configs.points;
    let startPoint = p0;
    let endPoint =
      lastSegment.configs.points[lastSegment.configs.points.length - 1];
    // 对于 cubic 和 quadratic 的 endPoint 不是 p3，所以之前的写法错误

    // TODO arc 不应该按直线距离去缩减，应缩减对应角度。由于实现复杂 && 粗椭圆弧线箭头不多见，现在暂时不处理
    if (startArrow) {
      const tempPoint = drawShapeStartArrow(
        ctx,
        shape,
        [p0.x, p0.y],
        [p0.x, p0.y]
      );
      if (segments[0].type !== "arc") {
        startPoint = {
          x: tempPoint[0],
          y: tempPoint[1],
        };
      }
    }
    if (endArrow) {
      const tempPoint = drawShapeEndArrow(
        ctx,
        shape,
        [endPoint.x, endPoint.y],
        [endPoint.x, endPoint.y]
      );
      if (lastSegment.type !== "arc") {
        endPoint = {
          x: tempPoint[0],
          y: tempPoint[1],
        };
      }
    }
    ctx.beginPath();
    if (startArrow && lineWidth > 1) {
      ctx.moveTo(startPoint.x, startPoint.y);
    } else {
      ctx.moveTo(p0.x, p0.y);
    }
    if (segments.length !== 1) {
      this.drawSinglePath(ctx, segments[0]);
    }
    for (let i = 1; i < segments.length - 1; i++) {
      const segment = segments[i];
      const points = segment.configs.points;
      if (segment.configs.move) {
        ctx.moveTo(points[0].x, points[0].y);
      }
      this.drawSinglePath(ctx, segment);
    }
    if (segments.length !== 1 && lastSegment.configs.move) {
      ctx.moveTo(p2.x, p2.y);
    }
    this.drawSinglePath(ctx, lastSegment, endPoint);
  },

  drawSinglePath(ctx: any, segment: any, endPoint?: any) {
    const points = segment.configs.points;
    const lastPoint = endPoint || points[points.length - 1];
    switch (segment.type) {
      case "line":
        ctx.lineTo(lastPoint.x, lastPoint.y);
        break;
      case "arc":
        lineUtil.drawArc(ctx, segment);
        break;
      case "cubic":
        ctx.bezierCurveTo(
          points[1].x,
          points[1].y,
          points[2].x,
          points[2].y,
          lastPoint.x,
          lastPoint.y
        );
        break;
      case "quadratic":
        ctx.quadraticCurveTo(
          points[1].x,
          points[1].y,
          lastPoint.x,
          lastPoint.y
        );
        break;
      default:
        break;
    }
  },

  quadraticPath(ctx: any, shape: any) {
    const { points, startArrow, endArrow } = shape.configs;
    const [p0, p1, p2] = points;
    let startPoint = p0;
    let endPoint = p2;
    if (startArrow) {
      startPoint = drawShapeStartArrow(ctx, shape, startPoint, p0);
    }
    if (endArrow) {
      endPoint = drawShapeEndArrow(ctx, shape, endPoint, p2);
    }
    quadraticUtil.drawPath(ctx, startPoint, p1, endPoint);
  },

  cubicPath(ctx: any, shape: any) {
    const { points, startArrow, endArrow } = shape.configs;
    const [p0, p1, p2, p3] = points;
    let startPoint = p0;
    let endPoint = p3;
    if (startArrow) {
      startPoint = drawShapeStartArrow(ctx, shape, startPoint, p0);
    }
    if (endArrow) {
      endPoint = drawShapeEndArrow(ctx, shape, endPoint, p3);
    }
    cubicUtil.drawPath(ctx, startPoint, p1, p2, endPoint);
  },

  imagePath(ctx: any, shape: any, imgCache: HTMLImageElement) {
    const { left, top, width, height } = shape.configs;
    ctx.drawImage(imgCache, left, top, width, height);
  },

  textPath(ctx: any, shape: any) {
    const { x, y, text, fontSize, textBaseline, fillStyle, strokeStyle } =
      shape.configs;
    if (text === "") {
      return;
    }
    ctx.font = shape.getFont();
    ctx.beginPath();
    const drawText = shape.getDrawText();
    const lineHeight = shape.getLineHeight();
    const textHeight = drawText.length * lineHeight;
    const gap = (lineHeight - (fontSize || 12)) / 2;
    let top = y;
    switch (textBaseline) {
      case "top":
      case "hanging":
        top = y + gap;
        break;
      case "middle":
        top = y - (textHeight - fontSize) / 2 + gap;
        break;
      default:
        top = y - textHeight + gap + fontSize;
    }
    for (const text of drawText) {
      if (strokeStyle) {
        ctx.strokeText(text, x, top);
      }
      if (fillStyle) {
        ctx.fillText(text, x, top);
      }
      top += lineHeight;
    }
  },

  iconPath(ctx: any, shape: any) {
    const { x, y, size, fontFamily, iconText } = shape.configs;
    ctx.font = `${size}px ${fontFamily}`;
    ctx.beginPath();
    ctx.fillText(iconText, x, y);
  },

  polygonPath(ctx: any, shape: any) {
    const points = shape.getVertices();
    polygon.drawPath(ctx, points);
  },

  rhombusPath(ctx: any, shape: any) {
    const { left, top, width, height, radius } = shape.configs;
    ctx.beginPath();
    const cx = left + width / 2;
    const cy = top + height / 2;
    const right = left + width;
    const bottom = top + height;
    if (!radius) {
      ctx.lineJoin = "round";
      ctx.moveTo(cx, top);
      ctx.lineTo(right, cy);
      ctx.lineTo(cx, bottom);
      ctx.lineTo(left, cy);
      ctx.closePath();
      return;
    }
    const hAngle = Math.atan(height / width);
    const hOffsetX = radius / Math.sin(hAngle);
    const hOffsetY = (hOffsetX * height) / width;
    const vAngle = Math.atan(width / height);
    const vOffsetY = radius / Math.sin(vAngle);
    const vOffsetX = (vOffsetY * width) / height;
    // 上
    ctx.moveTo(cx - vOffsetX, top + vOffsetY);
    ctx.quadraticCurveTo(cx, top, cx + vOffsetX, top + vOffsetY);
    // 右
    ctx.lineTo(right - hOffsetX, cy - hOffsetY);
    ctx.quadraticCurveTo(right, cy, right - hOffsetX, cy + hOffsetY);
    // 下
    ctx.lineTo(cx + vOffsetX, bottom - vOffsetY);
    ctx.quadraticCurveTo(cx, bottom, cx - vOffsetX, bottom - vOffsetY);
    // 左
    ctx.lineTo(left + hOffsetX, cy + hOffsetY);
    ctx.quadraticCurveTo(left, cy, left + hOffsetX, cy - hOffsetY);
    ctx.closePath();
  },
};

function drawShapeStartArrow(
  ctx: any,
  shape: any,
  startPoint: number[],
  point: number[]
) {
  const { startArrow, lineWidth } = shape.configs;
  const { height, length, angle } = getArrowByLineWidth(lineWidth, startArrow);
  const startRad = shape.getStartRad(length);
  // TODO arc 不应该按直线距离去缩减，应缩减对应角度。由于实现复杂 && 粗椭圆弧线箭头不多见，现在暂时不处理
  if (lineWidth > 1 || ctx.globalAlpha !== 1) {
    startPoint = [
      point[0] - startRad.x * height,
      point[1] - startRad.y * height,
    ];
  }
  drawArrow(ctx, startArrow, startRad.rad, point, length, angle);
  if (shape.get("lineDash")) {
    ctx.setLineDash(shape.get("lineDash"));
  }
  return startPoint;
}

function drawShapeEndArrow(
  ctx: any,
  shape: any,
  endPoint: number[],
  point: number[]
) {
  const { endArrow, lineWidth } = shape.configs;
  const { height, length, angle } = getArrowByLineWidth(lineWidth, endArrow);
  const endRad = shape.getEndRad(length);
  if (lineWidth > 1 || ctx.globalAlpha !== 1) {
    endPoint = [point[0] - endRad.x * height, point[1] - endRad.y * height];
  }
  drawArrow(ctx, endArrow, endRad.rad, point, length, angle);
  if (shape.get("lineDash")) {
    ctx.setLineDash(shape.get("lineDash"));
  }
  return endPoint;
}

function drawArrow(
  ctx: any,
  arrowConfigs: ArrowType,
  angle: number,
  p1: number[],
  arrowLength: number,
  arrowAngle: number
) {
  ctx.setLineDash([]);
  if (typeof arrowConfigs !== "boolean" && arrowConfigs.type === "circle") {
    const r = arrowLength / 2;
    const cx = p1[0] - r * Math.cos(angle);
    const cy = p1[1] - r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
  } else {
    const points = getArrowPoints(angle, p1, arrowLength, arrowAngle);
    polygon.drawPath(ctx, points);
  }

  const fillStyle = ctx.fillStyle;
  const lineJoin = ctx.lineJoin;
  const lineWidth = ctx.lineWidth;

  if (
    typeof arrowConfigs !== "boolean" &&
    arrowConfigs.type === "default-round"
  ) {
    ctx.lineJoin = "round";
  }

  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = ARROW_LINE_WIDTH;

  ctx.fill();
  if (ctx.globalAlpha === 1) {
    ctx.stroke();
  }

  ctx.lineJoin = lineJoin;
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = fillStyle;
}
