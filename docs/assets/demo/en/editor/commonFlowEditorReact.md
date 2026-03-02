---
category: examples
group: editor
title: Directed Graph Free Editing - React Node
cover:
link: editor/commonFlowEditorReact
option:
---
# Directed Graph Free Editing - React Node

Users can freely arrange the position layout and connection relationship of nodes by dragging and dropping, so as to build and edit the directed graph freely and flexibly. With React nodes, the node style can be displayed more flexibly.<br/>Interaction mode: drag and drop nodes or anchors to edit the relationship graph.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { DAGLayout, CommonFlowEditor, insertStyles } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from './sidebar';
import { TagNode } from './node';
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
    const editor = new CommonFlowEditor({
      container: 'graphContainer',
      graphSize: [width, height],
      renderMode: 'dom',
      setDefaultNode(nodeData) {
        return {
          width: nodeData.width || 140,
          height: nodeData.height || 40,
          // Define the positioning and appearance of anchors here, while anchor style configurations are in the Viewer
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
          return { strokeStyle: '#5678D6' };
        } else if (state === 'hover') {
          return { strokeStyle: '#3073F2' };
        }
        return {};
      },
      nodeMover: {
        options: {
          onDragStart() {
            dragging = true;
          },
          onDrop() {
            dragging = false;
          },
        },
      },
      edgeEditor: {
        options: {
          onDragStart() {
            dragging = true;
          },
          onDrop() {
            dragging = false;
          },
        },
      },
    });
    const g = editor.getGraph();

    g.data({
      nodes: [
        {
          name: 'Task 1',
          taskType: 'condition',
          id: '1',
        },
        {
          name: 'Task 2',
          taskType: 'loop',
          id: '2',
        },
        {
          name: 'Task 3',
          taskType: 'debug',
          id: '3',
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
        },
        {
          source: '1',
          target: '3',
        },
      ],
    });
    // Layout for initial data
    const dag = new DAGLayout({
      graph: g,
      rankDir: 'LR',
      nodeSep: 30,
      rankSep: 150,
      allControlPoints: true,
    });
    g.set('customLayout', dag);
    g.refresh();
    g.alignView('cc');

    g.on('edge:mouseenter', (e) => {
      if (dragging) {
        return;
      }
      e.target.toFront();
      g.setState(e.target, 'hover');
    });
    g.on('edge:mouseleave', (e) => {
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

    // Add a new node after dragging a node from the node drag panel to the canvas
    canvas.ondrop = e => {
      const { clientX, clientY } = e;
      const point = g.clientToCanvas(clientX, clientY);
      editor.addNode({
        x: point.x,
        y: point.y,
        name: e.dataTransfer.getData('name'),
        taskType: e.dataTransfer.getData('taskType'),
      });
    };

    setEditor(editor);
    setGraph(g);

    return () => {
      g.destroy();
    };
  }, []);

  // Customize anchor rendering here, return null if no rendering is needed for this anchor
  function setAnchor(node, anchor) {
    return <div />;
  }

  function setAnchorClassName(node, anchor) {
    let className = '';
    if (anchor.magnet) {
      className = 'vgraph-anchor-magnet';
    }
    return className;
  }

  function setNode(node) {
    let border = '1px solid #E1E4EB';
    if (node.hasState('select') || node.hasState('active')) {
      border = '1px solid #3073FF';
    }
    return <TagNode node={node} border={border} />
  }

  return (
    <div>
      <div id="graphContainer" style={{ position: 'absolute' }}>
        {graph && editor && (
          <Viewer
            graph={editor.getGraph()}
            setNode={setNode}
            setAnchor={setAnchor}
            setAnchorClassName={setAnchorClassName}
            // hideDetails={{ ratio: 0.2, getNodeStyles }}
            localRendering={false}
            // localRendering={false} does not render locally, and can support stateful components
            // localRendering={true} enables local rendering (nodes outside the viewport are not rendered), and only supports stateless components
          />
        )}
      </div>
      <Sidebar />
      {editor && <Toolbar editor={editor} />}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
>>> node.tsx
import React from 'react';
import {
  IconBranch,
  IconLoop,
  IconBug
} from '@arco-design/web-react/icon'; 

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
    <div className='vgraph-react-custom-node' style={{border}}>
      {content}
      {node.get('name')}
    </div>
  );

});
>>> sidebar.tsx
import React from 'react';
import {
  IconBranch,
  IconLoop,
  IconBug
} from '@arco-design/web-react/icon'; 

export const Sidebar = () => {
  return <div style={{  width: 108, border: '1px solid #F0F1F3', boxShadow: '0px 1px 8px 0px #00000014', padding: 10, position: 'absolute', zIndex: 2, background: '#fff', textAlign: 'center'}}>
    <b>Node Type</b>

    {[{
      type: 'condition',
      name: 'Condition',
      icon: <IconBranch style={{ background: '#FF9D22', color: '#fff', marginRight: 4 }} />
    }, {
      type: 'loop',
      name: 'Loop',
      icon: <IconLoop style={{ background: '#FFC528', color: '#fff', marginRight: 4 }} />
    }, {
      type: 'debug',
      name: 'Debug',
      icon: <IconBug style={{ background: '#78AF4B', color: '#fff', marginRight: 4 }} />
    }].map(item => {
      const name = `${item.name} Node`;
      return <div 
        style={{ marginTop: 6, border: '1px solid #E1E4EB', borderRadius: 4, cursor: 'grab' }}
        draggable
        onDragStart={(e) => {
          if (e.dataTransfer) e.dataTransfer.setData('taskType', item.type);
          if (e.dataTransfer) e.dataTransfer.setData('name', name);
        }}
      >
        {item.icon}{name}
      </div>
    })}
  </div>
}
>>> toolbar.tsx
import React from 'react';
import { Tooltip } from '@arco-design/web-react';
import { CommonFlowEditor } from '@visactor/vgraph'

export const Toolbar = ({ editor }) => {
  const exportData = () => {
    const data = editor.getGraph().getData(entity => {
      if (entity.type === 'node') {
        const id = entity.get('id');
        return {
          id,
          x: entity.get('x'),
          y: entity.get('y'),
          name: entity.get('name'),
          taskType: entity.get('taskType'),
        };
      }
      return {
        source: entity.get('source'),
        target: entity.get('target'),
      };
    });
    console.log(data);
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
  // const clear = () => {
  //   editor.clear();
  //   console.log(editor.getGraph().getNodes());
  // }

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
    // {name: 'Clear Canvas', handler: clear, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97141.svg'},
    {name: 'Copy', handler: copy, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc97484.svg'},
    {name: 'Paste', handler: paste, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9705.svg'},
    {name: 'Cut', handler: cut, icon: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_18ef55fc9694.svg'},
  ];
  return <div style={{ width: 'calc(100% - 108px)', position: 'absolute', right: 0, top: 8, zIndex: 1, height: 28, overflow: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
    {actions.map(item => {
      if (item.disabled) {
        return <Tooltip content={`${item.name}(Read-only mode unavailable)`}>
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
