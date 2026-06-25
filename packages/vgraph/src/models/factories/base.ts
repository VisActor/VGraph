import { Layer, ShapeBase, Text, Rect } from "../../renderer";
import { updateAppendSize } from "../append_size";

export default {
  type: "",
  extends: null,
  drawCurrentLabel: true,

  getExtends(): any {
    return this.extends;
  },

  init(layer: Layer, data: any) {
    const { configs, extendShape } = this.beforeInit(layer, data);
    let keyShape = this.shape(layer, configs);
    if (!keyShape) {
      keyShape = extendShape;
    }
    keyShape.directSet("_keyShape", true);
    // eslint-disable-next-line eqeqeq
    if (configs.label != null && this.drawCurrentLabel) {
      this.label(layer, configs);
    }
    this.afterInit(layer, configs);
    return keyShape;
  },

  update(layer: Layer, data: any) {
    if (!this.shouldUpdate()) {
      layer.clear();
      return this.init(layer, data);
    }
    const configs = this.beforeUpdate(layer, data);
    this.updateShapes(layer, configs);
    this.afterUpdate(layer, configs);
  },

  beforeInit(layer: Layer, data: any) {
    const configs = this.getConfigsForShape({ ...data });
    const extend = this.getExtends();
    let extendShape = null;
    if (extend) {
      extendShape = extend.init(layer, configs);
    }
    return { configs, extendShape };
  },

  shape(layer: Layer, configs: any) {
    return layer;
  },

  afterInit(layer: Layer, data: any) {
    return layer;
  },

  shouldUpdate() {
    if (!this.updateShapes) {
      return false;
    }
    const extend = this.getExtends();
    if (extend && !extend.shouldUpdate()) {
      return false;
    }
    return true;
  },

  beforeUpdate(layer: Layer, data: any) {
    const configs = this.getConfigsForShape({ ...data });
    const extend = this.getExtends();
    if (extend) {
      extend.update(layer, configs);
    }
    return configs;
  },

  updateShapes(layer: Layer, configs: any) {
    const keyShape = this.getKeyShape(layer);
    if (!keyShape || keyShape.destroyed) {
      return;
    }
    keyShape.set(this.getShapeConfigs(configs));
    if (!this.drawCurrentLabel) {
      return;
    }
    const labelShape = layer.find((shape) => shape.get("_label"));
    let backShape = layer.find((shape) => shape.get("_background"));
    if (configs.label && !labelShape) {
      this.label(layer, configs);
    } else if (labelShape && !configs.label) {
      layer.remove(labelShape);
      backShape && layer.remove(backShape);
    } else if (labelShape) {
      const labelConfigs = this.getLabelConfigs(layer, configs);
      const backgroundConfigs = configs.label.background;
      labelShape.set(labelConfigs);
      labelShape.setMatrix([1, 0, 0, 1, 0, 0]);
      if (backgroundConfigs && !backShape) {
        backShape = this.getBackgroundShape(labelShape, labelConfigs);
        layer.addBefore(backShape, labelShape);
      } else if (!backgroundConfigs && backShape) {
        layer.remove(backShape);
        backShape = null;
      } else if (backShape) {
        backShape.set(this.getBackgroundConfigs(labelShape, labelConfigs));
      }
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(labelConfigs.rotate)) {
        const { x, y, rawRotate } = labelConfigs;
        if (!rawRotate) {
          labelShape.translate(-x, -y);
        }
        labelShape.rawRotate(labelConfigs.rotate, true);
        if (!rawRotate) {
          labelShape.translate(x, y);
        }
        delete labelConfigs.rotate;
      }
      if (backShape) {
        backShape.setMatrix(labelShape.getMatrix().concat());
      }
    }
  },

  afterUpdate(layer: Layer, data: any) {
    return layer;
  },

  setStateStyles(layer: Layer, stateStyles: Record<string, unknown>) {
    const keyShape = this.getKeyShape(layer);
    if (!keyShape || keyShape.destroyed) {
      return;
    }
    keyShape.set(stateStyles);
  },

  clearStates(layer: Layer) {
    const cache = layer.get("_cache");
    const keyShape = this.getKeyShape(layer);
    if (keyShape) {
      keyShape.set(cache);
      layer.directSet("_cache", undefined);
    }
  },

  getConfigsForShape(data: any) {
    return data;
  },

  getConfigsForUpdate(data: any, originData: any) {
    return data;
  },

  getKeyShape(layer: Layer): ShapeBase | null {
    return layer.find((shape) => shape.get("_keyShape"));
  },

  getDefaultConfigs() {
    return {};
  },

  getShapeConfigs(configs: any) {
    return configs;
  },

  getUpdateShapeConfigs(configs: any, updateData: any) {
    return configs;
  },

  label(layer: Layer, configs: any) {
    const labelConfigs = this.getLabelConfigs(layer, configs);
    const rotate = labelConfigs.rotate;
    const label = new Text(labelConfigs);

    const appendSize = [0, 0, 0, 0];
    let backShape: any;
    if (labelConfigs.background) {
      backShape = this.getBackgroundShape(label, labelConfigs);
      layer.add(backShape);
    }

    if (rotate) {
      const { x, y, rawRotate } = labelConfigs;
      if (!rawRotate) {
        label.translate(-x, -y);
      }
      label.rawRotate(rotate, true);
      if (!rawRotate) {
        label.translate(x, y);
      }
      layer.exactMatch = true;
    }
    if (backShape) {
      backShape.setMatrix(label.getMatrix().concat());
    }
    layer.add(label);
    if (labelConfigs.capture !== undefined) {
      label.capture = labelConfigs.capture;
    }
    const bbox = label.getBBox();
    updateAppendSize(appendSize, bbox, configs);
    label.directSet("_label", true);
    if (label.capture && appendSize.some((value) => value !== 0)) {
      layer.set("__labelAppendSize", appendSize);
    }
    return label;
  },

  getBackgroundShape(label: ShapeBase, labelConfigs: any) {
    const backgroundConfigs = this.getBackgroundConfigs(label, labelConfigs);
    const backShape = new Rect(backgroundConfigs!);
    backShape.set("_background", true);
    return backShape;
  },

  getBackgroundConfigs(label: ShapeBase, labelConfigs: any) {
    const background = labelConfigs.background;
    return background;
  },

  getLabelConfigs(layer: Layer, configs: any) {
    return configs.label;
  },
};
