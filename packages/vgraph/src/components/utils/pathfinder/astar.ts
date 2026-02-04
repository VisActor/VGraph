import { GridData } from "../../grid";
import { Heap } from "../heap";
import { BaseFinder, IFinderOptions } from "./base";

export type IAStarFinderOptions = IFinderOptions & {
  lessDiversion?: boolean;
};

export class AStarFinder extends BaseFinder {
  lessDiversion = false;
  constructor(options?: IAStarFinderOptions) {
    super((options as IFinderOptions) ?? {});
    if (options) {
      if (
        options.lessDiversion !== undefined &&
        options.allowDiagonal !== "always" &&
        options.allowDiagonal !== "onlyNoObstacles"
      ) {
        this.lessDiversion = options.lessDiversion;
        // 1. 斜角没有必要走lessDiversion
        // 2. lessDiversion 也只是启发式的，能减少很多折角，很有用，但也还不是最优的。
        // 例如  [0,0]->[0,1]->[1,1]->[2,1] 折角1次
        //      [0,0]->[1,0]->[1,1]->[2,1] 折角2次.
        // 但是由于在 [1,1] 的时候都只发生了一次折角，一旦从下面路线走，就没法回溯到上面的路线。
        // 时间紧暂不处理，目前应该也没啥好办法。
      }
    }
  }

