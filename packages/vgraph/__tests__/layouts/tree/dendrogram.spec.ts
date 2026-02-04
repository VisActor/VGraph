import { Dendrogram } from "../../../src";
import jsonData from "../../../examples/static/tree_data.json";

describe("src/dendrogram.ts", () => {
  const data: any = JSON.parse(JSON.stringify(jsonData));

  it("TB should work", () => {
    const layoutMethod = new Dendrogram({
      direction: "TB",
      nodeSize: () => [20, 10],
      nodeSep: () => 10,
    });
    layoutMethod.layout(data);
    expect(data.x).toBe(385);
    expect(data.y).toBe(25);
    expect(data.children[0].x).toBe(105);
    expect(data.children[0].y).toBe(85);
    expect(data.children[1].x).toBe(420);
    expect(data.children[1].y).toBe(55);
    expect(data.children[2].x).toBe(630);
    expect(data.children[2].y).toBe(85);
  });

  it("collapsed should work", () => {
    const collapsedData = JSON.parse(JSON.stringify(jsonData));
    const layoutMethod = new Dendrogram({
      direction: "TB",
      nodeSize: () => [20, 10],
      nodeSep: () => 10,
    });
    collapsedData.children[0].collapsed = true;
    layoutMethod.layout(collapsedData);

    expect(collapsedData.x).toBe(210);
    expect(collapsedData.y).toBe(25);
    expect(collapsedData.children[0].x).toBe(0);
    expect(collapsedData.children[0].y).toBe(115);
    expect(collapsedData.children[1].x).toBe(210);
    expect(collapsedData.children[1].y).toBe(55);
    expect(collapsedData.children[2].x).toBe(420);
    expect(collapsedData.children[2].y).toBe(85);

    expect(collapsedData.children[0].children[0].x).toBe(undefined);
    expect(collapsedData.children[0].children[0].y).toBe(undefined);
  });
});
