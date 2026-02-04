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
  Circle,
  Shape,
  Rect,
  GroupUtils,
  Group,
  GraphEvent,
  dragEdge,

} from '../../../src';
import { assignPosition, fastrand } from '../../../src/layouts';
import viscoauthorRaw from '../../static/visCoauthor.json';
import miserablesRaw from '../../static/miserables.json';
import { isDragDist } from '../../../src/utils';

const color = [
  '#4c72b0',
  '#dd8452',
  '#25a868',
  '#c44e52',
  '#8172b3',
  '#937860',
  '#da8bc3',
  '#8c8c8c',
  '#ccb974',
  '#64b5cd',
  '#a305e5',
  '#000000',
  '#d0ff8f',
  '#cccccc',
];

const rand = fastrand();
rand.setSeed(42);
const DATA_NAME = 'viscoauthor' as 'miserables' | 'viscoauthor';
const SHAPE_TYPE = 'circle' as 'circle' | 'rect';
const initStatus = 'expand' as 'collapse' | 'expand';
let data;
if (DATA_NAME === 'miserables') {
  data = JSON.parse(JSON.stringify(miserablesRaw));
} else {
  data = dealData(JSON.parse(JSON.stringify(viscoauthorRaw)));
}
function mockData(data: any) {
  for (const node of data.nodes) {
    if (node.group === 0) {
      node.group = 11;
    }
    if (rand() < 0.05) {
      node._group = node.group;
      node.group = undefined;
    }
  }
}
mockData(data);
const shapeVisible = {};

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
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
        type: 'circle',
        width: nodeData.width ?? 10,
        height: nodeData.height ?? 10,
        strokeStyle: '#fff',
        fillStyle: color[group >= 0 ? group % 13 : 13],
      };
    }, // 定制节点样式
    setNodeStateStyles(state) {
      if (state === 'active') {
        return {
          opacity: 1.0,
        };
      }
      return { opacity: 0.2 };
    },
    setDefaultEdge() {
      return {
        strokeStyle: '#ccc',
      };
    },
    setEdgeStateStyles(state) {
      if (state === 'active') {
        return {
          strokeStyle: '#A7A7A7',
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
  const combos = combosFunc(data, graph);
  const collapsableData = GroupUtils.getCollapsableData({
    nodes: data.nodes,
    edges: data.edges,
    groups: combos.groups,
  });

  graph.data(collapsableData);
  for (const node of graph.getNodes()) {
    if (node.get('childNodes')) {
      if (initStatus === 'collapse') {
        shapeVisible[node.get('id')] = false;
      } else {
        shapeVisible[node.get('id')] = true;
        GroupUtils.expandGroupNode(graph, node);
      }


    }
  }
  // graph.getEdgeContainer().toBack();
  // 添加交互
  graph.addBehavior(highlightRelations);
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  // graph.addBehavior(dragNode);

  const x = 800 / 2;
  const y = 600 / 2;
  const groupCollision = groupCollisionFunc(graph, combos.comboNames, combos.groupsMap);
  (graph as any)._groupCollision = groupCollision;
  const forces = {
    link: new ForceLink({ edges: data.edges, options: { distance: 0 } }), // 力导向吸引力
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
      iterationCallback: groupCollision.moveGroup,
    }),
    center: new ForceCenter({ options: { x, y } }),
  };
  combos.addGroupShapes();

  const fdp = new ForceDirectedLayout({
    // 力导布局部分
    graph,
    forces,
    maxIteration: 300, // 总迭代次数
      tickIterations: 10, // 每次 tick 的迭代次数，意味着总共 300/10 = 30 次 tick，对应刷新画布的次数也是 30 次
    onTick: () => {
      combos.updateShapes();
      graph.refresh(); // 刷新画布
    },
    onEnd: () => {
      combos.updateShapes();
      graph.refresh();
      graph.fitView(); // 居中并缩放适应画布
    },
  });
  (graph as any)._fdp = fdp;
  // graph.removeBehavior('dragNode');
  graph.addBehavior(dragNode, {
    // 定义拖拽节点的动作会令力导向布局重启
    onDrag: (node: any, x: number, y: number) => {
      node.configs.fx = node.configs.x;
      node.configs.fy = node.configs.y;
      fixCombo = node.configs.group;
      fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
      fdp.restart();
    },
    onDrop: (node: any) => {
      node.configs.fx = undefined;
      node.configs.fy = undefined;
      fixCombo = '';
      fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
      fdp.restart();
    },
    delegate: false,
  });
  graph.addBehavior(dragEdge, {
    delegate: false,
  });

  const win = window as any;
  win.__graph = graph;
  win.__fdp = fdp;

  graph.on('node:dblclick', (e) => {
    const node = e.target;
    // 有收起的节点，并且点击的是节点上的 icon
    if (node.get('childNodes')) {
      expand(node, graph, combos, fdp);
      return;
    }
    // 如果有点击节点的其他交互在这里实现
  });

  return function cleanup() {
    graph.destroy();
  };
})();

