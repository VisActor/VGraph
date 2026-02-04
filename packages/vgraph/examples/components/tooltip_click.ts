/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Graph,
  panZoom,
  hideDetails,
  RawTooltip,
  DAGLayout,
  CategoryLegend,
} from "../../src";
import data from "../static/job.json";

const colors: any = {
  未就绪: "#7152E8",
  等待执行: "#EE8B24",
  执行中: "#2367EA",
  成功: "#07A35A",
  失败: "#D94147",
  终止: "#5470A5",
};
const icons: any = {
  未就绪: "&#xe603;",
  等待执行: "&#xe60c;",
  执行中: "&#xe60a;",
  成功: "&#xe6b9;",
  失败: "&#xe60b;",
  终止: "&#xe614;",
};

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);
  data.nodes.forEach((node: any) => {
    node.width = 80;
    node.height = 20;
  });
  const g = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: "tag",
        width: 120,
        height: 40,
        color: colors[node.status],
        label: {
          text: node.name,
          triggerId: "node",
        },
        anchors: [
          [0.5, 0.0],
          [0.5, 1.0],
        ],
        icon: {
          icon: icons[node.status],
          size: 25,
          background: {
            width: 40,
          },
        },
      };
    },
    setNodeStateStyles(state) {
      if (state === "hover") {
        return {
          lineWidth: 2,
          shadowColor: "rgba(27, 31, 35, 0.12)",
          shadowBlur: 10,
          shadowOffsetY: 6,
        };
      }
    },
    setDefaultEdge() {
      return {
        type: "vLine",
        endArrow: {
          width: 3,
          height: 5,
        },
        strokeStyle: "#D1D5DA",
        appendSize: 2,
      };
    },
  });
  g.addBehavior(panZoom);
  g.data(data);
  const tooltip = new RawTooltip(g, {
    styles: {
      border: "1px solid #ccc",
      padding: "8px",
      borderRadius: "4px",
      backgroundColor: "#fff",
    },
    content(entity: any, type: string) {
      return `${entity.get("name")}: ${entity.get("id")}`;
    },
    target: "node",
    trigger: "click",
    triggerId: "node",
    hideDelay: 200,
  });
  const dag = new DAGLayout({
    graph: g,
  });
  g.refresh();
  g.fitView();
  document.fonts.ready.then(() => {
    g.draw();
  });
  const legendData: any = [];
  Object.keys(colors).forEach((value: string) => {
    legendData.push({
      marker: {
        type: "icon",
        icon: icons[value],
        fillStyle: colors[value],
      },
      label: value,
      value,
    });
  });

  const legend = new CategoryLegend(g, {
    legendData,
    container: "legendContainer",
    responsive: true,
    encodeAttr: "status",
    target: "node",
    width: 85,
    height: 200,
    hover: {
      enable: true,
      // 图例状态，对应配置在 setLegendStateStyles
      legendActiveState: "hover",
      // 图中节点状态，对应配置在 graph 的 setNodeStateStyles
      graphActiveState: "hover",
      graphBlurState: "blur",
    },
    click: {
      enable: true,
      multiple: true,
      // 点击筛选主图
      filter: true,
      // 图例状态，对应配置在 setLegendStateStyles
      legendActiveState: "click",
    },
    setLegendStateStyles(state: string, markerData: any) {
      if (state === "hover") {
        return {
          size: 13,
          textStyles: {
            fillStyle: "#1d2129",
          },
        };
      }
      if (state === "click") {
        return {
          opacity: 0.2,
          textStyles: {
            opacity: 0.2,
          },
        };
      }
    },
  });
  (window as any).graph = g;
})();
