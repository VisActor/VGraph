import { Layer, Circle, Rect, Path, ShapeBase, Icon } from '../../renderer';
import { ELEMENT_TYPES, ANCHOR_TYPES } from '../../consts/node_types';
import Base from './base';
import { ShapeEvent } from '../../typings/event';
import { NodeData } from '../../typings/data';
import { AnchorConfigs } from '../../typings/model';
import { register, unRegister } from './register';

const BASE_CONFIGS = {
  rect: Rect,
  dot: Circle,
  path: Path,
  icon: Icon,
};

export const anchorBase = Object.assign({}, Base, {
  type: 'dot',

  init(layer: Layer, data: AnchorConfigs, nodeConfigs: NodeData, position: [number, number]) {
    const configs = this.beforeInit(layer, data);
    const anchorShape = this.shape(layer, configs, nodeConfigs, position);
    if (configs.onClick) {
      anchorShape.on('click', (e: ShapeEvent) => {
        configs.onClick!(e, nodeConfigs);
      });
    }
    if (configs.onMouseEnter) {
      anchorShape.on('mouseenter', (e: ShapeEvent) => {
        configs.onMouseEnter!(e, nodeConfigs);
      });
    }
    if (configs.onMouseLeave) {
      anchorShape.on('mouseleave', (e: ShapeEvent) => {
        configs.onMouseLeave!(e, nodeConfigs);
      });
    }
    anchorShape.directSet('_anchor', true);
    this.afterInit(layer, configs);
    if (configs.show !== 'always') {
      anchorShape.hide();
    }
    anchorShape.set('showType', configs.show);
    return anchorShape;
  },

  beforeInit(layer: Layer, data: AnchorConfigs) {
    return data;
  },

  afterInit(layer: Layer, configs: AnchorConfigs) {
    return;
  },

  shape(layer: Layer, configs: AnchorConfigs, nodeConfigs: NodeData, position: [number, number]) {
    if (!BASE_CONFIGS[this.type]) {
      return;
    }
    const shapeConfigs = this.getShapeConfigs(configs, nodeConfigs, position);
    const shape = new BASE_CONFIGS[this.type](shapeConfigs);
    layer.add(shape);
    return shape;
  },

  getDefaultStyles(configs: AnchorConfigs, nodeConfigs: NodeData) {
    let customStyles = {};
    if (configs.setStyles) {
      customStyles = configs.setStyles(nodeConfigs);
    }
    return {
      size: configs.size ?? 8,
      ...customStyles,
    };
  },

  getShapeConfigs(configs: AnchorConfigs, nodeConfigs: NodeData, position: [number, number]) {
    const shapeConfigs = this.calculateShapeConfigs(configs, nodeConfigs, position);
    const styles = this.getDefaultStyles(configs, nodeConfigs);
    return {
      ...shapeConfigs,
      ...styles,
    };
  },

  calculateShapeConfigs(configs: AnchorConfigs, nodeConfigs: NodeData, position: [number, number]) {
    return {
      position,
      width: (configs.size ?? 8) / 2,
      height: (configs.size ?? 8) / 2,
      left: position[0],
      top: position[1],
    };
  },

  shouldUpdate() {
    return !!this.update;
  },

  beforeUpdate(data: AnchorConfigs, nodeConfigs: NodeData) {
    return data;
  },

  afterUpdate(shape: ShapeBase, configs: AnchorConfigs, nodeConfigs: NodeData) {
    return;
  },

  update(shape: ShapeBase, data: AnchorConfigs, nodeConfigs: NodeData, position: [number, number]) {
    if (!this.shouldUpdate()) {
      const layer = shape.getParent();
      layer.clear();
      this.init(layer, data, nodeConfigs, position);
      return;
    }
    const configs = this.beforeUpdate(data, nodeConfigs);
    this.updateShapes(shape, configs, nodeConfigs, position);
    this.afterUpdate(shape, configs, nodeConfigs);
  },

  updateShapes(shape: ShapeBase, configs: AnchorConfigs, nodeConfigs: NodeData, position: [number, number]) {
    const shapeConfigs = this.getShapeConfigs(configs, nodeConfigs, position);
    shape.set(shapeConfigs);
  },

  updatePosition(shape: ShapeBase, position: number[]) {
    shape.set({
      left: position[0],
      top: position[1],
    });
  },
});

export function registerMetaAnchors() {
  register(
    ELEMENT_TYPES.ANCHOR,
    ANCHOR_TYPES.DOT,
    {
      type: ANCHOR_TYPES.DOT,
      getShapeConfigs(configs: AnchorConfigs, nodeConfigs: NodeData, position: [number, number]) {
        const styles = this.getDefaultStyles(configs, nodeConfigs);
        return {
          ...styles,
          position,
          cx: position[0],
          cy: position[1],
          r: styles.size / 2,
        };
      },

      updatePosition(shape: ShapeBase, position: number[]) {
        shape.set({
          cx: position[0],
          cy: position[1],
        });
      },
    },
    anchorBase
  );
}

export function registerAnchor(name: string, configs: any) {
  register(ELEMENT_TYPES.ANCHOR, name, configs, anchorBase);
}

export function unRegisterAnchor(name: string) {
  unRegister(ELEMENT_TYPES.ANCHOR, name);
}
