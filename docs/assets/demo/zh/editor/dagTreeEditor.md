---
category: examples
group: editor
title: 树图编辑-React 节点
cover:
link: editor/dagTreeEditor
option:
---
# 树图编辑-React 节点

树图编辑场景不继承相对节点下游关系，示例包含插入节点与子树复制粘贴能力。<br>支持 undo/redo/export。

## 代码演示

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
    // edgeData 是一个连线实例通过 setDefaultEdge 之后 merge 的全量连线配置
    getConfigsForShape(edgeData) {
      // 大多数情况下直接使用内置连线绘制无须修改配置，相应的更新时也无须新增更新步骤
      return edgeData;
    },
    shape(layer, edgeConfigs) {
      const edge = layer.find(shape => shape.get('_keyShape'));
      // 获取连线中心点定位
      const p = edge.getPointAt(0.5);
      const icon = new Image({
        left: p.x - 8,
        top: p.y - 8,
        width: 16,
        height: 16,
        url:
          'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18f5710dba932.svg'
      });
      // 先隐藏，hover 连线时出现
      icon.hide();
      layer.add(icon);
      layer.set('icon', icon);
    },
    // 节点位置更新引发连线更新，icon 位置随之更新。如果不需要更新 icon 位置就可以不用覆写此方法
    afterUpdatePath(layer, configs) {
      const edge = layer.find(shape => shape.get('_keyShape'));
      // 在 shape 方法中将 icon 保存到了 layer 上，方便这里取出更新
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
                  if (success){
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
                  if (success){
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
