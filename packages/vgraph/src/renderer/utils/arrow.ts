import { ArrowType } from "../../typings/renderer";
import { isPointInTriangle } from "./polygon";
// 箭头自带1像素的线宽
export const ARROW_LINE_WIDTH = 1;
export function getArrowByLineWidth(
  lineWidth: number,
  arrowConfigs: ArrowType
) {
  let width;
  let height;
  if (typeof arrowConfigs !== "boolean") {
    width = arrowConfigs.width;
    height = arrowConfigs.height;
  }
  // 箭头宽度=max(线宽,6)，箭头高度=箭头宽度+4
  if (!width) {
    width = Math.max(lineWidth, 6);
  }
  if (!height) {
    height = width + 4;
  }

  const halfWidth = width / 2;
  return {
    length: Math.hypot(halfWidth, height),
    width,
    height,
    angle: Math.atan(halfWidth / height) * 2,
  };
}

export function getArrowPoints(
  angle: number,
  p1: number[],
  arrowLength: number,
  arrowAngle: number
): number[][] {
  // 获取箭头的端点
  const length = arrowLength - ARROW_LINE_WIDTH;
  const halfAngle = arrowAngle / 2;
  angle -= Math.PI;
  const pointX = p1[0] + ARROW_LINE_WIDTH * Math.cos(angle);
  const pointY = p1[1] + ARROW_LINE_WIDTH * Math.sin(angle);
  const leftX = pointX + length * Math.cos(angle + halfAngle);
  const leftY = pointY + length * Math.sin(angle + halfAngle);
  const rightX = pointX + length * Math.cos(angle - halfAngle);
  const rightY = pointY + length * Math.sin(angle - halfAngle);
  return [
    [leftX, leftY],
    [pointX, pointY],
    [rightX, rightY],
  ];
}

export function getArrowBorder(
  angle: number,
  p1: number[],
  arrowLength: number,
  arrowAngle: number
): number[][] {
  // 获取箭头的端点
  const halfAngle = arrowAngle / 2;
  angle -= Math.PI;
  const leftX = p1[0] + arrowLength * Math.cos(angle + halfAngle);
  const leftY = p1[1] + arrowLength * Math.sin(angle + halfAngle);
  const rightX = p1[0] + arrowLength * Math.cos(angle - halfAngle);
  const rightY = p1[1] + arrowLength * Math.sin(angle - halfAngle);
  return [[leftX, leftY], p1, [rightX, rightY]];
}

export function isPointOnSimpleArrow(
  point: number[],
  arrowPoints: number[][]
): boolean {
  return isPointInTriangle(point, arrowPoints);
}
