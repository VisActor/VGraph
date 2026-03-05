---
category: examples
group: editor
title: Pipeline Editing
cover:
link: editor/dagFlowEditor
option:
---
# Pipeline Editing

Build a DAG easily by clicking icons. Compared with drag-and-drop node/edge editing, it is less flexible, but it is more efficient and produces higher-quality DAGs.
<br>Interactions: <code>hover node</code> to show direct upstream/downstream relations and node action icons; <code>click icon</code> to add a node (and its relation) in the icon direction or delete the current node; <code>click undo</code> undo; <code>click redo</code> redo; <code>click export data</code> export current graph data.

## Code Demo

```livedemo-files template=vgraph-react
>>> app.tsx
import { DAGFlowEditor, GraphEvent, Node, registerEdge, highlightRelations, Shortcuts, unRegisterEdge, insertStyles } from '@visactor/vgraph';

const container = document.getElementById(CONTAINER_ID);

const RANK_SEP = 50;

const cssElement = document.getElementById('vgraph-dagflow-iconfont');
if (cssElement) {
  cssElement.innerHTML = '';
}
insertStyles(`
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/c/font_3765180_akekn48k4es.woff2?t=1705473718196') format('woff2'),
       url('//at.alicdn.com/t/c/font_3765180_akekn48k4es.woff?t=1705473718196') format('woff'),
       url('//at.alicdn.com/t/c/font_3765180_akekn48k4es.ttf?t=1705473718196') format('truetype');
}
`, 'vgraph-dagflow-iconfont');

unRegisterEdge('lineCurve');
registerEdge('lineCurve', {
  getPath(configs) {
    const { startPoint, endPoint } = configs;
    const path = [];
    path.push(['M', startPoint[0], startPoint[1]]);
    if (startPoint[0] === endPoint[0]) {
      path.push(['L', endPoint[0], endPoint[1]]);
      return path;
    }
    if (endPoint[1] - startPoint[1] > 50) {
      path.push(['L', startPoint[0], endPoint[1] - RANK_SEP]);
    }
    path.push([
      'C',
      startPoint[0], endPoint[1] - RANK_SEP / 2,
      endPoint[0], endPoint[1] - RANK_SEP / 2,
      endPoint[0], endPoint[1]
    ]);
    return path;
  },
  updateShapes() { },
});

function initEditor() {
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  const editor = new DAGFlowEditor({
    container,
    graphSize: [width, height],
    renderMode: 'canvas',
    scroller: {
      enable: false,
    },
    layout: {
      rankDir: 'TB',
      rankSep: RANK_SEP,
    },
    onChange() {
      console.log('changed')
    },
    setDefaultNode(nodeData) {
      const iconStyles = {
        icon: '&#xe613;', fillStyle: '#3073ff'
      };
      const setBgStyles = () => ({
        type: 'circle',
        size: 16,
        styles: {
          fillStyles: '#fff'
        }
      });
      return {
        width: 140,
        height: 40,
        label: nodeData.id || 'Root Node',
        anchors: [
          [0.5, 0],
          [0.5, 1]
        ],
        icons: [
          {
            setStyles() {
              return { icon: iconStyles.icon, fillStyle: iconStyles.fillStyle, action: 'source' };
            },
            setBgStyles,
            position: [0.5, 0],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: iconStyles.icon, fillStyle: iconStyles.fillStyle, action: 'target' };
            },
            setBgStyles,
            position: [0.5, 1],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: iconStyles.icon, fillStyle: iconStyles.fillStyle, action: 'siblingBefore' };
            },
            setBgStyles,
            position: [0, 0.5],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: iconStyles.icon, fillStyle: iconStyles.fillStyle, action: 'siblingAfter' };
            },
            setBgStyles,
            position: [1, 0.5],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: '&#xe6a7;', fillStyle: '#F50', action: 'remove' };
            },
            setBgStyles,
            position: [1, 0],
            show: 'hover',
          },
        ],
      }
    },
    setDefaultEdge() {
      return {
        type: 'lineCurve'
      };
    },
    setNodeStateStyles(state) {
      if (state === 'select') {
        return {
          strokeStyle: '#3073F2',
          fillStyle: '#E8F4FF',
        };
      }
      if (state === 'active') {
        return {
          strokeStyle: '#3073F2',
        }
      }
      return {};
    },
    setEdgeStateStyles(state) {
      if (state === 'active') {
        return {
          strokeStyle: '#3073F2'
        };
      }
      return {};
    },
    onClickNode(target, event) {
      const relatedTarget = event.relatedTarget;
      if (relatedTarget?.type === 'icon') {
        switch (relatedTarget.get('action')) {
        case 'source':
          editor.addSource(target.get('id'));
          break;
        case 'target':
          editor.addTarget(target.get('id'));
          break;
        case 'siblingBefore':
          editor.addSiblingBefore(target.get('id'));
          break;
        case 'siblingAfter':
          editor.addSiblingAfter(target.get('id'));
          break;
        case 'remove':
          editor.removeNode(target.get('id'));
          break;
        default: break;
        }
      }
    }
  });

  editor.getGraph().addBehavior(highlightRelations);
  // Shortcuts
  new Shortcuts({
    delete: {
      shortcut: 'backspace',
      handler: () => {
        const selected = editor.getGraph().getNodes().find(node => node.hasState('select'));
        selected && editor.removeNode(selected.get('id'));
      }
    },
    undo: {
      shortcut: '⌘+z, ctrl+z',
      handler: () => {
        editor.undo();
      }
    },
    redo: {
      shortcut: '⌘+shift+z, ctrl+shift+z',
      handler: () => {
        editor.redo();
      }
    }
  });

  return editor;
}

const editor = initEditor();
const div = document.createElement('div');
div.style.position = 'absolute';
div.style.left = '0';
div.style.top = '0';
container.append(div);

const btn1 = document.createElement('button');
div.append(btn1);
btn1.innerText = 'undo';
btn1.onclick = () => {
  editor.undo();
};

const btn2 = document.createElement('button');
div.append(btn2);
btn2.innerText = 'redo';
btn2.onclick = () => {
  editor.redo();
};

const btn3 = document.createElement('button');
div.append(btn3);
btn3.innerText = 'export data';
btn3.onclick = () => {
  editor.exportData();
};
```
