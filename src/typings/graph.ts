import { Shape } from './renderer';
import { Node, Edge, Group } from '../models/entities';
import { LayoutBase } from '../layouts/base';
import { DAGLayoutOptions } from './layouts/dag';
import { ForceDirectedLayoutOptions } from './layouts/force';
import { PipelineLayoutOptions } from './layouts/pipeline';
import { NestedDAGOptions } from './layouts/nested_dag';
import { EdgeConfigs, NodeConfigs, GroupConfigs } from './model';
import { MindMapConfigs, DendrogramConfigs, IndentedConfigs, CompactBoxConfigs } from './layouts/tree';

export type GraphConfigs = {
  /**
   * Graph container, which can be a DOM element or the corresponding id of this DOM.
   * 图容器，可以是 DOM 节点，也可以是 DOM 对应的 id
   */
  container: string | HTMLDivElement;
  /**
   * Width of the graph.
   * 图的宽度
   */
  width: number;
  /**
   * Height of the graph.
   * 图的高度
   */
  height: number;
  /**
   * Enable automatic redrawing.
   * 是否开启自动重绘
   */
  autoDraw?: boolean;
  /**
   * Enable automatic redrawing.
   * 连线是否直接连接到节点中心
   */
  linkCenter?: boolean;
  /**
   * Padding at the edge of the viewport.
   * 视窗边缘留白
   */
  padding?: number | number[];
  /**
   * Minimum zoom ratio.
   * 缩放的最小比例
   */
  minRatio?: number;
  /**
   * Maximum zoom ratio.
   * 缩放的最大比例
   */
  maxRatio?: number;
  /**
   * The configuration of animation.
   * 动画配置
   */
  animate?:
    | boolean
    | {
        onFrame?: (ratio: number) => void;
        duration?: number;
        repeat?: boolean | number;
        easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
        delay?: number;
        onFinish?: () => void;
      };
  /**
   * Whether to use canvas to render nodes and group titles.
   * 是否使用 canvas 渲染节点和分组
   */
  renderMode?: 'canvas' | 'dom';
  /**
   * Whether to automatically refresh the layout when the data changes.
   * 是否在数据发生变更时自动刷新布局
   */
  autoLayout?: boolean;
  /**
   * The layout configurations or layout method instance.
   * 指定布局种类和配置项，或直接传入布局实例
   */
  layout?:
    | {
        /**
         * Directed acyclic graph layout.
         * 有向图布局算法
         */
        type: 'dag';
        options?: Partial<DAGLayoutOptions>;
      }
    | {
        /**
         * Force directed layout.
         * 力导向布局算法
         */
        type: 'force';
        options?: ForceDirectedLayoutOptions;
      }
    | {
        /**
         * Compact box tree layout.
         * 紧凑树布局算法
         */
        type: 'compactBox';
        options?: CompactBoxConfigs;
      }
    | {
        /**
         * Dendrogram tree layout.
         * 平衡树布局算法
         */
        type: 'dendrogram';
        options?: DendrogramConfigs;
      }
    | {
        /**
         * Mind map tree layout.
         * 思维导图树布局算法
         */
        type: 'mindMap';
        options?: MindMapConfigs;
      }
    | {
        /**
         * Indented tree layout.
         * 缩进树布局算法
         */
        type: 'indented';
        options?: IndentedConfigs;
      }
    | {
        /**
         * Pipeline layout.
         * 流水线布局算法
         */
        type: 'pipeline';
        options?: PipelineLayoutOptions;
      }
    | {
        /**
         * Nested grouping directed acyclic graph layout.
         * 嵌套分组有向图布局算法
         */
        type: 'nestedDag';
        options?: NestedDAGOptions;
      }
    | LayoutBase;
  /**
   * Whether to scale the graph to fit the viewport before perform animation.
   * 是否先将图形缩放到适合视窗大小后再进行动画。
   */
  fitViewAfterLayout?: boolean;
  /**
   * Whether to throw errors directly.
   * 是否直接抛出异常
   */
  throwError?: boolean;
  /**
   * Method for transforming and adding data to nodes. The returned data will be merged into the original data of the nodes.
   * 节点的数据转换和添加配置方法，返回的数据会合并到节点原始数据里
   */
  setDefaultNode?: (nodeData: any) => NodeConfigs;
  /**
   * Set the styles of the key shape of a node in a specified state.
   * 设置节点关键图形在指定状态下的样式
   */
  setNodeStateStyles?: (state: string, nodeData: any, node: Node) => Record<string, unknown> | undefined;
  /**
   * Method for transforming and adding data to edges. The returned data will be merged into the original data of the edges.
   * 连线的数据转换和添加配置方法，返回的数据会合并到连线原始数据里
   */
  setDefaultEdge?: (edgeData: any) => EdgeConfigs;
  /**
   * Set the styles of the key shape of a edge in a specified state.
   * 设置连线关键图形在指定状态下的样式
   */
  setEdgeStateStyles?: (state: string, edgeData: any, edge: Edge) => Record<string, unknown> | undefined;
  /**
   * Method for transforming and adding data to groups. The returned data will be merged into the original data of the groups.
   * 分组的数据转换和添加配置方法，返回的数据会合并到分组原始数据里
   */
  setDefaultGroup?: (groupData: any) => GroupConfigs;
  /**
   * Set the styles of the key shape of a group in a specified state.
   * 设置分组关键图形在指定状态下的样式
   */
  setGroupStateStyles?: (state: string, groupData: any, group: Group) => Record<string, unknown> | undefined;
};

