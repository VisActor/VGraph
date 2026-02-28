---
category: examples
group: editor
title: 有向图自由编辑-限制分组移动
cover:
link: editor/commonFlowEditorLimitGroup
option:
---
# 有向图自由编辑-限制分组移动

在有向图自由编辑场景下，固定分组大多用于区分不同阶段、逻辑分区等，一些场景下需要将节点限制在不同阶段中。<br>交互方式：拖拉拽节点或锚点编辑关系图。快捷键：<code>ctrl + z</code> 撤销；<code>ctrl + shift + z</code> 重做；<code>ctrl + c/x/v</code> 复制/剪切/粘贴；<code>ctrl + a</code> 全选；<code>backspace</code> 删除。

## 关键配置

- `CommonFlowEditor.nodeMover.options.getLimitBox`：限制节点可拖拽范围。
- `setDefaultGroup`：配置固定分组区域和标题区域。
- 侧边拖拽面板 + `canvas.ondrop`：按落点自动写入目标分组。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import { CommonFlowEditor, insertStyles } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from './sidebar';
import { TagNode } from './node';
import { Toolbar } from './toolbar';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

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
  let dragging = false;

  useEffect(() => {
    const groupHeight = height / 3;
    const data = {
      nodes: [],
      edges: [],
      groups: ['Stage1', 'Stage2', 'Stage3'].map((id, i) => ({
        id,
        fixLeft: 72,
        fixTop: groupHeight * i,
        fixWidth: width - 72,
        fixHeight: groupHeight
      }))
    };
    const _editor = new CommonFlowEditor({
      container: CONTAINER_ID,
      graphSize: [width, height],
      renderMode: 'dom',
      setDefaultNode(nodeData) {
        return {
          width: nodeData.width || 140,
          height: nodeData.height || 40,
          anchors: [
            { show: 'hover', position: [0.5, 0] },
            { show: 'hover', position: [0.5, 1] }
          ]
        };
      },
      setDefaultEdge() {
        return {
          type: 'vLine',
          endArrow: true
        };
      },
      setEdgeStateStyles(state) {
        if (state === 'select') {
          return { strokeStyle: '#5678D6' };
        }
        if (state === 'hover') {
          return { strokeStyle: '#3073F2' };
        }
        return {};
      },
      setDefaultGroup(groupData) {
        return {
          linkNode: true,
          strokeStyle: '#D9D9D9',
          fillStyle: null,
          radius: 4,
          padding: 0,
          titlePosition: 'left',
          titleSize: 72,
          title: {
            text: { text: groupData.id, fillStyle: '#626978', y: groupHeight / 2 },
            background: { fillStyle: '#F0F3F6' }
          }
        };
      },
      nodeMover: {
        options: {
          autoTranslate: false,
          getLimitBox(target) {
            const group = target.belong;
            if (!group) {
              return null;
            }
            const bbox = group.getBBox();
            return {
              left: bbox.left + 72,
              top: bbox.top,
              width: bbox.width - 72,
              height: bbox.height
            };
          }
        }
      },
      edgeEditor: {
        options: {
          onDragStart() {
            dragging = true;
          },
          onDrop() {
            dragging = false;
          }
        }
      }
    });
    const g = _editor.getGraph();
    g.data(data);
    g.on('edge:mouseenter', e => {
      if (dragging) {
        return;
      }
      e.target.toFront();
      g.setState(e.target, 'hover');
    });
    g.on('edge:mouseleave', e => {
      if (dragging) {
        return;
      }
      g.removeState(e.target, 'hover');
    });

    const canvas = g.getCanvasDom();
    canvas.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    canvas.ondrop = e => {
      const point = g.clientToCanvas(e.clientX, e.clientY);
      let group = 'Stage1';
      const sectionHeight = height / 3;
      if (point.y > sectionHeight && point.y < sectionHeight * 2) {
        group = 'Stage2';
      } else if (point.y > sectionHeight * 2) {
        group = 'Stage3';
      }
      _editor.addNode({
        x: point.x,
        y: point.y,
        name: e.dataTransfer.getData('name'),
        taskType: e.dataTransfer.getData('taskType'),
        groupId: group
      });
    };

    setEditor(_editor);
    setGraph(g);
    return () => _editor.destroy();
  }, []);

  function setAnchor() {
    return <div />;
  }
  function setAnchorClassName(_, anchor) {
    return anchor.magnet ? 'vgraph-anchor-magnet' : '';
  }
  function setNode(node) {
    let border = '1px solid #E1E4EB';
    if (node.hasState('select') || node.hasState('active')) {
      border = '1px solid #3073FF';
    }
    return <TagNode node={node} border={border} />;
  }

  return (
    <div>
      <div id={CONTAINER_ID} style={{ position: 'absolute' }}>
        {graph && editor ? (
          <Viewer
            graph={editor.getGraph()}
            setNode={setNode}
            setAnchor={setAnchor}
            setAnchorClassName={setAnchorClassName}
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

export const TagNode = React.memo(({ node, border }) => {
  let content = null;
  switch (node.get('taskType')) {
    case 'condition':
      content = <IconBranch style={{ background: '#FF9D22', color: '#fff', marginRight: 4 }} />;
      break;
    case 'loop':
      content = <IconLoop style={{ background: '#FFC528', color: '#fff', marginRight: 4 }} />;
      break;
    case 'debug':
      content = <IconBug style={{ background: '#78AF4B', color: '#fff', marginRight: 4 }} />;
      break;
    default:
      break;
  }
  return (
    <div className="vgraph-react-custom-node" style={{ border }}>
      {content}
      {node.get('name')}
    </div>
  );
});
>>> sidebar.tsx
import React from 'react';
import { IconBranch, IconLoop, IconBug } from '@arco-design/web-react/icon';

export const Sidebar = () => {
  const nodeTypes = [
    { type: 'condition', name: '条件', icon: <IconBranch style={{ background: '#FF9D22', color: '#fff', marginRight: 4 }} /> },
    { type: 'loop', name: '循环', icon: <IconLoop style={{ background: '#FFC528', color: '#fff', marginRight: 4 }} /> },
    { type: 'debug', name: '调试', icon: <IconBug style={{ background: '#78AF4B', color: '#fff', marginRight: 4 }} /> }
  ];
  return (
    <div style={{ width: 108, border: '1px solid #F0F1F3', boxShadow: '0px 1px 8px 0px #00000014', padding: 10, position: 'absolute', top: 48, right: 4, zIndex: 2, background: '#fff', textAlign: 'center' }}>
      <b>节点类型</b>
      {nodeTypes.map(item => {
        const name = `${item.name}节点`;
        return (
          <div
            key={item.type}
            style={{ marginTop: 6, border: '1px solid #E1E4EB', borderRadius: 4, cursor: 'grab' }}
            draggable
            onDragStart={e => {
              if (e.dataTransfer) {
                e.dataTransfer.setData('taskType', item.type);
                e.dataTransfer.setData('name', name);
              }
            }}
          >
            {item.icon}
            {name}
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
      const id = entity.get('id');
      if (entity.type === 'node') {
        return {
          id,
          x: entity.get('x'),
          y: entity.get('y'),
          name: entity.get('name'),
          taskType: entity.get('taskType'),
          groupId: entity.get('groupId')
        };
      }
      if (entity.type === 'group') {
        return {
          id,
          children: entity.get('children'),
          fixLeft: entity.get('fixLeft'),
          fixTop: entity.get('fixTop'),
          fixWidth: entity.get('fixWidth'),
          fixHeight: entity.get('fixHeight')
        };
      }
      return {
        id,
        source: entity.get('source'),
        target: entity.get('target')
      };
    });
    console.log(data);
  };
  const actions = [
    { name: '导出数据', handler: exportData },
    { name: '撤销', handler: () => editor.undo() },
    { name: '重做', handler: () => editor.redo() },
    { name: '放大', handler: () => editor.getGraph().scale(1.1) },
    { name: '缩小', handler: () => editor.getGraph().scale(0.9) },
    { name: '复制', handler: () => editor.copy() },
    { name: '粘贴', handler: () => editor.paste() },
    { name: '剪切', handler: () => editor.cut() }
  ];

  return (
    <div style={{ width: 'calc(100% - 108px)', position: 'absolute', right: 0, top: 8, zIndex: 1, height: 28, overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
      {actions.map(item => (
        <Tooltip key={item.name} content={item.name}>
          <span onClick={item.handler} style={{ marginRight: 8, border: '1px solid #E1E4E8', padding: '0 8px', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
            {item.name}
          </span>
        </Tooltip>
      ))}
    </div>
  );
};
```
