---
category: examples
group: nodes
title: 带进度条的节点
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/progress_node.gif
 link: node-addon-spec/progress
option:
---
# 带进度条的节点
进度条顾名思义多用于可视化展示进行中事件的进度，完成度等。VGraph 封装了进度条的定义工具，支持普通进度条和环形进度条。
<br>
详细文档可见<a href="/vgraph/guide/node-addon-spec/progress">进度条工具</a>。
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
        text: '预计耗时 20s 当前进度' + percent,
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
        '预计耗时 20s 当前进度' + Math.round(configs.percent * 100) + '%'
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
        text: '预计耗时 20s 当前进度' + percent,
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
        '预计耗时 20s 当前进度' + Math.round(configs.percent * 100) + '%'
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
createButton.innerText = '更新进度';
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
  label: '简单进度条',
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
  label: '带文本标签的进度条',
});

graph.add('node', {
  x: 170,
  y: 240,
  width: 240,
  height: 72,
  percent: 0.75,
  showLabel: true,
  processColor: '#3073F2',
  label: '简单环形进度条',
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
  label: '带文本的环形进度条',
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
