import { ImageConfigs, Layer, BaseConfigs } from "../renderer";
import { ShapeEvent } from "./event";
import { Group } from "../models/entities";

export type NodeConfigs = {
  /**
   * Node type, which can be a built-in node or a custom node.
   * 节点类型，可以是内置节点也可以是自定义节点
   */
  type?: string | number;
  /**
   * Uuid of the node.
   * 节点唯一标识
   */
  id?: string;
  /**
   * The id of the parent group.
   * 节点归属的父分组 id
   */
  groupId?: string;
  /**
   * Horizontal coordinate of the node.
   * 节点横坐标
   */
  x?: number;
  /**
   * Vertical coordinate of the node.
   * 节点纵坐标
   */
  y?: number;
  /**
   * Width of the node.
   * 节点宽度
   */
  width?: number;
  /**
   * Height of the node.
   * 节点高度
   */
  height?: number;
  /**
   * The configurations of label in the node.
   * 节点文本标签配置
   */
  label?: string | LabelConfigs | null;
  /**
   * The configurations of anchors.
   * 节点锚点配置
   */
  anchors?: (AnchorConfigs | number[])[];
  /**
   * The configurations of icons.
   * 节点图标配置
   */
  icons?: NodeIconConfigs[];
  /**
   * Main color of the node, works for built-in nodes.
   * 节点主色，对内置节点有效
   */
  color?: string;
  /**
   * The configurations of title.
   * 节点标题配置
   */
  title?: TitleConfigs;
  /**
   * The configurations of image.
   * 节点图片配置
   */
  image?: NodeImageConfigs;
  /**
   * The border radius of the shape.
   * 图形圆角配置
   */
  radius?: number;
  [key: string]: any;
} & BaseConfigs;

export type EdgeConfigs = {
  /**
   * Edge type, which can be a built-in edge or a custom edge.
   * 连线类型，可以是内置连线也可以是自定义连线
   */
  type?: string | number;
  /**
   * Uuid of the edge.
   * 连线唯一标识
   */
  id?: string;
  /**
   * Source node id of the edge.
   * 源节点 id
   */
  source?: string;
  /**
   * Target node id of the edge.
   * 目标节点 id
   */
  target?: string;
  /**
   * Customize the start coordinates.
   * 自定义起始点位置
   */
  startPoint?: number[];
  /**
   * Customize the end coordinates.
   * 自定义终止点位置
   */
  endPoint?: number[];
  /**
   * Customize the end coordinates.
   * 连线文本标签配置
   */
  label?:
    | string
    | (LabelConfigs & {
        /**
         * Percentage positioning of the label relative to the edge.
         * 文本标签相对于连线的百分比定位，默认为 `0.5`
         */
        position?: number;
      });
  /**
   * Customize the loop edge styles.
   * 自环连线配置
   */
  loop?: LoopConfigs;
  /**
   * The control points of the edge.
   * 连线控制点
   */
  controlPoints?: number[][];
  /**
   * The styles of curve or turning line.
   * 曲线样式
   */
  styles?: {
    /**
     * Percentage positioning of the turing point relative to the edge.
     * 拐点相对于连线的百分比定位
     */
    curvePosition?: number | number[];
    /**
     * Absolute offset of the turning point.
     * 图标相对于节点的绝对偏移(px)
     */
    curveOffset?: number | number[];
    /**
     * The radius of the turning angle.
     * 拐角圆角大小
     */
    radius?: number;
  };
  /**
   * The anchor index of source node.
   * 指定连接到源节点的一个锚点
   */
  sourceAnchor?: number;
  /**
   * The anchor index of target node.
   * 指定连接到目标节点的一个锚点
   */
  targetAnchor?: number;
  [key: string]: any;
} & BaseConfigs;

