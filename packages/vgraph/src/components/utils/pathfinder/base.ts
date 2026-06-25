import { GridData } from "../../grid";

export type IFinderOptions = {
  heuristic?: "manhattan" | "euclidean" | "chebyshev";
  allowDiagonal?: "always" | "never" | "onlyNoObstacles";
  biDirectional?: boolean;
};
export const Heuristic = {
  manhattan: function (dx: number, dy: number) {
    return dx + dy;
  },
  euclidean: function (dx: number, dy: number) {
    return Math.sqrt(dx * dx + dy * dy);
  },
  octile: function (dx: number, dy: number) {
    const F = Math.SQRT2 - 1;
    return dx < dy ? F * dx + dy : F * dy + dx;
  },
  chebyshev: function (dx: number, dy: number) {
    return Math.max(dx, dy);
  },
};

export class BaseFinder {
  heuristic: IFinderOptions["heuristic"] = "manhattan";
  allowDiagonal: IFinderOptions["allowDiagonal"] = "always";
  biDirectional: IFinderOptions["biDirectional"] = false;
  constructor(options?: IFinderOptions) {
    if (options) {
      if (options.heuristic) {
        this.heuristic = options.heuristic;
      }
      if (options.allowDiagonal) {
        this.allowDiagonal = options.allowDiagonal;
      }
      if (options.biDirectional) {
        this.biDirectional = options.biDirectional;
      }
    }
  }

  getHeuristic() {
    return Heuristic[this.heuristic!];
  }
  backtrace(node: { col: number; row: number; parent: any }) {
    const path = [[node.col, node.row]];
    while (node.parent && !node.parent.mock) {
      node = node.parent;
      path.push([node.col, node.row]);
    }
    return path.reverse();
  }

  // TODO 对象转数组，可能可以提速
  getNeighbors(currentNode: { row: number; col: number }, gridData: GridData) {
    const { rows, cols, grid } = gridData;
    const { row, col } = currentNode;
    const neighbors = [] as {
      row: number;
      col: number;
      g?: number;
      h?: number;
      f?: number;
      parent?: any;
    }[];
    if (row > 0) {
      if (grid[row - 1][col] === 0) {
        neighbors.push({
          row: row - 1,
          col: col,
        });
      }
    }
    if (row < rows - 1) {
      if (grid[row + 1][col] === 0) {
        neighbors.push({
          row: row + 1,
          col: col,
        });
      }
    }
    if (col > 0) {
      if (grid[row][col - 1] === 0) {
        neighbors.push({
          row: row,
          col: col - 1,
        });
      }
    }
    if (col < cols - 1) {
      if (grid[row][col + 1] === 0) {
        neighbors.push({
          row: row,
          col: col + 1,
        });
      }
    }
    if (this.allowDiagonal === "always") {
      if (row > 0 && col > 0 && grid[row - 1][col - 1] === 0) {
        neighbors.push({
          row: row - 1,
          col: col - 1,
        });
      }
      if (row > 0 && col < cols - 1 && grid[row - 1][col + 1] === 0) {
        neighbors.push({
          row: row - 1,
          col: col + 1,
        });
      }
      if (row < rows - 1 && col > 0 && grid[row + 1][col - 1] === 0) {
        neighbors.push({
          row: row + 1,
          col: col - 1,
        });
      }
      if (row < rows - 1 && col < cols - 1 && grid[row + 1][col + 1] === 0) {
        neighbors.push({
          row: row + 1,
          col: col + 1,
        });
      }
    }
    if (this.allowDiagonal === "onlyNoObstacles") {
      if (row > 0 && col > 0 && grid[row - 1][col - 1] === 0) {
        if (grid[row][col - 1] === 0 && grid[row - 1][col] === 0) {
          neighbors.push({
            row: row - 1,
            col: col - 1,
          });
        }
      }
      if (row > 0 && col < cols - 1 && grid[row - 1][col + 1] === 0) {
        if (grid[row][col + 1] === 0 && grid[row - 1][row] === 0) {
          neighbors.push({
            row: row - 1,
            col: col + 1,
          });
        }
      }
      if (row < rows - 1 && col > 0 && grid[row + 1][col - 1] === 0) {
        if (grid[row][col - 1] === 0 && grid[row + 1][col] === 0) {
          neighbors.push({
            row: row + 1,
            col: col - 1,
          });
        }
      }
      if (row < rows - 1 && col < cols - 1 && grid[row + 1][col + 1] === 0) {
        if (grid[row][col + 1] === 0 && grid[row + 1][col] === 0) {
          neighbors.push({
            row: row + 1,
            col: col + 1,
          });
        }
      }
    }
    return neighbors;
  }
  findPath(
    startPoint: number[] | number[][],
    endPoint: number[] | number[][],
    grid: GridData,
    startInfos?: any,
    endInfos?: any
  ) {
    return undefined as number[][] | undefined;
  }
}
