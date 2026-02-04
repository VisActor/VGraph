import { dragCanvas, Graph, panZoom, dragNode, Node, dragEdge, Rect, Layer } from '../../src';
import { Grid, Router } from '../../src/components';
const border = {
  top: 0 + 20,
  bottom: 400 - 20,
  right: 600 - 50,
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
        width: nodeData.width ?? 50,
        height: nodeData.height ?? 20,
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
        ],
      };
    },
    setDefaultEdge() {
      return { strokeStyle: '#ccc', lineWidth: 2 };
    },
  });
  const dataNodes = [] as any[];
  // for (let i = 0; i < 500; i++) {
  //   dataNodes.push({
  //     id: '' + i,
  //     x: 50 + rand() * 1500,
  //     y: 10 + rand() * 1180,
  //   });
  // }
  dataNodes.push({
    id: '0',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
  });
  dataNodes.push({
    id: '1',
    x: 250,
    y: 50,
    width: 100,
    height: 100,
  });
  dataNodes.push({
    id: '2',
    x: 450,
    y: 50,
    width: 100,
    height: 100,
  });
  dataNodes.push({
    id: '3',
    x: 100,
    y: 50,
    width: 4,
    height: 4,
  });
  dataNodes.push({
    id: '4',
    x: 400,
    y: 50,
    width: 4,
    height: 4,
  });
  graph.data({
    nodes: dataNodes,
    edges: [{ source: '3', target: '4' }],
  });
  const gridComponent = new Grid(graph, {});
  const router = new Router(gridComponent);
  // gridData.resetMap(GridBox);
  const nodes = graph.getNodes();
  for (const node of nodes) {
    if (node.get('id') === '3' || node.get('id') === '4') {
      continue;
    }
    const bbox = node.getBBox();
    console.log('bbox', bbox);
    gridComponent.addBBox(bbox);
  }
  console.log(gridComponent.gridData);
  const { startPoint, endPoint } = graph.getEdges()[0].getTerminal();
  const controlPoints = router.findPath(startPoint, endPoint);
  // const controlPoints = finder.convertPath(left, top, step, finder.compressPath(path));
  graph.getEdges()[0].set('controlPoints', controlPoints);
  graph.refresh();
  console.log('path', controlPoints);

  let nodeBbox = null as any;
  graph.addBehavior(dragNode, {
    delegate: false,
    autoTranslate: false,
    shouldTrigger(ev: any, triggerShape: any) {
      return !triggerShape?.get('_anchor');
    },
    onDragStart(node: Node) {
      nodeBbox = node.getBBox();
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
      gridComponent.removeBBox(nodeBbox);
      gridComponent.addBBox(node.getBBox());
      nodeBbox = node.getBBox();

      const { startPoint, endPoint } = graph.getEdges()[0].getTerminal();
      const controlPoints = router.findPath(startPoint, endPoint);
      console.log(controlPoints);
      graph.getEdges()[0].set('controlPoints', controlPoints);
      console.timeEnd('path');
      const layer = graph.get('gridLayer') ?? new Layer();
      layer.clear();
      const { rows, cols, left, top, grid, step } = gridComponent.gridData;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (grid[i][j] === 0) {
            continue;
          } else {
            layer.add(
              new Rect({
                left: left + j * step,
                top: top + i * step,
                width: 10,
                height: 10,
                fillStyle: '#000',
              })
            );
          }
        }
      }
      graph.getContainer().add(layer);
      graph.set('gridLayer', layer);
      layer.toBack();
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
