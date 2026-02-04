import { ShapeBase } from '../shape';
import { BBox, QuadraticConfigs, Point } from '../../typings/renderer';
import { getDimAt, getLength, getCubicBox } from '../utils/cubic';

export class Cubic extends ShapeBase {
  private startRad: { x: number; y: number; rad: number } | null = null;
  private endRad: { x: number; y: number; rad: number } | null = null;
  private bbox: BBox | null = null;
  private length = 0;
  constructor(configs: QuadraticConfigs) {
    super(configs);
    this.type = 'cubic';
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
    if (key === 'points') {
      this.startRad = null;
      this.endRad = null;
      this.bbox = null;
    }
  }

  calculateBBox(): BBox {
    if (this.bbox) {
      return this.bbox;
    }
    const [p0, p1, p2, p3] = this.configs.points;
    const { minX, minY, maxX, maxY } = getCubicBox(p0, p1, p2, p3);
    this.bbox = {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return this.bbox;
  }

  getPointAt(t: number): Point {
    const [p0, p1, p2, p3] = this.configs.points;
    return {
      x: getDimAt(t, p0[0], p1[0], p2[0], p3[0]),
      y: getDimAt(t, p0[1], p1[1], p2[1], p3[1]),
    };
  }

  getStartRad(arrowLength?: number) {
    if (this.startRad) {
      return this.startRad;
    }
    const length = this.getLength();
    const p0 = this.configs.points[0];
    const p1 = this.getPointAt(arrowLength ? arrowLength / length : 0.1);
    const rad = Math.atan2(p0[1] - p1.y, p0[0] - p1.x);
    this.startRad = {
      x: Math.cos(rad),
      y: Math.sin(rad),
      rad,
    };
    return this.startRad;
  }

  getEndRad(arrowLength?: number) {
    if (this.endRad) {
      return this.endRad;
    }
    const p3 = this.configs.points[3];
    const length = this.getLength();
    const p2 = this.getPointAt(arrowLength ? (1 - arrowLength / length) : 0.9);
    const rad = Math.atan2(p3[1] - p2.y, p3[0] - p2.x);
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
    if (this.length) {
      return this.length;
    }
    const [p0, p1, p2, p3] = this.configs.points;
    return getLength(p0, p1, p2, p3, iteration || 24);
  }
}
