import { TreeGraph, panZoom, dragCanvas, fastrand } from "../../../src";
import { CompactBox } from "../../../src/layouts/tree";
// import {  } from '../../../src/layouts/utils';

const expandIcon = "&#xe613;";
const collapseIcon = "&#xe611;";
const nodeColors = [
  "#707792",
  "#A1A7B5",
  "#03A86D",
  "#F2AF02",
  "#475466",
  "#F54E59",
  "#2E62F1",
];

// 设置思维导图布局
const layout = new CompactBox({
  direction: "LR",
  nodeSize(node: any) {
    return [node.width ?? 138, node.height ?? 40];
  },
  nodeSep() {
    return 20;
  },
  rankSep() {
    return 50;
  },
  alignParent: "mid",
});

const div = document.createElement("div");
div.style.border = "1px solid #666";
div.style.width = "800px";
div.style.height = "600px";
document.body.append(div);

const width = div.offsetWidth;
const height = div.offsetHeight;

// 初始化 graph 实例
const graph = new TreeGraph({
  container: div,
  width,
  height,
  minRatio: 0.01,
  maxRatio: 8,
  animate: true,
  layout,
  setDefaultNode(nodeData) {
    const depth = nodeData.id.split("-");
    const nodeConfigs: any = {
      width: nodeData.width ?? 138,
      height: nodeData.height ?? 40,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      label: {
        text: nodeData.name,
        fillStyle: depth.length <= 2 ? "#fff" : "rgba(20, 20, 20, 0.9)",
        fontSize: 12,
        textAlign: depth.length === 1 ? "center" : "left",
        textBaseline: "middle",
      },
    };

    let icon = null as string | null;
    if (depth.length > 1) {
      nodeConfigs.color = nodeColors[depth[1]];
    }

    if (depth.length === 1) {
      nodeConfigs.fillStyle = "l(180) 0:#8490AE 1:#8792B8";
      nodeConfigs.strokeStyle = null;
    } else if (depth.length === 2) {
      icon = "&#xe62a;";
      nodeConfigs.type = "tag";
      nodeConfigs.theme = "filled";
    } else if (depth.length === 3) {
      nodeConfigs.type = "tag";
      if (depth[2] === "1") {
        icon = "&#xe640;";
      } else if (depth[2] === "2") {
        icon = "&#xe632;";
      } else {
        icon = "&#xe61c;";
      }
    }

    if (nodeData.children) {
      nodeConfigs.icons = [
        {
          setStyles(data: any) {
            const styles: any = {
              fillStyle: nodeConfigs.color || "#707792",
              size: 12,
              cursor: "pointer",
            };
            if (data.collapsed) {
              styles.icon = expandIcon;
            } else {
              styles.icon = collapseIcon;
            }
            return styles;
          },
          setBgStyles() {
            return {
              type: "circle",
              size: 14,
            };
          },
          show: "hover",
          position: nodeData.position === "left" ? [0, 0.5] : [1, 0.5],
          size: 16,
          onClick(e: any, data: any) {
            const n = graph.getNodeById(data.id);
            const collapsed = n.get("collapsed");
            const label = n.getLabel();
            label.set(
              "text",
              collapsed
                ? n.get("name")
                : `${n.get("name")}(${n.get("children").length})`
            );
            const icon = e.target;
            icon.set("icon", collapsed ? collapseIcon : expandIcon);
            graph.toggleCollapse(n);
          },
        },
      ];
    }
    if (icon) {
      nodeConfigs.icon = {
        icon,
        size: 24,
        background: {
          width: 32,
        },
      };
    }
    return nodeConfigs;
  },
  setNodeStateStyles(state) {
    if (state === "active") {
      return {
        shadowColor: "rgba(27, 31, 35, 0.12)",
        shadowBlur: 10,
        shadowOffsetY: 4,
      };
    }
  },
  setDefaultEdge() {
    return {
      // type: 'hLine',
      type: "line",
      strokeStyle: "#D1D5DA",
    };
  },
  setEdgeStateStyles(state, edgeConfigs, edge) {
    edge.toFront();
    const node = edge.target;
    if (state === "active") {
      return {
        lineWidth: 2,
        strokeStyle: node.get("color"),
      };
    }
  },
});

const rand = fastrand();
rand.setSeed(123);

fetch(
  "https://cdn-tos-cn.bytedance.net/obj/maat/img/cWl1eWlsaW4uZWxhaW5l/file_186bfc55a2354.json"
)
  .then((response) => response.json())
  .then((data) => {
    // 写入数据
    // const nodes = data.nodes;
    graph.data(data);
    const nodes = graph.getNodes();
    for (const node of nodes) {
      node.set(
        "width",
        Math.max(100, node.get("width") + (rand() - 0.5) * 500)
      );
      node.set(
        "height",
        Math.max(30, node.get("height") + (rand() - 0.5) * 200)
      );
    }
    graph.data(data);
  });

// 添加交互
graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
