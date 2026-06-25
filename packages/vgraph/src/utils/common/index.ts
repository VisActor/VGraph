import { cloneDeep } from "./clone";

export function uuid(len = 8) {
  // 62 ** 8 = 281474976710656; sqrt(281474976710656) = 16777216
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  let uid: any = "";
  const radix = chars.length - 1;

  for (let i = 0; i < len; i++) {
    uid += chars[Math.round(Math.random() * radix)];
  }
  return uid;
}

export function animationFrame(fn: any) {
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame(fn);
  }

  // tslint:disable-next-line: no-shadowed-variable
  return (fn: any) => {
    return setTimeout(fn, 17);
  };
}

export { cloneDeep } from "./clone";
export { throttle } from "./throttle";
export { debounce } from "./debounce";

function removeRenderConfigs(configs: Record<string, any>) {
  delete configs.strokeStyle;
  delete configs.fillStyle;
  delete configs.lineDash;
  delete configs.radius;
  delete configs.opacity;
  delete configs.shadowBlur;
  delete configs.shadowColor;
  delete configs.shadowOffsetX;
  delete configs.shadowOffsetY;
  delete configs.cursor;
  delete configs.hitWidth;
}

export function getDefaultBizData(entity: any) {
  const configs = cloneDeep(entity.configs);
  if (entity.type === "node") {
    // 节点绘图配置项
    delete configs.anchors;
    delete configs.icons;
    delete configs.color;
    delete configs.disableAnchors;
    delete configs.disableNodeEvent;
    // 内置节点配置项
    delete configs.image;
    delete configs.icon;
    delete configs.theme;
    delete configs.size;
  } else if (entity.type === "edge") {
    // 连线绘图配置项
    delete configs.styles;
    delete configs.startArrow;
    delete configs.endArrow;
    delete configs.__source;
    delete configs.__target;
    // 这部分在编辑场景保存的时候需要
    // delete configs.startPoint;
    // delete configs.endPoint;
    // delete configs.controlPoints;
  } else {
    // 分组绘图配置项
    delete configs.padding;
    delete configs.linkNode;
    delete configs.anchors;
    delete configs.title;
    delete configs.titlePosition;
    delete configs.renderGroupTitle;
  }
  removeRenderConfigs(configs);
  return configs;
}
