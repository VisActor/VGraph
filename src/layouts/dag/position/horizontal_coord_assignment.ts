import { Graph } from '../../../graph';
import { Node, Edge } from '../../../models/entities';
import { GraphStructure, NodeStructure, EdgeStructure } from '../../../graph_structure';

type IOptions = {
  nodeSep: number;
  edgeSep: number;
  rankSep: number;
  align?: 'UL' | 'UR' | 'DL' | 'DR' | 'L' | 'R' | 'T' | 'B';
};


// Fast and Simple Horizontal Coordinate Assignment
// By Ulrik Brandes and Boris K¨opf
// 前提条件：所有节点已经自上而下分层并排序以减少连线交叉
export function horizontalCoordAssignment(
  graph: GraphStructure | Graph,
  layers: Node[][] | NodeStructure[][],
  options: IOptions
) {
  const conflicts = {};
  findType1Conflicts(graph, layers, conflicts);
  findType2Conflicts(graph, layers, conflicts);
  let adjustLayers: Node[][] | NodeStructure[][] = [];
  const xMaps: Record<string, Record<string, number>> = {};

  // 上下 & 左右组合四次计算
  ['U', 'D'].forEach((vDirection: string) => {
    adjustLayers = vDirection === 'U' ? copyArray(layers) : copyArray(layers).reverse();
    ['L', 'R'].forEach((hDirection: string) => {
      const direction = vDirection + hDirection;
      if (options.align){
        if (['T', 'L'].includes(options.align)){
          if (direction !== 'UL' && direction !== 'DL'){
            return;
          }
        }
        else if (['B', 'R'].includes(options.align)){
          if (direction !== 'UR' && direction !== 'DR'){
            return;
          }
        }
        else if (options.align !== `${vDirection}${hDirection}`){
          return;
        }
      }
      if (hDirection === 'R') {
        adjustLayers.forEach((row, i) => {
          adjustLayers[i] = copyArray(row).reverse();
        });
      }

      const neighbors = vDirection === 'U' ? 'sources' : 'targets';
      const align = verticalAlign(adjustLayers, conflicts, neighbors);
      const xMap = horizontalCompaction(graph, adjustLayers, align, hDirection === 'R', options);
      if (hDirection === 'R') {
        Object.keys(xMap).forEach((k: string) => {
          xMap[k] = -xMap[k];
        });
      }
      xMaps[`${vDirection}${hDirection}`] = xMap;
    });
  });
  const minXMap = findSmallestWidthAlignment(graph, xMaps);
  if (!options.align){
    alignCoords(xMaps, minXMap!);
  }
  return balance(graph, xMaps, options);
}

// 标记 Type1 conflict，non-inner segment 和 inner segment 的交叉
// layers 中的 node 都是有序的
export function findType1Conflicts(
  graph: GraphStructure | Graph,
  layers: Node[][] | NodeStructure[][],
  conflicts: { [key: string]: string[] }
) {
  const nodeMap = graph.getNodeMap();

  for (let i = 0; i < layers.length - 1; i++) {
    const upperLayer = layers[i];
    const upperLayerIndexMap = {};
    upperLayer.forEach((node: Node | NodeStructure, index: number) => {
      upperLayerIndexMap[node.get('id')] = index;
    });
    const downLayer = layers[i + 1];
    const upperLen = upperLayer.length;
    const downLen = downLayer.length;
    let scanPos = 0;
    let k0 = 0;

    if (i === 0) {
      upperLayer.forEach((node: Node | NodeStructure) => {
        node.sources.forEach((id: string) => {
          const n = nodeMap[id];
          if (n.get('rank') === node.get('rank')) {
            addConflict(conflicts, id, node.get('id'));
          }
        });
      });
    }

    downLayer.forEach((node: Node | NodeStructure, k: number) => {
      const wId = getInnerSegmentNode(nodeMap, node);
      const k1 = wId ? upperLayerIndexMap[wId] : upperLen;
      if (wId || k === downLen - 1) {
        for (let j = scanPos; j < k + 1; j++) {
          const scanNode = downLayer[j];
          const { rank: scanNodeRank, id: scanNodeId, dummy: scanNodeDummy } = scanNode.configs;
          scanNode.sources.forEach((nodeId: string) => {
            const upperNeighbor = nodeMap[nodeId];
            // const index = upperLayer.indexOf(upperNeighbor);
            const index = upperLayerIndexMap[nodeId];
            const { dummy, rank } = upperNeighbor.configs;
            // bfs 和自定义中可能会有同层级节点之间的连线，将有关联的同层级节点也列为 conflict
            if (rank === scanNodeRank) {
              addConflict(conflicts, nodeId, scanNodeId!);
            } else if (index >= 0) {
              if ((index < k0 || k1 < index) && !(dummy && scanNodeDummy)) {
                addConflict(conflicts, nodeId, scanNodeId!);
              }
            }
          });
        }
        scanPos = i + 1;
        k0 = k1;
      }
    });
  }
  return conflicts;
}

