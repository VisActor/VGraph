import { GRAPH_EVENTS } from "../../consts/meta_events";
import { LayoutBase } from "../base";
import { Graph } from "../../graph";
import { Node, Edge } from "../../models/entities";
import {
  EdgeStructure,
  GraphStructure,
  NodeStructure,
} from "../../graph_structure";
import { coordSystem } from "../dag/position/coord_system";
import { horizontalCoordAssignment } from "../dag/position/horizontal_coord_assignment";
import { insertDummyNodes, removeDummyNodes } from "../dag/order/dummy_nodes";
import { treeLayoutCoordAssignment } from "../dag/position/treelayout_coord_assignment";
import { PipelineLayoutOptions } from "../../typings/layouts/pipeline";

export type PipelineLayoutConfigs = {
  graph: Graph | GraphStructure;
} & PipelineLayoutOptions;

export class PipelineLayout extends LayoutBase {
  declare graph: Graph | GraphStructure;
  options = {
    rootId: "",
    rankSep: 50,
    nodeSep: 30,
    rankDir: "TB" as "TB" | "BT" | "LR" | "RL",
    edgeSep: 10,
    ignoreControlPoints: false,
    coordAssignment: "compact" as "compact" | "treeLike",
    rootCoord: null,
    nodeSize: [0, 0],
  };
  nodeCache: Record<string, string[]> = {};

  constructor(configs: PipelineLayoutConfigs) {
    super(configs);
    this.graph = configs.graph;
    this.setOptions(configs);
  }

  layout() {
    const graph = this.graph;
    const { rankDir, rootId } = this.options;
    const root = graph.getNodeById(rootId);
    if (!root) {
      return;
    }
    if (graph instanceof Graph) {
      graph.emitEvent(GRAPH_EVENTS.LAYOUT_START);
      this.graph.set("emitGraphEvents", false);
    }
    graph.getEdges().forEach((edge: Edge | EdgeStructure) => {
      edge.set("controlPoints", undefined);
    });
    this.options.coordAssignment !== "treeLike" &&
      coordSystem.adjust(graph, rankDir);
    let layers = this.getRank(root);
    const ranks = {};
    layers.forEach((nodes: any, index: number) => {
      ranks[index] = nodes;
    });
    const dummyNodes = insertDummyNodes(graph, ranks);
    if (dummyNodes.length > 0) {
      layers = this.getRank(root);
    }
    let gapYs: any;
    if (this.options.coordAssignment === "treeLike") {
      treeLayoutCoordAssignment(graph, this.options, this.options.rootId);
    } else {
      horizontalCoordAssignment(graph, layers, { ...this.options });
      gapYs = this.placeRankPosition(layers);
    }
    removeDummyNodes(
      graph,
      ranks,
      dummyNodes,
      gapYs,
      this.options.ignoreControlPoints
    );
    this.options.coordAssignment !== "treeLike" &&
      coordSystem.revert(graph, rankDir);
    Object.keys(this.nodeCache).forEach((id: string) => {
      const node = graph.getNodeById(id);
      node.targets = this.nodeCache[id];
      delete this.nodeCache[id];
    });
    if (graph instanceof Graph) {
      this.graph.set("emitGraphEvents", true);
      graph.emitEvent(GRAPH_EVENTS.LAYOUT_END);
    }
  }

  getRank(root: Node | NodeStructure) {
    const layers: Node[][] | NodeStructure[][] = [];
    layers[0] = [root] as any;
    const graph = this.graph;
    root.set("rank", 0);
    const cacheNode = this.nodeCache;
    const visited: { [k: string]: boolean } = {};
    if (!root.get("collapsed")) {
      root.targets.forEach((nodeId: string) => {
        setRank(nodeId, 1);
      });
    } else {
      cacheNode[root.get("id")] = root.targets.concat([]);
      root.targets = [];
    }
    function setRank(nodeId: string, rank: number) {
      const node = graph.getNodeById(nodeId) as Node & NodeStructure;
      if (visited[nodeId]) {
        const formerRank = node.get("rank");
        if (rank > formerRank) {
          const formerIndex = layers[formerRank].indexOf(node);
          if (formerIndex >= 0) {
            layers[formerRank].splice(formerIndex, 1);
          }
          node.set("rank", rank);
          layers[rank] = layers[rank] || [];
          layers[rank].push(node);
          if (!node.get("collapsed")) {
            node.targets.forEach((childId: string) => {
              setRank(childId, rank + 1);
            });
          }
        }
        return;
      }
      node.set("rank", rank);
      visited[nodeId] = true;
      layers[rank] = layers[rank] || [];
      layers[rank].push(node);
      if (!node.get("collapsed")) {
        node.targets.forEach((childId: string) => {
          setRank(childId, rank + 1);
        });
      } else {
        cacheNode[node.get("id")] = node.targets.concat([]);
        node.targets = [];
      }
    }
    return layers;
  }

