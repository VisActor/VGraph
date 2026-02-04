import { Canvas, Circle, Path, Rect, Image, Quadratic, Cubic, Text, Icon, NodeLayer, GroupLayer, Rhombus } from '../../src';

describe('src/painters/canvas', () => {
  const div = document.createElement('div');
  document.body.append(div);
  const canvas = new Canvas({
    width: 100,
    height: 100,
    container: div,
  });

  const ctx = (canvas.painter as any).ctx;

  function imageData(x: number, y: number) {
    const result = ctx.getImageData(x, y, 1, 1);
    return result.data;
  }

  it('normal rect should work', (done: any) => {
    const rect = new Rect({
      left: 80,
      top: 20,
      width: 50,
      height: 80,
      fillStyle: '#f00',
    });
    canvas.add(rect);
    canvas.on('afterDraw', () => {
      const rgba = imageData(81, 21);
      expect(rgba[0]).toBe(255);
      expect(rgba[1]).toBe(0);
      expect(rgba[2]).toBe(0);
      expect(rgba[3]).toBe(255);
      canvas.clear();
      canvas.off('afterDraw');
      done();
    });
    canvas.draw();
  });

  it('radius rect should work', () => {
    const rect = new Rect({
      left: 0,
      top: 0,
      width: 50,
      height: 80,
      radius: 4,
      fillStyle: '#f00',
    });
    canvas.add(rect);
    canvas.instantDraw();
    let rgba = imageData(0, 0);
    expect(rgba[0]).toBe(0);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(0);

    rgba = imageData(25, 40);
    expect(rgba[0]).toBe(255);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(0);

    canvas.clear();
  });

  it('circle should work', () => {
    const circle = new Circle({
      cx: 10,
      cy: 10,
      r: 10,
      fillStyle: '#0f0',
    });
    canvas.add(circle);
    canvas.painter.draw();
    let rgba = imageData(10, 10);
    expect(rgba[0]).toBe(0);
    expect(rgba[1]).toBe(255);
    expect(rgba[2]).toBe(0);

    rgba = imageData(10, 1);
    expect(rgba[0]).toBe(0);
    expect(rgba[1]).toBe(255);
    expect(rgba[2]).toBe(0);

    rgba = imageData(1, 10);
    expect(rgba[0]).toBe(0);
    expect(rgba[1]).toBe(255);
    expect(rgba[2]).toBe(0);

    canvas.clear();
  });

  it('path should work', () => {
    const path = new Path({
      path: [
        ['M', 50, 50],
        ['H', 150],
        ['V', 150],
        ['a', 50, 50, 0, 0, 1, -150, 0],
        ['L', 50, 150],
        ['Z']
      ],
      strokeStyle: '#00f',
    });
    canvas.add(path);
    canvas.instantDraw();
    // const point = path.getPointAt(0.5);
    const rgba = imageData(51, 50);
    expect(rgba[0]).toBe(0);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(255);

    canvas.clear();
  });

  it('image should work', () => {
    const img = document.createElement('img');
    img.src = 'data:image/png;base64,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';
    const image = new Image({
      left: 0,
      top: 0,
      width: 83,
      height: 24,
      img
    });
    canvas.add(image);
    canvas.instantDraw();
    const rgba = imageData(42, 10);
    expect(rgba[0]).toBe(0);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(0);

    canvas.clear();
  });

  it('quadratic should work', () => {
    const quad = new Quadratic({
      points: [[10, 10], [15, 20], [20, 10]],
      strokeStyle: '#f00',
      lineWidth: 2,
    });
    canvas.add(quad);
    canvas.instantDraw();
    let rgba = imageData(10, 10);
    expect(rgba[0]).toBe(255);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(0);

    rgba = imageData(20, 10);
    expect(rgba[0]).toBe(255);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(0);

    quad.set({
      startArrow: true,
      endArrow: true,
    });
    canvas.instantDraw();
    canvas.clear();
  });

  it('cubic should work', () => {
    const cubic = new Cubic({
      points: [[10, 10], [15, 20], [20, 0], [30, 10]],
      strokeStyle: '#f00',
      lineWidth: 2,
      startArrow: true,
      endArrow: true,
    });
    canvas.add(cubic);
    canvas.instantDraw();

    const rgba = imageData(10, 10);
    expect(rgba[0]).toBe(255);
    expect(rgba[1]).toBe(0);
    expect(rgba[2]).toBe(0);

    canvas.clear();
  });

  it('text should work', () => {
    const text = new Text({
      x: 0,
      y: 0,
      fontSize: 14,
      width: 50,
      height: 100,
      text: '很长省略很长省略很长省略很长省略很长省略很长省略',
      textBaseline: 'bottom',
      textOverflow: 'ellipsis',
      fillStyle: 'p(a) data:image/png;base64,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',
    });
    canvas.add(text);
    canvas.instantDraw();
    canvas.clear();
  });

  it('icon should work', () => {
    const icon = new Icon({
      x: 0,
      y: 0,
      icon: '&#xe698;',
      fontFamily: 'iconfont',
      fillStyle: 'l(0) 0:#fff 0.5:#7ec2f3 1:#1890ff',
    });
    canvas.add(icon);
    canvas.instantDraw();
    canvas.clear();
  });

  it('nodeLayer should work', () => {
    const layer = new NodeLayer({
      left: 10,
      top: 10,
      width: 10,
      height: 10,
    });
    const rect = new Rect({
      left: -5,
      top: -5,
      width: 10,
      height: 10,
      fillStyle: '#f00',
    });
    layer.add(rect);
    canvas.add(rect);
    canvas.instantDraw();

    const shape = canvas.eventManager.eventHandler.getShape({ clientX: 10, clientY: 10 });
    expect(shape === rect);
    canvas.clear();
  });

  it('cubic path should work', () => {
    const cubic = new Path({
      path: [
        ['M', 100, 100],
        ['c', 50, 100, 100, -100, 200, 0]
      ],
      lineWidth: 2,
      fillStyle: '#ccc',
      strokeStyle: '#666'
    });
    canvas.add(cubic);
    let shape = canvas.eventManager.eventHandler.getShape({ clientX: 100, clientY: 100 });
    expect(shape === cubic);

    shape = canvas.eventManager.eventHandler.getShape({ clientX: 130.4, clientY: 128.8 });
    expect(shape === cubic);

    canvas.clear();
  });

  it('quadratic path should work', () => {
    const quadratic = new Path({
      path: [
        ['M', 100, 100],
        ['q', 100, -100, 200, 0]
      ],
      lineWidth: 2,
      fillStyle: '#ccc',
      strokeStyle: '#666'
    });
    canvas.add(quadratic);
    let shape = canvas.eventManager.eventHandler.getShape({ clientX: 100, clientY: 100 });
    expect(shape === quadratic);

    shape = canvas.eventManager.eventHandler.getShape({ clientX: 130.4, clientY: 128.8 });
    expect(shape === quadratic);

    canvas.clear();
  });

  it('groupLayer should work', () => {
    const group = new GroupLayer({
      shape: {
        fillStyle: '#ddd',
        strokeStyle: 'blue',
      },
      padding: [16, 24],
    });
    const rect = new Rect({
      left: 20,
      top: 20,
      width: 10,
      height: 10,
      fillStyle: '#f00',
    });
    group.set('shape', {
      fillStyle: 'blue',
      strokeStyle: '#ddd',
    });
    group.add(rect);
    canvas.add(group);
    canvas.instantDraw();

    const shape = canvas.eventManager.eventHandler.getShape({ clientX: 0, clientY: 0 });
    expect(shape === group);
    canvas.clear();
  });

  it('rhombus should render and pick correctly', () => {
    const rhombus = new Rhombus({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      strokeStyle: '#666'
    });

    canvas.add(rhombus);
    canvas.instantDraw();
    let rgba = imageData(1, 50);
    expect(rgba[0]).toBe(103);
    expect(rgba[1]).toBe(103);
    expect(rgba[2]).toBe(103);

    rgba = imageData(50, 1);
    expect(rgba[0]).toBe(102);
    expect(rgba[1]).toBe(102);
    expect(rgba[2]).toBe(102);

    rgba = imageData(99, 50);
    expect(rgba[0]).toBe(102);
    expect(rgba[1]).toBe(102);
    expect(rgba[2]).toBe(102);

    let shape = canvas.eventManager.eventHandler.getShape({ clientX: 1, clientY: 50 });
    expect(shape === rhombus);
    shape = canvas.eventManager.eventHandler.getShape({ clientX: 50, clientY: 50 });
    expect(shape === canvas);

    rhombus.set('fillStyle', '#ccc');
    canvas.instantDraw();
    rgba = imageData(50, 50);
    expect(rgba[0]).toBe(204);
    expect(rgba[1]).toBe(204);
    expect(rgba[2]).toBe(204);
    shape = canvas.eventManager.eventHandler.getShape({ clientX: 50, clientY: 50 });
    expect(shape === rhombus);
    canvas.clear();
  });
});
