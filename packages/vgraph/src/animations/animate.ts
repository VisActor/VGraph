import { Canvas } from "../renderer";
import { ANIMATE_TYPES } from "../consts/animate_types";
import { Loading } from "./animates/loading";
import { Flash } from "./animates/flash";
import { Diffuse } from "./animates/diffuse";
import { Flow } from "./animates/flow";
import { Grow } from "./animates/grow";
import { Trail } from "./animates/trail";
import { AnimateConfigs } from "../typings/graph";

const animates = {
  [ANIMATE_TYPES.LOADING]: Loading,
  [ANIMATE_TYPES.FLASH]: Flash,
  [ANIMATE_TYPES.DIFFUSE]: Diffuse,
  [ANIMATE_TYPES.FLOW]: Flow,
  [ANIMATE_TYPES.GROW]: Grow,
  [ANIMATE_TYPES.TRAIL]: Trail,
};

export function animate(canvas: Canvas, configs: AnimateConfigs) {
  // 自定义动画
  if (!configs.type) {
    if (!configs.common?.configs && !configs.common?.onFrame) {
      console.warn("Animate transform configs required");
      return;
    }
    return canvas.animate({
      target: configs.target?.getKeyShape(),
      duration: 500,
      repeat: false,
      delay: 0,
      easing: "easelinear",
      ...configs.common,
    });
  }
  const effect = animates[configs.type];
  if (!effect) {
    console.warn(`Cannot find animate effect: ${configs.type}`);
    return;
  }
  return effect.init(canvas, configs);
}
