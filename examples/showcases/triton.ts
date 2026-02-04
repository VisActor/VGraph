/* eslint-disable @typescript-eslint/no-unused-vars */
import { Graph, panZoom, DAGLayout, Minimap, registerNode, unRegisterNode, TagUtils, Image, Rect, Text, Path, Layer, Node, GraphEvent } from '../../src';
const data = {
  'nodes': [
    { 'name': 'JOB1', 'status': '待签署', 'id': '1', stuck: true, moreInfo: ['T+1'], report: true },
    { 'name': 'JOB2', 'status': '暂缓签署', 'id': '2', stuck: true, },
    { 'name': 'JOB3', 'status': '已拒绝', 'id': '3', stuck: true, },
    { 'name': 'JOB4', 'status': '无需签署', 'id': '4', stuck: true, },
    { 'name': 'JOB5', 'status': '已下线', 'id': '5', stuck: true, },
    { 'name': 'JOB6', 'status': '待签署', 'id': '6', stuck: false },
    { 'name': 'JOB7', 'status': '暂缓签署', 'id': '7', stuck: false, moreInfo: ['风神', 'T+2'] },
    { 'name': 'JOB8', 'status': '已拒绝', 'id': '8', stuck: false },
    { 'name': 'JOB9', 'status': '无需签署', 'id': '9', stuck: false },
    { 'name': 'JOB10', 'status': '已下线', 'id': '10', stuck: false },
    { 'name': 'JOB11', 'status': '成功签署', 'id': '11', stuck: true, },
    { 'name': 'JOB12', 'status': '成功签署', 'id': '12' }
  ],
  'edges': [
    { 'source': '1', 'target': '2' },
    { 'source': '1', 'target': '3' },
    { 'source': '2', 'target': '4' },
    { 'source': '2', 'target': '5' },
    { 'source': '3', 'target': '6' },
    { 'source': '4', 'target': '7' },
    { 'source': '5', 'target': '7' },
    { 'source': '5', 'target': '8' },
    { 'source': '6', 'target': '9' },
    { 'source': '7', 'target': '10' },
    { 'source': '8', 'target': '10' },
    { 'source': '9', 'target': '11' },
    { 'source': '9', 'target': '12' }
  ]
}
// 默认颜色
const colors: any = {
  成功签署: '#C3F2CF',
  暂缓签署: '#C7DDFF',
  已拒绝: '#FFD9D7',
  无需签署: '#E8E7E7',
  已下线: '#E8E7E7',
  待签署: '#FCE9CA',
};

// 默认状态卡点边框色
const borerColors: any = {
  成功签署: '#AFEEC0',
  暂缓签署: '#A8CBFF',
  已拒绝: '#FECDCA',
  无需签署: '#DDDDDD',
  已下线: '#DDDDDD',
  待签署: '#F8DEB6',
};

// 点击态
const activeColors: any = {
  成功签署: '#39BD50',
  暂缓签署: '#297FF2',
  已拒绝: '#DC1F15',
  无需签署: '#B1B3B5',
  已下线: '#B1B3B5',
  待签署: '#FF900D',
};

// 默认状态下状态图片，这是原本 dorado 的，可能得重新抠一下
const icons: any = {
  成功签署: 'https://cdn-tos-cn.bytedance.net/obj/archi/dp/dorado_fe/images/graph_success.svg',
  暂缓签署: 'https://cdn-tos-cn.bytedance.net/obj/archi/dp/dorado_fe/images/graph_running.svg',
  已拒绝: 'https://cdn-tos-cn.bytedance.net/obj/archi/dp/dorado_fe/images/graph_fail.svg',
  无需签署: 'https://cdn-tos-cn.bytedance.net/obj/archi/dp/dorado_fe/images/graph_stop.svg',
  已下线: 'https://cdn-tos-cn.bytedance.net/obj/archi/dp/dorado_fe/images/graph_stop.svg',
  待签署: 'https://cdn-tos-cn.bytedance.net/obj/archi/dp/dorado_fe/images/graph_wait.svg',
};

// 点击状态下的图片，这是原本 dorado 的，可能得重新抠一下
const filledIcons: any = {
  成功签署: 'https://sf6-cdn-tos.huoshanstatic.com/obj/maat-public/img/cWl1eWlsaW4uZWxhaW5l/file_181fb72642088.svg',
  暂缓签署: 'https://sf6-cdn-tos.huoshanstatic.com/obj/maat-public/img/cWl1eWlsaW4uZWxhaW5l/file_181fb72640b18.svg',
  已拒绝: 'https://sf6-cdn-tos.huoshanstatic.com/obj/maat-public/img/cWl1eWlsaW4uZWxhaW5l/file_181fb72641e64.svg',
  无需签署: 'https://sf6-cdn-tos.huoshanstatic.com/obj/maat-public/img/cWl1eWlsaW4uZWxhaW5l/file_181fb72643f56.svg',
  已下线: 'https://sf6-cdn-tos.huoshanstatic.com/obj/maat-public/img/cWl1eWlsaW4uZWxhaW5l/file_181fb72643f56.svg',
  待签署: 'https://sf6-cdn-tos.huoshanstatic.com/obj/maat-public/img/cWl1eWlsaW4uZWxhaW5l/file_181fb72642192.svg',
};

