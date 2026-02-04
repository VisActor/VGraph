import { TextConfigs, BaseConfigs } from '../../renderer';

/**
 * The data of a legend item.
 * 图例数据项
 */
export type CategoryLegendDataItem = {
  /**
   * The shape configurations of a legend item.
   * 图例中图形配置
   */
  marker?: {
    /**
     * The type of shape of a legend item.
     * 图例中图形的类型
     */
    type?: 'rect' | 'circle' | 'icon' | 'image' | 'line' | 'quadratic' | 'cubic';
    [key: string]: unknown;
  };
  /**
   * The label configurations of a legend item.
   * 图例中文本标签的配置
   */
  label?: string | TextConfigs;
  /**
   * The value of the legend item.
   * 图例对应值
   */
  value?: string | number;
};

/**
 * The configurations of category legend.
 * 分类型图例配置项
 */
export type CategoryLegendOptions = {
  /**
   * Customize the legend content, which is independent of the data in the graph.
   * 自定义配置图例内容，与图中数据无关
   */
  legendData?: CategoryLegendDataItem[];
  /**
   * The field in the data the legend originate from.
   * 图例来源于数据中的哪个字段
   */
  encodeAttr: string;
  /**
   * Customize the legend item styles
   * 自定义图例图形样式
   */
  encodeStyles?: (nodeData: any) => Record<string, unknown>;
  /**
   * The sort method to order the items of the legend.
   * 给图例排序
   */
  sort?: (a: CategoryLegendDataItem, b: CategoryLegendDataItem) => number;
  /**
   * The entity that the legend displays.
   * 图例展示的是图中哪个元素的数据
   */
  target: 'node' | 'edge' | 'group' | string;
  /**
   * The width of the legend.
   * 图例所占宽度
   */
  width: number;
  /**
   * The height of the legend.
   * 图例所占高度
   */
  height: number;
  /**
   * The paddings of the legend.
   * 图例边缘留白
   */
  padding?: number | number[];
  /**
   * The DOM container of the legend.
   * 图例挂载的容器
   */
  container?: string | HTMLElement;
  /**
   * The configures of legend title.
   * 图例标题配置
   */
  title?: LegendTitleConfigs;
  /**
   * The layout direction of the legend.
   * 图例布局
   */
  orient?: 'vertical' | 'horizontal';
  /**
   * The maximum width of label.
   * 图例文本标签最大宽度f
   */
  maxLabelWidth?: number;
  /**
   * whether to reduce the legend size when there are fewer items.
   * 当图例数量较少时,是否减少图例尺寸
   */
  responsive?: boolean;
  /**
   * The configures of pagination.
   * 图例翻页器配置
   */
  pagination?: {
    /**
     * The width of the pagination.
     * 图例翻页器宽度
     */
    width?: number;
    /**
     * The height of the pagination.
     * 图例翻页器高度
     */
    height?: number;
    /**
     * The styles of the texts in the pagination.
     * 图例翻页器文本样式
     */
    textStyle?: TextConfigs;
  };
  /**
   * Interaction configurations when hovering a legend item.
   * 鼠标移入图例的交互配置
   */
  hover?: {
    /**
     * Whether to respond to hovering.
     * 是否响应鼠标移入的交互
     */
    enable?: boolean;
    /**
     * The state of active legend item.
     * 图中焦点元素的状态.
     */
    legendActiveState?: string;
    /**
     * The state of inactive legend items.
     * 图中失焦元素的状态.
     */
    legendBlurState?: string;
    /**
     * Hover legend item to filter the entities in the graph.
     * 是否筛选图中符合图例的元素.
     */
    filter?: boolean;
    /**
     * The state of active entities.
     * 图中焦点元素的状态.
     */
    graphActiveState?: string;
    /**
     * The state of inactive entities.
     * 图中失焦元素的状态.
     */
    graphBlurState?: string;
  };
  click?: {
    /**
     * Whether to respond to clicking.
     * 是否响应点击的交互
     */
    enable?: boolean;
    /**
     * Whether multiple selection is allowed.
     * 是否允许多选
     */
    multiple?: boolean;
    /**
     * The state of active legend item.
     * 图中焦点元素的状态.
     */
    legendActiveState?: string;
    /**
     * The state of inactive legend items.
     * 图中失焦元素的状态.
     */
    legendBlurState?: string;
    /**
     * Hover legend item to filter the entities in the graph.
     * 是否筛选图中符合图例的元素.
     */
    filter?: boolean;
    /**
     * The state of active entities.
     * 图中焦点元素的状态.
     */
    graphActiveState?: string;
    /**
     * The state of inactive entities.
     * 图中失焦元素的状态.
     */
    graphBlurState?: string;
  };
  setLegendStateStyles?: (state: string, markerData: any) => CategoryLegendItemStyles | undefined;
};

