import { Graph, Rect, Text, Image, TagUtils, Icon, registerNode, Layer, dragCanvas, panZoom, uuid, GraphEvent } from '../../src';

const IMG_URL =
  'https://cdn-tos-cn.bytedance.net/obj/maat/img/cWl1eWlsaW4uZWxhaW5l/file_184761c054531.svg';

function register(graph: Graph) {
  registerNode('editIndex', {
    type: 'editIndex',
    extends: 'rect',
    drawCurrentLabel: false,
    shape(layer: Layer, configs: any) {
      const { width, height } = configs;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const rect = new Rect({
        left: -halfWidth,
        top: -halfHeight,
        width,
        height: 30,
        radius: [6, 6, 0, 0],
        strokeStyle: '#E3E5EB',
      });
      layer.add(rect);

      const img = new Image({
        left: -halfWidth + 10,
        top: -halfHeight + 7,
        width: 16,
        height: 16,
        url: IMG_URL
      });
      layer.add(img);

      const text = new Text({
        x: -halfWidth + 28,
        y: -halfHeight + 6,
        textBaseline: 'top',
        text: configs.title || '点击添加子分组',
        fillStyle: '#21252C',
        fontWeight: 500,
      });
      layer.set('titleText', text);
      layer.add(text);

      const icon = new Icon({
        x: halfWidth - 16,
        y: -halfHeight + 15,
        icon: '&#xe61e;',
        triggerId: 'nodeMenu', // 与 Trigger / Contextmenu 的 triggerId 配合使用
        fillStyle: '#606773',
      });
      layer.add(icon);

      const content = new Layer({ id: 'content' });
      layer.add(content);
      layer.set('contentLayer', content);
      this.fillContent(content, configs);
    },
    updateShapes(layer: Layer, configs: any) {
      const { width, height } = configs;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      layer.children[1].set({
        left: -halfWidth,
        top: -halfHeight,
      });
      layer.children[2].set({
        left: -halfWidth + 10,
        top: -halfHeight + 7,
      });
      layer.children[3].set({
        x: -halfWidth + 28,
        y: -halfHeight + 6,
      });
      layer.children[4].set({
        x: halfWidth - 16,
        y: -halfHeight + 15,
      });
      const titleText = layer.get('titleText');
      titleText.set('text', configs.title || '点击添加子分组');
      const content = layer.get('contentLayer');
      content.clear();
      this.fillContent(content, configs);
    },
    fillContent(layer: Layer, configs: any) {
      const { width, height, indexes } = configs;
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      if (indexes && indexes.length > 0) {
        let y = -halfHeight + 40;
        for (const index of indexes) {
          // 每个 tag 为一行指标
          TagUtils.initTag(layer, {
            left: -halfWidth + 10,
            top: y,
            text: index,
            background: {
              fillStyle: undefined,
              strokeStyle: 'rgba(33, 37, 44, 0.12)'
            },
            label: {
              fillStyle: '#21252C',
              textOverflow: 'ellipsis',
              triggerId: 'removeIndex', // 与 Contextmenu 配合使用删除指标
            },
            maxWidth: 130,
          });
          y += 28;
        }
        this.addIndex(layer, -halfWidth + 10, y, configs.id);
      } else {
        this.addIndex(layer, -40, 5, configs.id);
      }
    },
    addIndex(layer: Layer, x: number, y: number, id: string) {
      const icon = new Icon({
        icon: '&#xe61b;',
        x: x + 8,
        y: y + 8,
        fillStyle: '#89909D',
        size: 16,
      });
      layer.add(icon);
      icon.on('click', () => {
        addIndex(id);
      });
      const text = new Text({
        text: '添加指标',
        x: x + 18,
        y: y + 8,
        fillStyle: '#89909D',
      });
      layer.add(text);
      text.on('click', () => {
        addIndex(id);
      });
    }
  });

  function addIndex(id: string) {
    console.log(`just clicked add index on node ${id}`, graph.getNodeById(id));
  }

  registerNode('add', {
    type: 'add',
    extends: 'rect',
    drawCurrentLabel: false,
    shape() {

    },
  });
}
(() => {
  const div = document.createElement('div');
  div.style.position = 'relative';
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  div.style.height = '600px';
  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    setDefaultNode(node) {
      if (node.type === 'icon') {
        return {
          type: 'icon',
          width: node.width || 30,
          height: node.height || 30,
          icon: '&#xe61b;',
          anchors: [[0, 0.5], [1, 0.5]],
          radius: 6,
          strokeStyle: '#E3E5EB',
        }
      }
      return {
        type: 'editIndex',
        radius: 6,
        width: 150,
        height: node.indexes ? ((node.indexes.length + 1) * 28 + 40) : 180,
        strokeStyle: '#E1E4EB',
        anchors: [
          { position: [0, 0], offsets: [0, 15] },
          { position: [1, 0], offsets: [0, 15] }
        ]
        // icons: [
        //   {
        //     show: 'hover',
        //     position: [0.5, 1],
        //     setStyles() {
        //       return { 
        //         fillStyle: '#3073F2',
        //         icon: addIcon,
        //         cursor: 'pointer',
        //         type: 'bottom',
        //         // onClick() {
        //         //   addChildGroup(groupData);
        //         // }
        //       }
        //     }
        //   }, {
        //     show: 'hover',
        //     position: [1, 0.5],
        //     setStyles() {
        //       return { 
        //         fillStyle: '#3073F2',
        //         icon: addIcon,
        //         cursor: 'pointer',
        //         type: 'right',
        //         // onClick() {
        //         //   addSiblingGroup(groupData);
        //         // }
        //       }
        //     }
        //   }
        // ],
      };
    },
    setNodeStateStyles(state, data, node) {
      const label = node.getLabel();
      if (state === 'hover') {
        label.set('fillStyle', '#2E62F1');
        return { strokeStyle: '#2E62F1' };
      }
      if (state === 'active') {
        label.set('fillStyle', '#fff');
        return {
          fillStyle: '#2E62F1',
          strokeStyle: '#2E62F1'
        };
      }
      if (state === 'default') {
        label.set('fillStyle', 'rgba(20, 20, 20, 0.9)');
        return {
          strokeStyle: '#E1E4EB',
          fillStyle: '#fff',
        };
      }
    },
    setDefaultEdge(edgeData) {
      return {
        type: 'hLine',
        lineWidth: 1,
        hitWidth: 6,
        strokeStyle: '#7D8599',
        endArrow: true
      };
    },
    setEdgeStateStyles(state, edgeData, edge) {
      if (state === 'hover') {
        // 避免连线重合时出现显示错误
        edge.toFront();
        return {
          strokeStyle: '#2E62F1'
        };
      }
      if (state === 'active') {
        edge.toFront();
        return {
          lineWidth: 2,
          strokeStyle: '#2E62F1'
        };
      }
    },
    setDefaultGroup(groupData) {
      return {
        strokeStyle: '#D9D9D9',
        fillStyle: '#FAFBFC',
        radius: 4,
        padding: 20,
        lineWidth: 0.5,
        shadowOffsetY: 4,
        shadowBlur: 4,
        shadowColor: 'rgba(33, 37, 44, 0.04)', 
        anchors: [
          { position: [0, 0], offsets: [0, 15] }, 
          { position: [1, 0], offsets: [0, 15] }, 
        ],
        renderGroupTitle(group: any, layer: any, width: number) {
          // 标题前
          const img = new Image({
            url: IMG_URL,
            left: 12,
            top: 12,
            width: 16,
            height: 16,
          });
          // 标题文本
          const text = new Text({
            text: groupData.text || '点击添加分组',
            x: 32,
            y: 8,
            width: width - 32,
            textOverflow: 'ellipsis',
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 22,
            textBaseline: 'top',
            textAlign: 'left',
            fillStyle: '#21252C'
          });

          // 右侧 ...
          const icon = new Icon({
            icon: '&#xe61e;',
            x: width - 20,
            y: 16,
            fillStyle: '#606773',
            triggerId: 'groupMenu' // 和 Trigger 或 Contextmenu 配合使用
          });

          // 描述信息
          const subText = new Text({
            text: groupData.desc || '点击添加描述信息',
            x: 12,
            y: 52,
            width: width - 24,
            textOverflow: 'ellipsis',
            textBaseline: 'bottom',
            fillStyle: '#606773',
          });

          const backRect = new Rect({
            left: 0,
            top: 0,
            width: width,
            height: 60,
            radius: [4, 4, 0, 0],
            strokeStyle: '#E3E5EB',
          });

          layer.add(backRect);
          layer.add(img);
          layer.add(icon);
          layer.add(subText);
          layer.add(text);
          return 60;
        }
      };
    },
    // setGroupStateStyles(state, data) {
    // const group = graph.getGroupById(data.id);
    // const titleBg = group.titleLayer.find(
    //   (shape: any) => shape.type === 'rect'
    // );
    // const titleText = group.titleLayer.find(
    //   (shape: any) => shape.type === 'text'
    // );
    // if (state === 'hover') {
    //   titleBg.set('fillStyle', '#475466');
    //   titleText.set('fillStyle', '#545454');
    //   return {
    //     fillStyle: '#fff'
    //   };
    // } else {
    //   titleBg.set('fillStyle', '#7D8599');
    //   titleText.set('fillStyle', '#7D8599');
    // }
    // }
  });

  register(graph);

  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);

  graph.data({
    nodes: [
      { id: '1', x: 150, y: 200, title: '用户生命周期' },
      { id: '2', x: 350, y: 200, indexes: ['支付用户渗透率支付用户渗透率', '支付用户数'], title: '用户规模' },
      { id: '3', x: 500, y: 45, type: 'icon', group: 'groupRoot' }
    ],
    edges: [
      { source: '1', target: '2' }, 
      { source: 'groupRoot', target: '3' }
    ],
    groups: [
      {
        id: 'groupRoot',
        text: 'group',
        desc: 'group desc',
        children: ['1', '2']
      }
    ]
  } as any);

  // 编辑节点中的 indexes
  // const node1 = graph.getNodeById('1');
  // node1.updateData({ indexes: ['111', '222', '333', '44', '5555', '6'] });

  // 从分组中删除一个节点
  // node1.destroy();

  // 添加一个节点, 实现的时候不需要 x,y 走统一的 layout 再 graph.refresh() 即可
  // graph.add('node', {
  //   id: '4',
  //   x: 150,
  //   y: 400,
  //   groupId: 'groupRoot'
  // });

  // 添加一个分组, 实现的时候不需要 x,y 走统一的 layout 再 graph.refresh() 即可
  // 去掉原本的添加节点
  function addGroup(parentId: string, actionId: string) {
    graph.remove(graph.getNodeById(actionId));
    const groupId = uuid(10);
    const nodeId = uuid(10);
    const addId = uuid(10);
    graph.add('group', {
      id: groupId // 实现的时候可以用一个 uuid
    });
    
    graph.add('node', {
      id: nodeId,
      x: 600,
      y: 200,
      groupId: groupId
    });

    graph.add('edge', {
      source: parentId,
      target: groupId
    });
    
    graph.add('node', {
      type: 'icon',
      id: addId,
      x: 750,
      y: 45,
      group: groupId
    });
  
    graph.add('edge', {
      source: groupId,
      target: addId
    });
  }

  graph.on('node:click', (e: GraphEvent) => {
    const node = e.target;
    if (node.get('type') === 'icon') {
      addGroup(node.get('group'), node.get('id'));
    }
  });
})()