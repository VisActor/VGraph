import { DAGFlowEditor, GraphEvent, Node, generateSnapshot, registerEdge, Layer, Cubic, Image } from '../../src';

const RANK_SEP = 50;

registerEdge('iconEdge', {
  extends: 'hLine',
  // edgeData 是一个连线实例通过 setDefaultEdge 之后 merge 的全量连线配置
  getConfigsForShape(edgeData: { [k: string]: any }) {
    // 大多数情况下直接使用内置连线绘制无须修改配置，相应的更新时也无须新增更新步骤
    return edgeData;
  },
  shape(layer: Layer, edgeConfigs: { [k: string]: any }) {
    const edge = layer.find((shape: any) => shape.get('_keyShape')) as Cubic;
    // 获取连线中心点定位
    const p = edge.getPointAt(0.5);
    const icon = new Image({
      left: p.x - 8,
      top: p.y - 8,
      width: 16,
      height: 16,
      url: 'https://cdn-tos-cn.bytedance.net/obj/maat/img/cWl1eWlsaW4uZWxhaW5l/file_18f5710dba932.svg'
    });
    // 先隐藏，hover 连线时出现
    icon.hide();
    layer.add(icon);
    layer.set('icon', icon);
  },
  // 节点位置更新引发连线更新，icon 位置随之更新。如果不需要更新 icon 位置就可以不用覆写此方法
  afterUpdatePath(layer: Layer, configs: { [k: string]: any }) {
    const edge = layer.find((shape: any) => shape.get('_keyShape')) as Cubic;
    // 在 shape 方法中将 icon 保存到了 layer 上，方便这里取出更新
    const icon = layer.get('icon');
    const p = edge.getPointAt(0.5);
    icon.set({ left: p.x - 8, top: p.y - 8 });
  },
});

(() => {
  const div = document.createElement('div');
  div.id = 'container';
  div.style.border = '1px solid #666';
  div.style.width = '840px';
  div.style.height = '640px';
  div.style.overflow = 'auto';
  document.body.append(div);
  const btnUndo = document.createElement('button');
  btnUndo.textContent = 'undo';
  div.appendChild(btnUndo);

  const btnRedo = document.createElement('button');
  btnRedo.textContent = 'redo';
  div.appendChild(btnRedo);
  const editor = new DAGFlowEditor({
    container: div,
    graphSize: [800, 600],
    scroller: {
      enable: false,
    },
    layout: {
      rankDir: 'LR',
      rankSep: RANK_SEP,
    },
    // mask: {
    //   enable: true
    // },
    onChange() {
      console.log('change========')
    },
    setDefaultNode(nodeData: any) {
      return {
        width: 140,
        height: 40,
        label: nodeData.id,
        anchors: [
          [0, 0.5],
          [1, 0.5]
        ],
        icons: [
          {
            setStyles() {
              return { icon: '&#xe613;', fillStyle: '#3073ff', action: 'siblingBefore' };
            },
            position: [0.5, 0],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: '&#xe613;', fillStyle: '#3073ff', action: 'siblingAfter' };
            },
            position: [0.5, 1],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: '&#xe613;', fillStyle: '#3073ff', action: 'source' };
            },
            position: [0, 0.5],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: '&#xe613;', fillStyle: '#3073ff', action: 'target' };
            },
            position: [1, 0.5],
            show: 'hover',
          },
          {
            setStyles() {
              return {
                fillStyle: '#3073F2',
                icon: nodeData.collapsed ? '&#xe618;' : '&#xe617;',
                cursor: 'pointer',
                action: nodeData.collapsed ? 'expand' : 'collapse',
              };
            },
            setBgStyles() {
              return {
                type: 'circle',
                size: 14
              };
            },
            position: [1, 0.5],
            offset: [20, 0],
            show: 'hover',
          },
          {
            setStyles() {
              return { icon: '&#xe6a7;', fillStyle: '#F50', action: 'remove' };
            },
            position: [1, 0],
            show: 'hover',
          },
          // {
          //   setStyles() {
          //     return { icon: '&#xe613;', fillStyle: '#3073ff', action: 'batch' };
          //   },
          //   position: [1, 1],
          //   show: 'hover',
          // }
        ],
      }
    },
    setDefaultEdge() {
      return {
        type: 'iconEdge',
      };
    },
    onClickNode(target: Node, event: GraphEvent) {
      const relatedTarget = event.relatedTarget;
      const action = relatedTarget?.get('action');
      if (relatedTarget?.type === 'icon') {
        switch (action) {
          case 'source':
            editor.addSource(target.get('id'));
            break;
          case 'target':
            // editor.addTarget(target.get('id'));
            editor.addTarget(target.get('id'), {}, false);
            break;
          case 'siblingBefore':
            // editor.addSiblingBefore(target.get('id'));
            editor.addSiblingBefore(target.get('id'), {}, false);
            break;
          case 'siblingAfter':
            // editor.addSiblingAfter(target.get('id'));
            editor.addSiblingAfter(target.get('id'), {}, false);
            break;
          case 'remove':
            // todo 后面可能改造 editor.removeNode ？
            batchRemove(target.get('id'));
            break;
          case 'collapse':
            editor.collapseNode(target.get('id'));
            relatedTarget.set('icon', '&#xe618;');
            relatedTarget.set('action', 'expand');
            break;
          case 'expand':
            editor.expandNode(target.get('id'));
            relatedTarget.set('icon', '&#xe617;');
            relatedTarget.set('action', 'collapse');
            break;
          default: break;
        }
      }
    }
  });
  const graph = editor.getGraph();
  graph.on('edge:mouseenter', (e) => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.show();
    graph.draw();
  });

  graph.on('node:contextmenu',(ev)=>{
    const node = ev.target;
    const nodeId = node.get('id');
    if (node.get('collapsed')){
      editor.expandNode(nodeId);
    } else {
      editor.collapseNode(nodeId);
    }

  })
  
  graph.on('edge:mouseleave', (e) => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.hide();
    graph.draw();
  });

  graph.on('edge:click', (e) => {
    if (e.relatedTarget.type === 'image') {
      editor.addNode(e.target);
    }
  });
  

  function batchRemove(id: string) {
    const graph = editor.getGraph();
    const formerData = generateSnapshot(graph);
    const node = graph.getNodeById(id);
    removeNode(node);
    editor.reLayout();
    const currentData = generateSnapshot(graph);
    editor.batchChange({ formerData, currentData });
  }

  function removeNode(node: Node) {
    const graph = editor.getGraph();
    for (let i = node.targets.length - 1; i >= 0; i--) {
      const id = node.targets[i];
      removeNode(graph.getNodeById(id));
    }
    graph.remove(node);
  }

  btnUndo.onclick = () => {
    editor.undo();
  };
  btnRedo.onclick = () => {
    editor.redo();
  }

  // setTimeout(() => {
  //   // editor.updateNode(editor.getGraph().getNodes()[0].get('id'), {
  //   //   label: '111'
  //   // });
  //   editor.setData(data);
  // }, 1000);
  (window as any).editor = editor;
  (window as any).graph = editor.getGraph();
})();