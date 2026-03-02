import {
  easeLinear,
  easeCubic,
  easePoly,
  easeQuad,
  easeSin,
  easeExp,
  easeBounce,
} from "d3-ease";
import { interpolate } from "d3-interpolate";
import { Timer, timer, now } from "d3-timer";
import { uuid } from "../utils/common";
import { Shape, Canvas } from "../renderer";
import { AnimationConfigs } from "../typings/renderer";
import { GRAPH_EVENTS, CANVAS_EVENTS } from "../consts/meta_events";

type Animator = AnimationConfigs & {
  startTime: number;
  interpolates: Record<string, (ratio: number) => number | string>;
  delay: number;
};

const DEFAULT_ANIMATE_CONFIGS = {
  repeat: false,
  easing: null,
  delay: 0,
};

const EASE_FUNCTIONS = {
  easeLinear,
  easeCubic,
  easePoly,
  easeQuad,
  easeSin,
  easeExp,
  easeBounce,
};

export default class Animation {
  canvas: Canvas;
  timeline: Timer;
  animating = false;
  queue: Animator[] = [];
  time = 0;
  pauseTime = 0;
  autoDraw = true;
  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.timeline = timer(this.animate);
    this.timeline.stop();

    // 在平移缩放场景下，动画不进行自主渲染以免发生 dom 节点渲染脱节问题
    canvas.on(CANVAS_EVENTS.PAN_ZOOM_START, () => {
      if (this.animating) {
        // this.pause();
        this.autoDraw = false;
      }
    });

    canvas.on(CANVAS_EVENTS.PAN_ZOOM_END, () => {
      if (this.animating) {
        // this.restart();
        this.autoDraw = true;
      }
    });
  }

  start() {
    this.timeline.restart(this.animate);
    this.animating = true;
    this.canvas.emit(GRAPH_EVENTS.ANIMATION_START);
  }

  pause() {
    this.timeline.stop();
    this.pauseTime = now();
  }

  restart() {
    this.timeline.restart(this.animate, 0, this.pauseTime);
    this.pauseTime = 0;
  }

  animate = (elapsed: number) => {
    this.time = elapsed;
    if (!this.queue.length) {
      return;
    }
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const animator = this.queue[i];
      if (animator.target.destroyed) {
        this.removeAnimatorByIndex(i);
        continue;
      }

      const finished = this.execute(elapsed, animator);
      if (finished) {
        this.removeAnimatorByIndex(i);
        if (this.queue.length === 0) {
          this.stop();
        }
      }
    }
    this.autoDraw && this.canvas.draw();
  };

  execute(time: number, animator: Animator): boolean {
    const { startTime, delay, duration, easing, target } = animator;
    if (time < startTime + delay) {
      return false;
    }
    const elapsed = time - startTime - delay;
    let ratio: number;
    if (animator.repeat) {
      if (
        typeof animator.repeat === "number" &&
        elapsed / duration > animator.repeat
      ) {
        this.lastFrame(animator);
        return true;
      }
      ratio = (elapsed % duration) / duration;
      ratio = this.easeRatio(ratio, easing);
    } else {
      ratio = elapsed / duration;
      if (ratio < 1) {
        ratio = this.easeRatio(ratio, easing);
      } else {
        this.lastFrame(animator);
        return true;
      }
    }
    if (animator.onFrame) {
      const conf = animator.onFrame(ratio);
      if (conf) {
        target.set(conf);
      }
    } else {
      Object.keys(animator.interpolates).forEach((k) => {
        target.set(k, animator.interpolates[k](ratio));
      });
    }
    return false;
  }

  lastFrame(animator: Animator) {
    const { target, onFrame, configs } = animator;
    if (onFrame) {
      const conf = onFrame(1);
      if (conf) {
        target.set(conf);
      }
    } else {
      target.set(configs);
    }
  }

  addAnimator(configs: AnimationConfigs) {
    if (!configs.id) {
      configs.id = uuid(10);
    }
    if (configs.target.animating) {
      this.mergeAnimationConfigs(configs);
    } else {
      this.addAnimatorToEnd(configs);
    }
    if (!this.animating) {
      this.start();
    }
    return configs.id!;
  }

  easeRatio(ratio: number, easing = "easeLinear"): number {
    if (EASE_FUNCTIONS[easing]) {
      return EASE_FUNCTIONS[easing](ratio);
    }
    return ratio;
  }

  addAnimatorToEnd(configs: AnimationConfigs) {
    const animator: Animator = {
      ...DEFAULT_ANIMATE_CONFIGS,
      ...configs,
      startTime: this.time,
      interpolates: {},
    };
    if (!animator.onFrame) {
      const target = configs.target;
      Object.keys(animator.configs).forEach((k) => {
        // TODO 支持 transform
        animator.interpolates[k] = interpolate(
          target.get(k),
          animator.configs[k]
        );
      });
    }
    configs.target.animating = true;
    this.queue.push(animator);
  }

  mergeAnimationConfigs(configs: AnimationConfigs) {
    const target = configs.target;
    const animator = this.findAnimator(target);
    if (!animator) {
      this.addAnimatorToEnd(configs);
      return;
    }
    if (animator.onFrame) {
      this.removeAnimator(animator.id as string);
    } else if (configs.configs) {
      Object.keys(configs.configs).forEach((k) => {
        if (animator.configs[k]) {
          delete animator.configs[k];
          delete animator.interpolates[k];
        }
      });
      if (Object.keys(configs.configs).length === 0) {
        this.removeAnimator(configs.id as string);
      }
    }
    this.addAnimatorToEnd(configs);
  }

  removeAnimator(id: string) {
    const index = this.queue.findIndex(
      (configs: Animator) => configs.id === id
    );
    if (index >= 0) {
      this.removeAnimatorByIndex(index);
    }
  }

  removeAnimatorByIndex(i: number) {
    const animator = this.queue[i];
    if (!animator) {
      return;
    }
    animator.target.animating = false;
    animator.onFinish?.();
    this.queue.splice(i, 1);
    if (this.queue.length === 0) {
      this.animating = false;
      this.time = 0;
      this.timeline.stop();
      this.canvas.emit(GRAPH_EVENTS.ANIMATION_END);
    }
  }

  stopAnimator(animator: Animator) {
    animator.target.animating = false;
    if (animator.onFinish) {
      animator.onFinish();
    }
  }

  stop() {
    if (!this.animating) {
      return;
    }
    this.animating = false;
    this.pauseTime = 0;
    for (const animator of this.queue) {
      this.stopAnimator(animator);
    }
    this.queue = [];
    this.time = 0;
    this.timeline.stop();
    this.canvas.emit("animationstopped");
  }

  findAnimator(shape: Shape) {
    return this.queue.find((animator) => animator.target === shape);
  }

  findAnimatorIndex(shape: Shape) {
    return this.queue.findIndex((animator) => animator.target === shape);
  }

  destroy() {
    this.stop();
    this.queue = [];
  }
}
