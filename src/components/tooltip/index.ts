
import { Graph, TreeGraph } from '../../graph';
import { Shape } from '../../renderer';
import { GraphEvent } from '../../typings/event';
import { applyCss, Trigger } from '../../utils';
import { ComponentBase } from '../base';
import { Node, Edge, Group } from '../../models/entities';

export type ITooltipOptions = {
  content: (entity: Node | Edge | Group, type: 'node' | 'group' | 'edge', shape?: Shape) => string;

  offset?: number[];
  className?: string | string[];
  styles?: {
    [key: string]: unknown;
  };
  target: 'node' | 'group' | 'edge';
  trigger?: 'hover' | 'click';
  triggerId?: string;
  hideDelay?: number;
  showDelay?: number;
};

export class RawTooltip extends ComponentBase {
  graph: Graph | TreeGraph;
  container: HTMLDivElement;
  visible = false;
  lastEvent: GraphEvent | null = null;
  trigger: Trigger;

  constructor(graph: Graph | TreeGraph, options: ITooltipOptions) {
    super(graph, options);
    this.graph = graph;
    const graphContainer = graph.get('container');
    const div = document.createElement('div');
    applyCss(div, {
      ...options.styles,
      position: 'absolute',
    });
    graphContainer.appendChild(div);
    this.container = div;
    this.applyClass();
    this.trigger = this.registerTrigger();
  }

  registerTrigger() {
    const { graph, options } = this;
    return new Trigger(graph, {
      target: options.target,
      trigger: options.trigger,
      triggerId: options.triggerId,
      hideDelay: options.hideDelay,
      showDelay: options.showDelay,
      popupContainer: this.container,
      onVisibleChange: (visible: boolean, evt?: GraphEvent, styles?: Record<string, number>) => {
        this.visible = visible;
        if (visible && evt && styles) {
          this.show(evt, styles);
        } else {
          this.hide();
        }
      }
    });
  }

  applyClass() {
    const container = this.container;
    container.classList.forEach((cls: string) => {
      container.classList.remove(cls);
    });
    const { className } = this.options;
    if (className) {
      let classNames = className;
      if (typeof className === 'string') {
        classNames = [className];
      }
      (classNames as string[]).forEach((cls: string) => {
        container.classList.add(cls);
      });
    }
  }

  updateOption(key: string, value: unknown) {
    this.options[key] = value;
    switch (key) {
      case 'content':
      case 'offset':
        if (this.visible) {
          this.trigger.show(this.lastEvent!);
        }
        break;
      case 'className':
        this.applyClass();
        break;
      case 'styles':
        applyCss(this.container, {
          ...(value as Record<string, unknown>)
        });
        break;
      case 'target':
      case 'trigger':
        if (this.visible) {
          this.hide(true);
        }
        this.trigger.destroy();
        this.trigger = this.registerTrigger();
        break;
      default:
        break;
    }
  }

  show(evt: GraphEvent, bbox: Record<string, number>) {
    const entity = evt.target;
    this.lastEvent = evt;
    const newContent = this.options.content(entity, entity.type, evt.relatedTarget);
    if (!newContent) {
      this.hide();
      return;
    }
    this.visible = true;
    this.container.innerHTML = newContent;
    this.updatePosition(entity, bbox);
    applyCss(this.container, { visibility: 'visible' });
  }

  updatePosition(entity: Node | Edge | Group, entityBBox: Record<string, number>) {
    if (!this.visible) {
      return;
    }
    const graph = this.graph;
    const { width, height } = graph.getGraphSize();
    const bbox = this.container.getBoundingClientRect();
    const offset = this.options.offset;
    const { left, top } = entityBBox;
    let x = -999;
    let y = -999;
    // 连线 tooltip 跟随鼠标
    if (entity.type === 'edge') {
      x = left + entityBBox.width;
      y = top + entityBBox.height;

      if (x > width / 2) {
        x -= (bbox.width + offset[0]);
      } else {
        x += offset[0];
      }
      if (y > height / 2) {
        y -= (bbox.height + offset[1]);
      } else {
        y += offset[1];
      }
    } else {
      // 其他基于实例定位
      x = left + offset[0];
      y = top - bbox.height + offset[1];
      if (x + bbox.width > width) {
        x = left + entityBBox.width - bbox.width - offset[0];
      } else if (x < 0) {
        x = 0;
      }
      if (y + bbox.height > height) {
        y = height - bbox.height + offset[1];
      } else if (y < 0) {
        y = top + entityBBox.height - offset[1];
      }
    }
    applyCss(this.container, { left: `${x}px`, top: `${y}px` });
  }

  hide(force?: boolean) {
    applyCss(this.container, {
      left: '-999px',
      top: '-999px',
      visibility: 'hidden',
    });
    this.visible = false;
  }

  isVisible() {
    return this.visible;
  }

  getDefaultOptions() {
    return {
      offset: [0, -4],
      target: 'node',
      trigger: 'hover',
    }
  }

  beforeDestroy() {
    this.trigger.destroy();
    this.container.remove();
  }
}
