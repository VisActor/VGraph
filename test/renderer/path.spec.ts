import { Path } from '../../src/renderer/shapes/path';
import { pathToSegments } from '../../src/renderer/utils/path';

const absolutePath = [['M', 100, 100], ['L', 150, 200], ['H', 300], ['Z']];

const relativePath = [['m', 100, 100], ['l', 150, 200], ['v', 100], ['z']];

const absoluteArc = [
  ['M', 300, 300],
  ['A', 50, 50, 0, 1, 0, 400, 300],
];

const relativeArc = [
  ['M', 100, 100],
  ['m', -25, 0],
  ['a', 25, 25, 0, 1, 0, 50, 0],
];

const absoluteCubic = [
  ['M', 100, 100],
  ['C', 150, 200, 200, 0, 300, 100],
];

const relativeCubic = [
  ['M', 100, 100],
  ['c', 50, 100, 100, -100, 200, 0],
];

const absoluteQuadratic = [
  ['M', 100, 100],
  ['Q', 200, 0, 300, 100],
];

const relativeQuadratic = [
  ['M', 100, 100],
  ['q', 100, -100, 200, 0],
];

const path1 = new Path({
  path: absolutePath,
});

describe('src/shapes/path.ts', () => {
  it('calculateBBox should work', () => {
    path1.set('path', [
      ['M', 0, 0],
      ['L', 100, 100],
    ]);

    expect(path1.getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });

    path1.set('path', absolutePath);
    expect(path1.getBBox()).toEqual({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
    });

    path1.set('strokeStyle', '#666');
    expect(path1.getBBox()).toEqual({
      left: 99.5,
      top: 99.5,
      width: 201,
      height: 101,
    });

    expect(path1.getPointAt(0)).toEqual({ x: 100, y: 100 });
    expect(path1.getPointAt(0.5)).toEqual({ x: 280.9016994374947, y: 200 });
    expect(path1.getPointAt(1)).toEqual({ x: 100, y: 100 });

    path1.set('lineWidth', 6);
    expect(path1.getBBox()).toEqual({
      left: 97,
      top: 97,
      width: 206,
      height: 106,
    });

    path1.set('path', relativeArc);
    expect(path1.getBBox()).toEqual({
      left: 72,
      top: 97,
      width: 56,
      height: 31,
    });
    path1.destroy();
  });

  it('getPoint should work', () => {
    let point;
    point = path1.getPointAt(0);
    expect(point).toEqual({ x: 75, y: 100 });
    point = path1.getPointAt(0.5);
    expect(point).toEqual({ x: 100, y: 125 });
    point = path1.getPointAt(1);
    expect(point).toEqual({ x: 125, y: 100 });
  });
});

