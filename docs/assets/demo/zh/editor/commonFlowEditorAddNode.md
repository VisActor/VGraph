---
category: examples
group: editor
title: 有向图自由编辑-快速添加节点
cover:
link: editor/commonFlowEditorAddNode
option:
---
# 有向图自由编辑-快速添加节点

单纯拖拉拽的方式编辑关系图的编辑效率不高。本示例展示了一种通过拖拽连线到空白处实现快速添加节点的实现方式。
<br> 交互方式：拖拉拽节点或锚点编辑；拖拽连线时未连接具体节点时在连线末端添加一个新的节点.快捷键： <code> ctrl + z </code> 撤销；<code> ctrl + shift + z </code> 重做； <code> ctrl + c/x/v </code> 复制/剪切/粘贴； <code> ctrl + a </code> 全选；<code> backspace </code> 删除。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import { DAGLayout, CommonFlowEditor, insertStyles } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { getSetNode } from './node';
import { Sidebar } from './sidebar';
import { Toolbar } from './toolbar';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;
const GRAPH_CONTAINER_ID = 'graphContainer';

const cssElement = document.getElementById('vgraph-demo');
if (cssElement) {
  cssElement.innerHTML = '';
}
insertStyles(
  `
.vgraph-react-custom-node {
  border-radius: 4px;
  background-color: #fff;
  line-height: 40px;
  width: 140px;
  padding-left: 12px;
}
.vgraph-viewer-anchor {
  background-color: #fff;
  border: 1px solid #3073f2;
  border-radius: 50%;
}
.vgraph-react-custom-node:hover {
  border: 1px solid #3073F2;
}
.vgraph-viewer-anchor.vgraph-anchor-magnet {
  border: none;
  background-color: #3073F2;
  box-shadow: rgba(48, 115, 242, 0.2) 0 0 0 4px;
}
.vgraph-viewer-anchor.vgraph-anchor-editing {
  background-color: #3073F2;
}
`,
  'vgraph-demo'
);

