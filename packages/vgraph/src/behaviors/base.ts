import { GraphBase } from "../graph";

export const BehaviorBase: any = {
  type: "behaviorBase",
  configs: {},
  graph: null,
  events: {},
  getEvents() {
    return {};
  },
  init(graph: GraphBase, configs?: unknown) {},
  afterInit(graph: GraphBase) {
    return;
  },
  bindEvents(events: Record<string, string>, graph: GraphBase) {
    Object.keys(events).forEach((eventName: string) => {
      if (!this[events[eventName]]) {
        return;
      }
      this[events[eventName]] = this[events[eventName]].bind(this);
      graph.on(eventName, this[events[eventName]]);
    });
  },
  beforeDestroy(graph: GraphBase) {
    return;
  },
  destroy(graph: GraphBase) {
    this.beforeDestroy(graph);
    this.unbindEvents(graph);
  },
  unbindEvents(graph: GraphBase) {
    const events = this.events;
    Object.keys(events).forEach((eventName: string) => {
      graph.off(eventName, this[events[eventName]]);
    });
  },
  get(k: string) {
    return this.configs[k];
  },
};
