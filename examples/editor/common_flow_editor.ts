import {
  brushSelect,
  CommonFlowEditor,
  Node,
  Icon,
  Edge,
  DAGLayout,
  getDefaultBizData,
  registerEdge,
  Grid,
  unRegisterEdge,
  getRouterCubicPath,
  dragCanvas,
  attachableDragNode,
  GraphEvent,
  getDuplicateEdgeConfigs,
} from '../../src';

unRegisterEdge('routerCubic');

function registerSpTurningLine(grid: Grid) {
  registerEdge('routerCubic', {
    getPath(configs: any) {
      return getRouterCubicPath(configs, 'v', grid);
    },
  });
}

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

  const btn3 = document.createElement('button');
  btn3.textContent = 'zoom in';
  div.appendChild(btn3);

  const btn4 = document.createElement('button');
  btn4.textContent = 'zoom out';
  div.appendChild(btn4);

  const btn5 = document.createElement('button');
  btn5.textContent = 'focus';
  div.appendChild(btn5);

  const btn6 = document.createElement('button');
  btn6.textContent = 'select';
  div.appendChild(btn6);

  const btn7 = document.createElement('button');
  btn7.textContent = 'layout';
  div.appendChild(btn7);

  const btn8 = document.createElement('button');
  btn8.textContent = 'clear';
  div.appendChild(btn8);

  const btn9 = document.createElement('button');
  btn9.textContent = 'copy';
  div.appendChild(btn9);

  const btn10 = document.createElement('button');
  btn10.textContent = 'cut';
  div.appendChild(btn10);

  const btn11 = document.createElement('button');
  btn11.textContent = 'paste';
  div.appendChild(btn11);

  const btn12 = document.createElement('button');
  btn12.textContent = 'to read mode';
  div.appendChild(btn12);

  document.body.append(div);
  // let triggerShape: any = null;
  const editor = new CommonFlowEditor({
    container: div,
    graphSize: [800, 600],
    setDefaultNode(node: any) {
      return {
        type: 'rect',
        radius: 4,
        width: 128,
        height: 45,
        label: node.name || node.id,

        anchors: [
          {
            show: 'hover',
            position: [0.5, 0],
            // size: 16,
            setStyles() {
              return {
                fillStyle: '#F3F9FF',
                strokeStyle: '#3073F2',
                cursor: 'crosshair',
              };
            },
          },
          {
            show: 'hover',
            position: [0.5, 1],
            // size: 16,
            setStyles() {
              return {
                fillStyle: '#F3F9FF',
                strokeStyle: '#3073F2',
                cursor: 'crosshair',
              };
            },
          },
        ],
      };
    },
    setNodeStateStyles(state: string) {
      if (state === 'select') {
        return { strokeStyle: '#5678D6' };
      }
      return {};
    },
    setDefaultEdge(edgeData) {
      return {
        type: edgeData.type,
        endArrow: true,
        hitWidth: 12,
      };
    },
    setEdgeStateStyles(state: string) {
      if (state === 'select') {
        return { strokeStyle: '#5678D6' };
      }
      return {};
    },
    setDefaultGroup(data) {
      return {
        strokeStyle: '#D9D9D9',
        fillStyle: '#FAFBFC',
        radius: 4,
        linkNode: true,
      };
    },
    scroller: {
      enable: false,
    },
    nodeMover: {
      options: {
        group: true,
        shouldTrigger(ev: any, triggerShape: any) {
          if (!triggerShape || ev.target.edges.length === 0) {
            return false;
          }
          if (!triggerShape.get) {
            // 由 Viewer 代理的事件

            if (['INPUT', 'TEXTAREA'].includes(triggerShape.tagName)) {
              return false;
            }
            // 祖先中含锚点类即为锚点
            return !triggerShape?.closest('.xgraph-viewer-anchor');
          }
          return !triggerShape?.get('_anchor');
        },
        shouldDrop(e, target) {
          // 示例：禁止节点重叠
          // const nodes = target?.graph.getNodes();
          // const w1 = target?.configs.width ?? 0;
          // const h1 = target?.configs.height ?? 0;
          // const x1 = target?.configs.x ?? 0;
          // const y1 = target?.configs.y ?? 0;
          // for (const node of nodes) {
          //   if (node === target) {
          //     continue;
          //   }
          //   const { x, y, width, height } = node.configs;
          //   const lx = Math.abs(x - x1) - 0.5 * (w1 + width);
          //   const ly = Math.abs(y - y1) - 0.5 * (h1 + height);
          //   if (lx < 0 && ly < 0) {
          //     return false;
          //   }
          // }
          return true;
        },
        onDrag() {},
      },
    },
    gridStep: 10,
    shortcuts: {
      customShortcuts: (defaultShortcuts, stack) => {
        const shortcuts = defaultShortcuts;
        delete shortcuts.selectAll;
        shortcuts.paste.handler = (event: any) => {
          const status = stack?.execute('paste', { event, position: editor.getLastMousePosition() });
          if (!status) {
            console.log('paste 失败');
          } else {
            console.log('paste 成功');
            editor.selectionIntoView();
          }
        };
        return shortcuts;
      },
    },
    edgeEditor: {
      enable: true,
      options: {
        getEdgeConfigs(configs: any) {
          const { source, target } = configs;
          const sourceNode = graph.getNodeById(source);
          let count = 0;
          let first: Edge | null = null;
          sourceNode.edges.forEach((edge: Edge) => {
            if (
              (edge.get('source') === source && edge.get('target') === target) ||
              (edge.get('source') === target && edge.get('target') === source)
            ) {
              count++;
              if (!first) {
                first = edge;
              }
            }
          });
          if (count > 0) {
            return getDuplicateEdgeConfigs(first!, configs, count, 10);
          }
          return configs;
        },
      },
    },
    // edgeEditor: {
    //   enable: true,
    //   options: {
    //     editTerminal: true,
    //     shouldTrigger(e, shape, target, edge) {
    //       triggerShape = shape;
    //       triggerShape.set('edge', edge);
    //       return shape?.get('_anchor');
    //     },
    //     showAnchors(anchorConfigs, anchorShape, node) {
    //       if (triggerShape.get('_anchor')) {
    //         const shapeAnchorIndex = triggerShape.get('anchorIndex');
    //         const notEdit = !triggerShape.get('edge');
    //         return (anchorConfigs.index !== shapeAnchorIndex) === notEdit;
    //       } else {
    //         return false;
    //       }

    //     },
    //     shouldDrop(source, target, sourceAnchor, targetAnchor) {
    //       console.log(sourceAnchor, targetAnchor);
    //       return targetAnchor !== sourceAnchor;
    //     },
    //   }
    // },
  });
  registerSpTurningLine(editor.getComponent('grid')!);
  editor.getGraph().refresh();

  editor.stack.collab = true;
  editor.getGraph().on('stackchange', (data) => {
    console.log(data);
  });
  customReadLaxMode(editor);

  const graph = editor.graph;

  // 不直接布局。
  const layout = new DAGLayout({ graph: editor.getGraph() });
  layout.graph = graph;

  editor.data({
    nodes: [
      { id: 'Task1', x: 320, y: 80 },
      { id: 'Task2', x: 520, y: 210 },
      { id: 'Task3', x: 120, y: 210 },
    ],
    edges: [
      {
        source: 'Task1',
        target: 'Task2',
        controlPoints: [
          [320, 140],
          [520, 140],
          [520, 150],
        ],
      },
      {
        source: 'Task1',
        target: 'Task3',
        controlPoints: [
          [320, 150],
          [120, 150],
        ],
      },
    ],
    groups: [
      {
        children: ['Task1', 'Task3'],
      },
    ],
  });

  graph.on('edge:click', (e: any) => {
    console.log(e.target);
  });

  graph.on('edge:dblclick', (e: any) => {
    const edge = e.target;
    console.log('edge:dblclick');
    editor.updateEdge(edge, { strokeStyle: 'green' });
  });

  graph.addBehavior(attachableDragNode, {
    delegate: false,
    shouldTrigger(ev: GraphEvent) {
      return ev.target.edges.length === 0;
    },
    onDragStart(node: Node) {
      // 被拖拽节点置于上层
      node.toFront();
    },
    shouldDrop(e: GraphEvent, node: Node, relativeNode: Node) {
      node.removeState('dragging');
      relativeNode?.removeState('attached');
      return !!relativeNode;
    },
    onDrop(node: Node, relativeNode: Node) {
      graph.add('edge', { target: node.get('id'), source: relativeNode.get('id') });
    },
  });

  edgeInsertNodeBehavior(editor);

  aside.ondragstart = (e: any) => {
    e.dataTransfer?.setData('taskType', '11222');
  };

  const canvas = graph.getCanvasDom();
  let node: any = null;

  canvas.ondragover = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!node) {
      const point = editor.getGraph().clientToCanvas(e.clientX, e.clientY);
      node = graph.add('node', {
        x: point.x,
        y: point.y,
        temp: true,
        name: `新增节点${graph.getNodes().length}`,
        taskType: e.dataTransfer.getData('taskType'),
      });
      graph.emit('node:mousedown', {
        nativeEvent: e,
        clientX: e.clientX,
        clientY: e.clientY,
        target: node,
      });
    } else {
      graph.emit('mousemove', {
        nativeEvent: e,
        clientX: e.clientX,
        clientY: e.clientY,
        target: node,
      });
    }
  };

  canvas.ondrop = () => {
    const e = new Event('mouseup');
    document.body.dispatchEvent(e);
    node.set('temp', false);
    node = null;
  };
  (window as any).editor = editor;
  (window as any).graph = graph;

  btn.onclick = () => {
    console.log(JSON.stringify(graph.getData(getDefaultBizData)));
  };

  btn1.onclick = () => {
    editor.undo();
  };
  btn2.onclick = () => {
    editor.redo();
  };
  btn3.onclick = () => {
    editor.getGraph()?.scale(1.25);
  };
  btn4.onclick = () => {
    editor.getGraph()?.scale(0.8);
  };
  btn5.onclick = () => {
    editor.getGraph()?.focus(editor.getGraph().getNodes()[0]);
  };

  btn6.onclick = () => {
    if (btn6.textContent === 'select') {
      btn6.textContent = 'unselect';
      graph.removeBehavior(dragCanvas);
      graph.addBehavior(brushSelect, {
        targets: ['node', 'edge'],
        onSelect(item: Node | Edge) {
          if (item.type === 'edge') {
            if ((item.source as Node).states.includes('select') && (item.source as Node).states.includes('select')) {
              item.toFront();
              item.setState('select');
              return true;
            } else {
              item.removeState('select');
              return false;
            }
          }
          item.toFront();
          item.setState('select');
          return true;
        },
        onDeselect(item: Node | Edge) {
          item.removeState('select');
        },
        onChange(selected: any[]) {
          editor.getStack().execute('select', { selections: selected });
          // this.graph.set('_selections', { node: selected.map((d) => d.get('id')) });
        },
      });
    } else {
      btn6.textContent = 'select';
      graph.addBehavior(dragCanvas);
      graph.removeBehavior(brushSelect);
    }
  };

  btn7.onclick = () => {
    const formerData = editor.getSnapshot();
    layout.layout();
    editor.refreshEdgesPath();
    graph.alignView('cc');
    const currentData = editor.getSnapshot();
    // gridShape(editor.graph, editor.graph.get('_grid'));
    editor.batchChange({ formerData, currentData });
  };
  btn8.onclick = () => {
    editor.clear();
  };

  btn9.onclick = () => {
    editor.copy();
  };
  btn10.onclick = () => {
    editor.cut();
  };
  btn11.onclick = () => {
    editor.paste();
  };
  btn12.onclick = () => {
    if (btn12.textContent === 'to read mode') {
      btn12.textContent = 'to read-lax mode';
      btn7.disabled = true;
      editor.changeMode('read');
    } else if (btn12.textContent === 'to read-lax mode') {
      btn7.disabled = false;
      btn12.textContent = 'to edit mode';
      editor.getComponent('nodeMover')?.enable();
      editor.getComponent('edgeEditor')?.disable();
      editor.changeMode('read-lax');
    } else {
      btn7.disabled = false;
      btn12.textContent = 'to read mode';
      editor.changeMode('edit');
    }
  };
})();

