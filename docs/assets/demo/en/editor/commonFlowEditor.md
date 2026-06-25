---
category: examples
group: editor
title: Directed Graph Free Editing
cover:https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/common_flow_editor.gif
link: editor/commonFlowEditor
option:
---
# Directed Graph Free Editing

Users can freely arrange node positions and relationships via drag-and-drop, building and editing a DAG in a flexible way.
<br>Interactions: drag nodes or anchors to edit the graph. Shortcuts: <code>ctrl + z</code> undo; <code>ctrl + shift + z</code> redo; <code>ctrl + c/x/v</code> copy/cut/paste; <code>ctrl + a</code> select all; <code>backspace</code> delete.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import { CommonFlowEditor, brushSelect, DAGLayout } from '@visactor/vgraph';

import ReactDOM from 'react-dom';
import { Message } from '@arco-design/web-react';
import { Sidebar } from './sidebar';
import { Toolbar } from './toolbar';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

function App() {
  const [editorState, setEditor] = useState(null);
  useEffect(() => {
    const editor = new CommonFlowEditor({
      container: 'graphContainer',
      graphSize: [width, height],
      data: {
        nodes: [{ id: 'Task1', x: 320, y: 80 }, { id: 'Task2', x: 520, y: 210 }, { id: 'Task3', x: 120, y: 210 }],
        edges: [{ source: 'Task1', target: 'Task2', controlPoints: [[320, 140], [520, 140]], sourceAnchor: 1, targetAnchor: 0 }, { source: 'Task1', target: 'Task3', controlPoints: [[320, 140], [120, 140]], sourceAnchor: 1, targetAnchor: 0 }],
      },
      setDefaultNode(nodeData) {
        return {
          radius: 4,
          width: 140,
          height: 40,
          label: nodeData.name || nodeData.id,
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
      setNodeStateStyles(state) {
        if (state === 'select') {
          return { strokeStyle: '#3073F2', fillStyle: '#EDF6FF' }
        }
        if (state === 'hover') {
          return { strokeStyle: '#3073F2' };
        }
        return {};
      },
      setDefaultEdge() {
        return {
          type: 'vLine',
          endArrow: true,
          hitWidth: 6,
        };
      },
      setEdgeStateStyles(state) {
        if (state === 'select') {
          return { strokeStyle: '#5678D6' }
        }
        return {};
      },
      scroller: {
        enable: false,
      },
      // Custom shortcuts
      shortcuts: {
        customShortcuts: (defaultShortcuts, stack) => {
          const shortcuts = defaultShortcuts;
          // Custom prompt for paste success/failure
          shortcuts.paste.handler = event => {
            const status = stack && stack.execute('paste', { event, position: editor.getLastMousePosition() });
            if (!status) {
              Message.error('paste failed');
            } else {
              Message.success('paste succeeded');
              editor.selectionIntoView();
            }
          }
          return shortcuts;
        },
      },
    });
    // The command supports three different modes, see the command documentation for details
    customReadLaxMode(editor);

    const graph = editor.graph;

    // Do not layout directly
    const layout = new DAGLayout({ graph });
    graph.set('customLayout', layout);
    graph.refresh();
    graph.alignView('cc');

    graph.on('edge:click', (e) => {
      e.target.toFront();
    });
    
    // Add multiple selection box interaction
    graph.addBehavior(brushSelect, {
      targets: ['node', 'edge'],
      // Not triggered by default
      shouldTrigger() {
        return false;
      },
      onSelect(item) {
        if (item.type === 'edge') {
          if (item.source.states.includes('select') && item.target.states.includes('select')) {
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
      onDeselect(item) {
        item.removeState('select');
      },
      onChange(selected) {
        editor.getStack().execute('select', { selections: selected })
        // this.graph.set('_selections', { node: selected.map((d) => d.get('id')) });
      },
    });

    const canvas = graph.getCanvasDom();

    canvas.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }

    canvas.ondrop = e => {
      const { clientX, clientY } = e;
      const point = graph.clientToCanvas(clientX, clientY);
      editor.addNode({
        type: e.dataTransfer.getData('type') || 'rect',
        x: point.x,
        y: point.y,
        name: e.dataTransfer.getData('name') || `New Node ${graph.getNodes().length}`,
        taskType: e.dataTransfer.getData('taskType')

      });
    }
    setEditor(editor);

    return () => {
      editor.destroy();
    }
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div id="graphContainer" style={{ position: 'absolute' }} />
      <Sidebar />
      {editorState && <Toolbar editor={editorState} />}
    </div>
  )
}

function customReadLaxMode(editor) {
  const commands = editor.getCommands();
  commands['select'].mode = ['edit', 'read', 'read-lax'];
  commands['copy'].mode = ['edit', 'read', 'read-lax'];
  commands['moveNode'].mode = ['edit', 'read-lax'];
  commands['batch'].mode = ['edit', 'read-lax'];
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
>>> sidebar.tsx
import React from 'react';
export const Sidebar = () => {
  return <div style={{  width: 108, border: '1px solid #F0F1F3', boxShadow: '0px 1px 8px 0px #00000014', padding: 10, position: 'absolute', zIndex: 2, background: '#fff', textAlign: 'center' }}>
    <b>Node Type</b>

    {['1', '2', '3'].map(type => {
      const name = `Type ${type} Node`;
      return <div 
        style={{ marginTop: 6, border: '1px solid #E1E4EB', borderRadius: 4, cursor: 'grab' }}
        draggable
        onDragStart={(e) => { if (e.dataTransfer) e.dataTransfer.setData('name', name); }}
      >
        {name}
      </div>
    })}
  </div>
}
>>> toolbar.tsx
import React, { useState } from 'react';
import { Tooltip } from '@arco-design/web-react';
import { CommonFlowEditor, brushSelect } from '@visactor/vgraph';

export const Toolbar = ({ editor }) => {
  const [brushSelectState, setBrushSelectState] = useState('select');
  const [modeState, setModeState] = useState('edit');
  const exportData = () => {
    console.log(JSON.stringify(editor.exportData()));
  }
  const undo = () => {
    editor.undo();
  }
  const redo = () => {
    editor.redo();
  }
  const zoomIn = () => {
    const g = editor.getGraph(); if (g) g.scale(1.1);
  }
  const zoomOut = () => {
    const g = editor.getGraph(); if (g) g.scale(0.9);
  }
  const focusNode = () => {
    const selection = editor.getSelection();
    const graph = editor.getGraph();
    if (selection.node.length > 0) {
      graph.focus(graph.getNodeById(selection.node[0]));
    }
  }
  const graph = editor.getGraph();

  const toggleBrushSelect = () => {
    const drag = graph.getBehavior('dragCanvas');
    const brush = graph.getBehavior('brushSelect');

    if (brushSelectState === 'select') {
      setBrushSelectState('unselect');
      drag.shouldTrigger = () => false;
      brush.shouldTrigger = () => true;
      
    } else {
      setBrushSelectState('select')
      drag.shouldTrigger = () => true;
      brush.shouldTrigger = () => false;
    }
  }

  const layout = graph.get('customLayout');
  const reLayout = () => {
    const formerData = editor.getSnapshot();
    layout.layout();
    editor.refreshEdgesPath();
    graph.alignView('cc');
    const currentData = editor.getSnapshot();
    editor.batchChange({ formerData, currentData });
  }
  const clear = () => {
    editor.clear();
  }

  const copy = () => {
    editor.copy();
  }
  const cut = () => {
    editor.cut();
  }
  const paste = () => {
    editor.paste();
  }
  const toggleMode = () => {
    if (modeState === 'edit') {
      setModeState('read');
      editor.changeMode('read');
    } else if (modeState === 'read') {
      setModeState('read-lax')
      const mover = editor.getComponent('nodeMover'); if (mover) mover.enable();
      const edgeEditor = editor.getComponent('edgeEditor'); if (edgeEditor) edgeEditor.disable();
      editor.changeMode('read-lax');
    } else {
      setModeState('edit');
      editor.changeMode('edit');
    }
  }
  const modeStateMap = {
    'edit': 'Edit',
    'read': 'Read-only',
    'read-lax': 'Read-only-Lax'
  }
  const actions = [
    {name: 'Export Data', handler: exportData, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96691.svg'},
    {name: 'Undo', handler: undo, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d7.svg'},
    {name: 'Redo', handler: redo, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d84.svg'},
    {name: 'Zoom In', handler: zoomIn, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97939.svg'},
    {name: 'Zoom Out', handler: zoomOut, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96930.svg'},
    {name: 'Focus Node', handler: focusNode, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97164.svg'},
    {name: 'Brush Select', handler: toggleBrushSelect, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18f04b44b5e34.svg'},
    {name: 'Layout', handler: reLayout, disabled: modeState !== 'edit', icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96b57.svg'},
    {name: 'Clear Canvas', handler: clear, disabled: modeState !== 'edit', icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97141.svg'},
    {name: 'Copy', handler: copy, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97484.svg'},
    {name: 'Paste', handler: paste, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9705.svg'},
    {name: 'Cut', handler: cut, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9694.svg'},
    {name: `Toggle Mode, Current: ${modeStateMap[modeState]}`, handler: toggleMode, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9753.svg'}
  ];
  return <div style={{ width: 'calc(100% - 108px)', position: 'absolute', right: 0, top: 8, zIndex: 1, height: 28, overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
    {actions.map(item => {
      if (item.disabled) {
        return <Tooltip content={`${item.name}(Read-only mode disabled)`}>
          <span onClick={item.handler} style={{ marginRight: 8, border: '1px solid #E1E4E8', padding: '0 4px', borderRadius: 4, background: 'rgb(242, 243, 245)', cursor: 'not-allowed' }}>
            <img width="18px" height="18px" src={item.icon} />
          </span>
        </Tooltip>
      }
      return <Tooltip content={item.name}>
        <span onClick={item.handler} style={{ marginRight: 8, border: '1px solid #E1E4E8', padding: '0 4px', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
          <img width="18px" height="18px" src={item.icon} />
        </span>
      </Tooltip>
    })}
  </div>
}
```
