import {
  dragCanvas,
  Graph,
  panZoom,
  registerNode,
  Layer,
  Node,
  dragNode,
  TagUtils,
  Text,
  GraphEvent,
  Edge,
} from '../../../src';
import datata from '../../static/duplicate_edges.json';
// import data1 from '../../static/syntax_tree.json';
// import data2 from '../../static/flow.json';
// import data3 from '../../static/dag_mock3.json';
// import data4 from '../../static/dag_mock4.json';
// import data5 from '../../static/dag_mock5.json';

// (data1 as any).edges = data1.links.map(n => n);
// const minNodes:any = [];
// const nodeMap = {};
// data1.nodes.forEach((node: any) => {
//   nodeMap[node.id] = node;
// });

// (data1 as any).edges.forEach((edge: any) => {
//   if (nodeMap[edge.source]) {
//     minNodes.push(nodeMap[edge.source]);
//     nodeMap[edge.source] = undefined;
//   }
//   if (nodeMap[edge.target]) {
//     minNodes.push(nodeMap[edge.target]);
//     nodeMap[edge.target] = undefined;
//   }
// });

const data = {
  nodes: [
    {
      id: '0-0',
      label: 'sda',
    },
    {
      id: '0-1',
      label: 'sda',
    },
  ],
  edges: [
    {
      source: '0-0',
      target: 'g-2',
    },
  ],
  groups: [
    {
      id: 'g-1',
      children: ['0-0'],
    },
    {
      id: 'g-2',
      children: ['0-1'],
    },
  ],
};

