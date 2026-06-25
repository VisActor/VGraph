import { Node } from "../models/entities";
import { Shape } from "../renderer";

/**
 * Hide the details and highlight the key information when the graph is zoomed out to a certain ratio.
 * 在图缩小时至一定比例时隐藏细节突出关键信息
 */
export const hideDetails: any = {
  type: "hideDetails",
  hideRatio: 0.2,
  hideState: null,
  getEvents() {
    return {
      transformed: "afterTransform",
    };
  },
  afterTransform(ev: { type: string; ratio: number }) {
    if (ev.type === "scale") {
      const threshold = this.hideRatio;
      const matrix = this.graph.getMatrix();
      if (matrix[0] / ev.ratio > threshold && matrix[0] < threshold) {
        this.hideShapes();
      }
      if (matrix[0] / ev.ratio < threshold && matrix[0] > threshold) {
        this.showShapes();
      }
    }
  },

  hideShapes() {
    const graph = this.graph;
    const nodes = graph.getNodes();
    const state = this.hideState;
    const autoDraw = graph.disableAutoDraw();
    nodes.forEach((node: Node) => {
      if (state) {
        node.setState(state);
      }
      node.layer.children.forEach((child: Shape) => {
        if (!child.get("_keyShape")) {
          child.hide();
        }
      });
    });
    graph.enableAutoDraw(autoDraw);
  },

  showShapes() {
    const graph = this.graph;
    const nodes = graph.getNodes();
    const state = this.hideState;
    const autoDraw = graph.disableAutoDraw();
    nodes.forEach((node: Node) => {
      if (state) {
        node.removeState(state);
      }
      node.layer.children.forEach((child: Shape) => {
        if (!child.get("_keyShape")) {
          child.show();
        }
      });
    });
    graph.enableAutoDraw(autoDraw);
  },
};
