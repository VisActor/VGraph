import { Quadratic } from '../../src/renderer/shapes/quadratic';

describe('src/shapes/quadratic.ts', () => {
  const quad1 = new Quadratic({
    strokeStyle: '#ccc',
    points: [[100, 100], [150, 200], [200, 100]],
  });

  const quad2 = new Quadratic({
    strokeStyle: '#ccc',
    points: [[250, 60], [20, 110], [70, 250]],
  });

  it('getPointAt should work', () => {
    let point = quad1.getPointAt(0);
    expect(point).toEqual({ x: 100, y: 100 });
    point = quad1.getPointAt(1);
    expect(point).toEqual({ x: 200, y: 100 });
    point = quad1.getPointAt(0.2);
    expect(point).toEqual({ x: 120, y: 132 });
  });

  it('getBBox should work', () => {
    expect(quad1.getBBox()).toEqual({
      left: 99.5,
      top: 99.5,
      width: 101,
      height: 51,
    });

    expect(quad2.getBBox()).toEqual({
      left: 60.57142857142857,
      top: 59.5,
      width: 189.92857142857144,
      height: 191,
    });
  });

  it('clone should work', () => {
    const clone = quad1.clone();
    expect(clone.get('points')).toEqual([[100, 100], [150, 200], [200, 100]]);
    expect(clone.getPointAt(0)).toEqual({ x: 100, y: 100 });
    expect(clone.getBBox()).toEqual({
      left: 99.5,
      top: 99.5,
      width: 101,
      height: 51,
    });
    clone.set('points', [[200, 200], [150, 200], [100, 100]]);
    expect(clone.get('points')).toEqual([[200, 200], [150, 200], [100, 100]]);
    expect(quad1.get('points')).toEqual([[100, 100], [150, 200], [200, 100]]);
  });

  it('bugfix: update points will refresh startRad & endRad', () => {
    expect((quad1).getStartRad()).toEqual({
      x: -0.4472135954999579,
      y: -0.8944271909999159,
      rad: -2.0344439357957027,
    });
    expect((quad1).getEndRad()).toEqual({
      x: 0.44721359549995804,
      y: -0.8944271909999159,
      rad: -1.1071487177940904,
    });

    quad1.set('points', [[250, 60], [20, 110], [70, 250]]);

    expect((quad1).getStartRad()).toEqual({
      x: 0.9771763639228009,
      y: -0.21242964433104367,
      rad: -0.2140606835638215
    });
    expect((quad1).getEndRad()).toEqual({
      x: 0.33633639699815626,
      y: 0.9417419115948374,
      rad: 1.2277723863741932,
    });

  });
});