// (data1 as any).nodes = minNodes;
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
  const colors = ['#33d6cc', '#ffbc0a', '#ed55b0', '#33d6cc', '#8a77ed', '#5dcd81'];

  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.1,
    maxRatio: 8,
    autoLayout: true,
    layout: {
      type: 'dag',
      options: {
        rankDir: 'LR',
        nodeSep: 20,
        edgeSep: 10,
        rankSep: 50,
      },
    },
    setDefaultNode(node: any) {
      return {
        // type: 'stats',
        type: 'tagNode',
        // color: colors[Math.round(Math.random() * 5)],
        width: 140,
        height: 32,
        radius: 12,
        label: undefined,
        color: backgroundColor[Math.random() >= 0.5 ? 0 : 1],
        // label: node.id + '',
        strokeStyle: '#eee',
        // lineDash: node.id.length > 2 ? [5, 5] : null,
        // text: node.id ?? 'null',
        // color: colors[Math.round(Math.random() * 5)],
        // label: {
        //   // width: 80,
        //   text: node.id ?? node.id ?? 'null',
        //   fontSize: 10,
        //   // textBaseline: 'middle',
        //   // textAlign: 'center',
        // },
        children: [1, 2, 3],
        rectWidth: 20,
        anchors: [
          [0.0, 0.5],
          [1.0, 0.5],
          // [0.5, 0],
          // [0.5, 1.0],
        ],
        // icons: [{
        //   show: 'always',
        //   setStyles() {
        //     return { fillStyle: '#666', icon: '&#xe77a;', left: 0, top: -26 };
        //   },
        // }]
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      if (state === 'hide') {
        return { fillStyle: data.color };
      }
      if (state === 'blur') {
        // blur 状态下给整个节点添加透明度
        node.setOpacity(0.2);
        return undefined;
      } else {
        // 非 blur 状态下恢复节点透明度
        node.setOpacity(1);
        return undefined;
      }
    },
    setDefaultEdge(edge: any) {
      return {
        id: edge.source + '-' + edge.target,
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
    setEdgeStateStyles(state: string) {
      if (state === 'blur') {
        return {
          opacity: 0.3,
        };
      }
    },
    setDefaultGroup(group: any) {
      return {
        linkNode: true,
        fillStyle: '#F3F9FF',
        strokeStyle: '#3073F2',
        padding: 10,
        anchors: [
          // [0, 0.5],
          // [1, 0.5],
          // [0.5, 0],
          // [0.5, 1.0],
        ],
      };
    },
  });
  // const groups = datata.groups;
  // datata.groups = [];
  graph.data(datata);
  graph.fitView();
  // console.log(graph.getNodes().map(d=>d.configs));
  (window as any).__graph = graph;
  // dealRepeatEdge(new GraphStructure(data2).getEdges() as any, 4);
  // console.log(graph.getEdges().map((d) => d.configs));

  // graph.updateData(graphData.getData());
  // console.log(graphData);
  // graph.getEdgeById('1-2').updateData({ controlPoints: null });
  // graph.getEdges().forEach((edge: any) => {
  //   edge.hide();
  // });
  // const bbox = graph.container.getBBox();
  // graph.translate(-bbox.left, -bbox.top);
  // graph.draw();
  graph.addBehavior(panZoom, { sensitivity: 5 });
  //graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: 'hide' });
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  (window as any).graph = graph;
  graph.draw();

  // graph.downloadImage();

  graph.on('node:mouseenter', (e: GraphEvent) => {
    const node = e.target as Node;
    const nodeId = node.get('id');
    const autoDraw = graph.disableAutoDraw();
    graph.getNodes().forEach((n) => {
      if (n !== node) {
        n.setOpacity(0.2);
      }
    });
    graph.getEdges().forEach((edge: Edge) => {
      if (edge.get('source') !== nodeId && edge.get('target') !== nodeId) {
        edge.setState('blur');
      }
    });
    // 高亮鼠标 hover 到节点的全部路径
    const visited = {};
    const dfs = (id: string, direction: 'sources' | 'targets') => {
      const n = graph.getNodeById(id);
      n.setOpacity(1.0);
      n.edges.forEach((edge: Edge) => {
        if ((direction === 'sources' ? edge.target : edge.source) === n) {
          edge.removeState('blur');
        }
      });
      n[direction].forEach((id: string) => {
        if (visited[id] !== true) {
          visited[id] = true;
          dfs(id, direction);
        }
      });
    };
    dfs(nodeId, 'sources');
    dfs(nodeId, 'targets');
    graph.enableAutoDraw(autoDraw);
  });

  graph.on('node:mouseleave', (e: GraphEvent) => {
    graph.getNodes().forEach((node) => {
      node.setOpacity(1.0);
    });
    graph.getEdges().forEach((edge: Edge) => {
      edge.clearStates();
    });
  });

  graph.on('node:click', (e) => {
    const node = e.target;
    graph.set('autoLayout', false);
    // 记录节点原本的位置，用于布局后恢复定位，固定用户操作焦点
    // const position = getNodeRelativePos(node);
    const autoDraw = graph.disableAutoDraw();
    if (node.get('collapsed')) {
      expand(node);
    } else {
      const data = collapse(node);
      console.log(data);
      node.set('hideData', data);
    }
    graph.set('autoLayout', true);
    graph.layout(node.get('id'));
    graph.enableAutoDraw(autoDraw);
    // 将被操作节点移回原位
    // const currentPos = getNodeRelativePos(node);
    // graph.translate(position.x - currentPos.x, position.y - currentPos.y);

  });

  function collapse(node: Node) {
    node.set('collapsed', true);

    const nodeRank = node.get('rank');
    let nodes: any = [];
    let edges: any = [];
    const targets = nodeRank > 0 ? node.targets : node.sources;
    for (let i = targets.length - 1; i >= 0; i--) {
      const id = targets[i];
      const hideData = getNodeData(graph.getNodeById(id), nodeRank);
      if (hideData) {
        nodes = nodes.concat(hideData.nodes);
        edges = edges.concat(hideData.edges);
      }
    }
    return { nodes, edges };
  }

  function getNodeData(node: Node, rank: number) {
    let nodes: any = [];
    const nodeId = node.get('id');
    // DagLayout 会在节点上写入 rank 字段用于表名节点所在层级，根据 rank 单向收起节点避免遇到环死循环
    const nodeRank = node.get('rank');
    if ((rank > 0 && nodeRank < rank) || (rank < 0 && nodeRank > rank)) {
      return;
    }
    let edges: any = [];
    node.edges.forEach((edge: any) => {
      const sourceRank = graph.getNodeById(edge.get('source')).get('rank');
      const targetRank = graph.getNodeById(edge.get('target')).get('rank');
      if (
        (rank > 0 && edge.get('target') === nodeId) ||
        (rank < 0 && edge.get('source') === nodeId) ||
        sourceRank > targetRank
      ) {
        edges.push(edge.configs);
      }
    });
    const targets = nodeRank > 0 ? node.targets : node.sources;
    for (let i = targets.length - 1; i >= 0; i--) {
      const hideData = getNodeData(
        graph.getNodeById(targets[i]),
        node.get('rank')
      );
      if (hideData) {
        nodes = nodes.concat(hideData.nodes);
        edges = edges.concat(hideData.edges);
      }
    }
    nodes.push(node.configs);
    graph.remove(node);
    return { nodes, edges };
  }

  function expand(node: Node) {
    node.set('collapsed', false);
    const { nodes, edges } = node.get('hideData');
    // 将删除的节点和连线恢复
    nodes.forEach((nodeData: any) => {
      graph.add('node', nodeData);
    });

    edges.forEach((edgeData: any) => {
      graph.add('edge', edgeData);
    });
  }

})();