function renderTitle(layer: Layer, configs: any) {
  const { width, height } = configs;
  const left = - width / 2;
  const top = - height / 2;
  const img = new Image({
    left: left + 10,
    top: top + 7,
    width: 14,
    height: 14,
    url: icons[configs.status],
  });
  layer.add(img);

  const text = new Text({
    x: left + 30,
    y: top + 14,
    text: configs.status,
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 14,
    fillStyle: 'rgba(20, 20, 20, 0.9)',
  });
  layer.set('titleText', text);
  layer.set('titleImage', img);
  layer.add(text);
}

function renderReportTag(layer: Layer, left: number, top: number) {
  TagUtils.initTag(layer, {
    left: left + 188,
    top: top + 5,
    text: '申报点',
    label: {
      fillStyle: '#fff',
      fontWeight: 500,
    },
    background: {
      fillStyle: '#3C88C8'
    }
  });
}

function registerNodes() {
  unRegisterNode('stuck');
  unRegisterNode('unstuck');

  // 卡点节点
  registerNode('stuck', {
    type: 'stuck',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        fillStyle: colors[nodeData.status],
        strokeStyle: borerColors[nodeData.status],
        radius: 4,
      }
    },
    shape(layer: Layer, configs: any) {
      const { width, height } = configs;
      const left = - width / 2;
      const top = - height / 2;
      renderTitle(layer, configs);
      const bkg = new Rect({
        left: left + 6,
        top: top + 28,
        width: width - 12,
        height: height - 34,
        fillStyle: '#FFF',
      });
      layer.add(bkg);
      const text = new Text({
        x: left + 12,
        y: top + 42,
        width: width - 12,
        fillStyle: 'rgba(20, 20, 20, 0.9)',
        text: configs.name,
        textOverflow: 'ellipsis',
        fontWeight: 500,
      });
      layer.add(text);

      if (configs.moreInfo) {
        const tagConfigs = configs.moreInfo.map((text: string) => ({
          text,
        }));
        TagUtils.initTags(layer, {
          left: left + 12,
          top: top + 58,
          tags: tagConfigs,
        });
      }

      if (configs.report) {
        renderReportTag(layer, left, top);
      }
    },
  });

  // 非卡点节点
  registerNode('unstuck', {
    type: 'unstuck',
    extends: 'rect',
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        strokeStyle: '#E1E4E8',
        radius: 4,
      }
    },
    shape(layer: Layer, configs: any) {
      const { width, height } = configs;
      const left = - width / 2;
      const top = - height / 2;
      renderTitle(layer, configs);
      const path = new Path({
        path: [
          ['M', left, top + 28],
          ['L', left + width, top + 28]
        ],
        strokeStyle: '#E1E4E8'
      });
      layer.add(path);

      const text = new Text({
        x: left + 12,
        y: top + 43,
        width: width - 12,
        fillStyle: 'rgba(20, 20, 20, 0.65)',
        text: configs.name,
        textOverflow: 'ellipsis',
        fontWeight: 500,
      });
      layer.add(text);
    }
  });
}

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const minimapDiv = document.createElement('div');
  minimapDiv.style.position = 'absolute';
  minimapDiv.style.right = '10px';
  minimapDiv.style.top = '10px';
  minimapDiv.style.border = '1px solid #D1D5DA';
  document.body.append(minimapDiv);

  data.nodes.forEach((node: any) => {
    node.width = 80;
    node.height = 20;
  });
  registerNodes();
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(node: any) {
      let height = 58;
      if (node.stuck) {
        height = node.moreInfo ? 90 : 64;
      }
      return {
        type: node.stuck ? 'stuck' : 'unstuck',
        width: 240,
        height,
        anchors: [
          [0.5, 0.0],
          [0.5, 1.0]
        ],
      };
    },
    setNodeStateStyles(state, nodeData, node) {
      const label = node.layer.get('titleText');
      const img = node.layer.get('titleImage');
      const status = nodeData.status;
      if (state === 'click') {
        if (!nodeData.stuck) {
          return {
            strokeStyle: activeColors[status]
          };
        }
        label.set('fillStyle', '#FFF');
        img.set('url', filledIcons[status]);
        return {
          fillStyle: activeColors[status],
          strokeStyle: activeColors[status],
        };
      }
      if (!nodeData.stuck) {
        return {
          strokeStyle: '#E1E4E8'
        };
      }
      label.set('fillStyle', 'rgba(20, 20, 20, 0.9)');
      img.set('url', icons[status]);
      return {
        fillStyle: colors[status],
        strokeStyle: borerColors[status],
      }
    },
    setDefaultEdge() {
      return {
        type: 'line',
        endArrow: {
          width: 3,
          height: 5
        },
        strokeStyle: '#D1D5DA',
        appendSize: 2
      };
    }
  });
  graph.addBehavior(panZoom);
  graph.data(data);

  let activeNode: any = null;
  graph.on('node:click', (e: GraphEvent) => {
    console.log(e.target.configs);
    if (activeNode) {
      activeNode.setState('default', true);
    }
    activeNode = e.target;
    e.target.setState('click');
  });


  const dag = new DAGLayout({
    graph,
  });
  graph.refresh();
  graph.fitView();
  document.fonts.ready.then(() => {
    graph.draw();
  });
  new Minimap(graph, {
    container: minimapDiv,
    width: 200,
    height: 140,
    type: 'delegate',
    getNodeStyles(node: Node) {
      if (node.get('stuck')) {
        return {
          fillStyle: colors[node.get('status')]
        }
      }
      return {
        fillStyle: '#fff',
        strokeStyle: colors[node.get('status')],
        lineWidth: 6,
      }
    }
  });

  (window as any).graph = graph;
})();