function customReadLaxMode(editor: CommonFlowEditor) {
  const commands = editor.getCommands();
  commands['select'].mode = ['edit', 'read', 'read-lax'];
  commands['copy'].mode = ['edit', 'read', 'read-lax'];
  commands['moveNode'].mode = ['edit', 'read-lax'];
  commands['batch'].mode = ['edit', 'read-lax'];
}

function edgeInsertNodeBehavior(editor: CommonFlowEditor) {
  const graph = editor.getGraph();
  const icon = new Icon({
    x: 100,
    y: 100,
    size: 16,
    fillStyle: '#25a868',
    background: {},
    icon: '&#xe606;',
  });
  graph.getContainer().add(icon);
  icon.toFront();
  icon.hide();
  let timer: any;
  let lastEdge: Edge | null = null;
  graph.on('edge:mouseenter', (e: any) => {
    const edge = e.target as Edge;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!timer || lastEdge !== edge) {
      lastEdge = edge;
      const { x, y } = edge.getKeyShape().getPointAt(0.5);
      icon.set('x', x);
      icon.set('y', y);
      icon.set('targetEdge', edge);
      icon.show();
      graph.draw();
    }
  });
  graph.on('change', (e: any) => {
    icon.hide();
  });
  icon.on('mouseenter', () => {
    clearTimeout(timer);
    timer = null;
  });
  icon.on('mouseleave', () => {
    timer = setTimeout(() => {
      icon.hide();
      graph.draw();
      timer = null;
    }, 200);
  });
  icon.on('click', () => {
    editor.insertNode(icon.get('targetEdge'));
    icon.hide();
    graph.draw();
  });
  graph.on('edge:mouseleave', (e: any) => {
    timer = setTimeout(() => {
      icon.hide();
      graph.draw();
      timer = null;
    }, 200);
  });
}
