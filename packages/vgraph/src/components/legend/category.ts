import { Graph } from "../../graph";
import {
  Canvas,
  Layer,
  Circle,
  Rect,
  Text,
  Path,
  Quadratic,
  Cubic,
  NodeLayer,
  Icon,
  Image,
} from "../../renderer";
import { normalizePadding, applyCss } from "../../utils";
import { ComponentBase } from "../base";
import { getLabelConfigs } from "./utils";
import { Entity } from "../../models/entities";
import {
  CategoryLegendDataItem,
  CategoryLegendItemStyles,
  CategoryLegendOptions,
} from "./type";
import { GRAPH_EVENTS } from "../../consts/meta_events";

const MARKER_GAP = 4;
const DEFAULT_ARROW = "#505968";
const DISABLED_ARROW = "#CACDD3";

const PAGINATION = {
  width: 56,
  height: 12,
  textStyles: {},
};

const HOVER = {
  enable: false,
  legendActiveState: "hover",
  filter: false,
  graphActiveState: "active",
  graphBlurState: "blur",
};

const CLICK = {
  enable: false,
  multiple: false,
  legendActiveState: "click",
  filter: true,
  graphActiveState: "",
  graphBlurState: "",
};

export class CategoryLegend extends ComponentBase {
  legendData: any = [];
  container: any;
  canvas: any;
  graphTarget: any;
  legendItems: any;
  clickActiveItem: any = null;
  titleHeight = 0;
  paginationConfigs: any = {
    curPage: 0,
    distance: [],
    order: [],
    count: 0,
  };
  activeItem: any = null;

  constructor(graph: Graph, options: CategoryLegendOptions) {
    super(graph, options);
    const { target } = this.options;
    // 获取主图中需要变化的元素
    if (target === "group") {
      this.graphTarget = this.graph.getGroups();
    } else if (target === "edge") {
      this.graphTarget = this.graph.getEdges();
    } else {
      this.graphTarget = this.graph.getNodes();
    }

    this.options.padding = normalizePadding(this.options.padding);
    this.init();
    document.fonts?.ready.then(() => {
      this.canvas.draw();
    });
  }
  getEvents() {
    if (!this.options.legendData) {
      return {
        change: "onUpdateData",
      };
    }
    // 自定义 legendData 则不监听 updateData
    return {};
  }

  onUpdateData(ev: any) {
    if (ev?.type !== "translate") {
      this.update();
    }
  }

  mergeOptions(options: any) {
    const defaultOptions = this.getDefaultOptions();
    const newOptions = Object.assign({}, defaultOptions, options);
    Object.keys(defaultOptions).forEach((attr: string) => {
      if (typeof defaultOptions[attr] === "object") {
        newOptions[attr] = Object.assign(
          {},
          defaultOptions[attr],
          options[attr]
        );
      }
    });
    this.options = newOptions;
  }

  getDefaultOptions() {
    return {
      target: "node",
      orient: "vertical",
      vSep: 8,
      hSep: 8,
      vWidth: 0,
      hHeight: 0,
      padding: 10,
      maxLabelWidth: 100,
      pagination: PAGINATION,
      hover: HOVER,
      click: CLICK,
      responsive: false,
    };
  }

  init() {
    const graph = this.graph;
    const { container, width, height, hover, click } = this.options;
    let parent = container;
    if (typeof container === "string") {
      parent = document.getElementById(container);
    }
    if (!parent) {
      parent = graph.get("container");
    }
    this.container = parent;
    const canvas = new Canvas({
      container: parent,
      width,
      height,
      pixelRatio: graph.getCanvas().get("pixelRatio"),
    });
    applyCss(canvas.get("container"), {
      width: width + "px",
      height: height + "px",
      overflow: "hidden",
    });
    this.canvas = canvas;
    const layer = new Layer({ id: "legendLayer" });
    const titleLayer = new Layer({ id: "titleLayer" });
    const nodeLayer = new Layer({ id: "nodeLayer" });

    layer.add(nodeLayer);
    layer.add(titleLayer);
    canvas.add(layer);

    this.initShapes();
    canvas.draw();
    if (hover.enable || click.enable) {
      this.bindCanvasEvents();
    }
  }

