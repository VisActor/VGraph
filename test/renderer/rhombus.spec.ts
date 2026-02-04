import { Rhombus } from '../../src/renderer/shapes/rhombus';

describe('src/renderer/shapes/rhombus.ts', () => {
  it('init should work', () => {
    const rhombus = new Rhombus({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      fillStyle: '#ccc',
    });

    expect(rhombus.type).toBe('rhombus');
    expect(rhombus.get('left')).toBe(0);
    expect(rhombus.get('top')).toBe(0);
    expect(rhombus.get('width')).toBe(100);
    expect(rhombus.get('height')).toBe(100);
    expect(rhombus.get('fillStyle')).toBe('#ccc');
    expect(rhombus.get('strokeStyle')).toBe(undefined);
    expect(rhombus.get('radius')).toBe(0);
  });

  it('getBBox should work', () => {
    const rhombus = new Rhombus({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      fillStyle: '#ccc',
    });
    let bbox = rhombus.getBBox();
    expect(bbox).toEqual({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });

    rhombus.set('strokeStyle', '#666');
    bbox = rhombus.getBBox();
    expect(bbox).toEqual({
      left: -0.5,
      top: -0.5,
      width: 101,
      height: 101,
    });

    rhombus.set('lineWidth', 4);
    bbox = rhombus.getBBox();
    expect(bbox).toEqual({
      left: -2,
      top: -2,
      width: 104,
      height: 104,
    });

    rhombus.scale(2, 2);
    bbox = rhombus.getBBox();
    expect(bbox).toEqual({
      left: -4,
      top: -4,
      width: 208,
      height: 208,
    });

    rhombus.rotate(90);
    bbox = rhombus.getBBox();
    expect(bbox).toEqual({
      left: -4,
      top: -4,
      width: 208,
      height: 208,
    });
  });
});
