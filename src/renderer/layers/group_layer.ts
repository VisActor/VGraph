import { normalizePadding } from '../../utils/graph';
import { LayerBase } from './base';
import { BBox, LayerConfigs } from '../../typings/renderer';
import { ShapeBase } from '../shape';
import { Rect } from '../shapes/rect';
import LAYER_TYPES from '../../consts/layer_types';

export default class GroupLayer extends LayerBase {
  type: string = LAYER_TYPES.GROUP;
  private shape: ShapeBase | null = null;

  getDefaultConfigs() {
    return {
      padding: 12,
      shape: false,
    }
  }
  init(configs: LayerConfigs) {
    super.init(configs);
    if (configs.shape) {
      this.shape = new Rect(configs.shape);
    }
  }

  setConfig(key: string, value: any) {
    super.setConfig(key, value);
    if (key === 'shape') {
      if (this.shape && value) {
        this.shape.set(value);
      } else if (this.shape && !value) {
        this.shape.destroy();
        this.shape = null;
      } else {
        this.shape = new Rect(value);
      }
    }
    if (key === 'padding') {
      this.bbox = null;
    }
  }

  add(shape: ShapeBase) {
    super.add(shape);
    this.bbox = null;
  }

  addBefore(shape: ShapeBase, beforeShape: ShapeBase) {
    super.addBefore(shape, beforeShape);
    this.bbox = null;
  }

  remove(shape: ShapeBase, destroy = true) {
    super.remove(shape, destroy);
    this.bbox = null;
  }

  shouldDraw(bbox: BBox): boolean {
    if (!this.visible || this.configs.opacity === 0) {
      return false;
    }
    const groupBox = this.calculateBBox();
    if (groupBox.left > bbox.left + bbox.width || groupBox.left + groupBox.width < bbox.left) {
      return false;
    }
    if (groupBox.top > bbox.top + bbox.height || groupBox.top + groupBox.height < bbox.top) {
      return false;
    }
    return true;
  }

  calculateBBox(): BBox {
    if (this.bbox) {
      return this.bbox;
    }
    const bbox = super.calculateBBox();
    const padding = normalizePadding(this.configs.padding);
    this.bbox = {
      left: bbox.left - padding[3],
      top: bbox.top - padding[0],
      width: bbox.width + padding[1] + padding[3],
      height: bbox.height + padding[0] + padding[2],
    };
    if (this.shape) {
      this.shape.directSet('left', this.bbox.left);
      this.shape.directSet('top', this.bbox.top);
      this.shape.directSet('width', this.bbox.width);
      this.shape.directSet('height', this.bbox.height);
    }
    return this.bbox;
  }
}
