---
category: examples
group: editor
title: Pipeline Editing - React Node
cover:
link: editor/dagFlowEditorReact
option:
---
# Pipeline Editing - React Node

Build a DAG easily by clicking icons. React nodes provide more possibilities for node rendering and interactions. Compared with drag-and-drop node/edge editing, it is less flexible, but it is more efficient and produces higher-quality DAGs.
<br>Interactions: <code>hover node</code> to show direct upstream/downstream relations and node action icons; <code>click icon</code> to add a node (and its relation) in the icon direction or delete the current node; <code>click undo</code> undo; <code>click redo</code> redo; <code>click export data</code> export current graph data.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Trigger } from '@arco-design/web-react';

import { DAGFlowEditor, highlightRelations } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import {
  IconPlusCircle,
  IconCloseCircle,
  IconDownload,
} from '@arco-design/web-react/icon';

function initEditor() {
  const container = document.getElementById(CONTAINER_ID);
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const editor = new DAGFlowEditor({
    container,
    graphSize: [width, height],
    renderMode: 'dom',
    scroller: {
      enable: false,
    },
    layout: {
      rankDir: 'TB',
      rankSep: 50,
    },
    mask: {
      enable: false,
    },
    onChange() {
      console.log('changed');
    },
    setDefaultNode(nodeData) {
      return {
        width: 140,
        height: 40,
        strokeStyle: null,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
      };
    },
    setDefaultEdge() {
      return {
        // type: 'lineCurve',
        type: 'vLine',
        styles: {
          curvePosition: 1,
          curveOffset: -25,
        },
      };
    },
    setEdgeStateStyles(state) {
      if (state === 'active') {
        return {
          strokeStyle: '#3073F2',
        };
      }
      return {}
    },
  });
  const graph = editor.getGraph();
  graph.addBehavior(highlightRelations);
  return editor;
}

function App() {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    setEditor(initEditor());
  }, []);

  function setNode(node) {
    const id = node.get('id');
    let border = '';
    if (node.hasState('select') || node.hasState('active')) {
      border = '1px solid #3073FF';
    }
    return (
      <Trigger
        popupAlign={{ top: 8 }}
        popup={() => (
          <div
            style={{
              border: '1px solid #E1E4EB',
              borderRadius: 4,
              padding: '4px',
              background: '#fff',
              boxShadow: '0px 8px 8px 0px rgba(33, 37, 44, 0.04)',
            }}
          >
            <IconDownload style={{ color: '#89909D' }} />
            <span style={{ padding: '0 4px', color: '#E1E4E8' }}>|</span>
            <IconCloseCircle
              style={{ color: '#89909D' }}
              onClick={(e) => {
                e.stopPropagation();
                if (editor) editor.removeNode(id);
              }}
            />
          </div>
        )}
        clickToClose
        showArrow={false}
        position="tr"
      >
        <div
          className="node-container"
          style={{
            position: 'relative',
            border,
            borderRadius: 4,
            width: 140,
            height: 40,
            padding: '8px 12px',
            background: node.hasState('select') ? '#EDF6FF' : '#fff',
          }}
        >
          {id}
          <IconPlusCircle
            fontSize={16}
            style={{
              position: 'absolute',
              left: -8,
              top: 12,
              color: '#3073F2',
              backgroundColor: '#FFF',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (editor) editor.addSiblingBefore(id);
            }}
          />
          <IconPlusCircle
            style={{
              position: 'absolute',
              left: 132,
              top: 12,
              color: '#3073F2',
              backgroundColor: '#FFF',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (editor) editor.addSiblingAfter(id);
            }}
          />
          <IconPlusCircle
            style={{
              position: 'absolute',
              left: 62,
              top: -8,
              color: '#3073F2',
              backgroundColor: '#FFF',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (editor) editor.addSource(id);
            }}
          />
          <IconPlusCircle
            style={{
              position: 'absolute',
              left: 62,
              top: 32,
              color: '#3073F2',
              backgroundColor: '#FFF',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (editor) editor.addTarget(id);
            }}
          />
        </div>
      </Trigger>
    );
  }
  return (
    <div>
      <button
        onClick={() => {
          if (editor) editor.undo();
        }}
      >
        undo
      </button>
      <button
        onClick={() => {
          if (editor) editor.redo();
        }}
      >
        redo
      </button>
      <button
        onClick={() => {
          console.log(editor ? editor.exportData() : null);
        }}
      >
        export data
      </button>
      {editor && (
        <Viewer
          graph={editor.getGraph()}
          setNode={setNode}
        />
      )}
    </div>
  );
}
const style = document.createElement('style');
style.appendChild(document.createTextNode(`
.node-container {
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.node-container svg {
  border-radius: 8px;
  display: none;
}

.node-container:hover {
  border: 1px solid #3074ff;
  box-shadow: 0px 8px 8px 0px rgba(33, 37, 44, 0.04);
}

.node-container:hover svg {
  display: block;
}

.vgraph-trigger-container {
  border: 1px solid #e1e4eb;
  border-radius: 4px;
  padding: 4px;
  background: #fff;
  box-shadow: 0px 8px 8px 0px rgba(33, 37, 44, 0.04);
}

`));
document.getElementsByTagName('head')[0].appendChild(style);
ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