let fixCombo = '';
function combosFunc(data: any, graph: Graph) {
  function getCombos(data: any) {
    const clusterMapping = (d: any) => d.group;
    const comboNames = new Set(data.nodes.map(clusterMapping).filter((d: any) => d !== undefined));
    const groups = [] as any;
    const groupsMap = new Map();
    comboNames.forEach((comboName: any) => {
      groupsMap.set(comboName, []);
    });
    data.nodes.forEach((node: any) => {
      const comboName = clusterMapping(node);
      if (comboName !== undefined) {
        groupsMap.get(comboName).push(node);
      }
    });
    comboNames.forEach((comboName: any) => {
      const length = groupsMap.get(comboName).length;
      groups.push({
        id: comboName,
        group_id: comboName,
        width: Math.max(10, 10 * Math.sqrt(length)),
        height: Math.max(10, 10 * Math.sqrt(length)),
        children: groupsMap.get(comboName).map((node: any) => node.id),
      });
    });
    return { comboNames, groupsMap, groups };
  }
  const { comboNames, groupsMap, groups } = getCombos(data);
  let shapeMap = {} as any;
  function addGroupShapes() {
    const addShape = (rc: number, comboName: any) => {
      let shape = null as unknown as Shape;
      if (SHAPE_TYPE === 'circle') {
        shape = new Circle({
          comboName,
          cx: 0,
          cy: 0,
          r: rc,
          opacity: 0.05,
          fillStyle: color[comboName >= 0 ? comboName % 13 : 12],
          lineWidth: 2,
          strokeStyle: '#7f7f7f',
        });
      } else {
        shape = new Rect({
          comboName,
          left: 0,
          top: 0,
          width: rc,
          height: rc,
          opacity: 0.05,
          fillStyle: color[comboName >= 0 ? comboName % 13 : 12],
          strokeStyle: '#7f7f7f',
        });
      }
      shape.capture = true;
      shape.on('dblclick', (e) => {
        const entity = e.relatedTarget ?? e.target;
        const group = graph.getGroupById(entity.configs.comboName);
        collapse(shape, group, graph);
      });
      graph.getContainer().add(shape as Shape);
      setDragShape(shape, graph, groupsMap);
      return shape;
    };
    shapeMap = {};
    comboNames.forEach((comboName: any) => {
      if (comboName >= 0) {
        const shape = addShape(0, comboName);
        shapeVisible[comboName] = true;
        shape.toBack();
        shapeMap[comboName] = shape;
      }
    });
    // graph.getEdgeContainer().toBack();
    // graph.getNodeContainer().toFront();
  }
  function updateShapes() {
    for (const comboName of Array.from(comboNames)) {
      if (!((comboName as number) >= 0)) {
        continue;
      }
      const shape = shapeMap[comboName as any];
      const group = groupsMap.get(comboName);
      const { x, y, r, width, height } = getGroupBox(group, false);
      if (SHAPE_TYPE === 'circle') {
        shape.set('cx', x || 400);
        shape.set('cy', y || 300);
        shape.set('r', r || 0);
      } else {
        shape.set('left', x - width / 2);
        shape.set('top', y - height / 2);
        shape.set('width', width);
        shape.set('height', height);
        shape.set('r', r);
      }
      const matrix = shape.getMatrix();
      matrix[4] = 0;
      matrix[5] = 0;
      shape.setMatrix(matrix);
    }
  }
  function showShape(id: string) {
    shapeMap[id].show();
  }
  function hideShape(id: string) {
    shapeMap[id].show();
  }
  return { comboNames, groupsMap, groups, addGroupShapes, updateShapes, showShape, hideShape };
}