  findPath(
    startPoint: number[] | number[][],
    endPoint: number[] | number[][],
    gridData: GridData,
    startInfos?: any
  ) {
    const { left, top, rows, cols, step } = gridData;
    const abs = Math.abs;
    const SQRT2 = Math.SQRT2;
    const weight = 1;

    const heuristic = this.getHeuristic();
    const openList = new Heap((a, b) => a.all - b.all, rows * cols);
    const openNodeMap = new Array(rows * cols);
    // const openNodeMap = {};
    // 考虑换 Object

    type openNode = {
      id?: number;
      row: number;
      col: number;
      all?: number; // 总花费 all = f + c。
      feat?: number; // 未来的花费 feat。
      cost?: number; // 已经存在的花费 cost。 因为使用较为频繁，尽可能简写。
      opened?: boolean;
      closed?: boolean;
      parent?: openNode;
    };
    const startNodes = [] as openNode[];
    const startPoints = Array.isArray(startPoint[0])
      ? startPoint
      : [startPoint];
    startPoints.forEach((point, index) => {
      const startNode = {
        col: Math.floor((point[0] - left) / step), // 行
        row: Math.floor((point[1] - top) / step), // 列
        all: 0,
        feat: 0,
        cost: 0,
      } as openNode;
      const startInfo = startInfos?.[index];
      if (startInfo?.direction) {
        switch (startInfo.direction) {
          case "L":
            startNode.parent = {
              col: startNode.col - 1,
              row: startNode.row,
              mock: true,
            } as any;
            break;
          case "R":
            startNode.parent = {
              col: startNode.col + 1,
              row: startNode.row,
              mock: true,
            } as any;
            break;
          case "T":
            startNode.parent = {
              col: startNode.col,
              row: startNode.row - 1,
              mock: true,
            } as any;
            break;
          case "B":
            startNode.parent = {
              col: startNode.col,
              row: startNode.row + 1,
              mock: true,
            } as any;
            break;
          default:
            break;
        }
      }
      startNode.id = startNode.row * cols + startNode.col; // 矩阵坐标可以作为唯一id
      openNodeMap[startNode.id] = startNode;
      startNodes.push(startNode);
      openList.push(startNode);
      startNode.opened = true;
    });

    const endPoints = Array.isArray(endPoint[0]) ? endPoint : [endPoint];
    const endNodes = [] as { col: number; row: number }[];
    for (const point of endPoints) {
      endNodes.push({
        col: Math.floor((point[0] - left) / step),
        row: Math.floor((point[1] - top) / step),
      });
    }
    const endNodesId = endNodes.map((node) => node.row * cols + node.col);
    let endNodesWalkable = false;
    for (const endNode of endNodes) {
      const endRow = endNode.row;
      const endCol = endNode.col;
      if (gridData.grid[endRow][endCol] <= 0) {
        endNodesWalkable = true;
      }
    }
    if (!endNodesWalkable) {
      return undefined;
    }
    // TODO: 无解探针。可以通过 BFS 一定的迭代次数来判断是否无解。 无解探针可以在一定迭代次数后再进行而不是直接进行。

    // let neiCnt = 0;
    function toOpenNode(neighbors: any[]) {
      const nodes = [] as openNode[];
      for (const neighbor of neighbors) {
        // neiCnt += 1;
        const id = neighbor.row * cols + neighbor.col;
        const node = openNodeMap[id];
        if (node) {
          nodes.push(node);
        } else {
          const node = {
            row: neighbor.row,
            col: neighbor.col,
            id,
          };
          nodes.push(node);
          openNodeMap[id] = node;
        }
      }
      return nodes;
    }
    // const nodeCnt = 0;
    // const popCnt = 0;
    while (!openList.empty()) {
      // TODO: 宽松无解条件，到达一定求解次数即判断为无解
      const currentNode = openList.pop();
      // popCnt += 1;
      currentNode.closed = true;
      if (endNodesId.includes(currentNode.id)) {
        // 找到终点
        // console.log('possum', nodeCnt, neiCnt, popCnt);
        return this.backtrace(currentNode);
      }
      const neighbors = this.getNeighbors(currentNode, gridData);
      const neighborNodes = toOpenNode(neighbors);
      for (const neighbor of neighborNodes) {
        const { row, col } = neighbor;
        if (neighbor.closed) {
          continue;
        }

        const ng =
          currentNode.cost! +
          (col - currentNode.col === 0 || row - currentNode.row === 0
            ? 1
            : SQRT2) +
          (this.lessDiversion
            ? directionChanged(currentNode, neighbor, endNodes)
            : 0);
        if (!neighbor.opened || ng < neighbor.cost!) {
          neighbor.cost = ng;
          neighbor.feat =
            neighbor.feat ||
            weight *
              Math.min(
                ...endNodes.map((endNode) =>
                  heuristic(abs(col - endNode.col), abs(row - endNode.row))
                )
              );
          neighbor.all = neighbor.cost! + neighbor.feat;
          neighbor.parent = currentNode;
          if (neighbor.opened) {
            // nodeCnt += 1;
            // index 查找优化
            // heap 里通过 Map 保存 index -> UInt32Array
            // 8481.718017578125 ms -> 222.0458984375 ms
            openList.update(neighbor);
          } else {
            openList.push(neighbor);
            // nodeCnt += 1;
            neighbor.opened = true;
          }
        }
      }
    }
    // console.log('possum', nodeCnt, neiCnt, popCnt);
    return;
  }
}

function directionChanged(source: any, target: any, endNodes: any) {
  let res = 0;
  let minEndRes = 1;
  const min = Math.min;
  for (const endNode of endNodes) {
    minEndRes = min(directionFutureChanged(source, target, endNode), minEndRes);
  }
  res += minEndRes;
  if (!source.parent) {
    return res;
  }
  const x1 = source.row - source.parent.row;
  const y1 = source.col - source.parent.col;
  const x2 = target.row - source.row;
  const y2 = target.col - source.col;
  res += 0.2 * +(Math.abs(x1 * x2 + y1 * y2) === 0);
  return res;
}

function directionFutureChanged(source: any, target: any, endNode: any) {
  const x1 = target.row - source.row;
  const y1 = target.col - source.col;
  const x2 = endNode.row - target.row;
  const y2 = endNode.col - target.col;
  const res = +(Math.abs(x1 * x2 + y1 * y2) === 1) + +(x2 === 0) + +(y2 === 0);
  return 0.01 * (2 - res);
}
