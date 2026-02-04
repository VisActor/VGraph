import { normalizePadding } from "../../utils/graph";
import { LayerBase } from "./base";
import { BBox } from "../../typings/renderer";
import LAYER_TYPES from "../../consts/layer_types";

export default class NodeLayer extends LayerBase {
  type: string = LAYER_TYPES.NODE;

  getDefaultConfigs() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  setConfig(key: string, value: any): void {
    if (!this.matrix && key !== "x" && key !== "y") {
      super.setConfig(key, value);
      return;
    }
    const matrix = this.getMatrix();
    // 如果是 x, y 移动，更新 matrix。以防在有 transform 的时候配置更新失效
    if (key === "x") {
      const origin = this.get("x");
      matrix[4] += (value - origin) * matrix[0];
    }
    if (key === "y") {
      const origin = this.get("y");
      matrix[5] += (value - origin) * matrix[3];
    }
    super.setConfig(key, value);
  }

  getBBox(): BBox {
    let { width, height } = this.configs;
    const matrix = this.getMatrix();
    width *= matrix[0];
    height *= matrix[3];
    return {
      left: matrix[4] - width / 2,
      top: matrix[5] - height / 2,
      width,
      height,
    };
  }

  getBBoxForHit(): BBox {
    const bbox = this.getBBox();
    const appendSize = this.get("appendSize");
    const hitWidth = this.get("hitWidth");
    if (appendSize) {
      const padding = normalizePadding(appendSize);
      const matrix = this.getMatrix();
      bbox.left -= padding[3] * matrix[0];
      bbox.top -= padding[0] * matrix[3];
      bbox.width += (padding[1] + padding[3]) * matrix[0];
      bbox.height += (padding[0] + padding[2]) * matrix[3];
    }
    if (hitWidth) {
      bbox.left -= hitWidth / 2;
      bbox.top -= hitWidth / 2;
      bbox.width += hitWidth;
      bbox.height += hitWidth;
    }
    return bbox;
  }

  shouldDraw(bbox: BBox): boolean {
    if (!this.visible || this.configs.opacity === 0) {
      return false;
    }
    const shapeBox = this.getBBox();
    const { left, top, width, height } = shapeBox;

    if (left + width < bbox.left || left > bbox.left + bbox.width) {
      return false;
    }
    if (top + height < bbox.top || top > bbox.top + bbox.height) {
      return false;
    }
    return true;
  }

  hasTransform() {
    return true;
  }

  getMatrix(): number[] {
    const { x, y } = this.configs;
    const matrix = this.matrix;
    if (!matrix) {
      return [1, 0, 0, 1, x, y];
    }
    return matrix;
  }
}
