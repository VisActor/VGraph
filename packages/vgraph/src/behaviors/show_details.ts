import { GraphEvent } from "../typings/event";
import { Node, Edge } from "../models/entities";

/**
 * View graph structure by default, show the details of entities only when zooming in.
 * 默认状态看图结构，仅在放大时展示图中元素的细节
 */
export const showDetails: any = {
  type: "showDetails",
  showRatio: 1,
  showLabel: false,
  showNodeState: null,
  showEdgeState: null,
  targets: ["node"],
  getEvents() {
    return {
      transformed: "afterTransform",
    };
  },
  afterTransform(ev: GraphEvent) {
    if (ev.type === "scale") {
      const threshold = this.showRatio;
      const matrix = this.graph.getMatrix();
      if (this.showLabel && matrix[0] < threshold) {
        this.showLabel = false;
        this.hideLabels();
        return;
      }
      if (matrix[0] >= threshold && !this.showLabel) {
        this.showLabel = true;
        this.showLabels();
        return;
      }
    }
  },
  showLabels() {
    let state = this.showNodeState;
    const autoDraw = this.graph.get("autoDraw");
    this.graph.set("autoDraw", false);
    if (this.targets.includes("node")) {
      this.graph.getNodes().forEach((node: Node) => {
        if (state) {
          node.setState(state);
        }
        const label = node.getLabel();
        if (label) {
          // 避免与节点 blur 等状态的样式冲突
          if (!label.visible) {
            label.show();
          }
          label.set({
            originSize: label.get("fontSize"),
            fontSize: label.get("fontSize") * 0.5,
          });
        }
      });
    }
    state = this.showEdgeState;
    if (this.targets.includes("edge")) {
      this.graph.getEdges().forEach((edge: Edge) => {
        if (state) {
          edge.setState(state);
        }
        const label = edge.getLabel();
        if (label) {
          if (!label.visible) {
            label.show();
          }
          label.set({
            originSize: label.get("fontSize"),
            fontSize: label.get("fontSize") * 0.5,
          });
        }
      });
    }

    this.graph.set("autoDraw", autoDraw);
    this.graph.draw();
  },
  hideLabels() {
    let state = this.showNodeState;
    const autoDraw = this.graph.get("autoDraw");
    this.graph.set("autoDraw", false);
    if (this.targets.includes("node")) {
      this.graph.getNodes().forEach((node: Node) => {
        if (state) {
          node.removeState(state);
        }
        const label = node.getLabel();
        // label.set({ opacity: 0 });
        label.hide();
        // 避免因数据更新等导致 fontSize 缺失
        if (label?.get("originSize")) {
          label.set({ fontSize: label.get("originSize") });
        }
      });
    }
    state = this.showEdgeState;
    if (this.targets.includes("edge")) {
      this.graph.getEdges().forEach((edge: Edge) => {
        if (state) {
          edge.removeState(state);
        }
        const label = edge.getLabel();
        // label.set({ opacity: 0 });
        label.hide();
        if (label?.get("originSize")) {
          label.set({ fontSize: label.get("originSize") });
        }
      });
    }
    this.graph.set("autoDraw", autoDraw);
    this.graph.draw();
  },

  updateLabels() {
    if (this.targets.includes("node")) {
      this.graph.getNodes().forEach((node: Node) => {
        const label = node.getLabel();
        if (label) {
          label.set({
            fontSize: label.get("originSize") * 0.5,
          });
        }
      });
    }
    if (this.targets.includes("edge")) {
      this.graph.getEdges().forEach((edge: Edge) => {
        const label = edge.getLabel();
        if (label) {
          label.set({
            fontSize: label.get("originSize") * 0.5,
          });
        }
      });
    }
    this.graph.draw();
  },
};
