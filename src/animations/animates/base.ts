import { Canvas } from '../../renderer';
import { AnimateConfigs } from '../../typings/graph';

export const AnimateBase = {
  init(canvas: Canvas, configs: AnimateConfigs) {
    if (!this.shouldExecute(configs)) {
      return;
    }
    configs.custom = this.getDefaultCustomConfigs(configs);
    configs.common = this.getDefaultCommonConfigs(configs);
    const onFinish = configs.common.onFinish;
    const fn = onFinish ? () => {
      try {
        onFinish?.();
      } catch (e) {
        console.warn(e);
      }
    } : undefined;
    delete configs.common.onFinish;
    return this.execute(canvas, configs, fn);
  },

  shouldExecute(configs: AnimateConfigs) {
    const { target } = configs;
    if (!target) {
      console.warn('Animate target required');
      return false;
    }
    if (target!.type !== this.getAnimateType()) {
      console.warn(`Cannot perform animate on target type: ${target!.type}`);
      return false;
    }
    return true;
  },

  execute(canvas: Canvas, configs: AnimateConfigs, onFinish?: () => void) { },

  getAnimateType() {
    return 'node';
  },

  getDefaultCommonConfigs(configs: AnimateConfigs) {
    return {
      duration: 500,
      repeat: false,
      delay: 0,
      ...configs.common,
    };
  },

  getDefaultCustomConfigs(configs: AnimateConfigs) {
    return configs.custom;
  },
};