import {
  Graph,
  panZoom,
  dragCanvas,
  ForceDirectedLayout,
  dragNode,
  autoFDP,
  Edge,
  highlightRelations,
  showDetails,
} from '../../src';
import california from '../static/california.json';

const data = {
  nodes: california.nodes.map((node: any) => {
    return { id: node.id + '' };
  }),
  edges: california.links.map((edge: any) => {
    return {
      source: edge.source + '',
      target: edge.target + '',
      type: Math.round(Math.random() * 5)
    };
  })
};

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);
  const btn = document.createElement('button');
  btn.textContent = 'toggle data';
  div.appendChild(btn);

  btn.onclick = () => {
    graph.getEdges().forEach((edge: Edge) => {
      edge.hide();
    });
    const fdp = new ForceDirectedLayout({
      // 力导布局部分
      graph,
      forces,
      maxIteration: 100, // 总迭代次数
      onTick: () => {
        graph.refresh(); // 刷新画布
        graph.draw();
      },
      onEnd: () => {
        graph.getEdges().forEach((edge: Edge) => {
          edge.show();
        });
        graph.set('autoDraw', true);
        graph.draw();
      },
    });

    graph.addBehavior(dragNode, {
      // 定义拖拽节点的动作会令力导向布局重启
      onDrag: (node: any, x: number, y: number) => {
        node.set('fx', node.get('x'));
        node.set('fy', node.get('y'));
        fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
        fdp.restart();
      },
      onDrop: (node: any) => {
        node.set('fx', undefined);
        node.set('fy', undefined);
        fdp.setOptions({ maxIteration: 100, tickIterations: 1 });
        fdp.restart();
      },
      delegate: false,
    });
  };

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    linkCenter: false,
    setDefaultNode(node) {
      return {
        type: 'circle',
        width: 15,
        height: 15,
        fillStyle: '#5678D6',
        strokeStyle: null,
        label: {
          text: `${node.id}`,
          fillStyle: '#21252C',
          strokeStyle: '#fff',
          opacity: 0,
          fontSize: 12,
          lineWidth: 1,
          textAlign: 'center',
          textBaseline: 'middle',
        },
      };
    }, // 定制节点样式
    setNodeStateStyles(state, nodeData, node) {
      const label = node.getLabel();
      if (state === 'click') {
        label.set('opacity', 1);
        return {
          fillStyle: '#EB8D2F',
          opacity: 1
        }
      }
      if (state === 'active') {
        label.set({
          fillStyle: '#21252C',
          strokeStyle: '#fff',
          opacity: 1
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
    setDefaultEdge() {
      return {
        strokeStyle: '#C9CDD4',
      };
    },
    setEdgeStateStyles(state) {
      if (state === 'active') {
        return {
          strokeStyle: '#2E62F1',
        };
      }
      return { opacity: 0.2 };
    },
  });
  graph.set('autoDraw', false);
  // 写入数据
  graph.data(data);
  // 添加交互
  graph.addBehavior(panZoom, {
    keyShapeOnly: true,
    shouldHideEdge(edge: Edge) {
      return !edge.hasState('active');
    }
  });
  graph.addBehavior(dragCanvas, { keyShapeOnly: true });
  graph.addBehavior(showDetails, {
    showRatio: 1,
    setOpacity: false,
  });
  graph.addBehavior(highlightRelations, { trigger: 'click' });

  let clickedNode:any = null
  graph.on('node:click', (e) => {
    if (clickedNode) {
      clickedNode.removeState('click');
    }
    e.target.setState('click');
    clickedNode = e.target;
  });
  const { forces, zoomRatio } = autoFDP(graph, {
    nodeSize: 15,
    graphSize: [800, 600],
  });
  graph.setMatrix([1, 0, 0, 1, 0, 0]);
  graph.scale(zoomRatio * 1.25, [400, 300]);
})();

