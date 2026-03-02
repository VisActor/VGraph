import {
  Layer,
  Rect,
  Circle,
  Image as ImageShape,
  Text,
  Icon,
  Rhombus,
  CircleConfigs,
  ImageConfigs,
  Shape,
} from "../../renderer";
import { isDarkColor, colorParser, getNormalizedRad } from "../../utils";
import {
  ELEMENT_TYPES,
  NODE_THEMES,
  NODE_TYPES,
} from "../../consts/node_types";
import Base from "./base";
import { LabelConfigs, NodeConfigs } from "../../typings/model";
import { register, unRegister } from "./register";

const BASE_CONFIGS = {
  rect: Rect,
  circle: Circle,
  image: ImageShape,
  rhombus: Rhombus,
};

const CATEGORY_WIDTH = 4;
const SINGLE_LINE_HEIGHT = 12 * 1.3;
const DEFAULT_PADDING = 12;
const DEFAULT_LABEL_PADDING = 8;
const DEFAULT_LABEL_COLOR = "#21252C";

type ThemeStyles = {
  strokeStyle: string;
  fillStyle: string;
  icon: {
    fillStyle: string;
    background: {
      fillStyle: string;
    };
  };
  title: {
    fillStyle: string;
    height: number;
  };
  label: {
    fillStyle: string;
  };
};

function titleColor(predict: string) {
  return isDarkColor(predict) ? "#ffffff" : "#21252C";
}

function descColor(predict: string) {
  return isDarkColor(predict) ? "#D0D5DF" : "#626978";
}

