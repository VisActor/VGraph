
import { Graph } from '../../graph';
import { Canvas, Layer, Rect, Text, Path } from '../../renderer';
import { normalizePadding, applyCss } from '../../utils';
import { ComponentBase } from '../base';

import { getLabelConfigs, matrixMultiply } from './utils';
import { ContinuousLegendOptions } from './type';

export class ContinuousLegend extends ComponentBase {
  filterValue: any = [];
  valueDiffer = 0;
  encodeType: 'color' | 'size' = 'color';
  container: any;
  canvas: any;
  graphTarget: any;
  titleHeight = 0;

  constructor(graph: Graph, options: ContinuousLegendOptions) {
    super(graph, options);
    const { target } = this.options;
    // 获取主图中需要变化的元素
    if (target === 'group') {
      this.graphTarget = this.graph.getGroups();
    } else if (target === 'edge') {
      this.graphTarget = this.graph.getEdges();
    } else {
      this.graphTarget = this.graph.getNodes();
    }

    this.options.padding = normalizePadding(this.options.padding);
    this.init();
  }

  getEvents() {
    return { change: 'update' };
  }

  mergeOptions(options: any) {
    const defaultOptions = this.getDefaultOptions();
    const newOptions = Object.assign({}, defaultOptions, options);
    Object.keys(defaultOptions).forEach((attr: string) => {
      if (typeof defaultOptions[attr] === 'object') {
        newOptions[attr] = Object.assign({}, defaultOptions[attr], options[attr]);
      }
    });
    this.options = newOptions;
  }

  getDefaultOptions() {
    return {
      target: 'node',
      scale: {
        type: 'linear',
        domain: null,
      },
      orient: 'horizontal',
      padding: 10,
      maxLabelWidth: 100,
      track: {
        fillStyle: '#eee',
      },
      rail: {
        length: 80,
        size: 12,
      },
      slide: {
        enable: false,
        filter: true,
        graphActiveState: '',
        graphBlurState: '',
      },
      labelStyles: {
        fontSize: 10,
        fillStyle: '#666',
        spacing: 8,
      },
    };
  }

  init() {
    const graph = this.graph;
    const { container, width, height, slide } = this.options;
    let parent = container;
    if (typeof container === 'string') {
      parent = document.getElementById(container);
    }
    if (!parent) {
      parent = graph.get('container');
    }
    this.container = parent;
    const canvas = new Canvas({
      container: parent,
      width,
      height,
      pixelRatio: graph.getCanvas().get('pixelRatio'),
    });
    applyCss(canvas.get('container'), {
      width: width + 'px',
      height: height + 'px',
      overflow: 'hidden',
    });
    this.canvas = canvas;
    const layer = new Layer({ id: 'legendLayer' });
    const titleLayer = new Layer({ id: 'titleLayer' });
    const nodeLayer = new Layer({ id: 'nodeLayer' });

    layer.add(nodeLayer);
    layer.add(titleLayer);
    canvas.add(layer);

    this.render();
    if (slide.enable) {
      this.bindCanvasEvents();
    }
    canvas.draw();
  }

  render() {
    this.processData();
    const canvas = this.canvas;
    const titleLayer = canvas.children[0].children[1];
    const nodeLayer = canvas.children[0].children[0];

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
      const titileBgWidth = titleBgBBox.width;
      const titleBgHeight = titleBgBBox.height;
      const textConfigs = getLabelConfigs(titleConfigs.text);
      const titleAttr: any = {
        x: titileBgWidth / 2,
        y: titleBgHeight / 2,
        ...textConfigs,
        textBaseline: 'middle',
        textAlign: 'center',
      };
      const titleText = new Text(titleAttr);

      const titleTextBBox = titleText.getBBox();
      titleLayer.add(titleText);
      titleHeight = Math.max(titleBgBBox.height, titleTextBBox.height);
    }
    this.titleHeight = titleHeight;

    // legend 图例元素
    const { track, rail, label, width, height, orient, color, labelStyles } = this.options;

