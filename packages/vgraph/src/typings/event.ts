import { Shape, Layer } from "../renderer";
import { Group, Edge, Node } from "../models/entities";

/**
 * The ShapeEvent type defines the structure of an shape-based event object
 * 图中最小粒度的事件定义，往往是一个特定图形 shape 的事件
 */
export type ShapeEvent = {
  type: string;
  target: Shape;
  relatedTarget?: Shape;
  nativeEvent: MouseEvent | TouchEvent;
  clientX: number;
  clientY: number;
  bubbles: boolean;
  stopPropagation: () => void;
};

/**
 * The LayerEvent type defines the structure of an layer-based event object emitted by a child shape
 * 图中图层粒度的事件，可能是图层中某个图形出发冒泡得到
 */
export type LayerEvent = ShapeEvent & {
  relatedTarget?: Shape;
  target: Layer;
};

/**
 * The GraphEvent type defines the structure of an shape-based event object
 * 图中常用事件，触发对象是一个图元(节点、连线、分组)
 */
export type GraphEvent = ShapeEvent & {
  relatedTarget?: Shape;
  target?: Node | Edge | Group;
};