// 标记 type2 conflict，两个 innser segment 的交叉
export function findType2Conflicts(
  graph: GraphStructure | Graph,
  layers: Node[][] | NodeStructure[][],
  conflicts: { [key: string]: string[] }
) {
  const nodeMap = graph.getNodeMap();
  for (let i = 0; i < layers.length - 1; i++) {
    const upperLayer = layers[i];
    const upperLen = upperLayer.length;
    const downLayer = layers[i + 1];
    const prevDummySources: string[] = new Array(upperLen);
    const upperOrder: { [key: string]: number } = {};
    upperLayer.forEach((node: Node | NodeStructure, index: number) => {
      upperOrder[node.get('id')] = index;
    });

    downLayer.forEach((node: Node | NodeStructure) => {
      if (!node.get('dummy')) {
        return;
      }
      node.sources.forEach((childId: string) => {
        const n = nodeMap[childId];
        if (n.get('dummy')) {
          const index = upperOrder[childId];
          prevDummySources[index] = childId;
          for (let j = index + 1; j < prevDummySources.length; j++) {
            if (prevDummySources[j]) {
              addConflict(conflicts, childId, node.get('id'));
            }
          }
        }
      });
    });
  }
  return conflicts;
}

// 最左原则从上到下分块
export function verticalAlign(
  layers: NodeStructure[][] | Node[][],
  conflicts: { [key: string]: string[] },
  neighborAttr: 'sources' | 'targets'
) {
  const root: { [k: string]: string } = {};
  const align: { [k: string]: string } = {};
  const pos: { [k: string]: number } = {};
  const isRightBorder: { [k: string]: boolean } = {};
  // 根据分层缓存位置,初始化 block 的根节点和对齐元素
  layers.forEach((row) => {
    row.forEach((node: Node | NodeStructure, i: number) => {
      const id = node.get('id');
      root[id] = id;
      align[id] = id;
      pos[id] = i;
    });
  });
  for (let rowID = 1; rowID < layers.length; rowID++) {
    let prevIndex = -1;
    const row = layers[rowID];

    row.forEach((node) => {
      const nodeId = node.get('id');
      // 确保是下一层级的节点
      let neighbors = node[neighborAttr];
      if (neighbors.length > 0) {
        neighbors = neighbors.concat([]).sort((a, b) => pos[a] - pos[b]);
        isRightBorder[neighbors[neighbors.length - 1]] = true;
        const median = (neighbors.length - 1) / 2;
        for (let i = Math.floor(median), il = Math.ceil(median); i <= il; ++i) {
          const neighborId = neighbors[i];
          if (align[nodeId] === nodeId && prevIndex < pos[neighborId] && !hasConflict(conflicts, nodeId, neighborId)) {
            align[neighborId] = nodeId;
            align[nodeId] = root[nodeId] = root[neighborId];
            prevIndex = pos[neighborId];
          }
        }
      }
    });
  }
  return { root, align, isRightBorder };
}

