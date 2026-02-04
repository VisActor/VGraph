import { Graph } from "../../src/graph";
import { Scroller } from "../../src/components";

describe("src/scroller", () => {
  const graphDiv = document.createElement("div");
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
        width: 100,
        height: 40,
      };
    },
  });

  graph.add("node", {
    x: 100,
    y: 100,
  });

  const node2 = graph.add("node", {
    x: 200,
    y: 200,
  });

  it("default options should work", async () => {
    const scroller = new Scroller(graph, {
      // padding: 20
    });
    expect(scroller._bbox).toEqual({
      left: 0,
      top: 30,
      width: 300,
      height: 240,
    });
    expect(scroller.xScroller.style.display).toBe("none");
    expect(scroller.yScroller.style.display).toBe("none");

    graph.scale(2, [0, 0]);
    expect(scroller._bbox).toEqual({
      left: 0,
      top: 30,
      width: 300,
      height: 240,
    });
    expect(scroller.xScroller.style.display).toBe("none");
    expect(scroller.yScroller.style.display).toBe("none");

    node2.translate(500, 500);
    graph.emit("change");
    expect(scroller._bbox).toEqual({
      left: 0,
      top: 30,
      width: 800,
      height: 740,
    });
    expect(scroller.xScroller.style.display).toBe("block");
    expect(scroller.yScroller.style.display).toBe("block");
    expect(scroller.xSlider.style.left).toBe("0px");
    expect(scroller.xSlider.style.height).toBe("10px");
    expect(scroller.xSlider.style.width).toBe("400px");
    expect(scroller.ySlider.style.top).toBe(`${(-45 / 740) * 400}px`);
    expect(scroller.ySlider.style.width).toBe("10px");
    expect(scroller.ySlider.style.height).toBe("243.24324324324326px");

    graph.translate(-100, -200);
    expect(scroller.xScroller.style.display).toBe("block");
    expect(scroller.yScroller.style.display).toBe("block");
    expect(scroller.xSlider.style.left).toBe("50px");
    expect(scroller.ySlider.style.top).toBe("56.75675675675676px");
    expect(scroller.xSlider.style.width).toBe("400px");
    expect(scroller.ySlider.style.height).toBe("243.24324324324326px");

    graph.scale(0.5);
    expect(scroller.xScroller.style.opacity).toBe("1");
    expect(scroller.yScroller.style.opacity).toBe("1");
    expect(scroller.xScroller.style.display).toBe("none");
    expect(scroller.yScroller.style.display).toBe("block");
    expect(scroller.ySlider.style.top).toBe("56.75675675675676px");
    expect(scroller.ySlider.style.height).toBe("486.4864864864865px");

    await sleep(2000);
    expect(scroller.xScroller.style.opacity).toBe("0");
    expect(scroller.yScroller.style.opacity).toBe("0");

    scroller.showScroller();
    expect(scroller.xScroller.style.opacity).toBe("1");
    expect(scroller.yScroller.style.opacity).toBe("1");

    scroller.onMouseDown(
      {
        clientX: 100,
        clientY: 100,
      } as any,
      "y"
    );

    scroller.onMouseMove({
      clientX: 200,
      clientY: 200,
    } as any);
    expect(scroller.ySlider.style.top).toBe("113.51351351351353px");
    expect(scroller.ySlider.style.height).toBe("486.4864864864865px");

    scroller.onMouseMove({
      clientX: 100,
      clientY: 100,
    } as any);
    expect(scroller.ySlider.style.top).toBe("56.75675675675676px");
    expect(scroller.ySlider.style.height).toBe("486.4864864864865px");

    scroller.onMouseUp({
      clientX: 100,
      clientY: 200,
      target: graphDiv,
    } as any);

    await sleep(2000);
    expect(scroller.xScroller.style.opacity).toBe("0");
    expect(scroller.yScroller.style.opacity).toBe("0");
  });
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
