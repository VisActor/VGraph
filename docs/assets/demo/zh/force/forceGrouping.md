---
category: examples
group: force
title: 力导向节点分组布局
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/forceGroupingDemo.gif
 link: force-spec/forceGrouping
option:
---
# 力导向节点分组布局

数据描述: 普通的力导向布局无法让不同分组避免重叠。VGraph 研发了一种适用于力导向布局的分组布局组件，避免分组之间的重叠。 <br>交互操作: <code>双击节点</code>展开分组节点 <code>双击GroupShape</code>分组聚合 <code>拖拽GroupShape</code>将分组节点移动至目标位置。<br><code>右键GroupShape</code>取消分组。<code>右键被取消分组的节点</code>重新分组。<code>右键空白区域</code>切换GroupShape的样式。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
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
  GroupUtils,
  ForceDirectedGrouping,
  assignPosition,
} from '@visactor/vgraph';

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

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

const style1 = (v) => ({
  fillStyle: 'rgba(255,255,255,0)',
  lineWidth: 4,
  strokeStyle: color[v >= 0 ? v % 13 : 12],
  opacity: 1.0,
});

const style2 = (v) => ({
  fillStyle: color[v >= 0 ? v % 13 : 12],
  opacity: 0.2,
});

let whichStyle = 0;
let nodeSize = 20;

const graph = new Graph({
  container: CONTAINER_ID,
  width,
  height,
  minRatio: 0.3,
  maxRatio: 8,
  linkCenter: true,
  setDefaultNode(nodeData) {
    const group = nodeData.group_id != null ? nodeData.group_id : nodeData.group;
    return {
      type: 'circle',
      width: nodeData.width != null ? nodeData.width : nodeSize,
      height: nodeData.height != null ? nodeData.height : nodeSize,
      strokeStyle: '#fff',
      fillStyle: color[group >= 0 ? group % 13 : 13],
    };
  },
  setNodeStateStyles(state) {
    if (state === 'active') {
      return { opacity: 1.0 };
    }
    return { opacity: 0.2 };
  },
  setDefaultEdge() {
    return { strokeStyle: '#ccc' };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return { strokeStyle: '#A7A7A7' };
    }
    return { opacity: 0.2 };
  },
  setDefaultGroup() {
    return {
      linkNode: true,
      opacity: 0,
      exactMatch: true,
    };
  },
});