  update() {
    const canvas = this.canvas;
    const layer = canvas.children[0];
    const titleLayer = layer.children[1];
    const nodeLayer = layer.children[0];
    // 更新前选中的 value
    const activeValues = this.clickActiveItem?.map((item: Layer) =>
      item.get("encodeValue")
    );
    titleLayer.clear();
    nodeLayer.clear();
    if (layer.children[2]) {
      layer.remove(layer.children[2]);
    }
    if (!this.options.legendData) {
      this.legendData = [];
    }
    const { target } = this.options;
    this.options.hSep = 8;
    this.options.vSep = 8;
    // 获取主图中需要变化的元素
    if (target === "group") {
      this.graphTarget = this.graph.getGroups();
    } else if (target === "edge") {
      this.graphTarget = this.graph.getEdges();
    } else {
      this.graphTarget = this.graph.getNodes();
    }
    this.initShapes();
    // 恢复更新前选中的 value
    if (activeValues?.length) {
      this.clickByValues(activeValues);
    }
    canvas.draw();
  }

  // 接口已对外开放，改动要谨慎
  clickByValues(values: (string | number)[]) {
    this.clickActiveItem = [];
    const nodeLayer = this.canvas.children[0].children[0];
    const legendActiveState = this.options.click.legendActiveState;
    nodeLayer.children.forEach((item: Layer) => {
      const value = item.get("encodeValue") as any;
      if (values.includes(value)) {
        this.setLegendItemState("click", item, legendActiveState);
        item.set("clickInteraction", true);
        this.clickActiveItem.push(item);
      }
    });
    this.filterGraph(this.clickActiveItem, "click");
  }

