---
category: examples
group: dag
title: 简易泳道图-垂直
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/swim_lane.gif
link: dag/dataAnalysis
option:
---
# 简易泳道图-垂直

原始 vgraph demo 迁移到 vgraph，保持主要交互与布局行为。

## 关键配置

- `Graph` / `DAGLayout`：保持原始布局与样式配置。
- `setDefaultNode` / `setDefaultEdge`：保留节点与连线外观。
- 交互行为：保留示例中的展开、收起、hover 或点击逻辑。

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  Rect,
  Text,
  Node,
  Edge,
  Group,
  GraphEvent,
  DAGLayout,
} from '@visactor/vgraph';

const data = {
  nodes: [
    {
      name: '目标确定',
      id: '1',
      groupId: '需求层',
    },
    {
      name: '数据获取',
      id: '2',
      groupId: '数据层',
    },
    {
      name: '数据清洗',
      id: '3',
      groupId: '数据层',
    },
    {
      name: '数据整理',
      id: '4',
      groupId: '数据层',
    },
    {
      name: '描述分析',
      id: '5',
      groupId: '分析层',
    },
    {
      name: '建模分析',
      id: '6',
      groupId: '分析层',
    },
    {
      name: '洞察结论',
      id: '7',
      groupId: '分析层',
    },
    {
      name: '模型测试',
      id: '8',
      groupId: '分析层',
    },
    {
      name: '迭代优化',
      id: '9',
      groupId: '分析层',
    },
    {
      name: '模型加载',
      id: '10',
      groupId: '输出层',
    },
    {
      name: '报告撰写',
      id: '11',
      groupId: '输出层',
    },
  ],
  edges: [
    { source: '1', target: '2' },
    { source: '2', target: '3' },
    { source: '3', target: '4' },
    { source: '4', target: '5' },
    { source: '4', target: '6' },
    { source: '5', target: '7' },
    { source: '6', target: '8' },
    { source: '7', target: '11' },
    { source: '8', target: '9' },
    { source: '9', target: '10' },
    { source: '10', target: '11' },
  ],
  groups: [
    { id: '需求层', children: ['1'] },
    { id: '数据层', children: ['2', '3', '4'] },
    { id: '分析层', children: ['5', '6', '7', '8', '9'] },
    { id: '输出层', children: ['10', '11'] },
  ],
};

const groups = ['需求层', '数据层', '分析层', '输出层'];

const container = document.getElementById(CONTAINER_ID);

const graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth,
  height: container.offsetHeight,
  setDefaultNode(nodeData: any) {
    return {
      type: 'rect',
      label: {
        text: nodeData.name,
        fontSize: 14,
        textBaseline: 'middle',
        textAlign: 'center',
        fillStyle: 'rgba(20, 20, 20, 0.9)',
      },
      width: 140,
      height: 48,
      radius: 4,
      strokeStyle: '#E1E4EB',
      // 自定义节点所在层级，DagLayout 会根据 rank 字段对节点分层
      rank: groups.indexOf(nodeData.groupId),
      anchors: [
        [0, 0.5],
        [0.5, 0],
        [0.5, 1],
        [1, 0.5],
      ],
    };
  },
  setNodeStateStyles(state: string, data: any, node: Node) {
    const label = node.getLabel();
    if (state === 'hover') {
      label.set('fillStyle', '#2E62F1');
      return { strokeStyle: '#2E62F1' };
    }
    if (state === 'active') {
      label.set('fillStyle', '#fff');
      return {
        fillStyle: '#2E62F1',
        strokeStyle: '#2E62F1',
      };
    }
    if (state === 'default') {
      label.set('fillStyle', 'rgba(20, 20, 20, 0.9)');
      return {
        strokeStyle: '#E1E4EB',
        fillStyle: '#fff',
      };
    }
  },
  setDefaultEdge(edgeData: any) {
    const sourceId = graph.getNodeById(edgeData.source).get('groupId');
    const targetId = graph.getNodeById(edgeData.target).get('groupId');
    // 同层级节点间用直线，不同层级节点之间用水平折线
    let type = 'line';
    if (sourceId !== targetId) {
      type = 'hLine';
    }
    return {
      type: type,
      lineWidth: 1,
      strokeStyle: '#D1D5DA',
      endArrow: true,
    };
  },
  setEdgeStateStyles(state: string, edgeData: any, edge: Edge) {
    if (state === 'hover') {
      // 避免连线重合时出现显示错误
      edge.toFront();
      return {
        strokeStyle: '#2E62F1',
      };
    }
    if (state === 'active') {
      edge.toFront();
      return {
        lineWidth: 2,
        strokeStyle: '#2E62F1',
      };
    }
  },
  setDefaultGroup(groupData) {
    return {
      strokeStyle: '#D9D9D9',
      fillStyle: '#FAFBFC',
      radius: 12,
      linkNode: true,
      padding: 50,
      lineWidth: 0.5,
      titleSize: 64,
      // 自定义分组标题栏内容
      renderGroupTitle(group: any, layer: any, width: number) {
        // 标题文本
        const text = new Text({
          text: groupData.id,
          x: width / 2,
          y: 22,
          fontSize: 20,
          textBaseline: 'top',
          textAlign: 'center',
          fillStyle: '#7D8599',
        });

        // 顶部色条
        const backRect = new Rect({
          left: 0,
          top: 0,
          width: width,
          height: 4,
          radius: [12, 12, 0, 0],
          fillStyle: '#7D8599',
          // 圆角大于色条的高度，将多余部分裁掉。可以将 clip 注释对比效果。
          clip: new Rect({
            left: 0,
            top: 0,
            width,
            height: 24,
            radius: 12,
          }),
        });
        layer.add(backRect);
        layer.add(text);
      },
    };
  },
  setGroupStateStyles(state: string, groupData: any) {
    const group = graph.getGroupById(groupData.id);
    const titleBg = group.titleLayer.find(
      (shape: any) => shape.type === 'rect'
    );
    const titleText = group.titleLayer.find(
      (shape: any) => shape.type === 'text'
    );
    if (state === 'hover') {
      titleBg.set('fillStyle', '#475466');
      titleText.set('fillStyle', '#545454');
      return {
        fillStyle: '#fff',
      };
    } else {
      titleBg.set('fillStyle', '#7D8599');
      titleText.set('fillStyle', '#7D8599');
    }
  },
});

graph.data(data);
// 由于每次布局后需要手动调整分组的尺寸，不采用内置自动更新的方式来定义分组
new DAGLayout({
  graph,
  rankDir: 'LR',
  nodeSep: 50,
  rankSep: 150,
  ranker: 'custom',
  ignoreGroup: true,
});
let minY = Infinity;
let maxY = -Infinity;
// 获取布局后节点的最大最小 y 坐标
graph.getNodes().forEach((node: Node) => {
  const y = node.get('y');
  minY = Math.min(y, minY);
  maxY = Math.max(y, maxY);
});

// 固定每个分组的尺寸
graph.getGroups().forEach((group: Group) => {
  group.updateData({
    fixTop: minY - 15,
    fixHeight: maxY - minY + 30,
  });
});

graph.refresh();
graph.fitView();

// hover group
graph.on('group:mouseenter', (e: GraphEvent) => {
  e.target.setState('hover');
});

graph.on('group:mouseleave', (e: GraphEvent) => {
  e.target.setState('default', true);
});

// hover node
graph.on('node:mouseenter', (e: GraphEvent) => {
  e.target.setState('active');
});

graph.on('node:mouseleave', (e: GraphEvent) => {
  e.target.setState('default', true);
});

//hover edge
graph.on('edge:mouseenter', (e: GraphEvent) => {
  const edge = e.target;
  edge.setState('active');
  edge.source.setState('hover');
  edge.target.setState('hover');
});

graph.on('edge:mouseleave', (e: GraphEvent) => {
  const edge = e.target;
  edge.removeState('active');
  edge.source.setState('default', true);
  edge.target.setState('default', true);
});

// 点击分组收起/展开
graph.on('group:click', (e: GraphEvent) => {
  const group = e.target;
  if (group.get('collapsed')) {
    group.expand();
  } else {
    group.collapse();
  }
});
```
