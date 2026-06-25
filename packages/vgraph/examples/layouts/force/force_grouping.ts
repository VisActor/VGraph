import {
  Graph,
  panZoom,
  dragCanvas,
  highlightRelations,
  dragNode,
  ForceDirectedLayout,
  ForceLink,
  ForceManyBody,
  IntraClusterForce,
  InterClusterForce,
  ForceX,
  ForceY,
  ForceCollision,
  ForceCenter,
  Shape,
  GroupUtils,
  ForceDirectedGrouping,
} from "../../../src";
import { assignPosition, fastrand } from "../../../src/layouts";
import viscoauthorRaw from "../../static/visCoauthor.json";
import miserablesRaw from "../../static/miserables.json";

const color = [
  "#4c72b0",
  "#dd8452",
  "#25a868",
  "#c44e52",
  "#8172b3",
  "#937860",
  "#da8bc3",
  "#8c8c8c",
  "#ccb974",
  "#64b5cd",
  "#a305e5",
  "#000000",
  "#d0ff8f",
  "#cccccc",
];

const rand = fastrand();
rand.setSeed(42);
const DATA_NAME = "miserables" as "miserables" | "viscoauthor";
const initStatus = "expand" as "collapse" | "expand";
let nodeSize = 20;
let data;
if (DATA_NAME === "miserables") {
  data = JSON.parse(JSON.stringify(miserablesRaw));
} else {
  data = dealData(JSON.parse(JSON.stringify(viscoauthorRaw)));
  nodeSize = 10;
}
function mockData(data: any) {
  for (const node of data.nodes) {
    if (rand() < 0.0) {
      node._group = node.group;
      node.group = undefined;
    }
  }
}
mockData(data);

const style1 = (v: any) => {
  return {
    fillStyle: "rgba(255,255,255,0)",
    lineWidth: 4,
    strokeStyle: color[v >= 0 ? v % 13 : 12],
    opacity: 1.0,
  };
};

const style2 = (v: any) => {
  return {
    fillStyle: color[v >= 0 ? v % 13 : 12],
    //   lineWidth: 2,
    opacity: 0.2,
  };
};

let whichStyle = 0;

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  // 初始化 graph 实例
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(nodeData) {
      const group = nodeData.group_id ?? nodeData.group;
      return {
        type: "circle",
        width: nodeData.width ?? nodeSize,
        height: nodeData.height ?? nodeSize,
        strokeStyle: "#fff",
        fillStyle: color[group >= 0 ? group % 13 : 13],
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
    setDefaultEdge() {
      return {
        strokeStyle: "#ccc",
      };
    },
    setEdgeStateStyles(state) {
      if (state === "active") {
        return {
          strokeStyle: "#A7A7A7",
        };
      }
      return { opacity: 0.2 };
    },
    setDefaultGroup(groupData: any) {
      return {
        linkNode: true,
        opacity: 0,
        exactMatch: true,
      };
    },
  });

  graph.data(data);
  const fdGrouping = new ForceDirectedGrouping({
    graph,
    options: {
      shapeStyles: style1,
      extraPadding: 5,
    },
  });

  const collapsableData = GroupUtils.getCollapsableData({
    nodes: data.nodes.map((d: any) => d),
    edges: data.edges.map((d: any) => {
      return { ...d };
    }),
    groups: Object.entries(fdGrouping.getGroups()).map((v: any) => {
      const length = v[1].length;
      return {
        id: v[0],
        group_id: v[0],
        children: v[1].map((d: any) => d.id),
        width: Math.max(nodeSize, nodeSize * Math.sqrt(length)),
        height: Math.max(nodeSize, nodeSize * Math.sqrt(length)),
      };
    }),
  });
  graph.updateData(collapsableData);
  console.log({ ...collapsableData });

  for (const node of graph.getNodes()) {
    if (node.get("childNodes")) {
      if (initStatus === "expand") {
        GroupUtils.expandGroupNode(graph, node);
      }
    }
  }
  console.log(graph.getNodes().map((d: any) => d.configs));

  // 添加交互
  graph.addBehavior(highlightRelations);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);

  const x = 800 / 2;
  const y = 600 / 2;
  // 中心 x y

  const forces = {
    link: new ForceLink({ options: { distance: 0 } }), // 力导向吸引力
    manybody: new ForceManyBody({
      options: {
        strength: (node: any) => {
          if (node.children) {
            const length = node.children.length;
            return Math.min(-100 * length, -100);
          }
          return -100;
        },
      },
    }), // 力导向排斥力，整体依旧呈现力导向布局。
    attrCluster: new IntraClusterForce({ options: { strength: 0.2 } }), // 类内吸引力, 如果聚簇效果不够显著可以尝试增加该值
    repulCluster: new InterClusterForce({ options: { strength: -10 } }), // 类间排斥力，可注释掉这两行看看效果
    x: new ForceX({ options: { x, strength: 0.2 } }), // 由于类间的排斥力，可能会导致不同类相距较远，通过中心里使得节点集中在中心位置
    y: new ForceY({ options: { y, strength: 0.2 } }), //
    collision: new ForceCollision({
      options: { radius: (d: any) => d.r || d.width || 10 },
      iterationCallback: fdGrouping.groupVelocity,
    }),
    center: new ForceCenter({ options: { x, y } }),
  };

  const fdp = new ForceDirectedLayout({
    // 力导布局部分
    graph,
    forces,
    maxIteration: 300, // 总迭代次数
    tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
    onTick: () => {
      fdGrouping.updateShapes();
      graph.refresh(); // 刷新画布
    },
    onEnd: () => {
      fdGrouping.updateShapes();
      graph.refresh();
      graph.fitView(); // 居中并缩放适应画布
    },
  });

  // 双击展开
  fdGrouping.on("groupshape:dblclick", (ev: any) => {
    const shape = ev.target;
    collapse(shape, graph, fdp, fdGrouping);
  });

  // 右键groupShape进行unGroup
  const unGroupValues = {};
  fdGrouping.on("groupshape:contextmenu", (ev: any) => {
    const shape = ev.target;
    unGroupValues[shape.get("groupValue")] = true;
    fdGrouping.setGetGroupValue((nodeData) => {
      return unGroupValues[nodeData.group] ? undefined : nodeData.group;
    });
    fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
    fdGrouping.groupVelocity.reset();
    fdGrouping.groupVelocity.setThreshold(80);
    fdp.restart(1.0);
  });
  // 右键node进行reGroup
  graph.on("node:contextmenu", (ev) => {
    const node = ev.target;
    unGroupValues[node.get("group")] = undefined;
    fdGrouping.setGetGroupValue((nodeData) => {
      return unGroupValues[nodeData.group] ? undefined : nodeData.group;
    });
    fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
    fdGrouping.groupVelocity.reset();
    fdGrouping.groupVelocity.setThreshold(80);
    fdp.restart(1.0);
  });

  // groupShape 拖拽交互
  let originPos = null as any;
  fdGrouping.on("groupshape:dragstart", (ev: any) => {
    originPos = {};
    originPos.x = ev.clientX;
    originPos.y = ev.clientY;
  });
  fdGrouping.on("groupshape:drop", (ev: any) => {
    const { x, y } = { x: ev.clientX, y: ev.clientY };
    const shape = ev.target;
    const group = fdGrouping.getGroups()[shape.get("groupValue")];
    if (group && originPos) {
      const scale = graph.getZoomRatio();
      const offsetX = (x - originPos.x) / scale;
      const offsetY = (y - originPos.y) / scale;
      const nodeMap = graph.getNodeMap();
      for (const node of group) {
        nodeMap[node.id].translate(offsetX, offsetY);
      }
    }
    fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
    fdGrouping.groupVelocity.reset();
    fdGrouping.groupVelocity.setThreshold(80);
    fdp.restart(1.0);
    graph.refresh();
  });

  // 双击具有 childNodes 进行展开操作
  graph.on("node:dblclick", (e) => {
    const node = e.target;
    // 有收起的节点，并且点击的是节点上的 icon
    if (node.get("childNodes")) {
      expand(node, graph, fdp, fdGrouping);
      return;
    }
    // 如果有点击节点的其他交互在这里实现
  });

  // 增加样式修改。右键空白处修改样式。
  graph.on("canvas:contextmenu", (ev: any) => {
    fdGrouping.setOptions({
      shapeStyles: whichStyle ? style1 : style2,
    });
    fdGrouping.updateShapes();
    graph.draw();
    whichStyle = 1 - whichStyle;
  });
  return function cleanup() {
    graph.destroy();
  };
})();

