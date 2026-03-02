import {
  dragCanvas,
  dragNode,
  Graph,
  panZoom,
  ForceDirectedLayout,
  FisheyePlugin,
} from "../../src";
import data from "../static/miserables.json";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const colorPastel = [
    "#a1c9f4",
    "#ffb482",
    "#8de5a1",
    "#ff9f9b",
    "#d0bbff",
    "#debb9b",
    "#fab0e4",
    "#cfcfcf",
    "#eeea92",
    "#b9f2f0",
  ];

  const setDefaultNode = (nodeData: { [k: string]: any }) => {
    return {
      type: nodeData.type || "circle",
      width: nodeData.r,
      height: nodeData.r,
      strokeStyle: "rgba(0.5,0.5,0.5,0.2)",
      fillStyle: colorPastel[nodeData.group % 10],
      label: {
        text: nodeData.id,
        width: 100,
        fontSize: 11,
        textBaseline: "middle",
        textAlign: "center",
        fillStyle: "#000",
        opacity: 0, // 默认暂时隐藏文字
      },
    };
  };
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode,
    setDefaultEdge() {
      return {
        strokeStyle: "#ccc",
      };
    },
  });

  data.nodes.forEach((node: any) => {
    node.r = Math.random() * 24 + 12;
  });
  graph.data(data);
  graph.data(data);
  // 添加交互
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  // 鱼眼放大镜组件
  const fisheye = new FisheyePlugin(graph, {});
  new ForceDirectedLayout({
    graph,
    // 这里没有定义forces，使用默认的力函数进行布局
    onTick: () => graph.refresh(),
    maxIteration: 300,
    tickIterations: 10,
    onEnd: () => graph.fitView(),
  });

  setTimeout(() => {
    fisheye.destroy();
  }, 1000);
})();