describe('src/util/path.ts', () => {
  it('parse absolute segments should work', () => {
    const { length, segments } = pathToSegments(absolutePath, true, false);
    expect(length).toBe(485.4101966249685);
    expect(segments.length).toBe(3);
    expect(segments[0]).toEqual({
      type: 'line',
      length: 111.80339887498948,
      configs: {
        points: [
          { x: 100, y: 100 },
          { x: 150, y: 200 },
        ],
        move: true,
      },
    });
    expect(segments[1]).toEqual({
      type: 'line',
      length: 150,
      configs: {
        points: [
          { x: 150, y: 200 },
          { x: 300, y: 200 },
        ],
        move: false,
      },
    });
    expect(segments[2]).toEqual({
      type: 'line',
      length: 223.60679774997897,
      configs: {
        points: [
          { x: 300, y: 200 },
          { x: 100, y: 100 },
        ],
        move: false,
      },
    });
  });

  it('parse relative segments should work', () => {
    const { length, segments } = pathToSegments(relativePath, false, true);
    expect(segments.length).toBe(3);
    expect(length).toBe(685.4101966249684);
    expect(segments[0]).toEqual({
      type: 'line',
      length: 250,
      configs: {
        points: [
          { x: 100, y: 100 },
          { x: 250, y: 300 },
        ],
        move: true,
      },
    });
    expect(segments[1]).toEqual({
      type: 'line',
      length: 100,
      configs: {
        points: [
          { x: 250, y: 300 },
          { x: 250, y: 400 },
        ],
        move: false,
      },
    });
    expect(segments[2]).toEqual({
      type: 'line',
      length: 335.4101966249685,
      configs: {
        points: [
          { x: 250, y: 400 },
          { x: 100, y: 100 },
        ],
        move: false,
      },
    });
  });

  it('parse absolute arc should work', () => {
    const { length, segments } = pathToSegments(absoluteArc, true, true);
    expect(segments.length).toBe(1);
    expect(segments[0].type).toBe('arc');
    expect(segments[0].configs.move);
    const params = segments[0].configs.params;
    expect(params[0]).toEqual({ x: 300, y: 300 });
    expect(params[1]).toEqual(350);
    expect(params[2]).toEqual(300);
    expect(params[3]).toEqual(50);
    expect(params[4]).toEqual(50);
    expect(params[5]).toEqual(Math.PI);
    expect(params[6]).toEqual(-Math.PI);
    expect(params[7]).toEqual(0);
    expect(params[8]).toEqual(0);
  });

  it('parse relative arc should work', () => {
    const { length, segments } = pathToSegments(relativeArc, false, false);
    expect(segments.length).toBe(1);
    expect(segments[0].type).toBe('arc');
    expect(segments[0].configs.move);
    const params = segments[0].configs.params;
    expect(params[0]).toEqual({ x: 75, y: 100 });
    expect(params[1]).toEqual(100);
    expect(params[2]).toEqual(100);
    expect(params[3]).toEqual(25);
    expect(params[4]).toEqual(25);
    expect(params[5]).toEqual(Math.PI);
    expect(params[6]).toEqual(-Math.PI);
    expect(params[7]).toEqual(0);
    expect(params[8]).toEqual(0);
  });

  it('bugfix: 0 length path should work', () => {
    const path = new Path({
      path: [
        ['M', 100, 100],
        ['L', 100, 100],
      ],
    });
    expect(path.getPointAt(0.5)).toEqual({ x: 100, y: 100 });
    expect(path.getPointAt(0.75)).toEqual({ x: 100, y: 100 });
    expect(path.getPointAt(1)).toEqual({ x: 100, y: 100 });
  });

  it('bugfix: arc length should work correctly', () => {
    const path = new Path({
      path: [
        ['M', 80, 65],
        ['A', 5, 5, 0, 0, 0, 75, 70],
      ],
    });
    path.getSegments();
    expect(path.getLength()).toBe((Math.PI * 10) / 4);
  });

  it('absolute cubic path should work', () => {
    const cubic = new Path({
      path: absoluteCubic,
    });

    const segments = cubic.getSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].type).toBe('cubic');
    expect(segments[0].configs.move).toBe(true);
    expect(segments[0].configs.points).toEqual([
      { x: 100, y: 100 },
      { x: 150, y: 200 },
      { x: 200, y: 0 },
      { x: 300, y: 100 },
    ]);

    let point = cubic.getPointAt(0);
    expect(point).toEqual({ x: 100, y: 100 });
    point = cubic.getPointAt(1);
    expect(point).toEqual({ x: 300, y: 100 });
    point = cubic.getPointAt(0.2);
    expect(point).toEqual({ x: 130.4, y: 128.8 });

    expect(cubic.getBBox()).toEqual({
      left: 100,
      top: 71.13248654051871,
      width: 200,
      height: 57.73502691896256,
    });
  });

  it('relative cubic path should work', () => {
    const cubic = new Path({
      path: relativeCubic,
    });

    const segments = cubic.getSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].type).toBe('cubic');
    expect(segments[0].configs.move).toBe(true);
    expect(segments[0].configs.points).toEqual([
      { x: 100, y: 100 },
      { x: 150, y: 200 },
      { x: 200, y: 0 },
      { x: 300, y: 100 },
    ]);

    let point = cubic.getPointAt(0);
    expect(point).toEqual({ x: 100, y: 100 });
    point = cubic.getPointAt(1);
    expect(point).toEqual({ x: 300, y: 100 });
    point = cubic.getPointAt(0.2);
    expect(point).toEqual({ x: 130.4, y: 128.8 });

    expect(cubic.getBBox()).toEqual({
      left: 100,
      top: 71.13248654051871,
      width: 200,
      height: 57.73502691896256,
    });
  });

  it('absolute quadratic path should work', () => {
    const quadratic = new Path({
      path: absoluteQuadratic,
    });

    const segments = quadratic.getSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].type).toBe('quadratic');
    expect(segments[0].configs.move).toBe(true);
    expect(segments[0].configs.points).toEqual([
      { x: 100, y: 100 },
      { x: 200, y: 0 },
      { x: 300, y: 100 },
    ]);

    let point = quadratic.getPointAt(0);
    expect(point).toEqual({ x: 100, y: 100 });
    point = quadratic.getPointAt(1);
    expect(point).toEqual({ x: 300, y: 100 });
    point = quadratic.getPointAt(0.2);
    expect(point).toEqual({ x: 140, y: 68 });

    expect(quadratic.getBBox()).toEqual({
      left: 100,
      top: 50,
      width: 200,
      height: 50,
    });
  });

  it('relative quadratic path should work', () => {
    const quadratic = new Path({
      path: relativeQuadratic,
    });

    const segments = quadratic.getSegments();
    expect(segments.length).toBe(1);
    expect(segments[0].type).toBe('quadratic');
    expect(segments[0].configs.move).toBe(true);
    expect(segments[0].configs.points).toEqual([
      { x: 100, y: 100 },
      { x: 200, y: 0 },
      { x: 300, y: 100 },
    ]);

    let point = quadratic.getPointAt(0);
    expect(point).toEqual({ x: 100, y: 100 });
    point = quadratic.getPointAt(1);
    expect(point).toEqual({ x: 300, y: 100 });
    point = quadratic.getPointAt(0.2);
    expect(point).toEqual({ x: 140, y: 68 });

    expect(quadratic.getBBox()).toEqual({
      left: 100,
      top: 50,
      width: 200,
      height: 50,
    });
  });
});
