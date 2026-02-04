import { Canvas } from '../../renderer';
import { ANIMATE_TYPES } from '../../consts/animate_types';
import { AnimateBase } from './base';
import { Edge } from '../../models/entities';
import { AnimateConfigs } from '../../typings/graph';

type TrailConfigs = {
  target: Edge;
  custom: {
    length?: number;
    getColorStops: (ratio: number) => { stop: number, color: string}[];
  };
  common: {
    duration: number;
    repeat?: boolean | number;
    [k: string]: any;
  };
};

export const Trail = Object.assign({}, AnimateBase, {
  type: ANIMATE_TYPES.TRAIL,
  execute(canvas: Canvas, configs: TrailConfigs, onFinish: () => void) {
    const { custom, common, target } = configs;
    const { length, getColorStops } = custom;
    const keyShape = target.getKeyShape();
    const pathLength = keyShape.getLength();
    if (pathLength === 0) {
      return;
    }
    const shape = keyShape.clone();
    shape.set({
      startArrow: false,
      endArrow: false,
    });
    target.layer.add(shape);
    const dashRatio = length! / pathLength;
    const ctx = canvas.getCanvasDom().getContext('2d');
    const cache: Record<string, CanvasGradient> = {};
    return canvas.animate({
      target: shape,
      ...common,
      onFrame(ratio: number) {
        let gradient = cache[ratio];
        if (!gradient) {
          const fromPoint = keyShape.getPointAt(ratio);
          const toPoint = keyShape.getPointAt(Math.min(ratio + dashRatio, 1));
          gradient = ctx.createLinearGradient(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
          const colorStops = getColorStops!(ratio);
          for (const stop of colorStops) {
            gradient.addColorStop(stop.stop, stop.color);
          }
          cache[ratio] = gradient;
        }
        shape.set('strokeStyle', gradient);
        canvas.draw();
      },
      onFinish() {
        shape.destroy();
        onFinish?.();
        canvas.draw();
      },
    });
  },
  getAnimateType() {
    return 'edge';
  },
  getDefaultCommonConfigs(configs: AnimateConfigs) {
    return {
      duration: 1000,
      repeat: true,
      delay: 0,
      ...configs.common,
    };
  },
  getDefaultCustomConfigs(configs: AnimateConfigs) {
    const custom = configs.custom;
    return {
      getColorStops() {
        return [
          { stop: 0, color: 'rgba(255, 255, 255, 0)' },
          { stop: 0.5, color: 'rgba(46, 98, 241, 1)' },
          { stop: 1, color: 'rgba(201, 205, 212, 0)'}
        ]
      },
      ...custom,
      length: custom?.length || 30,
    };
  }
});
