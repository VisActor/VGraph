import { Edge } from '../../models/entities';
import { AStarFinder, BaseFinder, BStarFinder } from '../utils';
import { Grid } from '../grid';
import { compressPath, convertPath } from '../utils/path';

export type RouterOptions = {
  /**
   * The path-finding algorithm.
   * 寻径算法
   */
  algorithm?: 'AStar' | 'BStar';
  /**
   * The distance function.
   * 距离函数
   */
  heuristic?: 'manhattan' | 'euclidean' | 'chebyshev';
  /**
   * Is diagonal walk allowed.
   * 是否允许走斜线
   */
  allowDiagonal?: 'always' | 'never' | 'onlyNoObstacles';


  // biDirectional?: boolean; // TODO： 暂未支持，不透出。

  /**
   * To minimize the number of corners.
   * 是否尽量减少折角
   */
  lessDiversion?: boolean;
  /**
   * Whether to fix anchor of source and target nodes.
   * 是否固定锚点位置
   */
  fixAnchor?: boolean;
  /**
   * Enable the router.
   * 是否启用智能路由
   */
  enable?: boolean;
  /**
   * Should the path align with the terminal of nodes.
   * 路径是否对齐节点的端点
   */
  alignTerminal?: boolean;
/**
   * The minimum distance from the terminal of nodes.
   * 起始位置的最短距离
   */
  minDist?: number;
  /**
   * Whether to throw warning when no path is found.
   * 是否在未寻到路径时抛出警告
   */
  throwWarning?: boolean;
  /**
   * Fallback plan when no path is found.
   * 未寻到路径的降级方案
   */
  fallback?: 'unchanged' | 'aligned';
};

export class Router {
  grid?: Grid;
  finder: BaseFinder;
  options: RouterOptions = {
    algorithm: 'AStar',
    heuristic: 'manhattan',
    allowDiagonal: 'never',
    lessDiversion: true,
    alignTerminal: true,
    fixAnchor: false,
    minDist: 20,
    throwWarning: true,
    fallback: 'aligned',
  };
  constructor(grid: Grid, options?: RouterOptions) {
    grid.graph.addComponent(this as any);
    if (options) {
      this.options = Object.assign({}, this.options, options);
    }
    if (grid) {
      this.grid = grid;
    }
    if (this.options.algorithm === 'AStar') {
      this.finder = new AStarFinder(this.options);
    } else if (this.options.algorithm === 'BStar') {
      this.finder = new BStarFinder(this.options);
    } else {
      this.finder = new AStarFinder(this.options);
    }
  }
  setGrid(grid: Grid) {
    this.grid = grid;
  }
  setDefaultOptions(options: RouterOptions) {
    this.options = Object.assign({}, this.options, options);
    this.finder = this.options.algorithm === 'BStar' ? new BStarFinder(options) : new AStarFinder(options);
  }

  getFinder() {
    return this.finder;
  }

  updateEdgePath(edge: Edge, fixAnchor?: boolean, ignoreMinDist?: { start?: boolean; end?: boolean }) {
    fixAnchor = fixAnchor ?? this.options.fixAnchor;
    const controlPointsBak = edge.get('controlPoints');
    edge.set('controlPoints', null);
    let controlPoints = null;
    const sourceAnchor = edge.get('sourceAnchor');
    const targetAnchor = edge.get('targetAnchor');
    const { source, target } = edge;

    // 连线两端可能是节点或连线，当两端是节点时分组不应进入 grid，以免节点外层的分组让连线找不到路径
    // 当连线两端是分组时需要将当前分组的 bbox 临时添加到 grid 中，避免连线与分组边框重合的问题
    // TODO 分组到子节点的连线场景比较少，有需求再优化
    const bboxes = [];
    const grid = this.grid;
    if (source?.type === 'group' && grid) {
      const bbox = source.getBBox();
      grid.addBBox(bbox);
      bboxes.push(bbox);
    }
    if (target?.type === 'group' && grid) {
      const bbox = target.getBBox();
      grid.addBBox(bbox);
      bboxes.push(bbox);
    }
    if (fixAnchor || sourceAnchor !== undefined || targetAnchor !== undefined) {
      const { startPoint, endPoint } = edge.getTerminal();
      const sourceAnchors = edge.source?.getAnchorPositions();
      const targetAnchors = edge.target?.getAnchorPositions();
      controlPoints = this.findPath(
        sourceAnchors?.[sourceAnchor] ?? startPoint,
        targetAnchors?.[targetAnchor] ?? endPoint,
        ignoreMinDist
      );
    } else {
      controlPoints = this.findEdgePath(edge, ignoreMinDist);
    }
    if (controlPoints === null) {
      if (this.options.throwWarning) {
        console.warn('[router] edge:', edge.get('id'), 'no path found');
      }
      if (this.options.fallback === 'aligned') {
        // 降级方案：保持端点平行
        this.fallbackPath(controlPointsBak, edge);
      }
      edge.set('controlPoints', controlPointsBak);
    } else if (controlPoints.length !== 0){
      edge.set('controlPoints', controlPoints);
    }
    if (bboxes.length > 0) {
      grid!.removeBBox(bboxes);
    }
  }

