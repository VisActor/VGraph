import { Graph, TreeGraph } from '../graph';

export class ComponentBase {
  options: any;
  graph: Graph | TreeGraph;
  _events: { [key: string]: () => void };
  _globalEvents: { [key: string]: (ev: Event) => void };
  _enable = true;
  defaultOptions = {};
  constructor(graph: Graph | TreeGraph, options?: Record<string, unknown>) {
    this.graph = graph;
    this.mergeOptions(options);
    this._events = {};
    this._globalEvents = {};
    this.bindEvents();
  }

  bindEvents() {
    const events = this.getEvents();
    Object.keys(events).forEach((eventType: string) => {
      this.bindEvent(eventType, this[events[eventType]]);
    });
    const globalEvents = this.getGlobalEvents();
    Object.keys(globalEvents).forEach((e: string) => {
      this._globalEvents[e] = (ev: Event) => {
        this[globalEvents[e]].call(this, ev);
      };
      document.body.addEventListener(e, this._globalEvents[e]);
    });
    this.graph.addComponent(this);
  }

  bindEvent(type: string, callback: () => void) {
    if (!callback) {
      return;
    }
    const handler = callback.bind(this);
    this._events[type] = handler;
    this.graph.on(type, handler);
  }

  enable() {
    this._enable = true;
    this.refresh();
  }

  disable() {
    this._enable = false;
  }

  refresh() { }

  getEvents() {
    return {};
  }

  getGlobalEvents() {
    return {};
  }

  getDefaultOptions() {
    return {};
  }

  mergeOptions(options: any) {
    const defaultOptions = this.getDefaultOptions();
    this.options = Object.assign(defaultOptions, options);
  }

  updateOption(k: string, v: unknown) {
    if (this.options) {
      this.options[k] = v;
    }
    this.refresh();
  }

  beforeDestroy() {
    return;
  }

  destroy() {
    this.beforeDestroy();
    const graph = this.graph;
    const events = this._events;
    const globalEvents = this._globalEvents;
    Object.keys(events).forEach((eventType: string) => {
      graph.off(eventType, events[eventType]);
    });
    Object.keys(globalEvents).forEach((e: string) => {
      document.body.removeEventListener(e, globalEvents[e]);
    });
    this._events = {};
    this.options = null;
  }
}