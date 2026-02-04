import { Graph, Node } from '../../src';

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const btn = document.createElement('button');
  btn.textContent = '开始动画';
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
        type: 'category',
        width: 140,
        height: 40,
        color: '#3073F2',
        radius: 4,
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
    x: 200,
    y: 100,
    label: '节点闪烁动画',
    
  });

  btn.onclick = () => {
    const animator = graph.animate({
      type: 'flash',
      target: node as Node,
      custom: {
        strokeStyle: '#3073FF'
      },
      common: {
        onFinish() {
          const zzz = undefined as any;
          console.log(zzz.yy)
        }
      }
    });
  };
})();
