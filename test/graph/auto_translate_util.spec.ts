import { Graph } from '../../src';
import { autoTranslate } from '../../src/behaviors/auto_translate'; 

describe('src/utils/auto_translate', () => {
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
  it('should work on left/top', done => {
    let interval = autoTranslate(graph, {
      left: 100,
      top: 100,
      width: 50,
      height: 50,
    }, () => {});
    expect(interval).toBe(null);
    interval = autoTranslate(graph, {
      left: 10,
      top: 10,
      width: 50,
      height: 50,
    }, (x: number, y: number) => {
      expect(x).toBe(10);
      expect(y).toBe(10);
      if (interval) {
        clearInterval(interval);
      }
      done();
    });
    expect(interval).not.toBe(null);
  });

  it('should work on right/bottom', done => {
    let interval = autoTranslate(graph, {
      left: 900,
      top: 300,
      width: 40,
      height: 30,
    }, () => {});
    expect(interval).toBe(null);
    interval = autoTranslate(graph, {
      left: 900,
      top: 300,
      width: 150,
      height: 150,
    }, (x: number, y: number) => {
      expect(x).toBe(-10);
      expect(y).toBe(-10);
      if (interval) {
        clearInterval(interval);
      }
      done();
    });
    expect(interval).not.toBe(null);
  });

  it('should work with scale ratio', done => {
    graph.scale(2);
    const interval = autoTranslate(graph, {
      left: 900,
      top: 300,
      width: 150,
      height: 150,
    }, (x: number, y: number) => {
      expect(x).toBe(-5);
      expect(y).toBe(-5);
      interval && clearInterval(interval);
      done();
    });
    expect(interval).not.toBe(null);
  });

  it('should work with scale ratio', done => {
    graph.scale(0.4);
    const interval = autoTranslate(graph, {
      left: 1800,
      top: 500,
      width: 150,
      height: 150,
    }, (x: number, y: number) => {
      expect(x).toBe(-12.5);
      expect(y).toBe(-12.5);
      interval && clearInterval(interval);
      done();
    });
    expect(interval).not.toBe(null);
  });
});