export type LegendTitleConfigs = {
  text?: string | TextConfigs;
  background?: {
    height?: number;
    fillStyle?: string;
    strokeStyle?: string;
  };
};
export type CategoryLegendItemStyles = BaseConfigs & {
  textStyles?: Partial<TextConfigs>;
};

/**
 * The configurations of continuous legend.
 * 连续型图例配置项
 */
export type ContinuousLegendOptions = {
  /**
   * The field in the data the legend originate from.
   * 图例来源于数据中的哪个字段
   */
  encodeAttr: string;
  /**
   * The entity that the legend displays.
   * 图例展示的是图中哪个元素的数据
   */
  target: 'node' | 'edge' | 'group';
  /**
   * The graphical configure of the entity that the legend shows.
   * 图例展示的是图中元素的什么图形属性
   */
  channel?: string;
  /**
   * The maximum and minimum values of colors when using color mapping.
   * 采用颜色映射时采用颜色的最大最小值
   */
  color?: {
    min: string;
    max: string;
  };
  /**
   * the maximum and minimum values when using size mapping.
   * 采用大小映射时采用大小的最大最小值
   */
  size?: {
    min: number;
    max: number;
  };
  /**
   * The maximum and minimum values when using continuous mapping.
   * 进行连续映射时，数据维度采用的最大最小值
   */
  value?: {
    min: number;
    max: number;
  };
  /**
   * The labels of maximum and minimum values when using continuous mapping.
   * 连续映射时的最大最小文本标签
   */
  label?: {
    min: string | TextConfigs;
    max: string | TextConfigs;
  };
  /**
   * Mapping function for continuous mapping.
   * 连续映射的映射函数
   */
  scale?: {
    type?: 'linear' | 'pow' | 'log';
    value?: number;
  };
  /**
   * The width of the legend.
   * 图例所占宽度.
   */
  width: number;
  /**
   * The height of the legend.
   * 图例所占高度.
   */
  height: number;
  /**
   * The paddings of the legend.
   * 图例边缘留白.
   */
  padding?: number | number[];
  /**
   * The DOM container of the legend.
   * 图例挂载的容器.
   */
  container?: string | HTMLElement;
  /**
   * The configures of legend title.
   * 图例标题配置.
   */
  title?: LegendTitleConfigs;
  /**
   * The layout direction of the legend.
   * 图例布局.
   */
  orient?: 'vertical' | 'horizontal';
  /**
   * The background styles of the slider.
   * 滑轨背景样式.
   */
  track?: Record<string, unknown>;
  /**
   * The styles of the slider.
   * 滑轨样式设置.
   */
  rail?: {
    length?: number;
    size?: number;
    [key: string]: unknown;
  };
  /**
   * The behavior of the slider.
   * 滑轨交互配置.
   */
  slide?: {
    /**
     * Whether the behavior of the slider is enabled.
     * 滑轨交互配置.
     */
    enable?: boolean;
    /**
     * Slide the slider to filter the entities accordingly.
     * 滑动滑轨以筛选.
     */
    filter?: boolean;
    /**
     * The state of active entities.
     * 图中焦点元素的状态.
     */
    graphActiveState?: string;
    /**
     * The state of inactive entities.
     * 图中失焦元素的状态.
     */
    graphBlurState?: string;
  };
};
