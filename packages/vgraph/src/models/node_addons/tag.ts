import { Text, Rect, Icon, Layer } from "../../renderer";
import { normalizePadding } from "../../utils";
import { GraphEvent } from "../../typings/event";

export type SingleTagOptions = {
  text: string;
  left: number;
  top: number;
  id?: string;
  maxWidth?: number;
  theme?: "rect" | "capsule";
  label?: {
    fillStyle?: string;
    fontSize?: number;
    lineHeight?: number;
    fontFamily?: string;
    textOverflow?: "ellipsis" | "clip";
    triggerId?: string;
    [k: string]: unknown;
  };
  background?: {
    fillStyle?: string;
    strokeStyle?: string;
    padding?: number | number[];
    radius?: number;
    [k: string]: unknown;
  };
  icon?: {
    icon: string;
    fillStyle?: string;
    size?: number;
    triggerId?: string;
    cursor?: string;
    onClick?: (e: GraphEvent, layer: Layer) => void;
  };
  close?: {
    icon: string;
    fillStyle?: string;
    size?: number;
    cursor?: string;
    onClose?: (e: GraphEvent, layer: Layer) => void;
  };
};

export type MultiTagOptions = {
  text: string;
  id?: string;
  visible?: boolean;
  label?: {
    fillStyle?: string;
    fontSize?: number;
    lineHeight?: number;
    fontFamily?: string;
    textOverflow?: "ellipsis" | "clip";
    triggerId?: string;
    cursor?: string;
    [k: string]: unknown;
  };
  background?: {
    fillStyle?: string;
    strokeStyle?: string;
    radius?: number;
    padding?: number | number[];
  };
  icon?: {
    icon: string;
    fillStyle?: string;
    size?: number;
    triggerId?: string;
    cursor?: string;
    onClick?: (e: GraphEvent, layer: Layer) => void;
    [k: string]: unknown;
  };
  close?: {
    icon: string;
    fillStyle?: string;
    size?: number;
    cursor?: string;
    onClose?: (e: GraphEvent, layer: Layer) => void;
    [k: string]: unknown;
  };
};

export type TagsOptions = {
  left: number;
  top: number;
  maxWidth?: number;
  id?: string;
  theme?: "rect" | "capsule";
  tags: MultiTagOptions[];
  overflowTag?: {
    label?: {
      fillStyle?: string;
      fontSize?: number;
      lineHeight?: number;
      fontFamily?: string;
      textOverflow?: "ellipsis" | "clip";
      triggerId?: string;
    };
    background?: {
      fillStyle?: string;
      strokeStyle?: string;
      radius?: number;
      padding?: number | number[];
    };
  };
};

export function initTag(container: Layer, options: SingleTagOptions): Layer {
  const {
    left,
    top,
    text,
    maxWidth,
    theme,
    label = {},
    background = {},
    icon,
    close,
  } = options;
  const layer = new Layer({ id: options.id || "tagContainer" });
  let padding = theme === "capsule" ? [0, 6, 0, 6] : [0, 4, 0, 4];
  if (background.padding) {
    padding = normalizePadding(background.padding);
  }
  let textWidth = maxWidth ? maxWidth - padding[1] - padding[3] : 0;
  const iconSize = icon ? icon.size || label.fontSize || 12 : 0;
  const closeSize = close ? close.size || label.fontSize || 12 : 0;
  let iconShape = null;
  let closeShape = null;
  if (textWidth && icon) {
    textWidth -= iconSize + 4;
  }
  if (textWidth && close) {
    textWidth -= closeSize + 4;
  }
  let x = padding[3];
  const y = padding[0];
  const textShape = new Text({
    x: iconSize ? x + iconSize + 4 : x,
    y,
    text,
    fillStyle: "#21252C",
    fontWeight: 500,
    textBaseline: "top",
    ...label,
  });
  const textBox = textShape.getBBox();
  // eslint-disable-next-line no-restricted-globals
  if (textWidth !== 0 && textBox.width > textWidth) {
    textShape.set("width", textWidth);
  } else {
    textWidth = textBox.width;
  }

  if (icon) {
    iconShape = new Icon({
      x: x + iconSize / 2,
      y: y + textBox.height / 2,
      size: iconSize,
      ...icon,
    });
    x += iconSize + 4;
    if (icon.onClick) {
      iconShape.on("click", (e: GraphEvent) => {
        e.stopPropagation();
        icon.onClick?.(e, layer);
      });
    }
  }

  if (!textWidth) {
    textWidth = textBox.width;
  }

  if (close) {
    closeShape = new Icon({
      x: x + textWidth + closeSize / 2 + 4,
      y: y + textBox.height / 2,
      cursor: "pointer",
      size: closeSize,
      ...close,
    });
    if (close.onClose) {
      closeShape.on("click", (e: GraphEvent) => {
        e.stopPropagation();
        close.onClose?.(e, layer);
      });
    }
  }

  const rectHeight = textBox.height + padding[0] + padding[2];

  const rectShape = new Rect({
    left: 0,
    top: 0,
    radius: theme === "capsule" ? rectHeight / 2 : 2,
    fillStyle: "#F0F1F3",
    width:
      textWidth +
      (iconSize ? iconSize + 4 : 0) +
      (closeSize ? closeSize + 4 : 0) +
      padding[1] +
      padding[3],
    height: rectHeight,
    ...background,
  });
  rectShape.set("padding", padding);
  layer.add(rectShape);
  layer.add(textShape);
  iconShape && layer.add(iconShape);
  closeShape && layer.add(closeShape);
  layer.translate(left, top);
  layer.set("width", rectShape.get("width"));
  container.add(layer);
  return layer;
}