  fallbackPath(controlPoints: number[][], edge: Edge) {
    if (!controlPoints) {
      return;
    }
    const { startPoint, endPoint } = edge.getTerminal();
    const length = controlPoints.length;
    if (length === 1) {
      controlPoints[0][0] = startPoint[0];
      controlPoints[0][1] = endPoint[1];
    } else if (length > 1) {
      if (startPoint[0] !== controlPoints[0][0] && startPoint[1] !== controlPoints[0][1]) {
        if (controlPoints[0][0] === controlPoints[1][0]) {
          // 如果前二控制点与y轴平行，那么移动第一个控制点的y坐标
          controlPoints[0][1] = startPoint[1];
        } else {
          // 否则移动第一个控制点的x坐标
          controlPoints[0][0] = startPoint[0];
        }
      }
      if (endPoint[0] !== controlPoints[length - 1][0] && endPoint[0] !== controlPoints[length - 1][1]) {
        if (controlPoints[length - 2][0] === controlPoints[length - 1][0]) {
          controlPoints[length - 1][1] = endPoint[1];
        } else {
          controlPoints[length - 1][0] = endPoint[0];
        }
      }
    }
  }

  findEdgePath(edge: Edge, ignoreMinDist?: { start?: boolean; end?: boolean }) {
    const { startPoint, endPoint } = edge.getTerminal();
    const sourceAnchors = edge.source?.getAnchorPositions();
    const targetAnchors = edge.target?.getAnchorPositions();
    const controlPoints = this.findPath(
      sourceAnchors?.length > 0 ? sourceAnchors : startPoint,
      targetAnchors?.length > 0 ? targetAnchors : endPoint,
      ignoreMinDist
    );
    if (sourceAnchors?.length === 0) {
      controlPoints?.unshift(startPoint);
    }
    if (targetAnchors?.length === 0) {
      controlPoints?.push(endPoint);
    }
    return controlPoints;
  }

