import React, { ReactNode } from "react";
import {
  Graph,
  TreeGraph,
  Node,
  GRAPH_EVENTS,
  AnchorConfigs,
  ShapeBase,
  BBox,
  Layer,
  throttle,
  Group,
  Shape,
  IntersectUtil,
  GraphEvent,
} from "@visactor/vgraph";
import { createPortal } from "react-dom";
import { proxyNodeEvents, proxyGroupTitleEvents } from "./proxy_event";
import "./index.less";

export interface ViewerProps {
  /**
   * The graph instance.
   * 图实例。
   */
  graph: Graph | TreeGraph;
  /**
   * Whether to enable local rendering.
   * 是否开启局部渲染，默认为 `true`。
   */
  localRendering?: boolean;
  /**
   * Monitor changes in node size, which is used for single node size change.
   * 是否监听节点大小变化,用于单个节点大小变化。
   */
  responsiveNode?: boolean;
  /**
   * Adaptively adjust node size, which is used for batch changes in node size.
   * 自适应节点大小，用于批量节点大小变化。
   */
  adjustNodeSize?: boolean;
  /**
   * Customize the node content.
   * 自定义节点内容。
   */
  setNode: (node: Node) => ReactNode | string;
  /**
   * Customize the content of group title.
   * 自定义分组标题内容。
   */
  setGroupTitle?: (group: Group) => ReactNode | string;
  /**
   * Customize the class name of node container.
   * 自定义节点外部容器类名。
   */
  setNodeClassName?: (node: Node) => string | string[];
  /**
   * Customize anchor contents.
   * 自定义锚点内容。
   */
  setAnchor?: (node: Node, anchor: AnchorConfigs) => ReactNode;
  /**
   * Customize the class name of anchor container.
   * 自定义锚点外部容器类名。
   */
  setAnchorClassName?: (node: Node, anchor: AnchorConfigs) => string | string[];
  /**
   * Customize the thumbnail display style when the graph is zoomed to a certain ratio.
   * 在图缩放到一定比例时自定义缩略显示样式。
   */
  hideDetails?: {
    /**
     * The maximum ratio to enable thumbnail display.
     * 缩略显示的最大比例。
     */
    ratio: number;
    /**
     * Customize the thumbnail display style.
     * 自定义缩略样式。
     */
    getNodeStyles?: (node: Node) => Record<string, any>;
  };
  /**
   * Callback when a node's size changes, can be used with `responsiveNode`.
   * 当单个节点大小发生变化的回调，与 `responsiveNode` 配合使用。
   */
  onResizeNode?: (node: Node, bbox: BBox) => void;
  /**
   * Callback when the size of batch nodes changes, can be used with `adjustNodeSize`.
   * 当批量节点大小发生变化的回调，与 `adjustNodeSize` 配合使用。
   */
  onNodeDefaultSizeChanged?: (nodes: Node[]) => void;
}

type ReactAnchorConfigs = {
  node: Node;
  index: number;
  configs: AnchorConfigs;
  position: number[];
};

interface ViewerState {
  showNodes: Node[];
  showGroups: Group[];
  matrix: number[];
  width: number;
  height: number;
  showDetails: boolean;
  showAnchors: Record<string, ReactAnchorConfigs[]>;
}