  initShapes() {
    this.processData();
    const canvas = this.canvas;
    const titleLayer = canvas.children[0].children[1];
    const nodeLayer = canvas.children[0].children[0];
    // legend 图例元素
    const legendData = this.legendData;
    const { orient, width, padding } = this.options;
    let maxLabelWidth = this.options.maxLabelWidth;
    if (orient === "vertical") {
      maxLabelWidth = width - padding[1] - padding[3];
    }
    let vPosition = 0;
    let hPosition = 0;
    legendData.forEach((item: any, i: number) => {
      // 添加 keyShape
      let keyShape: any;
      const keyShapeConfigs = item.marker;
      const { width, height } = keyShapeConfigs;
      switch (keyShapeConfigs.type) {
        case "circle":
          keyShape = new Circle({
            ...keyShapeConfigs,
            cx: width / 2,
            cy: 0,
            r: width / 2,
          });
          break;
        case "rect":
          keyShape = new Rect({
            ...keyShapeConfigs,
            left: 0,
            top: -height / 2,
          });
          break;
        case "line":
          keyShape = new Path({
            ...keyShapeConfigs,
            path: [
              ["M", 0, 0],
              ["L", width, 0],
            ],
          });
          break;
        case "quadratic":
          keyShape = new Quadratic({
            ...keyShapeConfigs,
            points: [
              [0, 0],
              [width / 2, height / 2],
              [width, 0],
            ],
          });
          break;
        case "cubic":
          keyShape = new Cubic({
            ...keyShapeConfigs,
            points: [
              [0, 0],
              [width / 3, -height / 2],
              [(width / 3) * 2, height / 2],
              [width, 0],
            ],
          });
          break;
        case "icon":
          keyShape = new Icon({
            x: width / 2,
            y: 0,
            size: width,
            ...keyShapeConfigs,
          });
          break;
        case "image":
          keyShape = new Image({
            left: 0,
            top: -height / 2,
            ...keyShapeConfigs,
          });
          break;
        default:
          keyShapeConfigs.type = "rect";
          keyShape = new Rect({
            ...keyShapeConfigs,
            left: 0,
            top: -height / 2,
          });
          break;
      }
      const keyShapeBBox = keyShape.getBBox();
      let subItemWidth = keyShapeBBox.width;
      let subItemHeight = keyShapeBBox.height;
      // 添加标签
      let label: any;
      if (item.label) {
        const labelConfigs = getLabelConfigs(item.label);
        const labelAttr: any = {
          x: keyShapeBBox.width + 5,
          y: 0,
          ...labelConfigs,
          textBaseline: "middle",
        };
        label = new Text(labelAttr);

        const labelBBox = label.getBBox();
        subItemWidth += labelBBox.width + MARKER_GAP; // 元素与文本之间的间隔
        subItemHeight = Math.max(subItemHeight, labelBBox.height);
        // 如果水平向布局，文本过长通过 maxLabelWidth 限制
        if (orient === "horizontal" && labelBBox.width > maxLabelWidth) {
          label.set({ width: maxLabelWidth, textOverflow: "ellipsis" });
          subItemWidth = keyShapeBBox.width + maxLabelWidth + MARKER_GAP; // 元素与文本之间的间隔
        }
        if (orient === "vertical") {
          const maxWidth = Math.min(
            maxLabelWidth - keyShapeBBox.width - MARKER_GAP,
            maxLabelWidth
          );
          if (labelBBox.width > maxWidth) {
            label.set({ width: maxWidth, textOverflow: "ellipsis" });
            subItemWidth = maxLabelWidth;
          }
        }
      }

      const subItem = new Layer({
        x: 0,
        y: 0,
        width: subItemWidth,
        height: subItemHeight,
      });
      subItem.add(keyShape);

      if (label) {
        subItem.add(label);
      }
      subItem.set("options", item);
      subItem.set("encodeValue", item.value); // 绑定筛选值
      if (orient === "vertical") {
        subItem.translate(0, hPosition + subItemHeight / 2);
        hPosition += subItemHeight;
        vPosition = Math.max(vPosition, subItemWidth);
      } else {
        subItem.translate(vPosition, 0);
        vPosition += subItemWidth;
        hPosition = Math.max(hPosition, subItemHeight);
      }
      nodeLayer.add(subItem);
    });
    this.legendItems = nodeLayer.children;

    // title render
    let titleHeight = 0;
    const titleConfigs = this.options.title;
    if (titleConfigs?.text) {
      // title background
      const titleBgConfigs = titleConfigs.background;
      const titleBg = new Rect({
        ...titleBgConfigs,
        left: 0,
        top: 0,
        width: this.options.width,
      });
      titleLayer.add(titleBg);

      // title text
      const titleBgBBox = titleBg.getBBox();
      const { width, height } = titleBgBBox;
      const textConfigs = getLabelConfigs(titleConfigs.text);
      const titleAttr: any = {
        x: width / 2,
        y: height / 2,
        ...textConfigs,
        textBaseline: "middle",
        textAlign: "center",
      };
      const titleText = new Text(titleAttr);

      const titleTextBBox = titleText.getBBox();
      titleLayer.add(titleText);
      titleHeight = Math.max(titleBgBBox.height, titleTextBBox.height);
    }
    this.titleHeight = titleHeight;
    // item 间隔调整
    this.layoutLegend(vPosition, hPosition, titleHeight);
  }

