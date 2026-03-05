---
category: examples
group: nodes
title: Node with Progress Bar
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/progress_node.gif
link: node-addon-spec/progress
option:
---
# Node with Progress Bar
Progress bars are commonly used to visualize the progress or completion of ongoing tasks. VGraph provides utilities for defining progress bars, including linear and circular progress.
<br>
See <a href="/vgraph/guide/node-addon-spec/progress">Progress Add-on</a>.
## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import {
  Graph,
  Text,
  registerNode,
  Layer,
  ProgressUtils,
  Node,
} from '@visactor/vgraph';

function registerNodes() {
  registerNode('progressNode', {
    type: 'progressNode',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      var configs = Object.assign({}, nodeData);
      configs.label = {
        text: nodeData.label,
        offsetY: -24,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: 'bold',
        textOverflow: 'ellipsis',
      };
      return configs;
    },
    shape: function(layer, configs) {
      var percent = Math.round(configs.percent * 100) + '%';
      var text = new Text({
        x: -configs.width / 2 + 12,
        y: -configs.height / 2 + 66,
        text: 'Estimated time 20s, current progress ' + percent,
      });
      layer.set('text', text);
      layer.add(text);
      var progress = ProgressUtils.init(layer, {
        x: -configs.width / 2 + 12,
        y: -configs.height / 2 + 46,
        width: configs.showLabel ? 172 : 216,
        percent: configs.percent,
        color: configs.processColor,
        label: configs.showLabel
          ? {
              text: percent,
              fillStyle: '#21252C',
            }
          : undefined,
      });
      layer.set('progress', progress);
    },
    updateShapes: function(layer, configs) {
      var text = layer.get('text');
      text.set(
        'text',
        'Estimated time 20s, current progress ' + Math.round(configs.percent * 100) + '%'
      );
      var progress = layer.get('progress');

      ProgressUtils.update(progress, {
        percent: configs.percent,
        updateLabel: function(percent) {
          return Math.round(percent * 100) + '%';
        },
        animate: {
          duration: 1000,
        },
      });
    },
  });

  registerNode('circleProgressNode', {
    type: 'circleProgressNode',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape: function(nodeData) {
      var configs = Object.assign({}, nodeData);
      configs.label = {
        text: nodeData.label,
        offsetY: -12,
        fontSize: 13,
        lineHeight: 20,
        fontWeight: 'bold',
        textOverflow: 'ellipsis',
      };
      return configs;
    },
    shape: function(layer, configs) {
      var percent = Math.round(configs.percent * 100) + '%';
      var text = new Text({
        x: -configs.width / 2 + 12,
        y: -configs.height / 2 + 50,
        text: 'Estimated time 20s, current progress ' + percent,
      });
      layer.add(text);
      layer.set('text', text);
      var progress = ProgressUtils.init(layer, {
        x: 80,
        y: 0,
        width: 56,
        percent: configs.percent,
        color: configs.processColor,
        label: configs.showLabel
          ? {
              text: percent,
              fontSize: 14,
              fontWeight: 'bold',
              fillStyle: '#21252C',
            }
          : undefined,
        type: 'circle',
      });
      layer.set('progress', progress);
    },
    updateShapes: function(layer, configs) {
      var text = layer.get('text');
      text.set(
        'text',
        'Estimated time 20s, current progress ' + Math.round(configs.percent * 100) + '%'
      );
      var progress = layer.get('progress');

      ProgressUtils.update(progress, {
        percent: configs.percent,
        updateLabel: function(percent) {
          return Math.round(percent * 100) + '%';
        },
        animate: true,
      });
    },
  });
}
registerNodes();

var container = document.getElementById(CONTAINER_ID);
var width = container.offsetWidth;
var height = container.offsetHeight;

var createButton = document.createElement('button');
createButton.innerText = 'Update Progress';
createButton.style.position = 'absolute';
createButton.style.left = '5px';
createButton.style.top = '5px';
createButton.style.zIndex = '999';
createButton.onclick = updateProgress;
container.appendChild(createButton);

var graph = new Graph({
  container: CONTAINER_ID,
  width: width,
  height: height,
  minRatio: 0.2,
  maxRatio: 8,
  linkCenter: false,
  setDefaultNode: function(node) {
    return {
      icon: node.y === 200,
      radius: 4,
    };
  },
  setNodeStateStyles: function(state) {
    if (state === 'active') {
      return {
        opacity: 1.0,
      };
    }
    return { opacity: 0.2 };
  },
});

graph.add('node', {
  type: 'progressNode',
  x: 170,
  y: 100,
  width: 240,
  height: 84,
  percent: 0.25,
  processColor: '#FFC528',
  label: 'Simple Progress Bar',
});

graph.add('node', {
  type: 'progressNode',
  x: 450,
  y: 100,
  width: 240,
  height: 84,
  percent: 0.5,
  showLabel: true,
  processColor: '#E33232',
  label: 'Progress Bar with Text Label',
});

graph.add('node', {
  x: 170,
  y: 240,
  width: 240,
  height: 72,
  percent: 0.75,
  showLabel: true,
  processColor: '#3073F2',
  label: 'Simple Circular Progress Bar',
  type: 'circleProgressNode',
});

graph.add('node', {
  x: 450,
  y: 240,
  width: 240,
  height: 72,
  percent: 0.9,
  showLabel: false,
  processColor: '#07A35A',
  label: 'Circular Progress Bar with Text',
  type: 'circleProgressNode',
});

function updateProgress() {
  if (graph) {
    graph.getNodes().forEach(function(node) {
      var percent = Math.random();
      node.updateData({ percent: percent });
    });
  }
}
```
