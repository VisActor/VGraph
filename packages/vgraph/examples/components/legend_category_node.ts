import {
  dragCanvas,
  dragNode,
  Graph,
  panZoom,
  ForceDirectedLayout,
} from "../../src";
import { CategoryLegend } from "../../src/components";
import data from "../static/miserables.json";

const colors = [
  "#4c72b0",
  "#dd8452",
  "#55a868",
  "#c44e52",
  "#8172b3",
  "#937860",
  "#da8bc3",
  "#8c8c8c",
  "#ccb974",
  "#64b5cd",
  "#17becf",
];

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);
  const legendDiv = document.createElement("div");
  legendDiv.style.position = "absolute";
  legendDiv.style.right = "10px";
  legendDiv.style.top = "10px";
  legendDiv.style.border = "1px solid #666";
  document.body.append(legendDiv);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        type: "circle",
        width: 15,
        height: 15,
        strokeStyle: null,
        fillStyle: colors[node.group % 11] || colors[0],
      };
    },
    setNodeStateStyles(state, nodeData) {
      if (state === "active") {
        return {
          strokeStyle: nodeData.fillStyle,
          opacity: 1,
        };
      }
      return { opacity: 0.2 };
    },
    setDefaultEdge() {
      return {
        strokeStyle: "#ccc",
      };
    },
  });
  graph.data(data);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  graph.on("node:click", (e: any) => {
    graph.remove(e.target);
  });
  (window as any)._graph = graph;
  new ForceDirectedLayout({
    graph,
    onTick: () => {
      graph.refresh();
    },
  });

  // // 纵向翻页
  new CategoryLegend(graph, {
    container: legendDiv,
    encodeAttr: "group",
    target: "node",
    title: {
      text: "Legend",
      background: {
        height: 20,
        fillStyle: "#eee",
      },
    },
    encodeStyles(nodeData) {
      return {
        marker: {
          type: "circle",
          fillStyle: nodeData.fillStyle,
        },
        label: "group" + nodeData.group,
      };
    },
    width: 100,
    height: 300,
    hover: {
      enable: true,
      legendActiveState: "active",
      legendBlurState: "blur",
    },
    click: {
      enable: true,
      multiple: true,
      filter: true,
    },
    setLegendStateStyles(state: string, markerData: any) {
      if (state === "active") {
        return {
          strokeStyle: markerData.fillStyle ? markerData.fillStyle : "#ccc",
          lineWidth: 3,
          textStyles: {
            fontWeight: "bolder",
          },
        };
      }
      if (state === "blur") {
        return {
          opacity: 0.3,
          textStyles: {
            opacity: 0.3,
          },
        };
      }
    },
  });

  // 横向平铺
  new CategoryLegend(graph, {
    container: legendDiv,
    encodeAttr: "group",
    target: "node",
    encodeStyles(nodeData: any) {
      return {
        marker: {
          type: "circle",
          fillStyle: nodeData.fillStyle,
        },
        label: "group" + nodeData.group,
      };
    },
    width: 800,
    height: 50,
    orient: "horizontal",
    hover: {
      enable: true,
      legendActiveState: "active",
      legendBlurState: "blur",
      filter: true,
    },
    click: {
      enable: true,
      multiple: true,
    },
    setLegendStateStyles(state: string, markerData: any) {
      if (state === "active") {
        return {
          strokeStyle: markerData.fillStyle ? markerData.fillStyle : "#ccc",
          lineWidth: 3,
          textStyles: {
            fontWeight: "bolder",
          },
        };
      }
      if (state === "blur") {
        return {
          opacity: 0.3,
          textStyles: {
            opacity: 0.3,
          },
        };
      }
    },
  });

  // 自定义数据
  const legendData: any = [
    {
      marker: {
        type: "circle",
        fillStyle: "#3073F2",
      },
      label: {
        text: "人群包",
        fontSize: 12,
      },
    },
    {
      marker: {
        type: "circle",
        fillStyle: "#07A35A",
      },
      label: {
        text: "标签",
        fontSize: 12,
      },
    },
    {
      marker: {
        type: "circle",
        fillStyle: "#FFC528",
      },
      label: {
        text: "数据源",
        fontSize: 12,
      },
    },
  ];

  new CategoryLegend(graph, {
    container: legendDiv,
    width: 300,
    height: 30,
    legendData,
    orient: "horizontal",
    target: "node",
    responsive: true,
  } as any);
})();
