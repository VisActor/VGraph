---
category: examples
group: editor
title: Tree Editing - React Node
cover:
link: editor/dagTreeEditor
option:
---
# Tree Editing - React Node

Tree diagram editing scenario does not inherit the downstream relationship of relative nodes. The example includes the ability to insert nodes and copy and paste subtrees.<br/>Supports undo/redo/export.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Trigger, Message } from '@arco-design/web-react';

import { DAGFlowEditor, highlightRelations, registerEdge, Image, unRegisterEdge } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import {
  IconPlusCircle,
  IconCloseCircle,
  IconCopy,
  IconPaste,
} from '@arco-design/web-react/icon';

function initEditor() {
  unRegisterEdge('iconEdge');
  registerEdge('iconEdge', {
    extends: 'vLine',
    // edgeData is the full edge configuration after being merged by setDefaultEdge
    getConfigsForShape(edgeData) {
      // In most cases, there is no need to modify the configuration for built-in edge drawing, and no new update steps are needed for corresponding updates
      return edgeData;
    },
    shape(layer, edgeConfigs) {
      const edge = layer.find(shape => shape.get('_keyShape'));
      // Get the center point of the edge for positioning
      const p = edge.getPointAt(0.5);
      const icon = new Image({
        left: p.x - 8,
        top: p.y - 8,
        width: 16,
        height: 16,
        url:
          'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18f5710dba932.svg'
      });
      // Hide first, show on edge hover
      icon.hide();
      layer.add(icon);
      layer.set('icon', icon);
    },
    // Node position update triggers edge update, icon position is updated accordingly. If you don't need to update the icon position, you can skip overriding this method
    afterUpdatePath(layer, configs) {
      const edge = layer.find(shape => shape.get('_keyShape'));
      // The icon was saved to the layer in the shape method, making it easy to retrieve and update here
      const icon = layer.get('icon');
      const p = edge.getPointAt(0.5);
      icon.set({ left: p.x - 8, top: p.y - 8 });
    }
  });
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
      coordAssignment: 'treeLike',
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
        type: 'iconEdge',
      };
    },
    setEdgeStateStyles(state) {
      if (state === 'active') {
        return {
          strokeStyle: '#3073F2',
        };
      }
      return {};
    },
  });
  const graph = editor.getGraph();
  graph.addBehavior(highlightRelations);
  // Show icon on edge mouseenter
  graph.on('edge:mouseenter', (e) => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.show();
    graph.draw();
  });

  // Hide icon on mouseleave
  graph.on('edge:mouseleave', (e) => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.hide();
    graph.draw();
  });

  // Add node between two ends when clicking the edge icon
  graph.on('edge:click', (e) => {
    if (e.relatedTarget.type === 'image') {
      editor.addNode(e.target);
    }
  });

  return editor;
}

function App() {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    setEditor(initEditor());
  }, []);

  function setNode(node) {
    const id = node.get('id');
    let border = null;
    if (node.hasState('select') || node.hasState('active')) {
      border = '1px solid #3073F2';
    }
    return (
      <Trigger
        popupAlign={{ top: 8 }}
        popup={() => (
          <div className="vgraph-trigger-container">
            <IconCopy
              style={{ color: '#89909D' }}
              onClick={() => {
                
                if (editor) editor.copy(node, true).then(success => {
                  if (success){
                    Message.success('Subtree copied successfully');
                  } else {
                    Message.error('Failed to copy subtree');
                  }
                });
              }}
            />
            <span style={{ padding: '0 4px', color: '#E1E4E8' }}>|</span>
            <IconPaste
              style={{ color: '#89909D' }}
              onClick={() => {
                if (editor) editor.paste(node).then(success => {
                  if (success){
                    Message.success('Pasted successfully');
                  } else {
                    Message.error('Failed to paste');
                  }
                });
              }}
            />
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
            background: node.hasState('select') ? '#EDF6FF' : '#fff'
          }}
        >
          {id}
          <IconPlusCircle
            style={{
              position: 'absolute',
              left: 62,
              top: 32,
              color: '#3073F2',
              backgroundColor: '#FFF'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (editor) editor.addTarget(id, {}, false);
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