function getTextAlignConfigs(configs: NodeConfigs, textConfigs: LabelConfigs) {
  const {
    offsetX = 0,
    offsetY = 0,
    textAlign = "left",
    textBaseline = "middle",
  } = textConfigs;
  let {
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
    paddingLeft = 0,
    padding,
  } = configs;
  if (typeof padding === "number") {
    padding = [padding, padding, padding, padding];
  }
  if (Array.isArray(padding)) {
    // 上 右 下 左
    [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;
  }
  // left
  let x = offsetX - configs.width! / 2 + paddingLeft;
  const width = configs.width! - paddingLeft - paddingRight - offsetX;
  if (textAlign === "center") {
    x = offsetX + paddingLeft / 2 - paddingRight / 2;
  } else if (textAlign === "right" || textAlign === "end") {
    x = offsetX + configs.width! / 2 - paddingRight;
  }
  // bottom
  let y = offsetY + configs.height! / 2 - paddingBottom;
  if (textBaseline === "middle") {
    y = offsetY;
  } else if (textBaseline === "top" || textBaseline === "hanging") {
    y = offsetY - configs.height! / 2 + paddingTop;
  }
  return { x, y, width, textAlign, textBaseline };
}

export const nodeBase = Object.assign({}, Base, {
  type: "node",
  shape(layer: Layer, configs: NodeConfigs) {
    if (!BASE_CONFIGS[this.type]) {
      return;
    }
    const shapeConfigs = this.getShapeConfigs(configs);
    const shape = new BASE_CONFIGS[this.type](shapeConfigs);
    layer.add(shape);
    return shape;
  },
  getDefaultStyles(configs: NodeConfigs) {
    const styles = this.getDefaultBaseStyles(configs);
    return {
      ...styles,
      strokeStyle:
        configs.strokeStyle === null
          ? null
          : configs.strokeStyle || configs.color || "#E1E4EB",
      lineWidth: configs.lineWidth || 1,
      fillStyle: configs.fillStyle || "#fff",
      radius: configs.radius || 0,
    };
  },
  // FIXME: 通过 keyShapeStyles 梳理清楚
  getDefaultBaseStyles(configs: NodeConfigs) {
    const styles: Record<string, unknown> = {
      opacity: configs.opacity === undefined ? undefined : configs.opacity,
    };
    if (Object.prototype.hasOwnProperty.call(configs, "cursor")) {
      styles.cursor = configs.cursor;
    }
    if (Object.prototype.hasOwnProperty.call(configs, "lineDash")) {
      styles.lineDash = configs.lineDash;
    }
    if (Object.prototype.hasOwnProperty.call(configs, "shadowBlur")) {
      styles.shadowBlur = configs.shadowBlur;
    }
    if (Object.prototype.hasOwnProperty.call(configs, "shadowColor")) {
      styles.shadowColor = configs.shadowColor;
    }
    if (Object.prototype.hasOwnProperty.call(configs, "shadowOffsetX")) {
      styles.shadowOffsetX = configs.shadowOffsetX;
    }
    if (Object.prototype.hasOwnProperty.call(configs, "shadowOffsetY")) {
      styles.shadowOffsetY = configs.shadowOffsetY;
    }
    if (Object.prototype.hasOwnProperty.call(configs, "triggerId")) {
      styles.triggerId = configs.triggerId;
    }
    return styles;
  },
  getShapeConfigs(configs: NodeConfigs) {
    const shapeConfigs = this.calculateShapeConfigs(configs);
    const styles = this.getDefaultStyles(configs);
    return {
      ...shapeConfigs,
      ...styles,
    };
  },
  calculateShapeConfigs(configs: NodeConfigs) {
    return configs;
  },

  getStringLabelConfigs(configs: NodeConfigs) {
    return {
      text: configs.label,
      x: -configs.width! / 2 + DEFAULT_PADDING,
      y: 0,
      textAlign: "left",
      textBaseline: "middle",
      width: configs.width! - DEFAULT_PADDING * 2,
      // 默认单行文本
      // height: configs.height,
      textOverflow: "ellipsis",
      fillStyle: DEFAULT_LABEL_COLOR,
    };
  },

  getCustomLabelConfigs(configs: NodeConfigs) {
    const labelConfigs = configs.label as LabelConfigs;
    const { offsetX = 0, offsetY = 0, rotate } = labelConfigs;
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(rotate)) {
      let textAlign: any = labelConfigs.textAlign || "center";
      const result = getNormalizedRad(rotate);
      if (textAlign !== "center" && result.reverse) {
        textAlign = {
          left: "right",
          right: "left",
          start: "end",
          end: "start",
        }[textAlign];
      }
      return {
        x: result.reverse ? -offsetX : offsetX,
        y: result.reverse ? -offsetY : offsetY,
        fillStyle: DEFAULT_LABEL_COLOR,
        ...labelConfigs,
        textAlign,
        textBaseline: "middle",
        rotate: result.rad,
        rawRotate: true,
      };
    }
    return {
      x: offsetX,
      y: offsetY,
      fillStyle: DEFAULT_LABEL_COLOR,
      fontSize: 12,
      ...labelConfigs,
    };
  },

  getLabelConfigs(layer: Layer, configs: NodeConfigs) {
    const label = configs.label;
    if (typeof label === "string") {
      return this.getStringLabelConfigs(configs);
    }
    return this.getCustomLabelConfigs(configs);
  },
});

