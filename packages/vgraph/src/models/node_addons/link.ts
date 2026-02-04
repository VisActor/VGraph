import { BaseConfigs, Layer, Text, Icon, Path } from "../../renderer";
import { LayerEvent } from "../../typings/event";

export type LinkOptions = BaseConfigs & {
  x: number;
  y: number;
  text: string;
  onClick: (e: LayerEvent) => void;
  disabled?: boolean;
  maxWidth?: number;
  triggerId?: string;
  cursor?: string;
  align?: "left" | "center" | "right";

  defaultColor?: string;
  hoverColor?: string;
  activeColor?: string;
  disabledColor?: string;

  // 标签样式设置
  icon?: {
    icon: string;
    size?: number;
  };

  // 文本样式设置
  label?: {
    cursor?: string;
    textOverflow?: "clip" | "ellipsis";
    fontSize?: number;
    lineHeight?: number;
    fontStyle?: "normal" | "italic" | "oblique";
    fontVariant?: "normal" | "small-caps";
    fontWeight?: "normal" | "bold" | "bolder" | "lighter" | number;
    fontFamily?: string;
  };

  underline?:
    | boolean
    | {
        strokeStyle?: string;
        lineWidth?: number;
        lineDash?: number[];
      };
};

const TEXT_PADDING = 4;

// https://www.figma.com/file/9DZW5QHmVjGczKVXrIzWkP/%F0%9F%93%88rq-vgraph%E5%9B%BE%26%E8%A7%84%E8%8C%83?node-id=2667-88829&t=v4Ogik5fWTy3nI4L-0
export function init(layer: Layer, options: LinkOptions) {
  const { x, y, disabled, text, maxWidth, icon, align, label, underline } =
    options;
  let defaultColor = options.defaultColor;
  if (!defaultColor) {
    if (disabled) {
      defaultColor = options.disabledColor || "#9CC6FA";
    } else {
      defaultColor = "#3073F2";
    }
  }
  const cursor = options.cursor || (disabled ? "not-allowed" : "pointer");
  let canvas: any = layer;
  while (canvas.type !== "canvas") {
    canvas = canvas.parent;
  }
  const container = new Layer({});
  layer.add(container);
  let iconSize = 0;
  if (icon) {
    iconSize = icon.size || label?.fontSize || 12;
  }
  let textWidth = maxWidth;
  if (icon && textWidth) {
    textWidth -= iconSize + TEXT_PADDING;
  }
  const textShape = new Text({
    x,
    y,
    text,
    textOverflow: "ellipsis",
    textAlign: align,
    cursor,
    fillStyle: defaultColor,
    ...label,
    width: textWidth,
  });
  const actualWidth = textShape.getBBox().width;
  container.add(textShape);
  let iconShape: Icon | null = null;
  let pathShape: Path | null = null;
  let pathColor = defaultColor;
  if (iconSize) {
    let textX = x;
    let iconX = x;
    switch (align) {
      case "center":
        textX += (iconSize + TEXT_PADDING) / 2;
        iconX = x - actualWidth / 2 - TEXT_PADDING / 2;
        break;
      case "right":
        iconX = x - actualWidth - TEXT_PADDING - iconSize / 2;
        break;
      default:
        textX = x + iconSize + TEXT_PADDING;
        iconX = x + iconSize / 2;
        break;
    }

    textShape.set("x", textX);

    iconShape = new Icon({
      icon: icon!.icon,
      fillStyle: defaultColor,
      size: iconSize,
      x: iconX,
      y,
      cursor,
    });
    container.add(iconShape);
  }

  if (underline) {
    const bbox = container.getBBox();
    const { top, left, width, height } = bbox;
    let styles: any = underline;
    if (typeof styles === "boolean") {
      styles = {
        strokeStyle: defaultColor,
      };
    } else {
      pathColor = styles.strokeStyle || defaultColor;
    }
    pathShape = new Path({
      strokeStyle: defaultColor,
      ...styles,
      path: [
        ["M", left, top + height],
        ["L", left + width, top + height],
      ],
    });
    container.add(pathShape);
  }

  if (!disabled) {
    container.on("mouseenter", () => {
      const color = options.hoverColor || options.defaultColor || "#5391F5";
      textShape.set("fillStyle", color);
      iconShape?.set("fillStyle", color);
      pathShape?.set("strokeStyle", color);
      canvas.draw();
    });

    container.on("mouseleave", () => {
      textShape.set("fillStyle", defaultColor);
      iconShape?.set("fillStyle", defaultColor);
      pathShape?.set("strokeStyle", pathColor);
      canvas.draw();
    });

    container.on("mousedown", (e: LayerEvent) => {
      const color = options.activeColor || options.defaultColor || "#1E54C9";
      textShape.set("fillStyle", color);
      iconShape?.set("fillStyle", color);
      pathShape?.set("strokeStyle", color);
      canvas.draw();
      options.onClick?.(e);
    });

    container.on("mouseup", (e: LayerEvent) => {
      textShape.set("fillStyle", defaultColor);
      iconShape?.set("fillStyle", defaultColor);
      pathShape?.set("strokeStyle", pathColor);
      canvas.draw();
    });
  }

  return container;
}
