import { entityToViewport } from './viewport';
import { GraphEvent } from '../../typings/event';
import { Graph, TreeGraph } from '../../graph';
import { GRAPH_EVENTS } from '../../consts/meta_events';

export type ITriggerOptions = {
  target: 'node' | 'edge' | 'group';
  onVisibleChange: (visible: boolean, evt?: GraphEvent, entityBBox?: {
    left: number;
    top: number;
    width: number;
    height: number;
  }) => void;

  trigger?: 'hover' | 'click' | 'contextMenu';
  triggerId?: string;
  hideDelay?: number;
  showDelay?: number;
  popupContainer?: string | HTMLDivElement;
};

export class Trigger {
  graph: Graph | TreeGraph;
  options: ITriggerOptions;
  events: any = {};
  timer: any = 0;
  showTimer: any = 0;
  curTarget: any = null;
  curShape: any = null;
  domEvent: any;
  lastTriggered = false;

  constructor(graph: Graph | TreeGraph, options: ITriggerOptions) {
    this.options = options;
    this.graph = graph;
    this.bindEvents();
  }

  bindEvents() {
    const { trigger, target, triggerId, popupContainer } = this.options;
    if (trigger === 'click') {
      this.bindEvent(`${target}:click`, this.onClick);
      this.bindEvent('canvas:click', this.hideClickTooltip);
    } else if (trigger === 'contextMenu') {
      this.bindEvent(`${target}:contextmenu`, this.onClick);
      this.bindEvent('canvas:click', this.hideClickTooltip);
    } else if (triggerId) {
      this.bindEvent(`${target}:mouseover`, this.onMouseOver);
    } else {
      this.bindEvent(`${target}:mouseenter`, this.onMouseEnter);
      if (popupContainer) {
        this.bindEvent(`${target}:mouseleave`, (e: GraphEvent) => {
          this.hide(false, e);
        });
      }
    }

    const hide = () => {
      this.hide(true);
    }
    this.bindEvent(GRAPH_EVENTS.TRANSFORMED, hide);
    this.bindEvent(GRAPH_EVENTS.MOVE_START, hide);
    this.bindEvent(GRAPH_EVENTS.CHANGE, hide);

    this.bindEvent('contextmenu', (e: GraphEvent) => {
      if (trigger === 'contextMenu' && this.lastTriggered) {
        this.lastTriggered = false;
        return;
      }
      this.hide(true);
    });
  }

  onClick(e: GraphEvent) {
    const evt = e.nativeEvent as MouseEvent;
    const { triggerId, popupContainer, trigger } = this.options;
    if ((trigger === 'click' && evt?.button === 2) || (trigger === 'contextMenu' && evt?.button === 1)) {
      return;
    }
    this.lastTriggered = true;
    const entity = e.target;

    let shape = null;

    // 再次点击隐藏
    if (popupContainer && this.curTarget === entity) {
      this.clickToHide();
      return;
    }

    if (triggerId) {
      shape = e.relatedTarget;
      if (!this.isTriggerShape(shape)) {
        return;
      }

      // 再次点击隐藏
      if (popupContainer && this.curShape === shape) {
        this.clickToHide();
        return;
      }
      this.curShape = shape;
    } else {
      this.curShape = null;
    }

    this.curTarget = entity;
    this.show(e);
    if (popupContainer) {
      setTimeout(() => {
        this.domEvent = (e: MouseEvent) => {
          if (e.target === this.graph.getCanvasDom()) {
            return;
          }
          this.clickToHide(e);
        };
        document.body.addEventListener('click', this.domEvent);
      }, 30);
    }
  }

  hideClickTooltip() {
    document.body.removeEventListener('click', this.domEvent);
    this.hide();
  }

  clickToHide(e?: MouseEvent) {
    const dom = this.getPopupContainer();
    if (!dom || !e) {
      this.hideClickTooltip();
      return;
    }
    if (this.includeTarget(dom, e.target)) {
      return;
    }
    this.hideClickTooltip();
  }

  isTriggerShape(shape: any) {
    const { triggerId } = this.options;
    if (shape instanceof Element) {
      // react viewer 的节点直接使用 react ui 即可
      throw new Error('Trigger is meant for canvas entities.');
    } else {
      // 根据 triggerId 显示
      if (shape?.get('triggerId') !== triggerId) {
        return false;
      }
    }
    return true;
  }

