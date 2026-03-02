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
  isMultiComponentsForGraph,
  ForceDirectedGrouping,
  Group,
  Layer,
  Rect,
  Text,
} from "../../src";

import networkData from "../static/autopara.json";

function createDummyGroupNodes(data: any) {
  const nodes = data.nodes;
  data.edges = data.edges ?? [];
  const edges = data.edges;
  const newNodes = [] as any[];
  const newEdges = [] as any[];
  const groups = [] as any[];
  const parents = Array.from(new Set(nodes.map((d: any) => d.parent))).filter(
    (d: any) => d !== ""
  ) as string[];
  const groupMap = {} as any;
  for (const parent of parents) {
    const group = { id: parent, children: [], _parent: null };
    groupMap[parent] = group;
    groups.push(group);
  }

  // vgraph 会修影响 type 值
  const nodeMap = {} as any;
  for (const node of nodes) {
    nodeMap[node.ID] = node;
    if (!node.nodeType) {
      node.nodeType = node.type;
    }
    if (node.children_count) {
      delete node.children_count;
    }
    if (node.children) {
      delete node.children;
    }
  }

  for (const node of nodes) {
    node.id = node.ID;
    if (node.parent && node.parent !== "") {
      groupMap[node.parent].children.push(node.ID);
      nodeMap[node.parent].isGroup = true;
      if (groupMap[node.ID]) {
        groupMap[node.ID]._parent = groupMap[node.parent];
      }
    }
  }

  const topGroups = [] as any[];
  for (const group of groups) {
    if (!group._parent) {
      topGroups.push(group);
    }
  }
  topGroups.forEach((group, i) => {
    for (const child of group.children) {
      nodeMap[child].group = i;
    }
  });
  const removedNode = {} as any;
  for (const node of nodes) {
    // console.log(node);
    if (node.nodeType?.includes("Node") || node.nodeType === "CN") {
      if (nodeMap[node.parent].children_count === undefined) {
        nodeMap[node.parent].children_count = 1;
        nodeMap[node.parent].children = [];
        nodeMap[node.parent].children.push(node.ID);
      } else {
        nodeMap[node.parent].children_count += 1;
        nodeMap[node.parent].children.push(node.ID);
      }
      removedNode[node.ID] = nodeMap[node.parent];
    } else if (
      !node.isGroup ||
      node.nodeType?.includes("Cluster") ||
      node.nodeType === "CNSet"
    ) {
      newNodes.push(node);
    }
  }

  //
  for (const edge of edges) {
    let { source, target } = edge;
    if (removedNode[source]) {
      source = removedNode[source].ID;
    }
    if (removedNode[target]) {
      target = removedNode[target].ID;
    }

    if (source !== target) {
      newEdges.push({
        source,
        target,
      });
    }
  }
  return {
    nodes: newNodes,
    edges: newEdges,
    Clusters: nodes.filter((d: any) => d.children_count > 0),
    groups,
  };
}

// 新的data布局好之后将虚拟节点恢复到原来的节点
function recoverGroupChildren(graph: Graph, Clusters: any) {
  const nodeMap = graph.getNodeMap();
  // console.log(graph.getNodes());
  for (const group of Clusters) {
    const { x, y, width, height } = group;
    const cols = Math.ceil(Math.sqrt(group.children_count));
    const rows = Math.ceil(group.children_count / cols);
    const allWidth = cols * nodeWidth + (cols - 1) * 3;
    const allHeight = rows * nodeHeight + (rows - 1) * 2;
    const offsetX = 0.5 * (width - allWidth + nodeWidth);
    const offsetY = 0.5 * (height - allHeight + nodeHeight);
    const left = x - 0.5 * width;
    const top = y - 0.5 * height;
    group.children.forEach((id: string, i: number) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      nodeMap[id].set("x", left + offsetX + (nodeWidth + 3) * col);
      nodeMap[id].set("y", top + offsetY + (nodeHeight + 2) * row);
    });
  }
}
const { nodes, edges, Clusters, groups } = createDummyGroupNodes(networkData);
const data = { nodes, edges, Clusters, groups };
const oriData = {
  nodes: networkData.nodes.filter((d) => !(d as any).isGroup),
  edges: networkData.edges,
  groups: data.groups,
};

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

const styleNone = (v: any) => {
  return {
    opacity: 0,
  };
};