export function initTags(container: Layer, options: TagsOptions): Layer {
  const { maxWidth, tags, left, top, theme, overflowTag = {} } = options;
  const layer = new Layer({ id: options.id || "tagsContainer" });
  let x = 0;
  if (!maxWidth) {
    tags.forEach((tagOptions: MultiTagOptions, index: number) => {
      if (tagOptions.visible === false) {
        return;
      }
      const tag = initTag(layer, {
        ...tagOptions,
        theme,
        left: x,
        top: 0,
      });
      tag.set("index", index);
      x += 4 + tag.get("width");
    });
  } else {
    let count = 0;
    for (let i = 0; i < tags.length; i++) {
      const tagOptions = tags[i];
      if (tagOptions.visible === false) {
        continue;
      }
      const tagLayer = initTag(layer, {
        ...tagOptions,
        theme,
        left: x,
        top: 0,
      });
      tagLayer.set("index", i);
      const width = tagLayer.get("width");
      if (x + width + 4 < maxWidth) {
        x += 4 + width;
        count++;
      } else {
        layer.remove(tagLayer);
        const realCount = tags.filter((tag) => tag.visible !== false).length;
        const text = `+${realCount - count}`;
        const countLayer = initTag(layer, {
          left: x,
          top: 0,
          text,
          theme,
          background: overflowTag.background,
          label: overflowTag.label,
        });
        // 如果空间不够放计数，删除最后一个 tag
        if (x + countLayer.get("width") + 4 > maxWidth) {
          refreshRectWidth(countLayer, `+${realCount - count + 1}`);
          const lastTag = layer.children[layer.children.length - 2];
          countLayer.translate(-lastTag.get("width") - 4, 0);
          layer.remove(lastTag);
        }
        layer.set("overflow", true);
        break;
      }
    }
  }
  layer.translate(left, top);
  layer.set("__tagsOption", options);
  container.add(layer);
  return layer;
}

export function removeTag(layer: Layer): Layer {
  let parent = layer.parent!;
  const options = parent.get("__tagsOption");
  if (!options) {
    parent.remove(layer);
    return parent;
  }
  const index = layer.get("index");
  options.tags[index].visible = false;
  if (!options.maxWidth || !parent.get("overflow")) {
    const width = layer.get("width") + 4;
    const childIndex = parent.children.indexOf(layer);
    if (childIndex >= 0) {
      parent.remove(layer);
      for (let i = childIndex; i < parent.children.length; i++) {
        parent.children[i].translate(-width, 0);
      }
    }
  } else {
    const container = parent.parent!;
    delete parent.configs.overflow;
    container.remove(parent);
    parent = initTags(container, options);
  }
  return parent;
}

export function addTag(layer: Layer, option: MultiTagOptions): Layer {
  const options = layer.get("__tagsOption");
  if (!options) {
    console.warn("No matching tag options found");
    return layer;
  }
  options.tags.push(option);
  if (layer.get("overflow")) {
    const restCount = layer.children[layer.children.length - 1] as Layer;
    const text = restCount.children[1] as Text;
    // 个数的位数发生变化需要重计算

    refreshRectWidth(restCount, `+${parseInt(text.get("text"), 10) + 1}`);
  } else {
    const parent = layer.parent!;
    parent.remove(layer);
    layer = initTags(parent, options);
  }
  return layer;
}

function refreshRectWidth(layer: Layer, label: string) {
  const rect = layer.children[0];
  const text = layer.children[1];
  const originWidth = text.getBBox().width;
  text.set("text", label);
  const currentWidth = text.getBBox().width;
  const width = layer.get("width") + (currentWidth - originWidth);
  rect.set("width", width);
  layer.set("width", width);
}
