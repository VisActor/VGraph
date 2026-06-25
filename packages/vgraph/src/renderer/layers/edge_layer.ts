import { LayerBase } from "./base";
import LAYER_TYPES from "../../consts/layer_types";
import { BBox } from "../../typings/renderer";
import { getArrowByLineWidth } from "../utils/arrow";

export default class EdgeLayer extends LayerBase {
  type: string = LAYER_TYPES.EDGE;

  getDefaultConfigs() {
    return {
      source: null,
      target: null,
    };
  }

  shouldDraw(bbox: BBox): boolean {
    if (!this.visible || this.configs.opacity === 0) {
      return false;
    }
    const { source, target } = this.configs;
    const { left, top, width, height } = bbox;
    if (!source || !target) {
      return true;
    }
    // 视口之外同侧节点连线不画
    const sourceBox = source.getBBox();
    const targetBox = target.getBBox();
    if (sourceBox.left > left + width && targetBox.left > left + width) {
      return false;
    }
    if (
      sourceBox.left + sourceBox.width < left &&
      targetBox.left + targetBox.width < left
    ) {
      return false;
    }
    if (sourceBox.top > top + height && targetBox.top > top + height) {
      return false;
    }
    if (
      sourceBox.top + sourceBox.height < top &&
      targetBox.top + targetBox.height < top
    ) {
      return false;
    }
    return true;
  }

  getBBoxForHit(): BBox {
    const bbox = this.getBBox();
    let arrowLength = 0;
    const { startArrow, endArrow, lineWidth } = this.configs;
    // 如果有箭头，则扩展bbox判定范围
    if (startArrow) {
      arrowLength = Math.max(
        arrowLength,
        getArrowByLineWidth(lineWidth, startArrow).length
      );
    }
    if (endArrow) {
      arrowLength = Math.max(
        arrowLength,
        getArrowByLineWidth(lineWidth, endArrow).length
      );
    }
    if (arrowLength * 2 > lineWidth) {
      return {
        left: bbox.left - arrowLength,
        top: bbox.top - arrowLength,
        width: bbox.width + 2 * arrowLength,
        height: bbox.height + 2 * arrowLength,
      };
    }
    return bbox;
  }
}
