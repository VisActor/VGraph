---
category: examples
group: editor
title: 有向图自由编辑-重复连线
cover:
link: editor/commonFlowEditorEdges
option:
---
# 有向图自由编辑-重复连线

在有向图自由编辑场景下，重复的连线会重叠在一起导致理解偏差, 可以通过 VGraph 的工具方法来优化展示。
<br> 交互方式：拖拉拽节点或锚点编辑关系图。 快捷键： <code> ctrl + z </code> 撤销；<code> ctrl + shift + z </code> 重做； <code> ctrl + c/x/v </code> 复制/剪切/粘贴； <code> ctrl + a </code> 全选；<code> backspace </code> 删除。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  CommonFlowEditor,
  brushSelect,
  getDuplicateEdgeConfigs
} from '@visactor/vgraph';
import { Sidebar } from './sidebar';
import { Toolbar } from './toolbar';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;
const GRAPH_CONTAINER_ID = 'graphContainer';

function App() {
  const [editorState, setEditor] = useState(null);

  useEffect(() => {
    const editor = new CommonFlowEditor({
      container: GRAPH_CONTAINER_ID,
      graphSize: [width, height],
      data: {
        nodes: [
          { id: 'Task1', x: 320, y: 80 },
          { id: 'Task2', x: 520, y: 210 },
          { id: 'Task3', x: 120, y: 210 }
        ],
        edges: [
          { source: 'Task1', target: 'Task2', controlPoints: [[320, 140], [520, 140]], sourceAnchor: 1, targetAnchor: 0 },
          { source: 'Task1', target: 'Task3', controlPoints: [[320, 140], [120, 140]], sourceAnchor: 1, targetAnchor: 0 }
        ]
      },
      setDefaultNode(nodeData) {
        return {
          radius: 4,
          width: 140,
          height: 40,
          label: nodeData.name || nodeData.id,
          anchors: [
            { show: 'hover', position: [0.5, 0], setStyles: () => ({ fillStyle: '#F3F9FF', strokeStyle: '#3073F2', cursor: 'crosshair' }) },
            { show: 'hover', position: [0.5, 1], setStyles: () => ({ fillStyle: '#F3F9FF', strokeStyle: '#3073F2', cursor: 'crosshair' }) }
          ]
        };
      },
      setNodeStateStyles(state) {
        if (state === 'select') return { strokeStyle: '#3073F2', fillStyle: '#EDF6FF' };
        if (state === 'hover') return { strokeStyle: '#3073F2' };
        return {};
      },
      setDefaultEdge() {
        return { type: 'vLine', endArrow: true, hitWidth: 6 };
      },
      setEdgeStateStyles(state) {
        if (state === 'select') return { strokeStyle: '#5678D6' };
        return {};
      },
      scroller: { enable: false },
      edgeEditor: {
        enable: true,
        options: {
          getEdgeConfigs(configs) {
            const source = configs.source;
            const target = configs.target;
            const sourceNode = graph.getNodeById(source);
            let count = 0;
            let first = null;
            sourceNode.edges.forEach(edge => {
              if (
                (edge.get('source') === source && edge.get('target') === target) ||
                (edge.get('source') === target && edge.get('target') === source)
              ) {
                count += 1;
                if (!first) first = edge;
              }
            });
            if (count > 0 && first) {
              return getDuplicateEdgeConfigs(first, configs, count, 10);
            }
            return configs;
          }
        }
      }
    });

    customReadLaxMode(editor);
    const graph = editor.graph;
    graph.on('edge:click', e => {
      e.target.toFront();
    });

    graph.addBehavior(brushSelect, {
      targets: ['node', 'edge'],
      shouldTrigger() {
        return false;
      },
      onSelect(item) {
        if (item.type === 'edge') {
          if (item.source.states.includes('select') && item.target.states.includes('select')) {
            item.toFront();
            item.setState('select');
            return true;
          }
          item.removeState('select');
          return false;
        }
        item.toFront();
        item.setState('select');
        return true;
      },
      onDeselect(item) {
        item.removeState('select');
      },
      onChange(selected) {
        editor.getStack().execute('select', { selections: selected });
      }
    });

    const brushBehavior = graph.behaviorManager.get('brushSelect');
    graph.behaviorManager.unbind(brushBehavior);

    const canvas = graph.getCanvasDom();
    canvas.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    canvas.ondrop = e => {
      const point = graph.clientToCanvas(e.clientX, e.clientY);
      editor.addNode({
        x: point.x,
        y: point.y,
        type: e.dataTransfer.getData('type') || 'rect',
        name: e.dataTransfer.getData('name') || `新增节点${graph.getNodes().length}`,
        taskType: e.dataTransfer.getData('taskType')
      });
    };

    setEditor(editor);
    return () => editor.destroy();
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div id={GRAPH_CONTAINER_ID} style={{ position: 'absolute' }} />
      <Sidebar />
      {editorState ? <Toolbar editor={editorState} /> : null}
    </div>
  );
}

function customReadLaxMode(editor) {
  const commands = editor.getCommands();
  commands.select.mode = ['edit', 'read', 'read-lax'];
  commands.copy.mode = ['edit', 'read', 'read-lax'];
  commands.moveNode.mode = ['edit', 'read-lax'];
  commands.batch.mode = ['edit', 'read-lax'];
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
>>> sidebar.tsx
import React from 'react';
import { IconBranch, IconLoop, IconBug } from '@arco-design/web-react/icon';

export const Sidebar = () => {
  const items = [
    {
      type: 'condition',
      name: '条件',
      icon: <IconBranch style={{ background: '#FF9D22', color: '#fff', marginRight: 4 }} />
    },
    {
      type: 'loop',
      name: '循环',
      icon: <IconLoop style={{ background: '#FFC528', color: '#fff', marginRight: 4 }} />
    },
    {
      type: 'debug',
      name: '调试',
      icon: <IconBug style={{ background: '#78AF4B', color: '#fff', marginRight: 4 }} />
    }
  ];
  return (
    <div style={{ width: 108, border: '1px solid #F0F1F3', boxShadow: '0px 1px 8px 0px #00000014', padding: 10, position: 'absolute', zIndex: 2, background: '#fff', textAlign: 'center' }}>
      <b>节点类型</b>
      {items.map(item => {
        const name = `${item.name}节点`;
        return (
          <div key={item.type} style={{ marginTop: 6, border: '1px solid #E1E4EB', borderRadius: 4, cursor: 'grab' }} draggable onDragStart={e => {
            if (e.dataTransfer) {
              e.dataTransfer.setData('name', name);
            }
          }}>
            {item.icon}{name}
          </div>
        );
      })}
    </div>
  );
};
>>> toolbar.tsx
import React, { useState } from 'react';
import { Tooltip } from '@arco-design/web-react';

export const Toolbar = ({ editor }) => {
  const [brushSelectState, setBrushSelectState] = useState('select');
  const [modeState, setModeState] = useState('edit');
  const graph = editor.getGraph();

  const toggleBrushSelect = () => {
    const drag = graph.getBehavior('dragCanvas');
    const brush = graph.getBehavior('brushSelect');
    if (brushSelectState === 'select') {
      setBrushSelectState('unselect');
      drag.shouldTrigger = () => false;
      brush.shouldTrigger = () => true;
    } else {
      setBrushSelectState('select');
      drag.shouldTrigger = () => true;
      brush.shouldTrigger = () => false;
    }
  };

  const toggleMode = () => {
    if (modeState === 'edit') {
      setModeState('read');
      editor.changeMode('read');
      return;
    }
    if (modeState === 'read') {
      setModeState('read-lax');
      const mover = editor.getComponent('nodeMover');
      const edgeEditor = editor.getComponent('edgeEditor');
      if (mover) mover.enable();
      if (edgeEditor) edgeEditor.disable();
      editor.changeMode('read-lax');
      return;
    }
    setModeState('edit');
    editor.changeMode('edit');
  };

  const modeMap = { edit: '编辑', read: '只读', 'read-lax': '只读-宽松' };
  const actions = [
    { name: '导出数据', handler: () => console.log(JSON.stringify(editor.exportData())) },
    { name: '撤销', handler: () => editor.undo() },
    { name: '重做', handler: () => editor.redo() },
    { name: '放大', handler: () => graph.scale(1.1) },
    { name: '缩小', handler: () => graph.scale(0.9) },
    { name: '聚焦节点', handler: () => { const s = editor.getSelection(); if (s.node.length) graph.focus(graph.getNodeById(s.node[0])); } },
    { name: '框选', handler: toggleBrushSelect },
    { name: '清空画布', handler: () => editor.clear(), disabled: modeState !== 'edit' },
    { name: '复制', handler: () => editor.copy() },
    { name: '粘贴', handler: () => editor.paste() },
    { name: '剪切', handler: () => editor.cut() },
    { name: `切换模式，当前模式：${modeMap[modeState]}`, handler: toggleMode }
  ];
  const iconMap = {
    导出数据: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96691.svg',
    撤销: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d7.svg',
    重做: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d84.svg',
    放大: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97939.svg',
    缩小: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96930.svg',
    聚焦节点: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97164.svg',
    框选: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18f04b44b5e34.svg',
    清空画布: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97141.svg',
    复制: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97484.svg',
    粘贴: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9705.svg',
    剪切: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9694.svg',
    切换模式: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9753.svg'
  };

  return (
    <div style={{ width: 'calc(100% - 108px)', position: 'absolute', right: 0, top: 8, zIndex: 1, height: 28, overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
      {actions.map(item => (
        <Tooltip key={item.name} content={item.disabled ? `${item.name}(阅读态不可用)` : item.name}>
          <span
            onClick={item.handler}
            style={{
              marginRight: 8,
              border: '1px solid #E1E4E8',
              padding: '0 4px',
              borderRadius: 4,
              background: item.disabled ? 'rgb(242, 243, 245)' : '#fff',
              cursor: item.disabled ? 'not-allowed' : 'pointer'
            }}
          >
            <img
              width="18px"
              height="18px"
              src={
                item.name.indexOf('切换模式') >= 0
                  ? iconMap['切换模式']
                  : iconMap[item.name]
              }
            />
          </span>
        </Tooltip>
      ))}
    </div>
  );
};
```
