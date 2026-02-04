import { Graph, Trigger, GraphEvent } from '../../../src';

describe('Trigger util should work', () => {
  const div = document.createElement('div');
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 20,
        fillStyle: '#666',
        label: {
          text: nodeData.id,
          triggerId: 'triggerLabel',
        }
      };
    }
  });

  graph.data({
    nodes: [{
      id: '1',
      x: 100,
      y: 100,
    }, {
      id: '2',
      fillStyle: '#ccc',
      x: 200,
      y: 200,
    }],
    edges: [{
      source: '1',
      target: '2'
    }],
  });

  const node1 = graph.getNodeById('1');

  it('hover should work', () => {
    let visible = false;
    let target = null;
    let shape = null;
    let style = null;
    const trigger = new Trigger(graph, {
      target: 'node',
      onVisibleChange(show: boolean, e?: GraphEvent, entityBox?: any) {
        visible = show;
        target = e?.target;
        shape = e?.relatedTarget;
        style = entityBox;
      }
    });
    graph.emit('node:mouseenter', {
      nativeEvent: { clientX: 100, clientY: 100 },
      target: node1,
      relatedTarget: node1.get('keyShape')
    });

    expect(visible);
    expect(target).toBe(node1);
    expect(shape).toBe(null);
    expect(style).toEqual({
      left: 50,
      top: 90,
      width: 100,
      height: 20,
    });

    graph.emit('transformed');
    expect(visible).toBe(false);

    trigger.destroy();
    graph.emit('node:mouseenter', {
      nativeEvent: { clientX: 100, clientY: 100 },
      target: node1,
      relatedTarget: node1.get('keyShape')
    });
    expect(visible).toBe(false);
  });

  it('click should work', () => {
    let visible = false;
    let target = null;
    let shape = null;
    let style: any = null;
    const trigger = new Trigger(graph, {
      target: 'node',
      trigger: 'click',
      triggerId: 'triggerLabel',
      onVisibleChange(show: boolean, e?: GraphEvent, entityBox?: any) {
        visible = show;
        target = e?.target;
        shape = e?.relatedTarget;
        style = entityBox;
      }
    });

    graph.emit('node:mouseenter', {
      nativeEvent: { clientX: 100, clientY: 100 },
      target: node1,
      relatedTarget: node1.get('keyShape')
    });

    expect(visible).toBe(false);

    graph.emit('node:click', {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.get('keyShape')
    });
    expect(visible).toBe(false);
    
    graph.emit('node:click', {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.getLabel()
    });
    expect(target).toBe(node1);
    expect(shape).toBe(node1.getLabel());
    expect(style?.left).toBe(62);
    expect(style?.top).toBe(91);
    expect(style?.height).toBe(18);

    graph.emit('contextmenu');
    expect(visible).toBe(false);

    trigger.destroy();
    graph.emit('node:click', {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.get('keyShape')
    });

    expect(visible).toBe(false);
  });

  it('contextmenu should work', () => {
    let visible = false;
    let target = null;
    let shape = null;
    let style = null;
    const trigger = new Trigger(graph, {
      target: 'node',
      trigger: 'contextMenu',
      onVisibleChange(show: boolean, e?: GraphEvent, entityBox?: any) {
        visible = show;
        target = e?.target;
        shape = e?.relatedTarget;
        style = entityBox;
      }
    });

    graph.emit('node:contextmenu', {
      nativeEvent: { clientX: 100, clientY: 100, button: 1 },
      target: node1,
      relatedTarget: node1.get('keyShape')
    });

    expect(visible).toBe(false);

    graph.emit('node:contextmenu', {
      nativeEvent: { clientX: 100, clientY: 100, button: 2 },
      target: node1,
      relatedTarget: node1.get('keyShape')
    });
    expect(visible).toBe(true);
    expect(target).toBe(node1);
    expect(shape).toBe(null);
    expect(style).toEqual({
      left: 50,
      top: 90,
      width: 100,
      height: 20,
    });

    trigger.destroy();
  });
});