import { CompactBox, Indented, MindMap } from "../../../src";

function createTree() {
  return {
    id: "root",
    children: [
      {
        id: "a",
        children: [{ id: "a1" }, { id: "a2" }],
      },
      { id: "b" },
      {
        id: "c",
        children: [{ id: "c1" }],
      },
    ],
  } as any;
}

function cloneTree() {
  return JSON.parse(JSON.stringify(createTree()));
}

function createLayoutOptions(overrides: Record<string, any> = {}) {
  return {
    nodeSize: () => [20, 10],
    nodeSep: () => 10,
    rankSep: () => 30,
    ...overrides,
  };
}

describe("src/layouts/tree/flex_compact_box.ts", () => {
  it("should place a compact tree and skip collapsed descendants", () => {
    const data = cloneTree();
    data.children[0].collapsed = true;
    const layout = new CompactBox(createLayoutOptions({ direction: "TB" }));

    const result = layout.layout(data)!;

    expect(result).toBe(data);
    expect(data.x).toBeGreaterThan(data.children[0].x);
    expect(data.children[0].y).toBeGreaterThan(data.y);
    expect(data.children[1].y).toBe(data.children[0].y);
    expect(data.children[0].children[0].x).toBeUndefined();
    expect(data.children[0].children[0].y).toBeUndefined();
  });

  it("should support different directions and parent alignment modes", () => {
    const front = cloneTree();
    const back = cloneTree();
    const lr = cloneTree();

    new CompactBox(
      createLayoutOptions({ direction: "TB", alignParent: "front" })
    ).layout(front);
    new CompactBox(
      createLayoutOptions({ direction: "TB", alignParent: "back" })
    ).layout(back);
    new CompactBox(
      createLayoutOptions({ direction: "LR", alignPeerNodes: true })
    ).layout(lr);

    expect(front.x).toBe(front.children[0].x);
    expect(back.x).toBe(back.children[2].x);
    expect(lr.children[0].x).toBeGreaterThan(lr.x);
    expect(lr.children[0].y).toBeLessThan(lr.children[2].y);
  });
});

describe("src/layouts/tree/mind_map.ts", () => {
  it("should return leaf data and split children into left and right trees", () => {
    const leaf = { id: "leaf" } as any;
    const data = cloneTree();
    const layout = new MindMap(
      createLayoutOptions({ direction: "LR", tab: 40 })
    );

    expect(layout.layout(leaf)).toBe(leaf);
    layout.layout(data);

    expect(data.position).toBe("root");
    expect(data.children[0].position).toBe("right");
    expect(data.children[1].position).toBe("right");
    expect(data.children[2].position).toBe("left");
    expect(data.children[0].x).toBeGreaterThan(data.x);
    expect(data.children[2].x).toBeLessThan(data.x);
  });

  it("should support custom tree placement, compact mode and collapsed coords", () => {
    const custom = cloneTree();
    const compact = cloneTree();
    custom.children[2].collapsed = true;

    new MindMap(
      createLayoutOptions({
        direction: "LR",
        setTreePosition(data: any) {
          return {
            leftTree: {
              id: data.id,
              width: data.width,
              height: data.height,
              children: [data.children[0]],
            },
            rightTree: {
              id: data.id,
              width: data.width,
              height: data.height,
              children: [data.children[1], data.children[2]],
            },
          };
        },
      })
    ).layout(custom);
    new MindMap(createLayoutOptions({ direction: "LR", compact: true })).layout(
      compact
    );

    expect(custom.children[0].position).toBe("left");
    expect(custom.children[1].position).toBe("right");
    expect(custom.children[2].children[0].x).toBe(custom.children[2].x);
    expect(custom.children[2].children[0].y).toBe(custom.children[2].y);
    expect(compact.x).toBeDefined();
    expect(compact.y).toBeDefined();
    expect(compact.children[0].position).toBe("right");
    expect(compact.children[2].position).toBe("left");
  });
});

describe("src/layouts/tree/indented.ts", () => {
  it("should layout indented trees from left to right", () => {
    const data = cloneTree();
    const layout = new Indented(
      createLayoutOptions({ direction: "LR", indent: 25 })
    );

    layout.layout(data);

    expect(data.x).toBe(10);
    expect(data.children[0].x).toBeGreaterThan(data.x);
    expect(data.children[0].children[0].x).toBeGreaterThan(data.children[0].x);
    expect(data.children[1].y).toBeGreaterThan(data.children[0].y);
  });

  it("should assign rank widths and support top aligned layout", () => {
    const assigned = cloneTree();
    const topAligned = cloneTree();

    new Indented(createLayoutOptions({ direction: "LR", indent: 0 })).layout(
      assigned
    );
    new Indented(
      createLayoutOptions({ direction: "LR", alignTop: true, indent: 0 })
    ).layout(topAligned);

    expect(assigned.children[0].x).toBeGreaterThan(assigned.x);
    expect(assigned.children[0].children[0].x).toBeGreaterThan(
      assigned.children[0].x
    );
    expect(topAligned.y).toBe(topAligned.children[0].y);
    expect(topAligned.children[0].children[0].y).toBeGreaterThanOrEqual(
      topAligned.children[0].y
    );
  });
});
