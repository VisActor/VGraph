import { Graph } from '../../../graph';
import { Node, Edge } from '../../../models/entities';
import { normalizePadding } from '../../../utils/graph';
import { EdgeStructure, GraphStructure, NodeStructure } from '../../../graph_structure';
import { connectedComponents } from '../../utils/connected_components';

export function getNestedGraph(graph: Graph | GraphStructure, group: any) {
  const edges = [];
  const nodes = [];
  const outerEdges = [];
  const childIds = group.get('children');
  const nodeMap = graph.getNodeMap();

  // 构造虚拟分组节点
  const groupId = group.get('id');
  const virtualNodeId = `_mockGroup_${groupId}`;
  const virtualNode = graph.add(
    'node',
    {
      id: virtualNodeId,
      originGroupId: groupId,
      padding: group.get('padding'),
      titleHeight: group.titleHeight,
      order: group.get('order'),
      _order: group.get('_order'),
      rank: group.get('rank'),
      children: group.get('children').concat(), // 应该是拷贝一份，否则graph add/remove 阶段会影响。
    },
    true
  );

  // 收集连接到分组的连线
  for (let i = group.edges.length - 1; i >= 0; i--) {
    const edge = group.edges[i];
    const configs = edge.configs;
    const sourceNode = edge.source;
    const targetNode = edge.target;
    graph.remove(edge);
    const { source } = configs;
    if (source === groupId) {
      configs.originSource = groupId;
      configs.source = virtualNodeId;
      if (targetNode.type === 'group' || targetNode.belong) {
        configs.target = `_mockGroup_${targetNode.belong?.get('id') ?? targetNode.get('id')}`;
        configs.originTarget = targetNode.get('id');
      }
    } else {
      configs.originTarget = groupId;
      configs.target = virtualNodeId;
      if (sourceNode.type === 'group' || sourceNode.belong) {
        configs.source = `_mockGroup_${sourceNode.belong?.get('id') ?? sourceNode.get('id')}`;
        configs.originSource = sourceNode.get('id');
      }
    }
    outerEdges.push(configs);
  }
  group.edges = [];

  graph.get('groupNodes').push(virtualNode);
  // 收集分组内节点和连线构造子图
  for (let j = group.children.length - 1; j >= 0; j--) {
    const node = group.children[j];
    nodes.push(node.configs);
    const id = node.get('id');
    for (let i = node.edges.length - 1; i >= 0; i--) {
      const edge = node.edges[i];
      const configs = edge.configs;
      configs.controlPoints = undefined;
      graph.remove(edge);
      const { source, target } = configs;
      if ((source === id && childIds.includes(target)) || (target === id && childIds.includes(source))) {
        edges.push(configs);
      } else {
        // 外部连线改连到虚拟节点上
        if (source === id) {
          configs.source = virtualNodeId;
          configs.originSource = id;
          const belong = nodeMap[target]?.belong;
          if (belong || !nodeMap[target]) {
            configs.originTarget = configs.target;
            configs.target = `_mockGroup_${belong?.get('id') ?? target}`;
          }
        } else {
          configs.target = virtualNodeId;
          configs.originTarget = id;
          const belong = nodeMap[source]?.belong;
          if (belong || !nodeMap[source]) {
            configs.originSource = configs.source;
            configs.source = `_mockGroup_${belong?.get('id') ?? source}`;
          }
        }
        configs.temp = true;
        outerEdges.push(configs);
      }
    }
    graph.remove(node);
  }
  const nestedGraph = new GraphStructure({ nodes, edges });
  nestedGraph.set('id', virtualNodeId);
  nestedGraph.set('groupNode', virtualNode);
  return { nestedGraph, outerEdges };
}

export function getBBoxForNode(graph: GraphStructure) {
  const nodes = graph.getNodes();
  const node = graph.get('groupNode');
  const padding = normalizePadding(node.get('padding') || 20);
  node.set('padding', padding);

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((node: NodeStructure) => {
    const { x, y, width, height } = node.configs;
    minX = Math.min(x - width / 2, minX);
    maxX = Math.max(x + width / 2, maxX);
    minY = Math.min(y - height / 2, minY);
    maxY = Math.max(y + height / 2, maxY);
  });
  node.set('width', maxX - minX + padding[1] + padding[3]);
  node.set('height', maxY - minY + padding[0] + padding[2] + (node.get('titleHeight') || 0));
}