  layoutLegend(itemsWidth: number, itemsHeight: number, titleHeight: number) {
    const items = this.legendItems;
    const paginationConfigs = this.paginationConfigs;
    const intervalNumber = items.length - 1 === 0 ? 1 : items.length - 1;
    const { padding, pagination, orient, responsive } = this.options;
    let { width, height, vSep, hSep, vWidth, hHeight } = this.options;
    width = width - padding[1] - padding[3];
    height = height - titleHeight - padding[0] - padding[2];

    if (orient === "vertical") {
      vSep = 0; // 横向间隔为 0;
      vWidth = 0; // 横向平移距离
      hSep = responsive
        ? hSep
        : Math.min(
            Math.max((height - itemsHeight) / intervalNumber, itemsHeight),
            hSep
          );
      this.options.hSep = hSep;
      const allHeight = hSep * intervalNumber + itemsHeight;
      // items 高度超出 canvas 范围，设置翻页
      if (allHeight > height) {
        const totalHeight = height - pagination.height - hSep * 2;
        this.calculateSingleItems(totalHeight, items);
        this.initPagination("1/" + paginationConfigs.count, hSep);
        hSep = this.options.hSep;
        if (responsive) {
          this.canvas.changeSize(this.options.width, this.options.height);
        }
      } else if (responsive) {
        this.canvas.changeSize(
          this.options.width,
          allHeight + padding[0] + padding[2]
        );
      }
    } else {
      items.forEach((item: any, i: number) => {
        item.translate(0, itemsHeight / 2);
      });
      hSep = 0; // 纵向间隔为 0
      hHeight = (height - itemsHeight) / 2;
      vSep = responsive
        ? vSep
        : Math.max((width - itemsWidth) / intervalNumber, vSep);
      this.options.vSep = vSep;
      const allWidth = vSep * intervalNumber + itemsWidth;
      if (allWidth > width) {
        const totalWidth = width - pagination.width - vSep;
        this.calculateSingleItems(totalWidth, items);
        this.initPagination("1/" + paginationConfigs.count, vSep);
        vSep = this.options.vSep;
        if (responsive) {
          this.canvas.changeSize(this.options.width, this.options.height);
        }
      } else if (responsive) {
        this.canvas.changeSize(
          allWidth + padding[1] + padding[3],
          this.options.height
        );
      }
    }

    items.forEach((item: any, i: number) => {
      item.translate(
        padding[3] + vSep * i + vWidth,
        titleHeight + padding[0] + hSep * i + hHeight
      );
    });
  }

  processData() {
    const legendData = this.legendData;
    const sort = this.options.sort;
    if (this.options.legendData) {
      this.options.legendData.forEach((item: any) => {
        const legendItem = this.mergeItemConfigs(
          this.getDefaultItemConfigs(),
          item,
          item
        );
        this.legendData.push(legendItem);
      });
    } else {
      const { encodeAttr, encodeStyles } = this.options;
      const value: any = [];

      this.graphTarget.forEach((item: any) => {
        const itemData = item.configs;
        if (value.includes(itemData[encodeAttr])) {
          return;
        }
        value.push(itemData[encodeAttr]);
        const legendItem = this.mergeItemConfigs(
          this.getDefaultItemConfigs(),
          encodeStyles ? encodeStyles(itemData) : {},
          itemData
        );
        legendData.push(legendItem);
      });
    }
    // legendData 排序
    sort && legendData.sort(sort);
  }

  getDefaultItemConfigs() {
    const target = this.options.target;
    if (target === "edge") {
      return this.getDefaultEdgeConfigs();
    } else {
      return this.getDefaultNodeConfigs();
    }
  }

  getDefaultNodeConfigs() {
    return {
      marker: {
        width: 10,
        height: 10,
        fillStyle: "#666",
      },
      label: null,
      value: null,
    };
  }

  getDefaultEdgeConfigs() {
    return {
      marker: {
        width: 20,
        height: 10,
        strokeStyle: "#666",
        lineWidth: 3,
        hitWidth: 7,
      },
      label: null,
      value: null,
    };
  }

  mergeItemConfigs(defaultConfigs: any, customConfigs: any, rawData: any) {
    const encodeAttr = this.options.encodeAttr;
    const marker = Object.assign(
      {},
      defaultConfigs.marker,
      customConfigs.marker
    );
    const label = customConfigs.label
      ? customConfigs.label
      : rawData[encodeAttr]?.toString();
    const value =
      customConfigs.value || customConfigs.value === 0
        ? customConfigs.value
        : rawData[encodeAttr];
    return {
      marker,
      label,
      value,
    };
  }