  onMouseOver(e: GraphEvent) {
    const { popupContainer, showDelay } = this.options;
    const shape = e.relatedTarget;
    if (!this.isTriggerShape(shape) || (popupContainer && shape === this.curShape)) {
      return;
    }

    this.curTarget = e.target;
    this.curShape = e.relatedTarget;
    this.clearTimeout();
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
    if (showDelay) {
      this.showTimer = setTimeout(() => {
        this.show(e);
      }, showDelay);
    } else {
      this.show(e);
    }

    if (popupContainer) {
      this.domEvent = (e: GraphEvent) => {
        this.onMouseLeave(e);
      }
      setTimeout(() => {
        const dom = this.getPopupContainer();
        if (dom) {
          dom.addEventListener('mouseenter', () => {
            this.clearTimeout();
          });
          dom.addEventListener('mouseleave', this.domEvent);
        }
      }, (showDelay || 0) + 30);
      shape?.on('mouseleave', this.domEvent);
    }
  }

  onMouseLeave(e: GraphEvent) {
    this.curShape?.off('mouseleave', this.domEvent);
    this.hide(false, e);
  }

  onMouseEnter(e: GraphEvent) {
    const { popupContainer, showDelay } = this.options;
    this.curTarget = e.target;
    this.clearTimeout();
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
    if (showDelay) {
      this.showTimer = setTimeout(() => {
        this.show(e);
      }, showDelay);
    } else {
      this.show(e);
    }
    if (popupContainer) {
      setTimeout(() => {
        const dom = this.getPopupContainer();
        if (dom) {
          dom.addEventListener('mouseenter', () => {
            this.clearTimeout();
          });
          this.domEvent = () => {
            this.hide();
          };
          dom.addEventListener('mouseleave', this.domEvent);
        }
      }, (showDelay || 0) + 30);
    }
  }

  clearTimeout() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
  }

  show(e: GraphEvent) {
    const entity = this.curTarget || e.target;
    const shape = this.curShape;
    const graph = this.graph;
    let newStyles: any;
    if (entity.type === 'edge' && !shape) {
      const point = graph.clientToViewport(e.clientX, e.clientY);
      const keyShape = entity.getKeyShape();
      const size = keyShape.get('hitWidth') || keyShape.get('lineWidth') * 3 || 3;
      newStyles = {
        left: point.x,
        top: point.y,
        width: size,
        height: size,
      };
    } else {
      newStyles = entityToViewport(graph, entity, shape);
    }
    e.target = this.curTarget;
    e.relatedTarget = this.curShape;
    this.options.onVisibleChange(true, e, newStyles);
  }

  hide(forced?: boolean, e?: GraphEvent) {
    this.clearTimeout();
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
    if (forced) {
      this.hideTooltip(e);
    } else {
      this.timer = setTimeout(() => {
        this.hideTooltip(e);
      }, this.options.hideDelay || 0);
    }

    this.curTarget = null;
    this.curShape = null;
  }

  hideTooltip(e?: GraphEvent) {
    const trigger = this.options.trigger;
    if (trigger === 'click') {
      document.body.removeEventListener('click', this.domEvent);
    } else {
      const dom = this.getPopupContainer();
      if (dom) {
        dom.removeEventListener('mouseenter', this.clearTimeout);
        dom.removeEventListener('mouseleave', this.domEvent);
      }
    }

    this.options.onVisibleChange(false, e, {
      left: -999,
      top: -999,
      width: 0,
      height: 0
    });
  }

  getPopupContainer() {
    const popupContainer = this.options.popupContainer;
    if (!popupContainer) {
      return null;
    }
    if (typeof popupContainer === 'string') {
      return document.querySelector(popupContainer);
    }
    return popupContainer;
  }

  includeTarget(dom: any, target: any) {
    const body = document.body;
    while (target !== body) {
      if (target === dom) {
        return true;
      }
      target = target.parentNode;
    }
    return false;
  }

  bindEvent(type: string, callback: any) {
    const handler = callback.bind(this);
    this.events[type] = handler;
    this.graph.on(type, handler);
  }

  unbindEvents() {
    const { graph, events } = this;
    Object.keys(events).forEach((evt: string) => {
      graph.off(evt, events[evt]);
    });
  }

  destroy() {
    this.hide(true);
    this.unbindEvents();
  }
}
