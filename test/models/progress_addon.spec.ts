import { ProgressUtils, Layer, Graph } from '../../src';

describe('src/node_addons/progress', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 20,
        fillStyle: '#666'
      };
    }
  });

  const node = graph.add('node', { id: '111' });

  it('init & update default progress should work', () => {
    const layer = new Layer();
    const progress = ProgressUtils.init(layer, {
      x: 0,
      y: 0,
      width: 100,
      percent: 0.1,
    });

    expect(progress.children.length).toBe(2);

    const trail = progress.children[0];
    expect(trail.type).toBe('path');
    expect(trail.get('strokeStyle')).toBe('#E3E5EB');
    expect(trail.get('lineWidth')).toBe(8);
    expect(trail.get('lineCap')).toBe('round');
    expect(trail.get('path')).toEqual([
      ['M', 0, 0],
      ['L', 100, 0]
    ]);

    const path = progress.children[1];
    expect(path.type).toBe('path');
    expect(path.get('strokeStyle')).toBe('#3073F2');
    expect(path.get('lineWidth')).toBe(8);
    expect(path.get('lineCap')).toBe('round');
    expect(path.get('path')).toEqual([
      ['M', 0, 0],
      ['L', 100, 0]
    ]);
    expect(path.get('lineDash')).toEqual([
      10, 100
    ]);

    ProgressUtils.update(progress, {
      percent: 0.5,
      animate: false,
    });

    expect(path.get('path')).toEqual([
      ['M', 0, 0],
      ['L', 100, 0]
    ]);
    expect(path.get('lineDash')).toEqual([
      50, 100
    ]);
  });

  it('init circle progress should work', done => {
    const progress = ProgressUtils.init(node.layer, {
      x: 0,
      y: 0,
      width: 100,
      percent: 0.6,
      lineWidth: 3,
      type: 'circle',
      color: '#FFC528',
      trailColor: '#D9D9D9',
      label: {
        text: '75%'
      }
    });

    expect(progress.children.length).toBe(3);
    const trail = progress.children[0];
    expect(trail.type).toBe('circle');
    expect(trail.get('cx')).toBe(0);
    expect(trail.get('cy')).toBe(0);
    expect(trail.get('r')).toBe(50);
    expect(trail.get('strokeStyle')).toBe('#D9D9D9');
    expect(trail.get('lineWidth')).toBe(3);

    const circle = progress.children[1];
    expect(circle.type).toBe('circle');
    expect(circle.get('cx')).toBe(0);
    expect(circle.get('cy')).toBe(0);
    expect(circle.get('r')).toBe(50);
    expect(circle.get('strokeStyle')).toBe('#FFC528');
    expect(circle.get('lineWidth')).toBe(3);
    expect(Math.round(circle.get('lineDash')[0])).toBe(Math.round(Math.PI * 60));
    expect(Math.round(circle.get('lineDash')[1])).toBe(Math.round(Math.PI * 100));

    const text = progress.children[2];
    expect(text.get('text')).toBe('75%');
    expect(text.get('textAlign')).toBe('center');
    expect(text.get('x')).toBe(0);
    expect(text.get('y')).toBe(0);
    expect(text.get('width')).toBe(97);

    ProgressUtils.update(progress, {
      percent: 0.25,
      updateLabel: (percent: number) => `test aniamte to ${percent}`,
      animate: {
        duration: 100,
        onFinish() {
          expect(trail.get('r')).toBe(50);
          expect(trail.get('strokeStyle')).toBe('#D9D9D9');
          expect(trail.get('lineWidth')).toBe(3);
          expect(circle.get('r')).toBe(50);
          expect(circle.get('strokeStyle')).toBe('#FFC528');
          expect(circle.get('lineWidth')).toBe(3);
          expect(Math.round(circle.get('lineDash')[0])).toBe(Math.round(Math.PI * 25));
          expect(Math.round(circle.get('lineDash')[1])).toBe(Math.round(Math.PI * 100));
          expect(text.get('text')).toBe('test aniamte to 0.25')
          done();
        }
      }
    });
  });

  it('update circle progress color should work', done => {
    const progress = ProgressUtils.init(node.layer, {
      x: 0,
      y: 0,
      width: 100,
      percent: 0.6,
      lineWidth: 3,
      type: 'circle',
      color: '#FFC528',
      trailColor: '#D9D9D9',
      label: {
        text: '75%'
      }
    });

    expect(progress.children.length).toBe(3);
    const trail = progress.children[0];
    const circle = progress.children[1];
    const text = progress.children[2];

    ProgressUtils.update(progress, {
      percent: 0.25,
      color: '#EEC689',
      updateLabel: (percent: number) => `test aniamte to ${percent}`,
      animate: {
        duration: 100,
        onFinish() {
          expect(trail.get('r')).toBe(50);
          expect(trail.get('strokeStyle')).toBe('#D9D9D9');
          expect(trail.get('lineWidth')).toBe(3);
          expect(circle.get('r')).toBe(50);
          expect(circle.get('strokeStyle')).toBe('#EEC689');
          expect(circle.get('lineWidth')).toBe(3);
          expect(Math.round(circle.get('lineDash')[0])).toBe(Math.round(Math.PI * 25));
          expect(Math.round(circle.get('lineDash')[1])).toBe(Math.round(Math.PI * 100));
          expect(text.get('text')).toBe('test aniamte to 0.25')
          done();
        }
      }
    });
  });
});