  bindCanvasEvents() {
    const { hover, click } = this.options;
    const canvas = this.canvas;
    const nodeLayer = canvas.children[0].children[0];

    // hover 交互
    if (hover.enable) {
      nodeLayer.on("mouseover", (e: any) => {
        if (e.target.isLayer()) {
          this.onMouseEnter(e.target);
        } else {
          this.onMouseEnter(e.target.parent);
        }
      });
      nodeLayer.on("mouseout", (e: any) => {
        if (e.target.isLayer()) {
          this.onMouseLeave(e.target);
        } else {
          this.onMouseLeave(e.target.parent);
        }
      });
    }

    // click 交互
    if (click.enable) {
      nodeLayer.on("click", (e: any) => {
        if (e.target.isLayer()) {
          this.onClick(e.target);
        } else {
          this.onClick(e.target.parent);
        }
      });
      // 点击画布清除交互
      // canvas.on('click', (e: any) => {
      //   if (e.target !== canvas) { return; }
      //   items.forEach((item: any) => {
      //     item.set('clickInteraction', false);
      //     this.clearGraph('click');
      //     this.clearLegendFilter();
      //   });
      //   this.refresh();
      //   this.clickActiveItem = null;
      // });
    }
  }

  onMouseEnter(target: any) {
    this.clearLegendItemState();
    const { hover } = this.options;
    // legend 状态设置
    if (hover.legendActiveState) {
      this.setLegendItemState("hover", target, hover.legendActiveState);
    }
    // 主图状态设置
    this.filterGraph([target], "hover");
    this.refresh();
    this.activeItem = target;
  }

  onMouseLeave(target: any) {
    this.clearLegendItemState();
    this.clearGraph("hover");
    this.refresh();
  }

  onClick(target: any) {
    const { hover, click } = this.options;
    // 如果存在 hover，清除 hover state
    if (hover.enable) {
      this.clearLegendItemState();
      this.clearGraph("hover");
    }
    // 再次点击清除筛选
    if (target.get("clickInteraction")) {
      target.set("clickInteraction", false);
      this.clearLegendItemState(target);
      if (!click.multiple) {
        this.clickActiveItem = null;
        this.clearGraph("click");
      } else {
        this.clickActiveItem = this.clickActiveItem?.filter(
          (item: any) => item !== target
        );
        this.filterGraph(this.clickActiveItem, "click");
      }
      this.refresh();
      return;
    }

    // 单选时清除其他交互状态
    const clickActiveItem = this.clickActiveItem;
    if (!click.multiple) {
      if (clickActiveItem) {
        clickActiveItem.set("clickInteraction", false);
        this.clearLegendItemState(clickActiveItem);
      }
      this.clickActiveItem = [target];
    } else {
      if (clickActiveItem) {
        this.clickActiveItem.push(target);
      } else {
        this.clickActiveItem = [target];
      }
    }
    // legend 状态设置
    if (click.legendActiveState) {
      this.setLegendItemState("click", target, click.legendActiveState);
    }
    this.filterGraph(this.clickActiveItem, "click");
    target.set("clickInteraction", true);
    this.refresh();
  }

