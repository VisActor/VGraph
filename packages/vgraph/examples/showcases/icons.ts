import { Graph, RawTooltip } from "../../src";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
  });

  graph.add("node", {
    x: 100,
    y: 100,
    width: 140,
    height: 40,
    type: "rect",
    fillStyle: "l(90) 0:#707792 1:#9097A8",
    strokeStyle: null,
    label: {
      text: "根节点",
      fillStyle: "#fff",
    },
    icons: [
      {
        show: "hover",
        position: [1, 0.5],
        setStyles() {
          return {
            fillStyle: "#9097A8",
            size: 12,
            cursor: "pointer",
            icon: "&#xe613;",
          };
        },
        setBgStyles() {
          return {
            type: "circle",
            size: 14,
          };
        },
      },
    ],
  });

  graph.add("node", {
    type: "title",
    x: 300,
    y: 100,
    width: 176,
    height: 84,
    strokeStyle: "#E1E4E8",
    radius: 4,
    title: {
      text: "Task name",
      fillStyle: "rgba(20, 20, 20, 0.9)",
      height: 30,
      backgroundColor: "#E0E9FF",
    },
    label: {
      text: "开始时间：2020-10-10 00:00:00\n结束时间：2020-10-10 12:00:00",
      color: "rgba(20, 20, 20, 0.45)",
      fontSize: 10,
      lineHeight: 15,
    },
    icons: [
      {
        show: "always",
        position: [1, 0],
        offset: [-12, 14],
        setStyles() {
          return {
            fillStyle: "#0A4ED1",
            icon: "&#xe8b8;",
            cursor: "pointer",
            triggerId: "triggerLabel",
          };
        },
      },
    ],
  });

  graph.add("node", {
    x: 440,
    y: 100,
    width: 40,
    height: 40,
    type: "icon",
    radius: 20,
    label: "彩色图标节点",
    icon: {
      size: 24,
      icon: "&#xeef6;",
    },
    // fontFamily: 'iconfont2',
  });

  graph.add("node", {
    type: "tag",
    color: "#3073F2",
    width: 140,
    height: 40,
    x: 100,
    y: 200,
    label: "描边风格节点",
    icon: "&#xe601;",
    theme: "outlined",
  });

  graph.add("node", {
    type: "tag",
    color: "#3073F2",
    width: 140,
    height: 40,
    x: 270,
    y: 200,
    label: "填充风格反色节点",
    icon: "&#xe601;",
    theme: "filled",
  });

  graph.add("node", {
    type: "tag",
    color: "#3073F2",
    width: 140,
    height: 40,
    x: 440,
    y: 200,
    label: "默认样式节点",
    icon: "&#xe601;",
    theme: "lighted",
  });

  graph.add("node", {
    type: "capsule",
    color: "#3073F2",
    width: 140,
    height: 40,
    x: 100,
    y: 300,
    label: "描边风格节点",
    icon: "&#xe601;",
    theme: "outlined",
  });

  graph.add("node", {
    type: "capsule",
    color: "#3073F2",
    width: 140,
    height: 40,
    x: 270,
    y: 300,
    label: "填充风格反色节点",
    icon: "&#xe601;",
    theme: "filled",
  });

  graph.add("node", {
    type: "capsule",
    color: "#3073F2",
    width: 140,
    height: 40,
    x: 440,
    y: 300,
    label: "默认样式节点",
    icon: "&#xe601;",
    theme: "lighted",
  });

  graph.add("node", {
    x: 100,
    y: 400,
    width: 40,
    height: 40,
    type: "icon",
    color: "#3073F2",
    theme: "outlined",
    icon: "&#xe601;",
  });

  graph.add("node", {
    x: 270,
    y: 400,
    width: 40,
    height: 40,
    type: "icon",
    color: "#3073F2",
    theme: "filled",
    icon: "&#xe601;",
  });

  graph.add("node", {
    x: 440,
    y: 400,
    width: 40,
    height: 40,
    type: "icon",
    color: "#3073F2",
    theme: "lighted",
    icon: "&#xe601;",
  });

  graph.on("node:click", (e) => {
    console.log(e.target.getLabel());
  });

  new RawTooltip(graph, {
    styles: {
      border: "1px solid #ccc",
      padding: "8px",
      borderRadius: "4px",
      backgroundColor: "#fff",
    },
    content(entity: any, type: string) {
      return "节点设置";
    },
    target: "node",
    trigger: "hover",
    triggerId: "trigger",
  });

  document.fonts.ready.then(() => {
    graph.draw();
  });
})();