export function horizontalCompaction(
  data: GraphStructure | Graph,
  layers: NodeStructure[][] | Node[][],
  aligns: any,
  reverse: boolean,
  options: IOptions
) {
  const { block, edgeMap } = getGraphByBlocks(data, layers, aligns.root, reverse, options);
  const nodeMap = block.getNodeMap();
  const xMap: { [k: string]: number } = {};

  // 遍历分配最小坐标
  function firstWalk(nodeId: string) {
    xMap[nodeId] = edgeMap[nodeId].inEdges.reduce((acc: number, edge: Edge | EdgeStructure) => {
      return Math.max(acc, xMap[edge.get('source')] + edge.get('len'));
    }, 0);
  }

  // 遍历分配最大坐标
  function secondWalk(nodeId: string) {
    const min = edgeMap[nodeId].outEdges.reduce((acc: number, edge: Edge | EdgeStructure) => {
      return Math.min(acc, xMap[edge.get('target')] - edge.get('len'));
    }, Infinity);

    if (min !== Infinity && !aligns.isRightBorder[nodeId]) {
      xMap[nodeId] = Math.max(xMap[nodeId], min);
    }
  }
  function visitNode(callback: (nodeId: string) => void, direction: 'sources' | 'targets') {
    let stack: string[] = Object.keys(nodeMap);
    const visited = {};
    let nodeId = stack.pop();
    while (nodeId !== undefined) {
      if (visited[nodeId]) {
        callback(nodeId);
      } else {
        visited[nodeId] = true;
        stack.push(nodeId);
        stack = stack.concat(nodeMap[nodeId][direction]);
      }
      nodeId = stack.pop();
    }
  }

  visitNode(firstWalk, 'sources');
  visitNode(secondWalk, 'targets');

  Object.values(aligns.align).forEach((id: any) => {
    xMap[id] = xMap[aligns.root[id]];
  });

  return xMap;
}

export function findSmallestWidthAlignment(data: Graph | GraphStructure, xMaps: Record<string, Record<string, number>>) {
  let minWidth = Infinity;
  let minXMap;
  const nodeMap = data.getNodeMap();
  Object.keys(xMaps).forEach((key: string) => {
    const xMap = xMaps[key];
    let min = Infinity;
    let max = -Infinity;
    Object.keys(xMap).forEach((k: string) => {
      const width = nodeMap[k].get('width') / 2;
      max = Math.max(xMap[k] + width, max);
      min = Math.min(xMap[k] - width, min);
    });
    if (minWidth > max - min) {
      minXMap = key;
      minWidth = max - min;
    }
  });
  return minXMap;
}

// 左对齐的对齐最小坐标，右对齐的对齐最大坐标
export function alignCoords(xMaps: Record<string, Record<string, number>>, minXMap: string) {
  const minExtreme = getXMapExtreme(xMaps[minXMap]);
  const { min, max } = minExtreme;
  ['U', 'D'].forEach((vDirection: string) => {
    ['L', 'R'].forEach((hDirecition: string) => {
      const key = `${vDirection}${hDirecition}`;
      if (key === minXMap) {
        return;
      }
      const xMap = xMaps[key];
      const extremes = getXMapExtreme(xMap);
      const delta = hDirecition === 'L' ? min - extremes.min : max - extremes.max;
      if (delta) {
        Object.keys(xMap).forEach((k: string) => {
          xMap[k] += delta;
        });
      }
    });
  });
}

export function balance(graph: Graph | GraphStructure, xMaps: Record<string, Record<string, number>>, options: IOptions) {
  const nodeMap = graph.getNodeMap();
  graph.getNodes().forEach((node: Node | NodeStructure) => {
    const k = node.get('id');
    if (options.align) {
      if (options.align === 'T' || options.align === 'L') {
        nodeMap[k].configs.x = getMinMaxValue(xMaps, k);
      } else if (options.align === 'B' || options.align === 'R'){
        nodeMap[k].configs.x = getMinMaxValue(xMaps, k, 'max');
      } else {
        nodeMap[k].configs.x = xMaps[options.align][k];
      }
    } else {
      nodeMap[k].configs.x = getAvgMedian(xMaps, k);
    }
  });
}

function getMinMaxValue(xMaps: Record<string, Record<string, number>>, k: string, minMax = 'min'){
  if (minMax === 'min'){
    let min = Infinity;
    // FIXME: 历史原因， LR 情况下，DL 其实是 UR。 DL -> UR
    ['UL','DL'].forEach((layout: string) => {
      if (xMaps[layout]?.[k] !== undefined){
        min = Math.min(xMaps[layout][k], min);
      }
    });
    return min;
  } else {
    let max = -Infinity;
    ['UR','DR'].forEach((layout: string) => {
      if (xMaps[layout]?.[k] !== undefined){
        max = Math.max(xMaps[layout][k], max);
      }
    });
    return max;
  }
}

