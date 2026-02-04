import { Graph, Rect, Text, DAGLayout } from "../../src";

const data = {
  nodes: [
    { name: "目标确定", id: "1", groupId: "需求层" },
    { name: "数据获取", id: "2", groupId: "数据层" },
    { name: "数据清洗", id: "3", groupId: "数据层" },
    { name: "数据整理", id: "4", groupId: "数据层" },
    { name: "描述分析", id: "5", groupId: "分析层" },
    { name: "建模分析", id: "6", groupId: "分析层" },
    { name: "洞察结论", id: "7", groupId: "分析层" },
    { name: "模型测试", id: "8", groupId: "分析层" },
    { name: "迭代优化", id: "9", groupId: "分析层" },
    { name: "模型加载", id: "10", groupId: "输出层" },
    { name: "报告撰写", id: "11", groupId: "输出层" },
  ],
  edges: [
    { source: "1", target: "2" },
    { source: "2", target: "3" },
    { source: "3", target: "4" },
    { source: "4", target: "5" },
    { source: "4", target: "6" },
    { source: "5", target: "7" },
    { source: "6", target: "8" },
    { source: "7", target: "11" },
    { source: "8", target: "9" },
    { source: "9", target: "10" },
    { source: "10", target: "11" },
    { source: "需求层", target: "数据层" },
    { source: "数据层", target: "分析层" },
    { source: "分析层", target: "输出层" },
  ],
  groups: [
    { id: "需求层", children: ["1"] },
    { id: "数据层", children: ["2", "3", "4"] },
    { id: "分析层", children: ["5", "6", "7", "8", "9"] },
    { id: "输出层", children: ["10", "11"] },
  ],
};

const groups = ["需求层", "数据层", "分析层", "输出层"];

(() => {
  const div = document.createElement("div");
  div.style.position = "relative";
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  div.style.height = "600px";
  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    setDefaultNode(node) {
      return {
        label: {
          text: node.name,
          fontSize: 14,
          textBaseline: "middle",
          textAlign: "center",
          fillStyle: "rgba(20, 20, 20, 0.9)",
        },
        type: "rect",
        width: 140,
        height: 48,
        radius: 3,
        strokeStyle: "#E1E4EB",
        rank: groups.indexOf(node.groupId),
        anchors: [
          [0, 0.5],
          [0.5, 0],
          [0.5, 1],
          [1, 0.5],
        ],
      };
    },
    setNodeStateStyles(state, data, node) {
      const label = node.getLabel();
      if (state === "hover") {
        label.set("fillStyle", "#2E62F1");
        return { strokeStyle: "#2E62F1" };
      }
      if (state === "active") {
        label.set("fillStyle", "#fff");
        return {
          fillStyle: "#2E62F1",
          strokeStyle: "#2E62F1",
        };
      }
      if (state === "default") {
        label.set("fillStyle", "rgba(20, 20, 20, 0.9)");
        return {
          strokeStyle: "#E1E4EB",
          fillStyle: "#fff",
        };
      }
    },
    setDefaultEdge(edgeData) {
      const sourceId = graph.getNodeById(edgeData.source)?.get("groupId");
      const targetId = graph.getNodeById(edgeData.target)?.get("groupId");
      let type = "line";
      if (sourceId !== targetId) {
        type = "hLine";
      }
      return {
        type: type,
        lineWidth: 1,
        hitWidth: 6,
        strokeStyle: "#D1D5DA",
        endArrow: true,
      };
    },
    setEdgeStateStyles(state, edgeData, edge) {
      if (state === "hover") {
        // 避免连线重合时出现显示错误
        edge.toFront();
        return {
          strokeStyle: "#2E62F1",
        };
      }
      if (state === "active") {
        edge.toFront();
        return {
          lineWidth: 2,
          strokeStyle: "#2E62F1",
        };
      }
    },
    setDefaultGroup(data) {
      return {
        strokeStyle: "#D9D9D9",
        fillStyle: "#FAFBFC",
        radius: 12,
        linkNode: true,
        padding: 50,
        lineWidth: 0.5,
        anchors: [
          {
            position: [0, 0],
            offsets: [0, 40],
          },
          {
            position: [1, 0],
            offsets: [0, 40],
          },
        ],
        titleSize: 64,
        renderGroupTitle(group: any, layer: any, width: number) {
          const text = new Text({
            text: data.id,
            x: width / 2,
            y: 22,
            fontSize: 20,
            textBaseline: "top",
            textAlign: "center",
            fillStyle: "#7D8599",
          });

          const backRect = new Rect({
            left: 0,
            top: 0,
            width: width,
            height: 32,
            radius: [12, 12, 0, 0],
            fillStyle: "#7D8599",
          });

          const frontRect = new Rect({
            left: 0,
            top: 8,
            width: width,
            height: 56,
            radius: [12, 12, 0, 0],
            fillStyle: "#F6F8FA",
            strokeStyle: "#E1E4EB",
          });
          layer.add(backRect);
          layer.add(frontRect);
          layer.add(text);
          layer.set("frontRect", frontRect);
        },
      };
    },
    setGroupStateStyles(state, data) {
      const group = graph.getGroupById(data.id);
      const titleBg = group.titleLayer!.find(
        (shape: any) => shape.type === "rect"
      )!;
      const titleText = group.titleLayer!.find(
        (shape: any) => shape.type === "text"
      )!;
      if (state === "hover") {
        titleBg.set("fillStyle", "#475466");
        titleText.set("fillStyle", "#545454");
        return {
          fillStyle: "#fff",
        };
      } else {
        titleBg.set("fillStyle", "#7D8599");
        titleText.set("fillStyle", "#7D8599");
      }
    },
  });
  // 写入数据
  graph.data(data);
  new DAGLayout({
    graph,
    rankDir: "LR",
    nodeSep: 50,
    rankSep: 150,
    ranker: "custom",
    ignoreGroup: true,
  });
  let minY = Infinity;
  let maxY = -Infinity;
  graph.getNodes().forEach((node: any) => {
    const y = node.get("y");
    minY = Math.min(y, minY);
    maxY = Math.max(y, maxY);
  });

  graph.getGroups().forEach((group: any) => {
    group.updateData({
      fixTop: minY - 15,
      fixHeight: maxY - minY + 30,
    });
  });

  graph.refresh();
  // 适应视图大小
  graph.fitView();
  // 添加交互
  // hover group
  graph.on("group:mouseenter", (e) => {
    e.target.setState("hover");
  });

  graph.on("group:mouseleave", (e) => {
    e.target.setState("default", true);
  });

  // hover node
  graph.on("node:mouseenter", (e) => {
    e.target.setState("active");
  });

  graph.on("node:mouseleave", (e) => {
    e.target.setState("default", true);
  });

  graph.on("group:click", (e) => {
    const group = e.target;
    if (group.get("collapsed")) {
      group.expand();
    } else {
      // 为了更好的视觉效果，在动画以后将标题修成圆角
      // 可以直接使用 group.collapse() 对比一下效果
      group.collapse();
    }
  });

  //hover edge
  graph.on("edge:mouseenter", (e) => {
    e.target.setState("active");
    e.target.source.setState("hover");
    e.target.target.setState("hover");
  });

  graph.on("edge:mouseleave", (e) => {
    e.target.removeState("active");
    e.target.source.setState("default", true);
    e.target.target.setState("default", true);
  });
})();
