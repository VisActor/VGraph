import { Layer, Circle, Canvas } from '../../src';

describe('src/shape/canvas.ts', () => {
  const div = document.createElement('div');
  it('getViewport should work', () => {
    const canvas = new Canvas({
      width: 100,
      height: 100,
      container: div,
    });

    expect(canvas.getViewport()).toEqual({
      left: -0,
      top: -0,
      width: 100,
      height: 100,
    });

    canvas.translate(50, 50);
    expect(canvas.getViewport()).toEqual({
      left: -50,
      top: -50,
      width: 100,
      height: 100,
    });

    canvas.scale(2, 2);
    expect(canvas.getViewport()).toEqual({
      left: -50,
      top: -50,
      width: 50,
      height: 50,
    });

    canvas.resetMatrix();
    const layer = new Layer();
    canvas.setViewportContainer(layer);

    layer.scale(2, 2);
    expect(canvas.getViewport()).toEqual({
      left: -0,
      top: -0,
      width: 50,
      height: 50,
    });

    canvas.destroy();
  });

  it('canvasCoordToPoint should work', () => {
    const canvas = new Canvas({
      width: 100,
      height: 100,
      container: div,
    });

    expect(canvas.canvasCoordToPoint({ x: 100, y: 100 })).toEqual({
      x: 100,
      y: 100,
    });

    canvas.translate(100, 100);
    expect(canvas.canvasCoordToPoint({ x: 100, y: 100 })).toEqual({
      x: 200,
      y: 200,
    });

    canvas.scale(0.5, 0.5);
    expect(canvas.canvasCoordToPoint({ x: 100, y: 100 })).toEqual({
      x: 100,
      y: 100,
    });

    canvas.destroy();
  });

  it('pointCoordToCanvas should work', () => {
    const canvas = new Canvas({
      width: 100,
      height: 100,
      container: div,
    });

    expect(canvas.pointCoordToCanvas({ x: 100, y: 100 })).toEqual({
      x: 100,
      y: 100,
    });

    canvas.translate(50, 50);
    expect(canvas.pointCoordToCanvas({ x: 100, y: 100 })).toEqual({
      x: 50,
      y: 50,
    });

    canvas.scale(0.5, 0.5);
    expect(canvas.pointCoordToCanvas({ x: 100, y: 100 })).toEqual({
      x: 150,
      y: 150,
    });

    canvas.destroy();
  });

  it('dowloadImage should work', () => {
    const canvas = new Canvas({
      width: 100,
      height: 100,
      container: div,
    });

    canvas.add(new Circle({ cx: 0, cy: 0, r: 10 }));
    canvas.add(new Circle({ cx: 5000, cy: 5000, r: 10 }));
    expect(canvas.downloadImage.bind(canvas)).not.toThrow();

    canvas.clear();
    canvas.add(new Circle({ cx: 0, cy: 0, r: 10 }));
    expect(canvas.downloadImage.bind(canvas)).not.toThrow();
    canvas.destroy();
  });
});