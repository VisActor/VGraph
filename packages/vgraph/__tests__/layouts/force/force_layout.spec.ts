import {
  ForceDirectedLayout,
  defaultForces,
  pivotMDSInit,
  randomInit,
  spiralInit,
  syncFDP,
} from "../../../src/layouts/force";

function createData() {
  return {
    nodes: [
      { id: "a", x: "0", y: "0", vx: Number.NaN, vy: Number.NaN, width: 20 },
      { id: "b", x: 80, y: 0, vx: 0, vy: 0, width: 30 },
      {
        id: "c",
        fx: "50",
        fy: "60",
        vx: Number.NaN,
        vy: Number.NaN,
        width: 10,
      },
    ] as any[],
    edges: [
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ] as any[],
  };
}

describe("src/layouts/force/initial_layout.ts", () => {
  it("should initialize missing positions with spiral, random and pivot MDS modes", () => {
    const spiralNodes = [
      { id: "a", vx: Number.NaN, vy: Number.NaN },
      { id: "b", x: 10, y: 20, vx: Number.NaN, vy: Number.NaN },
      { id: "c", fx: 30, fy: 40, vx: Number.NaN, vy: Number.NaN },
    ] as any[];
    const randomNodes = [{ id: "a", vx: Number.NaN, vy: Number.NaN }] as any[];
    const pivotData = {
      nodes: [
        { id: "a", vx: Number.NaN, vy: Number.NaN },
        { id: "b", vx: Number.NaN, vy: Number.NaN },
        { id: "c", fx: 50, fy: 60, vx: Number.NaN, vy: Number.NaN },
      ] as any[],
      edges: [
        { source: "a", target: "b" },
        { source: "b", target: "c" },
      ],
    };

    spiralInit(spiralNodes, { x: 100, y: 100 }, 10);
    randomInit(randomNodes, { x: 10, y: 10 }, 5);
    pivotMDSInit(pivotData.nodes, pivotData.edges, { x: 20, y: 20 }, 10);

    expect(spiralNodes[0].x).toBeGreaterThan(100);
    expect(spiralNodes[1].x).toBe(10);
    expect(spiralNodes[2].x).toBe(30);
    expect(spiralNodes[2].y).toBe(40);
    expect(randomNodes[0].x).toEqual(expect.any(Number));
    expect(randomNodes[0].y).toEqual(expect.any(Number));
    expect(pivotData.nodes[0].x).toEqual(expect.any(Number));
    expect(pivotData.nodes[2].x).toBe(50);
  });
});

describe("src/layouts/force/sync_force.ts", () => {
  it("should run synchronous force layout with configured forces and init modes", () => {
    const data = createData();

    syncFDP(data, {
      forces: {
        x: { x: 100, strength: 0.5, withAlpha: false },
        y: { y: 50, strength: 0.5, withAlpha: false },
      },
      initMode: "spiral",
      graphSize: [200, 100],
      maxIteration: 2,
      tickIterations: 1,
      autoStop: false,
      alpha: 1,
    } as any);

    expect(data.nodes[0].x).toEqual(expect.any(Number));
    expect(data.nodes[0].y).toEqual(expect.any(Number));
    expect(data.nodes[0].vx).toEqual(expect.any(Number));
    expect(data.nodes[2].x).toBe(50);
    expect(data.nodes[2].y).toBe(60);
  });

  it("should support auto forces and random initialization", () => {
    const data = createData();

    syncFDP(data, {
      forces: "auto",
      autoForces: true,
      initMode: "random",
      graphSize: [300, 200],
      maxIteration: 1,
      tickIterations: 1,
      autoStop: true,
      stopDist: 0.000001,
      alpha: 0.5,
      randomSeed: 1,
    } as any);

    data.nodes.forEach((node) => {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    });
  });
});

describe("src/layouts/force/force_directed_layout.ts", () => {
  it("should expose default forces and run a synchronous custom layout", () => {
    const data = createData();
    const onTick = jest.fn();
    const onEnd = jest.fn();
    const customForce = {
      initialize: jest.fn(),
      run: jest.fn(() => {
        data.nodes[0].vx += 2;
        data.nodes[0].vy += 1;
      }),
      configure: jest.fn(),
    };
    const layout = new ForceDirectedLayout({
      async: false,
      run: false,
      maxIteration: 2,
      tickIterations: 1,
      autoStop: false,
      clearOnEndOnFirstCall: true,
      onTick,
      onEnd,
    } as any);

    const forces = defaultForces(data.edges, 100, 100, 20);
    expect([...forces.keys()]).toEqual(["link", "charge", "collide", "center"]);

    layout.updateData(data);
    layout.configForces(new Map([["custom", customForce as any]]));
    layout.layout();

    expect(customForce.initialize).toHaveBeenCalledWith(data.nodes, data.edges);
    expect(customForce.run).toHaveBeenCalledTimes(2);
    expect(onTick).toHaveBeenCalledTimes(2);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect((layout as any).onEnd).toBeUndefined();
    expect(data.nodes[0].x).toBeGreaterThan(0);
  });

  it("should update data, manage custom forces and initialize multiple modes", () => {
    const data = createData();
    const force = {
      initialize: jest.fn(),
      run: jest.fn(),
      configure: jest.fn(),
    };
    const layout = new ForceDirectedLayout({
      async: false,
      run: false,
      forces: { custom: force },
      center: { x: 100, y: 100 },
      nodeSize: 20,
    } as any);

    layout.updateData(data);
    expect(layout.getData().nodes).toBe(data.nodes);

    layout.initializeNodes("spiral");
    expect(data.nodes[0].x).toEqual(expect.any(Number));
    layout.initializeNodes("random");
    layout.initializeNodes("pivotMDS");

    layout.addForce("extra", force as any);
    expect(layout.forces.get("extra")).toBe(force);
    layout.setForce("extra", { options: { strength: 1 } });
    expect(force.configure).toHaveBeenCalledWith({ options: { strength: 1 } });
    layout.removeForce("extra");
    expect(layout.forces.has("extra")).toBe(false);

    layout.destroy();
    expect(layout.nodes).toEqual([]);
    expect(layout.edges).toEqual([]);
  });
});
