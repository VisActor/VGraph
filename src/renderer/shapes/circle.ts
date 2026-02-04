import { ShapeBase } from '../shape';
import { BBox, CircleConfigs } from '../../typings/renderer';

export class Circle extends ShapeBase {
  constructor(configs: CircleConfigs) {
    super(configs);
    this.type = 'circle';
  }
  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      cx: 0,
      cy: 0,
      r: 0,
      lineWidth: 1,
    }
  }
  calculateBBox():BBox {
    const { cx, cy, r } = this.configs;
    return {
      left: cx - r,
      top: cy - r,
      width: r * 2,
      height: r * 2,
    };
  }
}