  findPath(
    startPoint: number[] | number[][],
    endPoint: number[] | number[][],
    ignoreMinDist?: { start?: boolean; end?: boolean }
  ) {
    const newOptions = Object.assign({}, this.options);
    const finder = this.finder;
    // const newOptions = Object.assign({}, this.options, options);
    // const finder = options
    //   ? newOptions.algorithm === 'BStar'
    //     ? new BStarFinder(newOptions)
    //     : new AStarFinder(newOptions)
    //   : this.finder;
    // // 有指定的 options 则采用新 options 得到的finder，否则用统一的 finder

    if (this.grid) {
      const { left, top, step } = this.grid.gridData;
      type terminalInfo = {
        pos: number[];
        direction?: string;
        col: number;
        row: number;
      };
      const startPoints = Array.isArray(startPoint[0]) ? startPoint : [startPoint];
      const startInfos = [] as terminalInfo[];
      let minDist = this.options.minDist || 20;
      for (const point of startPoints) {
        if (ignoreMinDist?.start) {
          minDist = 0;
        }
        const startInfo = this.grid.directionWalkableWithMinDist(point[0], point[1], minDist) as terminalInfo;
        startInfo && startInfos.push(startInfo);
      }
      let haveStartInfo = false;
      startInfos.forEach((startInfo) => {
        startInfo && (haveStartInfo = true);
      });
      if (!haveStartInfo) {
        return null;
      }
      const start = startInfos.map((startInfo) => startInfo?.pos);

      const endPoints = Array.isArray(endPoint[0]) ? endPoint : [endPoint];
      const endInfos = [] as terminalInfo[];
      minDist = this.options.minDist || 20;
      for (const point of endPoints) {
        if (ignoreMinDist?.end) {
          minDist = 0;
        }
        const endInfo = this.grid.directionWalkableWithMinDist(point[0], point[1], minDist) as terminalInfo;
        endInfo && endInfos.push(endInfo);
      }
      let haveEndInfo = false;
      endInfos.forEach((endInfo) => {
        endInfo && (haveEndInfo = true);
      });
      if (!haveEndInfo) {
        return null;
      }
      const end = endInfos.map((endInfo) => endInfo?.pos);
      const path = finder.findPath(start, end, this.grid.gridData, startInfos);
      let controlPoints = convertPath(left, top, step, compressPath(path));

      // 体验优化
      // 平移开头和结尾的控制点，令其与起始点或终点对齐。
      // 编辑器场景可以通过限制节点中心坐标来达到该目的。

      let startInfo = startInfos[0];
      let endInfo = endInfos[0];
      startPoint = startPoints[0] as number[];
      endPoint = endPoints[0] as number[];
      if (controlPoints?.length) {
        const length = controlPoints.length;
        const [col, row] = this.grid?.getIndexByCoord(controlPoints[0][0], controlPoints[0][1]);
        const [endCol, endRow] = this.grid?.getIndexByCoord(controlPoints[length - 1][0], controlPoints[length - 1][1]);
        startInfos.forEach((info, index) => {
          if (col === info.col && row === info.row) {
            startInfo = info;
            startPoint = startPoints[index] as number[];
          }
        });
        endInfos.forEach((info, index) => {
          if (endCol === info.col && endRow === info.row) {
            endInfo = info;
            endPoint = endPoints[index] as number[];
          }
        });
      }

      if (controlPoints && newOptions.alignTerminal) {
        const length = controlPoints.length;
        const sdx = controlPoints[0][0] - startInfo.pos[0];
        const sdy = controlPoints[0][1] - startInfo.pos[1];

        const edx = controlPoints[length - 1][0] - endInfo.pos[0];
        const edy = controlPoints[length - 1][1] - endInfo.pos[1];
        // TODO 次控制点对齐
        if (controlPoints.length > 2) {
          // 第二个控制点和第一个控制点水平或垂直对齐
          if (controlPoints[0][1] === controlPoints[1][1]) {
            controlPoints[1][1] -= sdy;
          } else if (controlPoints[0][0] === controlPoints[1][0]) {
            controlPoints[1][0] -= sdx;
          }
          // 末端
          if (controlPoints[length - 1][1] === controlPoints[length - 2][1]) {
            controlPoints[length - 2][1] -= edy;
          } else if (controlPoints[length - 1][0] === controlPoints[length - 2][0]) {
            controlPoints[length - 2][0] -= edx;
          }
        }
        if (controlPoints.length === 2) {
          if (controlPoints[0][1] === controlPoints[1][1]) {
            controlPoints[0][0] -= sdx;
            controlPoints[1][0] -= edx;
            if (sdy === edy) {
              controlPoints[0][1] -= sdy;
              controlPoints[1][1] -= edy;
            }
          } else if (controlPoints[0][0] === controlPoints[1][0]) {
            controlPoints[0][1] -= sdy;
            controlPoints[1][1] -= edy;
            if (sdx === edx) {
              controlPoints[0][0] -= sdx;
              controlPoints[1][0] -= edx;
            }
          }
        } else {
          controlPoints[0][0] -= sdx;
          controlPoints[0][1] -= sdy;
          controlPoints[length - 1][0] -= edx;
          controlPoints[length - 1][1] -= edy;
        }
      }

      if (controlPoints) {
        const tempPoints = compressPath([startPoint, ...controlPoints, endPoint]);
        tempPoints?.shift();
        tempPoints?.pop();
        controlPoints = tempPoints;
      }

      // TODO: 处理非常特殊的情况：
      // A在左上B在右下，但左右距离恰好在 minDist 到 2 * minDist 之间
      // 即 startPoint, startInfo.pos, endInfo.pos, endPoint 呈现下面这种情况
      // A-----
      //   ｜
      //   ｜
      //    -----B
      // 我们 minDist 默认是 2 * step， 因此有一定概率出现这种情况。

      if (controlPoints && controlPoints.length > 2) {
        // start
        if (
          startInfo.direction &&
          ['T', 'B'].includes(startInfo.direction) &&
          controlPoints[0][0] === controlPoints[1][0]
        ) {
          // 垂直方向,
          // 乘积 < 0, 说明出现折返情况。
          if ((startPoint[1] - controlPoints[1][1]) * (controlPoints[0][1] - controlPoints[1][1]) < 0) {
            // 剔除起始点
            controlPoints.shift();
          }
        }
        if (
          startInfo.direction &&
          ['L', 'R'].includes(startInfo.direction) &&
          controlPoints[0][1] === controlPoints[1][1]
        ) {
          // 水平方向
          if ((startPoint[0] - controlPoints[1][0]) * (controlPoints[0][0] - controlPoints[1][0]) < 0) {
            // 剔除起始点
            controlPoints.shift();
          }
        }
        // end
        const length = controlPoints.length;
        if (
          endInfo.direction &&
          ['T', 'B'].includes(endInfo.direction) &&
          controlPoints[length - 1][0] === controlPoints[length - 2][0]
        ) {
          if (
            (endPoint[1] - controlPoints[length - 2][1]) *
              (controlPoints[length - 1][1] - controlPoints[length - 2][1]) <
            0
          ) {
            controlPoints.pop();
          }
        }
        if (
          endInfo.direction &&
          ['L', 'R'].includes(endInfo.direction) &&
          controlPoints[length - 1][1] === controlPoints[length - 2][1]
        ) {
          if (
            (endPoint[0] - controlPoints[length - 2][0]) *
              (controlPoints[length - 1][0] - controlPoints[length - 2][0]) <
            0
          ) {
            controlPoints.pop();
          }
        }
      }

      if (path?.length) {
        return controlPoints || [];
      } else {
        return null;
      }
    } else {
      console.warn('Router: grid is not set');
      return null;
    }
  }
  destroy() {
    this.grid = undefined;
    this.options = null as any;
  }
}
