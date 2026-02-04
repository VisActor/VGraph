import { Graph } from '../../src';

describe('src/aniamtes', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 40,
      };
    },
  });

  graph.data({
    nodes: [
      {
        id: '1',
        x: 200,
        y: 200,
      },
      {
        id: '2',
        fillStyle: '#ccc',
        x: 300,
        y: 300,
      },
    ],
    edges: [
      {
        source: '1',
        target: '2',
      },
    ],
  });

  const node1 = graph.getNodeById('1');
  const edge = graph.getEdges()[0];

  it('diffuse animate should work with default configs', (done) => {
    graph.animate({
      target: node1,
      type: 'diffuse',
      common: {
        onFinish() {
          expect(node1.layer.children.length).toBe(1);
          const rect = node1.layer.children[0];
          expect(rect.get('left')).toBe(-50);
          expect(rect.get('top')).toBe(-20);
          expect(rect.get('width')).toBe(100);
          expect(rect.get('height')).toBe(40);
          expect(rect.get('opacity')).toBe(undefined);
          done();
        },
      },
    });
    expect(node1.layer.children.length).toBe(2);
    const rect = node1.layer.children[0];
    expect(rect.get('left')).toBe(-50);
    expect(rect.get('top')).toBe(-20);
    expect(rect.get('width')).toBe(100);
    expect(rect.get('height')).toBe(40);
    expect(rect.get('fillStyle')).toBe('#3073FF');
    expect(rect.get('opacity')).toBe(0.3);
  });

  it('diffuse animate should work with custom configs', (done) => {
    graph.animate({
      target: node1,
      type: 'diffuse',
      custom: {
        fillStyle: '#f50',
        opacity: 1,
        size: [200, 100],
      },
      common: {
        onFinish() {
          expect(node1.layer.children.length).toBe(1);
          const rect = node1.layer.children[0];
          expect(rect.get('left')).toBe(-50);
          expect(rect.get('top')).toBe(-20);
          expect(rect.get('width')).toBe(100);
          expect(rect.get('height')).toBe(40);
          expect(rect.get('opacity')).toBe(undefined);
          done();
        },
      },
    });
    expect(node1.layer.children.length).toBe(2);
    const rect = node1.layer.children[0];
    expect(rect.get('left')).toBe(-50);
    expect(rect.get('top')).toBe(-20);
    expect(rect.get('width')).toBe(100);
    expect(rect.get('height')).toBe(40);
    expect(rect.get('fillStyle')).toBe('#f50');
    expect(rect.get('opacity')).toBe(1);
  });

  it('flash should work with default configs', (done) => {
    graph.animate({
      type: 'flash',
      target: node1,
      common: {
        onFinish() {
          expect(node1.layer.children.length).toBe(1);
          expect(node1.layer.get('opacity')).toBe(undefined);
          done();
        },
      },
    });

    const layer = node1.layer;
    expect(layer.get('opacity')).toBe(1);
  });

  it('flash should work with custom configs', (done) => {
    graph.animate({
      type: 'flash',
      target: node1,
      custom: {
        strokeStyle: '#3073FF',
      },
      common: {
        onFinish() {
          expect(node1.layer.children.length).toBe(1);
          expect(node1.layer.get('opacity')).toBe(undefined);
          done();
        },
      },
    });

    const layer = node1.layer;
    expect(node1.getKeyShape().get('strokeStyle')).toBe('#3073FF');
    expect(layer.get('opacity')).toBe(1);
  });

  it('loading should work with default configs', (done) => {
    graph.animate({
      type: 'loading',
      target: node1,
      common: {
        repeat: false,
        onFinish() {
          const circle = node1.layer.get('__loadingCircle');
          expect(circle.destroyed);
          done();
        },
      },
    });

    expect(node1.layer.children.length).toBe(2);

    const circle = node1.layer.get('__loadingCircle');
    expect(circle.get('cx')).toBe(0);
    expect(circle.get('cy')).toBe(0);
    expect(circle.get('r')).toBe(8);
    expect(circle.get('lineWidth')).toBe(2);
    expect(circle.get('strokeStyle')).toBe('#3073FF');
    expect(circle.get('lineDashOffset')).toBe(0);
  });

  it('loading should work with custom configs', (done) => {
    graph.animate({
      type: 'loading',
      target: node1,
      custom: {
        mask: true,
        r: 12,
        color: '#666',
      },
      common: {
        repeat: false,
        onFinish() {
          const circle = node1.layer.get('__loadingCircle');
          expect(circle.destroyed);
          done();
        },
      },
    });

    expect(node1.layer.children.length).toBe(3);
    const mask = node1.layer.get('__loadingMask');
    expect(mask.get('fillStyle')).toBe('rgba(255, 255, 255, 0.6)');
    expect(mask.get('left')).toBe(-50);
    expect(mask.get('top')).toBe(-20);
    expect(mask.get('width')).toBe(100);
    expect(mask.get('height')).toBe(40);

    const circle = node1.layer.get('__loadingCircle');
    expect(circle.get('cx')).toBe(0);
    expect(circle.get('cy')).toBe(0);
    expect(circle.get('r')).toBe(12);
    expect(circle.get('lineWidth')).toBe(2);
    expect(circle.get('strokeStyle')).toBe('#666');
    expect(circle.get('lineDashOffset')).toBe(0);
  });

  it('flow should work with default configs', (done) => {
    graph.animate({
      target: edge,
      type: 'flow',
      common: {
        repeat: false,
        onFinish() {
          const path = edge.getKeyShape();
          expect(path.get('lineDash')).toEqual(undefined);
          expect(path.get('strokeStyle')).toBe('#C9CDD4');
          expect(path.get('lineDashOffset')).toBe(undefined);
          done();
        },
      },
    });

    const path = edge.getKeyShape();
    expect(path.get('lineDash')).toEqual([4, 2]);
    expect(path.get('strokeStyle')).toBe('#3073FF');
    expect(path.get('lineDashOffset')).toBe(0);
  });

  it('flow should work with custom configs', (done) => {
    graph.animate({
      target: edge,
      type: 'flow',
      custom: {
        strokeStyle: '#999',
        lineWidth: 2,
        endArrow: true,
      },
      common: {
        repeat: false,
        onFinish() {
          const path = edge.getKeyShape();
          expect(path.get('lineWidth')).toBe(1);
          expect(path.get('endArrow')).toBe(false);
          expect(path.get('lineDash')).toEqual(undefined);
          expect(path.get('strokeStyle')).toBe('#C9CDD4');
          expect(path.get('lineDashOffset')).toBe(undefined);
          done();
        },
      },
    });

    const path = edge.getKeyShape();
    expect(path.get('lineWidth')).toBe(2);
    expect(path.get('lineDash')).toEqual([4, 2]);
    expect(path.get('strokeStyle')).toBe('#999');
    expect(path.get('lineDashOffset')).toBe(0);
  });

  it('bugfix: common onFinish should work correctly', done => {
    const onFinish = () => {
      console.log(111);
      done();
    };
    const id = graph.animate({
      type: 'flash',
      target: node1,
      common: { onFinish },
    });
    const animator = graph.getCanvas().animationManager.queue.find((configs: any) => configs.id === id);
    expect(animator!.onFinish);
    expect(animator!.onFinish).not.toBe(onFinish);
  });

  it('trail should work', (done) => {
    graph.animate({
      target: edge,
      type: 'trail',
      common: {
        repeat: false,
        onFinish() {
          expect(edge.layer.children.length).toBe(1);
          done();
        },
      },
    });

    setTimeout(() => {
      expect(edge.layer.children.length).toBe(2);
      const path = edge.layer.children[1];
      expect(path.get('strokeStyle').addColorStop);
    }, 50);
  });
});