const iconTitleDescLayoutNodeBase = {
  ...nodeBase,
  getConfigsForText(configs: NodeConfigs, themeStyles: ThemeStyles) {
    const { label } = configs;
    let { title } = configs;
    let labelConfigs: any = themeStyles.title;
    if (title) {
      if (typeof title === "string") {
        title = { text: title };
      }
      title.height = title.height || 24;
      labelConfigs = themeStyles.label;
      const { offsetX = 0, offsetY = -(title.fontSize || 6) } = title;
      if (!title.textBaseline) {
        title.textBaseline = "middle";
      }
      title = {
        offsetX,
        offsetY,
        ...themeStyles.title,
        ...title,
      };
    }
    let text = label;
    if (label && typeof label !== "string") {
      text = label.text;
      labelConfigs = {
        ...labelConfigs,
        ...label,
      };
    }
    const textAlign = labelConfigs.textAlign || "left";
    return {
      title,
      paddingTop: title ? title.height : 0,
      label: label
        ? {
            text,
            textAlign,
            textBaseline: "middle",
            textOverflow: "ellipsis",
            offsetY: title ? title.height! / 2 : 0,
            ...labelConfigs,
          }
        : null,
    };
  },
  getThemeStyles(configs: NodeConfigs) {
    const { theme = NODE_THEMES.OUTLINED, color = "#7F8897" } = configs;
    const { title, label, icon = {} } = configs;
    const { background } = icon;
    let themeStyles = {};
    if (theme === NODE_THEMES.FILLED) {
      themeStyles = {
        strokeStyle: configs.strokeStyle || null,
        fillStyle: configs.fillStyle || color,
        icon: {
          fillStyle: icon.fillStyle || "#ffffff",
          background: {
            // 实心风格为3/4处
            fillStyle:
              background?.fillStyle ||
              colorParser(color).lerp("#ffffff", 0.25).hex(),
          },
        },
        title: {
          fillStyle: title?.fillStyle || titleColor(color),
        },
        label: {
          fillStyle: (label as LabelConfigs)?.fillStyle || descColor(color),
        },
      };
    } else if (theme === NODE_THEMES.OUTLINED) {
      themeStyles = {
        fillStyle: configs.fillStyle || "#ffffff",
        strokeStyle: configs.strokeStyle || color,
        icon: {
          fillStyle: icon?.fillStyle || color,
          background: {
            // 线框风格为1/4处
            fillStyle:
              background?.fillStyle ||
              colorParser(color).lerp("#ffffff", 0.75).hex(),
          },
        },
        title: {
          fillStyle: title?.fillStyle || DEFAULT_LABEL_COLOR,
        },
        label: {
          fillStyle: (label as LabelConfigs)?.fillStyle || "#959595",
        },
      };
    } else {
      themeStyles = {
        strokeStyle: configs.strokeStyle || null,
        shadowBlur: configs.shadowBlur || 4,
        shadowColor: configs.shadowColor || "rgba(27,31,35,0.1)",
        title: {
          fillStyle: title?.fillStyle || DEFAULT_LABEL_COLOR,
        },
        label: {
          fillStyle: (label as LabelConfigs)?.fillStyle || "#959595",
        },
        icon: {
          fillStyle: icon?.fillStyle || color,
          background: {
            // 默认风格为1/8处
            fillStyle:
              background?.fillStyle ||
              colorParser(color).lerp("#ffffff", 0.875).hex(),
          },
        },
      };
    }
    return themeStyles;
  },
  getBackgroundShape(configs: CircleConfigs) {
    return new Circle(configs);
  },
  shape(layer: Layer, configs: NodeConfigs) {
    if (configs.title) {
      const titleText = new Text({
        id: "titleText",
        ...configs.title,
        ...getTextAlignConfigs(configs, configs.title),
      } as any);
      layer.add(titleText);
    }
    if (configs.icon) {
      const iconBackground = this.getBackgroundShape({
        id: "iconBackground",
        ...configs.icon.background,
      });
      layer.add(iconBackground);
      const iconShape = new Icon({
        id: "iconShape",
        ...configs.icon,
      });
      layer.add(iconShape);
    }
  },
  updateShapes(layer: Layer, configs: NodeConfigs) {
    const titleText = layer.findById("titleText");
    const iconBackground = layer.findById("iconBackground");
    const iconShape = layer.findById("iconShape");
    if (configs.title) {
      titleText?.set(configs.title);
    }
    if (configs.icon) {
      if (configs.icon.background) {
        iconBackground?.set(configs.icon.background);
      }
      iconShape?.set(configs.icon);
    }
  },
};