  placeRankPosition(layers: Node[][] | NodeStructure[][]) {
    const { rankSep } = this.options;
    const halfSep = rankSep / 2;
    let prevY = 0;
    const gapYs: {
      [key: string]: {
        target: number;
        source: number;
        height: number;
      };
    } = {};
    layers.forEach((row: Node[] | NodeStructure[]) => {
      let maxHeight = 0;
      row.forEach((node) => {
        maxHeight = Math.max(node.get("height"), maxHeight);
      });
      const y = prevY + maxHeight / 2;
      row.forEach((node) => {
        node.configs.y = y;
      });
      gapYs[row[0].get("rank")] = {
        target: prevY - halfSep,
        source: y + maxHeight / 2 + halfSep,
        height: maxHeight,
      };
      prevY += maxHeight + rankSep;
    });
    return gapYs;
  }

  formerlayout() {
    const graph = this.graph;
    const { rankDir, rankSep, nodeSep, rootId, rootCoord } = this.options;
    const root = graph.getNodeById(rootId);
    if (!root) {
      return;
    }
    if (graph instanceof Graph) {
      graph.emit(GRAPH_EVENTS.LAYOUT_START);
    }
    let nodeSize = this.options.nodeSize;
    if (rankDir === "TB") {
      nodeSize = [nodeSize[1], nodeSize[0]];
      graph.getNodes().forEach((node: Node | NodeStructure) => {
        node.set("x", undefined);
        node.set("y", undefined);
      });
    }
    let x = nodeSize[0] / 2;
    let y = nodeSize[1] / 2;
    if (rootCoord) {
      root.set("x", rootCoord[0]);
      root.set("y", rootCoord[1]);
      x = rootCoord[0];
      y = rootCoord[1];
    } else {
      root.set("x", -nodeSize[0] / 2);
      root.set("y", nodeSize[1] / 2);
    }
    const visited: { [k: string]: boolean } = {};
    const getAlign = this.getAlign;
    root.targets.forEach((nodeId: string) => {
      setCoord(nodeId, 0);
    });
    function setCoord(nodeId: string, rank: number) {
      const node = graph.getNodeById(nodeId);
      if (visited[nodeId]) {
        if (rank > node.get("rank")) {
          node.set("rank", rank);
          node.set(
            "x",
            Math.max(node.get("x"), rank * (nodeSize[0] + rankSep) + x)
          );
          node.targets.forEach((childId: string) => {
            setCoord(childId, rank + 1);
          });
        }
        return;
      }
      node.set("rank", rank);
      visited[nodeId] = true;
      node.set("aligned", false);
      node.set("x", rank * (nodeSize[0] + rankSep) + x);
      if (node.targets?.length) {
        node.targets.forEach((childId: string) => {
          setCoord(childId, rank + 1);
        });
        for (const id of node.targets) {
          const n = graph.getNodeById(id);
          const y = getAlign(n, graph);
          if (y !== null) {
            node.set("y", y);
            return;
          }
        }
        node.set("y", y);
        y += nodeSize[1] + nodeSep;
      } else {
        node.set("y", y);
        y += nodeSize[1] + nodeSep;
      }
    }
    if (rankDir === "TB") {
      graph.getNodes().forEach((node: Node | NodeStructure) => {
        const { x, y } = node.configs;
        node.set("x", y);
        node.set("y", x);
      });
    }
    if (graph instanceof Graph) {
      graph.emit(GRAPH_EVENTS.LAYOUT_START);
    }
  }

  getAlign(node: Node | NodeStructure, graph: any): number | null {
    if (!node.get("aligned")) {
      node.set("aligned", true);
      return node.get("y");
    }
    const { x, y } = node.configs;
    const map: any = {};
    graph.getNodes().forEach((node: Node) => {
      const nodeY = node.get("y");
      if (node.get("x") >= x && nodeY > y && !node.get("aligned")) {
        map[nodeY] = node.get("id");
      }
    });
    const ys = Object.keys(map).sort(
      (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10)
    );
    if (ys.length) {
      const node = graph.getNodeById(map[ys[0]]);
      node.set("aligned", true);
      return parseInt(ys[0], 10);
    }
    return null;
  }
}