  filterGraph(filterItems: any, action: "hover" | "click") {
    const option = this.options[action];
    if (!option.enable) {
      return;
    }
    const graph = this.graph;
    graph.set("emitGraphEvents", false);
    const filteredValues = filterItems.map((item: any) =>
      item.get("encodeValue")
    );
    const encodeAttr = this.options.encodeAttr;
    const { graphActiveState, graphBlurState } = option;
    if (option.filter) {
      graph.filter(
        (entity: Entity) => !filteredValues.includes(entity.get(encodeAttr)),
        this.options.target
      );
      graph.set("emitGraphEvents", true);
      graph.emitEvent(GRAPH_EVENTS.VISIBILITY_END);
    } else if (graphActiveState || graphBlurState) {
      this.graphTarget.forEach((item: any) => {
        if (filteredValues.includes(item.get(encodeAttr))) {
          item.removeState(graphBlurState);
          item.setState(graphActiveState);
        } else {
          item.removeState(graphActiveState);
          item.setState(graphBlurState);
        }
      });
      graph.set("emitGraphEvents", true);
      graph.emitEvent(GRAPH_EVENTS.BATCH_STATE_END, {
        state: graphActiveState,
      });
    }
  }

  clearGraph(action: "hover" | "click") {
    const { filter, graphActiveState, graphBlurState } = this.options[action];
    this.graphTarget.forEach((item: any) => {
      if (filter) {
        item.show();
      }
      if (graphActiveState) {
        item.removeState(graphActiveState);
      }
      if (graphBlurState) {
        item.removeState(graphBlurState);
      }
    });
  }

  setLegendItemState(interaction: string, e: any, activeState?: string) {
    if (e.get("clickInteraction")) {
      return;
    }
    const setStyle = this.options.setLegendStateStyles;
    let activeStyle: CategoryLegendItemStyles = this.getDefaultActiveState(
      interaction,
      e.children[0].configs
    );
    if (setStyle) {
      const customActiveStyle = setStyle(activeState, e.children[0].configs);
      if (customActiveStyle) {
        activeStyle = customActiveStyle;
      }
    }
    if (activeStyle) {
      // label 样式
      if (activeStyle.textStyles && e.children.length > 1) {
        const text = e.children[1];
        if (!text.cacheStyle) {
          text.cacheStyle = this.getCacheStyle(
            text.configs,
            activeStyle.textStyles
          );
        }
        text.set(activeStyle.textStyles);
      }

      // keyShape 样式
      const keyShape = e.children[0];
      if (!keyShape.cacheStyle) {
        keyShape.cacheStyle = this.getCacheStyle(keyShape.configs, activeStyle);
      }
      keyShape.set(activeStyle);
    }
  }

  clearLegendFilter() {
    this.legendItems.forEach((item: any) => {
      if (item.get("clickInteraction")) {
        return;
      }
      const keyShape = item.children[0];
      keyShape.set(keyShape.cacheStyle);
      delete keyShape.cacheStyle;

      if (item.children.length > 1 && item.children[1].cacheStyle) {
        const text = item.children[1];
        text.set(text.cacheStyle);
        delete text.cacheStyle;
      }
    });
  }

  clearLegendItemState(item = this.activeItem) {
    if (!item || item.destroyed || item.get("clickInteraction")) {
      return;
    }
    const keyShape = item.children[0];
    const label = item.children[1];
    keyShape.set(keyShape.cacheStyle);
    delete keyShape.cacheStyle;
    if (label?.cacheStyle) {
      label.set(label.cacheStyle);
      delete label.cacheStyle;
    }
  }

  getCacheStyle(styles: any, newStyles: any) {
    const cache: { [k: string]: any } = {};
    Object.keys(newStyles).forEach((k) => {
      if (!cache.hasOwnProperty(k)) {
        cache[k] = styles[k];
      }
    });
    return cache;
  }

  getDefaultActiveState(
    interaction: string,
    legendData: any
  ): CategoryLegendItemStyles {
    if (interaction === "hover") {
      return {
        strokeStyle: legendData.fillStyle ? legendData.fillStyle : "#ccc",
        lineWidth: 3,
        textStyles: {
          opacity: 0.6,
        },
      };
    } else {
      return {
        strokeStyle: "#ccc",
        fillStyle: "#ccc",
        textStyles: {
          fillStyle: "#ccc",
        },
      };
    }
  }

