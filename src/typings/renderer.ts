import { ShapeBase } from '../renderer/shape';

export type Shape = ShapeBase & {
  [k: string]: any;
};

// 包围盒模型
export type BBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// 坐标模型
export type Point = {
  x: number;
  y: number;
};

export type ArrowType =
  | boolean
  | {
      type?: 'default' | 'default-round' | 'circle';
      width?: number;
      height?: number;
    };

// 图形通用配置项
export type BaseConfigs = {
  /**
   * The opacity of the shape(0-1).
   * 图形的透明度 (0-1)
   */
  opacity?: number;
  /**
   * The fill color of the shape.
   * 图形的填充色
   */
  fillStyle?: string;
  /**
   * The stroke color of the shape.
   * 图形的边框色
   */
  strokeStyle?: string | null;
  /**
   * The width of shape's stroke.
   * 图形的边框宽度
   */
  lineWidth?: number;
  /**
   * The dash configure of shape's stroke.
   * 图形的边框虚线配置
   */
  lineDash?: number | number[];
  // 虚线偏移
  lineDashOffset?: number;
  // 连线终端样式
  lineCap?: 'butt' | 'round' | 'square';
  // 模糊效果，配置同 h5 canvas
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  cursor?: string;

  [key: string]: any;
};

export type RectConfigs = BaseConfigs & {
  left: number;
  top: number;
  width: number;
  height: number;
  radius?: number | number[];
};

export type CircleConfigs = BaseConfigs & {
  cx: number;
  cy: number;
  r: number;
};

export type PathConfigs = BaseConfigs & {
  path: (string | number)[][];
  startArrow?: ArrowType;
  endArrow?: ArrowType;
  hitWidth?: number;
};

export type QuadraticConfigs = BaseConfigs & {
  points: number[][];
  startArrow?: ArrowType;
  endArrow?: ArrowType;
  hitWidth?: number;
};

export type PolygonConfigs = BaseConfigs & {
  points?: number[][];
  type?: 'regular' | 'star';
  n?: number;
  cx?: number;
  cy?: number;
  edgeLength?: number;
  outerRadius?: number;
  innerRadius?: number;
};

export type TextConfigs = BaseConfigs & {
  text: string;
  x: number;
  y: number;

  width?: number;
  height?: number;
  textOverflow?: 'clip' | 'ellipsis';

  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
  textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
  fontSize?: number;
  lineHeight?: number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: 'normal' | 'small-caps';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontFamily?: string;
};

export type ImageConfigs = BaseConfigs & {
  left: number;
  top: number;
  width: number;
  height: number;
  url?: string;
  img?: HTMLImageElement;
  crossOrigin?: 'anonymous' | 'use-credentials';
};

export type IconConfigs = BaseConfigs & {
  x: number;
  y: number;
  icon: string;
  size?: number;
  fontFamily?: string;
};

export type LayerConfigs = {
  // node configs
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  appendSize?: number | number[]; // top right bottom left
  hitWidth?: number;
  // group configs
  shape?: any;
  padding?: number | number[];
  // edge configs
  source?: Shape;
  target?: Shape;

  [key: string]: any;
};

export type CanvasConfigs = {
  container: string | HTMLElement;
  width: number;
  height: number;
  pixelRatio?: number;
};

export type AnimationConfigs = {
  target: Shape;
  id?: string;
  configs?: any;
  onFrame?: (ratio: number) => any;
  duration: number;
  repeat?: boolean | number;
  easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
  delay?: number;
  onFinish?: () => void;
};

export type RhombusConfigs = BaseConfigs & {
  left: number;
  top: number;
  width: number;
  height: number;
  radius?: number;
};
