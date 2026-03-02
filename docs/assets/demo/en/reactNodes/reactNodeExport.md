---
category: examples
group: reactNodes
title: React Node Bulk Export
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/react_node_export.gif
link: reactNodes/reactNodeExport
option:
---
# React Node Bulk Export

Exporting a large number of React nodes at the same time may cause serious performance problems or even freeze. vGraph recommends switching to canvas nodes to export the main information. Therefore, when there are large-scale export scenarios, if the node interaction is not complex, the use of canvas nodes should be considered first.

## Key Configurations

- `Graph`: dom mode + Viewer display; temporarily switch to canvas for export and then restore.
- `resizeToExport(graph, options)`: returns { matrix, width, height } for restoration after export.
- `graph.downloadImage(name)`: triggers the download.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Graph,
  panZoom,
  registerNode,
  resizeToExport,
  TagUtils,
  Text
} from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';
import { Tabs, Typography, Tag } from '@arco-design/web-react';

const TabPane = Tabs.TabPane;
const container = document.getElementById(CONTAINER_ID);
const width = container ? container.offsetWidth : 800;
const height = container ? container.offsetHeight : 600;

function registerExportNode() {
  registerNode('exportNode', {
    type: 'exportNode',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      var cfg = Object.assign({}, nodeData);
      cfg.radius = 4;
      cfg.label = {
        offsetY: 12,
        text: 'Tab1: some description \nTab2: some description \nTab3: some description',
        height: 60,
        lineHeight: 16
      };
      return cfg;
    },
    shape: function(layer, configs) {
      var width = configs.width;
      var height = configs.height;
      var tagLayer = TagUtils.initTag(layer, {
        text: 'Normal',
        left: -width / 2 + 12,
        top: -height / 2 + 6,
        label: {
          fillStyle: '#2E62F1'
        },
        background: {
          fillStyle: '#E9EEFE',
          strokeStyle: '#E1E4E8'
        }
      });
      var bbox = tagLayer.getBBox();
      var text = new Text({
        x: -width / 2 + 16 + bbox.width,
        y: -height / 2 + 13,
        text: configs.name,
        fillStyle: '#595959',
        fontWeight: 500
      });
      layer.add(text);
    }
  });
}

function App(props) {
  var data = props.data;
  var _useState = useState(null);
  var graph = _useState[0];
  var setGraph = _useState[1];

  useEffect(function() {
    registerExportNode();
    var g = new Graph({
      container: CONTAINER_ID,
      width: width,
      height: height,
      minRatio: 0.3,
      maxRatio: 8,
      renderMode: 'dom',
      layout: {
        type: 'dag',
        options: {
          rankDir: 'TB',
          nodeSep: 50,
          rankSep: 150
        }
      },
      setDefaultNode: function() {
        return {
          width: 280,
          height: 150,
          anchors: [
            [0.5, 0],
            [0.5, 1]
          ]
        };
      },
      setDefaultEdge: function() {
        return {
          type: 'vLine',
          endArrow: {
            width: 3,
            height: 5
          },
          strokeStyle: '#ddd',
          appendSize: 2
        };
      }
    });
    g.addBehavior(panZoom);
    g.data(data);
    g.fitView();
    setGraph(g);
    return function() {
      g.destroy();
    };
  }, []);

  function setNode(node) {
    var activeTab = node.get('activeTab') || '1';
    return (
      <div
        style={{
          padding: 6,
          border: '1px solid #E1E4EB',
          borderRadius: 4,
          width: node.get('width'),
          height: node.get('height')
        }}
      >
        <Tag checkable color="arcoblue" defaultChecked style={{ marginRight: 8 }}>
          Normal
        </Tag>
        {node.get('name')}
        <div>
          <Tabs
            defaultActiveTab={activeTab}
            onChange={function(tab) {
              node.set('activeTab', tab);
            }}
          >
            <TabPane key="1" title="Tab 1">
              <Typography.Paragraph>Content of Tab Panel 1</Typography.Paragraph>
            </TabPane>
            <TabPane key="2" title="Tab 2" disabled>
              <Typography.Paragraph>Content of Tab Panel 2</Typography.Paragraph>
            </TabPane>
            <TabPane key="3" title="Tab 3">
              <Typography.Paragraph>Content of Tab Panel 3</Typography.Paragraph>
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }

  function exportImage() {
    if (!graph) {
      return;
    }
    var instance = graph;
    setGraph(null);

    graph.set('setDefaultNode', function() {
      return {
        type: 'exportNode'
      };
    });

    graph.updateRenderMode('canvas');
    var result = resizeToExport(graph);

    graph.downloadImage('vgraph.png', undefined, undefined, function() {
      setGraph(instance);
      graph.updateRenderMode('dom');
      graph.changeSize(width, height);
      graph.setMatrix(result.matrix);
    });
  }

  return (
    <div>
      <button onClick={exportImage}>Export Image</button>
      <div>{graph ? <Viewer graph={graph} setNode={setNode} /> : null}</div>
    </div>
  );
}

var url = 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/job.json';
fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    ReactDOM.render(<App data={data} />, document.getElementById(CONTAINER_ID));
  });

```
