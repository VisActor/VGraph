import {
  dragCanvas,
  Graph,
  hideDetails,
  panZoom,
  registerNode,
  Layer,
  Node,
  dragNode,
  TagUtils,
  Text,
  GraphEvent,
  Edge,
  DAGLayout,
} from '../../src';
import { data } from '../static/data2';
const backgroundColor = ['rgba(0,156,229,0.15)', 'rgba(239,6,0, 0.15)'];
const color = ['rgb(0,72,115)', 'rgb(132,0,10)'];

registerNode('tagNode', {
  type: 'tagNode',
  extends: 'rect',
  drawCurrentLabel: false,
  getConfigsForShape(data: any) {
    return data;
  },
  shape(layer: Layer, configs: any) {
    const left = -configs.width / 2 + 6;
    const index = backgroundColor.indexOf(configs.color);
    let tagWidth = 0;
    if (configs.service_type) {
      const tag = TagUtils.initTag(layer, {
        text: configs.service_type,
        left,
        top: -configs.height / 2 + 6,
        label: { fillStyle: color[index] },
        background: { fillStyle: backgroundColor[index] },
      });
      tagWidth = tag.getBBox().width;
    }
    const text = new Text({
      x: left + tagWidth + 4,
      y: 0,
      textAlign: 'left',
      text: configs.service_name || configs.id + '',
      width: configs.width - tagWidth - 16,
      textOverflow: 'ellipsis',
    });
    layer.add(text);
  },
});
(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.1,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: 'tagNode',
        width: 252,
        height: 32,
        radius: 12,
        label: null,
        color: backgroundColor[Math.random() >= 0.5 ? 0 : 1],
        strokeStyle: '#eee',
        children: [1, 2, 3],
        rectWidth: 20,
        anchors: [
          [0.0, 0.5],
          [1.0, 0.5],
        ],
      };
    },
    setDefaultEdge(edge: any) {
      return {
        // id: edge.source + '-' + edge.target,
        type: 'hLine',
        strokeStyle: '#ddd',
        endArrow: {
          type: 'arrow',
          style: 'triangleSolid',
          size: 10,
          strokeStyle: '#ddd',
        },
      };
    },
    setDefaultGroup(group: any) {
      return {
        linkNode: true,
        fillStyle: '#F3F9FF',
        strokeStyle: '#3073F2',
        padding: 10,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
      };
    },
  });
  graph.data(data);
  (window as any).__graph = graph;
  console.time();
  const layout = new DAGLayout({
    graph,
    rankDir: 'LR',
    nodeSep: 20,
    edgeSep: 30,
    rankSep: 50,
    allControlPoints: true,
    preOrder: true,
    align: 'UL',
  });
  console.timeEnd();
  // 先计算 其他节点的 order
  // TODO: 支持 orderOnly ？
  // 再为指定节点分配 order 为 -1
  // 再走 preOrder 强制预分配 order 节点顺序，并自动计算 dummy Node 顺序。

  // 主链上如果
  const dummies = mainChainInsertDummyNodes(graph);
  graph.getNodes().forEach((node) => {
    if (node.get('topOrder')) {
      node.set('_order', -1);
    } else {
      node.set('_order', node.get('_order'));
    }
  });
  graph.getGroups().forEach((group) => {
    if (group.get('topOrder')) {
      group.set('_order', -1);
    } else {
      group.set('_order', group.get('_order'));
    }
  });
  layout.options.preOrder = true;
  layout.options.order = 'none';
  layout.options.align = 'T';
  layout.layout();
  removeDummyNodes(dummies, graph);
  graph.refresh();
  graph.fitView();

  graph.addBehavior(panZoom, { sensitivity: 5 });
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);

  graph.draw();

  (window as any)._graph = graph;
})();

function mainChainInsertDummyNodes(graph: Graph) {
  const dummies = [] as any;
  const nodeMap = graph.getNodeMap();
  const edges = graph.getEdges();
  const len = edges.length;

  let dummyCnt = 0;
  for (let i = 0; i < len; i++) {
    const edge = edges[i];
    const sourceId = edge.get('source');
    const targetId = edge.get('target');
    const source = nodeMap[sourceId];
    const target = nodeMap[targetId];

    const sourceIsTopOrder = (source.belong ?? source).get('topOrder'); // 如有 belong 则取 Group 的 topOrder
    const targetIsTopOrder = (target.belong ?? target).get('topOrder');
    if (!sourceIsTopOrder || !targetIsTopOrder) {
      // 仅在主链之间插入。
      continue;
    }
    const sourceRank = parseInt(source.get('rank'), 10);
    const targetRank = parseInt(target.get('rank'), 10);
    if (Math.abs(sourceRank - targetRank) > 1) {
      const dummyConfig: any = {
        source: sourceId,
        target: targetId,
        nodes: [],
        relatedEdge: (edge as Edge).configs ? (edge as Edge).configs : edge,
      };
      dummies.push(dummyConfig);
      let upNode = sourceRank > targetRank ? target : source;
      let rank = (sourceRank > targetRank ? targetRank : sourceRank) + 1;
      target._dummy = true;
      while (rank !== Math.max(sourceRank, targetRank)) {
        const id = '_mock_dummy' + dummyCnt;
        dummyCnt++;
        const dummyNode = graph.add(
          'node',
          {
            id,
            rank,
            width: 0,
            height: 0,
            dummy: true,
            _order: -1,
          },
          false
        );
        dummyConfig.nodes.push(dummyNode);
        graph.add(
          'edge',
          {
            source: upNode.get('id'),
            target: id,
            dummy: true,
          },
          false
        );
        rank++;
        upNode = dummyNode;
      }
      graph.add(
        'edge',
        {
          source: upNode.get('id'),
          target: sourceRank > targetRank ? source.get('id') : target.get('id'),
          dummy: true,
        },
        false
      );
      graph.remove(edge as any);
    }
  }
  return dummies;
}

function removeDummyNodes(dummies: any[], graph: Graph) {
  dummies.forEach((dummyConfigs: any) => {
    const edge = dummyConfigs.relatedEdge;
    const dummies = dummyConfigs.nodes;
    dummies.forEach((node: any, i: number) => {
      graph.remove(node);
    });
    const e = graph.add('edge', edge);
    e.set('controlPoints', null);
  });
}