export type BehaviorConfigs = {
  type: string;
  getEvents: () => Record<string, string>;
  [key: string]: any;
};

export type AnimateConfigs = {
  /**
   * The target entity that the animation applied to.
   * 动画作用的图中元素
   */
  target?: Node | Edge;
  /**
   * The type of animation.
   * 动画类型
   */
  type?: string;
  /**
   * Customized animation configurations, often related to animation type.
   * 动画个性化配置，往往与类型相关
   */
  custom?: {
    x?: number;
    y?: number;
    r?: number;
    size?: number[];
    color?: string;
    opacity?: number;
    [k: string]: any;
  };
  /**
   * General animation configurations.
   * 动画通用配置
   */
  common?: {
    /**
     * The duration of animation.
     * 动画时长
     */
    duration?: number;
    /**
     * The target shape that the animation applied to.
     * 动画作用的图形
     */
    target?: Shape;
    /**
     * Specify id of the animation.
     * 指定动画 id
     */
    id?: string;
    /**
     * Configurations involved in the animation.
     * 参与动画的属性
     */
    configs?: Record<string, any>;
    /**
     * A function called each frame.
     * 每帧的回调函数
     */
    onFrame?: (ratio: number) => any;
    /**
     * Whether the animation repeats.
     * 动画是否重复
     */
    repeat?: boolean | number;
    /**
     * Easing function of the animation.
     * 动画的缓动函数
     */
    easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
    /**
     * Delay execution time of the animation.
     * 动画延迟执行时间
     */
    delay?: number;
    /**
     * A function called after the animation is finished.
     * 动画执行结束回调
     */
    onFinish?: () => void;
  };
};

export type DownloadImageOptions = {
  /**
   * File name.
   * 导出文件名
   */
  name?: string;
  /**
   * Maximum width of the image.
   * 图片最大宽度
   */
  maxWidth?: number;
  /**
   * Maximum height of the image.
   * 图片最大高度
   */
  maxHeight?: number;
  /**
   * Maximum wait milliseconds for loading images.
   * 等待图片加载的最大时长
   */
  maxWaitTime?: number;
  /**
   * Callback of finishing export.
   * 图片加载完成事件
   */
  onDownloadFinish?: (failImageUrls?: string[]) => void;
  /**
   * Add background color to the image, transparent by default.
   * 给图片添加背景色，默认透明
   */
  backgroundColor?: string;
  /**
   * Add paddings of the image.
   * 图片出血边尺寸，按上右下左分配
   */
  padding?: number[];
  /**
   * Add extra scale ratio.
   * 添加缩放比
   */
  scale?: number;
};
