import { Graph } from "../../../graph";
import { Node } from "../../../models/entities";
import { GraphStructure, NodeStructure } from "../../../graph_structure";
import { MindMap } from "../../tree";
import { DAGLayoutOptions } from "../../../typings/layouts/dag";
import { TreeData } from "../../../typings/data";

function getNodeData(node: Node | NodeStructure) {
  return {
    id: node.get("id"),
    width: node.get("width"),
    height: node.get("height"),
    children: [],
  };
}

// 构建一颗树的计算成本：O(N) 计算成本较低，且普适性较强，因此在此直接构建一颗树来做
function buildTree(
  graph: GraphStructure | Graph,
  dummyNodeSize: number[],
  rootId?: string
) {
  // 从第一层节点开始
  // BFS 建树
  const nodes = graph.getNodes();
  let root: TreeData | null = null;
  let node = rootId && graph.getNodeById(rootId);
  if (node) {
    // 临时兼容 DAGFlowEditor 逻辑
    if (rootId === "vgraphDagFlowRoot" && node.targets.length === 1) {
      node = graph.getNodeById(node.targets[0]);
    }
    root = getNodeData(node);
    root.children = node.targets.map((id: string) => {
      const node = graph.getNodeById(id);
      const configs: any = getNodeData(node);
      // 方便维护树图的左右子树关系
      configs.position = node.get("position");
      return configs;
    });
  } else {
    const rootNodes = (nodes as never[]).filter(
      (node: Node | NodeStructure) => !node.sources || node.sources.length === 0
    );
    root = rootId
      ? graph.getNodeById(rootId)
      : ({
          id: "_mocked_root",
          width: 0,
          height: 0,
          children: [],
        } as any);
    root!.children = rootNodes.map((node: Node | NodeStructure) => {
      return getNodeData(node);
    });
  }

  const queue = root!.children.concat();
  let l = 0;
  let r = queue.length;
  const isVisited: Record<string, boolean> = {};
  while (l < r) {
    const treeNode = queue[l];
    const id = treeNode.id;
    const node = graph.getNodeById(id!);
    const targets = node.targets;
    for (const target of targets) {
      const targetNode = graph.getNodeById(target);
      const isVisible = targetNode?.isVisible?.();
      if (!isVisible || isVisited[target]) {
        continue;
      }
      isVisited[target] = true;
      const child = {
        id: targetNode.get("id"),
        width: targetNode.get("width") || dummyNodeSize[0] || 0, // dummy node 宽高
        height: targetNode.get("height") || dummyNodeSize[1] || 0,
        children: [],
      };
      treeNode.children!.push(child);
      queue.push(child);
      r++;
    }
    l++;
  }
  return root;
}

function recoverCoords(graph: GraphStructure | Graph, tree: any) {
  function dfs(treeNode: any) {
    const { id, x, y } = treeNode;
    const graphNode = graph.getNodeById(id);
    graphNode.set("x", x);
    graphNode.set("y", y);
    for (const child of treeNode.children) {
      dfs(child);
    }
  }
  const node = graph.getNodeById(tree.id);
  if (node) {
    node.set("x", tree.x);
    node.set("y", tree.y);
  }
  for (const child of tree.children) {
    dfs(child);
  }
}

function getDefaultOptions(
  dagOptions: Partial<DAGLayoutOptions> & {
    setTreePosition?: (data: TreeData) => {
      leftTree: TreeData;
      rightTree: TreeData;
    };
  },
  rootId?: string
) {
  return {
    ...dagOptions,
    rankSep: () => dagOptions.rankSep!,
    nodeSep: () => dagOptions.nodeSep!,
    direction: dagOptions.rankDir,
    setTreePosition: dagOptions.setTreePosition
      ? dagOptions.setTreePosition
      : (data: TreeData) => {
          return {
            leftTree: {
              id: data.id,
              width: data.width,
              height: data.width,
              children: [],
            },
            rightTree: data,
          };
        },
  };
}

export function treeLayoutCoordAssignment(
  graph: GraphStructure | Graph,
  dagOptions: Partial<DAGLayoutOptions> & {
    setTreePosition?: (data: TreeData) => {
      leftTree: TreeData;
      rightTree: TreeData;
    };
  },
  rootId?: string
) {
  const tree = buildTree(
    graph,
    dagOptions?.edgeSep ? [0, dagOptions.edgeSep] : [0, 30],
    rootId
  );
  const layoutInstance = new MindMap(getDefaultOptions(dagOptions));
  tree && layoutInstance.layout(tree);
  recoverCoords(graph, tree);
}