const nodeWidth = 80;
const nodeHeight = 30;
const div = document.createElement("div");
div.style.border = "1px solid #666";
div.style.width = "800px";
document.body.append(div);
(() => {
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    linkCenter: false,
    setDefaultNode(nodeData) {
      const group = nodeData.group_id ?? nodeData.group;
      if (nodeData.children_count) {
        const cols = Math.ceil(Math.sqrt(nodeData.children_count));
        const rows = Math.ceil(nodeData.children_count / cols);
        nodeData.width = cols * (nodeWidth + 5) + 20 * 2; // 20 = padding * 2
        nodeData.height = rows * (nodeHeight + 3) + (30 + 10) * 2; // 30 -> TitleHeight
      }
      return {
        type: "rect",
        label: nodeData.id,
        width: nodeData.width ?? nodeWidth,
        height: nodeData.height ?? nodeHeight,
        strokeStyle: nodeData.children_count
          ? color[group >= 0 ? group % 13 : 13]
          : "#fff",
        fillStyle: nodeData.children_count ? undefined : color[13],
        // anchors: [
        //   [0, 0.5],
        //   [1, 0.5],
        //   [0.5, 1],
        //   [0.5, 0]
        // ]
      };
    }, // 定制节点样式
    setNodeStateStyles(state) {
      if (state === "active") {
        return {
          opacity: 1.0,
        };
      }
      if (state === "focus") {
        return {
          fillStyle: "red",
          opacity: 1.0,
        };
      }
      return { opacity: 0.2 };
    },
    setDefaultEdge() {
      return {
        strokeStyle: "#ccc",
        endArrow: {
          width: 9,
          height: 12,
        },
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
        fillStyle: "#F3F9FF",
        strokeStyle: "#3073F2",
        opacity: 0.2,
        padding: 10,
        capture: false,
        exactMath: true,
        linkNode: true,
        // anchors: [
        //   [0, 0.5],
        //   [1, 0.5],
        //   [0.5, 1],
        //   [0.5, 0]
        // ],
        renderGroupTitle(group: Group, layer: Layer, width: number) {
          // 定义标题文本
          // if (groupData.inner) {
          //   return 10;
          // }
          const text = new Text({
            text: groupData.id,
            x: width / 2,
            width: width - 5,
            textOverflow: "ellipsis",
            y: 18,
            fontSize: 15,
            textBaseline: "middle",
            textAlign: "center",
            fillStyle: "#3073F2",
          } as any);

          // // 定义标题栏顶部色条
          const rect = new Rect({
            left: 0,
            top: 0,
            width: width,
            height: 4,
            // radius: [6, 6, 0, 0],
            fillStyle: "#3073F2",
            opacity: 0.2,
          });

          layer.add(rect);
          layer.add(text);
          // 返回标题高度，此高度不包含上 padding
          return 30;
        },
      };
    },
  });

  graph.data({ nodes: data.nodes, edges: data.edges });
  // 定义力导向布局
  const fdGrouping = new ForceDirectedGrouping({
    graph,
    options: {
      shapeStyles: styleNone,
      extraPadding: 20,
    },
  });

  fdGrouping.updateData(graph);
  const forces = autoForce(graph, fdGrouping, { graphSize: [800, 600] });
  new ForceDirectedLayout({
    // 力导布局部分
    graph,
    forces,
    maxIteration: 300, // 总迭代次数
    tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
    onTick: () => {
      fdGrouping.updateShapes(); // 更新 groupShape 的大小和位置。
      // graph.refresh(); // 刷新画布
    },
    onEnd: () => {
      fdGrouping.updateShapes();
      // 布局完之后切换回原数据
      graph.data(oriData);
      // 恢复里层Group的节点坐标
      recoverGroupChildren(graph, data.Clusters);
      graph.refresh();
      graph.fitView(); // 居中并缩放适应画布
    },
  });
  addBehaviors(graph);
})();

// 添加交互
function addBehaviors(graph: Graph) {
  graph.addBehavior(highlightRelations);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
}

function autoForce(
  graph: Graph,
  fdGrouping: ForceDirectedGrouping,
  options: {
    graphSize: number[];
    nodeSize?: number;
  }
) {
  const x = options.graphSize[0] / 2;
  const y = options.graphSize[1] / 2;
  const groups = fdGrouping.getGroups();
  const n_group = Object.keys(groups).length;
  const nodeSize = options.nodeSize || 80;
  const width = options.graphSize[0];
  const height = options.graphSize[1];
  const connected = isMultiComponentsForGraph(graph);
  const N = nodes.length;
  const E = edges.length;
  const avgDegree = (E / N || 0) > 0.1 ? E / N || 0 : 0.1; // 平均度数
  const multi = connected.isMultiComponents; // 是否有零散的节点
  const leaf = Math.max((2 * connected.numLeaf) / N, 0.1); // 叶子节点的系数, 设定至少为 0.1
  // 有零散的节点时或者平均度数小叶子结点比例小(说明可能有长链)的情况，加大中心吸引力
  const strengthXY =
    multi || 0.05 / avgDegree / leaf > 0.5 ? 0.5 : 0.05 / avgDegree / leaf;
  let distance = ((nodeSize * 4) / 3) * avgDegree;
  // 叶子节点很多，适当调整 distance 使叶子节点能分散开
  if (leaf >= 1) {
    distance = nodeSize * 2 * leaf;
  }
  // 节点很少的时候，适当增大引力和斥力平铺开
  const mean = (width + height) / 2;
  if (N * nodeSize < mean) {
    distance = mean / Math.max(N / 1.5, 8);
  }
  const forces = {
    link: new ForceLink({ options: { distance: distance } }), // 力导向吸引力
    manybody: new ForceManyBody({
      options: {
        strength: (d: any) =>
          d.children_count
            ? Math.sqrt(d.children_count) * -distance
            : -distance,
      },
    }), // 力导向排斥力，整体依旧呈现力导向布局。
    attrCluster: new IntraClusterForce({ options: { strength: 0.1 } }), // 类内吸引力, 如果聚簇效果不够显著可以尝试增加该值
    repulCluster: new InterClusterForce({ options: { strength: -5 } }), // 类间排斥力，可注释掉这两行看看效果
    x: new ForceX({ options: { x, strength: strengthXY } }), // 由于类间的排斥力，可能会导致不同类相距较远，通过中心里使得节点集中在中心位置
    y: new ForceY({ options: { y, strength: strengthXY } }), //
    collision: new ForceCollision({
      options: {
        radius: (d: any) => Math.max(d.width, d.height) / 2 + 20 || 10,
      },
      iterationCallback: n_group ? fdGrouping.groupVelocity : undefined,
      // 在这里调用力导向分组布局的 groupVelocity。 groupVelocity 会计算得到速度并赋予节点，此时并没有真正移动节点。
      // 节点的移动发生于 fdp 每次迭代的 moveNodes 。
    }),
    center: new ForceCenter({ options: { x, y } }),
  };
  return forces;
}
