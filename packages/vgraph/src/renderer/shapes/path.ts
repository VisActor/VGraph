import { ShapeBase } from "../shape";
import { BBox, PathConfigs, Point } from "../../typings/renderer";
import * as cubicUtil from "../utils/cubic";
import lineUtil from "../utils/line";
import { ellipseUtil, getSegmentsBBox, pathToSegments } from "../utils/path";
import * as quadraticUtil from "../utils/quadratic";
export class Path extends ShapeBase {
  private segments: any = null;
  private length: number | null = null;
  private startRad: { x: number; y: number; rad: number } | null = null;
  private endRad: { x: number; y: number; rad: number } | null = null;
  private bbox: BBox | null = null;

  constructor(configs: PathConfigs) {
    super(configs);
    this.type = "path";
  }

  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      lineWidth: 1,
      hitWidth: 0,
      path: [],
      startArrow: false,
      endArrow: false,
    };
  }

  setConfig(key: string, value: any): void {
    super.setConfig(key, value);
    // 如果设置了可能修改文字布局的属性，清空文本缓存
    if (key === "path") {
      this.segments = null;
      this.startRad = null;
      this.endRad = null;
      this.bbox = null;
    }
  }

  getSegments() {
    const { path, startArrow, endArrow } = this.configs;
    if (this.segments) {
      return this.segments;
    }
    const { segments, length } = pathToSegments(path, startArrow, endArrow);
    this.segments = segments;
    this.length = length;
    return this.segments || pathToSegments(path, startArrow, endArrow);
  }

  getStartRad(arrowLength?: number) {
    if (this.startRad) {
      return this.startRad;
    }
    const segments = this.getSegments();
    const [p0, p1, p2, p3] = segments[0].configs.points;
    let rad;
    if (segments[0].type === "line") {
      rad = Math.atan2(p0.y - p1.y, p0.x - p1.x);
    } else if (segments[0].type === "cubic") {
      const t = arrowLength ? arrowLength / segments[0].length : 0.1;
      const pr = {
        x: cubicUtil.getDimAt(t, p0.x, p1.x, p2.x, p3.x),
        y: cubicUtil.getDimAt(t, p0.y, p1.y, p2.y, p3.y),
      };
      rad = Math.atan2(p0.y - pr.y, p0.x - pr.x);
    } else if (segments[0].type === "quadratic") {
      const t = arrowLength ? arrowLength / segments[0].length : 0.1;
      const pr = {
        x: quadraticUtil.getDimAt(t, p0.x, p1.x, p2.x),
        y: quadraticUtil.getDimAt(t, p0.y, p1.y, p2.y),
      };
      rad = Math.atan2(p0.y - pr.y, p0.x - pr.x);
    } else {
      const [, cx, cy, , , , , fs] = segments[0].configs.params;
      if (fs) {
        rad = Math.PI / 2 + Math.atan2(cy - p0.y, cx - p0.x);
      } else {
        rad = Math.PI / 2 + Math.atan2(p0.y - cy, p0.x - cx);
      }
    }
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
    const segments = this.getSegments();
    const segment = segments[segments.length - 1];
    const [p0, p1, p2, p3] = segment.configs.points;
    let rad;
    if (segment.type === "line") {
      rad = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    } else if (segment.type === "cubic") {
      const t = arrowLength ? 1 - arrowLength / segment.length : 0.9;

      const pr = {
        x: cubicUtil.getDimAt(t, p0.x, p1.x, p2.x, p3.x),
        y: cubicUtil.getDimAt(t, p0.y, p1.y, p2.y, p3.y),
      };
      // console.log(t,pr);
      rad = Math.atan2(p3.y - pr.y, p3.x - pr.x);
    } else if (segment.type === "quadratic") {
      const t = arrowLength ? 1 - arrowLength / segment.length : 0.9;
      const pr = {
        x: quadraticUtil.getDimAt(t, p0.x, p1.x, p2.x),
        y: quadraticUtil.getDimAt(t, p0.y, p1.y, p2.y),
      };
      rad = Math.atan2(p2.y - pr.y, p2.x - pr.x);
    } else {
      const [, cx, cy, , , , , fs] = segment.configs.params;
      if (fs) {
        rad = Math.PI / 2 + Math.atan2(p1.y - cy, p1.x - cx);
      } else {
        rad = Math.PI / 2 + Math.atan2(cy - p1.y, cx - p1.x);
      }
    }
    this.endRad = {
      x: Math.cos(rad),
      y: Math.sin(rad),
      rad,
    };
    return this.endRad;
  }

  getPointAt(t: number): Point {
    const segments = this.getSegments();
    const length = this.getLength()!;
    let currentLen = 0;
    const pointLen = length * t;
    let pointSegment;
    if (length === 0) {
      pointSegment = segments[0];
      return {
        x: pointSegment.configs.points[0].x,
        y: pointSegment.configs.points[0].y,
      };
    }
    if (t === 0) {
      pointSegment = segments[0];
    } else {
      for (const segment of segments) {
        if (currentLen < pointLen && currentLen + segment.length >= pointLen) {
          pointSegment = segment;
          break;
        }
        currentLen += segment.length;
      }
      t =
        1 - (currentLen + pointSegment.length - pointLen) / pointSegment.length;
    }
    if (pointSegment.type === "line") {
      const points = pointSegment.configs.points;
      return {
        x: lineUtil.getDimAt(t, points[0].x, points[1].x),
        y: lineUtil.getDimAt(t, points[0].y, points[1].y),
      };
    } else if (pointSegment.type === "arc") {
      const [, cx, cy, rx, ry, theta, dTheta, psi] =
        pointSegment.configs.params;
      t = dTheta * t;
      return {
        x: ellipseUtil.xAt(psi, rx, ry, cx, theta + t),
        y: ellipseUtil.yAt(psi, rx, ry, cy, theta + t),
      };
    } else if (pointSegment.type === "cubic") {
      const points = pointSegment.configs.points;
      return {
        x: cubicUtil.getDimAt(
          t,
          points[0].x,
          points[1].x,
          points[2].x,
          points[3].x
        ),
        y: cubicUtil.getDimAt(
          t,
          points[0].y,
          points[1].y,
          points[2].y,
          points[3].y
        ),
      };
    } else if (pointSegment.type === "quadratic") {
      // quadratic
      const points = pointSegment.configs.points;
      return {
        x: quadraticUtil.getDimAt(t, points[0].x, points[1].x, points[2].x),
        y: quadraticUtil.getDimAt(t, points[0].y, points[1].y, points[2].y),
      };
    }
    console.error(
      `[vital.shape.path.getPointAt] unsupported point segment type: ${pointSegment.type}, fallback to { x: NaN, y: NaN }`
    );
    return { x: NaN, y: NaN };
  }

  calculateBBox(): BBox {
    if (this.bbox) {
      return this.bbox;
    }
    const segments = this.getSegments();
    const bbox = getSegmentsBBox(segments);
    this.bbox = bbox;
    return bbox;
  }

  getLength() {
    if (!this.segments) {
      this.getSegments();
    }
    return this.length;
  }
}