export type GroupConfigs = {
  /**
   * Uuid of the group.
   * 分组唯一标识
   */
  id?: string;
  /**
   * The id of the parent group.
   * 分组归属的父分组 id
   */
  groupId?: string;
  /**
   * The padding between group and child entities.
   * 分组与子元素之间的留白
   */
  padding?: number | number[];
  /**
   * The ids if direct children.
   * 分组的直接子元素 id
   */
  children?: string[];
  /**
   * Whether the edges of children are linked to the group.
   * 子元素的连线是否代理到分组上
   */
  linkNode?: boolean;
  /**
   * Whether to proxy the edges of children to the group when the group is collapsed.
   * 是否在分组收起时将子元素连线代理到分组上
   */
  linkGroupOnCollapse?: boolean;
  /**
   * Group anchor configuration.
   * 分组锚点配置
   */
  anchors?: number[][] | AnchorConfigs[];
  /**
   * Fix the horizontal position of the group.
   * 固定分组的水平位置
   */
  fixLeft?: number;
  /**
   * Fix the vertical position of the group.
   * 固定分组的垂直位置
   */
  fixTop?: number;
  /**
   * Fix the width of the group.
   * 固定分组的宽度
   */
  fixWidth?: number;
  /**
   * Fix the height of the group.
   * 固定分组的高度
   */
  fixHeight?: number;
  /**
   * Configure the position of the group title.
   * 配置分组标题的位置
   */
  titlePosition?: "left" | "top";
  /**
   * Size of the group title.
   * 配置分组标题的位置
   */
  titleSize?: number;
  /**
   * Customize the group title.
   * 自定义分组标题样式
   */
  renderGroupTitle?: (groupData: any, layer: Layer, width: number) => void;
  /**
   * Configure the styles of the built-in group title.
   * 内置分组标题配置
   */
  title?: GroupTitleConfigs;
  [key: string]: any;
} & BaseConfigs;

type bgStyles = {
  type: string;
  styles?: any;
  size?: number;
};
export type NodeIconConfigs = {
  /**
   * Percentage positioning of the icon relative to the node.
   * 图标相对于节点的百分比定位(0-1)
   */
  position: number[];
  /**
   * Customize the icon styles.
   * 自定义图标样式
   */
  setStyles: (nodeData: any) => {
    icon: string;
    size?: number;
    [k: string]: unknown;
  };
  /**
   * The way to display the icon.
   * 图标展示方式
   */
  show?: "always" | "hover";
  /**
   * Absolute offsets of the icon(px).
   * 图标相对于节点的绝对偏移(px)
   */
  offsets?: number[];
  /**
   * Click handler of the icon.
   * 图标点击回调
   */
  onClick?: (e: ShapeEvent, nodeData: any) => void;
  /**
   * Mouse enter handler of the icon.
   * 图标移入锚点回调
   */
  onMouseEnter?: (e: ShapeEvent, nodeData: any) => void;
  /**
   * Mouse leave handler of the icon.
   * 图标移出锚点回调
   */
  onMouseLeave?: (e: ShapeEvent, nodeData: any) => void;
  /**
   * Customize the background of the icon.
   * 自定义图标背景样式
   */
  setBgStyles?: (nodeData: any) => bgStyles;
};

export type LabelConfigs = {
  /**
   * Content of the label.
   * 文本标签内容
   */
  text?: string;
  /**
   * Absolute horizontal offset of the label(px).
   * 文本标签内容的绝对水平偏移(px)
   */
  offsetX?: number;
  /**
   * Absolute vertical offset of the label(px).
   * 文本标签内容的绝对垂直偏移(px)
   */
  offsetY?: number;
  /**
   * The background rect shape configuration of the label.
   * 文本标签背景矩形样式配置
   */
  background?: {
    /**
     * The padding between rect and label.
     * 背景矩形与标签文本之间的留白
     */
    padding?: number[];
    /**
     * The fill color of the background.
     * 背景矩形的填充色
     */
    fillStyle?: string;
    /**
     * The stroke color of the background.
     * 背景矩形的边框色
     */
    strokeStyle?: string;
    [key: string]: any;
  };
  /**
   * Text horizontal alignment.
   * 文本水平对齐方式
   */
  textAlign?: string;
  /**
   * Text vertical alignment.
   * 文本垂直对齐方式
   */
  textBaseline?: string;
  /**
   * Text font weight.
   * 文本字体粗细
   */
  fontWeight?: number;
  /**
   * Text font size.
   * 文本字号
   */
  fontSize?: number;
  /**
   * Text font family.
   * 文本字体
   */
  fontFamily?: string;
  /**
   * Text line height.
   * 文本行高
   */
  lineHeight?: number;
} & BaseConfigs;

