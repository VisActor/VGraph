import {
  Layer,
  Path,
  Quadratic,
  Cubic,
  Shape,
  PathConfigs,
} from "../../renderer";
import {
  normalizePadding,
  getNormalizedRad,
  normalizeVector,
} from "../../utils";
import { ELEMENT_TYPES } from "../../consts/node_types";
import { EDGE_TYPES } from "../../consts/edge_types";
import Base from "./base";
import { register, unRegister } from "./register";
import { EdgeConfigs, LabelConfigs } from "../../typings/model";
import {
  getArcControlPoints,
  getLoopDist,
  getDefaultLoopPath,
  getRoundLoopPath,
  getArcLoopPath,
} from "./path";
import { isRectIntersect } from "../../renderer/utils/intersect";

const LABEL_TAN_PERCENT = 0.0001;
const PI = Math.PI;
const DEFAULT_LABEL_COLOR = "#626978";

export const edgeBase = Object.assign({}, Base, {
  extends: null,
  shape(layer: Layer, configs: EdgeConfigs) {
    const shapeConfigs = this.getShapeConfigs(configs);
    const shape = this.getShape(shapeConfigs);
    layer.add(shape);
    return shape;
  },

  getDefaultStyles(configs: EdgeConfigs) {
    const styles = this.getDefaultBaseStyles(configs);
    return {
      ...styles,
      lineWidth: configs.lineWidth || 1,
      hitWidth: configs.hitWidth || 4,
      strokeStyle: configs.strokeStyle || "#C9CDD4",
      // eslint-disable-next-line eqeqeq
      startArrow: configs.startArrow == null ? false : configs.startArrow,
      // eslint-disable-next-line eqeqeq
      endArrow: configs.endArrow == null ? false : configs.endArrow,
    };
  },

  // FIXME: 通过 keyShapeStyles 梳理清楚
  getDefaultBaseStyles(configs: EdgeConfigs) {
    const styles: any = {
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

  getShapeConfigs(configs: EdgeConfigs) {
    const points = this.getPoints(configs);
    const defaultStyles = this.getDefaultStyles(configs);
    return {
      ...defaultStyles,
      points,
    };
  },

  updateKeyShape(keyShape: Shape, configs: EdgeConfigs) {
    const points = this.getPoints(configs);
    keyShape.set("points", points);
  },

  updatePath(layer: Layer, configs: EdgeConfigs) {
    const keyShape = layer.find((shape: Shape) => shape.get("_keyShape"));
    if (!keyShape || keyShape.destroyed) {
      return;
    }
    this.updateKeyShape(keyShape, configs);
    if (!configs.label) {
      this.afterUpdatePath(layer, configs);
      return;
    }
    const labelShape = layer.find((shape: Shape) => shape.get("_label"));
    const backShape = layer.find((shape: Shape) => shape.get("_background"));
    const labelConfigs = this.getLabelConfigs(layer, configs);
    if (labelShape) {
      labelShape.setMatrix([1, 0, 0, 1, 0, 0]);
      labelShape.set(labelConfigs);
    }
    if (backShape && labelShape) {
      backShape.set(this.getBackgroundConfigs(labelShape, labelConfigs));
    }

    if (labelConfigs.rotate && labelShape) {
      const { x, y } = labelConfigs;
      labelShape.translate(-x, -y);
      labelShape.rawRotate(labelConfigs.rotate, true);
      labelShape.translate(x, y);
      delete labelConfigs.rotate;
    }
    if (backShape) {
      backShape.setMatrix(labelShape!.getMatrix().concat());
    }
    this.afterUpdatePath(layer, configs);
  },

  getBackgroundConfigs(label: Shape, labelConfigs: LabelConfigs) {
    const background = labelConfigs.background;
    if (background) {
      const bbox = label.getBBox();
      const padding = normalizePadding(background.padding || 0);
      background.left = bbox.left - padding[3];
      background.top = bbox.top - padding[0];
      background.width = bbox.width + padding[1] + padding[3];
      background.height = bbox.height + padding[0] + padding[2];
    }
    return background;
  },

  getPoints(configs: EdgeConfigs) {
    const extend: any = this.extends;
    if (extend) {
      return extend.getPoints(configs);
    }
    const { startPoint, endPoint } = configs;
    return [startPoint, endPoint];
  },

  getShape(shapeConfigs: any) {
    return new Cubic(shapeConfigs);
  },

  afterUpdatePath(layer: Layer, configs: EdgeConfigs) {
    return configs;
  },

  getStringLabelConfigs(shape: Shape, configs: EdgeConfigs) {
    const point = shape.getPointAt(0.5);
    return {
      text: configs.label,
      x: point.x,
      y: point.y,
      textAlign: "center",
      textBaseline: "middle",
      fillStyle: DEFAULT_LABEL_COLOR,
    };
  },

  getCustomLabelConfigs(shape: Shape, configs: EdgeConfigs) {
    const labelConfigs = configs.label as LabelConfigs;
    const {
      offsetX = 0,
      offsetY = 0,
      autoRotate = false,
      position,
    } = labelConfigs;
    const percent = position !== undefined ? position : 0.5;
    const point = shape.getPointAt(percent);
    const style: any = {
      x: point.x + offsetX,
      y: point.y + offsetY,
      textBaseline: "middle",
      fillStyle: DEFAULT_LABEL_COLOR,
      ...labelConfigs,
    };

    if (autoRotate) {
      let result;
      switch (percent) {
        case 0:
          result = getNormalizedRad(PI - shape.getStartRad().rad);
          if (result.reverse) {
            style.textAlign = "end";
            style.x -= offsetX * 2;
            style.y -= offsetY * 2;
          } else {
            style.textAlign = "start";
          }
          break;
        case 1:
          result = getNormalizedRad(-shape.getEndRad().rad);
          if (result.reverse) {
            style.textAlign = "start";
            style.x -= offsetX * 2;
            style.y -= offsetY * 2;
          } else {
            style.textAlign = "end";
          }
          break;
        default:
          style.textAlign = "center";
          // eslint-disable-next-line no-case-declarations
          const prePoint = shape.getPointAt(percent + LABEL_TAN_PERCENT);
          // eslint-disable-next-line no-case-declarations
          const rad = -Math.atan2(prePoint.y - point.y, prePoint.x - point.x);
          result = getNormalizedRad(rad);
      }
      style.rotate = result.rad;
    } else {
      style.textAlign =
        percent === 0 ? "start" : position === 1 ? "end" : "center";
    }
    return style;
  },

  getLabelConfigs(layer: Layer, configs: EdgeConfigs) {
    const keyShape = layer.find((shape) => shape.get("_keyShape"));
    const label = configs.label;
    if (!keyShape) {
      return;
    }
    if (typeof label === "string") {
      return this.getStringLabelConfigs(keyShape, configs);
    }
    return this.getCustomLabelConfigs(keyShape, configs);
  },
});

const lineEdgeBase = Object.assign({}, edgeBase, {
  extends: null,
  getShape(shapeConfigs: PathConfigs) {
    return new Path(shapeConfigs);
  },

  updateKeyShape(keyShape: Path, configs: EdgeConfigs) {
    const path = this.getPath(configs);
    keyShape.set("path", path);
  },

  getPath(configs: EdgeConfigs) {
    const extend: any = this.extends;
    if (extend) {
      const path: string[][] = extend.getPath(configs);
      return path;
    }
    return [];
  },

  getShapeConfigs(configs: EdgeConfigs) {
    const path = this.getPath(configs);
    const defaultStyles = edgeBase.getDefaultStyles(configs);
    return {
      ...defaultStyles,
      path,
    };
  },
});

export function registerMetaEdges() {
  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.LINE,
    {
      getPath(configs: any) {
        const { startPoint, endPoint, controlPoints } = configs;
        const path: (string | number)[][] = [
          ["M", startPoint[0], startPoint[1]],
        ];
        if (controlPoints) {
          for (const point of controlPoints) {
            path.push(["L", point[0], point[1]]);
          }
        }
        path.push(["L", endPoint[0], endPoint[1]]);
        return path;
      },
    },
    lineEdgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.HLINE,
    {
      getPath(configs: any) {
        const { startPoint, endPoint, styles = {} } = configs;
        const radius = styles.radius || 5;
        let { curvePosition = 0.5, curveOffset = 0 } = styles;
        const dx = endPoint[0] - startPoint[0];
        const dy = endPoint[1] - startPoint[1];
        const xTowards = dx > 0 ? 1 : -1;
        const yTowards = dy > 0 ? 1 : -1;
        const path: (string | number)[][] = [
          ["M", startPoint[0], startPoint[1]],
        ];
        if (dy === 0) {
          path.push(["H", endPoint[0]]);
          return path;
        }
        let lineX = startPoint[0] + dx * curvePosition + curveOffset;
        if (
          (lineX < startPoint[0] && lineX < endPoint[0]) ||
          (lineX > startPoint[0] && lineX > endPoint[0])
        ) {
          console.warn(
            "Invalid curve position, will fallback to default configs"
          );
          lineX = startPoint[0] + dx * 0.5;
          curvePosition = 0.5;
          curveOffset = 0;
        }
        let r = radius;
        if (Math.abs(dy) > 0) {
          // 非垂直线才绘制圆弧
          if (
            0.5 * Math.abs(dy) < radius ||
            curvePosition * Math.abs(dx) + curveOffset < radius ||
            (1 - curvePosition) * Math.abs(dx) - curveOffset < radius
          ) {
            r = Math.min(
              0.5 * Math.abs(dy),
              curvePosition * Math.abs(dx),
              (1 - curvePosition) * Math.abs(dx)
            );
          } // 逻辑与tuningLine 统一，即 r 取能取到的最大值
          // if (startPoint[0] !== lineX - xTowards * r){ // 两点不同时才绘制直线
          //   path.push(['H', lineX - xTowards * r]);
          // }
          path.push(["H", lineX - xTowards * r]);
          path.push([
            "Q",
            lineX,
            startPoint[1],
            lineX,
            startPoint[1] + yTowards * r,
            0.5 * Math.PI * r,
          ]);
          // if (startPoint + yTowards * r !== endPoint[1] - yTowards * r) { // 两点不同时才绘制直线
          //   path.push(['V', endPoint[1] - yTowards * r]);
          // }
          path.push(["V", endPoint[1] - yTowards * r]);
          path.push([
            "Q",
            lineX,
            endPoint[1],
            lineX + xTowards * r,
            endPoint[1],
            0.5 * Math.PI * r,
          ]);
        }
        if (Math.abs(dy) <= 0 || lineX + xTowards * r !== endPoint[0]) {
          // 垂直线或拐线终点与终点不相同时才绘制直线
          path.push(["H", endPoint[0]]);
        }
        return path;
      },
    },
    lineEdgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.VLINE,
    {
      getPath(configs: any) {
        const { startPoint, endPoint, styles = {} } = configs;
        const radius = styles.radius || 5;
        let { curvePosition = 0.5, curveOffset = 0 } = styles;
        const dx = endPoint[0] - startPoint[0];
        const dy = endPoint[1] - startPoint[1];
        const xTowards = dx > 0 ? 1 : -1;
        const yTowards = dy > 0 ? 1 : -1;
        const path: (string | number)[][] = [
          ["M", startPoint[0], startPoint[1]],
        ];
        if (dx === 0) {
          path.push(["V", endPoint[1]]);
          return path;
        }
        let lineY = startPoint[1] + dy * curvePosition + curveOffset;
        if (
          (lineY < startPoint[1] && lineY < endPoint[1]) ||
          (lineY > startPoint[1] && lineY > endPoint[1])
        ) {
          console.warn(
            "Invalid curve position, will fallback to default configs"
          );
          lineY = startPoint[1] + dy * 0.5;
          curvePosition = 0.5;
          curveOffset = 0;
        }
        let r = radius;
        if (Math.abs(dx) > 0) {
          // 非垂直线才绘制圆弧
          if (
            0.5 * Math.abs(dx) < radius ||
            curvePosition * Math.abs(dy) + curveOffset < radius ||
            (1 - curvePosition) * Math.abs(dy) - curveOffset < radius
          ) {
            r = Math.min(
              0.5 * Math.abs(dx),
              curvePosition * Math.abs(dy),
              (1 - curvePosition) * Math.abs(dy)
            );
          } // TODO: 由于 curvePosition 的存在， 所以应该分为 r1 和 r2
          // if (startPoint[1]!== lineY - yTowards * r){ // 两点不同时才绘制
          //   path.push(['V', lineY - yTowards * r]);
          // }
          path.push(["V", lineY - yTowards * r]);
          path.push([
            "Q",
            startPoint[0],
            lineY,
            startPoint[0] + xTowards * r,
            lineY,
            0.5 * Math.PI * r,
          ]);
          path.push(["H", endPoint[0] - xTowards * r]);
          path.push([
            "Q",
            endPoint[0],
            lineY,
            endPoint[0],
            lineY + yTowards * r,
            0.5 * Math.PI * r,
          ]);
        }

        if (Math.abs(dx) <= 0 || lineY + yTowards * r !== endPoint[1]) {
          path.push(["V", endPoint[1]]);
        }
        return path;
      },
    },
    lineEdgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.TURNINGLINE,
    {
      getPath(configs: any) {
        const { source, target, startPoint, endPoint, styles = {} } = configs;
        const { radius, radian = 10, curvePosition = [] } = styles;
        let controlPoints = configs.controlPoints;
        const path: (string | number)[][] = [
          ["M", startPoint[0], startPoint[1]],
        ];
        if (!controlPoints) {
          controlPoints = getTurningControlPoint(
            source,
            target,
            curvePosition,
            startPoint,
            endPoint
          );
        }
        for (let i = 0; i < controlPoints.length; i++) {
          const point1 = i === 0 ? startPoint : controlPoints[i - 1];
          const vertex = controlPoints[i];
          const point2 =
            i === controlPoints.length - 1 ? endPoint : controlPoints[i + 1];
          const isRadius = typeof radius === "number";
          const length = isRadius ? radius : radian;
          if (length <= 0) {
            path.push(["L", vertex[0], vertex[1]]);
            continue;
          }
          const [cp1, cp2, , r, angle] = getArcControlPoints(
            point1,
            vertex,
            point2,
            length,
            isRadius
          );
          // fixme: 后续想想是不是可能可以简化cp1, cp2, r 的计算
          if (!r) {
            path.push(["L", cp2[0], cp2[1]]);
          } else {
            path.push(["L", cp1[0], cp1[1]]);
            // path.push(['A', r, r, 0, 0, fs, cp2[0], cp2[1]]);
            path.push([
              "Q",
              vertex[0],
              vertex[1],
              cp2[0],
              cp2[1],
              (angle as number) * (r as number),
            ]);
          }
        }
        path.push(["L", endPoint[0], endPoint[1]]);
        return path;
      },
    },
    lineEdgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.QUADRATIC,
    {
      getShape(shapeConfigs: any) {
        return new Quadratic(shapeConfigs);
      },

      getPoints(configs: any) {
        const { startPoint, endPoint, styles = {} } = configs;
        let controlPoints = configs.controlPoints;
        if (!controlPoints) {
          const { curveOffset = -20, curvePosition = 0.5 } = styles;
          controlPoints = [
            getCurveControlPoint(
              startPoint,
              endPoint,
              curvePosition,
              curveOffset
            ),
          ];
        }
        return [startPoint, controlPoints[0], endPoint];
      },
    },
    edgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.CUBIC,
    {
      getPoints(configs: any) {
        const { startPoint, endPoint, styles = {} } = configs;
        let controlPoints = configs.controlPoints;
        const { curveOffset = [-20, 20], curvePosition = [0.5, 0.5] } = styles;
        // router 可能生成 controlPoints 带入到这里，不满足绘制条件的直接抛掉
        if (!controlPoints || controlPoints.length !== 2) {
          controlPoints = [
            getCurveControlPoint(
              startPoint,
              endPoint,
              curvePosition[0],
              curveOffset[0]
            ),
            getCurveControlPoint(
              startPoint,
              endPoint,
              curvePosition[1],
              curveOffset[1]
            ),
          ];
          controlPoints = adjustControlPoints(configs, controlPoints);
        }

        return [startPoint, controlPoints[0], controlPoints[1], endPoint];
      },
    },
    edgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.HCUBIC,
    {
      getPoints(configs: any) {
        const { startPoint, endPoint, styles = {} } = configs;
        const { curvePosition = [0.5, 0.5] } = styles;
        const cp1 = [
          (endPoint[0] - startPoint[0]) * curvePosition[0] + startPoint[0],
          startPoint[1],
        ];
        const cp2 = [
          (endPoint[0] - startPoint[0]) * curvePosition[1] + startPoint[0],
          endPoint[1],
        ];
        const controlPoints = adjustControlPoints(configs, [cp1, cp2], "h");
        return [startPoint, controlPoints[0], controlPoints[1], endPoint];
      },
    },
    edgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.VCUBIC,
    {
      getPoints(configs: any) {
        const { startPoint, endPoint, styles = {} } = configs;
        const { curvePosition = [0.5, 0.5] } = styles;
        const cp1 = [
          startPoint[0],
          (endPoint[1] - startPoint[1]) * curvePosition[0] + startPoint[1],
        ];
        const cp2 = [
          endPoint[0],
          (endPoint[1] - startPoint[1]) * curvePosition[1] + startPoint[1],
        ];
        const controlPoints = adjustControlPoints(configs, [cp1, cp2], "v");
        return [startPoint, controlPoints[0], controlPoints[1], endPoint];
      },
    },
    edgeBase
  );

  register(
    ELEMENT_TYPES.EDGE,
    EDGE_TYPES.LOOP,
    {
      getShape(configs: any) {
        const theme = configs.theme;
        if (theme === "arc") {
          return new Quadratic(configs);
        }
        return new Path(configs);
      },

      updateKeyShape(keyShape: any, configs: any) {
        const path = this.getPath(configs);
        if (keyShape.type === "quadratic") {
          keyShape.set("points", path);
        } else {
          keyShape.set("path", path);
        }
      },

      getPath(configs: any) {
        const { loop = {} } = configs;
        const { theme } = loop;
        const dist = getLoopDist(loop.dist, configs.source, configs);
        if (theme === "round") {
          return getRoundLoopPath(dist, configs);
        }
        if (theme === "arc") {
          return getArcLoopPath(dist, configs);
        }
        return getDefaultLoopPath(dist, configs);
      },

      getShapeConfigs(configs: any): any {
        const path = this.getPath(configs);
        const defaultStyles = edgeBase.getDefaultStyles(configs);
        const { loop = {} } = configs;
        const { clockwise = true, theme } = loop;
        const cfgs: any = {
          ...defaultStyles,
          theme: loop.theme,
          startArrow: defaultStyles.startArrow || clockwise === false,
          endArrow: defaultStyles.endArrow || clockwise,
        };
        if (theme === "arc") {
          cfgs.points = path;
        } else {
          cfgs.path = path;
        }
        return cfgs;
      },
    },
    edgeBase
  );
}

export type RegisterEdgeConfigs = {
  extends?: string;
  drawCurrentLabel?: boolean;
  getConfigsForShape?: (data: EdgeConfigs) => Record<string, unknown>;
  shape: (layer: Layer, configs: Record<string, unknown>) => Shape | void;
  updatePath?: (layer: Layer, configs: Record<string, unknown>) => void;
  updateShapes?: (layer: Layer, configs: Record<string, unknown>) => void;
  afterUpdatePath?: (layer: Layer, configs: Record<string, unknown>) => void;
  [k: string]: any;
};

export function registerEdge(name: string, configs: any) {
  let base: any = lineEdgeBase;
  const extend: string = configs.extends;
  if (
    extend &&
    [
      EDGE_TYPES.QUADRATIC,
      EDGE_TYPES.CUBIC,
      EDGE_TYPES.LOOP,
      EDGE_TYPES.HCUBIC,
      EDGE_TYPES.VCUBIC,
    ].includes(extend)
  ) {
    base = edgeBase;
  }
  // 是否定义了连线的 updatePosition 方法
  if (extend && !configs.updatePath && !configs.afterUpdatePath) {
    configs.updatePath = null;
  }
  // 是否定义了连线的 updateData 方法
  if (extend && !configs.updateShapes) {
    configs.updateShapes = null;
  }
  register(ELEMENT_TYPES.EDGE, name, configs, base);
}

export function unRegisterEdge(name: string) {
  unRegister(ELEMENT_TYPES.EDGE, name);
}

export function getCurveControlPoint(
  startPoint: number[],
  endPoint: number[],
  t: number,
  offset: number
) {
  const point = [
    (1 - t) * startPoint[0] + t * endPoint[0],
    (1 - t) * startPoint[1] + t * endPoint[1],
  ];
  const tan = normalizeVector([
    endPoint[0] - startPoint[0],
    endPoint[1] - startPoint[1],
  ]);
  const normal = [-tan[1] * offset, tan[0] * offset];
  point[0] += normal[0];
  point[1] += normal[1];
  return point;
}

export function adjustControlPoints(
  configs: any,
  controlPoints: number[][],
  direction: "v" | "h" = "v"
) {
  const { startPoint, endPoint, source, target, styles = {} } = configs;
  if (!configs.adjustControlPoints) {
    return controlPoints;
  }
  if (
    !source ||
    !target ||
    ["circle", "rhombus"].includes(source.get("type")) ||
    ["circle", "rhombus"].includes(target.get("type"))
  ) {
    return controlPoints;
  }
  const { curveOffset = [-20, 20] } = styles;
  const edgeBox = {
    left: Math.min(startPoint[0], endPoint[0]) + 1,
    top: Math.min(startPoint[1], endPoint[1]) + 1,
    width: Math.max(Math.abs(startPoint[0] - endPoint[0]) - 2, 1),
    height: Math.max(Math.abs(startPoint[1] - endPoint[1]) - 2, 1),
  };

  // 如果控制点穿过节点，改变控制点到能看清出线，比如当 source 在 target 下方时，从 source 的下锚点连接到 target 上锚点的情况
  const sourceBBox = source.getBBox();
  const targetBBox = target.getBBox();
  const sourceCenter = {
    x: sourceBBox.left + sourceBBox.width / 2,
    y: sourceBBox.top + sourceBBox.height / 2,
  };
  const targetCenter = {
    x: targetBBox.left + targetBBox.width / 2,
    y: targetBBox.top + targetBBox.height / 2,
  };
  if (source.get("anchors") && isRectIntersect(edgeBox, sourceBBox)) {
    // 没有锚点时会采用最近连接点因此不需要改变控制点。
    const offset = Math.abs(curveOffset[0]) * 3;
    controlPoints[0] = getReversedCurveControlPoint(
      sourceCenter,
      targetCenter,
      startPoint,
      offset
    );
  }
  if (source.get("anchors") && isRectIntersect(edgeBox, targetBBox)) {
    const offset = Math.abs(curveOffset[1]) * 3;
    controlPoints[1] = getReversedCurveControlPoint(
      targetCenter,
      sourceCenter,
      endPoint,
      offset
    );
  }

  // 起始点和终点平行时，vLine避免水平贴边；hLine 避免垂直贴边。
  if (direction === "v") {
    edgeBox.top -= 2; // 拓宽上下边界，判断是否有交，如果没有交，则不是贴边。
    edgeBox.height += 4;
  } else {
    edgeBox.left -= 2;
    edgeBox.width += 4;
  }
  if (
    (direction === "v" &&
      Math.abs(startPoint[1] - endPoint[1]) <= 2 &&
      isRectIntersect(edgeBox, sourceBBox) &&
      isRectIntersect(edgeBox, targetBBox)) ||
    (direction === "h" &&
      Math.abs(startPoint[0] - endPoint[0]) <= 2 &&
      isRectIntersect(edgeBox, sourceBBox) &&
      isRectIntersect(edgeBox, targetBBox))
  ) {
    const offset = Math.abs(curveOffset[0]) * 2;
    controlPoints[0] = getReversedCurveControlPoint(
      sourceCenter,
      targetCenter,
      startPoint,
      offset
    );
    controlPoints[1] = getReversedCurveControlPoint(
      targetCenter,
      sourceCenter,
      endPoint,
      offset
    );
  }
  return controlPoints;
}

function getReversedCurveControlPoint(
  sourcePoint: any,
  targetPoint: any,
  point: number[],
  offset: number
) {
  const { x, y } = sourcePoint;
  let xOffset = x > point[0] ? -offset : offset;
  let yOffset = y > point[1] ? -offset : offset;
  if (x === point[0]) {
    xOffset = targetPoint.x > x ? offset : -offset;
  }
  if (y === point[1]) {
    yOffset = targetPoint.y > y ? offset : -offset;
  }
  return [point[0] + xOffset, point[1] + yOffset];
}

export function getTurningControlPoint(
  source: any,
  target: any,
  curvePosition: number[][],
  startPoint: number[],
  endPoint: number[]
) {
  const controlPoints = [];
  const [x0, y0] = source ? [source.get("x"), source.get("y")] : startPoint;
  const [x1, y1] = target ? [target.get("x"), target.get("y")] : endPoint;
  const [dx, dy] = [x1 - x0, y1 - y0];
  for (const position of curvePosition) {
    controlPoints.push([x0 + dx * position[0], y0 + dy * position[1]]);
  }
  return controlPoints;
}