    let railWidth;
    let railHeight;
    const minLabelConfigs = getLabelConfigs(label.min);
    const maxLabelConfigs = getLabelConfigs(label.max);
    const spacing = labelStyles.spacing;
    let minLabel;
    let maxLabel;
    if (orient === 'vertical') {
      railWidth = rail.size;
      railHeight = rail.length;
      minLabel = this.drawLabel(0, railHeight / 2 + spacing, 'center', 'top', minLabelConfigs);
      maxLabel = this.drawLabel(0, -railHeight / 2 - spacing, 'center', 'bottom', maxLabelConfigs);
    } else {
      railWidth = rail.length;
      railHeight = rail.size;
      minLabel = this.drawLabel(-railWidth / 2 - spacing, 0, 'end', 'middle', minLabelConfigs);
      maxLabel = this.drawLabel(railWidth / 2 + spacing, 0, 'start', 'middle', maxLabelConfigs);
    }
    nodeLayer.add(minLabel);
    nodeLayer.add(maxLabel);

    // track
    const trackShape = this.drawRectShape(railWidth, railHeight, track);
    // rail
    const railShape = this.drawRectShape(railWidth, railHeight, rail);

    nodeLayer.add(trackShape);
    nodeLayer.add(railShape);
    // 根据映射设置颜色
    if (this.encodeType === 'color') {
      if (orient === 'vertical') {
        railShape.set('fillStyle', `l(270) 0:${color.min} 1:${color.max}`);
      } else {
        railShape.set('fillStyle', `l(0) 0:${color.min} 1:${color.max}`);
      }
    } else {
      // size 映射 添加一个形状
      railShape.set('fillStyle', '#0050B3');
      const scaleShape = this.drawScalePath(railWidth, railHeight);
      nodeLayer.add(scaleShape);
    }

