import { Canvas } from '../../renderer/canvas';
import { ANIMATE_TYPES } from '../../consts/animate_types';
import { AnimateBase } from './base';
import { AnimateConfigs } from '../../typings/graph';

export const Flash = Object.assign({}, AnimateBase, {
  type: ANIMATE_TYPES.FLASH,
  execute(canvas: Canvas, configs: AnimateConfigs, onFinish: () => void) {
    const layer = configs.target!.layer;
    const opacity = layer.get('opacity');
    const keyShape = configs.target!.getKeyShape();
    layer.set('opacity', 1);
    const { custom, common } = configs;
    let cache: Record<string, unknown> = {};
    if (custom) {
      cache = {};
      Object.keys(custom).forEach((key: string) => {
        cache![key] = keyShape.get(key);
        keyShape.set(key, custom![key]);
      });
    }
    return canvas.animate({
      target: layer,
      configs: {
        opacity: 0,
      },
      duration: common!.duration!,
      ...common,
      onFinish() {
        layer.set('opacity', opacity);
        if (cache) {
          Object.keys(cache).forEach((key: string) => {
            keyShape.set(key, cache[key]);
          });
        }
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
});