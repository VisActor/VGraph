---
category: examples
group: editor
title: Directed Graph Free Editing - React Form
cover:
link: editor/commonFlowEditorForm
option:
---
# Directed Graph Free Editing - React Form

A common scenario for free-form editing of directed graphs is to include forms in the nodes. With the React node component (Viewer), you can easily implement free-form editing of directed graphs with forms.<br/>Interaction mode: drag and drop nodes or anchors to edit the relationship graph.

## Code Demo

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

// demo writing style, normally through css.
// Clean to avoid style pollution from other demos.
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
  /* Increase anchor hotspot */
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
              // triggerShape is the actual triggered dom
              if (['INPUT', 'TEXTAREA'].includes(triggerShape.tagName)) {
                return false;
              }

              return !(triggerShape && triggerShape.getAttribute('anchorindex')); // Not dragging an anchor
            }
            return !(triggerShape && triggerShape.get('_anchor'));
          },
        },
      },
      edgeEditor: {
        options: {
          editTerminal: true, // Whether to allow editing connection endpoints
          dragEdgeToEdit: true,
          shouldTrigger(ev, triggerShape) {
            // Under what circumstances should dragging trigger connection editing/addition
            if (!triggerShape) {
              return false;
            }
            if (!triggerShape.get) {
              // triggerShape is the actual triggered dom
              if (['INPUT', 'TEXTAREA'].includes(triggerShape.tagName)) {
                return false;
              }
              return triggerShape && triggerShape.getAttribute('anchorindex'); // Dragging an anchor
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

    // Layout algorithm
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
    // Add a new node after dragging a node from the node drag panel to the canvas
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
    // To use the component's unified copy and paste, you need to write the current value to the node
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
              // localRendering={false} does not render locally, and can support stateful components
              // localRendering={true} enables local rendering (nodes outside the viewport are not rendered), and only supports stateless components
              responsiveNode // Whether to automatically respond to node size changes. Suitable for scenarios such as forms.
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
        <Collapse.Item header="Personal Information" name="1" style={{ padding: '0px', width: 200 }}>
          <Form.Item labelCol={{span: 8}} wrapperCol={{span: 16}} label="Name" field={`${node}.name`} initialValue={node.get('name')}>
            <Input style={{ width: 100 }} />
          </Form.Item>
        </Collapse.Item>
        <Collapse.Item header="Education Experience" name="2" style={{ padding: '0px', width: 200 }}>
          <Form.Item labelCol={{span: 8}} wrapperCol={{span: 16}} label="Degree" field={`${node}.education`} initialValue={node.get('education')}>
            <Select style={{ width: 100 }}>
              {['Bachelor', 'Junior College', 'Master', 'Doctor'].map(value => (
                <Select.Option key={value} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item labelCol={{span: 8}} wrapperCol={{span: 16}} label="School" field={`${node}.school`}  initialValue={node.get('school')}>
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
    <b>Node Type</b>
    <div
      style={{ marginTop: 6, border: '1px solid #E1E4EB', borderRadius: 4, cursor: 'grab' }}
      draggable
      onDragStart={(e) => { if (e.dataTransfer) e.dataTransfer.setData('name', 'demo'); }}
    >
      Example Node
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
    {name: 'Export Data', handler: exportData, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96691.svg'},
    {name: 'Undo', handler: undo, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d7.svg'},
    {name: 'Redo', handler: redo, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96d84.svg'},
    {name: 'Zoom In', handler: zoomIn, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97939.svg'},
    {name: 'Zoom Out', handler: zoomOut, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96930.svg'},
    {name: 'Focus Node', handler: focusNode, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97164.svg'},
    {name: 'Layout', handler: reLayout, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc96b57.svg'},
    {name: 'Copy', handler: copy, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97484.svg'},
    {name: 'Paste', handler: paste, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9705.svg'},
    {name: 'Cut', handler: cut, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9694.svg'},
  ];
  return <div style={{ width: 'calc(100% - 108px)', position: 'absolute', right: 0, top: 8, zIndex: 1, height: 28, overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
    {actions.map(item => {
      if (item.disabled) {
        return <Tooltip content={`${item.name}(Read-only mode disabled)`} key={item.name}>
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
