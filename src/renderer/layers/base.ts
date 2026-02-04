import { BBox, LayerConfigs } from '../../typings/renderer';
import { ShapeBase } from '../shape';

export interface ILayer extends ShapeBase {
  children: (LayerBase | ShapeBase)[];

  add: (shape: ShapeBase) => void;
  addBefore: (shape: ShapeBase, beforeShape: ShapeBase) => void;
  remove: (shape: ShapeBase) => void;
  findById: (id: string) => ShapeBase | null;
  find: (fn: () => boolean) => ShapeBase | null;
  findAll: (fn: () => boolean) => ShapeBase[] | null;

  shouldDraw: (bbox: BBox) => boolean;

  getBBoxForHit: () => BBox;

  clear: () => void;
  destroy: () => void;
}

export class LayerBase extends ShapeBase implements ILayer {
  type = 'layer';
  children: (LayerBase | ShapeBase)[] = [];
  exactMatch = false;
  bbox: BBox | null = null;

  constructor(configs: LayerConfigs = {}) {
    super(configs);
  }

  getDefaultConfigs(): Record<string, unknown> {
    return {};
  }

  calculateBBox(): BBox {
    const children = this.children;
    if (this.children.length === 0) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const child of children) {
      if (child.visible) {
        const bbox = child.getBBox();
        if (bbox.width !== 0 && bbox.height !== 0) {
          minX = Math.min(bbox.left, minX);
          maxX = Math.max(bbox.left + bbox.width, maxX);
          minY = Math.min(bbox.top, minY);
          maxY = Math.max(bbox.top + bbox.height, maxY);
        }
      }
    }
    if (minX === Infinity) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    }
    this.bbox = {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  add(shape: ShapeBase) {
    this.prepareShape(shape);
    this.children.push(shape);
    shape.setParent(this);
  }

  addBefore(shape: ShapeBase, beforeShape: ShapeBase) {
    this.prepareShape(shape);
    const index = this.children.indexOf(beforeShape);
    if (index >= 0) {
      this.children.splice(index, 0, shape);
    } else {
      this.children.push(shape);
    }
    shape.setParent(this);
  }

  prepareShape(shape: ShapeBase) {
    const parent = shape.getParent();
    if (parent) {
      parent.remove(shape, false);
    }
  }

  remove(shape: ShapeBase, destroy = true) {
    const index = this.children.indexOf(shape);
    if (index >= 0) {
      this.children.splice(index, 1);
    }
    if (destroy) {
      shape.destroy();
    }
  }

  findById(id: string): ShapeBase | null {
    return this.find((shape) => shape.get('id') === id);
  }

  find(fn: (shape: ShapeBase) => boolean): ShapeBase | null {
    for (const child of this.children) {
      if (child.isLayer()) {
        const shape = (child as LayerBase).find(fn);
        if (shape) {
          return shape;
        }
      } else if (fn(child)) {
        return child;
      }
    }
    return null;
  }

  findAll(fn: (shape: ShapeBase) => boolean): ShapeBase[] {
    let result = [];
    for (const child of this.children) {
      if (child.isLayer()) {
        const shapes = (child as LayerBase).findAll(fn);
        if (shapes.length > 0) {
          return (result = result.concat(shapes));
        }
      } else if (fn(child)) {
        result.push(child);
      }
    }
    return result;
  }

  getBBoxForHit() {
    return this.getBBox();
  }

  clear(destroy = true) {
    const children = this.children;
    if (destroy) {
      while (children.length !== 0) {
        children[children.length - 1].destroy();
        children.pop();
      }
    }
    this.children = [];
  }

  isLayer(): boolean {
    return true;
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.clear();
    super.destroy();
  }
}
