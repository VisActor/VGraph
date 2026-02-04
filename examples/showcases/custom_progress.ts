import {
  Graph, Text, registerNode, Layer, ProgressUtils, Node
} from '../../src';

function registerNodes() {
  registerNode('progressNode', {
    type: 'progressNode',
    extends: 'rect',
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      // 采用继承的方式画节点标题
      return {
        ...nodeData,
        label: {
          text: nodeData.label,
          offsetY: -24,
          fontSize: 13,
          lineHeight: 20,
          fontWeight: 'bold',
          textOverflow: 'ellipsis',
        }
      };
    },
    shape(layer: Layer, configs: any) {
      const percent = `${Math.round(configs.percent * 100)}%`;
      const text = new Text({
        x: -configs.width / 2 + 12,
        y: -configs.height / 2 + 66,
        text: `预计耗时 20s 当前进度${percent}`,
      });
      layer.set('text', text);
      layer.add(text);
      // 用 ProgressUtils 定义进度条
      const progress = ProgressUtils.init(layer, {
        x: -configs.width / 2 + 12,
        y: -configs.height / 2 + 46,
        width: configs.showLabel ? 172 : 216,
        percent: configs.percent,
        color: configs.processColor,
        label: configs.showLabel ? {
          text: percent,
          fillStyle: '#21252C'
        } : undefined,
      });
      layer.set('progress', progress);
    },
    updateShapes(layer: Layer, configs: any) {
      const text = layer.get('text');
      text.set('text', `预计耗时 20s 当前进度${Math.round(configs.percent * 100)}%`);
      const progress = layer.get('progress');

      ProgressUtils.update(progress, {
        percent: configs.percent,
        color: configs.processColor,
        updateLabel: (percent: number) => `${Math.round(percent * 100)}%`,
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
    getConfigsForShape(nodeData: any) {
      // 采用继承的方式画节点标题
      return {
        ...nodeData,
        label: {
          text: nodeData.label,
          offsetY: -12,
          fontSize: 13,
          lineHeight: 20,
          fontWeight: 'bold',
          textOverflow: 'ellipsis',
        }
      };
    },
    shape(layer: Layer, configs: any) {
      const percent = `${Math.round(configs.percent * 100)}%`;
      const text = new Text({
        x: -configs.width / 2 + 12,
        y: -configs.height / 2 + 50,
        text: `预计耗时 20s 当前进度${percent}`,
      });
      layer.add(text);
      layer.set('text', text);
      // 用 ProgressUtils 定义环形进度条
      const progress = ProgressUtils.init(layer, {
        x: 80,
        y: 0,
        width: 56,
        percent: configs.percent,
        color: configs.processColor,
        label: configs.showLabel ? {
          text: percent,
          fontSize: 14,
          fontWeight: 'bold',
          fillStyle: '#21252C'
        } : undefined,
        type: 'circle'
      });
      layer.set('progress', progress);
    },
    updateShapes(layer: Layer, configs: any) {
      const text = layer.get('text');
      text.set('text', `预计耗时 20s 当前进度${Math.round(configs.percent * 100)}%`);
      const progress = layer.get('progress');

      ProgressUtils.update(progress, {
        percent: configs.percent,
        color: configs.processColor,
        updateLabel: (percent: number) => `${Math.round(percent * 100)}%`,
        animate: true,
      });
    },
  });
}

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const btn = document.createElement('button');
  btn.textContent = '更新数据';
  div.append(btn);

  registerNodes();

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
        icon: node.y === 200,
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

  const nodes: Node[] = [];

  nodes.push(graph.add('node', {
    type: 'progressNode',
    x: 170,
    y: 100,
    width: 240,
    height: 84,
    percent: 0.25,
    processColor: '#FFC528',
    label: '简单进度条',
  }));

  nodes.push(graph.add('node', {
    type: 'progressNode',
    x: 450,
    y: 100,
    width: 240,
    height: 84,
    percent: 0.5,
    showLabel: true,
    processColor: '#E33232',
    label: '带文本标签的进度条',
  }));

  nodes.push(graph.add('node', {
    x: 170,
    y: 240,
    width: 240,
    height: 72,
    percent: 0.75,
    showLabel: false,
    processColor: '#3073F2',
    label: '简单环形进度条',
    type: 'circleProgressNode'
  }));

  nodes.push(graph.add('node', {
    x: 450,
    y: 240,
    width: 240,
    height: 72,
    percent: 0.9,
    showLabel: true,
    processColor: '#07A35A',
    label: '带文本的环形进度条',
    type: 'circleProgressNode'
  }));

  btn.onclick = () => {
    nodes.forEach((node: Node) => {
      const percent = Math.random();
      const idx = Math.floor(Math.random() * 4);
      const color = ['#07A35A', '#3073F2', '#E33232', '#FFC528'][idx];
      node.updateData({ percent: percent, processColor: color });
    });
  };

})();
