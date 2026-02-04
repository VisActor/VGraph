import { AnchorConfigs, Graph, Layer, Node, brushSelect } from '../../src';
import {
  Stack, AddCommand, SelectCommand, RemoveCommand, CopyCommand,
  PasteCommand, CutCommand, getDefaultShortcuts, MoveNodeCommand, UpdateCommand,
  Shortcuts, Grid, Router, NodeMover, EdgeEditor, Scroller
} from '../../src/components';

(() => {

  const aside = document.createElement('div');
  aside.style.border = '1px solid #666';
  aside.style.display = 'inline-block';
  aside.style.width = '100px';
  aside.style.height = '200px';
  document.body.append(aside);
  const span = document.createElement('span');
  span.classList.add('iconfont');
  span.style.fontSize = '36px';
  span.innerHTML = '&#xe601;';
  span.draggable = true;
  aside.appendChild(span);

  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.display = 'inline-block';
  div.style.width = '800px';

  const btn = document.createElement('button');
  btn.textContent = 'export data';
  div.appendChild(btn);
  const btn1 = document.createElement('button');
  btn1.textContent = 'undo';
  div.appendChild(btn1);

  const btn2 = document.createElement('button');
  btn2.textContent = 'redo';
  div.appendChild(btn2);

  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        type: 'rect',
        radius: 4,
        width: 140,
        height: 40,
        label: node.name || node.id,
        title: {
          text: node.taskType || '任务名称',
          backgroundColor: '#F6F8FA',
          height: 30,
          fillStyle: '#21252C'
        },
        anchors: [{
          show: 'hover',
          position: [0.5, 0],
          // size: 16,
          setStyles() {
            return {
              fillStyle: '#F3F9FF',
              strokeStyle: '#3073F2',
              cursor: 'crosshair'
            };
          },
        }, {
          show: 'hover',
          position: [0.5, 1],
          // size: 16,
          setStyles() {
            return {
              fillStyle: '#F3F9FF',
              strokeStyle: '#3073F2',
              cursor: 'crosshair'
            };
          },
        }
        ],
      };
    },
    setNodeStateStyles(state: string) {
      if (state === 'select') {
        return { strokeStyle: '#3073F2', fillStyle: '#EDF6FF' }
      }
      if (state === 'hover') {
        return { strokeStyle: '#3073F2' };
      }
    },
    setDefaultEdge() {
      return {
        type: 'line',
        endArrow: true,
        hitWidth: 6,
      };
    },
    setEdgeStateStyles(state: string) {
      if (state === 'select') {
        return { strokeStyle: '#3073F2' }
      }
      // todo 这不是最终颜色
      if (state === 'hover') {
        return { strokeStyle: '#89909D' }
      }
    }
  });

  graph.data(
    { 'nodes': [{ 'id': 'Task1', 'x': 320, 'y': 80 }, { 'id': 'Task2', 'x': 520, 'y': 210 }, { 'id': 'Task3', 'x': 120, 'y': 210 }], 'edges': [{ 'source': 'Task1', 'target': 'Task2', id: '11', sourceAnchor: 1, targetAnchor: 0, 'controlPoints': [[320, 140], [520, 140], [520, 150]] }, { 'source': 'Task1', 'target': 'Task3', sourceAnchor: 1, targetAnchor: 0, 'controlPoints': [[320, 140], [120, 140], [120, 150]] }], 'groups': [] }
  );

  const stack = new Stack(graph, {
    commands: {
      add: AddCommand,
      select: SelectCommand,
      remove: RemoveCommand,
      copy: CopyCommand,
      cut: CutCommand,
      paste: PasteCommand,
      moveNode: MoveNodeCommand,
      update: UpdateCommand
    }
  });

  // stack.setMode('read');

  const shortcuts = getDefaultShortcuts(stack);

  graph.on('stackchange', () => {
    console.log('onChange-----------------')
  });
  graph.on('node:mouseenter', (e) => {
    e.target.toFront();
    graph.setState(e.target, 'hover');
  });
  graph.on('node:mouseleave', (e) => {
    graph.removeState(e.target, 'hover');
  });
  graph.on('edge:click', (e) => {
    stack.execute('select', { selections: [e.target] });
  });

  graph.on('edge:mouseenter', (e) => {
    if (firstAnchor || e.target.hasState('select')) {
      return;
    }
    e.target.toFront();
    graph.setState(e.target, 'hover');
  });
  graph.on('edge:mouseleave', (e) => {
    // 拖拽中，不响应
    if (firstAnchor) {
      return;
    }
    if (!e.target.hasState('select')) {
      e.target.toBack();
    }
    graph.removeState(e.target, 'hover');
  });

  graph.on('node:contextmenu', (e) => {
    stack.execute('select', { selections: [e.target] });
    stack.execute('remove');
  });

  graph.on('node:click', (e) => {
    stack.execute('select', { selections: [e.target] });
  });

  graph.on('canvas:click', () => {
    stack.execute('select', { selections: [] });
  });

  const gridComponent = new Grid(graph, { step: 10 });
  gridComponent.refresh();
  const router = new Router(gridComponent, { allowDiagonal: 'never' });
  new NodeMover(graph, {
    router,
    stack,
    alignGrid: true,
    shouldTrigger(ev: any, triggerShape: any) {
      return !triggerShape?.get('_anchor');
    }
  });
  let firstAnchor: any = null;
  let currentNode: any = null;
  let edit = false;
  new EdgeEditor(graph, {
    router,
    stack,
    magnet: true,
    magnetAnchorStyles: {
      fillStyle: '#3073F2',
      strokeStyle: 'rgba(48, 115, 242, 0.2)',
      lineWidth: 8,
    },
    editAnchorStyles: {
      fillStyle: '#3073F2'
    },
    showAnchors: (anchor: AnchorConfigs, anchorShape: Layer, node: Node) => anchor.index === 0 && node !== currentNode,
    shouldTrigger(ev: any, triggerShape: any, node: Node, edge: any) {
      currentNode = node;
      if (edge) {
        edit = true;
      } else {
        edit = false;
      }
      firstAnchor = triggerShape;
      const anchorIndex = triggerShape?.get('anchorIndex');
      if (anchorIndex === undefined) {
        return false;
      } else if (edit) {
        return true;
      }
      return !node.isAnchorConnected(anchorIndex);
    },
    onDragStart() {
      edit === false && firstAnchor.set('fillStyle', '#3073F2');
    },
    shouldDrop(sourceNode: Node, targetNode: Node, sourceAnchor: number, targetAnchor: number) {
      firstAnchor?.set('fillStyle', '#fff');
      if (!targetNode) {
        return false;
      }
      firstAnchor = null;
      return true;
    },
    onDrop(edge: any) {
      console.log(edge);
    }
  });

  const shortcut = new Shortcuts(
    shortcuts
  );

  // new Scroller(graph);
  (window as any).scroller = new Scroller(graph);
  // shortcut.unbindKey('⌘+z, ctrl+z');

  // const background = new Background(graph);

  // background.destroy();

  // graph.addBehavior(panZoom);
  // graph.addBehavior(dragCanvas);
  // graph.addBehavior(dragEdge, {

  // });

  aside.ondragstart = (e) => {
    e.dataTransfer?.setData('taskType', '11222');
  };

  const canvas = graph.getCanvasDom();

  canvas.ondragover = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  canvas.ondrop = (e: any) => {
    const { clientX, clientY } = e;
    const point = graph.clientToCanvas(clientX, clientY);
    stack.execute('add', {
      configs: {
        x: point.x,
        y: point.y,
        name: `新增节点${graph.getNodes().length}`,
        taskType: e.dataTransfer.getData('taskType')
      }
    });
  }

  (window as any).graph = graph;

  btn.onclick = () => {
    const data = graph?.getData((entity: any) => {
      if (entity.type === 'node') {
        return {
          id: entity.get('id'),
          x: entity.get('x'),
          y: entity.get('y'),
          name: entity.get('name'),
          taskType: entity.get('taskType')
        };
      }
      return {
        source: entity.get('source'),
        target: entity.get('target'),
        controlPoints: entity.get('controlPoints')
      };
    });
    console.log(JSON.stringify(data));
  }

  btn1.onclick = () => {
    stack.undo();
  }
  btn2.onclick = () => {
    stack.redo();
  }

})();