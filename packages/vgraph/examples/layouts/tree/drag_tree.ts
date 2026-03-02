import {
  TreeGraph,
  dragCanvas,
  panZoom,
  attachableDragNode,
  Node,
  GraphEvent,
  Rect,
  Indented as Layout,
} from "../../../src";
import data from "../../static/tree_data.json";
const expandIcon = "&#xe628;";
const collapseIcon = "&#xe734;";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const groups = [
    ["Bagging", "Boosting"],
    [
      "Different modeling methods",
      "Different training sets",
      "Different feature sets",
    ],
    ["Consensus", "Regression"],
  ];

  const PADDING = [12, 8, 12, 8];

  const layout = new Layout({
    direction: "LR",
    alignTop: true,
    nodeSep() {
      return 15;
    },
    nodeSize(nodeData: any) {
      return [140, 20];
    },
    rankSep() {
      return 40;
    },
  });

  const graph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    layout,
    setDefaultNode(node: any) {
      let icons = null as any;
      if (node.children) {
        icons = [
          {
            setStyles(data: any) {
              const styles: any = {
                fillStyle: "red",
                cursor: "pointer",
              };
              if (data.collapsed) {
                styles.icon = expandIcon;
              } else {
                styles.icon = collapseIcon;
              }
              return styles;
            },
            position: [1, 0.5],
            offset: [6, 0],
            show: "hover",
            onClick(e: any, nodeData: any) {
              const n = graph.getNodeById(nodeData.id);
              const icon = e.target;
              icon.set("icon", n.get("collapsed") ? collapseIcon : expandIcon);
              graph.toggleCollapse(n);
              updateRects();
            },
          },
        ];
      }
      return {
        width: 140,
        height: 20,
        strokeStyle: "green",
        id: node.id,
        label: node.id,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        icons,
      };
    },
    setNodeStateStyles() {
      return { strokeStyle: "#f50" };
    },
    setDefaultEdge() {
      return {
        type: "hCubic",
      };
    },
  });

  (window as any)._graph = graph;

  graph.data(data);
  const rects: Rect[] = [];
  // initRects();
  function initRects() {
    const container = graph.getGroupContainer();
    groups.forEach((item) => {
      const rect = new Rect({
        fillStyle: "#C6D8FF",
        strokeStyle: "#2367EA",
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        radius: 4,
        children: item,
      });
      container.add(rect);
      rect.on("click", (e) => {
        console.log(e);
      });
      rects.push(rect);
    });
    updateRects();
  }
  function updateRects() {
    rects.forEach((rect) => {
      const bbox = getBBox(rect);
      bbox && rect.set(bbox);
    });
    graph.draw();
  }

  function getBBox(rect: Rect) {
    const children = rect.get("children");
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    children.forEach((nodeId: string) => {
      const node = graph.getNodeById(nodeId);
      if (!node.isVisible()) {
        return;
      }
      const bbox = node.getBBox();
      const { left, top, width, height } = bbox;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);
    });
    if (minX === Infinity) {
      rect.hide();
      return null;
    }
    rect.show();
    return {
      left: minX - PADDING[3],
      top: minY - PADDING[0],
      width: maxX - minX + PADDING[1] + PADDING[3],
      height: maxY - minY + PADDING[0] + PADDING[2],
    };
  }

  graph.addBehavior(dragCanvas);
  graph.addBehavior(attachableDragNode, {
    layout,
    delegate: false,
    linkAnchor: true,
    tempEdgeStyles: {
      strokeStyle: "#2367EA",
      sourceAnchor: 1,
      targetAnchor: 0,
    },
    shouldTrigger(ev: GraphEvent) {
      // 根节点不可拖拽
      if (ev.target === graph.root) {
        return false;
      }
      return true;
    },
    onDragStart(node: Node) {
      // 隐藏被拖拽节点的子节点
      graph.setChildrenVisibility(node, false);
      //  禁止自动刷新布局以保持拖拽前的视图，可以注释对比效果
      graph.disableAutoLayout();
      // 将节点从父节点下移除但不销毁
      graph.removeChild(node, node.get("parent"), false);
      // 恢复自动刷新布局配置
      graph.set("autoLayout", true);
      graph.draw();
    },
    // shouldDrop(node: Node, parent: Node, index: number) {
    //   return false;
    // },
    findClosestNode(node: Node) {
      const { x, y, id } = node.configs;
      let min = Infinity;
      let closest: any = null;
      graph.getNodes().forEach((node: Node) => {
        const nodeX = node.get("x");
        const nodeY = node.get("y");
        if (nodeX > x || node.get("id") === id || !node.isVisible()) {
          return;
        }
        const dist = (x - nodeX) * (x - nodeX) + (y - nodeY) * (y - nodeY);
        if (dist < min) {
          min = dist;
          closest = node;
        }
      });
      return closest;
    },
    onDrop(node: Node, parent: Node) {
      const y = node.get("y");
      let index = -1;
      const childData = parent.get("children") || [];
      for (let i = 0; i < childData.length - 1; i++) {
        const node = graph.getNodeById(childData[i].id) as Node;
        if (i === 0 && y < node.get("y")) {
          index = 0;
          break;
        }
        if (
          node.get("y") <= y &&
          graph.getNodeById(childData[i + 1].id).get("y") > y
        ) {
          index = i + 1;
          break;
        }
      }
      // 显示被拖拽节点的子节点
      if (!node.get("collapsed")) {
        graph.setChildrenVisibility(node, true);
      }
      console.log(node.get("id"), parent.get("id"), index);
      // 移动节点到被吸附节点下
      graph.moveNode(node, parent, index);
    },
  });

  graph.addBehavior(panZoom, { sensitivity: 4 });

  graph.on("node:click", (e) => {
    console.log(e.target.configs);
  });
})();
