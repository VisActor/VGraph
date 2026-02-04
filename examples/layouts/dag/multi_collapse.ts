import {
  dragCanvas,
  Graph,
  panZoom,
  Text,
  Node,
  highlightRelations,
  Group,
  Icon,
  NestedDAG,
} from '../../../src';

const expandIcon = '&#xe610;';
const collapseIcon = '&#xe60f;'; // 用于收起展开节点

const changeTypeColor = {
  other: null,
  '#c44e52': '#c44e52',
  '#25a868': '#25a868',
  '#dd8452': '#dd8452',
};
const changeTypeIcon = {
  '#c44e52': '&#xe605;',
  '#25a868': '&#xe606;',
  '#dd8452': '&#xe601;',
};
const container = document.createElement('div');
container.style.border = '1px solid #666';
container.style.width = '800px';
document.body.append(container);
let nestedDag = null as unknown as NestedDAG;
// 初始化 graph 实例
const graph = new Graph({
  container: container,
  width: 800,
  height: 600,
  minRatio: 0.01,
  maxRatio: 8,
  animate: false,
  setDefaultNode(nodeData: any) {
    let icons = null as any;
    // 设置icon随changeType变化
    if (nodeData?.changeType) {
      const icon = changeTypeIcon[nodeData.changeType];
      icons = [
        {
          setStyles: (data: any) => {
            return {
              icon,
              size: 15,
              fillStyle: changeTypeColor[nodeData?.changeType ?? 'other'],
            };
          },
          position: [0.9, 0.5],
        },
      ];
    }
    return {
      type: 'Rect',
      radius: 10,
      width: nodeData.width ?? 100,
      height: nodeData.height ?? 20,
      strokeStyle: '#4170F2',
      fillStyle: changeTypeColor[nodeData?.changeType ?? 'other'],
      label: {
        offsetX: nodeData?.changeType ? -6 : 0,
        width: (nodeData.width ?? 100) - 30,
        text: nodeData.text ?? nodeData.id,
        fillStyle: '111',
        textOverflow: 'ellipsis',
        opacity: 1.0,
      },
      icons,
      anchors: [
        [0.0, 0.5],
        [1.0, 0.5],
        //   [0.5, 0.0],
        //   [0.5, 1.0],
      ],
      opacity: 0.3,
    };
  },
  setNodeStateStyles(state: string, data: any) {
    if (state === 'hide') {
      return { fillStyle: data.color };
    }
  },
  setDefaultEdge(edge: any) {
    return {
      id: edge.source + '-' + edge.target,
      // type: 'quadratic',
      // type: "line",
      type: 'hCubic',
      endArrow: {
        width: 9,
        height: 12,
      },
      strokeStyle: '#64b5cd',
      appendSize: 2,
      lineWidth: 2,
      opacity: 0.3,
    };
  },
  setEdgeStateStyles(state) {
    if (state === 'active') {
      return {
        opacity: 1.0,
        strokeStyle: '#64b5cd',
      };
    }
    return { opacity: 0.1 };
  },
  setDefaultGroup(groupData: any) {
    return {
      linkNode: true,
      fillStyle: '#fff',
      strokeStyle: '#DDE2E9',
      linkGroupOnCollapse: true,
      padding: 20,
      radius: 4,
      anchors: [
        [0, 0.5],
        [1, 0.5],
      ],
      capture: false,
      titleSize: 32,
      renderGroupTitle(group: Group, layer: any, width: number) {
        const icon = new Icon({
          x: 28,
          y: 16,
          fillStyle: '#595959',
          icon: group.get('collapsed') ? expandIcon : collapseIcon,
          cursor: 'pointer',
        });
        layer.add(icon);

        icon.on('click', () => {
          toggleGroup(group);
        });

        const text = new Text({
          x: 40,
          y: 16,
          text: group.get('text'),
          width: width - 40 - 16,
          textOverflow: 'ellipsis',
        });
        layer.add(text);
      },
    };
  },
});

graph.on('edge:click', (e) => {
  console.log(e);
  e.target.updatePosition();
  console.log(e.target.getTerminal());
  // graph.add('edge', { ...e.target.getTerminal() });
  e.target.hide();
  console.log(e.target.isVisible());
  graph.refresh();
});

const collapseGroupWidth = 250;
const defaultCollapse = true;

fetch('https://cdn-tos-cn.bytedance.net/obj/maat/img/emhvbmdmYWhhaS4xMjE3/file_18bd7f6e22364.json')
  .then((response) => response.json())
  .then((data) => {
    console.time();
    graph.addBehavior(panZoom, { sensitivity: 5 });
    graph.addBehavior(dragCanvas, {
      canvasOnly: false,
    });
    graph.addBehavior(highlightRelations);
    graph.data(data);


    const groups = graph.getGroups();
    if (defaultCollapse) {
      for (const group of groups) {
        if (!group.belong) {
          collapseGroup(group);
        }
      }
    }

    nestedDag = new NestedDAG({
      graph: graph,
      dagOptions: {
        rankDir: 'LR',
        nodeSep: 30,
        edgeSep: 10,
        rankSep: 50,
        ranker: 'networkSimplex',
        cache: true,
      },
    });
    graph.refresh();
    graph.fitView();
    console.timeEnd();
    document.fonts.ready.then(() => {
      graph.draw();
    });
  });

(window as any).__graph = graph;
const collapseGroup = (group: Group) => {
  const children = group.children;
  if (children) {
    for (const child of children) {
      if (child.type === 'group') {
        collapseGroup(child as Group);
      }
    }
  }
  group.collapse();
  group.set('width', collapseGroupWidth);
  group.updateGroup();
};

function toggleGroup(group: Group) {
  // 记录节点原本的位置，用于布局后恢复定位，固定用户操作焦点
  const position = getNodeRelativePos(group);
  if (group.get('collapsed')) {
    // 节点状态为收起，故而展开节点
    group.set('fixWidth', undefined);
    group.expand();

    nestedDag.layout();
    graph.refresh();
    // graph.getEdges().filter(e => e.isVisible()).forEach(e => {
    //   if (!e.source.isVisible() || !e.target.isVisible()) {
    //     e.hide();
    //   }
    // })
  } else {
    // 节点状态为展开，故而收起节点
    group.set('fixWidth', collapseGroupWidth); // 注释可以保持之前的宽度
    group.collapse();
    group.refreshBox();
    nestedDag.layout();
    graph.refresh();
  }
  // 将被操作节点移回原位
  const currentPos = getNodeRelativePos(group);
  graph.translate(
    position.x - currentPos.x - (position.width - currentPos.width) / 2,
    position.y - currentPos.y - (position.height - currentPos.height) / 2
  );
  graph.refresh();
  graph.draw();
}
function getNodeRelativePos(node: Node | Group) {
  const { x, y, width, height } = node.configs;
  const wh = graph.canvasToViewport(width, height);
  return { ...graph.canvasToViewport(x, y), width: wh.x, height: wh.y };
}
