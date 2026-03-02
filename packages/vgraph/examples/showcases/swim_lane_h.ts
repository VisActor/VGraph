import { Graph, DAGLayout, panZoom } from "../../src";

const data = {
  nodes: [
    { id: "2.1.2" },
    { id: "2.2.0" },
    { id: "2.2.1" },
    { id: "2.2.2" },
    { id: "2.3.0" },
    { id: "2.3.1" },
    { id: "2.3.2" },
    { id: "2.4.0" },
    { id: "2.4.1" },
  ],
  edges: [
    { source: "2.1.2", target: "2.2.0" },
    { source: "2.2.0", target: "2.2.1" },
    { source: "2.2.1", target: "2.2.2" },
    { source: "2.2.2", target: "2.3.0" },
    { source: "2.3.0", target: "2.3.1" },
    { source: "2.3.1", target: "2.3.2" },
    { source: "2.3.2", target: "2.4.0" },
    { source: "2.4.0", target: "2.4.1" },
  ],
  groups: [
    { id: "2.1.x", children: ["2.1.2"] },
    { id: "2.2.x", children: ["2.2.0", "2.2.1", "2.2.2"] },
    { id: "2.3.x", children: ["2.3.0", "2.3.1", "2.3.2"] },
    { id: "2.4.x", children: ["2.4.0", "2.4.1"] },
  ],
};

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
      const index = parseInt(node.id.charAt(2), 10) - 1;
      return {
        label: {
          text: node.id,
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
        rank: index,
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
      const sourceId = graph.getNodeById(edgeData.source).get("groupId");
      const targetId = graph.getNodeById(edgeData.target).get("groupId");
      let type = "line";
      let sourceAnchor = undefined as any;
      let targetAnchor = undefined as any;
      if (sourceId !== targetId) {
        type = "vLine";
        sourceAnchor = 2;
        targetAnchor = 1;
      }
      return {
        type: type,
        lineWidth: 1,
        hitWidth: 6,
        strokeStyle: "#D1D5DA",
        endArrow: true,
        sourceAnchor,
        targetAnchor,
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
        padding: 20,
        titlePosition: "left",
        // titleSize: 82,
        title: {
          text: { text: data.id, fillStyle: "#626978" },
          background: {
            fillStyle: "#F0F3F6",
          },
          icon: {
            icon: "&#xe60f;",
            fillStyle: "#626978",
            cursor: "pointer",
            size: 16,
          },
        },
        // renderGroupTitle(group: any, layer: any, height: number) {
        //   const text = new Text({
        //     text: data.id,
        //     x: TITLE_WIDTH / 2,
        //     y: height / 2,
        //     width: TITLE_WIDTH,
        //     height,
        //     fontSize: 12,
        //     textBaseline: 'middle',
        //     textAlign: 'center',
        //     fillStyle: '#7D8599'
        //   });

        //   // const backRect = new Rect({
        //   //   left: 0,
        //   //   top: 0,
        //   //   width: 30,
        //   //   height,
        //   //   radius: [12, 0, 0, 12],
        //   //   fillStyle: '#7D8599'
        //   // });

        //   const frontRect = new Rect({
        //     left: 0,
        //     top: 0,
        //     width: TITLE_WIDTH,
        //     height,
        //     radius: [12, 0, 0, 12],
        //     fillStyle: '#F6F8FA',
        //     strokeStyle: '#E1E4EB',
        //   });
        //   // layer.add(backRect);
        //   layer.add(frontRect);
        //   layer.add(text);
        //   layer.set('rect', frontRect);
        //   layer.set('text', text);
        //   return TITLE_WIDTH;
        // }
      };
    },
    setGroupStateStyles(state, data) {
      const group = graph.getGroupById(data.id);
      const titleBg = group.titleLayer!.children[0];
      const titleText = group.titleLayer!.children[2];
      if (state === "hover") {
        titleBg.set("fillStyle", "#FFF");
        titleText.set("fillStyle", "#545454");
        return {
          fillStyle: "#fff",
        };
      } else {
        titleBg.set("fillStyle", "#3073F2");
        titleText.set("fillStyle", "#FFF");
        return {
          fillStyle: "#FAFBFC",
        };
      }
    },
  });
  // 写入数据
  graph.data(data);
  new DAGLayout({
    graph,
    rankDir: "TB",
    nodeSep: 24,
    rankSep: 64,
    ranker: "custom",
    ignoreGroup: true,
  });
  let minX = Infinity;
  let maxX = -Infinity;
  graph.getNodes().forEach((node: any) => {
    const x = node.get("x");
    minX = Math.min(x, minX);
    maxX = Math.max(x, maxX);
  });

  graph.getGroups().forEach((group: any) => {
    group.updateData({
      // minX 是最左侧节点的中心坐标，减去宽度的一半
      fixLeft: minX - 70,
      // maxX - minX 相对于整行的长度相差一个节点的宽度
      fixWidth: maxX - minX + 140,
    });
  });

  graph.refresh();
  graph.addBehavior(panZoom);
  // 适应视图大小
  graph.fitView();
  // 添加交互
  // hover group
  // graph.on('group:mouseenter', (e) => {
  //   e.target.setState('hover');
  // });

  // graph.on('group:mouseleave', (e) => {
  //   e.target.setState('default', true);
  // });

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
      // group.expand(false);
    } else {
      // 为了更好的视觉效果，在动画以后将标题修成圆角
      // 可以直接使用 group.collapse() 对比一下效果
      group.collapse();
      // group.collapse(false);
    }
  });
  console.log(graph.getGroups());

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
