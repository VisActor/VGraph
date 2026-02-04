import { Graph } from '../../src/graph';
import { Background } from '../../src/components';

describe('src/background', () => {
  const graphDiv = document.createElement('div');
  document.body.append(graphDiv);

  const graph = new Graph({
    container: graphDiv,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        width: 140,
        height: 40,
      };
    },
  });

  it('background should work with default options', async () => {
    const bkg = new Background(graph);
    const container = bkg.container;
    expect(container).not.toBe(undefined);
    expect(container.style.width).toBe('800px');
    expect(container.style.height).toBe('600px');
    expect(container.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(container.style.backgroundPosition).toBe('-1px -1px');

    graph.translate(100, 100);
    expect(container.style.backgroundPosition).toBe('99px 99px');

    const img = container.style.backgroundImage;
    expect(img).not.toBe(undefined);
    graph.scale(2);
    await sleep(100);
    expect(container.style.backgroundImage).not.toBe(img);
    expect(container.style.backgroundPosition).toBe('199px 199px');

    bkg.disable();
    expect(container.style.display).toBe('none');
    graph.translate(100, 100);
    expect(container.style.backgroundPosition).toBe('199px 199px');

    bkg.enable();
    graph.translate(100, 100);
    expect(container.style.backgroundPosition).toBe('399px 399px');

    bkg.destroy();
  });

  it('background should work with custom options', async () => {
    const bkg = new Background(graph, {
      backgroundColor: 'red',
      type: 'dot',
    });
    const container = bkg.container;
    expect(container).not.toBe(undefined);
    expect(container.style.width).toBe('800px');
    expect(container.style.height).toBe('600px');
    expect(container.style.backgroundColor).toBe('red');
    expect(container.style.backgroundPosition).toBe('399px 399px');

    graph.translate(-100, -100);
    expect(container.style.backgroundPosition).toBe('299px 299px')
  });
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}