export function recoverFromNestedGraph(graph: Graph | GraphStructure, nestedGraph: GraphStructure) {
  const node = nestedGraph.get('groupNode');
  const group = graph.getGroupById(node.get('originGroupId'));
  const { x, y, width, height, padding, titleHeight } = node.configs;
  // 恢复节点
  let left = Infinity,
    top = Infinity;
  for (const child of nestedGraph.getNodes()) {
    const { x, y, width, height } = child.configs;
    left = Math.min(left, x - width / 2);
    top = Math.min(top, y - height / 2);
  }
  const offsetX = x - width / 2 + padding[3] - left;
  const offsetY = y - height / 2 + padding[0] + (titleHeight ?? 0) - top;
  group.set('_nestedOffsets', { offsetX, offsetY });
  for (const child of nestedGraph.getNodes()) {
    const configs = child.configs;
    configs.x += offsetX;
    configs.y += offsetY;
    graph.add('node', configs);
  }
  // 恢复内部连线
  nestedGraph.getEdges().forEach((edge: EdgeStructure) => {
    if (edge.configs.controlPoints) {
      edge.configs.controlPoints = moveControlPoints(edge.configs.controlPoints, offsetX, offsetY);
    }
    graph.add('edge', edge.configs);
  });
  graph.remove(node);
  return { offsetX, offsetY };
}

function moveControlPoints(cp: number[][], offsetX: number, offsetY: number) {
  return cp.map((coord: number[]) => [coord[0] + offsetX, coord[1] + offsetY]);
}

export function assignControlPoints(graph: Graph | GraphStructure, configs: any, gapYs: any, vertical: boolean) {
  const source = graph.getNodeById(configs.source);
  const target = graph.getNodeById(configs.target);
  const controlPoints = configs.controlPoints || [];
  if (vertical) {
    if (source.get('x') !== target.get('x')) {
      if (source.get('rank') < target.get('rank')) {
        controlPoints.unshift([source.get('x'), gapYs[source.get('rank')].source]);
        controlPoints.push([target.get('x'), gapYs[target.get('rank')].target]);
      } else {
        controlPoints.unshift([source.get('x'), gapYs[source.get('rank')].target]);
        controlPoints.push([target.get('x'), gapYs[target.get('rank')].source]);
      }
    }
  } else {
    if (source.get('y') !== target.get('y')) {
      if (source.get('rank') < target.get('rank')) {
        controlPoints.unshift([gapYs[source.get('rank')].source, source.get('y')]);
        controlPoints.push([gapYs[target.get('rank')].target, target.get('y')]);
      } else {
        controlPoints.unshift([gapYs[source.get('rank')].target, source.get('y')]);
        controlPoints.push([gapYs[target.get('rank')].source, target.get('y')]);
      }
    }
  }
  configs.controlPoints = compressControlPoints(compressPath(controlPoints));
}

// 去掉前后完全一样的控制点
function compressControlPoints(controlPoints?: number[][]) {
  let resControlPoints = null;
  if (!controlPoints || controlPoints.length === 0) {
    return null;
  } else {
    resControlPoints = [controlPoints[0]];
    for (let i = 1; i < controlPoints.length; i++) {
      if (
        controlPoints[i][0] !== resControlPoints[resControlPoints.length - 1][0] ||
        controlPoints[i][1] !== resControlPoints[resControlPoints.length - 1][1]
      ) {
        resControlPoints.push(controlPoints[i]);
      }
    }
  }
  return resControlPoints;
}