function getAvgMedian(xMaps: Record<string, Record<string, number>>, k: string) {
  const values: number[] = [];
  Object.keys(xMaps).forEach((layout: string) => {
    values.push(xMaps[layout][k]);
  });
  values.sort((a: number, b: number) => a - b);
  if (values[1] === undefined || values[2] === undefined) {
    console.error(`node ${k} coord assignment failed`);
    return values[1] ?? values[0];
  }
  return (values[1] + values[2]) / 2;
}

function getXMapExtreme(xMap: { [k: string]: number }) {
  let min = Infinity;
  let max = -Infinity;
  Object.values(xMap).forEach((x: number) => {
    min = Math.min(x, min);
    max = Math.max(x, max);
  });
  return { min, max };
}

function getGraphByBlocks(
  data: Graph | GraphStructure,
  layers: Node[][] | NodeStructure[][],
  rootMap: any,
  reversed: boolean,
  options: IOptions
) {
  const subGraph = new GraphStructure({
    nodes: [],
    edges: [],
  });
  const edgeMap: Record<string, {inEdges: (Edge | EdgeStructure)[], outEdges: (Edge | EdgeStructure)[]}> = {};
  layers.forEach((row: Node[] | NodeStructure[]) => {
    let prevNode: Node | NodeStructure | undefined;
    row.forEach((node: Node | NodeStructure) => {
      const root = rootMap[node.get('id')];
      if (!subGraph.getNodeMap()[root]) {
        subGraph.add('node', { id: root });
      }
      edgeMap[root] = edgeMap[root] || { inEdges: [], outEdges: [] };
      if (prevNode) {
        const prevRoot = rootMap[prevNode.get('id')];
        const prevEdge = edgeMap[prevRoot].outEdges.find((e: any) => {
          return e.target === root;
        });
        const prevMax = prevEdge ? prevEdge.get('len') : 0;
        const edge = subGraph.add('edge', {
          source: prevRoot,
          target: root,
          len: Math.max(getNodeEdgeSep(options, node, prevNode, reversed), prevMax),
        });
        edgeMap[prevRoot] = edgeMap[prevRoot] || { inEdges: [], outEdges: [] };
        edgeMap[root].inEdges.push(edge as EdgeStructure);
        edgeMap[prevRoot].outEdges.push(edge as EdgeStructure);
      }
      prevNode = node;
    });
  });
  return { block: subGraph, edgeMap };
}

function getNodeEdgeSep(
  option: IOptions,
  node1: Node | NodeStructure,
  node2: Node | NodeStructure,
  _reversed: boolean
) {
  let sum = 0;
  const { nodeSep, edgeSep } = option;
  sum += node1.get('width') / 2;
  sum += node2.get('width') / 2;
  sum += (node1.get('dummy') ? edgeSep : nodeSep) / 2;
  sum += (node2.get('dummy') ? edgeSep : nodeSep) / 2;
  return sum;
}

// 获取 inner segment
function getInnerSegmentNode(nodeMap: { [key: string]: Node | NodeStructure }, node: Node | NodeStructure) {
  if (node.get('dummy')) {
    return node.sources.find((nodeId: string) => nodeMap[nodeId].get('dummy'));
  }
}

function addConflict(conflicts: { [k: string]: string[] }, upperId: string, downId: string) {
  conflicts[upperId] = conflicts[upperId] || [];
  conflicts[upperId].push(downId);
}

function hasConflict(conflicts: { [k: string]: string[] }, nId: string, vId: string) {
  if (conflicts[nId]?.includes(vId)) {
    return true;
  }
  if (conflicts[vId]?.includes(nId)) {
    return true;
  }
  return false;
}

function copyArray(value: any) {
  const arr: any = [];
  value.forEach((row: Node[] | NodeStructure[], i: number) => {
    if (Array.isArray(row)) {
      arr[i] = [];
      row.forEach((node: Node | NodeStructure) => {
        arr[i].push(node);
      });
    } else {
      arr.push(row);
    }
  });
  return arr;
}
