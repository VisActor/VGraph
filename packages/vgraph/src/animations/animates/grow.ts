import { Canvas } from "../../renderer";
import { ANIMATE_TYPES } from "../../consts/animate_types";
import { AnimateBase } from "./base";
import { AnimateConfigs } from "../../typings/graph";

export const Grow = Object.assign({}, AnimateBase, {
  type: ANIMATE_TYPES.FLOW,
  execute(canvas: Canvas, configs: AnimateConfigs, onFinish: () => void) {
    const edge = configs.target;
    edge!.layer.toFront();
    const path = edge!.getKeyShape();
    const length = path.getLength();
    const cache = {};
    const customConfigs: Record<string, unknown> = configs.custom || {};
    customConfigs.lineDash = [0, length];
    Object.keys(customConfigs!).forEach((key: string) => {
      cache[key] = path.get(key);
      path.set(key, customConfigs![key]);
    });
    const common = configs.common;
    return canvas.animate({
      target: path,
      configs: {
        lineDash: [length, 0],
      },
      duration: common!.duration!,
      ...common,
      onFinish() {
        Object.keys(cache).forEach((key: string) => {
          path.set(key, cache[key]);
        });
        onFinish?.();
        canvas.draw();
      },
    });
  },
  getAnimateType() {
    return "edge";
  },
  getDefaultCommonConfigs(configs: AnimateConfigs) {
    return {
      duration: 800,
      delay: 0,
      repeat: 1,
      ...configs.common,
    };
  },
});
