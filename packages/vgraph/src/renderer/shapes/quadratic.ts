import { ShapeBase } from "../shape";
import { BBox, QuadraticConfigs, Point } from "../../typings/renderer";
import { getDimAt, getLength, getQuadraticBBox } from "../utils/quadratic";

export class Quadratic extends ShapeBase {
  private startRad: { x: number; y: number; rad: number } | null = null;
  private endRad: { x: number; y: number; rad: number } | null = null;
  private bbox: BBox | null = null;
  constructor(configs: QuadraticConfigs) {
    super(configs);
    this.type = "quadratic";
  }

  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      lineWidth: 1,
      points: [],
      startArrow: false,
      endArrow: false,
    };
  }

  setConfig(key: string, value: any): void {
    super.setConfig(key, value);
    if (key === "points") {
      this.startRad = null;
      this.endRad = null;
      this.bbox = null;
    }
  }

  calculateBBox(): BBox {
    if (this.bbox) {
      return this.bbox;
    }
    const [p0, p1, p2] = this.configs.points;
    const { minX, minY, maxX, maxY } = getQuadraticBBox(p0, p1, p2);
    this.bbox = {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return this.bbox;
  }

  getPointAt(t: number): Point {
    const [p0, p1, p2] = this.configs.points;
    return {
      x: getDimAt(t, p0[0], p1[0], p2[0]),
      y: getDimAt(t, p0[1], p1[1], p2[1]),
    };
  }

  getStartRad(): Point {
    if (this.startRad) {
      return this.startRad;
    }
    const [p0, p1] = this.configs.points;
    const rad = Math.atan2(p0[1] - p1[1], p0[0] - p1[0]);
    this.startRad = {
      x: Math.cos(rad),
      y: Math.sin(rad),
      rad,
    };
    return this.startRad;
  }

  getEndRad() {
    if (this.endRad) {
      return this.endRad;
    }
    const [, p1, p2] = this.configs.points;
    const rad = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    this.endRad = {
      x: Math.cos(rad),
      y: Math.sin(rad),
      rad,
    };
    return this.endRad;
  }

  getHitWidth() {
    const { lineWidth, hitWidth } = this.configs;
    return hitWidth || lineWidth;
  }

  getLength(iteration?: number) {
    const [p0, p1, p2] = this.configs.points;
    return getLength(p0, p1, p2, iteration || 24);
  }
}
