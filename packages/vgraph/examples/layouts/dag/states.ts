import {
  Graph,
  panZoom,
  dragCanvas,
  DAGLayout,
  CategoryLegend,
} from "../../../src";
import data from "../../static/job.json";

const colors: any = {
  未就绪: "#7152E8",
  等待执行: "#EE8B24",
  执行中: "#2367EA",
  成功: "#07A35A",
  失败: "#D94147",
  终止: "#5470A5",
};
const icons: any = {
  未就绪: "&#xe60e;",
  等待执行: "&#xe60c;",
  执行中: "&#xe60a;",
  成功: "&#xe6b9;",
  失败: "&#xe60b;",
  终止: "&#xe614;",
};

(() => {
  const div = document.createElement("div");
  div.style.position = "relative";
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  div.style.height = "600px";
  document.body.append(div);

  const nodeLegend = document.createElement("div");
  nodeLegend.style.position = "absolute";
  nodeLegend.style.right = "100px";
  nodeLegend.style.bottom = "0px";
  nodeLegend.style.display = "inline-block";
  nodeLegend.style.border = "1px solid #666";
  document.body.appendChild(nodeLegend);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    linkCenter: false,
    setDefaultNode(node: any) {
      return {
        type: "tag",
        width: 120,
        height: 40,
        color: colors[node.status],
        label: node.name,
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
          // 指定 triggerId, Tooltip 会根据此字段匹配和定位
          triggerId: "triggerIcon",
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
  // 写入数据
  graph.data(data);
  new DAGLayout({ graph });
  graph.refresh();
  graph.fitView();
  // 添加交互
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);

  document.fonts.ready.then(() => {
    graph.draw();
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

  new CategoryLegend(graph, {
    legendData,
    container: nodeLegend,
    responsive: true,
    encodeAttr: "status",
    target: "node",
    width: 100,
    height: 200,
    hover: {
      enable: true,
      legendActiveState: "hover",
      graphActiveState: "hover",
    },
    click: {
      enable: true,
      multiple: true,
      filter: true,
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

  graph.getEdges().forEach((edge: any) => {
    const keyShape = edge.getKeyShape();
    keyShape.set({
      lineDash: [2, 2],
      lineDashOffset: 0,
      strokeStyle: "#2E62F1",
      lineWidth: 2,
    });
    graph.animate({
      target: edge,
      common: {
        configs: {
          lineDashOffset: -9,
        },
        duration: 500,
        repeat: true,
      },
    });
  });
})();
