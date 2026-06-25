---
category: examples
group: plugins
title: Continuous Legend
cover: https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-exampleCovers/traffic_demo.gif
link: plugins/traffic
option:
---
# Continuous Legend

Data description: Sioux-Falls traffic network. <br>Interactions: <code>hover edge</code>: show edge attributes; <code>click canvas</code>: reset to the initial state.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { Graph, panZoom, RawTooltip, ContinuousLegend, insertStyles } from '@visactor/vgraph';

var iconfontStyles = `
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff2?t=1685600318362') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_9y80j4em5b7.woff?t=1685600318362') format('woff');
}
@font-face {
  font-family: 'iconfont2';
  src: url('//at.alicdn.com/t/c/font_3765180_akekn48k4es.woff2?t=1705473718196') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_akekn48k4es.woff?t=1705473718196') format('woff');
}
canvas,
.iconfont {
  font-family: 'iconfont2','iconfont' !important;
}
`;

function edgeMap(value, min, base) { return (value - min) / base; }

var container = document.getElementById(CONTAINER_ID);
insertStyles(iconfontStyles, 'vgraph-demo-iconfont');
var graph = new Graph({
  container: CONTAINER_ID,
  width: container.offsetWidth, height: container.offsetHeight,
  minRatio: 0.3, maxRatio: 10, linkCenter: true,
  setDefaultNode: function(node) {
    return {
      label: { width: 20, text: String(node.id), textBaseline: 'middle', textAlign: 'center', fontSize: 12, fillStyle: 'white' },
      type: 'rect', radius: 2, width: 20, height: 20, fillStyle: '#4c72b0',
      anchors: [[0,0.25],[0,0.75],[0.25,0],[0.25,1],[0.75,0],[0.75,1],[1,0.25],[1,0.75]]
    };
  },
  setNodeStateStyles: function(state) {
    if (state === 'active') { return { fillStyle: 'rgba(238, 139, 36, 0.7)' }; }
    else if (state === 'click') { return { fillStyle: '#EE8B24' }; }
  },
  setDefaultEdge: function(edge) {
    return {
      lineWidth: 3,
      strokeStyle: ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d'][Math.round(edgeMap(edge.volume, 4000, 24000) * 8)],
      endArrow: true, sourceAnchor: edge.sourceAnchor, targetAnchor: edge.targetAnchor
    };
  },
  setEdgeStateStyles: function(state) { if (state === 'active') { return { strokeStyle: '#DEC63E' }; } else if (state === 'hover') { return { strokeStyle: '#F5B508' }; } }
});

fetch('https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/site-demo/file_186bfc55a4499.json')
  .then(function(response) { return response.json(); })
  .then(function(data) {
    data.nodes.forEach(function(node) { node.x = node.posX * 10 + 50; node.y = (60 - node.posY) * 10; });
    graph.data(data); graph.addBehavior(panZoom);

    var legendDiv = document.createElement('div');
    legendDiv.style.position = 'absolute'; legendDiv.style.right = '30px'; legendDiv.style.top = '0px';
    container.append(legendDiv);

    new ContinuousLegend(graph, { container: legendDiv, encodeAttr: 'volume', channel: 'strokeStyle', target: 'edge', width: 200, height: 60, slide: { enable: true, filter: true } });
  });

new RawTooltip(graph, {
  styles: { border: '1px solid #ccc', padding: '4px', borderRadius: '4px', backgroundColor: '#fff', fontSize: '6px', lineHeight: '16px' },
  content: function(entity) { return 'Length : ' + entity.get('roadlength') + ' <br/>Cost : ' + entity.get('cost'); },
  target: 'edge'
});

graph.on('edge:mouseenter', function(e) { e.target.setState('hover'); });
graph.on('edge:mouseleave', function(e) { e.target.removeState('hover'); });

graph.on('click', function(e) { if (e.relatedTarget.type !== 'canvas') { return; } clearInteraction(); });
function clearInteraction() {
  graph.getNodes().forEach(function(node) { node.setState('default', true); });
  graph.getEdges().forEach(function(edge) { edge.setState('default', true); });
}

// toolbar
var toolbarContainer = document.createElement('div'); toolbarContainer.id = 'toolbarContainer';
var toolbarStyle = { border: '1px solid #ccc', padding: '4px', borderRadius: '4px', backgroundColor: '#fff', position: 'absolute', left: 0, top: 0, cursor: 'pointer' };
var toolbar1 = document.createElement('i'); toolbar1.className = 'iconfont'; toolbar1.innerHTML = '&#xe65d;'; toolbar1.style.padding = '0 5px 0 10px'; toolbarContainer.appendChild(toolbar1);
var toolbar2 = document.createElement('i'); toolbar2.className = 'iconfont'; toolbar2.innerHTML = '&#xe623;'; toolbar2.style.padding = '0 10px 0 5px'; toolbarContainer.appendChild(toolbar2);
container && container.appendChild(toolbarContainer);
Object.keys(toolbarStyle).forEach(function(k) { toolbarContainer.style[k] = toolbarStyle[k]; });
```