export function registerMetaNodes() {
  // rect node
  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.RECT,
    {
      type: NODE_TYPES.RECT,
      getCustomLabelConfigs(configs: NodeConfigs) {
        const labelConfigs = configs.label as LabelConfigs;
        return {
          ...getTextAlignConfigs(configs, labelConfigs),
          fillStyle: DEFAULT_LABEL_COLOR,
          ...labelConfigs,
        };
      },
      // getDefaultStyles(configs: any) {
      //   return {
      //     strokeStyle: configs.strokeStyle === null ? null : (configs.strokeStyle || configs.color || '#E1E4EB'),
      //     lineWidth: configs.lineWidth || 1,
      //     fillStyle: configs.fillStyle || '#fff',
      //     radius: configs.radius || 0,
      //     shadowColor: configs.shadowColor || '#dedede',
      //     shadowBlur: configs.shadowBlur || 0,
      //   };
      // },
      getConfigsForShape(configs: NodeConfigs) {
        return {
          paddingLeft: DEFAULT_PADDING,
          paddingRight: DEFAULT_PADDING,
          ...configs,
        };
      },
      calculateShapeConfigs(configs: NodeConfigs) {
        const { width, height } = configs;
        return {
          left: -width! / 2,
          top: -height! / 2,
          width,
          height,
        };
      },
    },
    nodeBase
  );

  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.RHOMBUS,
    {
      type: NODE_TYPES.RHOMBUS,
      getConfigsForShape(configs: NodeConfigs) {
        return {
          paddingLeft: DEFAULT_PADDING,
          paddingRight: DEFAULT_PADDING,
          ...configs,
        };
      },
      calculateShapeConfigs(configs: NodeConfigs) {
        const { width, height } = configs;
        return {
          left: -width! / 2,
          top: -height! / 2,
          width,
          height,
        };
      },
      getStringLabelConfigs(configs: NodeConfigs) {
        return {
          text: configs.label,
          x: 0,
          y: 0,
          textAlign: "center",
          textBaseline: "middle",
          width: configs.width! - DEFAULT_PADDING * 2,
          textOverflow: "ellipsis",
          fillStyle: DEFAULT_LABEL_COLOR,
        };
      },
      getCustomLabelConfigs(configs: NodeConfigs) {
        const labelConfigs = configs.label as LabelConfigs;
        return {
          ...getTextAlignConfigs(configs, labelConfigs),
          fillStyle: DEFAULT_LABEL_COLOR,
          ...labelConfigs,
        };
      },
    },
    nodeBase
  );

  // circle node
  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.CIRCLE,
    {
      type: NODE_TYPES.CIRCLE,
      calculateShapeConfigs(configs: NodeConfigs) {
        const { width, defaultConfigs } = configs;
        return {
          cx: 0,
          cy: 0,
          r: width! / 2,
          ...defaultConfigs,
        };
      },
      getStringLabelConfigs(configs: NodeConfigs) {
        return {
          text: configs.label,
          x: 0,
          y: 0,
          textAlign: "center",
          textBaseline: "middle",
          width: configs.width,
          height: configs.height,
          textOverflow: "ellipsis",
          fillStyle: DEFAULT_LABEL_COLOR,
        };
      },
    },
    nodeBase
  );

  // image node
  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.IMAGE,
    {
      type: NODE_TYPES.IMAGE,
      getConfigsForShape(configs: NodeConfigs) {
        const {
          label,
          theme = NODE_THEMES.OUTLINED,
          color = "#7F8897",
        } = configs;
        if (configs.color) {
          configs.strokeStyle =
            theme === NODE_THEMES.OUTLINED ? color : undefined;
          configs.fillStyle =
            theme === NODE_THEMES.OUTLINED
              ? colorParser(color).lerp("#ffffff", 0.875).hex()
              : color;
        }
        if (!label) {
          return configs;
        }
        let text: any = label;
        let labelConfigs: any = {};
        if (typeof label !== "string") {
          text = (label as LabelConfigs).text;
          labelConfigs = label;
        }
        configs.label = {
          text,
          textAlign: "center",
          textBaseline: "top",
          y:
            configs.height! / 2 +
            (labelConfigs.offsetY ? labelConfigs.offsetY : 4),
          ...labelConfigs,
        };
        return configs;
      },
      shape(layer: Layer, configs: NodeConfigs) {
        const { width, height } = configs;
        const { radius } = configs;
        let keyShape = null;
        if (radius && radius * 2 >= Math.min(width!, height!)) {
          const circle = new Circle({
            id: "imageBackground",
            ...configs,
            cx: 0,
            cy: 0,
            r: configs.radius!,
          });
          layer.add(circle);
          keyShape = circle;
        } else {
          const rect = new Rect({
            id: "imageBackground",
            left: -width! / 2,
            top: -configs.height! / 2,
            ...configs,
          } as any);
          layer.add(rect);
          keyShape = rect;
        }
        const imgConfigs = configs.image as ImageConfigs;
        const imgWidth = imgConfigs.width ?? width;
        const imgHeight = imgConfigs.height ?? height;
        const image = new ImageShape({
          id: "nodeImage",
          ...configs.image,
          left: -imgWidth / 2,
          top: -imgHeight / 2,
          width: imgWidth,
          height: imgHeight,
        });
        layer.add(image);
        return keyShape;
      },
      updateShapes(layer: Layer, configs: NodeConfigs) {
        const imageShape = layer.findById("nodeImage");
        if (!imageShape || imageShape.destroyed) {
          this.init(layer, configs);
          return;
        }
        const imgConfigs = configs.image as ImageConfigs;
        const { width, height, radius } = configs;
        imageShape.set({
          ...configs.image,
          left: -(imgConfigs.width ?? width!) / 2,
          top: -(imgConfigs.height ?? height!) / 2,
        });
        const background = layer.findById("imageBackground");
        if (radius && radius * 2 >= Math.min(width!, height!)) {
          background?.set({
            ...configs,
            cx: 0,
            cy: 0,
            r: radius,
          });
        } else {
          background?.set({
            left: -width! / 2,
            top: -height! / 2,
            ...configs,
          });
        }
        // 更新label
        nodeBase.updateShapes(layer, configs);
      },
    },
    nodeBase
  );

  // icon node
  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.ICON,
    {
      type: NODE_TYPES.ICON,
      getConfigsForShape(configs: NodeConfigs) {
        const {
          width,
          height,
          label,
          size,
          radius = 2,
          theme = NODE_THEMES.LIGHTED,
          color = "#7F8897",
        } = configs;
        let icon = configs.icon || {};
        configs.strokeStyle = configs.strokeStyle
          ? configs.strokeStyle
          : theme === NODE_THEMES.OUTLINED
          ? color
          : undefined;
        configs.fillStyle = configs.fillStyle
          ? configs.fillStyle
          : theme === NODE_THEMES.OUTLINED
          ? colorParser(color).lerp("#ffffff", 0.875).hex()
          : theme === NODE_THEMES.FILLED
          ? color
          : "#ffffff";
        if (typeof icon === "string") {
          icon = {
            icon,
          };
        }
        icon = {
          size: size ? size : width! / 2,
          fillStyle: icon.fillStyle
            ? icon.fillStyle
            : theme === NODE_THEMES.FILLED
            ? "#ffffff"
            : color,
          ...icon,
        };
        if (label) {
          let text: any = label;
          let labelConfigs: any = {};
          if (typeof label !== "string") {
            text = label.text;
            labelConfigs = label;
          }
          configs.label = {
            text,
            textAlign: "center",
            textBaseline: "top",
            y: height! / 2 + (labelConfigs.offsetY ? labelConfigs.offsetY : 4),
            ...labelConfigs,
          };
        }
        return {
          ...configs,
          shadowColor: "#dedede",
          shadowBlur: theme === NODE_THEMES.LIGHTED ? 20 : 0,
          width,
          height,
          radius,
          icon,
        };
      },
      shape(layer: Layer, configs: NodeConfigs) {
        const { width, height, radius } = configs;
        let keyShape = null;
        if (radius && radius * 2 >= Math.min(width!, height!)) {
          const circle = new Circle({
            id: "iconBackground",
            ...configs,
            cx: 0,
            cy: 0,
            r: configs.radius!,
          });
          layer.add(circle);
          keyShape = circle;
        } else {
          const rect = new Rect({
            id: "iconBackground",
            left: -width! / 2,
            top: -height! / 2,
            ...configs,
          } as any);
          layer.add(rect);
          keyShape = rect;
        }
        const icon = new Icon({
          id: "iconShape",
          ...configs.icon,
        });
        layer.add(icon);
        return keyShape;
      },
      updateShapes(layer: Layer, configs: NodeConfigs) {
        if (configs.icon) {
          const icon = layer.findById("iconShape");
          icon?.set(configs.icon);
        }
        const { width, height, radius } = configs;
        const background = layer.findById("iconBackground");
        if (radius && radius * 2 >= Math.min(width!, height!)) {
          background?.set({
            ...configs,
            cx: 0,
            cy: 0,
            r: radius,
          });
        } else {
          background?.set({
            left: -width! / 2,
            top: -height! / 2,
            ...configs,
          });
        }
        // 更新label
        nodeBase.updateShapes(layer, configs);
      },
    },
    nodeBase
  );

  // capsule node
  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.CAPSULE,
    {
      type: NODE_TYPES.CAPSULE,
      extends: NODE_TYPES.RECT,
      drawCurrentLabel: false,
      getConfigsForShape(configs: NodeConfigs) {
        let { icon } = configs;
        const { width = 140, height = 40 } = configs;
        const themeStyles = this.getThemeStyles(configs);
        const textConfigs = this.getConfigsForText(configs, themeStyles);
        let backgroundWidth = 0;
        if (icon) {
          if (typeof icon === "string") {
            icon = {
              icon,
            };
          }
          const background = {
            ...themeStyles.icon.background,
            ...icon.background,
          };
          const r = background.radius ? background.radius : height * 0.4;
          backgroundWidth = r + height / 2;
          icon = {
            x: height / 2 - width / 2,
            y: 0,
            size: height / 2.5,
            ...themeStyles.icon,
            ...icon,
            background: {
              cx: height / 2 - width / 2,
              cy: 0,
              r,
              ...background,
            },
          };
        }
        return {
          ...themeStyles,
          ...configs,
          ...textConfigs,
          width,
          height,
          radius: height / 2,
          icon,
          paddingLeft: backgroundWidth + DEFAULT_PADDING,
          paddingRight: DEFAULT_PADDING,
        };
      },
    },
    iconTitleDescLayoutNodeBase
  );

  // tag node
  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.TAG,
    {
      type: NODE_TYPES.TAG,
      extends: NODE_TYPES.RECT,
      drawCurrentLabel: false,
      getBackgroundShape(configs: any) {
        return new Rect(configs);
      },
      getConfigsForShape(configs: NodeConfigs) {
        let { icon } = configs;
        const { width = 140, height = 40, radius = 2 } = configs;
        const themeStyles = this.getThemeStyles(configs);
        const textConfigs = this.getConfigsForText(configs, themeStyles);
        let backgroundWidth = 0;
        if (icon) {
          if (typeof icon === "string") {
            icon = {
              icon,
            };
          }
          const background = {
            ...themeStyles.icon.background,
            ...icon.background,
          };
          backgroundWidth = background.width || height * 0.8;
          icon = {
            x: backgroundWidth / 2 - width / 2,
            y: 0,
            size: backgroundWidth / 2,
            ...themeStyles.icon,
            ...icon,
            background: {
              strokeStyle: null,
              radius: [radius, 0, 0, radius],
              left: -width / 2 + 0.5,
              top: -height / 2 + 0.5,
              width: backgroundWidth - 1,
              height: height - 1,
              ...background,
            },
          };
        }
        return {
          ...themeStyles,
          ...configs,
          ...textConfigs,
          radius,
          icon,
          width,
          height,
          paddingLeft: backgroundWidth + DEFAULT_PADDING,
          paddingRight: DEFAULT_PADDING,
        };
      },
    },
    iconTitleDescLayoutNodeBase
  );

  // title node
  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.TITLE,
    {
      type: NODE_TYPES.TITLE,
      extends: NODE_TYPES.RECT,
      drawCurrentLabel: false,
      getConfigsForShape(configs: NodeConfigs) {
        let title: any = configs.title;
        const label = configs.label;
        if (title && typeof title === "string") {
          title = { text: title };
        }
        title.height = title.height || 24;
        let text: any = label;
        let labelConfigs: any = {};
        if (typeof label !== "string") {
          text = label?.text;
          labelConfigs = label;
        }
        return {
          paddingTop: DEFAULT_PADDING + title.height,
          ...configs,
          title,
          // label 下移给 title 腾位置
          label: {
            text,
            textAlign: "left",
            height: configs.height! - title.height - DEFAULT_PADDING * 2,
            textBaseline: "top",
            textOverflow: "ellipsis",
            fillStyle: "#626978",
            ...labelConfigs,
          },
        };
      },
      getTitleRectConfigs(configs: any) {
        const { title, width, height, radius } = configs;
        const styles: any = {
          left: -width / 2 + (title.borderColor ? 0 : 0.5),
          top: -height / 2 + (title.borderColor ? 0 : 0.5),
          width: width - (title.borderColor ? 0 : 1),
          height: title.height,
          fillStyle: title.backgroundColor,
          strokeStyle: title.borderColor,
        };
        if (typeof radius === "number") {
          styles.radius = [radius, radius, 0, 0];
        } else if (Array.isArray(radius)) {
          styles.radius = [radius[0], radius[0], 0, 0];
        }
        return styles;
      },
      getTitleTextConfigs(configs: any) {
        const { title, width, height } = configs;
        let { offsetX = 0, offsetY = 0 } = title;
        let textBaseline = title.textBaseline;
        if (!title.textAlign && !offsetX) {
          offsetX = DEFAULT_PADDING;
        }
        if (!textBaseline && !offsetY) {
          offsetY = title.height / 2;
          textBaseline = "middle";
        }
        return {
          x: -width / 2 + offsetX,
          y: -height / 2 + offsetY,
          fillStyle: DEFAULT_LABEL_COLOR,
          width: width - DEFAULT_PADDING * 2,
          textOverflow: "ellipsis",
          ...title,
          textBaseline,
        };
      },
      // 矩形节点已经画好了背景矩形和文本内容，只需要增加标题矩形和标题文本
      shape(layer: Layer, configs: NodeConfigs) {
        const titleBackRect = new Rect({
          id: "titleBackRect",
          ...this.getTitleRectConfigs(configs),
        });
        layer.add(titleBackRect);
        const titleText = new Text({
          id: "titleText",
          ...this.getTitleTextConfigs(configs),
        });
        layer.add(titleText);
      },
      // 矩形节点已经计算好了背景和 label 的更新，只做标题矩形和标题文本的更新
      updateShapes(layer: Layer, configs: NodeConfigs) {
        const titleBackRect = layer.findById("titleBackRect");
        const titleText = layer.findById("titleText");
        titleBackRect?.set(this.getTitleRectConfigs(configs));
        titleText?.set(this.getTitleTextConfigs(configs));
      },
    },
    nodeBase
  );

  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.CATEGORY,
    {
      type: NODE_TYPES.CATEGORY,
      extends: NODE_TYPES.RECT,
      drawCurrentLabel: false,
      getConfigsForShape(data: NodeConfigs) {
        const label = data.label;
        if (!label) {
          return data;
        }
        let text: any = label;
        let labelConfigs = {};
        if (typeof label !== "string") {
          text = label.text;
          labelConfigs = label;
        }
        const isLeft = +!(data.position === "top");
        return {
          strokeStyle: "#E1E4EB",
          ...data,
          label: {
            text,
            offsetY: 0,
            textAlign: "left",
            textBaseline: "middle",
            height: SINGLE_LINE_HEIGHT,
            width:
              data.width! -
              isLeft * CATEGORY_WIDTH -
              (data.paddingLeft ?? DEFAULT_PADDING) -
              (data.paddingRight ?? DEFAULT_PADDING),
            x: -data.width! / 2 + isLeft * CATEGORY_WIDTH + DEFAULT_PADDING,
            ...labelConfigs,
          },
        };
      },
      getCategoryConfigs(layer: Layer, configs: NodeConfigs) {
        if (configs.position === "top") {
          return this.getTopCategoryConfigs(layer, configs);
        }
        const categoryConfigs: any = {
          left: -configs.width! / 2,
          top: -configs.height! / 2,
          width: CATEGORY_WIDTH,
          height: configs.height,
          fillStyle: configs.color,
        };
        const keyShape = layer.find((shape) => shape.get("_keyShape"));
        if (!keyShape) {
          return configs;
        }
        const radius = keyShape.get("radius");

        if (typeof radius === "number") {
          categoryConfigs.radius = [radius, 0, 0, radius];
        } else if (radius.length === 2) {
          categoryConfigs.radius = [radius[0], 0, 0, radius[0]];
        } else {
          categoryConfigs.radius = [radius[0], 0, 0, radius[3]];
        }
        // 圆角大于 4 的时候会多出来一块，clip 掉
        if (
          categoryConfigs.radius &&
          categoryConfigs.radius[0] > CATEGORY_WIDTH
        ) {
          categoryConfigs.clip = new Rect({
            left: -configs.width! / 2,
            top: -configs.height! / 2,
            width: CATEGORY_WIDTH,
            height: configs.height!,
          });
        }
        return categoryConfigs;
      },
      getTopCategoryConfigs(layer: Layer, configs: NodeConfigs) {
        const { width = 140, height = 40 } = configs;
        const categoryConfigs: any = {
          left: -width / 2,
          top: -height / 2,
          width: configs.width,
          height: CATEGORY_WIDTH,
          fillStyle: configs.color,
        };
        const keyShape = layer.find((shape) => shape.get("_keyShape"));
        if (!keyShape) {
          return configs;
        }
        const radius = keyShape.get("radius");

        if (typeof radius === "number") {
          categoryConfigs.radius = [radius, radius, 0, 0];
        } else if (radius.length === 2) {
          categoryConfigs.radius = [radius[0], radius[0], 0, 0];
        } else {
          categoryConfigs.radius = [radius[0], radius[1], 0, 0];
        }
        // 圆角大于 4 的时候会多出来一块，clip 掉
        if (
          categoryConfigs.radius &&
          categoryConfigs.radius[0] > CATEGORY_WIDTH
        ) {
          categoryConfigs.clip = new Rect({
            left: -width / 2,
            top: -height / 2,
            width: width,
            height: CATEGORY_WIDTH,
          });
        }
        return categoryConfigs;
      },
      shape(layer: Layer, configs: NodeConfigs) {
        const categoryConfigs = this.getCategoryConfigs(layer, configs);
        const category = new Rect(categoryConfigs);
        category.directSet("id", "categoryRect");
        layer.add(category);
      },
      updateShapes(layer: Layer, configs: NodeConfigs) {
        const categoryRect = layer.findById("categoryRect");
        if (categoryRect) {
          categoryRect.set(this.getCategoryConfigs(layer, configs));
        }
      },
    },
    nodeBase
  );

  register(
    ELEMENT_TYPES.NODE,
    NODE_TYPES.IMAGE_TAG,
    {
      type: NODE_TYPES.IMAGE_TAG,
      extends: NODE_TYPES.RECT,
      drawCurrentLabel: false,
      getConfigsForShape(nodeData: any) {
        let label = nodeData.label;
        let img = nodeData.image;
        if (typeof img === "string") {
          img = { url: img, size: 24 };
        }
        if (!img.size) {
          img.size = 24;
        }
        if (typeof label === "string") {
          label = { text: nodeData.label };
        }
        return {
          ...nodeData,
          label: label
            ? {
                width:
                  nodeData.width -
                  DEFAULT_PADDING * 2 -
                  img.size -
                  DEFAULT_LABEL_PADDING,
                height: nodeData.height - DEFAULT_LABEL_PADDING * 2,
                textOverflow: "ellipsis",
                offsetX: img.size + DEFAULT_LABEL_PADDING,
                fontSize: 12,
                ...label,
              }
            : null,
          image: img,
        };
      },
      shape(layer: Layer, configs: any) {
        const { image, width } = configs;
        const size = image.size;
        delete image.size;
        const img = new ImageShape({
          left: -width / 2 + size / 2,
          top: -size / 2,
          width: size,
          height: size,
          id: "tagImage",
          ...image,
        });
        layer.add(img);
      },
      updateShapes(layer: Layer, configs: any) {
        const { image, width } = configs;
        const size = image.size;
        const img = layer.findById("tagImage");
        delete image.size;
        img?.set({
          left: -width / 2 + size / 2,
          top: -size / 2,
          width: size,
          height: size,
          ...image,
        });
      },
    },
    nodeBase
  );
}

export type RegisterNodeConfigs =
  | {
      extends?: string;
      drawCurrentLabel?: boolean;
      getConfigsForShape?: (data: NodeConfigs) => Record<string, unknown>;
      shape: (layer: Layer, configs: Record<string, unknown>) => void | Shape;
      updateShapes?: (layer: Layer, configs: Record<string, unknown>) => void;
      [k: string]: any;
    }
  | {
      init: (layer: Layer, configs: Record<string, unknown>) => Shape;
      update?: (layer: Layer, configs: Record<string, unknown>) => void;
      [k: string]: any;
    };

export function registerNode(name: string, configs: RegisterNodeConfigs) {
  const extend = configs.extends;
  if (extend && !configs.updateShapes) {
    configs.updateShapes = undefined;
  }
  register(ELEMENT_TYPES.NODE, name, configs, nodeBase);
}

export function unRegisterNode(name: string) {
  unRegister(ELEMENT_TYPES.NODE, name);
}
