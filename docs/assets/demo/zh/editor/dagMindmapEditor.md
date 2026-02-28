---
category: examples
group: editor
title: 思维导图编辑
cover:
link: editor/dagMindmapEditor
option:
---
# 思维导图编辑

与树图编辑交互类似，仅布局不同，支持新增左右子树。<br>支持 undo/redo/export。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Trigger, Message } from '@arco-design/web-react';

import { DAGFlowEditor, highlightRelations } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import {
  IconPlusCircle,
  IconCloseCircle,
  IconCopy,
  IconPaste,
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
      rankDir: 'LR',
      rankSep: 50,
      coordAssignment: 'treeLike',
      setTreePosition: data => {
        const left = [];
        const right = [];
        data.children.forEach(child => {
          if (child.position === 'left') {
            left.push(child);
          } else {
            right.push(child);
          }
        });
        return {
          leftTree: {
            id: data.id,
            width: data.width,
            height: data.height,
            children: left,
          },
          rightTree: {
            id: data.id,
            width: data.width,
            height: data.height,
            children: right,
          },
        };
      },
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
          [0, 0.5],
          [1, 0.5],
        ],
      };
    },
    setDefaultEdge() {
      return {
        type: 'hLine',
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
  graph.alignView('cc');
  graph.addBehavior(highlightRelations);
  // 鼠标移入连线出现 icon
  graph.on('edge:mouseenter', (e) => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.show();
    graph.draw();
  });

  // 鼠标移出 icon 消失
  graph.on('edge:mouseleave', (e) => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.hide();
    graph.draw();
  });

  // 点击连线 icon 在两端中间添加节点
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
                  if (success) {
                    Message.success('复制节点子树成功');
                  } else {
                    Message.error('复制节点子树失败');
                  }
                });
              }}
            />
            <span style={{ padding: '0 4px', color: '#E1E4E8' }}>|</span>
            <IconPaste
              style={{ color: '#89909D' }}
              onClick={() => {
                if (editor) editor.paste(node).then(success => {
                  if (success) {
                    Message.success('粘贴成功');
                  } else {
                    Message.error('粘贴失败');
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
            background: node.hasState('select') ? '#EDF6FF' : '#fff',
          }}
        >
          {id}
          {node.get('position') !== 'left' && <IconPlusCircle
            style={{
              position: 'absolute',
              left: 132,
              top: 12,
              color: '#3073F2',
              backgroundColor: '#FFF',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (editor) editor.addTarget(id, { position: 'right' }, false);
            }}
          />}
          {node.get('position') !== 'right' && <IconPlusCircle
            style={{
              position: 'absolute',
              left: -8,
              top: 12,
              color: '#3073F2',
              backgroundColor: '#FFF',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (editor) editor.addTarget(id, { position: 'left' }, false);
            }}
          />}
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
      {editor && <Viewer graph={editor.getGraph()} setNode={setNode} />}
    </div>
  );
}
const style = document.createElement('style');
style.appendChild(
  document.createTextNode(`
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

`)
);
document.getElementsByTagName('head')[0].appendChild(style);
ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
