---
category: examples
group: editor
title: 流水线编辑-批量添加节点
cover:
link: editor/dagFlowEditorBatch
option:
---
# 流水线编辑-批量添加节点

在流水线编辑中演示 batchChange 能力，可用于实现批量添加等自定义交互。<br>支持 undo/redo/export。

## 代码演示

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

function batchAdd(editor, id) {
  // graph 就是 Graph 对象实例，也可以直接操作添加节点
  const graph = editor.getGraph();
  // 操作前数据快照，用于 undo
  const formerData = editor.getSnapshot();
  console.log(formerData, editor);
  const branch = graph.add('node', { name: '条件节点' });
  const branchId = branch.get('id');
  // 连接操作节点和新增节点
  graph.add('edge', { source: id, target: branchId });
  const condition1 = graph.add('node', { name: '条件分支1' });
  const condition2 = graph.add('node', { name: '条件分支2' });
  // 连接条件节点和分支节点
  graph.add('edge', {
    source: branchId,
    target: condition1.get('id')
  });
  graph.add('edge', {
    source: branchId,
    target: condition2.get('id')
  });
  // 重布局，保持被操作节点的相对位置
  editor.reLayout(id);
  // 选中新增的分支节点，并保证节点在视窗中
  editor.selectNode(branchId);
  editor.selectionIntoView();
  // 操作后数据快照，用于 redo
  const currentData = editor.getSnapshot();
  editor.batchChange({ formerData, currentData });
}

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
        label: nodeData.name || nodeData.id,
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
          {
            setStyles() {
              return { icon: iconStyles.icon, fillStyle: iconStyles.fillStyle, action: 'batchAdd' };
            },
            setBgStyles,
            position: [1, 1],
            show: 'hover'
          }
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
      const id = target.get('id');
      if (relatedTarget?.type === 'icon') {
        switch (relatedTarget.get('action')) {
        case 'source':
          editor.addSource(id);
          break;
        case 'target':
          editor.addTarget(id);
          break;
        case 'siblingBefore':
          editor.addSiblingBefore(id);
          break;
        case 'siblingAfter':
          editor.addSiblingAfter(id);
          break;
        case 'remove':
          editor.removeNode(id);
          break;
        case 'batchAdd':
          batchAdd(editor, id);
          break;
        default: break;
        }
      }
    }
  });
  editor.setData({'nodes':[{'id':'A','x':85,'y':110,'width':140,'height':40,'name':'A','rank':1,'sources':['vgraphDagFlowRoot'],'targets':['B']},{'id':'vgraphDagFlowRoot','x':85,'y':20,'width':140,'height':40,'name':'vgraphDagFlowRoot','rank':0,'sources':[],'targets':['A']},{'id':'B','x':85,'y':200,'width':140,'height':40,'name':'B','rank':2,'sources':['A'],'targets':['C','D']},{'id':'C','x':0,'y':290,'width':140,'height':40,'name':'C','rank':3,'sources':['B'],'targets':['E']},{'id':'E','x':85,'y':380,'width':140,'height':40,'name':'E','rank':4,'sources':['C','D'],'targets':[]},{'id':'D','x':170,'y':290,'width':140,'height':40,'name':'D','rank':3,'sources':['B'],'targets':['E']}],'edges':[{'source':'vgraphDagFlowRoot','target':'A','type':'lineCurve','__source':1,'__target':0,'id':'V3hGqs'},{'source':'A','target':'B','type':'lineCurve','__source':1,'__target':0,'id':'pWTBFG'},{'source':'B','target':'C','type':'lineCurve','__source':1,'__target':0,'id':'Dmssq4'},{'source':'C','target':'E','type':'lineCurve','__source':1,'__target':0,'id':'lSkAlf'},{'source':'B','target':'D','type':'lineCurve','__source':1,'__target':0,'id':'DT4Vnn'},{'source':'D','target':'E','type':'lineCurve','__source':1,'__target':0,'id':'OhCSvH'}]});
  editor.getGraph().addBehavior(highlightRelations);
  // 快捷键
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
  console.log(editor.getGraph())
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
