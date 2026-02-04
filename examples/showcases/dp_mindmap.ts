import { colorParser, TreeGraph, MindMap, panZoom, LayerEvent, CountBadgeUtils, ShapeEvent } from '../../src';
import data from '../static/tree_data.json';

const NODE_COLORS = [
  '#5678D6',
  '#EB8D2F',
  '#59A649',
  '#E0BA2D',
  '#A56AAD',
  '#6DBEC9',
  '#D95145',
  '#A0A0AD',
  '#94674E',
  '#ED848F'
];

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const layout = new MindMap({
    direction: 'LR',
    nodeSep() {
      return 40;
    },
    nodeSize(nodeData: any) {
      return [190, 40];
    },
    rankSep() {
      return 120;
    }
  });

  const graph = new TreeGraph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    animate: true,

    // fitViewAfterLayout: false,
    layout,
    setDefaultNode(node: any) {
      if (node.id === 'Modeling Methods') {
        return {
          width: 124,
          height: 40,
          fillStyle: '#3073F2',
          strokeStyle: null,
          radius: 8,
          label: {
            x: 0,
            y: 0,
            text: node.id,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 500,
            fillStyle: '#fff',
            width: 100,
            textOverflow: 'ellipsis',
          },
          anchors: [
            [0, 0.5],
            [1, 0.5]
          ]
        };
      }
      return {
        label: node.id,
        type: 'category',
        radius: 4,
        color: NODE_COLORS[Math.round(Math.random() * 9)],
        width: 190,
        height: 40,
        anchors: [
          [0, 0.5],
          [1, 0.5]
        ],
        icons: node.children ? [{
          show: 'hover',
          position: node.position === 'right' ? [1, 0.5] : [0, 0.5],
          offset: node.position === 'right' ? [20, 0] : [-20, 0],
          setStyles() {
            return {
              fillStyle: '#3073F2',
              icon: node.position === 'right' ? '&#xe617;' : '&#xe618;',
              cursor: 'pointer'
            }
          },
          setBgStyles() {
            return {
              type: 'circle',
              size: 14
            };
          },
          onClick(e: ShapeEvent, nodeData: any) {
            showSum(nodeData, e);
          },
          onMouseEnter(e: ShapeEvent, nodeData: any) {
            const bkg = e.target.children[0];
            bkg.set('fillStyle', '#E4EDFE');
            graph.draw();
          },
          onMouseLeave(e: ShapeEvent, nodeData: any) {
            const bkg = e.target.children[0];
            bkg.set('fillStyle', '#FFF');
            graph.draw();
          }
        }] : undefined,
      };
    },
    setDefaultEdge() {
      return {
        type: 'hLine',
        styles: {
          radius: 8
        },
        endArrow: true,
      };
    },
    setEdgeStateStyles(state: string) {
      if (state === 'blur') {
        return {
          opacity: 0.3
        };
      }
    }
  });
  // 写入数据
  graph.data(data);

  graph.addBehavior(panZoom);
  graph.refresh();
  // 适应视图大小
  // graph.fitView();

  graph.on('node:click', (e) => {
    console.log(e.target);
  });

  function showSum(nodeData: any, e: ShapeEvent) {
    const node = graph.getNodeById(nodeData.id);
    node.set('iconLayer', e.target);
    e.target.hide();
    const count = getChildrenCount(nodeData);
    let sumLayer = node.get('sumLayer');
    if (!sumLayer) {
      sumLayer = CountBadgeUtils.init(node, {
        position: node.get('position'),
        text: count + '',
        color: node.get('color'),
        onClick() {
          sumLayer.hide();
          node.get('iconLayer').hide();
          graph.expand(node);
        },
        onMouseEnter(e: LayerEvent) {
          graph.getCanvasDom().style.cursor = 'pointer';
          const rect = sumLayer.children[1];
          rect.set('fillStyle', colorParser(rect.get('strokeStyle')).lerp('#ffffff', 0.875).hex());
          graph.draw();
        },
        onMouseLeave(e: LayerEvent) {
          graph.getCanvasDom().style.cursor = 'default';
          const rect = sumLayer.children[1];
          rect.set('fillStyle', '#FFF');
          graph.draw();
        }
      });
      node.set('sumLayer', sumLayer);
    }
    sumLayer.show();
    graph.collapse(node);
  }

  function getChildrenCount(nodeData: any) {
    const children = nodeData.children;
    if (!children || children.length === 0) {
      return 0;
    }
    let count = children.length;
    children.forEach((child: any) => {
      count += getChildrenCount(child);
    });

    return count;
  }

})();
