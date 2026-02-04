import { Graph } from '../../graph';
import { Layer, Path } from '../../renderer';
import { GRAPH_EVENTS } from '../../consts/meta_events';
import { Node } from '../../models/entities';
import { ComponentBase } from '../base';

export type ISnaplineOptions = {
  step?: number;
  styles?: Record<string, unknown>;
};

const min = Math.min;
const max = Math.max;
const abs = Math.abs;

export class Snapline extends ComponentBase {
  container: Layer;
  bbox = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  idMap: Record<string, boolean> = {};

  constructor(graph: Graph, options?: ISnaplineOptions) {
    super(graph, options);
    const layer = new Layer({ id: 'xgraphSnapline' });
    layer.capture = false;
    this.container = layer;
    this._enable = true;
    graph.getContainer().add(layer);
  }

  getEvents() {
    return {
      [GRAPH_EVENTS.MOVE_START]: 'onMoveStart',
      [GRAPH_EVENTS.MOVING]: 'onMove',
      [GRAPH_EVENTS.MOVE_END]: 'onMoveEnd',
    };
  }

  onMoveStart(evt: { type: string, targets: Node[] }) {
    if (!this._enable) {
      return;
    }
    this.idMap = {};
    const bbox = {
      maxX: -Infinity,
      maxY: -Infinity,
      minX: Infinity,
      minY: Infinity
    };
    evt.targets.forEach((node: Node) => {
      this.idMap[node.get('id')] = true;
      const { left, top, width, height } = node.getBBox();
      bbox.minX = min(left, bbox.minX);
      bbox.minY = min(top, bbox.minY);
      bbox.maxX = max(left + width, bbox.maxX);
      bbox.maxY = max(top + height, bbox.maxY);
    });
    this.bbox = bbox;
  }

  onMove(evt: { type: string, targets: Node[], offsetX: number, offsetY: number }) {
    if (!this.bbox) {
      return;
    }
    const { graph, idMap } = this;
    const step = this.options.step;
    const { offsetX, offsetY } = evt;
    const result: any = {
      l: null,
      r: null,
      h: null,
      t: null,
      b: null,
      v: null
    };
    const minX = this.bbox.minX + offsetX;
    const maxX = this.bbox.maxX + offsetX;
    const minY = this.bbox.minY + offsetY;
    const maxY = this.bbox.maxY + offsetY;
    const cx = (maxX + minX) / 2;
    const cy = (maxY + minY) / 2;

    function refreshAlign(result: { min: number, max: number }, nmin: number, nmax: number, cmin: number, cmax: number) {
      if (result) {
        result.min = min(nmin, result.min, cmin);
        result.max = max(nmax, result.max, cmax);
      } else {
        result = {
          min: min(nmin, cmin),
          max: max(nmax, cmax)
        };
      }
      return result;
    }

    graph.getNodes().forEach((node: Node) => {
      if (idMap[node.get('id')]) {
        return;
      }
      const { left, top, width, height } = node.getBBox();
      const nmaxX = left + width;
      const nmaxY = top + height;
      // 垂直方向: 中 > 左 > 右
      if (abs(left + width / 2 - cx) < step) {
        result.v = refreshAlign(result.v, top, nmaxY, minY, maxY);
        result.v.x = cx;
      } else if (!result.v && (abs(left - minX) < step || abs(nmaxX - minX) < step)) {
        result.l = refreshAlign(result.l, top, nmaxY, minY, maxY);
        result.l.x = minX;
      } else if ((!result.v && !result.r) && (abs(left - maxX) < step || abs(nmaxX - maxX) < step)) {
        result.r = refreshAlign(result.r, top, nmaxY, minY, maxY);
        result.r.x = maxX;
      }
      // 水平方向: 中 > 上 > 下
      if (abs(top + height / 2 - cy) < step) {
        result.h = refreshAlign(result.h, left, nmaxX, minX, maxX);
        result.h.y = cy;
      } else if (!result.h && (abs(top - minY) < step || abs(nmaxY - minY) < step)) {
        result.t = refreshAlign(result.t, left, nmaxX, minX, maxX);
        result.t.y = minY;
      } else if ((!result.h && !result.b) && (abs(top - maxY) < step || abs(nmaxY - maxY) < step)) {
        result.b = refreshAlign(result.n, left, nmaxX, minX, maxX);
        result.b.y = maxY;
      }
    });
    this.drawLines(result);
    this.bbox = {
      minX,
      maxX,
      minY,
      maxY
    };
  }

  drawLines(result: any) {
    const container = this.container;
    container.clear();
    const styles = this.options.styles;
    for (const key of ['v', 'l', 'r']) {
      if (!result[key]) {
        continue;
      }
      const { min, max, x } = result[key];
      const path = new Path({
        ...styles,
        path: [
          ['M', x, min],
          ['L', x, max]
        ]
      });
      container.add(path);
      break;
    }

    for (const key of ['h', 't', 'b']) {
      if (!result[key]) {
        continue;
      }
      const { min, max, y } = result[key];
      const path = new Path({
        ...styles,
        path: [
          ['M', min, y],
          ['L', max, y]
        ]
      });
      container.add(path);
      break;
    }
    this.graph.draw();
  }

  onMoveEnd() {
    this.container.clear();
    this.graph.draw();
  }

  enable() {
    this._enable = true;
  }

  disable() {
    this._enable = false;
    this.container.clear();
    this.graph.draw();
  }

  getDefaultOptions() {
    return {
      styles: {
        strokeStyle: '#3073FF',
        lineWidth: 1,
      },
      step: 10,
    }
  }

  beforeDestroy() {
    this._enable = false;
    this.container.destroy();
  }
}
