import React from "react";
import {
  Canvas,
  Layer,
  Path,
  GraphStructure,
  Cubic,
  NodeStructure,
} from "@visactor/vgraph";
import EdgeTooltip from "./EdgeTooltip";
import Group from "./Group";
import "./index.less";
import {
  getPath,
  getCurvePoints,
  layoutData,
  mergeOptions,
  uuid,
} from "./layout";
import { IDataOptions } from "./types";

const TABLE_HEIGHT = 40;

type IProps = {
  data: GraphStructure;
  options: IDataOptions;
  size: number[];
  minDepth?: number;
  maxDepth?: number;
  details?: string[];
};

type IState = {
  width: number;
  graphOptions: any;
  groupData: any;
  showData: any;
  tooltipData: any;
  highlightTables: string[];
};

export default class DataLineageGraph extends React.Component<IProps, IState> {
  canvas: any;
  id: string;
  hoverPath: any;
  scrollDepth: any = null;
  scrollOffset: number = 0;
  search: boolean = false;
  path: any = null;
  clickedEdgeId: any = null;

  constructor(props: IProps) {
    super(props);
    this.state = {
      graphOptions: null,
      groupData: null,
      width: 0,
      tooltipData: null,
      highlightTables: [],
      showData: null,
    };
    this.canvas = null;
    this.id = uuid(10);
  }