fetch(
  'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18949c3ac3627.json'
)
  .then((response) => response.json())
  .then((data) => {
    if (data.links) {
      const nodes = data.nodes;
      nodes.forEach((node) => {
        node.id = node.name;
      });
      data.links.forEach((edge) => {
        edge.source = nodes[edge.source].id;
        edge.target = nodes[edge.target].id;
      });
      data.edges = data.links;
      nodeSize = 10;
    }
    graph.data(data);

    const x = width / 2;
    const y = height / 2;
    const fdGrouping = new ForceDirectedGrouping({
      graph,
      options: {
        shapeStyles: style1,
      },
    });

    const collapsableData = GroupUtils.getCollapsableData({
      nodes: data.nodes.map((d) => d),
      edges: data.edges.map((d) => Object.assign({}, d)),
      groups: Object.keys(fdGrouping.getGroups()).map((groupId) => {
        const children = fdGrouping.getGroups()[groupId];
        const length = children.length;
        return {
          id: groupId,
          group_id: groupId,
          children: children.map((d) => d.id),
          width: Math.max(nodeSize, nodeSize * Math.sqrt(length)),
          height: Math.max(nodeSize, nodeSize * Math.sqrt(length)),
        };
      }),
    });
    graph.updateData(collapsableData);

    graph.getNodes().forEach((node) => {
      if (node.get('childNodes')) {
        GroupUtils.expandGroupNode(graph, node);
      }
    });
    fdGrouping.updateData(graph);

    const forces = {
      link: new ForceLink({ options: { distance: 0 } }),
      manybody: new ForceManyBody({
        options: {
          strength: (node) => {
            if (node.children) {
              const length = node.children.length;
              return Math.min(-100 * length, -100);
            }
            return -100;
          },
        },
      }),
      attrCluster: new IntraClusterForce({ options: { strength: 0.2 } }),
      repulCluster: new InterClusterForce({ options: { strength: -10 } }),
      x: new ForceX({ options: { x, strength: 0.2 } }),
      y: new ForceY({ options: { y, strength: 0.2 } }),
      collision: new ForceCollision({
        options: {
          radius: (d) => d.r || d.width || 10,
          iterationCallback: fdGrouping.groupVelocity,
        },
      }),
      center: new ForceCenter({ options: { x, y } }),
    };

    const fdp = new ForceDirectedLayout({
      graph,
      forces,
      maxIteration: 300,
      tickIterations: 10,
      clearOnEndOnFirstCall: true,
      onTick: () => {
        fdGrouping.updateShapes();
        graph.refresh();
      },
      onEnd: () => {
        fdGrouping.updateShapes();
        graph.refresh();
        graph.fitView();
      },
    });

    graph.addBehavior(highlightRelations);
    graph.addBehavior(panZoom);
    graph.addBehavior(dragCanvas);
    graph.addBehavior(dragNode);

    fdGrouping.on('groupshape:dblclick', (ev) => {
      const shape = ev.target;
      const group = graph.getGroupById(shape.get('groupValue'));
      if (group) {
        group.configs.opacity = 1;
        const length = group.configs.childNodes.length;
        group.configs.width = Math.max(nodeSize, nodeSize * Math.sqrt(length));
        group.configs.height = Math.max(nodeSize, nodeSize * Math.sqrt(length));
        const groupNode = GroupUtils.collapseGroup(graph, group);
        let cx = 0;
        let cy = 0;
        groupNode.configs.childNodes.forEach((node) => {
          cx += node.x;
          cy += node.y;
        });
        cx = cx / length;
        cy = cy / length;
        groupNode.configs.x = cx;
        groupNode.configs.y = cy;
        groupNode.configs.vx = 0;
        groupNode.configs.vy = 0;
        fdp.updateData(graph);
        fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
        fdGrouping.updateData(graph);
        fdGrouping.groupVelocity.reset();
        fdGrouping.groupVelocity.setThreshold(80);
        fdp.restart(1.0);
        graph.refresh();
        graph.draw();
      }
    });

    const unGroupValues = {};
    fdGrouping.on('groupshape:contextmenu', (ev) => {
      const shape = ev.target;
      unGroupValues[shape.get('groupValue')] = true;
      fdGrouping.setGetGroupValue((nodeData) => {
        return unGroupValues[nodeData.group] ? undefined : nodeData.group;
      });
      fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
      fdGrouping.groupVelocity.reset();
      fdGrouping.groupVelocity.setThreshold(80);
      fdp.restart(1.0);
    });

    graph.on('node:contextmenu', (ev) => {
      const node = ev.target;
      unGroupValues[node.get('group')] = undefined;
      fdGrouping.setGetGroupValue((nodeData) => {
        return unGroupValues[nodeData.group] ? undefined : nodeData.group;
      });
      fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
      fdGrouping.groupVelocity.reset();
      fdGrouping.groupVelocity.setThreshold(80);
      fdp.restart(1.0);
    });

    let originPos = null;
    fdGrouping.on('groupshape:dragstart', (ev) => {
      originPos = { x: ev.clientX, y: ev.clientY };
    });
    fdGrouping.on('groupshape:drop', (ev) => {
      const x = ev.clientX;
      const y = ev.clientY;
      const shape = ev.target;
      const group = fdGrouping.getGroups()[shape.get('groupValue')];
      if (group && originPos) {
        const scale = graph.getZoomRatio();
        const offsetX = (x - originPos.x) / scale;
        const offsetY = (y - originPos.y) / scale;
        const nodeMap = graph.getNodeMap();
        group.forEach((node) => {
          nodeMap[node.id].translate(offsetX, offsetY);
        });
      }
      fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
      fdGrouping.groupVelocity.reset();
      fdGrouping.groupVelocity.setThreshold(80);
      fdp.restart(1.0);
      graph.refresh();
    });

    graph.on('node:dblclick', (e) => {
      const node = e.target;
      if (node.get('childNodes')) {
        const center = { x: node.configs.x, y: node.configs.y };
        const highlight = graph.getBehavior('highlightRelations');
        if (highlight) {
          highlight.recover();
        }
        const group = GroupUtils.expandGroupNode(graph, node);
        assignPosition(center, group.configs.childNodes, false, 2);
        fdp.updateData(graph);
        fdp.setOptions({ maxIteration: 100, tickIterations: 10 });
        fdGrouping.updateData(graph);
        fdGrouping.groupVelocity.reset();
        fdGrouping.groupVelocity.setThreshold(80);
        fdp.restart(1.0);
        graph.refresh();
      }
    });

    graph.on('canvas:contextmenu', () => {
      fdGrouping.setOptions({
        shapeStyles: whichStyle ? style1 : style2,
      });
      fdGrouping.updateShapes();
      graph.draw();
      whichStyle = 1 - whichStyle;
    });
  });
```
