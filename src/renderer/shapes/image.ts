import { BBox, ImageConfigs } from '../../typings/renderer';
import { ShapeBase } from '../shape';

export class Image extends ShapeBase {
  constructor(configs: ImageConfigs) {
    super(configs);
    this.type = 'image';
  }
  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      crossOrigin: 'anonymous'
    }
  }

  calculateBBox():BBox {
    const { left, top, width, height } = this.configs;
    return {
      left,
      top,
      width,
      height,
    };
  }
}
