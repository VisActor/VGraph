// export { GridData } from './gridData';
import { GRAPH_EVENTS } from '../../consts/meta_events';
import { Graph, TreeGraph } from '../../graph';
import { BBox } from '../../renderer';
import { Entity, Node, Group } from '../../models/entities';
import { GraphEvent } from '../../typings/event';
import { ComponentBase } from '../base';

export type GridOptions = {
  /**
   * The size of one grid.
   * 一格网格的大小
   */
  step?: number;
  /**
   * Whether to ignore the space of group title
   * 是否忽略分组的标题占位
   */
  ignoreGroupTitle?: boolean;
  /**
   * Extra padding around each node.
   * 节点边界的额外宽度
   */
  extraWidth?: number;
};

const BORDERS = 25;

export type GridData = {
  step: number;
  rows: number;
  cols: number;
  left: number;
  top: number;
  grid: Uint16Array[];
};

export class Grid extends ComponentBase {
  toBeRemoved: BBox[] | null = null;
  onMovingEntitiesMap = {};
  updateToBeRemoved: BBox[] | null = null;
  // 可能会出现在拖拽过程中发生节点 update 的情况(Form表单场景操作过快或协同场景)，由于拖拽过程会更新 Bbox，所以处于拖拽过程中的节点可以忽略 update 更新。
  // FIXME: 考虑协同场景远比目前所考虑的复杂，暂时先解决操作过快误操作导致的边界 case。
  gridData: GridData;
  constructor(graph: Graph | TreeGraph, options?: GridOptions) {
    super(graph, options);
    this.mergeOptions(options);
    this.gridData = {
      step: this.options.step!,
      rows: 0,
      cols: 0,
      left: 0,
      top: 0,
      grid: [] as Uint16Array[],
    };
    if (graph.getNodes().length > 0 || graph.getGroups().length > 0) {
      this.refresh();
    }
    graph.set('_grid', this);
  }
  getDefaultOptions() {
    return {
      step: 10,
      ignoreGroupTitle: true,
      extraWidth: 0,
    };
  }

  getEvents() {
    const events = {
      [GRAPH_EVENTS.ADD_END]: 'onAddEnd',
      [GRAPH_EVENTS.REMOVE_START]: 'onRemoveStart',
      [GRAPH_EVENTS.REMOVE_END]: 'onRemoveEnd',
      [GRAPH_EVENTS.UPDATE_START]: 'onUpdateStart',
      [GRAPH_EVENTS.UPDATE_END]: 'onUpdateEnd',
      [GRAPH_EVENTS.MOVE_START]: 'onMoveStart',
      [GRAPH_EVENTS.MOVING]: 'onMoving',
      [GRAPH_EVENTS.MOVE_END]: 'onMoveEnd',
      [GRAPH_EVENTS.DATA_END]: 'refresh',
      [GRAPH_EVENTS.UPDATE_DATA_END]: 'refresh',
      [GRAPH_EVENTS.LAYOUT_END]: 'refresh',
      [GRAPH_EVENTS.CLEAR_END]: 'refresh',
    };
    // group 的 bbox 不算入 grid 中，在 router 中处理
    if (!this.options.ignoreGroupTitle) {
      // 分组大小变化的场景太多，例如添加/删除子节点等。除了删除走通用 bbox，其余都通过 refreshBox 事件来处理
      events[GRAPH_EVENTS.GROUP_BBOX_START] = 'onGroupBBoxStart';
      events[GRAPH_EVENTS.GROUP_BBOX_END] = 'onGroupBBoxEnd';
    }
    return events;
  }

