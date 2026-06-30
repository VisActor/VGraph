import { GraphStructure } from "../../../src/graph_structure";
import {
  alignCoords,
  balance,
  findSmallestWidthAlignment,
  findType1Conflicts,
  findType2Conflicts,
  horizontalCompaction,
  verticalAlign,
} from "../../../src/layouts/dag/position/horizontal_coord_assignment";

describe("src/algorithms/horizontal_coord_assignment.ts", () => {
  //  a   b
  //    x
  //  c   d
  const data = new GraphStructure({
    nodes: [
      { id: "a", rank: 0 },
      { id: "b", rank: 0 },
      { id: "c", rank: 1 },
      { id: "d", rank: 1 },
    ],
    edges: [
      { source: "a", target: "d" },
      { source: "b", target: "c" },
    ],
  });
  const nodeMap = data.getNodeMap();
  const a = nodeMap.a;
  const b = nodeMap.b;
  const c = nodeMap.c;
  const d = nodeMap.d;
  const layers = [
    [a, b],
    [c, d],
  ];
  describe("mark type 1 conflicts should work", () => {
    it("should not mark edges that have no conflict", () => {
      const conflicts = {};
      findType1Conflicts(
        data,
        [
          [a, b],
          [d, c],
        ],
        conflicts
      );
      expect(conflicts).toEqual({});
    });

    it("should not mark type0 conflicts", () => {
      const conflicts = {};
      findType1Conflicts(data, layers, conflicts);
      expect(conflicts).toEqual({});
    });

    it("should not mark type0 conflicts when one down node is dummy", () => {
      [a, b, c, d].forEach((v) => {
        v.set("dummy", true);
        const conflicts = {};
        findType1Conflicts(data, layers, conflicts);
        expect(conflicts).toEqual({});
        v.set("dummy", false);
      });
    });

    it("should mark type 1 conflicts", () => {
      [a, b, c, d].forEach((v) => {
        [a, b, c, d].forEach((w) => {
          if (v !== w) {
            w.set("dummy", true);
          }
        });

        const conflicts = {};
        findType1Conflicts(data, layers, conflicts);
        if (v.get("id") === "a" || v.get("id") === "d") {
          expect(conflicts).toEqual({ a: ["d"] });
        } else {
          expect(conflicts).toEqual({ b: ["c"] });
        }
        [a, b, c, d].forEach((w) => {
          w.set("dummy", false);
        });
      });
    });

    //  a - b
    //  |   |
    //  d   c
    it("should mark type1 conflicts when a edge links to nodes in the same rank", () => {
      data.add("edge", {
        source: "a",
        target: "b",
      });
      const conflicts = {};
      findType1Conflicts(
        data,
        [
          [a, b],
          [d, c],
        ],
        conflicts
      );
      expect(conflicts).toEqual({
        a: ["b"],
      });
    });
  });

  describe("findType2Conflicts should work", () => {
    it("should not mark for non-inner segments", () => {
      const conflicts = {};
      findType2Conflicts(data, layers, conflicts);
      expect(conflicts).toEqual({});
    });

    it("should mark for inner segments", () => {
      [a, b, c, d].forEach((v) => {
        v.set("dummy", true);
      });
      const conflicts = {};
      findType2Conflicts(data, layers, conflicts);
      expect(conflicts).toEqual({ a: ["d"] });
    });
  });

  describe("verticalAlign should work", () => {
    const data = new GraphStructure({
      nodes: [
        {
          id: "a",
        },
        {
          id: "b",
        },
        {
          id: "c",
        },
        {
          id: "d",
        },
      ],
      edges: [],
    });
    const nodeMap = data.getNodeMap();
    const a = nodeMap.a;
    const b = nodeMap.b;
    const c = nodeMap.c;
    const d = nodeMap.d;
    it("should work for seperate roots", () => {
      const { root, align } = verticalAlign([[a], [b]], {}, "sources");

      expect(root).toEqual({ a: "a", b: "b" });
      expect(align).toEqual({ a: "a", b: "b" });
    });

    it("should work with single edge", () => {
      data.add("edge", { source: "a", target: "b" });
      const { root, align } = verticalAlign([[a], [b]], {}, "sources");

      expect(root).toEqual({ a: "a", b: "a" });
      expect(align).toEqual({ a: "b", b: "a" });
    });

    it("should align leftmost fashion", () => {
      // a   b
      // c
      data.remove(data.getEdges()[0]);
      data.add("edge", { source: "a", target: "c" });
      data.add("edge", { source: "b", target: "c" });
      const { root, align } = verticalAlign([[a, b], [c]], {}, "sources");
      expect(root).toEqual({ a: "a", b: "b", c: "a" });
      expect(align).toEqual({ a: "c", b: "b", c: "a" });
    });

    it("should align median right when left is conflict", () => {
      const { root, align } = verticalAlign(
        [[a, b], [c]],
        { a: ["c"] },
        "sources"
      );
      expect(root).toEqual({ a: "a", b: "b", c: "b" });
      expect(align).toEqual({ a: "a", b: "c", c: "b" });
    });

    it("align median conflicts should work", () => {
      data.getEdges().forEach((edge: any) => {
        data.remove(edge);
      });
      // a  b
      //  x |
      // c  d
      data.add("edge", { source: "a", target: "d" });
      data.add("edge", { source: "b", target: "c" });
      data.add("edge", { source: "b", target: "d" });
      const { root, align } = verticalAlign(
        [
          [a, b],
          [c, d],
        ],
        {},
        "sources"
      );
      expect(root).toEqual({ a: "a", b: "b", c: "b", d: "d" });
      expect(align).toEqual({ a: "a", b: "c", c: "b", d: "d" });
    });

    it("align with center should work", () => {
      const edges = data.getEdges();
      for (let i = edges.length - 1; i >= 0; i--) {
        data.remove(edges[i]);
      }
      // a b c
      //   d
      data.add("edge", { source: "a", target: "d" });
      data.add("edge", { source: "b", target: "d" });
      data.add("edge", { source: "c", target: "d" });
      const { root, align } = verticalAlign([[a, b, c], [d]], {}, "sources");
      expect(root).toEqual({ a: "a", b: "b", c: "c", d: "b" });
      expect(align).toEqual({ a: "a", b: "d", c: "c", d: "b" });
    });

    it("multiple layers should work", () => {
      // a
      // b  c
      // d
      const edges = data.getEdges();
      for (let i = edges.length - 1; i >= 0; i--) {
        data.remove(edges[i]);
      }
      data.add("edge", { source: "a", target: "b" });
      data.add("edge", { source: "a", target: "c" });
      data.add("edge", { source: "b", target: "d" });
      data.add("edge", { source: "c", target: "d" });
      const { root, align } = verticalAlign([[a], [b, c], [d]], {}, "sources");
      expect(root).toEqual({ a: "a", b: "a", c: "c", d: "a" });
      expect(align).toEqual({ a: "b", b: "d", c: "c", d: "a" });
    });
  });

  describe("horizontal compaction should work", () => {
    const data = new GraphStructure({
      nodes: [
        {
          id: "a",
        },
        {
          id: "b",
        },
        {
          id: "c",
        },
        {
          id: "d",
        },
      ],
      edges: [],
    });
    const nodeMap = data.getNodeMap();
    const a = nodeMap.a;
    const b = nodeMap.b;
    const c = nodeMap.c;
    const d = nodeMap.d;

    const options = {
      nodeSep: 100,
      edgeSep: 20,
      rankSep: 50,
    };

    it("should work with single node", () => {
      const xMap = horizontalCompaction(
        data,
        [[a]],
        {
          root: { a: "a" },
          align: { a: "a" },
        },
        false,
        options
      );
      expect(xMap.a).toBe(0);
    });

    it("should work with related nodes", () => {
      a.set("width", 100);
      b.set("width", 200);
      const xMap = horizontalCompaction(
        data,
        [[a, b]],
        {
          root: { a: "a", b: "b" },
          align: { a: "a", b: "b" },
          isRightBorder: {},
        },
        false,
        options
      );
      expect(xMap.a).toBe(0);
      expect(xMap.b).toBe(100 / 2 + 100 + 200 / 2);
    });

    it("should work with related dummy nodes", () => {
      a.set("dummy", true);
      b.set("dummy", true);
      const xMap = horizontalCompaction(
        data,
        [[a, b]],
        {
          root: { a: "a", b: "b" },
          align: { a: "a", b: "b" },
          isRightBorder: {},
        },
        false,
        options
      );
      expect(xMap.a).toBe(0);
      expect(xMap.b).toBe(100 / 2 + 20 + 200 / 2);
    });

    it("should align nodes in a block", () => {
      a.set("dummy", false);
      b.set("dummy", false);
      const xMap = horizontalCompaction(
        data,
        [[a], [b]],
        {
          root: { a: "a", b: "a" },
          align: { a: "b", b: "a" },
          isRightBorder: {},
        },
        false,
        options
      );
      expect(xMap.a).toBe(0);
      expect(xMap.b).toBe(0);
    });

    it("should seperate blocks", () => {
      a.set("width", 100);
      b.set("width", 200);
      c.set("width", 50);
      options.nodeSep = 75;
      const xMap = horizontalCompaction(
        data,
        [[a], [c, b]],
        {
          root: { a: "a", b: "a", c: "c" },
          align: { a: "b", b: "a", c: "c" },
          isRightBorder: {},
        },
        false,
        options
      );
      expect(xMap.c).toBe(0);
      expect(xMap.a).toBe(50 / 2 + 75 + 200 / 2);
      expect(xMap.b).toBe(50 / 2 + 75 + 200 / 2);
    });

    it("should seperate classes", () => {
      a.set("width", 100);
      b.set("width", 200);
      c.set("width", 50);
      d.set("width", 80);
      options.nodeSep = 75;
      const xMap = horizontalCompaction(
        data,
        [
          [a, b],
          [c, d],
        ],
        {
          root: { a: "a", b: "b", c: "c", d: "b" },
          align: { a: "b", b: "d", c: "c", d: "b" },
          isRightBorder: {},
        },
        false,
        options
      );

      expect(xMap.a).toBe(0);
      expect(xMap.b).toBe(100 / 2 + 75 + 200 / 2);
      expect(xMap.c).toBe(100 / 2 + 75 + 200 / 2 - 80 / 2 - 75 - 50 / 2);
      expect(xMap.d).toBe(100 / 2 + 75 + 200 / 2);
    });

    it("should shift class", () => {
      a.set("width", 50);
      b.set("width", 150);
      c.set("width", 60);
      d.set("width", 70);
      const xMap = horizontalCompaction(
        data,
        [
          [a, b],
          [c, d],
        ],
        {
          root: { a: "a", b: "b", c: "a", d: "b" },
          align: { a: "c", b: "d", c: "a", d: "b" },
          isRightBorder: {},
        },
        false,
        options
      );
      expect(xMap.a).toBe(0);
      expect(xMap.b).toBe(50 / 2 + 75 + 150 / 2);
      expect(xMap.c).toBe(0);
      expect(xMap.d).toBe(50 / 2 + 75 + 150 / 2);
    });

    it("should shift rightBorder", () => {
      //
      const data = new GraphStructure({
        nodes: [
          { id: "1", width: 100, height: 40, rank: 0 },
          { id: "2", width: 100, height: 40, rank: 0 },
          { id: "3", width: 100, height: 40, rank: 0 },
          { id: "4", width: 100, height: 40, rank: 0 },
          { id: "5", width: 100, height: 40, rank: 0 },
          { id: "6", width: 100, height: 40, rank: 0 },
          { id: "7", width: 100, height: 40, rank: 0 },
          { id: "8", width: 100, height: 40, rank: 0 },
          { id: "9", width: 100, height: 40, rank: 0 },
          { id: "10", width: 100, height: 40, rank: 0 },
          { id: "11", width: 100, height: 40, rank: 1 },
          { id: "12", width: 100, height: 40, rank: 1 },
          { id: "13", width: 100, height: 40, rank: 1 },
          { id: "14", width: 100, height: 40, rank: 1 },
        ],
        edges: [
          { source: "1", target: "11" },
          { source: "2", target: "12" },
          { source: "2", target: "13" },
          { source: "10", target: "14" },
        ],
      });
      const nodeMap = data.getNodeMap();
      const n1 = nodeMap["1"];
      const n2 = nodeMap["2"];
      const n3 = nodeMap["3"];
      const n4 = nodeMap["4"];
      const n5 = nodeMap["5"];
      const n6 = nodeMap["6"];
      const n7 = nodeMap["7"];
      const n8 = nodeMap["8"];
      const n9 = nodeMap["9"];
      const n10 = nodeMap["10"];
      const n11 = nodeMap["11"];
      const n12 = nodeMap["12"];
      const n13 = nodeMap["13"];
      const n14 = nodeMap["14"];
      const aligns = {
        root: {
          "1": "11",
          "2": "12",
          "3": "3",
          "4": "4",
          "5": "5",
          "6": "6",
          "7": "7",
          "8": "8",
          "9": "9",
          "10": "14",
          "11": "11",
          "12": "12",
          "13": "13",
          "14": "14",
        },
        align: {
          "1": "11",
          "2": "12",
          "3": "3",
          "4": "4",
          "5": "5",
          "6": "6",
          "7": "7",
          "8": "8",
          "9": "9",
          "10": "14",
          "11": "1",
          "12": "2",
          "13": "13",
          "14": "10",
        },
        isRightBorder: {
          "11": true,
          "13": true,
          "14": true,
        },
      };
      const xMap = horizontalCompaction(
        data,
        [
          [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10],
          [n11, n12, n13, n14],
        ],
        aligns,
        false,
        options
      );
      expect(xMap["13"] - xMap["12"]).toBe(175);
    });

    it("should shift neighbour class", () => {
      a.set("width", 50);
      b.set("width", 70);
      c.set("width", 60);
      d.set("width", 150);
      const xMap = horizontalCompaction(
        data,
        [
          [a, b],
          [c, d],
        ],
        {
          root: { a: "a", b: "b", c: "a", d: "b" },
          align: { a: "c", b: "d", c: "a", d: "b" },
          isRightBorder: {},
        },
        false,
        options
      );
      expect(xMap.a).toBe(0);
      expect(xMap.b).toBe(60 / 2 + 75 + 150 / 2);
      expect(xMap.c).toBe(0);
      expect(xMap.d).toBe(60 / 2 + 75 + 150 / 2);
    });
  });

  describe("findSmallestWidthAlignment shoould work", () => {
    const graph = new GraphStructure({
      nodes: [
        {
          id: "a",
        },
        {
          id: "b",
        },
        {
          id: "c",
        },
      ],
      edges: [],
    });
    const nodeMap = graph.getNodeMap();
    const a = nodeMap.a;
    const b = nodeMap.b;
    const c = nodeMap.c;

    it("finds the alignment with the smallest width", () => {
      a.set("width", 50);
      b.set("width", 50);
      const xMaps = {
        UL: { a: 0, b: 1000 },
        UR: { a: -5, b: 1000 },
        DL: { a: 5, b: 2000 },
        DR: { a: 0, b: 200 },
      };
      expect(findSmallestWidthAlignment(graph, xMaps)).toBe("DR");
    });

    it("takes node width into account", () => {
      c.set("width", 200);
      const xMaps = {
        UL: { a: 0, b: 100, c: 75 },
        UR: { a: 0, b: 100, c: 80 },
        DL: { a: 0, b: 100, c: 85 },
        DR: { a: 0, b: 100, c: 90 },
      };
      expect(findSmallestWidthAlignment(graph, xMaps)).toBe("UL");
    });
  });

  describe("alignCoords should work", () => {
    it("align one node", () => {
      const xMaps = {
        UL: { a: 50 },
        UR: { a: 100 },
        DL: { a: 50 },
        DR: { a: 100 },
      };
      alignCoords(xMaps, "UL");
      expect(xMaps).toEqual({
        UL: { a: 50 },
        UR: { a: 50 },
        DL: { a: 50 },
        DR: { a: 50 },
      });
    });

    it("aligns multiple nodes", () => {
      const xMaps = {
        UL: { a: 50, b: 1000 },
        UR: { a: 100, b: 900 },
        DL: { a: 150, b: 800 },
        DR: { a: 200, b: 700 },
      };

      alignCoords(xMaps, "UL");
      expect(xMaps).toEqual({
        UL: { a: 50, b: 1000 },
        UR: { a: 200, b: 1000 },
        DL: { a: 50, b: 700 },
        DR: { a: 500, b: 1000 },
      });
    });
  });

  describe("balance should work", () => {
    const graph = new GraphStructure({
      nodes: [
        {
          id: "a",
        },
        {
          id: "b",
        },
      ],
      edges: [],
    });
    const options = {
      nodeSep: 100,
      edgeSep: 20,
      rankSep: 50,
    };
    const nodeMap = graph.getNodeMap();
    const a = nodeMap.a;
    const b = nodeMap.b;
    it("aligns a single node to the shared median value", () => {
      const xMaps = {
        UL: { a: 0 },
        UR: { a: 100 },
        DL: { a: 100 },
        DR: { a: 200 },
      };
      const errorSpy = jest.spyOn(console, "error").mockImplementation();
      try {
        balance(graph, xMaps, options);
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining("node b coord assignment failed")
        );
        expect(a.get("x")).toBe(100);
      } finally {
        errorSpy.mockRestore();
      }
    });

    it("aligns a single node to the average of different median values", () => {
      const xMaps = {
        UL: { a: 0 },
        UR: { a: 75 },
        DL: { a: 125 },
        DR: { a: 200 },
      };
      const errorSpy = jest.spyOn(console, "error").mockImplementation();
      try {
        balance(graph, xMaps, options);
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining("node b coord assignment failed")
        );
        expect(a.get("x")).toBe(100);
      } finally {
        errorSpy.mockRestore();
      }
    });

    it("balance multiple nodes", () => {
      const xMaps = {
        UL: { a: 0, b: 50 },
        UR: { a: 75, b: 0 },
        DL: { a: 125, b: 60 },
        DR: { a: 200, b: 75 },
      };
      balance(graph, xMaps, options);
      expect(a.get("x")).toBe(100);
      expect(b.get("x")).toBe(55);
    });
  });
});
