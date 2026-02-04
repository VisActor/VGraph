// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { dragCanvas, Graph, panZoom, dragNode, highlightRelations, Node, Edge, dragEdge, fastrand } from '../../src';
import { Grid, Router } from '../../src/components';

const rand = fastrand();
rand.setSeed(1);

const border = {
  top: 0 + 20,
  bottom: 1200 - 20,
  right: 1600 - 50,
  left: 0 + 50,
};

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(nodeData: any) {
      return {
        // id: node.name,
        type: 'rect',
        width: 50,
        height: 20,
        fillStyle: ['1', '2'].includes(nodeData.id) ? '#5F95FF' : '#A0A0AD',
        anchors: [
          {
            show: 'hover',
            position: [0, 0.5],
            setStyles() {
              return {
                size: 6,
                fillStyle: '#F3F9FF',
                strokeStyle: '#3073F2',
                cursor: 'crosshair',
              };
            },
          },
          {
            show: 'hover',
            position: [1, 0.5],
            setStyles() {
              return {
                size: 6,
                fillStyle: '#F3F9FF',
                strokeStyle: '#3073F2',
                cursor: 'crosshair',
              };
            },
          },
          // {
          //   show: 'hover',
          //   position: [1, 0.5],
          //   setStyles() {
          //     return {
          //       size: 6,
          //       fillStyle: '#F3F9FF',
          //       strokeStyle: '#3073F2',
          //       cursor: 'crosshair',
          //     };
          //   },
          // },
          // {
          //   show: 'hover',
          //   position: [0.5, 0],
          //   setStyles() {
          //     return {
          //       size: 6,
          //       fillStyle: '#F3F9FF',
          //       strokeStyle: '#3073F2',
          //       cursor: 'crosshair',
          //     };
          //   },
          // },
          // {
          //   show: 'hover',
          //   position: [0.5, 1],
          //   setStyles() {
          //     return {
          //       size: 6,
          //       fillStyle: '#F3F9FF',
          //       strokeStyle: '#3073F2',
          //       cursor: 'crosshair',
          //     };
          //   },
          // },
        ],
      };
    },
    setDefaultEdge() {
      return { strokeStyle: '#ccc', lineWidth: 2 };
    },
  });
  const dataNodes = [] as any[];
  for (let i = 0; i < 500; i++) {
    dataNodes.push({
      id: '' + i,
      x: 50 + rand() * 1500,
      y: 10 + rand() * 1180,
    });
  }
  graph.data({
    nodes: dataNodes,
    edges: [{ source: '1', target: '2' }],
  });
  const gridComponent = new Grid(graph, {});
  gridComponent.refresh();
  // const nodes = graph.getNodes();
  // for (const node of nodes) {
  //   const bbox = node.getBBox();
  //   console.log('bbox', bbox);
  //   gridComponent.addBBox(bbox);
  // }
  // const { left, top, step } = gridData;
  console.log(gridComponent.gridData);
  const router = new Router(gridComponent);
  const { startPoint, endPoint } = graph.getEdges()[0].getTerminal();
  const controlPoints = router.findPath(startPoint, endPoint);
  graph.getEdges()[0].set('controlPoints', controlPoints);
  graph.refresh();
  console.log('path', controlPoints);

  graph.addBehavior(dragNode, {
    delegate: false,
    autoTranslate: false,
    shouldTrigger(ev: any, triggerShape: any) {
      return !triggerShape?.get('_anchor');
    },
    onDragStart(node: Node) {
    },
    onDrag(node: Node, x: number, y: number) {
      if (x < border.left) {
        node.set('x', border.left);
      }
      if (x > border.right) {
        node.set('x', border.right);
      }
      if (y < border.top) {
        node.set('y', border.top);
      }
      if (y > border.bottom) {
        node.set('y', border.bottom);
      }
      console.time('path');
      const { startPoint, endPoint } = graph.getEdges()[0].getTerminal();
      const controlPoints = router.findPath(startPoint, endPoint);
      // const controlPoints = finder.convertPath(left, top, step, finder.compressPath(path));
      graph.getEdges()[0].set('controlPoints', controlPoints);
      console.timeEnd('path');
      graph.refresh();
      // console.log(node.get('x'), node.get('y'), node);
    },
  });
  graph.addBehavior(dragEdge, {
    autoTranslate: false,
    shouldTrigger(ev: any, triggerShape: any) {
      return triggerShape?.get('_anchor');
    },
    shouldDrop(sourceNode: Node, targetNode: Node, sourceAnchor: number, targetAnchor: number) {
      return targetAnchor !== undefined;
    },
  });
  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.fitView();
  (window as any).graph = graph;
})();
