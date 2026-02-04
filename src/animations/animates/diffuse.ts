import { Canvas } from '../../renderer';
import { ANIMATE_TYPES } from '../../consts/animate_types';
import { AnimateBase } from './base';
import { Node } from '../../models/entities';
import { AnimateConfigs } from '../../typings/graph';

type DiffuseConfigs = {
  target: Node;
  custom: {
    fillStyle?: string;
    strokeStyle?: string;
    opacity?: string;
    size: number[];
  };
  common: {
    duration: number;
    repeat?: boolean | number;
    [k: string]: unknown;
  };
};

export const Diffuse = Object.assign({}, AnimateBase, {
  type: ANIMATE_TYPES.DIFFUSE,
  execute(canvas: Canvas, configs: DiffuseConfigs, onFinish: () => void) {
    const { custom, common } = configs;
    const node = configs.target;
    const keyShape = node.getKeyShape();
    const shape = keyShape.clone();
    shape.set({
      strokeStyle: null,
      opacity: 0.3,
      fillStyle: node.get('color') || '#3073FF',
      ...custom,
    });
    shape.set(custom);
    node.layer.addBefore(shape, keyShape);
    if (shape.type === 'circle') {
      return canvas.animate({
        target: shape,
        configs: {
          opacity: 0,
          r: custom.size[0] / 2,
        },
        ...common,
        onFinish() {
          shape.destroy();
          onFinish?.();
          canvas.draw();
        }
      });
    }
    return canvas.animate({
      target: shape,
      configs: {
        left: -custom.size[0] / 2,
        top: -custom.size[1] / 2,
        width: custom.size[0],
        height: custom.size[1],
        opacity: 0,
      },
      ...common,
      onFinish() {
        shape.destroy();
        onFinish?.();
        canvas.draw();
      },
    });
  },
  getDefaultCommonConfigs(configs: AnimateConfigs) {
    return {
      duration: 400,
      repeat: 2,
      delay: 0,
      ...configs.common,
    };
  },
  getDefaultCustomConfigs(configs: AnimateConfigs) {
    const target = configs.target;
    const custom = configs.custom;
    return {
      ...custom,
      size: custom?.size || [ target!.get('width') + 20, target!.get('height') + 20 ],
    };
  }
});
