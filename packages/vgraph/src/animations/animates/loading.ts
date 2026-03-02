import { Canvas, Circle } from "../../renderer";
import { ANIMATE_TYPES } from "../../consts/animate_types";
import { AnimateBase } from "./base";
import { Node } from "../../models/entities";
import { AnimateConfigs } from "../../typings/graph";

type LoadingConfigs = {
  target: Node;
  custom: {
    r: number;
    x: number;
    y: number;
    lineWidth: number;
    color: string;
    mask: Record<string, unknown>;
  };
  common: {
    duration: number;
    [k: string]: unknown;
  };
};

export const Loading = Object.assign({}, AnimateBase, {
  type: ANIMATE_TYPES.LOADING,
  execute(canvas: Canvas, configs: LoadingConfigs, onFinish: () => void) {
    const node = configs.target;
    const { custom, common } = configs;
    if (custom.mask) {
      const keyShape = node.getKeyShape();
      const shape = keyShape.clone();
      shape.set(custom.mask);
      node.layer.add(shape);
      node.layer.set("__loadingMask", shape);
    }
    const r = custom.r;
    const length = Math.PI * r * 2;
    const circle = new Circle({
      cx: custom.x,
      cy: custom.y,
      r,
      lineWidth: custom.lineWidth,
      strokeStyle: custom.color,
      lineDash: [length * 0.75, length * 0.25],
      lineDashOffset: 0,
    });
    node.layer.add(circle);
    node.layer.set("__loadingCircle", circle);
    return canvas.animate({
      target: circle,
      configs: {
        lineDashOffset: length,
      },
      ...common,
      onFinish() {
        node.layer.get("__loadingMask")?.destroy();
        node.layer.get("__loadingCircle").destroy();
        onFinish?.();
        canvas.draw();
      },
    });
  },
  getDefaultCommonConfigs(configs: AnimateConfigs) {
    return {
      duration: 1000,
      repeat: true,
      ...configs.common,
    };
  },
  getDefaultCustomConfigs(configs: AnimateConfigs) {
    let mask: Record<string, string> | boolean = false;
    if (configs.custom?.mask) {
      if (configs.custom?.mask === true) {
        mask = {
          fillStyle: "rgba(255, 255, 255, 0.6)",
        };
      } else {
        mask = Object.assign(configs.custom.mask, {
          fillStyle: "rgba(255, 255, 255, 0.6)",
        });
      }
    }
    return {
      x: 0,
      y: 0,
      r: 8,
      lineWidth: 2,
      color: "#3073FF",
      ...configs.custom,
      mask,
    };
  },
});
