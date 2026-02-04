import { EventEmitter } from "eventemitter3";
import {
  cloneDeep,
  isGradient,
  translate,
  rotate,
  scale,
  changedMatrix,
  pointMultiply,
} from "../utils/";
import { BBox, BaseConfigs } from "../typings/renderer";
import { COLOR_CONFIGS } from "../consts/canvas_configs";
import { LayerBase } from "./layers/base";
export interface IShape {
  readonly type: string;
  matrix: number[] | null;
  visible: boolean;
  capture: boolean;
  animating: boolean;

  // 获取包围盒大小
  getBBox: () => BBox;

  // 平移
  translate: (x: number, y: number) => void;
  // 缩放
  scale: (xRatio: number, yRatio?: number) => void;
  // 最常用的中心旋转
  rotate: (deg: number, radian: boolean) => void;
  // 原生的根据 matrix 原点旋转
  rawRotate: (deg: number, radian: boolean) => void;
  // 克隆 shape
  clone: () => IShape;
  // 显示
  show: () => void;
  // 隐藏
  hide: () => void;
  // 获取属性值
  get: (k: string) => any;
  // 设置属性值
  set: ((k: string, v: unknown) => IShape) &
    ((data: Record<string, unknown>) => IShape);

  // 图形事件相关
  on: (eventName: string, callback: () => void) => void;
  off: (eventName: string, callback: () => void) => void;
  emit: (eventName: string, data: Record<string, unknown>) => void;
}

export class ShapeBase extends EventEmitter implements IShape {
  type = "shape";
  matrix: number[] | null = null;
  visible = true;
  capture = true;
  animating = false;
  configs: any = {};
  destroyed = false;
  parent: LayerBase | null = null;

  constructor(configs: BaseConfigs) {
    super();
    this.init(configs);
  }

  init(configs: BaseConfigs): void {
    const defaultConfigs = this.getDefaultConfigs();
    this.configs = Object.assign({}, defaultConfigs, configs);
  }

  getDefaultConfigs(): Record<string, unknown> {
    return {};
  }

  get(key: string): any {
    return this.configs[key];
  }

  set(...args: any[]): ShapeBase {
    const [key, value] = args;
    if (typeof key === "object") {
      for (const k of Object.keys(key)) {
        this.setConfig(k, key[k]);
      }
      return this;
    }
    this.setConfig(key, value);
    return this;
  }

  directSet(key: string, value: unknown) {
    this.configs[key] = value;
  }

  setConfig(key: string, value: unknown) {
    const configs = this.configs;
    if (!configs[key] || configs[key] !== value) {
      const parent = this.getParent();
      if (
        parent &&
        [
          "left",
          "top",
          "width",
          "height",
          "cx",
          "cy",
          "r",
          "x",
          "y",
          "textAlign",
          "textBaseline",
        ].includes(key)
      ) {
        parent.bbox = null;
      }
      if (COLOR_CONFIGS.includes(key) && isGradient(configs[key])) {
        delete this[configs[key]];
      }
    }
    this.configs[key] = value;
  }

  getBBox(): BBox {
    const originBox = this.calculateBBox();
    const matrix = this.matrix;
    let { left, top, width, height } = originBox;
    const { strokeStyle, lineWidth = 1 } = this.configs;

    if (strokeStyle) {
      left -= lineWidth / 2;
      top -= lineWidth / 2;
      width += lineWidth;
      height += lineWidth;
    }
    if (!matrix) {
      return { left, top, width, height };
    }
    const leftTop = pointMultiply(
      {
        x: left,
        y: top,
      },
      matrix
    );
    const leftBottom = pointMultiply(
      {
        x: left,
        y: top + height,
      },
      matrix
    );
    const rightTop = pointMultiply(
      {
        x: left + width,
        y: top,
      },
      matrix
    );
    const rightBottom = pointMultiply(
      {
        x: left + width,
        y: top + height,
      },
      matrix
    );
    const minLeft = Math.min(
      leftTop.x,
      leftBottom.x,
      rightTop.x,
      rightBottom.x
    );
    const minTop = Math.min(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y);
    const maxLeft = Math.max(
      leftTop.x,
      leftBottom.x,
      rightTop.x,
      rightBottom.x
    );
    const maxTop = Math.max(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y);

    return {
      left: minLeft,
      top: minTop,
      width: maxLeft - minLeft,
      height: maxTop - minTop,
    };
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  translate(x: number, y: number): void {
    let matrix = this.getMatrix();
    matrix = translate(matrix, x, y);
    this.matrix = matrix;
  }

  scale(sx: number, sy?: number): void {
    let matrix = this.getMatrix();
    if (!sy) {
      sy = sx;
    }
    matrix = scale(matrix, sx, sy);
    this.matrix = matrix;
  }

  rotate(deg: number, radian = false): void {
    let matrix = this.getMatrix();
    const bbox = this.getBBox();
    const cx = bbox.left + bbox.width / 2;
    const cy = bbox.top + bbox.height / 2;
    matrix = translate(matrix, -cx, -cy);
    matrix = rotate(matrix, deg, radian);
    matrix = translate(matrix, cx, cy);
    this.matrix = matrix;
  }

  rawRotate(deg: number, radian = false): void {
    let matrix = this.getMatrix();
    matrix = rotate(matrix, deg, radian);
    this.matrix = matrix;
  }

  getMatrix() {
    if (this.matrix) {
      return this.matrix;
    }
    return [1, 0, 0, 1, 0, 0];
  }

  setMatrix(matrix: number[]) {
    this.matrix = matrix;
  }

  clearMatrix() {
    this.matrix = null;
  }

  hasTransform(): boolean {
    if (!this.matrix) {
      return false;
    }
    const m = this.getMatrix();
    return changedMatrix(m);
  }

  calculateBBox(): BBox {
    return {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
  }

  setParent(layer: LayerBase | null) {
    this.parent = layer;
  }

  getParent() {
    return this.parent!;
  }

  shouldDraw(bbox: BBox = { left: 0, top: 0, width: 0, height: 0 }) {
    return (
      this.visible &&
      (this.configs.opacity === undefined || this.configs.opacity !== 0)
    );
  }

  isLayer(): boolean {
    return false;
  }

  getHitWidth() {
    const { lineWidth, hitWidth } = this.configs;
    return hitWidth || lineWidth;
  }

  clone() {
    const clone = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
    clone.configs = cloneDeep(this.configs);
    return clone;
  }

  toFront() {
    const parent = this.getParent();
    if (!parent) {
      return;
    }
    const index = parent.children.indexOf(this);
    if (index >= 0) {
      parent.children.splice(index, 1);
    }
    parent.children.push(this);
  }

  toBack() {
    const parent = this.getParent();
    if (!parent) {
      return;
    }
    const index = parent.children.indexOf(this);
    if (index >= 0) {
      parent.children.splice(index, 1);
    }
    parent.children.unshift(this);
  }

  destroy() {
    const destroyed = this.destroyed;
    if (destroyed) {
      return;
    }
    if (this.getParent()) {
      this.getParent()?.remove(this, false);
    }
    this.removeAllListeners();
    this.setParent(null);
    // TODO stop animate
    this.configs = {};
    this.destroyed = true;
  }
}
