import { GraphEvent, Group } from '../../../src';
import { insertStyles, isDragDist } from '../../../src/utils';

const GRABBING_CLS = 'xgraph-grabbing';

export const dragGroup: any = {
  type: 'dragGroup',
  dragging: false,
  lastPositions: null,
  target: null,
  init() {
    insertStyles(`
    .${GRABBING_CLS} {
      cursor: move!important;
      cursor: -webkit-grabbing!important;
      cursor:grabbing!important;
    }
    `);
  },
  getEvents() {
    return {
      'group:mousedown': 'onMouseDown',
      'mousemove': 'onMouseMove',
    };
  },
  getGlobalEvents() {
    return { mouseup: 'onMouseUp' };
  },
  onMouseDown(ev: GraphEvent) {
    const target = ev.target;
    this.target = target;
    this.triggerShape = ev.relatedTarget;
    this.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
  },
  onMouseMove(ev: GraphEvent) {
    if (!this.lastPositions) {
      return;
    }
    const graph = this.graph;
    const refresh = isDragDist(this.lastPositions, ev);
    if (!this.dragging) {
      if (refresh) {
        ev.target = this.target;
        this.dragging = true;
        graph.canvas.getCanvasDom().classList.add(GRABBING_CLS);
        this.target.layer.capture = false;
      } else {
        return;
      }
    }
    if (refresh) {
      this.updatePosition(ev);
    }
  },
  updatePosition(ev: GraphEvent) {
    const { x, y } = this.lastPositions;
    const { clientX, clientY } = ev;
    const scale = this.graph.getZoomRatio();
    const offsetX = (clientX - x) / scale;
    const offsetY = (clientY - y) / scale;
    this.lastPositions = {
      x: clientX,
      y: clientY,
    };
    moveGroup(this.target, offsetX, offsetY);
    const belong = this.target.belong;
    belong?.refreshBox();
    this.graph.draw();
  },
  onMouseUp(ev: GraphEvent) {
    const target = this.target;
    const graph = this.graph;
    if (this.dragging) {
      target.layer.capture = true;
      graph.canvas.getCanvasDom().classList.remove(GRABBING_CLS);
      graph.draw();
    }
    this.target = null;
    this.relatedTarget = null;
    this.dragging = false;
    this.lastPositions = null;
  },
};

function moveGroup(group: Group, offsetX: number, offsetY: number) {
  const bbox = group.getBBox();
  const background = group.background!;
  // FIXME: Group 锚点计算逻辑是通过configs.x y 进行。正常 refreshBox会更新configs.x y。
  // 但此处为了性能考虑直接修改了bbox，因此configs.x y需要对应修改。后续改造应当统一逻辑。
  group.configs.x += offsetX;
  group.configs.y += offsetY;
  bbox.left += offsetX;
  bbox.top += offsetY;
  const { left, top } = background.configs;
  background.set({ left: left + offsetX, top: top + offsetY });
  group.titleLayer?.translate(offsetX, offsetY);
  group.children.forEach((child: any) => {
    if (child.type === 'group') {
      moveGroup(child, offsetX, offsetY);
    } else {
      child.configs.x += offsetX;
      child.configs.y += offsetY;
      child.layer.set({
        x: child.configs.x,
        y: child.configs.y,
      });
      child.edges.forEach((edge: any) => {
        edge.updatePosition();
      });
    }
  });
  group.edges.forEach((edge: any) => {
    edge.updatePosition();
  });
}
