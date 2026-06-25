import { CompactBox as Layout, fastrand } from "../../../src/layouts";
import {
  TreeGraph,
  dragCanvas,
  panZoom,
  ShapeEvent,
  Shape,
  uuid,
} from "../../../src/";

const expandIcon = "&#xe613;";
const PADDING_RIGHT = 20;
const PADDING_BOTTOM = 20;

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const layout = new Layout({
    direction: "LR",
    size() {
      return [800, 600];
    },
    nodeSep() {
      return 40;
    },

    rankSep() {
      return 40;
    },
    alignPeerNodes: true,
  });

  const graph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    fitViewAfterLayout: false,
    animate: true,
    layout,
    setDefaultNode(nodeData: any) {
      const icons: any = [
        {
          setStyles(data: any) {
            return { fillStyle: "#3073FF", icon: expandIcon };
          },
          position: [1, 0.5],
          show: "hover",
          offset: [8, 0],
          onClick(e: ShapeEvent) {
            e.stopPropagation();
            addNode(nodeData);
          },
        },
      ];
      return {
        width: nodeData.width || 140,
        height: nodeData.height || 40,
        strokeStyle: "green",
        id: nodeData.id,
        label: nodeData.id,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        // anchors: [{
        //   show: 'hover',
        //   position: [0, 0.5],
        //   setStyles() {
        //     return { size: 4, fillStyle: 'green' };
        //   },
        // }, {
        //   position: [1, 0.5],
        //   setStyles() {
        //     return { size: 4, fillStyle: 'green' };
        //   },
        //   onClick(e: any, nodeData: any) {
        //     console.log(e);
        //   }
        // }],
        icons,
      };
    },
    setNodeStateStyles() {
      return { strokeStyle: "#f50" };
    },
    setDefaultEdge() {
      return {
        type: "hLine",
      };
    },
  });

  (window as any)._graph = graph;

  graph.data({
    id: "root",
  });

  graph.focus(graph.getNodeById("root"));

  graph.on("node:click", (e) => {
    if (!e.target?.get?.("parent")) {
      return;
    }
    console.log("remove");
    graph.removeChild(e.target, e.target.get("parent"));
    graph.refreshLayout();
  });
  const rand = fastrand();

  function addNode(nodeData: any) {
    const parent = graph.getNodeById(nodeData.id);
    const node = graph.addChild(
      {
        id: `${nodeData.id}-${uuid(2)}`,
        width: Math.max(80, 240 * rand()),
        height: Math.max(40, 120 * rand()),
      },
      parent
    );
    if (!node) {
      return;
    }
    graph.refreshLayout();
    const ratio = graph.getZoomRatio();
    let offsetX = 0;
    let offsetY = 0;
    const point = graph.canvasToViewport(
      node.get("x") + node.get("width") / 2,
      node.get("y") + node.get("height") / 2
    );
    if (point.x > graph.get("width") - PADDING_RIGHT) {
      offsetX = (parent.get("x") - node.get("x")) * ratio;
    }
    if (point.y > graph.get("height") - PADDING_BOTTOM) {
      offsetY = -node.get("height") * ratio;
    }
    if (offsetX || offsetY) {
      parent.layer.get("__icons").forEach((icon: Shape) => {
        icon.hide();
      });
      if (offsetX) {
        node.layer.get("__icons").forEach((icon: Shape) => {
          icon.show();
        });
      }
      let lastRatioX = 0;
      let lastRatioY = 0;
      graph.animate({
        target: node,
        common: {
          duration: 300,
          repeat: false,
          onFrame(ratio) {
            graph.translate(
              offsetX * ratio - lastRatioX,
              offsetY * ratio - lastRatioY
            );
            lastRatioX = offsetX * ratio;
            lastRatioY = offsetY * ratio;
          },
        },
      });
    }
  }

  graph.addBehavior(dragCanvas);
  graph.addBehavior(panZoom);
})();