const App = () => {
  const [editor, setEditor] = useState(null);
  const [graph, setGraph] = useState(null);

  useEffect(() => {
    const _editor = new CommonFlowEditor({
      container: GRAPH_CONTAINER_ID,
      graphSize: [width, height],
      renderMode: 'dom',
      edgeEditor: {
        options: {
          editTerminal: true,
          shouldDrop() {
            return true;
          },
          onDrop(edge) {
            if (!edge.get('target')) {
              const endPoint = edge.get('endPoint');
              const node = g.add('node', {
                x: endPoint[0] + 100,
                y: endPoint[1],
                name: `新增节点${g.getNodes().length}`,
                temp: true,
                relateEdgeId: edge.get('id')
              });
              edge.setTarget(node.get('id'));
              edge.set('targetAnchor', 0);
              const router = _editor.getComponent('router');
              if (router) {
                router.updateEdgePath(edge, true);
              }
              edge.updatePosition();
            }
          }
        }
      },
      setDefaultNode(node) {
        return {
          width: 140,
          height: 40,
          anchors: [
            { show: 'hover', position: [0, 0.5], temp: node.temp },
            { show: 'hover', position: [1, 0.5], temp: node.temp }
          ]
        };
      },
      setDefaultEdge() {
        return { type: 'hLine', endArrow: true, radius: 6, hitWidth: 6 };
      },
      setEdgeStateStyles(state) {
        if (state === 'select') return { strokeStyle: '#3073F2' };
        if (state === 'hover') return { strokeStyle: '#87CEFA' };
        return {};
      }
    });

    const g = _editor.getGraph();
    const dag = new DAGLayout({
      graph: g,
      options: {
        rankDir: 'LR',
        nodeSep: 30,
        rankSep: 150,
        allControlPoints: true
      }
    });
    g.set('layout', dag);
    g.on('edge:mouseenter', e => {
      e.target.toFront();
      g.setState(e.target, 'hover');
    });
    g.on('edge:mouseleave', e => {
      g.removeState(e.target, 'hover');
    });

    const canvas = g.getCanvasDom();
    canvas.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    canvas.ondrop = e => {
      const point = g.clientToCanvas(e.clientX, e.clientY);
      _editor.addNode({
        x: point.x,
        y: point.y,
        name: e.dataTransfer.getData('name'),
        taskType: e.dataTransfer.getData('taskType')
      });
    };

    setEditor(_editor);
    setGraph(g);
    return () => _editor.destroy();
  }, []);

  function setAnchor(node) {
    if (node.get('temp')) return null;
    return <div />;
  }
  function setAnchorClassName(_, anchor) {
    return anchor.magnet ? 'vgraph-anchor-magnet' : '';
  }

  const setNode = getSetNode(editor);

  return (
    <div>
      <div id={GRAPH_CONTAINER_ID} style={{ position: 'absolute', width: '100%', height: '100%' }}>
        {graph && editor ? (
          <Viewer
            graph={editor.getGraph()}
            setNode={setNode}
            setAnchor={setAnchor}
            setAnchorClassName={setAnchorClassName}
            localRendering={false}
          />
        ) : null}
      </div>
      <Sidebar />
      {editor ? <Toolbar editor={editor} /> : null}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
>>> node.tsx
import React from 'react';
import { IconBranch, IconLoop, IconBug } from '@arco-design/web-react/icon';

export function getSetNode(editor) {
  if (!editor) return null;
  const graph = editor.getGraph();
  function cancelAddNode(node) {
    graph.remove(node);
    editor.undo();
  }
  function addNode(node, item) {
    const edge = graph.getEdgeById(node.get('relateEdgeId'));
    const configs = edge.configs;
    editor.undo();
    graph.remove(node);
    const formerData = editor.getSnapshot();
    const n = graph.add('node', { x: node.get('x'), y: node.get('y'), name: item.name, taskType: item.type });
    delete configs.endPoint;
    configs.target = n.get('id');
    graph.add('edge', configs);
    editor.getStack().execute('select', { selections: [n] });
    const currentData = editor.getSnapshot();
    editor.batchChange({ formerData, currentData });
  }
  return node => {
    let border = node.hasState('select') ? '1px solid #3073F2' : '1px solid #E1E4EB';
    if (node.get('temp')) {
      const items = [
        { type: 'condition', name: '条件节点', icon: <IconBranch style={{ background: '#FF9D22', color: '#fff', marginRight: 4 }} /> },
        { type: 'loop', name: '循环节点', icon: <IconLoop style={{ background: '#FFC528', color: '#fff', marginRight: 4 }} /> },
        { type: 'debug', name: '调试节点', icon: <IconBug style={{ background: '#78AF4B', color: '#fff', marginRight: 4 }} /> }
      ];
      return (
        <div>
          <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: -1 }} onClick={e => { e.stopPropagation(); cancelAddNode(node); }} />
          <div style={{ border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#fff' }}>
            {items.map((item, i) => (
              <div key={item.type} style={{ padding: '4px 12px', borderTop: i === 0 ? 'none' : '1px solid #ccc' }} onClick={e => { e.stopPropagation(); addNode(node, item); }}>
                {item.icon}{item.name}
              </div>
            ))}
          </div>
        </div>
      );
    }
    let content = null;
    switch (node.get('taskType')) {
      case 'condition': content = <IconBranch style={{ background: '#FF9D22', color: '#fff', marginRight: 4 }} />; break;
      case 'loop': content = <IconLoop style={{ background: '#FFC528', color: '#fff', marginRight: 4 }} />; break;
      case 'debug': content = <IconBug style={{ background: '#78AF4B', color: '#fff', marginRight: 4 }} />; break;
      default: break;
    }
    return <div className="vgraph-react-custom-node" style={{ border }}>{content}{node.get('name')}</div>;
  };
}
>>> sidebar.tsx
import { IconBranch, IconLoop, IconBug } from '@arco-design/web-react/icon';

export const Sidebar = () => {
  const items = [
    { type: 'condition', name: '条件', icon: <IconBranch style={{ background: '#FF9D22', color: '#fff', marginRight: 4 }} /> },
    { type: 'loop', name: '循环', icon: <IconLoop style={{ background: '#FFC528', color: '#fff', marginRight: 4 }} /> },
    { type: 'debug', name: '调试', icon: <IconBug style={{ background: '#78AF4B', color: '#fff', marginRight: 4 }} /> }
  ];
  return (
    <div style={{ width: 108, border: '1px solid #F0F1F3', boxShadow: '0px 1px 8px 0px #00000014', padding: 10, position: 'absolute', zIndex: 2, background: '#fff', textAlign: 'center' }}>
      <b>节点类型</b>
      {items.map(item => {
        const name = `${item.name}节点`;
        return (
          <div key={item.type} style={{ marginTop: 6, border: '1px solid #E1E4EB', borderRadius: 4, cursor: 'grab' }} draggable onDragStart={e => {
            if (e.dataTransfer) {
              e.dataTransfer.setData('taskType', item.type);
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
import React from 'react';
import { Tooltip } from '@arco-design/web-react';

export const Toolbar = ({ editor }) => {
  const exportData = () => {
    const data = editor.getGraph().getData(entity => {
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
        target: entity.get('target')
      };
    });
    console.log(data);
  };

  const graph = editor.getGraph();
  const reLayout = () => {
    const layout = graph.get('layout');
    if (!layout) return;
    const formerData = editor.getSnapshot();
    layout.layout();
    editor.refreshEdgesPath();
    graph.alignView('cc');
    const currentData = editor.getSnapshot();
    editor.batchChange({ formerData, currentData });
  };

  const actions = [
    { name: '导出数据', handler: exportData, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96691.svg' },
    { name: '撤销', handler: () => editor.undo(), icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d7.svg' },
    { name: '重做', handler: () => editor.redo(), icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d84.svg' },
    { name: '放大', handler: () => graph.scale(1.1), icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97939.svg' },
    { name: '缩小', handler: () => graph.scale(0.9), icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96930.svg' },
    { name: '聚焦节点', handler: () => { const s = editor.getSelection(); if (s.node.length) graph.focus(graph.getNodeById(s.node[0])); }, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97164.svg' },
    { name: '布局', handler: reLayout, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96b57.svg' },
    { name: '复制', handler: () => editor.copy(), icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97484.svg' },
    { name: '粘贴', handler: () => editor.paste(), icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9705.svg' },
    { name: '剪切', handler: () => editor.cut(), icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9694.svg' }
  ];

  return (
    <div style={{ width: 'calc(100% - 108px)', position: 'absolute', right: 0, top: 8, zIndex: 10, height: 28, overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
      {actions.map(item => (
        <Tooltip key={item.name} content={item.name}>
          <span onClick={item.handler} style={{ marginRight: 8, border: '1px solid #E1E4E8', padding: '0 4px', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
            <img width="18px" height="18px" src={item.icon} />
          </span>
        </Tooltip>
      ))}
    </div>
  );
};
```
