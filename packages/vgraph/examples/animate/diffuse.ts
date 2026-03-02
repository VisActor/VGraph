import { Graph, Node } from "../../src";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const btn = document.createElement("button");
  btn.textContent = "开始动画";
  div.append(btn);

  // 初始化 graph 实例
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: false,
    setDefaultNode(node) {
      return {
        // color: '#3073F2',
        radius: 4,
      };
    }, // 定制节点样式
    setNodeStateStyles(state) {
      if (state === "active") {
        return {
          opacity: 1.0,
        };
      }
      return { opacity: 0.2 };
    },
  });

  const node = graph.add("node", {
    type: "rect",
    x: 200,
    y: 100,
    width: 140,
    height: 40,
    label: "节点扩散动画",
  });

  const node2 = graph.add("node", {
    type: "circle",
    x: 400,
    y: 100,
    r: 15,
  });

  btn.onclick = () => {
    graph.animate({
      type: "diffuse",
      target: node as Node,
      common: {
        duration: 1000,
        repeat: true,
      },
      // custom: {
      //   // strokeStyle: null,
      //   // opacity: 0.3,
      //   fillStyle: '#1677ff',
      // },
    });
    graph.animate({
      type: "diffuse",
      target: node2 as Node,
      common: {
        duration: 1000,
        repeat: true,
      },
      custom: {
        // strokeStyle: null,
        // opacity: 0.3,
        // size: [40, 40],
        fillStyle: "#F50",
      },
    });
  };
})();
