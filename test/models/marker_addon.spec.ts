import { NoteMarkerUtils, NodeLayer } from '../../src';

describe('src/node_addons/annotate_marker', () => {
  it('init default marker should work', () => {
    const layer = new NodeLayer({
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    });

    const marker = NoteMarkerUtils.init(layer, {
      width: 14,
      height: 16,
      fillStyle: 'red',
      strokeStyle: 'blue',
      lineWidth: 2,
    });

    expect(marker.get('fillStyle')).toBe('red');
    expect(marker.get('strokeStyle')).toBe('blue');
    expect(marker.get('lineWidth')).toBe(2);
    expect(marker.get('path')).toEqual([
      ['M', 70.5, -20],
      ['L', 56, -20],
      ['L', 70, -4],
      ['L', 70, -20]
    ]);

    layer.destroy();
  });

  it('init default marker with radius should work', () => {
    const layer = new NodeLayer({
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    });

    const marker = NoteMarkerUtils.init(layer, {
      width: 14,
      height: 16,
      radius: 4,
      fillStyle: 'red',
    });

    expect(marker.get('fillStyle')).toBe('red');
    expect(marker.get('strokeStyle')).toBe(undefined);

    expect(marker.get('path')).toEqual([
      ['M', 70, -16],
      ['A', 4, 4, 0, 0, 0, 66, -20],
      ['L', 56, -20],
      ['L', 70, -4],
      ['Z'],
    ]);
  });

  it('init left marker should work', () => {
    const layer = new NodeLayer({
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    });
    const marker = NoteMarkerUtils.init(layer, {
      position: 'left',
      width: 14,
      height: 16,
      fillStyle: 'red',
      strokeStyle: 'blue'
    });

    expect(marker.get('fillStyle')).toBe('red');
    expect(marker.get('strokeStyle')).toBe('blue');
    expect(marker.get('path')).toEqual([
      ['M', -70.5, -20],
      ['L', -56, -20],
      ['L', -70, -4],
      ['L', -70, -20]
    ]);

    layer.destroy();
  });

  it('init left marker with radius should work', () => {
    const layer = new NodeLayer({
      x: 0,
      y: 0,
      width: 140,
      height: 40,
    });
    const marker = NoteMarkerUtils.init(layer, {
      position: 'left',
      radius: 8,
      width: 14,
      height: 16,
      fillStyle: 'red',
      triggerId: 'trigger'
    });

    expect(marker.get('fillStyle')).toBe('red');
    expect(marker.get('triggerId')).toBe('trigger');
    expect(marker.get('path')).toEqual([
      ['M', -70, -12],
      ['A', 8, 8, 0, 0, 1, -62, -20],
      ['L', -56, -20],
      ['L', -70, -4],
      ['Z']
    ]);

    layer.destroy();
  });
});