function groupCollisionFunc(graph: Graph, comboNames: any, groupsMap: any) {
  let iteration = 0;
  let maxIteration = 0;
  const force = new ForceCollision({
    options:
      SHAPE_TYPE === 'circle'
        ? { radius: (d: any) => d.r }
        : { width: (d: any) => d.width, height: (d: any) => d.height },
  });
  function reset(max = 300) {
    iteration = 0;
    maxIteration = max;
  }
  function initDummyGroupNodes() {
    const dummyGroupNodes = [] as any;
    const nonGroupNodes = graph
      .getNodes()
      .map((node: any) => node.configs)
      .filter((node: any) => node.group === undefined); // 非 Group 的零落节点
    for (const node of nonGroupNodes) {
      if (shapeVisible[node.group]) {
        // 由 combo Node 替代
        continue;
      }
      const { x, y, width, height, r } = node;
      dummyGroupNodes.push({
        id: 'dummyGroupNodes_' + node.id,
        x,
        y,
        vx: 0,
        vy: 0,
        r: r ?? width + 10,
        width: width + 10,
        height: height + 10,
      });
      groupsMap.set('dummyGroupNodes_' + node.id, [node]);
    }
    comboNames.forEach((comboName: any) => {
      if (comboName !== undefined && shapeVisible[comboName]) {
        const group = groupsMap.get(comboName);
        const { x, y, width, height, r } = getGroupBox(group);
        const node = {
          id: comboName,
          x,
          y,
          r: r + 10,
          width: width + 10,
          height: height + 10,
          vx: 0,
          vy: 0,
          combo: true,
        };
        dummyGroupNodes.push(node);
      }
    });
    return dummyGroupNodes;
  }
  let dummyGroupNodes = initDummyGroupNodes();
  function updateDummyGroupNodes() {
    dummyGroupNodes = initDummyGroupNodes();
  }
  function moveGroup() {
    iteration++;
    if (iteration > maxIteration * 0.666) {
      updateDummyGroupNodes();
      force.initialize(dummyGroupNodes); // 半径的更新
      force.run(); // 虚拟节点的无重叠力的计算
      dummyGroupNodes.forEach((dummyNode: any) => {
        const comboName = dummyNode.id;
        const group = groupsMap.get(comboName);
        if (comboName !== fixCombo) {
          for (const node of group) {
            if (SHAPE_TYPE === 'circle') {
              const similarity = cosineSim(
                [node.x - dummyNode.x, node.y - dummyNode.y],
                [dummyNode.vx, dummyNode.vy],
                dummyNode.r
              );
              const alpha = Math.max(0.4, Math.min(1.0, -2 * similarity));
              node.vx += alpha * dummyNode.vx;
              node.vy += alpha * dummyNode.vy;
            } else {
              const left = dummyNode.x + dummyNode.vx - 0.5 * dummyNode.width;
              const right = dummyNode.x + dummyNode.vx + 0.5 * dummyNode.width;
              const top = dummyNode.y + dummyNode.vy - 0.5 * dummyNode.height;
              const bottom = dummyNode.y + dummyNode.vy + 0.5 * dummyNode.height;
              let vx = 0,
                vy = 0;
              if (node.x + node.vx < left) {
                vx = left - node.x - node.vx;
              } else if (node.x + node.vx > right) {
                vx = right - node.x - node.vx;
              }
              if (node.y + node.vy < top) {
                vy = top - node.y - node.vy;
              } else if (node.y + node.vy > bottom) {
                vy = bottom - node.y - node.vy;
              }
              const similarityX = (2.0 * vx) / dummyNode.vx || 0;
              const similarityY = (2.0 * vy) / dummyNode.vy || 0;
              const alphaX = Math.max(0.4, Math.min(1.0, similarityX));
              const alphaY = Math.max(0.4, Math.min(1.0, similarityY));

              node.vx += alphaX * dummyNode.vx;
              node.vy += alphaY * dummyNode.vy;
              // 不需要整体移动，越接近边缘的节点移动越多
            }
          }
        }
      });
    }
  }
  return { updateDummyGroupNodes, moveGroup, reset };
}

function expand(node: any, graph: Graph, combos: any, fdp: ForceDirectedLayout) {
  const center = { x: node.configs.x, y: node.configs.y };
  const highlight = graph.getBehavior('highlightRelations')!;
  highlight.recover();
  const group = GroupUtils.expandGroupNode(graph, node);
  assignPosition(center, group.configs.childNodes, true, 2);
  combos.showShape(group.get('id'));
  shapeVisible[group.get('id')] = true;
  fdp.updateData(graph);
  fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
  (graph as any)._groupCollision.reset(100);
  fdp.restart(1.0);
  graph.refresh();
}

