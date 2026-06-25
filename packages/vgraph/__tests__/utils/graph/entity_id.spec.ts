import { Graph } from "../../../src";
import {
  isRepeatedId,
  getNonRepetitiveId,
} from "../../../src/utils/graph/entity_id";

describe("getEntityId should work", () => {
  const div = document.createElement("div");
  const graph = new Graph({
    width: 1000,
    height: 400,
    container: div,
    setDefaultNode(nodeData: any) {
      return {
        width: 100,
        height: 20,
      };
    },
  });

  it("isRepeatedId id should work.", () => {
    const repeated = isRepeatedId(1, "node", graph.entityMap);
    expect(repeated).toBe(false);
  });

  it("isRepeatedId with repeat id should return true", () => {
    graph.add("node", { id: 1 });
    const repeated = isRepeatedId(1, "node", graph.entityMap);
    expect(repeated).toBe(true);
  });

  it("1000w nodes and group should not have same id", () => {
    const ids = new Set();
    for (let i = 0; i < 1000000; i++) {
      const idNode = getNonRepetitiveId("node", graph.entityMap);
      graph.entityMap.node[idNode] = idNode;
      const idGroup = getNonRepetitiveId("group", graph.entityMap);
      graph.entityMap.group[idGroup] = idGroup;
      ids.add(idNode);
      ids.add(idGroup);
    }
    expect(ids.size).toBe(2000000);
  });
});
