import { ShapeBase } from "../shape";
import { BBox, RhombusConfigs } from "../../typings/renderer";

export class Rhombus extends ShapeBase {
  constructor(configs: RhombusConfigs) {
    super(configs);
    this.type = "rhombus";
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
