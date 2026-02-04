import { CountBadgeUtils, Graph } from '../../src';
const OS_PLATFORM = process.platform;

function expectValueBySystem(value: any, macValue: any, winValue: any) {
  if (OS_PLATFORM === 'linux') {
    expect(value).toBe(winValue);
  } else {
    expect(value).toBe(macValue);
  }
}

describe('src/node_addons/count_badge', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        color: '#666',
        width: 100,
        height: 20,
      };
    }
  });

  const node = graph.add('node', {
    x: 100,
    y: 100,
  });

  it('init default badge should work', () => {
    const layer = CountBadgeUtils.init(node, { text: '111' });
    expect(layer.children.length).toBe(3);
    expect(node.layer.children.length).toBe(2);
    expect(node.layer.get('customAppendSize')[1] > 30);
    expect(node.layer.get('appendSize')[1] > 58);

    const path = layer.children[0];
    expect(path.type).toBe('path');
    expect(path.get('path')).toEqual([
      ['M', 50, 0],
      ['L', 58, 0]
    ]);
    expect(path.get('strokeStyle')).toBe('#666');

    const rect = layer.children[1];
    expect(rect.type).toBe('rect');
    expect(rect.get('strokeStyle')).toBe('#666');
    expect(rect.get('fillStyle')).toBe('#fff');
    expect(rect.get('left')).toBe(58);
    expect(rect.get('top')).toBe(-10);
    expect(rect.get('height')).toBe(20);

    const text = layer.children[2];
    expect(text.get('text')).toBe('111');
    expect(text.get('fillStyle')).toBe('#666');
    expect(text.get('textAlign')).toBe('left');
    expect(text.get('x')).toBe(66);
    expect(text.get('y')).toBe(0);


    CountBadgeUtils.remove(node, layer);
    expect(node.layer.children.length).toBe(1);
    expect(node.layer.children[0].type).toBe('rect');
  });

  it('init custom right badge should work', () => {
    const layer = CountBadgeUtils.init(node, {
      text: '22',
      position: 'left',
      color: '#666',
      label: {
        fillStyle: '#ccc',
      },
      background: {
        fillStyle: '#e1e4e8',
        strokeStyle: '#000'
      }
    });

    expect(layer.children.length).toBe(3);
    expect(node.layer.children.length).toBe(2);
    expect(node.layer.get('customAppendSize')[1] > 30);
    expect(node.layer.get('appendSize')[1] > 58);

    const path = layer.children[0];
    expect(path.type).toBe('path');
    expect(path.get('path')).toEqual([
      ['M', -50, 0],
      ['L', -58, 0]
    ]);
    expect(path.get('strokeStyle')).toBe('#666');

    const rect = layer.children[1];
    expect(rect.type).toBe('rect');
    expect(rect.get('strokeStyle')).toBe('#000');
    expect(rect.get('fillStyle')).toBe('#e1e4e8');
    expect(rect.get('left') + rect.get('width')).toBe(-58);
    expect(rect.get('top')).toBe(-10);
    expect(rect.get('height')).toBe(20);

    const text = layer.children[2];
    expect(text.get('text')).toBe('22');
    expect(text.get('fillStyle')).toBe('#ccc');
    expect(text.get('textAlign')).toBe('left');
    expectValueBySystem(text.get('x'), -80, -82);
    expect(text.get('y')).toBe(0);

    CountBadgeUtils.remove(node, layer);
    expect(node.layer.children.length).toBe(1);
    expect(node.layer.children[0].type).toBe('rect');
  });
});