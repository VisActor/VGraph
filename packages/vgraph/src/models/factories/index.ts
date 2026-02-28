import {
  ANCHOR_TYPES,
  ELEMENT_TYPES,
  NODE_TYPES,
} from "../../consts/node_types";
import { EDGE_TYPES } from "../../consts/edge_types";
import { registerMetaNodes } from "./node";
import { registerMetaEdges } from "./edge";
import { registerMetaAnchors } from "./anchor";
import { getShapeMethods } from "./register";

registerMetaNodes();
registerMetaEdges();
registerMetaAnchors();

export { registerNode, unRegisterNode } from "./node";
export type { RegisterNodeConfigs } from "./node";
export { registerEdge, unRegisterEdge } from "./edge";
export type { RegisterEdgeConfigs } from "./edge";
export { registerAnchor, unRegisterAnchor } from "./anchor";

export { getRouterCubicPath } from "./path";

export function getNodeMethods(name?: string | number) {
  return (
    (name && getShapeMethods(ELEMENT_TYPES.NODE, name + "")) ||
    getShapeMethods(ELEMENT_TYPES.NODE, NODE_TYPES.RECT)
  );
}

export function hasNodeType(name: string) {
  return !!getShapeMethods(ELEMENT_TYPES.NODE, name);
}

export function getEdgeMethods(name?: string | number, configs?: any) {
  // vLine 和 hLine 的拐点是固定位置的，在 dag 中计算出 controlPoints 时切换为 turningLine 保证控制点有效
  if (
    (name === EDGE_TYPES.VLINE || name === EDGE_TYPES.HLINE) &&
    configs?.controlPoints &&
    !configs?.ignoreControlPoints
  ) {
    return getShapeMethods(ELEMENT_TYPES.EDGE, EDGE_TYPES.TURNINGLINE);
  }
  // 如果自环但是指定了控制点, 用 turningLine 来展示
  if (name === EDGE_TYPES.LOOP && configs?.controlPoints) {
    return getShapeMethods(ELEMENT_TYPES.EDGE, EDGE_TYPES.TURNINGLINE);
  }
  return (
    (name && getShapeMethods(ELEMENT_TYPES.EDGE, name + "")) ||
    getShapeMethods(ELEMENT_TYPES.EDGE, EDGE_TYPES.LINE)
  );
}

export function hasEdgeType(name: string) {
  return !!getShapeMethods(ELEMENT_TYPES.EDGE, name);
}

export function getAnchorMethods(name?: string) {
  if (!name) {
    return getShapeMethods(ELEMENT_TYPES.ANCHOR, ANCHOR_TYPES.DOT);
  }
  return (
    getShapeMethods(ELEMENT_TYPES.ANCHOR, name) ||
    getShapeMethods(ELEMENT_TYPES.ANCHOR, ANCHOR_TYPES.DOT)
  );
}