// 路径压缩，避免折返跑
// TODO: 等 router 合并后用 router 中的 util
function compressPath(path: number[][] | undefined) {
  if (!path) {
    return;
  }
  // nothing to compress
  if (path.length < 3) {
    return path;
  }

  const compressed = [],
    sx = path[0][0], // start x
    sy = path[0][1]; // start y
  let px = path[1][0], // second point x
    py = path[1][1], // second point y
    dx = px - sx, // direction between the two points
    dy = py - sy, // direction between the two points
    lx,
    ly,
    ldx,
    ldy,
    sq,
    i;

  // normalize the direction
  sq = Math.sqrt(dx * dx + dy * dy);
  dx /= sq;
  dy /= sq;

  // start the new path
  compressed.push([sx, sy]);

  for (i = 2; i < path.length; i++) {
    // store the last point
    lx = px;
    ly = py;

    // store the last direction
    ldx = dx;
    ldy = dy;

    // next point
    px = path[i][0];
    py = path[i][1];

    // next direction
    dx = px - lx;
    dy = py - ly;

    // normalize
    sq = Math.sqrt(dx * dx + dy * dy);
    dx /= sq;
    dy /= sq;
    const abs = Math.abs;
    if (abs(dx) !== abs(ldx) || abs(dy) !== abs(ldy)) {
      compressed.push([lx, ly]);
    }
  }

  // store the last point
  compressed.push([px, py]);

  return compressed;
}

// if (vertical) {
//   if (source.get('x') !== target.get('x')) {
//     if (source.get('rank') < target.get('rank')) {
//       controlPoints = [
//         [source.get('x'), gapYs[source.get('rank')]],
//         [target.get('x'), gapYs[target.get('rank') - 1]],
//       ];
//     } else {
//       controlPoints = [
//         [source.get('x'), gapYs[source.get('rank') - 1]],
//         [target.get('x'), gapYs[target.get('rank')]],
//       ];
//     }
//   }
// } else {
//   if (source.get('y') !== target.get('y')) {
//     if (source.get('rank') < target.get('rank')) {
//       controlPoints = [
//         [gapYs[source.get('rank')], source.get('y')],
//         [gapYs[target.get('rank') - 1], target.get('y')],
//       ];
//     } else {
//       controlPoints = [
//         [source.get('x'), gapYs[source.get('rank')]],
//         [target.get('x'), gapYs[target.get('rank') - 1]],
//       ];
//     }
//   }
// }

// Preconditions:
// 1. Input graph is a DAG and have ranks.
// 2. Have init ranks.
export function nestingGraph(graph: Graph | GraphStructure) {
  const dummyNodes: (Node | NodeStructure)[] = [];
  const dummyEdges: (Edge | EdgeStructure)[] = [];
  const nest = {} as any;
  nest.run = () => {
    const { components } = connectedComponents(graph);
    const componentNodes = {} as any;
    let minRank = Infinity;
    let rootId = 0;
    graph.getNodes().forEach((n: any) => {
      const nodeID = n.get('id');
      if (componentNodes[components[nodeID]] === undefined) {
        componentNodes[components[nodeID]] = [];
      }
      componentNodes[components[nodeID]].push(n);
      minRank = Math.min(minRank, n.get('rank'));
    });
    const topNodes: (Node | NodeStructure)[] = [];

    Object.keys(componentNodes).forEach((c: string) => {
      let minRankComponent = Infinity;
      let minRankNode: Node | NodeStructure;
      componentNodes[c].forEach((n: Node | NodeStructure) => {
        if (n.get('rank') < minRankComponent) {
          minRankComponent = n.get('rank');
          minRankNode = n;
        }
      });
      topNodes.push(minRankNode!);
      componentNodes[c].forEach((n: Node | NodeStructure) => {
        n.set('rank', n.get('rank') - minRankComponent);
      });
    });
    Object.keys(componentNodes).forEach((c: string) => {
      topNodes.push(componentNodes[c][0]);
    });
    const id = `_DAGRoot_${rootId}`;
    rootId++;
    const dummyNode = graph.add(
      'node',
      {
        id,
        rank: minRank - 1,
        width: 0,
        height: 0,
        dummy: true,
        root: true,
      },
      true
    );
    dummyNodes.push(dummyNode);
    topNodes.forEach((n: Node | NodeStructure) => {
      const dummyEdge = graph.add(
        'edge',
        {
          source: id,
          target: n.get('id'),
          dummy: true,
        },
        true
      );
      dummyEdges.push(dummyEdge);
    });
  };
  nest.cleanup = () => {
    dummyEdges.forEach((e: any) => {
      graph.remove(e);
    });
    // 先删除边
    dummyNodes.forEach((n: any) => {
      graph.remove(n);
    });
  };
  return nest;
}