  onAddEnd(ev: GraphEvent) {
    if (!this.shouldIgnoreEntity(ev.target)) {
      this.addBBox(ev.target.getBBox());
    }
  }
  onRemoveStart(ev: GraphEvent) {
    const target = ev.target;
    if (!this.shouldIgnoreEntity(target)) {
      this.toBeRemoved = [target.getBBox()];
    }
    if (target.type === 'group') {
      this.updateGroupBBox(target, 'remove');
    }
  }
  onRemoveEnd(ev: GraphEvent) {
    if (!this.shouldIgnoreEntity(ev.target)) {
      this.removeBBox(this.toBeRemoved!);
      this.toBeRemoved = null;
    }
  }
  onUpdateStart(ev: GraphEvent) {
    if (!this.shouldIgnoreEntity(ev.target) && !this.onMovingEntitiesMap[ev.target.get('id')]) {
      this.updateToBeRemoved = [ev.target.getBBox()]; // 原 bbox 需要删除
    }
  }
  onUpdateEnd(ev: GraphEvent) {
    if (!this.shouldIgnoreEntity(ev.target) && !this.onMovingEntitiesMap[ev.target.get('id')]) {
      this.removeBBox(this.updateToBeRemoved!);
      this.updateToBeRemoved = null;
      this.addBBox(ev.target.getBBox()); // 新 bbox 需要添加
    }
  }
  onMoveStart(ev: GraphEvent & { batch?: boolean; targets: GraphEvent['target'][] }) {
    const targets = ev.targets;
    this.toBeRemoved = [];
    for (const item of targets as GraphEvent['target'][]) {
      this.onMovingEntitiesMap[item.get('id')] = true;
      this.toBeRemoved.push(item.getBBox());
    }
  }
  onMoveEnd(ev: GraphEvent & { batch?: boolean; targets: GraphEvent['target'][] }) {
    const targets = ev.targets;
    // FIXME: 考虑协同场景远比目前所考虑的复杂，暂时先解决操作过快误操作导致的边界case。
    // 边界case：拖拽过程中被删除 （可能是操作过快，也可能是协同场景
    this.toBeRemoved && this.removeBBox(this.toBeRemoved);
    for (const item of targets as GraphEvent['target'][]) {
      this.onMovingEntitiesMap[item.get('id')] = false;
      if (item.isDestroyed()) {
        // 边界case：拖拽过程中部分节点被删除 （协同场景）
        continue;
      }
      this.addBBox(item.getBBox());
    }
  }

  onMoving(ev: GraphEvent & { batch?: boolean; targets: GraphEvent['target'][] }) {
    // 可能出现拖太快remove和add时的bbox已经不一致的情况，所以这里先统一存在来一起执行。
    // 操作过快或协同操作场景下，可能出现拖拽中有节点被删除的边界case。
    // FIXME: 考虑协同场景远比目前所考虑的复杂，暂时先解决操作过快误操作导致的边界case。
    if (!this.toBeRemoved) {
      // 拖拽过程中被删除。
      return;
    }
    this.removeBBox(this.toBeRemoved);
    this.toBeRemoved = [];
    for (const target of ev.targets) {
      const bbox = target.getBBox();
      this.addBBox(bbox);
      this.toBeRemoved.push(bbox);
    }
  }

  resetMap(bbox: { left: number; top: number; width: number; height: number }, step?: number) {
    if (step) {
      this.gridData.step = step;
    }
    const { left, top, width, height } = bbox;
    this.gridData.left = left;
    this.gridData.top = top;
    this.gridData.rows = Math.ceil(height / this.gridData.step);
    this.gridData.cols = Math.ceil(width / this.gridData.step);
    this.gridData.grid = [];
    const { rows, cols } = this.gridData;
    for (let i = 0; i < rows; i++) {
      const row = new Uint16Array(cols);
      this.gridData.grid.push(row);
    }
  }

  refresh(alignGrid = false) {
    const nodes = this.graph.getNodes();
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (const node of nodes) {
      if (this.shouldIgnoreNode(node)) {
        continue;
      }
      const bbox = node.getBBox();
      left = Math.min(left, bbox.left);
      top = Math.min(top, bbox.top);
      right = Math.max(right, bbox.left + bbox.width);
      bottom = Math.max(bottom, bbox.top + bbox.height);
    }

    const groups = this.graph.getGroups();
    const step = this.gridData.step;

    for (const group of groups) {
      // 收起状态并且linkGroupOnCollapse=True的情况下可以把Group当作Node来看
      if (this.shouldIgnoreGroup(group)) {
        continue;
      }
      const bbox = group.getBBox();
      left = Math.min(left, bbox.left);
      top = Math.min(top, bbox.top);
      right = Math.max(right, bbox.left + bbox.width);
      bottom = Math.max(bottom, bbox.top + bbox.height);
    }

    left = left === Infinity ? 0 : left;
    right = right === -Infinity ? 0 : right;
    top = top === Infinity ? 0 : top;
    bottom = bottom === -Infinity ? 0 : bottom;
    // 避免空 graph Infinity 导致崩溃

    left -= BORDERS * step;
    top -= BORDERS * step;
    right += BORDERS * step;
    bottom += BORDERS * step;

    // left 和 top 取整，避免其他组件需要频繁考虑吸附在网格中心
    // 这里是 0.5 step 而不是完全取整是因为，应该对齐网格中心而不是网格边缘（便于路由的连线对齐）
    left = Math.floor(left / step - 0.5) * step + 0.5 * step;
    top = Math.floor(top / step - 0.5) * step + 0.5 * step;

    // 宽松边界。
    this.resetMap({
      left,
      top,
      width: right - left,
      height: bottom - top,
    });
    if (alignGrid) {
      // 将节点中心对齐到网格中心。
      // 对齐有以下两个好处
      // 1. router 端点得以对齐
      // 2. 拖拽节点整网格吸附
      for (const node of nodes) {
        const { x, y } = node.configs;
        node.configs.x = Math.round((x - left) / step - 0.5) * step + 0.5 * step + left;
        node.configs.y = Math.round((y - top) / step - 0.5) * step + 0.5 * step + top;
      }
    }
    for (const node of nodes) {
      const bbox = node.getBBox();
      if (this.shouldIgnoreNode(node)) {
        continue;
      }
      this.addBBox(bbox);
    }
    for (const group of groups) {
      this.updateGroupBBox(group, 'add');
    }
  }

