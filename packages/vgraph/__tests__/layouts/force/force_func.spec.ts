import {
  ForceLink,
  ForceRadial,
  ForceX,
  ForceY,
  InterClusterForce,
  IntraClusterForce,
} from "../../../src/layouts/force";
import {
  jiggle,
  newMatrix,
  randomSeed,
  setLinksOption,
  setNodesOption,
  shuffle,
} from "../../../src/layouts/force/utils";

function createNodes() {
  return [
    { id: "a", x: 0, y: 0, vx: 0, vy: 0, group: "g1" },
    { id: "b", x: 20, y: 0, vx: 0, vy: 0, group: "g1" },
    { id: "c", x: 100, y: 0, vx: 0, vy: 0, group: "g2" },
    { id: "d", x: 200, y: 0, vx: 0, vy: 0, group: "ignore" },
  ] as any[];
}

describe("src/layouts/force/utils.ts", () => {
  it("should create matrices and deterministic random helpers", () => {
    expect(newMatrix(2, 3)).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(newMatrix(1, 2, 7)).toEqual([[7, 7]]);

    randomSeed(1);
    const firstJiggle = jiggle();
    randomSeed(1);
    expect(jiggle()).toBe(firstJiggle);

    randomSeed(2);
    const shuffled = shuffle(["a", "b", "c"]);
    expect(shuffled).toHaveLength(3);
    expect(shuffled.slice().sort()).toEqual(["a", "b", "c"]);
    expect(shuffle([])).toEqual([]);
  });

  it("should normalize node and link options from constants, arrays and functions", () => {
    const nodes = createNodes();
    const links = [
      { source: nodes[0], target: nodes[1] },
      { source: nodes[1], target: nodes[2] },
    ];

    expect([...setNodesOption(nodes, 2).values()]).toEqual([2, 2, 2, 2]);
    expect([...setNodesOption(nodes, [1, 2, 3, 4]).values()]).toEqual([
      1, 2, 3, 4,
    ]);
    expect([
      ...setNodesOption(
        nodes,
        (node: any, index: number) => index + node.x
      ).values(),
    ]).toEqual([0, 21, 102, 203]);

    expect(setLinksOption(links, 5)).toEqual([5, 5]);
    expect(setLinksOption(links, [3, 4])).toEqual([3, 4]);
    expect(
      setLinksOption(links, (_link: any, index: number) => index + 1)
    ).toEqual([1, 2]);
    expect(setLinksOption(links, undefined as any)).toEqual([1, 1]);
  });
});

describe("src/layouts/force/force_func/force_x.ts and force_y.ts", () => {
  it("should move nodes to fixed axis positions and support alpha-independent strengths", () => {
    const nodes = createNodes();
    const callback = jest.fn();
    const forceX = new ForceX({
      options: { x: [10, 30, 90, 200], strength: 1, withAlpha: false },
      iterationCallback: callback,
    });
    const forceY = new ForceY({
      options: {
        y: (node: any) => (node.id === "a" ? 10 : -10),
        strength: 0.5,
      },
    });

    forceX.initialize(nodes);
    forceY.initialize(nodes);
    forceX.run(0.01);
    forceY.run(0.5);

    expect(nodes[0].vx).toBe(10);
    expect(nodes[1].vx).toBe(10);
    expect(nodes[2].vx).toBe(-10);
    expect(nodes[0].vy).toBe(2.5);
    expect(nodes[1].vy).toBe(-2.5);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should clamp movement with min and max axis ranges", () => {
    const nodes = [
      { id: "left", x: -10, y: -10, vx: 0, vy: 0 },
      { id: "right", x: 20, y: 20, vx: 0, vy: 0 },
    ] as any[];

    const forceX = new ForceX({
      options: { minX: 0, maxX: 10, strength: 1 },
    });
    const forceY = new ForceY({
      options: { minY: 0, maxY: 10, strength: 1 },
    });

    forceX.initialize(nodes);
    forceY.initialize(nodes);
    forceX.run();
    forceY.run();

    expect(nodes[0].vx).toBe(10);
    expect(nodes[0].vy).toBe(10);
    expect(nodes[1].vx).toBe(-10);
    expect(nodes[1].vy).toBe(-10);

    forceX.setPositions((node: any) => (node.id === "left" ? 5 : 15));
    forceY.setPositions([5, 15]);
    forceX.setStrengths([1, 1]);
    forceY.setStrengths(1);
    forceX.run();
    forceY.run();

    expect(nodes[0].vx).toBe(15);
    expect(nodes[1].vy).toBe(-5);
  });
});

