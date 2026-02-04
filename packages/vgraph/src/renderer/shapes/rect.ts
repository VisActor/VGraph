import { ShapeBase } from "../shape";
import { BBox, RectConfigs } from "../../typings/renderer";

export class Rect extends ShapeBase {
  constructor(configs: RectConfigs) {
    super(configs);
    this.type = "rect";
  }
  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      radius: 0,
      lineWidth: 1,
    };
  }
  calculateBBox(): BBox {
    const { left, top, width, height } = this.configs;
    return {
      left,
      top,
      width,
      height,
    };
  }
}