function collapse(shape: Shape, group: Group, graph: Graph) {
  shapeVisible[shape.configs.comboName] = false;
  if (group) {
    group.configs.opacity = 1;
    const length = group.configs.childNodes.length;
    group.configs.width = Math.max(10, 10 * Math.sqrt(length));
    group.configs.height = Math.max(10, 10 * Math.sqrt(length));
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
    shape.hide();
    const fdp = (graph as any)._fdp;
    fdp.updateData(graph);
    fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
    (graph as any)._groupCollision.reset(100);
    fdp.restart(1.0);
    graph.refresh();
    graph.draw();
  }
}

function getGroupBox(group: any[], withVelocity = true) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const node of group) {
    minX = Math.min(minX, node.x + +withVelocity * node.vx - node.width / 2);
    maxX = Math.max(maxX, node.x + +withVelocity * node.vx + node.width / 2);
    minY = Math.min(minY, node.y + +withVelocity * node.vy - node.height / 2);
    maxY = Math.max(maxY, node.y + +withVelocity * node.vy + node.height / 2);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    width,
    height,
    r: Math.sqrt(width * width + height * height) / 2,
  };
}

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

function cosineSim(vec1: number[], vec2: number[], r: number) {
  const dotProduct = vec1[0] * vec2[0] + vec1[1] * vec2[1];
  const m2 = Math.sqrt(vec2[0] * vec2[0] + vec2[1] * vec2[1]);
  if (dotProduct === 0) {
    return 0;
  }
  return dotProduct / (r * m2);
}

// shape 的拖拽
let dragging = null as any;
function setDragShape(shape: Shape, graph: Graph, groupsMap: any) {
  function onMouseDown(ev: GraphEvent) {
    // const target = shape;
    if (dragging) {
      return;
    }
    dragging = {
      shape
    };
    shape.configs.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    if (!shape.configs.originPositions) {
      shape.configs.originPositions = {
        x: ev.clientX,
        y: ev.clientY,
      };
    }
  }
  function onMouseEnter() {
    return;
  }
  function onMouseLeave() {
    return;
  }

  function onMouseMove(ev: GraphEvent) {
    if (!dragging || shape !== dragging.shape) {
      return;
    }
    const highlight = graph.getBehavior('highlightRelations')!;
    const shouldTrigger = highlight.shouldTrigger;
    highlight.shouldTrigger = () => false;
    if (!shape.configs.lastPositions) {
      return;
    }
    const refresh = isDragDist(shape.configs.lastPositions, ev);
    if (refresh) {
      ev.target = shape as any;
      updatePosition(ev);
    }
    highlight.shouldTrigger = shouldTrigger;
    graph.draw();
  }
  function updatePosition(ev: GraphEvent) {
    const { x, y } = shape.configs.lastPositions;
    const scale = graph.getZoomRatio();
    const offsetX = (ev.clientX - x) / scale;
    const offsetY = (ev.clientY - y) / scale;
    shape.configs.lastPositions = {
      x: ev.clientX,
      y: ev.clientY,
    };
    shape.translate(offsetX, offsetY);
  }
  function updateChildren(ev: GraphEvent) {
    const group = groupsMap.get(shape.configs.comboName);
    const { x, y } = shape.configs.lastPositions;
    const scale = graph.getZoomRatio();
    const offsetX = (x - shape.configs.originPositions.x) / scale;
    const offsetY = (y - shape.configs.originPositions.y) / scale;
    const nodeMap = graph.getNodeMap();
    for (const node of group) {
      nodeMap[node.id].translate(offsetX, offsetY);
    }
  }
  function onMouseUp(ev: GraphEvent) {
    if (!dragging || shape !== dragging.shape) {
      return;
    }
    dragging = null;
    updatePosition(ev);
    updateChildren(ev);
    shape.configs.lastPositions = undefined;
    shape.configs.originPositions = undefined;
    const fdp = (graph as any)._fdp;
    fdp.updateData(graph);
    fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
    fdp.restart(1.0);
    (graph as any)._groupCollision.reset(100);
    graph.refresh();
    graph.draw();
    return;
  }
  shape.on('mousedown', onMouseDown);
  shape.on('mouseenter', onMouseEnter);
  shape.on('mouseleave', onMouseLeave);
  // 为提升体验，mousemove 应当是全局的而不仅仅是响应shape的。
  graph.on('mousemove', onMouseMove);
  document.body.addEventListener('mouseup', onMouseUp as any);
}
