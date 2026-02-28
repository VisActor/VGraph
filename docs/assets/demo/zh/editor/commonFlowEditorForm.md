---
category: examples
group: editor
title: 有向图自由编辑-React 表单
cover:
link: editor/commonFlowEditorForm
option:
---
# 有向图自由编辑-React 表单

节点中包含表单是一种常见的有向图自由编辑场景。通过 React 节点组件（Viewer）可以轻松实现带表单的有向图自由编辑。<br>交互方式：拖拉拽节点或锚点编辑关系图。

## 代码演示

```livedemo-files template=vgraph-react
>>> app.tsx
import { DAGLayout, CommonFlowEditor, insertStyles } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import { Form } from '@arco-design/web-react';
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from './sidebar';
import { FormNode } from './node';
import { Toolbar } from './toolbar';

const container = document.getElementById(CONTAINER_ID);
const width = container.offsetWidth;
const height = container.offsetHeight;

// demo 写法，正常通过 css 来写即可。
// Clean，避免其他 demo 样式污染。
const cssElement = document.getElementById('vgraph-demo');
if (cssElement) {
  cssElement.innerHTML = '';
}
insertStyles(
  `
.vgraph-react-viewer-node .border{
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.vgraph-viewer-anchor {
  background-color: #fff;
  border: 1px solid #3073f2;
  border-radius: 50%;
}

.vgraph-react-viewer-node .border:hover {
  border: 1px solid #3074FF;
  box-shadow: 0px 8px 8px 0px rgba(33, 37, 44, 0.04);
}

.vgraph-react-viewer-node.select {
  border: 2px solid #3073F2;
}

.vgraph-react-viewer-anchor::after { 
  /* 增加锚点热区 */
  position: absolute;
  z-index: -1;
  content: '';
  top: -4px;
  bottom: -4px;
  left: -4px;
  right: -4px;
}

.vgraph-viewer-anchor.vgraph-anchor-magnet { 
 border: none;
 background-color: #3073F2;
 box-shadow: rgba(48, 115, 242, 0.2) 0 0 0 4px;
}

.vgraph-viewer-anchor.vgraph-anchor-editing {
  background-color: #3073F2;
}

.arco-collapse-item-content.arco-collapse-item-content-expanded {
  padding: 0px;
}

`,
  'vgraph-demo'
);

const App = () => {
  const [graph, setGraph] = useState(null);
  const [editor, setEditor] = useState(null);
  const formRef = useRef();

  useEffect(() => {
    const editor = new CommonFlowEditor({
      container: 'graphContainer',
      graphSize: [width, height],
      renderMode: 'dom',
      setDefaultNode(node) {
        return {
          width: 300,
          height: 104,
          anchors: [
            {
              show: 'hover',
              position: [0, 0.5],
            },
            {
              show: 'hover',
              position: [1, 0.5],
            },
          ],
        };
      },
      setNodeStateStyles(state) {
        return {};
      },
      setDefaultEdge(edgeData) {
        return {
          type: edgeData.target ? 'turningLine' : 'line',
          endArrow: true,
          radius: 10,
          hitWidth: 6,
        };
      },
      setEdgeStateStyles(state) {
        if (state === 'select') {
          return { strokeStyle: '#3073F2' };
        }
        return {};
      },
      nodeMover: {
        options: {
          shouldTrigger(ev, triggerShape) {
            if (!triggerShape) {
              return false;
            }
            if (!triggerShape.get) {
              // triggerShape 是实际触发的 dom
              if (['INPUT', 'TEXTAREA'].includes(triggerShape.tagName)) {
                return false;
              }

              return !(triggerShape && triggerShape.getAttribute('anchorindex')); // 拖拽的不是锚点
            }
            return !(triggerShape && triggerShape.get('_anchor'));
          },
        },
      },
      edgeEditor: {
        options: {
          editTerminal: true, // 是否允许编辑连线端点
          dragEdgeToEdit: true,
          shouldTrigger(ev, triggerShape) {
            // 什么情况下拖拽应当触发连线编辑/新增
            if (!triggerShape) {
              return false;
            }
            if (!triggerShape.get) {
              // triggerShape 是实际触发的 dom
              if (['INPUT', 'TEXTAREA'].includes(triggerShape.tagName)) {
                return false;
              }
              return triggerShape && triggerShape.getAttribute('anchorindex'); // 拖拽的是锚点
            }
            const anchorIndex = triggerShape && triggerShape.get('anchorIndex');
            if (anchorIndex === undefined) {
              return false;
            }
            return true;
          },
        },
      },
    });

    const graph = editor.getGraph();

    // 布局算法
    const dag = new DAGLayout({
      graph: graph,
      rankDir: 'LR',
      nodeSep: 30,
      rankSep: 150,
      allControlPoints: true,
    });
    graph.set('customLayout', dag);

    const canvas = graph.getCanvasDom();
    canvas.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };
    // 从节点拖拽面板拖拽节点至画布后新增节点
    canvas.ondrop = e => {
      const { clientX, clientY } = e;
      const point = graph.clientToCanvas(clientX, clientY);
      editor.addNode({
        x: point.x,
        y: point.y,
        name: e.dataTransfer.getData('name'),
        taskType: e.dataTransfer.getData('taskType'),
      });
    };

    setGraph(graph);
    setEditor(editor);
    return () => {
      editor.destroy();
    };
  }, []);

  function setAnchor(node, anchor) {
    return <></>;
  }

  function setAnchorClassName(node, anchor) {
    const classNames = [];
    if (anchor.magnet) {
      classNames.push('vgraph-anchor-magnet');
    }
    if (anchor.editing) {
      classNames.push('vgraph-anchor-editing');
    }
    return classNames.join(' ');
  }

  function onResizeNode(node, bbox) {
    const edges = node.edges;
    const router = editor && editor.getComponent('router');
    const { left, top, width, height } = bbox;
    if (!graph) return;
    graph.update(node, {
      width,
      height,
      x: node.get('x') + left + width / 2,
      y: node.get('y') + top + height / 2,
    });
    edges.forEach((edge) => {
      if (router) router.updateEdgePath(edge);
      edge.updatePosition();
    });
  }

  function onValuesChange(value, values) {
    // 使用组件提供的统一复制粘贴，需要将当前的值写入到节点上
    const key = Object.keys(values)[0];
    if (!graph) return;
    const node = graph.getNodeById(key);
    Object.keys(values[key]).forEach(k => {
      node.set(k, values[key][k]);
    });
  }

  function setNode(node) {
    let border = '1px solid #E1E4EB';
    if (node.hasState('select') || node.hasState('active')) {
      border = '1px solid #3073FF';
    }
    return <FormNode node={node} border={border} />;
  }

  return (
    <div>
      <div id="graphContainer" style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Form ref={formRef} initialValues={{}} onValuesChange={onValuesChange}>
          {graph && (
            <Viewer
              localRendering={false}
              // localRendering 为 false 则不局部渲染，可支持有状态组件（Stateful Component）
              // localRendering 为 true 则开启局部渲染（视口外的节点不渲染），此时仅支持无状态组件（Stateless Component）
              responsiveNode // 是否自动响应节点大小变化。适用于表单等场景。
              graph={graph}
              setNode={setNode}
              setAnchor={setAnchor}
              setAnchorClassName={setAnchorClassName}
              // hideDetails={{ ratio: 0.2, getNodeStyles }}
              onResizeNode={onResizeNode}
            />
          )}
        </Form>
        <Sidebar />
        {editor && <Toolbar editor={editor} formRef={formRef} />}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
>>> node.tsx
import React from 'react';
import { Collapse, Form, Select, Input } from '@arco-design/web-react';

export const FormNode = React.memo(({ node, border }) => {
  return (
    <div
      style={{
        position: 'relative',
        border,
        borderRadius: 4,
        padding: '8px',
        background: node.hasState('select') ? '#EDF6FF' : '#fff',
      }}
    >
      <Collapse style={{ maxWidth: 300 }}>
        <Collapse.Item header="个人信息" name="1" style={{ padding: '0px', width: 200 }}>
          <Form.Item labelCol={{span: 8}} wrapperCol={{span: 16}} label="姓名" field={`${node}.name`} initialValue={node.get('name')}>
            <Input style={{ width: 100 }} />
          </Form.Item>
        </Collapse.Item>
        <Collapse.Item header="教育经历" name="2" style={{ padding: '0px', width: 200 }}>
          <Form.Item labelCol={{span: 8}} wrapperCol={{span: 16}} label="学历" field={`${node}.education`} initialValue={node.get('education')}>
            <Select style={{ width: 100 }}>
              {['本科', '专科', '研究生', '博士'].map(value => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item labelCol={{span: 8}} wrapperCol={{span: 16}} label="学校" field={`${node}.school`}  initialValue={node.get('school')}>
            <Input style={{ width: 100 }} />
          </Form.Item>
        </Collapse.Item>
      </Collapse>
    </div>
  );
})
>>> sidebar.tsx
export const Sidebar = () => {
  return <div style={{ width: 108, border: '1px solid #F0F1F3', boxShadow: '0px 1px 8px 0px #00000014', padding: 10, position: 'absolute', zIndex: 2, background: '#fff', textAlign: 'center' }}>
    <b>节点类型</b>
    <div
      style={{ marginTop: 6, border: '1px solid #E1E4EB', borderRadius: 4, cursor: 'grab' }}
      draggable
      onDragStart={(e) => { if (e.dataTransfer) e.dataTransfer.setData('name', 'demo'); }}
    >
      示例节点
    </div>
  </div>
}
>>> toolbar.tsx
import React from 'react';
import { Tooltip } from '@arco-design/web-react';
import { CommonFlowEditor } from '@visactor/vgraph'

export const Toolbar = ({ editor, formRef }) => {
  const exportData = () => {
    const validator = formRef.current && formRef.current.validate;
    if (!validator) return;
    validator.call(formRef.current).then(values => {
      const data = graph ? graph.getData(entity => {
        if (entity.type === 'node') {
          const id = entity.get('id');
          return values[id];
        }
        return {
          source: entity.get('source'),
          target: entity.get('target'),
        };
      }) : null;
      console.log(data);
    });
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
  const layout = graph.get('customLayout');
  const reLayout = () => {
    const formerData = editor.getSnapshot();
    layout.layout();
    editor.refreshEdgesPath();
    graph.alignView('cc');
    const currentData = editor.getSnapshot();
    editor.batchChange({ formerData, currentData });
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
  const actions = [
    {name: '导出数据', handler: exportData, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96691.svg'},
    {name: '撤销', handler: undo, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d7.svg'},
    {name: '重做', handler: redo, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d84.svg'},
    {name: '放大', handler: zoomIn, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97939.svg'},
    {name: '缩小', handler: zoomOut, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96930.svg'},
    {name: '聚焦节点', handler: focusNode, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97164.svg'},
    {name: '布局', handler: reLayout, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96b57.svg'},
    {name: '复制', handler: copy, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97484.svg'},
    {name: '粘贴', handler: paste, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9705.svg'},
    {name: '剪切', handler: cut, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9694.svg'},
  ];
  return <div style={{ width: 'calc(100% - 108px)', position: 'absolute', right: 0, top: 8, zIndex: 1, height: 28, overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
    {actions.map(item => {
      if (item.disabled) {
        return <Tooltip content={`${item.name}(阅读态不可用)`} key={item.name}>
          <span onClick={item.handler} style={{ marginRight: 8, border: '1px solid #E1E4E8', padding: '0 4px', borderRadius: 4, background: 'rgb(242, 243, 245)', cursor: 'not-allowed' }}>
            <img width="18px" height="18px" src={item.icon} />
          </span>
        </Tooltip>
      }
      return <Tooltip content={item.name}  key={item.name}>
        <span onClick={item.handler} style={{ marginRight: 8, border: '1px solid #E1E4E8', padding: '0 4px', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
          <img width="18px" height="18px" src={item.icon} />
        </span>
      </Tooltip>
    })}
  </div>
}
```