  showCurrentPage(page: number) {
    const { legendItems, paginationConfigs } = this;
    const min = paginationConfigs.order[page];
    const max = paginationConfigs.order[page + 1]
      ? paginationConfigs.order[page + 1]
      : legendItems.length;
    for (let i = 0; i < legendItems.length; i++) {
      if (i >= min && i < max) {
        legendItems[i].show();
      } else {
        legendItems[i].hide();
      }
    }
  }

  initPagination(page: string, sep: number) {
    const { orient, pagination, width, height, padding } = this.options;
    const paginationConfigs = this.paginationConfigs;
    const paginationLayer = new Layer();

    const bgRect = new Rect({
      width:
        orient === "vertical" ? width : pagination.width + padding[1] + sep,
      height:
        orient === "vertical"
          ? pagination.height + padding[2] + sep
          : height - this.titleHeight,
      left:
        orient === "vertical" ? 0 : width - padding[1] - pagination.width - sep,
      top:
        orient === "vertical"
          ? height - padding[2] - pagination.height - sep
          : this.titleHeight,
      fillStyle: "white",
    });

    const paginationNodeLayer = new NodeLayer({
      width: pagination.width,
      height: pagination.height,
      x:
        orient === "vertical"
          ? width / 2
          : width - padding[1] - pagination.width / 2,
      y:
        orient === "vertical"
          ? height - padding[2] - pagination.height / 2
          : (height + this.titleHeight) / 2,
    });

    const leftArrow = new Path({
      path: [
        ["M", -pagination.width / 2 + 4, -pagination.height / 2 + 2],
        ["L", -pagination.width / 2, 0],
        ["L", -pagination.width / 2 + 4, pagination.height / 2 - 2],
      ],
      strokeStyle: "#CACDD3",
      lineWidth: 1,
      hitWidth: 10,
    });

    const pageNumber = new Text({
      x: 0,
      y: 0,
      text: page,
      textBaseline: "middle",
      textAlign: "center",
      ...pagination.textStyles,
    });

    const rightArrow = new Path({
      path: [
        ["M", pagination.width / 2 - 4, -pagination.height / 2 + 2],
        ["L", pagination.width / 2, 0],
        ["L", pagination.width / 2 - 4, pagination.height / 2 - 2],
      ],
      strokeStyle: "#505968",
      lineWidth: 1,
      hitWidth: 10,
    });

    paginationNodeLayer.add(leftArrow);
    paginationNodeLayer.add(pageNumber);
    paginationNodeLayer.add(rightArrow);
    paginationLayer.add(bgRect);
    paginationLayer.add(paginationNodeLayer);
    this.canvas.children[0].add(paginationLayer);
    this.showCurrentPage(0);

    const items = this.legendItems;
    const parent = items[0].parent;
    delete parent.matrix;
    paginationConfigs.curPage = 0;
    // 前一页
    leftArrow.on("click", () => {
      rightArrow.set("strokeStyle", DEFAULT_ARROW);
      if (paginationConfigs.curPage === 0) {
        return;
      }
      this.showCurrentPage(paginationConfigs.curPage - 1);
      orient === "vertical"
        ? parent.translate(
            0,
            paginationConfigs.distance[paginationConfigs.curPage]
          )
        : parent.translate(
            paginationConfigs.distance[paginationConfigs.curPage],
            0
          );
      paginationConfigs.curPage--;
      pageNumber.set(
        "text",
        `${paginationConfigs.curPage + 1}/${paginationConfigs.count}`
      );
      if (paginationConfigs.curPage === 0) {
        leftArrow.set("strokeStyle", DISABLED_ARROW);
      }
      this.canvas.draw();
    });

    // 后一页
    rightArrow.on("click", () => {
      leftArrow.set("strokeStyle", DEFAULT_ARROW);
      if (paginationConfigs.curPage === paginationConfigs.count - 1) {
        return;
      }
      paginationConfigs.curPage++;
      this.showCurrentPage(paginationConfigs.curPage);
      orient === "vertical"
        ? parent.translate(
            0,
            -paginationConfigs.distance[paginationConfigs.curPage]
          )
        : parent.translate(
            -paginationConfigs.distance[paginationConfigs.curPage],
            0
          );
      pageNumber.set(
        "text",
        `${paginationConfigs.curPage + 1}/${paginationConfigs.count}`
      );
      if (paginationConfigs.curPage === paginationConfigs.count - 1) {
        rightArrow.set("strokeStyle", DISABLED_ARROW);
      }
      this.canvas.draw();
    });

    // active 状态
    [leftArrow, rightArrow].forEach((arrow, i) => {
      arrow.on("mouseenter", (e) => {
        if (i === 0 && paginationConfigs.curPage === 0) {
          return;
        } else if (
          i === 1 &&
          paginationConfigs.curPage === paginationConfigs.count - 1
        ) {
          return;
        }
        arrow.set("strokeStyle", "#2D5CF6");
        this.canvas.draw();
      });
      arrow.on("mouseleave", (e) => {
        if (i === 0 && paginationConfigs.curPage === 0) {
          arrow.set("strokeStyle", "#CACDD3");
        } else if (
          i === 1 &&
          paginationConfigs.curPage === paginationConfigs.count - 1
        ) {
          arrow.set("strokeStyle", "#CACDD3");
        } else {
          arrow.set("strokeStyle", "#505968");
        }
        this.canvas.draw();
      });
    });

    // 被分页遮挡元素 hover 状态移除
    const { hover } = this.options;
    if (!hover.filter || !paginationConfigs.count) {
      return;
    }
    bgRect.on("mouseenter", () => {
      paginationConfigs.order.forEach((d: number) => {
        if (items[d].get("hoverInteraction")) {
          this.onMouseLeave(items[d]);
        }
      });
    });
  }