function dealData(data: any) {
  const nodes = data.nodes;
  nodes.forEach((node: any) => {
    node.id = node.name;
  });
  data.links.forEach((edge: any) => {
    edge.source = nodes[edge.source].id;
    edge.target = nodes[edge.target].id;
  });
  data.edges = data.links;
  return data;
}

function collapse(
  shape: Shape,
  graph: Graph,
  fdp: ForceDirectedLayout,
  fdGrouping: ForceDirectedGrouping
) {
  const group = graph.getGroupById(shape.get("groupValue"));
  if (group) {
    group.configs.opacity = 1;
    const length = group.configs.childNodes.length;
    group.configs.width = Math.max(nodeSize, nodeSize * Math.sqrt(length));
    group.configs.height = Math.max(nodeSize, nodeSize * Math.sqrt(length));
    const groupNode = GroupUtils.collapseGroup(graph, group);
    let x = 0;
    let y = 0;
    for (const node of groupNode.configs.childNodes) {
      x += node.x;
      y += node.y;
    }
    x = x / length;
    y = y / length;
    groupNode.configs.x = x;
    groupNode.configs.y = y;
    groupNode.configs.vx = 0;
    groupNode.configs.vy = 0;
    fdp.updateData(graph);
    fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
    fdGrouping.updateData(graph);
    fdGrouping.groupVelocity.reset();
    fdGrouping.groupVelocity.setThreshold(80);
    fdp.restart(1.0);
    graph.refresh();
    graph.draw();
  }
}

function expand(
  node: any,
  graph: Graph,
  fdp: ForceDirectedLayout,
  fdGrouping: ForceDirectedGrouping
) {
  const center = { x: node.configs.x, y: node.configs.y };
  const highlight = graph.getBehavior("highlightRelations")!;
  highlight.recover();
  const group = GroupUtils.expandGroupNode(graph, node);
  assignPosition(center, group.configs.childNodes, false, 2);
  fdp.updateData(graph);
  fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
  fdGrouping.updateData(graph);
  fdGrouping.groupVelocity.reset();
  fdGrouping.groupVelocity.setThreshold(80);
  fdp.restart(1.0);
  graph.refresh();
}