  componentDidMount() {
    const dom: any = document.querySelector(`#${this.id}`);
    if (dom) {
      const canvas = new Canvas({
        container: dom,
        width: dom.offsetWidth,
        height: dom.offsetHeight - 32,
      });
      const viewport = new Layer();
      const edgeLayer = new Layer();
      const highlightLayer = new Layer();
      const hoverPathLayer = new Layer();
      const highlightPathLayer = new Layer();
      highlightLayer.add(highlightPathLayer);
      highlightLayer.add(hoverPathLayer);
      viewport.add(edgeLayer);
      viewport.add(highlightLayer);
      canvas.add(viewport);
      canvas.set("hoverPathLayer", hoverPathLayer); // 在某些情况下，可能会有没触发 mouseleave 又触发 mouseenter 导致累积多个 hoverPath。
      canvas.set("highlightPathLayer", highlightPathLayer); // 所以这里将 hoverPathLayer 和 highlightPathLayer 区分开。便于让 hoverPathLayer 仅存在一个 hoverPath。
      canvas.setViewportContainer(viewport);
      const graphOptions = mergeOptions(this.props.options);
      const { onClickEdge, getEdgeStyles } = graphOptions;
      this.canvas = canvas;
      if (window) {
        (window as any)._canvas = canvas;
      }
      canvas.get("container").style.marginTop = "32px";
      canvas.on("click", (e) => {
        const shape = e.target;
        if (shape === canvas) {
          this.clearHighlights();
        } else if (
          (shape.type === "path" || shape.type === "cubic") &&
          onClickEdge
        ) {
          if (this.path) {
            const { source, target } = this.path.configs;
            const styles = getEdgeStyles(source, target);
            this.path.set(styles);
          }
          this.path = shape;
          shape.set({ strokeStyle: "#F5B508", lineWidth: 3 });
          this.clickedEdgeId = e.target.configs.id;
          onClickEdge(e.target.configs);
          canvas.draw();
        }
      });
      if (graphOptions.search) {
        this.search = true;
      }
      this.updateData(!this.search);
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const data = this.props.data;
    if (!data || !data.getNodeMap()) {
      return;
    }
    const size = this.props.size;
    const sizeUpdated =
      prevProps.size[0] !== size[0] || prevProps.size[1] !== size[1];
    if (sizeUpdated) {
      this.canvas.changeSize(size[0], size[1]);
    }
    if (!prevProps || !prevProps.data) {
      this.updateData();
    } else if (prevProps.data.entityMap !== this.props.data.entityMap) {
      this.updateData();
    } else if (
      prevProps.options.baseTableId !== this.props.options.baseTableId
    ) {
      this.updateData();
    } else if (
      prevProps.data.getNodeMap()[prevProps.options.baseTableId] !==
      this.props.data.getNodeMap()[this.props.options.baseTableId]
    ) {
      this.updateData();
    } else if (
      prevProps.options.filter !== this.props.options.filter ||
      prevProps.options.getGroupData !== this.props.options.getGroupData
    ) {
      this.updateData(sizeUpdated);
    } else if (
      prevProps.options.tableHeight !== this.props.options.tableHeight
    ) {
      this.updateData(sizeUpdated);
    } else if (prevProps.options.search !== this.props.options.search) {
      this.search = true;
      this.clearHighlightTables();
      this.updateData(sizeUpdated);
    } else if (
      prevProps.options.getTableContent !== this.props.options.getTableContent
    ) {
      this.updateData(sizeUpdated);
    } else if (sizeUpdated) {
      this.updateShowData();
      this.toCenter();
    }
    if (sizeUpdated) {
      // 这里如果 data 和 size 同时变了。如果下面单独再次执行updateShowData会导致groupData不是最新的但data是最新的从而导致报错。
      this.canvas.draw();
    }
  }

  componentWillUnmount(): void {
    this.canvas.destroy();
    this.canvas = null;
  }

  // 初始化/重置数据
  updateData(toCenter: boolean = true) {
    const data = this.props.data;
    if (!data) {
      return;
    }
    // 1.x 中展示相关的数据是 node.depth，node.filter, node.search。
    // 2.x 中 depth 变成了 node.configs.depth。为了保持统一，将数据中的 depth 写回。
    if (data.getNodes()[0].get("depth") !== undefined) {
      data.getNodes().forEach((node: NodeStructure) => {
        node.depth = node.get("depth");
      });
    }
    this.clearHighlightTables();
    const graphOptions = mergeOptions(this.props.options);
    const groupMap = data.entityMap.group;
    if (
      !graphOptions.baseTableId ||
      (!data.getNodeMap()[graphOptions.baseTableId] &&
        !(groupMap && Object.keys(groupMap).length > 0)) ||
      (groupMap &&
        Object.keys(groupMap).length > 0 &&
        !groupMap[graphOptions.baseTableId])
    ) {
      return;
    }
    const { groupData, width } = layoutData(
      data,
      graphOptions,
      this.props.minDepth,
      this.props.maxDepth
    );

    this.setState(
      {
        graphOptions,
        groupData,
        width,
      },
      () => {
        this.updateShowData();
        if (toCenter) {
          this.toCenter();
        } else {
          this.canvas.draw();
        }
      }
    );
  }

  toCenter(forced?: boolean) {
    const width = this.state.width;
    const container: any = document.querySelector(`#${this.id}`);
    const canvas = this.canvas;
    // 如果目前显示的上下游没达到最大宽度，居中展示
    if (width < container.offsetWidth) {
      const offset = (container.offsetWidth - width) / 2;
      canvas.children[0].matrix = [1, 0, 0, 1, offset, 0];
      canvas.draw();
    } else {
      // 从整体居中变成了主节点居中，更好兼容单侧展开的场景
      const { x, width } = this.state.groupData[0];
      let offset = x + width / 2 - container.offsetWidth / 2;
      const scroller: any = container.parentNode.querySelector(
        ".data-lineage-container-scroll"
      );
      if (offset < 0) {
        offset = 0;
      }
      if (scroller.scrollLeft === offset) {
        const matrix = canvas.children[0].getMatrix();
        matrix[4] = -offset;
        canvas.children[0].matrix = matrix;
        canvas.draw();
      } else {
        scroller.scrollTo(offset, 0);
      }
    }
  }

  updateShowData() {
    const groupData = this.state.groupData;
    // fix 无数据 resize 时报错
    if (!groupData) {
      return;
    }
    if (this.search && this.props.options.search) {
      this.locateSearchedTable();
      return;
    }
    const showData = this.getShowData(groupData);
    this.setState({ showData });
    this.updateEdgePositions(showData);
  }

  getShowData(groupData: any) {
    const showData: any = {
      0: [this.props.options.baseTableId],
    };

    Object.keys(groupData).forEach((depth: string) => {
      if (depth !== "0") {
        showData[depth] = this.updateShowGroupData(groupData[depth]);
      } else {
        showData[depth] = groupData[depth].children;
      }
    });
    return showData;
  }

  updateShowGroupData(group: any) {
    const { size, data } = this.props;
    const { tableHeight } = this.state.graphOptions;
    const minHeight = Math.max(group.scroll - tableHeight * 3, 0);
    const maxHeight = group.scroll + size[1] + tableHeight * 3;
    const children = [];
    for (let i = 0; i < group.children.length; i++) {
      const child = data.getNodeById(group.children[i]);
      if (child.y >= minHeight && child.y + tableHeight <= maxHeight) {
        children.push(child.get("id"));
      }
    }
    return children;
  }

  updateEdgePositions(showData: any) {
    const canvas = this.canvas;
    const data = this.props.data;
    const graphOptions = this.state.graphOptions;
    const edgeLayer = canvas.children[0].children[0];
    const hoverPathLayer = canvas.get("hoverPathLayer");
    let drawTables: string[] = [];
    Object.values(showData).forEach((ids: any) => {
      drawTables = drawTables.concat(ids);
    });
    edgeLayer.clear();
    data.getEdges().forEach((edge: any) => {
      const { source, target } = edge.configs;
      if (!drawTables.includes(source) || !drawTables.includes(target)) {
        return;
      }
      const sourceTable = data.getNodeById(source);
      const targetTable = data.getNodeById(target);
      const startBox = this.getTableBox(sourceTable);
      const endBox = this.getTableBox(targetTable);
      if (!startBox || !endBox) {
        return;
      }
      const styles = graphOptions.getEdgeStyles(source, target);
      let path: any;
      if (startBox.left <= endBox.left) {
        const p = getPath(startBox, endBox, sourceTable, targetTable);
        path = new Path({
          path: p,
          endArrow: sourceTable.depth === targetTable.depth,
          ...styles,
          hitWidth: 6,
          ...edge.configs,
        });
      } else {
        const points = getCurvePoints(
          startBox,
          endBox,
          this.state.graphOptions.groupGap * 3
        );
        path = new Cubic({
          points,
          ...styles,
          hitWidth: 6,
          ...edge.configs,
        });
      }

      if (this.clickedEdgeId && edge.id === this.clickedEdgeId) {
        path.set({ strokeStyle: "#F5B508", lineWidth: 3 });
        this.path = path;
      }

      graphOptions.highlightEdge &&
        path.on("mouseenter", (e: any) => {
          this.showEdgeTooltip(e);
          const hoverPath = path.clone();
          hoverPath.capture = false;
          hoverPath.set({ strokeStyle: "#F5B508", lineWidth: 3 });
          this.hoverPath = hoverPath;
          hoverPathLayer.clear(); // hoverPath 应该只存在一个，因此对hoverPathLayer先进行清空。
          hoverPathLayer.add(hoverPath);
          canvas.draw();
        });
      graphOptions.highlightEdge &&
        path.on("mousemove", (e: any) => {
          if (this.state.tooltipData) {
            this.showEdgeTooltip(e);
          }
        });
      graphOptions.highlightEdge &&
        path.on("mouseleave", () => {
          if (this.hoverPath) {
            hoverPathLayer.clear();
            this.hoverPath = null;
            this.canvas.draw();
          }
          this.setState({ tooltipData: null });
        });
      edgeLayer.add(path);
    });
  }

  // 点击 table 事件 handler
  clickTableHandler(tableData: any, group: any) {
    const options = this.state.graphOptions;
    this.showEdges(tableData, group);
    if (options.onClickTable) {
      options.onClickTable(tableData.configs, group);
    }
  }

  // 获取表所在盒模型
  getTableBox(tableData: any) {
    const groupData = this.state.groupData;
    if (!this.state.groupData) {
      return;
    }
    if (tableData.depth !== undefined) {
      const group = groupData[tableData.depth];
      return {
        left: group.x,
        top: tableData.y - group.scroll,
        width: group.width,
        height: this.props.options.tableHeight
          ? this.props.options.tableHeight
          : TABLE_HEIGHT,
      };
    }
  }

  // 显示目标表到主表的链路
  showEdges(tableData: any, group: any, ignoreClear = false) {
    const canvas = this.canvas;
    if (!ignoreClear) {
      this.clearHighlightTables();
    }
    tableData.primary = true;
    tableData.highlight = true;
    const tableId = tableData.get("id");
    const highlightMode = this.state.graphOptions.highlightMode;
    if (group.depth === 0) {
      this.setState({ highlightTables: [tableId] });
      return;
    }
    const bbox = this.getTableBox(tableData);

    let highlightTables: string[] = [];

    if (highlightMode === "MAIN") {
      if (group.depth < 0) {
        highlightTables = this.connectChildren(tableData, bbox, [tableId]);
      } else {
        highlightTables = this.connectParents(tableData, bbox, [tableId]);
      }
    } else {
      highlightTables = this.connectChildren(tableData, bbox, [tableId]);
      highlightTables = highlightTables.concat(
        this.connectParents(tableData, bbox, [tableId])
      );
    }

    this.setState({ highlightTables });
    canvas.draw();
  }

  // 向后查找
  connectParents(tableData: any, bbox: any, route: string[]): string[] {
    if (!bbox) {
      return route;
    }
    const { data, options } = this.props;
    const canvas = this.canvas;
    const layer = canvas.get("highlightPathLayer");
    const id = tableData.get("id");
    if (
      tableData.sources &&
      id !== options.baseTableId &&
      tableData.groupId !== options.baseTableId &&
      tableData.get("groupId") !== options.baseTableId
    ) {
      tableData.sources.forEach((parent: string) => {
        const parentData = data.getNodeById(parent);
        if (parentData.filtered) {
          return route;
        }
        const parentBox = this.getTableBox(parentData);
        if (!parentBox) {
          return route;
        }
        parentData.highlight = true;
        const path = this.createPath(parent, id);
        layer.add(path);
        if (route.includes(parent)) {
          return route;
        }
        route.push(parent);
        if (parent !== id) {
          return this.connectParents(parentData, parentBox, route);
        }
      });
    }
    return route;
  }

  // 向前追溯
  connectChildren(tableData: any, bbox: any, route: string[]): string[] {
    if (!bbox) {
      return route;
    }
    const { data, options } = this.props;
    const canvas = this.canvas;
    const layer = canvas.get("highlightPathLayer");
    const id = tableData.get("id");
    if (
      tableData.targets &&
      id !== options.baseTableId &&
      tableData.groupId !== options.baseTableId &&
      tableData.get("groupId") !== options.baseTableId
    ) {
      tableData.targets.forEach((child: string) => {
        const childData = data.getNodeById(child);
        if (childData.filtered) {
          return route;
        }
        const childBox = this.getTableBox(childData);
        if (!childBox) {
          return route;
        }
        childData.highlight = true;
        const path = this.createPath(id, child);
        layer.add(path);
        if (route.includes(child)) {
          return route;
        }
        route.push(child);
        if (child !== id) {
          return this.connectChildren(childData, childBox, route);
        }
      });
    }
    return route;
  }

  // 生成高亮链路
  createPath(sourceId: string, targetId: string) {
    const data = this.props.data;
    const source = data.getNodeById(sourceId);
    const target = data.getNodeById(targetId);
    const startBox: any = this.getTableBox(source);
    const endBox: any = this.getTableBox(target);
    let path: any;
    const styles = this.state.graphOptions.getEdgeHighlightStyles(
      sourceId,
      targetId
    );
    if (startBox.left <= endBox.left) {
      const p = getPath(startBox, endBox, source, target);
      path = new Path({
        source: sourceId,
        target: targetId,
        path: p,
        ...styles,
      });
      if (source.depth === target.depth) {
        path.set({ endArrow: true });
      }
    } else {
      const points = getCurvePoints(
        startBox,
        endBox,
        this.state.graphOptions.groupGap * 3
      );
      path = new Cubic({ points, ...styles });
    }
    path.capture = false;
    return path;
  }

  // 列滚动时刷新视图
  onScrollGroup(group: any) {
    const showData = this.state.showData;
    const hoverPathLayer = this.canvas.get("hoverPathLayer");
    const highlightPathLayer = this.canvas.get("highlightPathLayer");
    const highlightEdges = highlightPathLayer.children.concat(
      hoverPathLayer.children
    );
    const tableIds = group.children;
    if (
      this.scrollDepth === group.depth &&
      Math.abs(this.scrollOffset - group.scroll) >= 5
    ) {
      showData[group.depth] = this.updateShowGroupData(group);
      this.setState({ showData });
      this.scrollOffset = group.scroll;
    } else {
      this.scrollDepth = group.depth;
      this.scrollOffset = group.scroll;
    }
    // console.time();
    this.updateEdgePositions(showData);
    this.updateEdges(highlightEdges, tableIds);
    // console.timeEnd();
    this.canvas.draw();
  }

  locateSearchedTable() {
    const { groupData } = this.state;
    const canvas = this.canvas;
    const matrix = canvas.children[0].getMatrix();

    const hoverPathLayer = canvas.get("hoverPathLayer");
    const highlightPathLayer = canvas.get("highlightPathLayer");
    const highlightEdges = highlightPathLayer.children.concat(
      hoverPathLayer.children
    );
    const group: any = Object.values(groupData).find(
      (group: any) => group.searched
    );
    if (!groupData) {
      return;
    }
    // 垂直方向上滚动
    if (!group) {
      if (this.state?.graphOptions?.onEmptySearch) {
        this.state?.graphOptions?.onEmptySearch();
      }
      return;
    }
    let showData = this.state.showData;
    if (!showData) {
      showData = this.getShowData(groupData);
    }
    group.scroll = Math.max(
      Math.min(group.searched.y, group.height - this.props.size[1] + 32),
      0
    );
    showData[group.depth] = this.updateShowGroupData(group);
    this.setState({ showData }, () => {
      if (this.search && group.searched) {
        const groupDom = document.getElementById(`${this.id}-${group.id}`);
        if (groupDom) {
          groupDom.scrollTop = group.scroll;
        }
        this.search = false;
        this.showEdges(group.searched, group, true);
      }
    });
    this.updateEdgePositions(showData);
    this.updateEdges(highlightEdges, group.children);
    // 水平方向上滚动
    const width = this.props.size[0];
    if (matrix[4] + group.x < 0) {
      const container: any = document.querySelector(`#${this.id}`)?.nextSibling;
      container.scrollLeft = group.x;
      matrix[4] = -group.x;
    } else if (matrix[4] + group.x + group.width > width) {
      const container: any = document.querySelector(`#${this.id}`)?.nextSibling;
      container.scrollLeft = group.x + group.width - width;
      matrix[4] = -container.scrollLeft;
    }
    this.canvas.draw();
  }

  clearHighlights() {
    const getEdgeStyles = this.state.graphOptions.getEdgeStyles;
    this.clickedEdgeId = null;
    this.clearHighlightTables();
    if (this.path) {
      const { source, target } = this.path.configs;
      const styles = getEdgeStyles(source, target);
      this.path.set(styles);
    }
    this.state.graphOptions.onClearHighlight?.();
    this.canvas.draw();
  }

  // 批量更新连线位置
  updateEdges(edges: Path[], affectedIds: string[]) {
    const data = this.props.data;
    edges.forEach((edge: Path) => {
      const { source, target } = edge.configs;
      if (affectedIds.includes(source) || affectedIds.includes(target)) {
        const sourceData = data.getNodeById(source);
        const targetData = data.getNodeById(target);
        const startBox = this.getTableBox(sourceData);
        const endBox = this.getTableBox(targetData);
        if (startBox?.left <= endBox?.left) {
          const path = getPath(startBox, endBox, sourceData, targetData);
          edge.set("path", path);
        } else {
          const points = getCurvePoints(
            startBox,
            endBox,
            this.state.graphOptions.groupGap * 3
          );
          edge.set("points", points);
        }
      }
    });
  }

  // 图滚动时刷新视图
  onScrollGraph(e: any) {
    if (e.target.classList.contains("data-lineage-container-scroll")) {
      const width = this.state.width;
      const container: any = document.querySelector(`#${this.id}`);
      // 如果没有滚动条
      if (width < container.offsetWidth) {
        return;
      }
      const canvas = this.canvas;
      const matrix = canvas.children[0].getMatrix();
      matrix[4] = -e.target.scrollLeft;
      canvas.children[0].matrix = matrix;
      canvas.draw();
    }
  }
  triggerCanvasEvent(e: any, clearOnBlank?: boolean) {
    const target = e.target;
    if (target.classList.contains("data-lineage-container-inner")) {
      this.canvas.eventManager.handleEvent(e.nativeEvent);
      return;
    }
    if (clearOnBlank) {
      this.clearHighlights();
    }
  }
  showEdgeTooltip(e: any) {
    if (!this.props.options.getTaskTooltipContent) {
      return;
    }
    const data = this.props.data;
    const point = this.canvas.clientToCanvas(e.clientX, e.clientY);
    const pixelRatio = this.canvas.get("pixelRatio");
    const tasks = e.target.get("tasks");

    this.setState({
      tooltipData: {
        point: {
          x: point.x / pixelRatio + 2,
          y: point.y / pixelRatio + 30,
        },
        source: e.target.get("source"),
        target: e.target.get("target"),
        path: e.target,
        edges:
          tasks && typeof tasks[0] === "string"
            ? tasks.map((taskId: string) => data.getNodeById(taskId).configs)
            : tasks,
      },
    });
  }

  clearHighlightTables() {
    const data = this.props.data;
    // 清除高亮状态
    this.state.highlightTables.forEach((id: string) => {
      const table = data.getNodeById(id);
      if (!table) {
        return;
      }
      delete table.highlight;
      delete table.primary;
    });
    this.setState({ highlightTables: [] });
    // 清除搜索状态
    if (this.props.options.search && this.state.groupData) {
      const group: any = Object.values(this.state.groupData).find(
        (group: any) => group.searched
      );
      if (group) {
        group.searched.set("search", false);
        group.searched = false;
        if (!this.search) {
          this.updateShowData();
        }
      }
    }
    this.canvas.get("hoverPathLayer").clear();
    this.canvas.get("highlightPathLayer").clear();
  }

  render() {
    const data = this.props.data;
    const { groupData, width, graphOptions, highlightTables, showData } =
      this.state;
    let groups;
    if (groupData && showData) {
      groups = Object.keys(groupData).map((depth: string) => {
        const group = groupData[depth];
        return (
          <Group
            key={group.id}
            id={`${this.id}-${group.id}`}
            data={data}
            group={group}
            showData={showData[depth]}
            options={graphOptions}
            highlightTables={highlightTables}
            onClickTable={this.clickTableHandler.bind(this)}
            onScrollGroup={this.onScrollGroup.bind(this)}
            details={this.props.details}
          />
        );
      });
    }
    return (
      <div className="data-lineage-container">
        <div className="data-lineage-canvas-container" id={this.id}></div>
        <div
          className="data-lineage-container-scroll"
          onScroll={this.onScrollGraph.bind(this)}
          onMouseMove={this.triggerCanvasEvent.bind(this)}
          onClick={(e: any) => {
            graphOptions.resetOnClickBlank && this.triggerCanvasEvent(e, true);
          }}
        >
          <div className="data-lineage-container-inner" style={{ width }}>
            {groups}
          </div>
        </div>
        <EdgeTooltip
          data={this.state.tooltipData}
          getTaskTooltipContent={
            graphOptions ? graphOptions.getTaskTooltipContent : undefined
          }
        />
      </div>
    );
  }
}
