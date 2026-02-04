import { GraphBase } from '../graph';
import { BehaviorConfigs } from '../typings/graph';
export class BehaviorManager {
  graph: GraphBase;
  behaviors: BehaviorConfigs[] = [];
  constructor(graph: GraphBase) {
    this.graph = graph;
  }

  enable(name: string) {
    const behavior = this.get(name);
    if (!behavior) {
      return;
    }
    this.bind(behavior);
  }

  disable(name: string) {
    this.remove(name, false);
  }

  add(behavior: BehaviorConfigs, options?: unknown) {
    const clonedBehavior = Object.assign(Object.create(Object.getPrototypeOf(behavior)), behavior);
    this.behaviors.push(clonedBehavior);
    clonedBehavior.graph = this.graph;
    if (options) {
      Object.assign(clonedBehavior, options);
    }
    this.bind(clonedBehavior);
    if (clonedBehavior.init) {
      clonedBehavior.init(this.graph);
    }
  }

  remove(behavior: BehaviorConfigs | string, remove = true) {
    let name: string;
    let index = -1;
    if (typeof behavior === 'string') {
      name = behavior;
    } else {
      name = behavior.type;
    }
    if (name) {
      index = this.behaviors.findIndex((b: BehaviorConfigs) => b.type === name);
    }
    if (index === -1) {
      return;
    }
    const behave = this.behaviors[index];
    this.unbind(behave);
    remove && this.behaviors.splice(index, 1);
    if (behave.destroy) {
      behave.destroy(this.graph);
    }
  }
  get(type: string) {
    return this.behaviors.find((b: BehaviorConfigs) => b.type === type);
  }
  bind(behave: BehaviorConfigs) {
    if (behave.getEvents) {
      const events = behave.getEvents();
      const graph = this.graph;
      behave._events = {};
      Object.keys(events).forEach((e: string) => {
        behave._events[e] = behave[events[e]].bind(behave);
        graph.on(e, behave._events[e]);
      });
    }
    if (behave.getGlobalEvents) {
      const globalEvents = behave.getGlobalEvents();
      behave._globalEvents = {};
      Object.keys(globalEvents).forEach((e: string) => {
        behave._globalEvents[e] = (ev: MouseEvent) => {
          behave[globalEvents[e]].call(behave, ev);
        };
        document.body.addEventListener(e, behave._globalEvents[e]);
      });
    }
  }
  unbind(behave: BehaviorConfigs) {
    const graph = this.graph;
    if (behave._events) {
      const events = behave._events;
      Object.keys(events).forEach((e: string) => {
        graph.off(e, behave._events[e]);
      });
    }
    if (behave._globalEvents) {
      Object.keys(behave._globalEvents).forEach((e: string) => {
        document.body.removeEventListener(e, behave._globalEvents[e]);
      });
    }
  }
  destroy() {
    this.behaviors.forEach((behave: BehaviorConfigs) => {
      this.unbind(behave);
    });
    this.behaviors = [];
  }
}