    // layout
    const translateX = width / 2;
    const translateY = (height + titleHeight) / 2;
    nodeLayer.translate(translateX, translateY);
  }

  update() {
    const canvas = this.canvas;
    const titleLayer = canvas.children[0].children[1];
    const nodeLayer = canvas.children[0].children[0];
    titleLayer.clear();
    nodeLayer.clear();
    const { target } = this.options;
    // 获取主图中需要变化的元素
    if (target === 'group') {
      this.graphTarget = this.graph.getGroups();
    } else if (target === 'edge') {
      this.graphTarget = this.graph.getEdges();
    } else {
      this.graphTarget = this.graph.getNodes();
    }
    this.render();
    canvas.draw();
  }

  processData() {
    let value = this.options.value;
    const { encodeAttr, color, size, label, channel } = this.options;

    let valueMax = -Infinity;
    let valueMin = Infinity;
    let mappingValueMax = null;
    let mappingValueMin = null;
    let itemMax: any = {};
    let itemMin: any = {};
    // value 不存在
    if (!value?.max || !value?.min) {
      this.graphTarget.forEach((item: any) => {
        const itemValue = item.get(encodeAttr);
        if (typeof itemValue !== 'number') {
          return;
        }

        if (itemValue > valueMax) {
          valueMax = itemValue;
          itemMax = item;
        }
        if (itemValue < valueMin) {
          valueMin = itemValue;
          itemMin = item;
        }
      });
      value = {
        max: value?.max || value?.max === 0 ? value.max : valueMax,
        min: value?.min || value?.min === 0 ? value.min : valueMin,
      };
    }
    this.options.value = value;
    this.getScaleRange();

    if (!color && !size) {
      mappingValueMax = itemMax.get(channel);
      mappingValueMin = itemMin.get(channel);
      if (typeof mappingValueMax === 'number' && typeof mappingValueMin === 'number') {
        this.encodeType = 'size';
      }

      if (this.encodeType === 'color') {
        this.options.color = {
          max: mappingValueMax,
          min: mappingValueMin,
        };
      } else {
        this.options.size = {
          max: mappingValueMax,
          min: mappingValueMin,
        };
      }
    } else if (size) {
      this.encodeType = 'size';
    }

    // label
    if (!label) {
      this.options.label = {
        max: value.max.toString(),
        min: value.min.toString(),
      };
    }
  }

  drawLabel(x: number, y: number, textAlign: string, textBaseline: string, configs: any) {
    const { labelStyles } = this.options;
    const label = new Text({
      x,
      y,
      ...labelStyles,
      ...configs,
      textAlign,
      textBaseline,
    });
    return label;
  }

  drawRectShape(width: number, height: number, configs: any) {
    const shape = new Rect({
      left: -width / 2,
      top: -height / 2,
      width,
      height,
      ...configs,
    });
    return shape;
  }

  drawScalePath(width: number, height: number) {
    const { scale, track, orient } = this.options;
    const linearPath = {
      horizontal: [['M', -width / 2, -height / 2], ['L', width / 2, -height / 2], ['L', -width / 2, height / 2], ['Z']],
      vertical: [['M', -width / 2, height / 2], ['L', -width / 2, -height / 2], ['L', width / 2, height / 2], ['Z']],
    };
    const powPath = {
      horizontal: [
        ['M', -width / 2, height / 2],
        ['A', width, height, 0, 0, 0, width / 2, -height / 2],
        ['L', -width / 2, -height / 2],
        ['Z'],
      ],
      vertical: [
        ['M', width / 2, height / 2],
        ['A', width, height, 0, 0, 0, -width / 2, -height / 2],
        ['L', -width / 2, height / 2],
        ['Z'],
      ],
    };
    const logPath = {
      horizontal: [
        ['M', -width / 2, height / 2],
        ['A', width, height, 0, 0, 1, width / 2, -height / 2],
        ['L', -width / 2, -height / 2],
        ['Z'],
      ],
      vertical: [
        ['M', width / 2, height / 2],
        ['A', width, height, 0, 0, 1, -width / 2, -height / 2],
        ['L', -width / 2, height / 2],
        ['Z'],
      ],
    };

    let path;
    const pathConfigs = {
      fillStyle: track.fillStyle,
    };
    if (scale.type === 'linear') {
      path = new Path({
        path: linearPath[orient],
        ...pathConfigs,
      });
    } else if (scale.type === 'pow') {
      path = new Path({
        path: powPath[orient],
        ...pathConfigs,
      });
    } else if (scale.type === 'log') {
      path = new Path({
        path: logPath[orient],
        ...pathConfigs,
      });
    }
    return path;
  }

  bindCanvasEvents() {
    const canvas = this.canvas;
    const { rail, orient, slide } = this.options;
    const { length } = rail;
    const [leftHandler, rightHandler, leftRect, rightRect] = this.drawHandler();

    let minLastPosition: any = null;
    let maxLastPosition: any = null;
    let minRectLength = 0;
    let maxRectLength = 0;
    let minHandler = leftHandler;
    let maxHandler = rightHandler;
    let minRect = leftRect;
    let maxRect = rightRect;

    let monitor = 'clientX';
    let rectTransform = 'width';
    let rectLocate = 'left';
    const translate = {
      clientX: 0,
      clientY: 0,
    };
    let translateMatrix = [1, 1, 1, 1, 1, 0];

    if (orient === 'vertical') {
      monitor = 'clientY';
      rectTransform = 'height';
      rectLocate = 'top';
      minHandler = rightHandler;
      maxHandler = leftHandler;
      minRect = rightRect;
      maxRect = leftRect;
      translateMatrix = [1, 1, 1, 1, 0, 1];
    }

    minHandler.on('mousedown', (e: any) => {
      minLastPosition = e[monitor];
    });
    maxHandler.on('mousedown', (e: any) => {
      maxLastPosition = e[monitor];
    });

    canvas.on('mousemove', (e: any) => {
      if (minLastPosition === null && maxLastPosition === null) {
        return;
      }
      minRectLength = minRect.getBBox()[rectTransform];
      maxRectLength = maxRect.getBBox()[rectTransform];
      // 水平布局的左边滑动条 垂直布局的上方滑动条
      if (minLastPosition !== null) {
        translate[monitor] = e[monitor] - minLastPosition;
        minLastPosition = e[monitor];
        minRectLength += translate[monitor];
        // 确保在 rail 区域内滑动
        if (minRectLength < 0) {
          minHandler.setMatrix([1, 0, 0, 1, 0, 0]);
          minRectLength = 0;
          minLastPosition = null;
        } else if (minRectLength > length) {
          minHandler.setMatrix(matrixMultiply([1, 0, 0, 1, length, length], translateMatrix));
          minRectLength = length;
          minLastPosition = null;
        } else {
          minHandler.translate(translate.clientX, translate.clientY);
        }
        minRect.set(rectTransform, minRectLength);
        // 两个滑动条重合时
        const totalLength = minRectLength + maxRectLength;
        if (totalLength >= length && translate[monitor] > 0) {
          maxRectLength = length - minRectLength;
          maxHandler.setMatrix(matrixMultiply([1, 0, 0, 1, -maxRectLength, -maxRectLength], translateMatrix));
          maxRect.set(rectTransform, maxRectLength);
          maxRect.set(rectLocate, length / 2 - maxRectLength);
        }
      }
      // 水平布局的右边滑动条 垂直布局的下方滑动条
      else {
        translate[monitor] = e[monitor] - maxLastPosition;
        maxRectLength -= translate[monitor];
        maxLastPosition = e[monitor];
        if (maxRectLength < 0) {
          maxHandler.setMatrix([1, 0, 0, 1, 0, 0]);
          maxRectLength = 0;
          maxLastPosition = null;
        } else if (maxRectLength > length) {
          maxHandler.setMatrix(matrixMultiply([1, 0, 0, 1, -length, -length], translateMatrix));
          maxRectLength = length;
          maxLastPosition = null;
        } else {
          maxHandler.translate(translate.clientX, translate.clientY);
        }
        maxRect.set(rectTransform, maxRectLength);
        maxRect.set(rectLocate, length / 2 - maxRectLength);
        const totalLength = minRectLength + maxRectLength;
        if (totalLength >= length && translate[monitor] < 0) {
          minRectLength = length - maxRectLength;
          minHandler.setMatrix(matrixMultiply([1, 0, 0, 1, minRectLength, minRectLength], translateMatrix));
          minRect.set(rectTransform, minRectLength);
        }
      }
      canvas.draw();
      if (slide.filter) {
        this.filterValue = this.scaleValue(leftRect.get(rectTransform), length - rightRect.get(rectTransform));
        this.filterGraph(slide.graphActiveState, slide.graphBlurState);
        this.refresh();
      }
    });

    canvas.on('mouseup', (e: any) => {
      minLastPosition = null;
      maxLastPosition = null;
    });
  }

  scaleValue(min: number, max: number) {
    const { value, rail, scale } = this.options;
    const length = rail.length;
    const scaleBase = scale.value;
    const valueDiffer = this.valueDiffer;
    let minValue;
    let maxValue;
    const minRatio = min / length;
    const maxRatio = max / length;

    if (scale.type === 'log') {
      minValue = minRatio * valueDiffer + Math.pow(scaleBase, value.min);
      maxValue = maxRatio * valueDiffer + Math.pow(scaleBase, value.min);
    } else if (scale.type === 'pow') {
      minValue = minRatio * valueDiffer + Math.pow(value.min, 1 / scaleBase);
      maxValue = maxRatio * valueDiffer + Math.pow(value.min, 1 / scaleBase);
    } else {
      minValue = minRatio * valueDiffer + value.min;
      maxValue = maxRatio * valueDiffer + value.min;
    }
    return [minValue, maxValue];
  }

  getScaleRange() {
    this.getDefaultScaleValue();
    const { value, scale } = this.options;
    const scaleBase = scale.value;
    this.filterValue[0] = value.min;
    this.filterValue[1] = value.max;
    if (scale.type === 'log') {
      this.valueDiffer = Math.pow(scaleBase, value.max) - Math.pow(scaleBase, value.min);
    } else if (scale.type === 'pow') {
      this.valueDiffer = Math.pow(value.max, 1 / scaleBase) - Math.pow(value.min, 1 / scaleBase);
    } else {
      this.valueDiffer = value.max - value.min;
    }
  }

  getDefaultScaleValue() {
    const { scale } = this.options;
    if (scale.type === 'log') {
      scale.value = 10;
    } else if (scale.type === 'pow') {
      scale.value = 2;
    }
  }

  filterGraph(activeState: string, blurState: string) {
    const filterValue = this.filterValue;
    const graphTarget = this.graphTarget;
    const { encodeAttr } = this.options;

    graphTarget.forEach((item: any) => {
      // 清除之前状态
      item.show();
      item.removeState(activeState);
      item.removeState(blurState);
      const value = item.get(encodeAttr);
      if (value >= filterValue[0] && value <= filterValue[1]) {
        if (activeState) {
          item.setState(activeState);
        }
      } else if (blurState) {
        item.setState(blurState);
      } else {
        item.hide();
      }
    });
  }

  drawHandler() {
    const nodeLayer = this.canvas.children[0].children[0];
    const { rail, track, orient } = this.options;
    const handlerConfigs = {
      size: 4,
      length: rail.size,
    };
    const handlerStyles = {
      fillStyle: '#ccc',
      hitWidth: 10,
    };
    // 生成 handler
    let leftHandler;
    let rightHandler;
    let leftRect;
    let rightRect;
    if (orient === 'horizontal') {
      const leftX = -(rail.length + handlerConfigs.size) / 2;
      const rightX = (rail.length + handlerConfigs.size) / 2;
      const topY = -handlerConfigs.length / 2;
      const bottomY = handlerConfigs.length / 2;
      leftHandler = new Path({
        path: [
          ['M', leftX, topY],
          ['V', bottomY],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 0, leftX + handlerConfigs.size, bottomY],
          ['V', topY],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 0, leftX, topY],
          ['Z'],
        ],
        cursor: 'ew-resize',
        ...handlerStyles,
      });
      rightHandler = new Path({
        path: [
          ['M', rightX, topY],
          ['V', bottomY],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 1, rightX - handlerConfigs.size, bottomY],
          ['V', topY],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 1, rightX, topY],
          ['Z'],
        ],
        cursor: 'ew-resize',
        ...handlerStyles,
      });
      leftRect = new Rect({
        width: 0,
        height: handlerConfigs.length,
        top: -rail.size / 2,
        left: -rail.length / 2,
        fillStyle: track.fillStyle,
      });
      rightRect = new Rect({
        width: 0,
        height: handlerConfigs.length,
        top: -rail.size / 2,
        left: rail.length / 2,
        fillStyle: track.fillStyle,
      });
    } else {
      const leftX = -handlerConfigs.length / 2;
      const rightX = handlerConfigs.length / 2;
      const topY = -(rail.length + handlerConfigs.size) / 2;
      const bottomY = (rail.length + handlerConfigs.size) / 2;
      leftHandler = new Path({
        path: [
          ['M', leftX, bottomY],
          ['H', rightX],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 0, rightX, bottomY - handlerConfigs.size],
          ['H', leftX],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 0, leftX, bottomY],
          ['Z'],
        ],
        cursor: 'ns-resize',
        ...handlerStyles,
      });
      rightHandler = new Path({
        path: [
          ['M', leftX, topY],
          ['H', rightX],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 1, rightX, topY + handlerConfigs.size],
          ['H', leftX],
          ['A', handlerConfigs.size / 2, handlerConfigs.size / 2, 0, 0, 1, leftX, topY],
          ['Z'],
        ],
        cursor: 'ns-resize',
        ...handlerStyles,
      });
      leftRect = new Rect({
        width: handlerConfigs.length,
        height: 0,
        top: rail.length / 2,
        left: -rail.size / 2,
        fillStyle: track.fillStyle,
      });
      rightRect = new Rect({
        width: handlerConfigs.length,
        height: 0,
        top: -rail.length / 2,
        left: -rail.size / 2,
        fillStyle: track.fillStyle,
      });
    }
    nodeLayer.add(leftRect);
    nodeLayer.add(rightRect);
    nodeLayer.add(leftHandler);
    nodeLayer.add(rightHandler);
    return [leftHandler, rightHandler, leftRect, rightRect];
  }

  updateOption(k: string, v: any): void {
    const defaultOptions = this.getDefaultOptions();
    if (typeof defaultOptions[k] === 'object') {
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
    const { slide } = this.options;
    if (slide.filter) {
      this.filterValue = [-Infinity, Infinity];
      this.filterGraph(slide.graphActiveState, slide.graphBlurState);
      this.refresh();
    }
  }

  beforeDestroy() {
    this.clear();
    this.canvas.destroy();
  }
}
