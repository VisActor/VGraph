import {
  Graph,
  panZoom,
  dragCanvas,
  dragNode,
  CategoryLegend,
  NodeConfigs,
  EdgeConfigs,
  LAYOUT_TYPES,
} from '../../../src';
import miserablesRaw from '../../static/miserables.json';
import viscoauthorRaw from '../../static/visCoauthor.json';
import raw from '../../static/data.json';

const misData = miserablesRaw;
const visData = dealData(viscoauthorRaw);
const nodes = [] as NodeConfigs[];
const edges = [] as EdgeConfigs[];
for (let i = 0; i < 9000; i++) {
  nodes.push({ id: i + '' });
}
for (let i = 1; i < 9000; i++) {
  edges.push({
    source: '0',
    target: i + '',
  });
}
let data:any = raw;

const color = [
  '#5678D6', '#EB8D2F', '#59A649', '#E0BA2D', '#A56AAD', '#6DBEC9', '#D95145', '#A0A0AD', '#94674E', '#ED848F'
];

const edgeColors = [
  '#C9CDD4', '#A9AEB8', '#E1E4EB', '#88929E', '#F0F2F5', '#6E7B8A'
];


const MAX_SHOW_EDGE_COUNT = 1000;

(() => {
  const btn = document.createElement('button');
  btn.textContent = 'toggle data';
  document.body.appendChild(btn);
  const div = document.createElement('div');
  div.style.position = 'relative';
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  div.style.height = '600px';
  document.body.append(div);


  const nodeLegend = document.createElement('div');
  nodeLegend.style.position = 'absolute';
  nodeLegend.style.right = '100px';
  nodeLegend.style.bottom = '0px';
  nodeLegend.style.display = 'inline-block';
  nodeLegend.style.border = '1px solid #666';
  document.body.appendChild(nodeLegend);

  const edgeLegend = document.createElement('div');
  edgeLegend.style.position = 'absolute';
  edgeLegend.style.right = '0px';
  edgeLegend.style.bottom = '0px';
  edgeLegend.style.display = 'inline-block';
  edgeLegend.style.border = '1px solid #666';
  document.body.appendChild(edgeLegend);


  btn.onclick = () => {
    if (data === visData) {
      data = misData;
    } else {
      data = visData;
    }
    hideEdge = data.nodes.length > MAX_SHOW_EDGE_COUNT;
    colorMap = {};
    len = 0;
    graph.data(data);
  };

  let hideEdge = data.nodes.length > MAX_SHOW_EDGE_COUNT;
  let colorMap = {};
  let count = 0;
  let len = 0;

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    linkCenter: false,
    layout: {
      type: 'force',
      options: {
        autoFDP: true,
        maxIteration: 300, // 总迭代次数
        tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
        onTick: () => {
          graph.refresh(); // 刷新画布
        },
        onEnd: () => {
          graph.fitView();
        },
      },
    },
    setDefaultNode(node) {
      let fillStyle = color[0];
      if (node.group !== undefined) {
        if (colorMap[node.group]) {
          fillStyle = colorMap[node.group];
        } else {
          fillStyle = color[len % 10];
          len++;
          colorMap[node.group] = fillStyle;
        }
      }
      return {
        type: 'circle',
        width: 30,
        height: 30,
        strokeStyle: null,
        group: node.group || 0,
        fillStyle,
      };
    }, // 定制节点样式
    setNodeStateStyles(state, node) {
      if (state === 'hover') {
        return {
          strokeStyle: node.fillStyle,
          lineWidth: 2,
          opacity: 0.5,
        }
      }
      if (state === 'blur') {
        return { opacity: 0.2 };
      }
    },
    setDefaultEdge(edgeData: any) {
      count++;
      return {
        // strokeStyle: edgeColors[count % 6],
        strokeStyle: edgeColors[0],
        type: count % 6,
        label: {
          text: `${edgeData.source}-${edgeData.target}`,
          autoRotate: true,
          fillStyle: '#545454',
          strokeStyle: '#fff',
          lineWidth: 3,
          opacity: 0,
        },
      };
    },
    setEdgeStateStyles(state, edgeData: any, edge: any) {
      const label = edge.getLabel();
      // label.capture = false;
      label.set('opacity', 1);
      if (state === 'blur') {
        label.set('opacity', 0);
        return { strokeStyle: '#F0F2F5' };
      }
      if (state === 'active') {
        return { strokeStyle: '#475466' };
      }
      if (state === 'click') {
        return { strokeStyle: '#475466' };
      }
    },
  });
  // 写入数据
  graph.data(data);
  // 添加交互
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  if (hideEdge) {
    graph.getEdges().forEach((edge: any) => {
      edge.layer.set('opacity', 0);
    });
  }

  let activeNode:any;

  // hover 节点反馈
  graph.on('node:mouseenter', (e: any) => {
    e.target.setState('hover');
  });

  graph.on('node:mouseleave', (e: any) => {
    e.target.removeState('hover');
  });

  // 点击节点反馈
  graph.on('node:click', (e: any) => {
    const node = e.target;
    console.log(node);
    if (activeNode && hideEdge) {
      activeNode.edges.forEach((edge: any) => {
        edge.layer.set('opacity', 0);
      });
    }
    activeNode = node;
    graph.set('autoDraw', false);
    graph.getNodes().forEach((node: any) => {
      node.setState('blur');
    });
    if (!hideEdge) {
      graph.getEdges().forEach((edge:any) => {
        edge.setState('blur', true);
      });
    }
    node.edges.forEach((edge: any) => {
      edge.toFront();
      if (edge.layer.get('opacity') === 0) {
        edge.getLabel()?.set('opacity', 1);
        edge.layer.set('opacity', 1);
      } else {
        edge.setState('active', true);
      }
      edge.source.clearStates();
      edge.target.clearStates();
    });
    graph.set('autoDraw', true);
    graph.draw();
  });

  // 点击空白处恢复
  graph.on('canvas:click', () => {
    graph.getNodes().forEach((node: any) => {
      node.clearStates();
    });
    if (hideEdge) {
      activeNode?.edges.forEach((edge: any) => {
        edge.layer.set('opacity', 0);
      });
    } else {
      graph.getEdges().forEach((edge: any) => {
        edge.getLabel()?.set('opacity', 0);
        edge.clearStates();
      });
    }
  });

  let activeEdge:any;
  graph.on('edge:click', e => {
    if (activeEdge) {
      activeEdge.getLabel()?.set('opacity', 0);
      activeEdge.removeState('active');
    }
    e.target.setState('active');
    activeEdge = e.target;
  });

  new CategoryLegend(graph, {
    container: nodeLegend,
    encodeAttr: 'group',
    target: 'node',
    maxLabelWidth: 50,
    responsive: true,
    encodeStyles(nodeData) {
      return {
        marker: {
          type: 'circle',
          fillStyle: nodeData.fillStyle,
        },
        label: {
          text: 'group' + nodeData.group + '222222222222222',
          fillStyle: '#1d2129',
        },
      };
    },
    width: 80,
    height: 260,
    hover: {
      enable: true,
      // graphActiveState: 'hover',
      // graphBlurState: 'blur',
    },
    click: {
      enable: true,
      multiple: true,
      filter: true,
    },
    setLegendStateStyles(state: string, markerData: any) {
      if (state === 'hover') {
        return {
          strokeStyle: markerData.fillStyle,
          lineWidth: 3,
          textStyles: {
            opacity: 0.6
          },
        };
      }
    },
  });

  new CategoryLegend(graph, {
    container: edgeLegend,
    encodeAttr: 'type',
    target: 'edge',
    responsive: true,
    encodeStyles(nodeData) {
      return {
        marker: {
          type: 'rect',
          fillStyle: nodeData.strokeStyle,
          strokeStyle: null,
          width: 10,
          height: 10,
        },
        label: {
          text: 'type' + nodeData.type,
          fillStyle: '#1d2129',
        },
      };
    },
    width: 100,
    height: 280,
    hover: {
      enable: true,
      graphActiveState: '',
    },
    click: {
      enable: true,
      filter: true,
      multiple: true,
    },
    setLegendStateStyles(state: string, markerData: any) {
      if (state === 'active') {
        return {
          strokeStyle: markerData.fillStyle ? markerData.fillStyle : '#ccc',
          lineWidth: 3,
          textStyles: {
            opacity: 0.7
          },
        };
      }
    },
  });

  graph.on('click', e => {
    console.log(e.relatedTarget);
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
