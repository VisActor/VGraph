---
category: examples
group: reactNodes
title: hooks-useSelections
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/useSelections.gif
link: reactNodes/useSelections
option:
---
# hooks-useSelections

vGraph provides a series of hooks for heavy usage scenarios for React users. `useSelections` is a selection hook used in conjunction with the state mechanism. Refer to the Sidebar for usage.

## Key Configurations

- `DAGFlowEditor`: Independent container id, setDefaultNode/setDefaultEdge, layout.
- `useSelections(graph)`: Returns a list of currently selected nodes/edges.
- `graph.on('canvas:click', () => inst.stack.execute('select', { selections: [] }))`: Click the canvas to clear the selection.
- `Viewer`: Provides operations such as adding child nodes and deleting in `setNode`.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { DAGFlowEditor } from '@visactor/vgraph';
import { Viewer, useNodes, useEdges, useSelections } from '@visactor/react-vgraph';
import { Drawer, Trigger } from '@arco-design/web-react';
import { IconPlusCircle, IconCloseCircle } from '@arco-design/web-react/icon';

const container = document.getElementById(CONTAINER_ID);
const width = container && container.offsetWidth ? container.offsetWidth : 800;
const height = container && container.offsetHeight ? container.offsetHeight : 600;

function RightDrawer(props) {
  var graph = props.graph;
  var selections = useSelections(graph);
  var _useState = useState(false);
  var visible = _useState[0];
  var setVisible = _useState[1];
  var _useState2 = useState(null);
  var node = _useState2[0];
  var setNode = _useState2[1];

  useEffect(function() {
    if (!selections || selections.length === 0) {
      setVisible(false);
      return;
    }
    var selectedNode = selections.filter(function(entity) {
      return entity.type === 'node';
    });
    if (selectedNode.length === 0) {
      setVisible(false);
      return;
    }
    if (!node || selectedNode[0].get('id') !== node.get('id')) {
      setNode(selectedNode[0]);
      if (!visible) {
        setVisible(true);
      }
    }
  }, [selections]);

  return (
    <Drawer
      visible={visible}
      title={<span>Edit Node Information</span>}
      onOk={function() {
        setVisible(false);
      }}
      onCancel={function() {
        setVisible(false);
      }}
    />
  );
}

function App() {
  var _useState3 = useState(null);
  var editor = _useState3[0];
  var setEditor = _useState3[1];
  var _useState4 = useState(null);
  var graph = _useState4[0];
  var setGraph = _useState4[1];

  var nodes = useNodes(graph);
  var edges = useEdges(graph);

  useEffect(function() {
    var inst = new DAGFlowEditor({
      container: CONTAINER_ID,
      graphSize: [width, height],
      scroller: {
        enable: false
      },
      layout: {
        rankDir: 'LR',
        rankSep: 50,
        ignoreControlPoints: true
      },
      mask: {
        enable: false
      },
      onChange: function() {
        console.log('Editor data changed');
      },
      renderMode: 'dom',
      setDefaultNode: function() {
        return {
          width: 140,
          height: 40,
          anchors: [
            [0, 0.5],
            [1, 0.5]
          ]
        };
      },
      setDefaultEdge: function() {
        return {
          type: 'hLine',
          styles: {
            curvePosition: 1,
            curveOffset: -25
          }
        };
      },
      setEdgeStateStyles: function(state) {
        if (state === 'active') {
          return {
            strokeStyle: '#3073F2'
          };
        }
        return {};
      }
    });

    var g = inst.getGraph();
    setEditor(inst);
    setGraph(g);

    g.on('canvas:click', function() {
      inst.stack.execute('select', { selections: [] });
    });

    return function() {
      inst.destroy();
    };
  }, []);

  function setNode(node) {
    var id = node.get('id');
    var border = '1px solid #ccc';
    if (node.hasState('select')) {
      border = '1px solid #3073FF';
    }

    return (
      <Trigger
        popupAlign={{ top: 8 }}
        popup={function() {
          return (
            <div
              style={{
                border: '1px solid #E1E4EB',
                borderRadius: 4,
                padding: '4px',
                background: '#fff',
                boxShadow: '0px 8px 8px 0px #21252C0A'
              }}
            >
              <IconCloseCircle
                style={{ color: '#89909D' }}
                onClick={function(e) {
                  e.stopPropagation();
                  if (editor) {
                    editor.removeNode(id);
                  }
                }}
              />
            </div>
          );
        }}
        clickToClose
        showArrow={false}
        position="tr"
      >
        <div
          className="border"
          style={{
            position: 'relative',
            border: border,
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
              left: 132,
              top: 12,
              color: '#3073F2',
              backgroundColor: '#FFF'
            }}
            onClick={function(e) {
              e.stopPropagation();
              if (editor) {
                editor.addTarget(id, {}, false);
              }
            }}
          />
        </div>
      </Trigger>
    );
  }

  var nodeCount = nodes ? nodes.length - 1 : 0;
  var edgeCount = edges ? edges.length - 1 : 0;

  return (
    <div>
      there are {nodeCount} nodes, {edgeCount} edges in the graph.
      {editor ? <Viewer graph={editor.getGraph()} setNode={setNode} /> : null}
      {editor ? <RightDrawer graph={editor.getGraph()} /> : null}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById(CONTAINER_ID));
```