describe("src/layouts/force/force_func/force_radial.ts", () => {
  it("should move nodes toward fixed radius or radius ranges", () => {
    const nodes = [
      { id: "near", x: 20, y: 0, vx: 0, vy: 0 },
      { id: "far", x: 30, y: 0, vx: 0, vy: 0 },
    ] as any[];
    const fixed = new ForceRadial({
      options: { r: 10, posX: 0, posY: 0, strength: 1, withAlpha: false },
    });
    const ranged = new ForceRadial({
      options: { minR: 5, maxR: 15, strength: 1 },
    });

    fixed.initialize([nodes[0]]);
    fixed.run(0.01);
    expect(nodes[0].vx).toBeLessThan(0);

    ranged.initialize([nodes[1]]);
    ranged.run();
    expect(nodes[1].vx).toBeLessThan(0);

    const callback = jest.fn();
    ranged.configure({ iterationCallback: callback });
    ranged.setStrengths(0.5);
    ranged.run();
    expect(callback).toHaveBeenCalled();
  });
});

describe("src/layouts/force/force_func/force_clusters.ts", () => {
  it("should attract nodes inside clusters and ignore non-clustered nodes", () => {
    const nodes = createNodes();
    const force = new IntraClusterForce({
      options: { mass: (node: any) => (node.id === "a" ? 2 : 1), strength: 1 },
    });

    force.initialize(nodes);
    force.run(1);

    expect(force.groups).toHaveLength(2);
    expect(force.groups.flat().map((node: any) => node.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(nodes[0].vx).toBeGreaterThan(0);
    expect(nodes[1].vx).toBeLessThan(0);

    force.setMasses(1);
    force.setStrengths([0.5, 0.5, 0.5]);
    expect(force.groups[0]).toHaveLength(2);
  });

  it("should push nodes away from other cluster centers", () => {
    const nodes = createNodes();
    const force = new InterClusterForce({
      options: { mass: 1, strength: -10 },
    });

    force.initialize(nodes);
    force.run(1);

    expect(force.groups).toHaveLength(2);
    expect(force.virtualNodes).toHaveLength(2);
    expect(nodes[2].vx).toBeGreaterThan(0);

    const callback = jest.fn();
    force.configure({
      options: { strength: -5 },
      iterationCallback: callback,
      clusterMapping: (node: any) => node.group,
    });
    expect(force.options.strength).toBe(-5);
  });
});

describe("src/layouts/force/force_func/force_link.ts", () => {
  it("should normalize links, degrees and run d3 force mode", () => {
    const nodes = createNodes();
    const edges = [
      { source: "a", target: "b" },
      { source: nodes[1], target: nodes[2] },
    ] as any[];
    const force = new ForceLink({
      options: { distance: 10, strength: 1, bias: 0.5 },
    });

    force.initialize(nodes, edges);
    force.run(1);

    expect(force.links).toHaveLength(2);
    expect(force.degrees.get("b")).toBe(2);
    expect(nodes[0].vx).toBeGreaterThan(0);
    expect(nodes[1].vx).not.toBe(0);

    force.setStrength("default");
    force.configure({ options: { mode: "linlog" } });
    force.run(0.5);
    expect(nodes[0].vx).not.toBe(0);
  });

  it("should support customized edges, id maps and FR mode", () => {
    const nodes = [
      { key: "a", id: "a", x: 0, y: 0, vx: 0, vy: 0 },
      { key: "b", id: "b", x: 50, y: 0, vx: 0, vy: 0 },
    ] as any[];
    const force = new ForceLink({
      idMap: (node: any) => node.key,
      edges: [{ source: "a", target: "b" }],
      options: {
        isCustomizedEdges: true,
        mode: "FR",
        distance: [10],
        strength: [1],
        bias: [0.25],
      },
    });

    force.initialize(nodes, []);
    force.run(1);

    expect(force.links[0].source).toBe(nodes[0]);
    expect(force.links[0].target).toBe(nodes[1]);
    expect(nodes[0].vx).toBeGreaterThan(0);
    expect(nodes[1].vx).toBeLessThan(0);
  });
});
