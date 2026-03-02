import {
  EdgeData,
  Graph,
  GraphStructure,
  GroupData,
  LayoutBase,
  NodeData,
} from "@visactor/vgraph";
import { wasmModule } from "./load_wasm/loadwasm";
import { DotLayoutConfigs } from "./type";
import { parseErrorMessages } from "./utils/debug";
import {
  dealGraphVizResult,
  dotStr,
  normalizePadding,
} from "./utils/transform";

export class WasmDAGLayout extends LayoutBase {
  options: DotLayoutConfigs["options"] = {
    lineType: "polyline",
    rankSep: 50,
    nodeSep: 20,
    ranker: "networkSimplex",
    rankDir: "TB",
  };
  constructor(configs: DotLayoutConfigs) {
    super(configs);
    this.options = Object.assign({}, this.options, configs.options);
    this.layout();
  }
  layout() {
    if (wasmModule.status !== "loaded") {
      console.error("wasm is not loaded, please load wasm file first");
      return;
    }
    if (this.graph.getNodes().length === 0) {
      console.warn("graph is empty");
      return;
    }
    const dots = dotStr(this.graph as Graph, { ...this.options });
    // console.log(dots);
    const plainRes = this.wasmCall(dots);
    // console.log(plainRes);
    const res = dealGraphVizResult(plainRes);
    // console.log(res);
    this.assignNodePosition(res);
    this.assignGroupPosition(res);
    this.assignEdgePosition(res);
  }

  private assignNodePosition(res: {
    nodePos: {
      [key: string]: { x: number; y: number; rank: number; order: number };
    };
  }) {
    for (const node of this.graph.getNodes()) {
      const { x, y, rank, order } = res.nodePos[node.get("id")] ?? {};
      if (x !== undefined && y !== undefined) {
        node.configs.x = x;
        node.configs.y = y;
        node.configs.order = order;
        node.configs.rank = rank;
      }
    }
  }
  private assignGroupPosition(res: {
    nodePos: {
      [key: string]: { x: number; y: number; width: number; height: number };
    };
  }) {
    for (const group of this.graph.getGroups()) {
      if (group.get("collapsed") && group.get("linkGroupOnCollapse")) {
        const info = res.nodePos[group.get("id")] as {
          x?: number;
          y?: number;
          width?: number;
          height?: number;
        };
        const padding = normalizePadding(group.get("padding"));
        if (
          info.x !== undefined &&
          info.y !== undefined &&
          info.width !== undefined &&
          info.height !== undefined
        ) {
          group.set("fixLeft", info.x - 0.5 * info.width + padding[3]);
          group.set(
            "fixTop",
            info.y - 0.5 * info.height + padding[0] + (group as any).titleHeight
          );
          group.set("fixWidth", info.width - padding[1] - padding[3]);
          console.log(
            "fixWidth",
            info.width - padding[1] - padding[3],
            info.width,
            padding[1],
            padding[3]
          );
        }
      }
    }
  }

  private assignEdgePosition(res: { edgeCp: { [key: string]: number[][] } }) {
    const edgeCnt = new Map<string, number>();
    for (const edge of this.graph.getEdges()) {
      const source = edge.get("source");
      const target = edge.get("target");
      let srcTgt = source + "-and-" + target;
      // 重边
      if (!edgeCnt.has(srcTgt)) {
        edgeCnt.set(srcTgt, 0);
      } else {
        edgeCnt.set(srcTgt, edgeCnt.get(srcTgt)! + 1);
        srcTgt += "-" + edgeCnt.get(srcTgt);
      }
      const cps = res.edgeCp[srcTgt];
      if (!cps) {
        continue;
      }
      const length = cps.length;
      const controlPoints = [] as number[][];
      cps.forEach((cp: number[], i: number) => {
        if (i % 3 === 0) {
          if (i !== 0 && i !== length - 1) {
            controlPoints.push(cp);
          }
        }
      });
      if (controlPoints.length > 0) {
        edge.set("controlPoints", controlPoints);
      } else {
        edge.set("controlPoints", undefined);
      }
      edge.set("splineControlPoints", cps);
    }
  }

  private wasmCall(dotGraph: string) {
    const resultPointer = wasmModule.wasm.ccall(
      "layout",
      "number",
      ["string"],
      [dotGraph]
    );
    if (resultPointer === 0) {
      console.error({
        graphviz: {
          status: "failure",
          output: undefined,
          errors: parseErrorMessages(wasmModule.wasm),
        },
      });
    } else {
      // console.log({
      //   graphviz: {
      //     status: 'failure',
      //     output: undefined,
      //     errors: parseErrorMessages(wasmModule.wasm)
      //   }
      // })
      return wasmModule.wasm.UTF8ToString(resultPointer);
    }
  }

  setOption<T extends keyof Required<DotLayoutConfigs>["options"]>(
    k: T,
    v: Required<DotLayoutConfigs>["options"][T]
  ) {
    this.options![k] = v;
  }
  setOptions(options: Required<DotLayoutConfigs>["options"]) {
    this.options = Object.assign({}, this.options, options);
  }
  init() {
    return;
  }
  reLayout() {
    this.layout();
  }
}