  calculateSingleItems(height: number, items: any[]) {
    const paginationConfigs = this.paginationConfigs;
    const { orient, vSep, hSep } = this.options;
    const order: number[] = [0];
    const distance: number[] = [0];
    let totalHeight = 0;
    const size = orient === "vertical" ? "height" : "width";
    const sep = orient === "vertical" ? hSep : vSep;

    const itemBBox0 = items[0].getBBox();
    const count = Math.floor(height / (itemBBox0[size] + sep));
    const sSep = (height - itemBBox0[size] * count) / (count - 1);
    if (orient === "vertical") {
      this.options.hSep = sSep;
    } else {
      this.options.vSep = sSep;
    }
    totalHeight += itemBBox0[size];
    totalHeight += sSep;
    for (let i = 1; i < items.length; i++) {
      const itemBBox = items[i].getBBox();
      totalHeight += itemBBox[size];
      if (totalHeight > height) {
        order.push(i);
        distance.push(totalHeight - itemBBox[size]);
        totalHeight = itemBBox[size];
      }
      totalHeight += sSep;
    }
    paginationConfigs.order = order;
    paginationConfigs.distance = distance;
    paginationConfigs.count = order.length;
  }

  updateOption(k: string, v: any): void {
    const defaultConfigs = this.getDefaultOptions();
    if (typeof defaultConfigs[k] === "object") {
      this.options[k] = { ...this.options[k], ...v };
    } else {
      this.options[k] = v;
    }
    // TODO： 涉及 legend 本身的 options 更新应该重新构建一个 legend
    // 因为涉及逻辑修改，时间紧暂不实现。
    this.update();
    this.refresh();
  }

  refresh() {
    this.canvas.draw();
    this.graph.draw();
  }

  enable() {
    this._enable = true;
    this.update();
    this.refresh();
  }

  // TODO: legend 暂无 disable 场景。之后重写时一起加上
  disable() {
    this._enable = false;
  }

  clear() {
    this.clearLegendFilter();
    this.clearGraph("hover");
    this.clearGraph("click");
    this.refresh();
  }

  beforeDestroy() {
    this.clear();
    this.canvas.destroy();
  }
}
