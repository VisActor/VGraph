import { Canvas } from "../../renderer";
import { ANIMATE_TYPES } from "../../consts/animate_types";
import { AnimateBase } from "./base";
import { AnimateConfigs } from "../../typings/graph";

export const Flow = Object.assign({}, AnimateBase, {
  type: ANIMATE_TYPES.FLOW,
  execute(canvas: Canvas, configs: AnimateConfigs, onFinish: () => void) {
    const edge = configs.target;
    edge!.layer.toFront();
    const path = edge!.getKeyShape();
    const animateLineDash = configs.custom!.lineDash;
    const cache = {};
    const customConfigs = configs.custom;
    Object.keys(customConfigs!).forEach((key: string) => {
      cache[key] = path.get(key);
      path.set(key, customConfigs![key]);
    });
    const common = configs.common;
    return canvas.animate({
      target: path,
      configs: {
        lineDashOffset: -animateLineDash[0] * 3,
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
      duration: 400,
      delay: 0,
      repeat: true,
      ...configs.common,
    };
  },
  getDefaultCustomConfigs(configs: AnimateConfigs) {
    return {
      strokeStyle: "#3073FF",
      lineWidth: 1,
      lineDash: [4, 2],
      lineDashOffset: 0,
      ...configs.custom,
    };
  },
});