export type AnchorConfigs = {
  /**
   * The type of anchor, with the default being a circular dot.
   * 锚点种类，默认圆点 `dot`
   */
  type?: "dot";
  /**
   * Percentage positioning of the anchor point relative to the node.
   * 锚点相对于节点的百分比定位(0-1)
   */
  position: number[];
  /**
   * Absolute offsets of the anchor point(px).
   * 锚点相对于节点的绝对偏移(px)
   */
  offsets?: number[];
  /**
   * Absolute offsets of the end point(px).
   * 锚点连接点的绝对偏移(px)
   */
  linkOffsets?: number[];
  /**
   * Size of the anchor.
   * 锚点大小
   */
  size?: number;
  /**
   * Visibility of the anchor.
   * 锚点可见性
   */
  visible?: boolean;
  /**
   * Index of the anchor.
   * 锚点序列
   */
  index?: number;
  /**
   * The way to display the anchor.
   * 锚点展示方式
   */
  show?: "always" | "hover";
  /**
   * The identifier of the anchor point being snapped.
   * 锚点被吸附标识
   */
  magnet?: boolean;
  /**
   * Customize the anchor styles.
   * 自定义锚点样式
   */
  setStyles?: (nodeData: any) => Record<string, unknown>;
  /**
   * Click handler of the anchor.
   * 锚点点击回调
   */
  onClick?: (e: ShapeEvent, nodeData: any) => void;
  /**
   * Mouse enter handler of the anchor.
   * 鼠标移入锚点回调
   */
  onMouseEnter?: (e: ShapeEvent, nodeData: any) => void;
  /**
   * Mouse leave handler of the anchor.
   * 鼠标移出锚点回调
   */
  onMouseLeave?: (e: ShapeEvent, nodeData: any) => void;
};

export type NodeImageConfigs = ImageConfigs;

export type TitleConfigs = {
  text: string;
  fillStyle?: string;
  strokeStyle?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderColor?: string;

  textAlign?: string;
  fontWeight?: number;
  fontSize?: number;
  fontFamily?: string;
  lineHeight?: number;
} & BaseConfigs;

export type LoopConfigs = {
  dist: number;
  position: "top" | "left" | "bottom" | "right";
  clockWise: boolean;
};

export type GroupTitleConfigs = {
  /**
   * The label content and styles of the group title.
   * 分组标题文本样式
   */
  text: {
    text: string;
    [key: string]: any;
  };
  /**
   * The styles of the group title background.
   * 分组标题背景矩形样式
   */
  background?: {
    fillStyle?: string;
    strokeStyle?: string;
  };
  /**
   * The style of the icon in the upper right corner of the group title.
   * 分组标题右上角图标样式
   */
  icon?: {
    /**
     * Configure the icon.
     * 配置图标
     */
    icon: string;
    /**
     * Color of the icon.
     * 配置图标颜色
     */
    fillStyle?: string;
    /**
     * Size of the icon.
     * 配置图标尺寸
     */
    size?: number;
    /**
     * Cursor style of the icon.
     * 配置光标样式
     */
    cursor?: string;
    /**
     * Font family of the icon.
     * 图标字体，默认`iconfont`
     */
    fontFamily?: string;
    /**
     * Click handler of the icon.
     * 点击图标回调
     */
    onClick?: (e: any, group: Group) => void;
  };
};