  shouldIgnoreEntity(entity: Entity) {
    if (entity.type === 'edge' || entity.type === 'group') {
      return true;
    }
    return this.shouldIgnoreNode(entity as Node);
  }

  shouldIgnoreGroup(group: Group) {
    return !group.get('collapsed') || group.get('ignoreGrid') || !group.isVisible();
  }

  shouldIgnoreNode(node: Node) {
    return node.get('ignoreGrid') || !node.isVisible();
  }

  getMap() {
    return this.gridData.grid;
  }

  getStep() {
    return this.gridData.step;
  }

  addBBox(bbox: BBox) {
    const { left, top, width, height } = bbox;
    const { step, cols, rows } = this.gridData;
    let startCol = Math.floor((left - this.gridData.left - this.options.extraWidth) / step);
    let endCol = Math.ceil((left + width - this.gridData.left + this.options.extraWidth) / step);
    let startRow = Math.floor((top - this.gridData.top - this.options.extraWidth) / step);
    let endRow = Math.ceil((top + height - this.gridData.top + this.options.extraWidth) / step);
    if (startCol < BORDERS || startRow < BORDERS || endCol > cols - BORDERS || endRow > rows - BORDERS) {
      this.expandedGrid(startCol, endCol, startRow, endRow);
      startCol = Math.floor((left - this.gridData.left - this.options.extraWidth) / step);
      endCol = Math.ceil((left + width - this.gridData.left + this.options.extraWidth) / step);
      startRow = Math.floor((top - this.gridData.top - this.options.extraWidth) / step);
      endRow = Math.ceil((top + height - this.gridData.top + this.options.extraWidth) / step);
    }
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        if (this.gridData.grid[row][col] >= 65535) {
          console.error(`GridData numeric overflow in [${col}, ${row}]`);
        } else {
          this.gridData.grid[row][col] += 1;
        }
      }
    }
  }

  removeBBox(bboxes: BBox[]) {
    for (const bbox of bboxes) {
      const { left, top, width, height } = bbox;
      const { step } = this.gridData;
      const startCol = Math.floor((left - this.gridData.left - this.options.extraWidth) / step);
      const endCol = Math.ceil((left + width - this.gridData.left + this.options.extraWidth) / step);
      const startRow = Math.floor((top - this.gridData.top - this.options.extraWidth) / step);
      const endRow = Math.ceil((top + height - this.gridData.top + this.options.extraWidth) / step);
      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          if (this.gridData.grid[row][col] > 0) {
            this.gridData.grid[row][col] -= 1;
          } else {
            console.error(`GridData numeric underflow in [${col}, ${row}]`);
          }
        }
      }
    }
  }

  expandedGrid(startCol: number, endCol: number, startRow: number, endRow: number) {
    let offsetX = 0;
    let offsetY = 0;
    const { cols, rows, step, left, top } = this.gridData;
    let newRows = rows;
    let newCols = cols;
    if (startCol < BORDERS) {
      const additionalCols = Math.max(Math.ceil(0.5 * cols), Math.ceil(-startCol) + BORDERS);
      offsetX = additionalCols;
      newCols += additionalCols;
      this.gridData.left = left - additionalCols * step;
    }
    if (endCol > cols - BORDERS) {
      newCols += Math.max(Math.ceil(0.5 * cols), Math.ceil(endCol - cols + BORDERS));
    }
    if (startRow < BORDERS) {
      const additionalRows = Math.max(Math.ceil(0.5 * rows), Math.ceil(-startRow) + BORDERS);
      offsetY = additionalRows;
      newRows += additionalRows;
      this.gridData.top = top - additionalRows * step;
    }
    if (endRow > rows - BORDERS) {
      newRows += Math.max(Math.ceil(0.5 * rows), Math.ceil(endRow - rows + BORDERS));
    }
    this.migrateGrid(offsetX, offsetY, newRows, newCols);
  }

  migrateGrid(offsetX: number, offsetY: number, newRows: number, newCols: number) {
    const newGrid = [];
    const oldGrid = this.gridData.grid;
    for (let i = 0; i < newRows; i++) {
      const row = new Uint16Array(newCols);
      newGrid.push(row);
    }
    for (let i = offsetY; i < newRows; i++) {
      if (oldGrid[i - offsetY]) {
        newGrid[i].set(oldGrid[i - offsetY], offsetX);
      }
    }
    this.gridData.cols = newCols;
    this.gridData.rows = newRows;
    this.gridData.grid = newGrid;
  }

  isWalkable(col: number, row: number) {
    if (col < 0 || col >= this.gridData.cols || row < 0 || row >= this.gridData.rows) {
      return false;
    }
    return this.gridData.grid[row][col] === 0;
  }
  surroundingWalkableByCoord(x: number, y: number) {
    const { left, top, step } = this.gridData;
    const extraWidth = this.options.extraWidth || 0;
    const pos = [x, y];
    const col = Math.floor((x - left) / step);
    const row = Math.floor((y - top) / step);
    const conditions = [];
    if (this.isWalkable(col, row) && this.isSuitableTerminal(pos[0], pos[1])) {
      return { pos, col, row };
    } else {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const xSign = [
            [-1, 1],
            [0, 0],
          ][i][j];
          const ySign = [
            [0, 0],
            [-1, 1],
          ][i][j];
          if (
            this.isWalkable(col + xSign, row + ySign) &&
            this.isSuitableTerminal(pos[0] + xSign * step, pos[1] + ySign * step)
          ) {
            conditions.push({
              pos: [pos[0] + xSign * step, pos[1] + ySign * step],
              col: col + xSign,
              row: row + ySign,
            });
          }
        }
      }
      if (extraWidth !== 0) {
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const xSign = [-2, 2][j] * [1, 0][i];
            const ySign = [-2, 2][j] * [0, 1][i];
            if (
              this.isWalkable(col + xSign, row + ySign) &&
              this.isSuitableTerminal(pos[0] + xSign * step, pos[1] + ySign * step)
            ) {
              conditions.push({
                pos: [pos[0] + xSign * step, pos[1] + ySign * step],
                col: col + xSign,
                row: row + ySign,
              });
            }
          }
        }
      }
      if (conditions.length) {
        const { left, top, step } = this.gridData;
        const distance = (a: { col: number; row: number }) =>
          (left + (a.col + 0.5) * step - x) ** 2 + (top + (a.row + 0.5) * step - y) ** 2;
        return conditions.sort((a, b) => distance(a) - distance(b))[0];
      }
    }
    return null;
  }

  // TODO： 后续考虑把相关逻辑迁移到router上？
  directionWalkableWithMinDist(x: number, y: number, minDist = 20) {
    const [col, row] = this.getIndexByCoord(x, y);

    const [leftCol] = this.getIndexByCoord(x - minDist, y);
    const [rightCol] = this.getIndexByCoord(x + minDist, y);
    const [, topRow] = this.getIndexByCoord(x, y - minDist);
    const [, bottomRow] = this.getIndexByCoord(x, y + minDist);
    const conditions = [];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const useCol = [
          [leftCol, rightCol],
          [col, col],
        ][i][j];
        const useRow = [
          [row, row],
          [topRow, bottomRow],
        ][i][j];
        const xSign = [
          [-1, 1],
          [0, 0],
        ][i][j];
        const ySign = [
          [0, 0],
          [-1, 1],
        ][i][j];
        if (this.isWalkable(useCol, useRow) && this.isSuitableTerminal(x + xSign * minDist, y + ySign * minDist)) {
          const condition = {
            pos: [x + xSign * minDist, y + ySign * minDist],
            direction: [
              ['L', 'R'],
              ['T', 'B'],
            ][i][j],
            col: useCol,
            row: useRow,
          };
          let certain = true;
          const [colWithExtra, rowWithExtra] = this.getIndexByCoord(
            x + xSign * this.options.extraWidth,
            y + ySign * this.options.extraWidth
          );
          certain = certain && this.isWalkable(colWithExtra + xSign, rowWithExtra + ySign);
          certain = certain && this.isWalkable(colWithExtra + xSign + [0, 1][i], rowWithExtra + ySign + [1, 0][i]);
          certain = certain && this.isWalkable(colWithExtra + xSign + [0, -1][i], rowWithExtra + ySign + [-1, 0][i]);
          if (certain) {
            return condition;
          } else {
            conditions.push(condition);
          }
        }
      }
    }

    // 节点太小的情况，选最近的可行网格点
    if (conditions.length) {
      const { left, top, step } = this.gridData;
      const distance = (a: { col: number; row: number }) =>
        (left + (a.col + 0.5) * step - x) ** 2 + (top + (a.row + 0.5) * step - y) ** 2;
      return conditions.sort((a, b) => distance(a) - distance(b))[0];
    }

    // 降级方案
    return this.surroundingWalkableByCoord(x, y);
  }

  isSuitableTerminal(x: number, y: number) {
    // 贴边的 Terminal 不是合适的 Terminal
    const eps = 0.1;
    let [col, row] = this.getIndexByCoord(x, y);
    if (!this.isWalkable(col, row)) {
      return false;
    }
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const xSign = [-1, 1][j] * [1, 0][i];
        const ySign = [-1, 1][j] * [0, 1][i];
        [col, row] = this.getIndexByCoord(x + eps * xSign, y + eps * ySign);
        if (!this.isWalkable(col, row)) {
          return false;
        }
      }
    }
    return true;
  }

  directionWalkableByCoord(x: number, y: number, direction: 'L' | 'R' | 'T' | 'B') {
    const { left, top, step, grid, cols, rows } = this.gridData;
    const extraWidth = this.options.extraWidth || 0;
    const pos = [x, y];
    let col = Math.floor((x - left) / step);
    let row = Math.floor((y - top) / step);
    if (direction === 'L') {
      if (col > 0 && !grid[row][col - 1]) {
        pos[0] -= step;
        col -= 1;
      } else if (extraWidth !== 0) {
        if (col * step === x - left) {
          if (row > 2 && !grid[row][col - 2]) {
            pos[0] -= 2 * step;
            col -= 2;
          }
        }
      } else {
        return;
      }
    } else if (direction === 'R') {
      if (col < cols - 1 && !grid[row][col + 1]) {
        pos[0] += step;
        col += 1;
      } else {
        return;
      }
    } else if (direction === 'T') {
      if (row > 0 && !grid[row - 1][col]) {
        pos[1] -= step;
        row -= 1;
      } else if (extraWidth !== 0) {
        if (row * step === y - top) {
          if (col > 2 && !grid[row - 2][col]) {
            pos[1] -= 2 * step;
            row -= 2;
          }
        }
      } else {
        return;
      }
    } else if (direction === 'B') {
      if (row < rows - 1 && !grid[row + 1][col]) {
        pos[1] += step;
        row += 1;
      } else {
        return;
      }
    }
    return { pos, col, row };
  }
  getIndexByCoord(x: number, y: number) {
    const { left, top, step } = this.gridData;
    const col = Math.floor((x - left) / step);
    const row = Math.floor((y - top) / step);
    return [col, row];
  }

  getValueByCoord(x: number, y: number) {
    const { left, top, step } = this.gridData;
    const col = Math.floor((x - left) / step);
    const row = Math.floor((y - top) / step);
    return this.gridData.grid[row][col];
  }

  onGroupBBoxStart({ target }: { target: Group }) {
    this.updateGroupBBox(target, 'remove');
  }

  onGroupBBoxEnd({ target }: { target: Group }) {
    this.updateGroupBBox(target, 'add');
  }

  updateGroupBBox(group: Group, type: 'add' | 'remove') {
    const { ignoreGroupTitle } = this.options;
    if (ignoreGroupTitle || group.get('ignoreGrid') || !group.isVisible()) {
      return;
    }
    if (group.get('collapsed')) {
      this.processGroupBBox(group.getBBox(), type);
      return;
    }
    if (!ignoreGroupTitle) {
      const bbox = group.titleLayer ? group.titleLayer.getBBox() : null;
      if (bbox) {
        this.processGroupBBox(bbox, type);
      }
    }
  }

  processGroupBBox(bbox: BBox, type: 'add' | 'remove') {
    if (bbox.width === 0 || bbox.height === 0) {
      return;
    }
    if (type === 'add') {
      this.addBBox(bbox);
    } else if (type === 'remove') {
      this.removeBBox([bbox]);
    }
  }

  beforeDestroy() {
    this.gridData.grid = [];
    this.gridData.cols = 0;
    this.gridData.rows = 0;
    this.gridData.left = 0;
    this.gridData.top = 0;
  }
}
