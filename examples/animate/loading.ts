import {
  Graph, Node
} from '../../src';

const IMG_URL = 'https://cdn-tos-cn.bytedance.net/obj/maat/img/cWl1eWlsaW4uZWxhaW5l/file_184761c054531.svg';

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const btn = document.createElement('button');
  btn.textContent = '停止动画';
  div.append(btn);

  // 初始化 graph 实例
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: false,
    setDefaultNode(node) {
      return {
        fillStyle: '#FFF',
        strokeStyle: '#3073F2'
      };
    }, // 定制节点样式
    setNodeStateStyles(state) {
      if (state === 'active') {
        return {
          opacity: 1.0
        };
      }
      return { opacity: 0.2 };
    },
  });

  const node = graph.add('node', {
    type: 'tag',
    width: 140,
    height: 40,
    x: 200,
    y: 100,
    color: '#4170F2',
    label: '描边风格标签',
    icon: '&#xe60a;',
    theme: 'outlined',
    radius: 4,
  });

  const node1 = graph.add('node', {
    x: 400,
    y: 100,
    width: 200,
    height: 70,
    radius: 4,
    type: 'imageTag',
    label: '节点内容节点内容节点内容节点内容节点内容节点内容节点内容节点内容节点内容节点内容节点内容',
    image: IMG_URL
  });

  const uuid = graph.animate({
    type: 'loading',
    target: node as Node,
    custom: {
      // color: '#f50',
      mask: true
    },
  });

  graph.animate({
    type: 'loading',
    target: node1 as Node,
    custom: {
      // color: '#f50',
      mask: true
    },
  });

  btn.onclick = () => {
    graph.stopAnimate(uuid as string);
  };
})();
