import {
  Graph,
  panZoom,
  dragCanvas,
  dragNode,
  Edge,
  highlightRelations,
  defaultForces,
  ForceLink,
  Node
} from '../../../src';
import raw from '../../static/1.json';
const data = {
  nodes: raw.nodes.map((node: any) => {
    return { ...node, id: node.page_btm_id };
  }),
  edges: raw.edges.map((edgeData: any) => {
    return {
      ...edgeData,
      source: edgeData.source_page_btm_id,
      target: edgeData.target_page_btm_id,
    };
  }),
};
// 可以尝试切换数据
// const color = [
//   '#4c72b0',
//   '#dd8452',
//   '#25a868',
//   '#c44e52',
//   '#8172b3',
//   '#937860',
//   '#da8bc3',
//   '#8c8c8c',
//   '#ccb974',
//   '#64b5cd',
//   '#a305e5',
//   '#000000',
//   '#d0ff8f',
// ];

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);
  const minimapDiv = document.createElement('div');
  minimapDiv.style.position = 'absolute';
  minimapDiv.style.left = '9px';
  minimapDiv.style.top = '74px';
  minimapDiv.style.border = '1px solid #666';
  minimapDiv.style.backgroundColor = '#fff';
  document.body.append(minimapDiv);

  // let colorMap = {};
  // let index = 0;

  const forces = defaultForces(data.edges, 400, 300);
  const forceLink = new ForceLink({
    edges: data.edges,
    options: { distance: 300 },
  });
  forces.set('link', forceLink);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    autoLayout: true,
    layout: {
      type: 'force',
      options: {
        forces,
        maxIteration: 300, // 总迭代次数
        tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
        clearOnEndOnFirstCall: true,
        onTick: () => {
          graph.refresh(); // 刷新画布
        },
        onEnd: () => {
          graph.fitView();
        },
      },
    },
    setDefaultNode(node) {
      return {
        id: node.page_btm_id,
        type: 'circle',
        width: 15,
        height: 15,
        fillStyle: '#5678D6',
        strokeStyle: null,
        label: {
          text: `${node.id}`,
          fillStyle: '#21252C',
          strokeStyle: '#fff',
          fontSize: 10,
          lineWidth: 1,
          textAlign: 'center',
          textBaseline: 'middle',
        },
      };
    },
    // 定制节点样式
    setNodeStateStyles(state, nodeData, node) {
      const label = node.getLabel();
      if (state === 'click') {
        label.set('opacity', 1);
        return {
          fillStyle: '#EB8D2F',
          opacity: 1,
        };
      }
      if (state === 'active') {
        label.set({
          fillStyle: '#21252C',
          strokeStyle: '#fff',
          opacity: 1,
        });
        return {
          opacity: 1,
        };
      }
      if (state === 'blur') {
        label.set('opacity', 0.2);
        return { opacity: 0.2 };
      }
    },
    setDefaultEdge(edgeData) {
      return {
        strokeStyle: '#C9CDD4',
        label: {
          text: edgeData.pv_sum,
          strokeStyle: '#fff',
          autoRotate: true,
          opacity: 0,
          position: 1,
        },
      };
    },
    setEdgeStateStyles(state, edgeData, edge) {
      if (state === 'active') {
        return {
          strokeStyle: '#1E54C9',
        };
      }
      if (state === 'focus') {
        return {
          strokeStyle: '#3073F2',
        };
      }
      return { opacity: 0.2 };
    },
  });
  // 写入数据
  graph.data(data);
  // 添加交互
  graph.addBehavior(highlightRelations, { trigger: 'click' });
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode, {
    // 定义拖拽节点的动作会令力导向布局重启
    onDrag: (node: Node, x: number, y: number) => {
      node.set('fx', node.get('x'));
      node.set('fy', node.get('y'));
      graph.get('layout').setOptions({ maxIteration: 100, tickIterations: 1 });
    },
    onDrop: (node: Node) => {
      node.set('fx', undefined);
      node.set('fy', undefined);
      graph.get('layout').setOptions({ maxIteration: 100, tickIterations: 1 });
    },
    delegate: false,
  });

  let clickedNode: any = null;
  graph.on('node:click', (e) => {
    if (clickedNode) {
      clickedNode.removeState('click');
    }
    clickedNode = e.target;
    graph.getEdges().forEach((edge: Edge) => {
      edge.getLabel()?.set('opacity', 0);
    });
    clickedNode.edges.forEach((edge: Edge) => {
      if (edge.get('source') === clickedNode.get('id')) {
        edge.getLabel()?.set('opacity', 1);
      }
    });
    e.target.setState('click');
  });

  // const minimap = new Minimap(graph, {
  //   container: minimapDiv,
  //   width: 200,
  //   height: 150,
  //   type: 'delegate',
  //   getNodeStyles(node) {
  //     return {
  //       fillStyle: node.get('fillStyle'),
  //       r: 10,
  //     };
  //   },
  // });
})();

// function dealData(data: any) {
//   const nodes = data.nodes;
//   nodes.forEach((node: any) => {
//     node.id = node.name;
//   });
//   data.links.forEach((edge: any) => {
//     edge.source = nodes[edge.source].id;
//     edge.target = nodes[edge.target].id;
//   });
//   data.edges = data.links;
//   return data;
// }
