import { GRAPH_EVENTS } from '../../consts/meta_events';
import { Graph, TreeGraph } from '../../graph';
import { throttle } from '../../utils';
import { ComponentBase } from '../base';

export type BackgroundOptions = {
  /**
   * Background display style.
   * 网格样式类型，默认 `grid`
   */
  type: 'grid' | 'dot';
  /**
   * The size of one grid.
   * 一格网格的大小
   */
  step?: number;
  /**
   * The background color.
   * 背景颜色
   */
  backgroundColor?: string;
  /**
   * The opacity of the background.
   * 背景透明度
   */
  opacity?: number;
  /**
   * The stroke color of the grid or the fill color of the dot.
   * 网格线条色或圆点填充色
   */
  color?: string;
  /**
   * Customize background by passing a image url.
   * 用于自定义背景样式的图片
   */
  imgUrl?: string;
};

export class Background extends ComponentBase {
  container: HTMLDivElement;
  debounceUpdate: () => void;
  constructor(graph: Graph | TreeGraph, options?: BackgroundOptions) {
    super(graph, options);
    this.container = this.initContainer();
    this.changeSize();
    this.update();
    this.debounceUpdate = throttle(this.update.bind(this), 16);
  }

  getEvents() {
    return {
      [GRAPH_EVENTS.TRANSFORMED]: 'transformed',
      [GRAPH_EVENTS.CHANGE_SIZE]: 'changeSize',
    };
  }

  update() {
    const zoom = this.graph.getZoomRatio();
    const { step, type, imgUrl, opacity, color} = this.options;
    const gridOpacity = opacity ?? 1;
    const dotOpacity = opacity ?? 0.3;
    const gridStrokeColor = color ?? '#D0D0D0';
    const dotFillColor = color ?? '#1B1F23';
    const first = zoom * step;
    const total = first * 4;
    let imgString;
    if (imgUrl) {
      this.container.style.backgroundImage = imgUrl;
      this.refreshPosition();
      return;
    }
    if (type === 'grid') {
      const second = first * 2;
      const third = first * 3;
      imgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}">
        <defs>
          <pattern id="grid" width="${total}" height="${total}" patternUnits="userSpaceOnUse">
            <path d="M 0 ${first} L ${total} ${first} M ${first} 0 L ${first} ${total} M 0 ${second} L ${total} ${second} M ${second} 0 L ${second} ${total} M 0 ${third} L ${total} ${third} M ${third} 0 L ${third} ${total}" stroke="${gridStrokeColor}" opacity="${0.2 * gridOpacity}" fill="none" stroke-width="${0.1 * first}"/>
            <path d="M ${total} 0 L 0 0 0 ${total}" stroke="${gridStrokeColor}" fill="none" stroke-width="${0.1 * first} " opacity="${gridOpacity}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
    `;
    } else {
      imgString = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${total}" height="${total}">
        <defs>
          <pattern id="dot" patternUnits="userSpaceOnUse" x="0" y="0" width="${first}" height="${first}">
          <rect width="${0.1 * first}" height="${0.1 * first}" rx="${0.1 * first}" ry="${0.1 * first}" fill="${dotFillColor}" opacity="${dotOpacity}"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot)"/>
      </svg>
    `;
    }
    this.container.style.backgroundImage = `url("data:image/svg+xml;base64,${btoa(imgString)}")`;
    this.refreshPosition();
  }

  initContainer() {
    const parent = this.graph.get('container');
    const div = document.createElement('div');
    parent.style.zIndex = '1';
    div.style.position = 'absolute';
    div.style.zIndex = '-1';
    div.style.backgroundColor = this.options.backgroundColor;
    div.classList.add('xgraph-background');
    parent.prepend(div);
    return div;
  }

  transformed(e: { type: string }) {
    if (!this._enable) {
      return;
    }
    if (e.type === 'scale') {
      this.debounceUpdate();
    } else {
      this.refreshPosition();
    }
  }

  refreshPosition() {
    const { graph, container } = this;
    const point = graph.canvasToViewport(0, 0);
    container.style.backgroundPosition = `${point.x - 1}px ${point.y - 1}px`;
  }

  changeSize() {
    const { width, height } = this.graph.getGraphSize();
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
  }

  enable() {
    this._enable = true;
    this.container.style.display = 'block';
  }
  disable() {
    this._enable = false;
    this.container.style.display = 'none';
  }

  getDefaultOptions() {
    const grid = this.graph.get('_grid');
    const step = grid?.getStep() || 10;
    return {
      type: 'grid',
      step,
      backgroundColor: '#FFF',
    }
  }

  beforeDestroy() {
    this.container.remove();
  }
}