export class Viewer extends React.Component<ViewerProps, ViewerState> {
  id: string;
  observer: ResizeObserver | null;
  // 当前视窗中的节点 refs
  nodes: any;
  constructor(props: ViewerProps) {
    super(props);
    this.state = {
      showNodes: [],
      matrix: [1, 0, 0, 1, 0, 0],
      width: props.graph.get("width"),
      height: props.graph.get("height"),
      showDetails: true,
      showAnchors: {},
      showGroups: [],
    };
    this.id = uuid(10);
    this.nodes = React.createRef();
    this.nodes.current = {};

    if (!props.responsiveNode) {
      this.observer = null;
      return;
    }
    if (!window.ResizeObserver) {
      console.warn("ResizeObserver is not supported");
      this.observer = null;
      return;
    }
    this.observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const graph = this.props.graph;
      if (
        !graph.entityMap ||
        (this.props.hideDetails &&
          graph.getZoomRatio() <= this.props.hideDetails.ratio)
      ) {
        // graph destroyed
        return;
      }
      let changed = false;
      requestAnimationFrame(() => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-id");
          const { width, height, x, y } = entry.contentRect;
          const node = graph.getNodeById(id!);
          if (!node || node.isDestroyed()) {
            continue;
          }
          if (
            isMathEqual(width, node.get("width")) &&
            isMathEqual(height, node.get("height"))
          ) {
            continue;
          }
          changed = true;
          const left = x - node.get("width") / 2;
          const top = y - node.get("height") / 2;
          // 自定义 resize 后节点如何变化
          if (this.props.onResizeNode) {
            this.props.onResizeNode?.(node, { left, top, width, height });
          } else {
            // 默认顶对齐更新容器大小和位置
            graph.update(node, {
              width,
              height,
              x: node.get("x") + left + width / 2,
              y: node.get("y") + top + height / 2,
            });
          }
        }
        if (changed) {
          this.refresh(true);
        }
      });
    });
  }

  componentDidMount() {
    this.init();
    this.refresh();
  }

  componentWillUnmount() {
    this.observer?.disconnect();
    this.observer = null;
  }

  componentDidUpdate(prevProps: ViewerProps) {
    if (prevProps.graph !== this.props.graph) {
      this.init();
      this.refresh();
    }
  }

  init() {
    const { graph, hideDetails } = this.props;
    graph.disableAutoDraw();
    this.setState({
      matrix: graph.getMatrix(),
      showDetails: hideDetails
        ? graph.getZoomRatio() > hideDetails.ratio
        : true,
      width: graph.get("width"),
      height: graph.get("height"),
    });
    const panZoom = graph.getBehavior("panZoom");
    if (panZoom) {
      document.querySelector(`#${this.id}`)?.addEventListener(
        "wheel",
        (e) => {
          panZoom.onWheel(e);
        },
        { passive: false }
      );
    }

    graph.on(GRAPH_EVENTS.DATA_END, () => {
      this.nodes.current = {};
    });

    graph.on(GRAPH_EVENTS.UPDATE_END, ({ target }: { target: any }) => {
      if (target?.type === "node") {
        delete this.nodes.current[target?.get("id")];
      }
    });

    graph.on(GRAPH_EVENTS.ANIMATION_FRAME, () => {
      this.refresh(true);
    });

    graph.on(
      GRAPH_EVENTS.TRANSFORMED,
      throttle(() => {
        this.refreshViewport();
      }, 16)
    );
    const throttledRefresh = throttle(() => {
      this.refresh(true);
    }, 16);
    graph.on(GRAPH_EVENTS.MOVE_START, (e: any) => {
      e.targets.forEach((target: Node) => {
        target.set("moving", true);
      });
      graph.set("autoDraw", true);
    });
    graph.on(GRAPH_EVENTS.MOVING, throttledRefresh);
    graph.on(GRAPH_EVENTS.MOVE_END, (e: any) => {
      e.targets.forEach((target: Node) => {
        delete target.configs.moving;
      });
      graph.set("autoDraw", false);
      this.refresh(true);
    });

    graph.on(GRAPH_EVENTS.CHANGE_SIZE, () => {
      this.updateSize();
    });

    graph.on(GRAPH_EVENTS.CHANGE, throttledRefresh);
    graph.on(GRAPH_EVENTS.STATE_END, (e: GraphEvent) => {
      if (!e.target || Array.isArray(e.target) || e.target.type === "node") {
        throttledRefresh();
      } else {
        graph.getCanvas().instantDraw();
      }
    });
    graph.on(GRAPH_EVENTS.VISIBILITY_END, throttledRefresh);
    graph.on(GRAPH_EVENTS.BATCH_STATE_END, throttledRefresh);
    graph.on(GRAPH_EVENTS.CHANGE_ANCHOR, throttledRefresh);
    graph.on(GRAPH_EVENTS.CHANGE_ANCHOR_END, () => {
      this.refresh(true);
    });
    graph.on("node:mouseenter", (e: GraphEvent) => {
      this.onNodeMouseEnter(e);
    });
    graph.on("node:mouseleave", (e: GraphEvent) => {
      this.onNodeMouseLeave(e);
    });
  }

  refreshViewport() {
    const { graph, hideDetails, localRendering } = this.props;
    this.setState(
      {
        matrix: graph.getMatrix(),
        showDetails: hideDetails
          ? graph.getZoomRatio() > hideDetails.ratio
          : true,
      },
      () => {
        graph.getCanvas().instantDraw();
      }
    );
    if (localRendering !== false) {
      this.refresh();
    }
  }

  getGroups(viewportBBox: BBox) {
    const groups: Group[] = [];
    const graph = this.props.graph;
    if (!this.props.setGroupTitle) {
      return groups;
    }
    const localRendering = this.props.localRendering;
    const groupContainer = graph.getGroupContainer();
    function getGroupInView(layer: Layer) {
      const group = graph.getGroupById(layer.get("id"));
      if (!group || group.isDestroyed() || !group.get("titleSize")) {
        return;
      }
      const bbox = group.getTitleBBox();
      if (
        localRendering === false ||
        IntersectUtil.isRectIntersect(bbox, viewportBBox)
      ) {
        group.set("__titleBBox", bbox);
        groups.push(group);
      }
      if (group.get("collapsed")) {
        return;
      }
      layer.children.forEach((layer: Layer | Shape) => {
        if (layer.type === "group" && layer.get("id")) {
          getGroupInView(layer as Layer);
        }
      });
    }
    groupContainer.children.forEach((layer: Layer | Shape) => {
      getGroupInView(layer as Layer);
    });

    return groups;
  }

  getAnchors(nodes: Node[]) {
    const anchors: Record<string, ReactAnchorConfigs[]> = {};
    if (!this.props.setAnchor) {
      return anchors;
    }
    nodes.forEach((node: Node) => {
      if (!node.isVisible()) {
        return;
      }
      const nodeAnchors = node.get("anchors") ?? [];
      const positions = node.getAnchorRelativePositions();
      const showAnchors: ReactAnchorConfigs[] = [];
      nodeAnchors.forEach((anchor: any, index: number) => {
        if (anchor?.visible === false) {
          return;
        }
        showAnchors.push({
          node,
          index,
          configs: anchor,
          position: positions[index],
        });
      });
      anchors[node.get("id")] = showAnchors;
    });
    return anchors;
  }

  refresh(forced = false) {
    const graph = this.props.graph;
    if (!graph.entityMap) {
      // graph destroyed
      return;
    }
    const leftTop = graph.viewportToCanvas(0, 0);
    const rightBottom = graph.viewportToCanvas(
      graph.get("width"),
      graph.get("height")
    );
    const bbox = {
      left: leftTop.x,
      top: leftTop.y,
      width: rightBottom.x - leftTop.x,
      height: rightBottom.y - leftTop.y,
    };
    const showNodes: Node[] = [];
    graph.getNodeContainer().children.forEach((layer: Layer | ShapeBase) => {
      const node = graph.getNodeById(layer.get("id"));
      if (!node?.isVisible()) {
        return;
      }
      if (this.props.localRendering === false) {
        showNodes.push(node);
      } else {
        if (IntersectUtil.isRectIntersect(node.getBBox(), bbox)) {
          showNodes.push(node);
        }
      }
    });
    if (!forced && this.isArrayEqual(showNodes, this.state.showNodes)) {
      const groups = this.getGroups(bbox);
      if (!this.isArrayEqual(groups, this.state.showGroups)) {
        this.setState({ showGroups: groups });
      }
      return;
    }
    this.setState(
      {
        showNodes,
        showAnchors: this.getAnchors(showNodes),
        showGroups: this.getGroups(bbox),
      },
      () => {
        graph.getCanvas().instantDraw();
        const ratio = graph.getZoomRatio();
        const currentMap = this.nodes.current;
        if (this.observer) {
          this.observer.disconnect();
          document
            .querySelectorAll(".vgraph-viewer-container")
            .forEach((container: Element) => {
              this.observer!.observe(container);
            });
        }
        if (!this.props.adjustNodeSize) {
          return;
        }
        const changedNodes: Node[] = [];
        Object.keys(currentMap).forEach((id: string) => {
          if (!currentMap[id]) {
            return;
          }
          // 当节点首次渲染的时候，更新节点宽高，避免多次触发 onResizeNode。
          // onResizeNode 更多是用于响应由于 css 动画，内容更新等原因造成的容器尺寸变化。
          const bbox = currentMap[id].getBoundingClientRect();
          const currentWidth = bbox.width / ratio;
          const currentHeight = bbox.height / ratio;
          const node = graph.getNodeById(id);
          // 如果真实 dom 尺寸与节点实例中不同，则更新节点宽高，
          if (
            !isMathEqual(node.get("width"), currentWidth) ||
            !isMathEqual(node.get("height"), currentHeight)
          ) {
            node.set("width", currentWidth);
            node.set("height", currentHeight);
            changedNodes.push(node);
          }
          currentMap[id] = false;
        });
        if (changedNodes.length) {
          this.props.onNodeDefaultSizeChanged?.(changedNodes);
          this.setState({
            showNodes,
            showAnchors: this.getAnchors(showNodes),
          });
        }
      }
    );
  }

  onNodeMouseEnter(e: GraphEvent) {
    const { showNodes } = this.state;
    const node = e.target as Node;
    if (node.get("disableAnchorEvent") || node.get("disableNodeEvent")) {
      return;
    }
    const nodeAnchors = node.get("anchors");
    let draw = false;
    if (nodeAnchors && !node.get("disableAnchors")) {
      nodeAnchors.forEach((anchor: any, i: number) => {
        if (anchor?.show === "hover") {
          draw = true;
          anchor.visible = true;
        }
      });
    }
    if (draw) {
      this.setState({ showAnchors: this.getAnchors(showNodes) });
    }
  }

  onNodeMouseLeave(e: GraphEvent) {
    const { showNodes } = this.state;
    const node = e.target as Node;
    if (node.get("disableAnchorEvent") || node.get("disableNodeEvent")) {
      return;
    }
    const nodeAnchors = node.get("anchors");
    let draw = false;
    if (nodeAnchors && !node.get("disableAnchors")) {
      nodeAnchors.forEach((anchor: any, i: number) => {
        if (anchor?.show === "hover") {
          draw = true;
          anchor.visible = false;
        }
      });
    }
    if (draw) {
      this.setState({ showAnchors: this.getAnchors(showNodes) });
    }
  }

  isArrayEqual(current: Node[] | Group[], former: Node[] | Group[]) {
    const length = current.length;
    if (length !== former.length) {
      return false;
    }
    let match = true;
    for (let i = 0; i < length; i++) {
      if (current[i].get("id") !== former[i].get("id")) {
        match = false;
        break;
      }
    }
    return match;
  }

  updateSize() {
    const graph = this.props.graph;
    this.setState({
      width: graph.get("width"),
      height: graph.get("height"),
    });
    this.refresh(true);
  }

  render() {
    const {
      graph,
      hideDetails,
      setNodeClassName,
      setAnchorClassName,
      adjustNodeSize,
      setGroupTitle,
    } = this.props;
    const { showNodes, showGroups, matrix, showDetails, showAnchors } =
      this.state;
    const container = graph.get("container");
    if (!graph) {
      return null;
    }
    const nodes = showNodes.map((node: Node) => {
      const { width, height, x, y, id } = node.configs;
      let styles = {
        width,
        height,
        left: x - width / 2,
        top: y - height / 2,
        cursor: node.configs.moving ? "grabbing" : "default",
      };
      let content = null;
      if (showDetails) {
        content = this.props.setNode(node);
      } else {
        if (hideDetails?.getNodeStyles) {
          styles = {
            ...hideDetails.getNodeStyles(node),
            ...styles,
          };
        }
      }
      let classNames: any = [];
      if (setNodeClassName) {
        classNames = setNodeClassName(node);
        if (!Array.isArray(classNames)) {
          classNames = [classNames];
        }
      }

      classNames.unshift("vgraph-viewer-node");
      const layer = node.layer;
      const showNodeAnchors = showAnchors[id];
      let anchorContents: any = [];
      if (showNodeAnchors) {
        anchorContents = showNodeAnchors.map(
          (anchorConfigs: ReactAnchorConfigs) => {
            const size = anchorConfigs.configs.size ?? 8;
            const offsets = anchorConfigs.configs.offsets || [0, 0];
            const styles = {
              width: size,
              height: size,
              left:
                anchorConfigs.position[0] - size / 2 + width / 2 + offsets[0],
              top:
                anchorConfigs.position[1] - size / 2 + height / 2 + offsets[1],
            };
            let anchorContent = null;
            anchorContent = this.props.setAnchor?.(node, anchorConfigs.configs);
            if (!anchorContent) {
              return null;
            }
            let classNames: any = [];
            if (setAnchorClassName) {
              classNames = setAnchorClassName(node, anchorConfigs.configs);
              if (!Array.isArray(classNames)) {
                classNames = [classNames];
              }
            }
            classNames.unshift("vgraph-viewer-anchor");
            return (
              <div
                anchorindex={anchorConfigs.index}
                key={"anchor" + node.get("id") + "_" + anchorConfigs.index}
                {...proxyNodeEvents("anchor", graph, node)}
                className={classNames.join(" ")}
                style={styles}
              >
                {anchorContent}
              </div>
            );
          }
        );
      }
      return (
        <div
          key={id}
          {...proxyNodeEvents("node", graph, node)}
          className={classNames.join(" ")}
          style={{
            ...styles,
            pointerEvents: layer.capture ? "all" : "none",
          }}
        >
          <div
            className="vgraph-viewer-container"
            style={this.props.responsiveNode ? { display: "inline-block" } : {}}
            data-id={node.get("id")}
            ref={(ref: any) => {
              if (adjustNodeSize && this.nodes.current[id] !== false) {
                this.nodes.current[id] = ref;
              }
            }}
          >
            {content}
          </div>
          {anchorContents}
        </div>
      );
    });

    const groups = showGroups.map((group: Group) => {
      const bbox = group.get("__titleBBox");
      const lineWidth = group.get("strokeStyle")
        ? group.get("lineWidth") / 2 || 0.5
        : 0;
      return (
        <div
          key={group.get("id")}
          {...proxyGroupTitleEvents(graph, group)}
          style={{
            left: bbox.left,
            top: bbox.top,
            width: bbox.width + lineWidth,
            height: bbox.height + lineWidth,
            pointerEvents: group.layer.capture ? "all" : "none",
          }}
          className="vgraph-viewer-group-title"
        >
          {setGroupTitle!(group)}
        </div>
      );
    });
    const styles = {
      width: this.state.width,
      height: this.state.height,
    };

    return createPortal(
      <div className="vgraph-viewer" style={styles} id={this.id}>
        <div
          className="vgraph-viewer-viewport"
          style={{ transform: `matrix(${matrix.join(",")})`, ...styles }}
        >
          {groups}
          {nodes}
        </div>
      </div>,
      container
    );
  }
}

function uuid(length: number) {
  // id 作为 selector 不能为数字
  const keys = "abcdefghijklmnopqrstuvwxyz".split("");
  let uuid = "";
  for (let i = 0; i < length; i++) {
    uuid += keys[Math.round(Math.random() * 26)];
  }
  return uuid;
}

function isMathEqual(a: number, b: number) {
  return Math.abs(a - b) < 1;
}
