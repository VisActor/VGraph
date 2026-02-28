import { Rect } from "./shapes/rect";
import { Circle } from "./shapes/circle";
import { Text } from "./shapes/text";
import { Path } from "./shapes/path";
import { Quadratic } from "./shapes/quadratic";
import { Cubic } from "./shapes/cubic";
import { Image } from "./shapes/image";
import { Icon } from "./shapes/icon";
import { Polygon } from "./shapes/polygon";
import { Rhombus } from "./shapes/rhombus";

import { LayerBase as Layer } from "./layers/base";
import { ShapeBase } from "./shape";
import NodeLayer from "./layers/node_layer";
import EdgeLayer from "./layers/edge_layer";
import GroupLayer from "./layers/group_layer";

import { Canvas } from "./canvas";

import { getFontByConfigs, getCharLen, measureText } from "./utils/text";
import { extrema, getPoint, length, derive, at } from "./utils/bezier";
import {
  isPointIntersect,
  isRectIntersect,
  isPathIntersect,
  getNearestPoint,
  getCircleIntersect,
  getRectIntersect,
  pointToRectDist,
} from "./utils/intersect";

export type {
  BBox,
  Point,
  ArrowType,
  BaseConfigs,
  RectConfigs,
  CircleConfigs,
  PathConfigs,
  QuadraticConfigs,
  PolygonConfigs,
  TextConfigs,
  ImageConfigs,
  IconConfigs,
  LayerConfigs,
  CanvasConfigs,
  AnimationConfigs,
  Shape,
} from "../typings/renderer";

export { LayerBase } from "./layers/base";

export const textUtil = { getFontByConfigs, getCharLen, measureText };
export const BezierUtil = { extrema, getPoint, length, derive, at };
export const IntersectUtil = {
  isPointIntersect,
  isRectIntersect,
  isPathIntersect,
  getNearestPoint,
  getCircleIntersect,
  getRectIntersect,
  pointToRectDist,
};

export {
  Canvas,
  Layer,
  NodeLayer,
  EdgeLayer,
  GroupLayer,
  ShapeBase,
  Rect,
  Circle,
  Text,
  Path,
  Quadratic,
  Cubic,
  Image,
  Icon,
  Polygon,
  Rhombus,
};
