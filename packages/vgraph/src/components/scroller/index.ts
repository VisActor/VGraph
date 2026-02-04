import { Graph, TreeGraph } from "../../graph";
import { applyCss, insertStyles, throttle } from "../../utils";
import { GRAPH_EVENTS } from "../../consts/meta_events";
import { ComponentBase } from "../base";
import { panZoom, dragCanvas } from "../../behaviors";

export type ScrollerOptions = {
  /**
   * The size of the scroller.
   * 滚动条尺寸
   */
  size?: number;
  /**
   * The display of the scroller.
   * 滚动条展示形式。
   */
  show?: "always" | "hover";
  /**
   * The configures of the behavior dragCanvas.
   * 拖拽画布的交互配置
   */
  dragCanvas?: Record<string, unknown> | boolean;
  /**
   * The configures of the behavior dragCanvas.
   * 平移缩放画布的交互配置
   */
  panZoom?: Record<string, unknown> | boolean;
};

export class Scroller extends ComponentBase {
  xScroller: HTMLDivElement;
  xSlider: HTMLDivElement;
  yScroller: HTMLDivElement;
  ySlider: HTMLDivElement;
  _mousemove: () => void;
  _bbox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  timer: ReturnType<typeof setTimeout> | null = null;
  temps: {
    current: number;
    offset: number;
    max: number;
    size: number;
    orient: "x" | "y";
  } | null = null;

  constructor(graph: Graph | TreeGraph, options?: ScrollerOptions) {
    super(graph, options);
    insertStyles(`
    .vgraph-scroller {
      position:absolute;
      z-index:10;
      overflow:hidden;
    }
    `);
    this.xScroller = document.createElement("div");
    this.xSlider = document.createElement("div");
    this.xScroller.append(this.xSlider);
    this.yScroller = document.createElement("div");
    this.ySlider = document.createElement("div");
    this.yScroller.append(this.ySlider);
    this.initScroller();
    const mousemove = throttle((e: MouseEvent) => {
      this.onMouseMove(e);
    }, 20);
    this._mousemove = mousemove;
    document.body.addEventListener("mousemove", mousemove);
    this._bbox = this.getBBox();
    this.changeSize();
    if (graph.getBehavior("panZoom")) {
      graph.removeBehavior("panZoom");
    }
    if (graph.getBehavior("dragCanvas")) {
      graph.removeBehavior("dragCanvas");
    }
    const defaultOptions = {
      limit: true,
    };
    if (this.options.panZoom) {
      graph.addBehavior(
        panZoom,
        typeof this.options.panZoom === "object"
          ? Object.assign(this.options.panZoom, defaultOptions)
          : defaultOptions
      );
    }
    if (this.options.dragCanvas) {
      graph.addBehavior(
        dragCanvas,
        typeof this.options.dragCanvas === "object"
          ? Object.assign(this.options.dragCanvas, defaultOptions)
          : defaultOptions
      );
    }

    if (this.options.show !== "always") {
      this.hideScroller();
    }
  }

  getEvents() {
    return {
      transformed: "transformed",
      change: "onChange",
      refreshed: "onChange",
      changesize: "changeSize",
    };
  }

  getGlobalEvents() {
    return {
      mouseup: "onMouseUp",
    };
  }

  initScroller() {
    const container = this.graph.get("container");
    const { xScroller, yScroller, xSlider, ySlider } = this;
    const size = this.options.size;
    container.appendChild(xScroller);
    container.appendChild(yScroller);
    xScroller.classList.add("vgraph-scroller");
    applyCss(xScroller, {
      left: "0px",
      right: "0px",
      bottom: "4px",
      height: `${size}px`,
    });

    xSlider.classList.add("vgraph-slider");
    applyCss(xSlider, {
      position: "absolute",
      height: `${size}px`,
      background: "rgba(0, 0, 0,0.3)",
      borderRadius: `${size}px`,
    });

    yScroller.classList.add("vgraph-scroller");
    applyCss(yScroller, {
      top: "0px",
      bottom: "0px",
      right: "2px",
      width: `${size}px`,
    });

    ySlider.classList.add("vgraph-slider");
    applyCss(ySlider, {
      position: "absolute",
      width: `${size}px`,
      background: "rgba(0, 0, 0,0.3)",
      borderRadius: `${size}px`,
    });
    if (this.options.show === "always") {
      return;
    }
    xScroller.addEventListener("mouseenter", () => {
      this.showScroller();
    });
    xScroller.addEventListener("mouseleave", () => {
      this.hideScroller();
    });
    yScroller.addEventListener("mouseenter", () => {
      this.showScroller();
    });
    yScroller.addEventListener("mouseleave", () => {
      this.hideScroller();
    });
    xScroller.addEventListener("mousedown", (e) => {
      this.onMouseDown(e, "x");
    });
    yScroller.addEventListener("mousedown", (e) => {
      this.onMouseDown(e, "y");
    });
  }

  onChange(e: { type: string }) {
    if (e?.type !== GRAPH_EVENTS.LAYOUT_END) {
      this._bbox = this.getBBox();
      this.transformed();
    }
  }

  getBBox() {
    return this.graph.getGraphBBox();
  }

  transformed() {
    if (!this._enable) {
      return;
    }
    this.showScroller();
    const { graph, xScroller, yScroller, xSlider, ySlider } = this;
    const { width, height } = graph.getGraphSize();
    const bbox = this._bbox!;
    const leftTop = graph.viewportToCanvas(0, 0);
    const rightBottom = graph.viewportToCanvas(width, height);
    const vWidth = rightBottom.x - leftTop.x;
    const vHeight = rightBottom.y - leftTop.y;
    if (Math.round(vWidth) >= Math.round(bbox.width)) {
      xScroller.style.display = "none";
    } else {
      xScroller.style.display = "block";
      const left = ((leftTop.x - bbox.left) / bbox.width) * width;
      xSlider.style.left = `${left}px`;
      xSlider.style.width = `${(vWidth / bbox.width) * width}px`;
      if (this.temps?.orient === "x") {
        this.temps.offset = left;
      }
    }
    if (Math.round(vHeight) >= Math.round(bbox.height)) {
      yScroller.style.display = "none";
    } else {
      yScroller.style.display = "block";
      const top = ((leftTop.y - bbox.top) / bbox.height) * height;
      ySlider.style.top = `${top}px`;
      ySlider.style.height = `${(vHeight / bbox.height) * height}px`;
      if (this.temps?.orient === "y") {
        this.temps.offset = top;
      }
    }
    this.hideScroller();
  }

  changeSize() {
    const { xScroller, yScroller, graph } = this;
    const { width, height } = graph.getGraphSize();
    xScroller.style.width = `${width}px`;
    yScroller.style.height = `${height}px`;
    this.transformed();
  }

  showScroller() {
    const { xScroller, yScroller } = this;
    this.clearTimer();
    xScroller.style.opacity = "1";
    yScroller.style.opacity = "1";
  }

  hideScroller() {
    const { xScroller, yScroller } = this;
    this.clearTimer();
    this.timer = setTimeout(() => {
      xScroller.style.opacity = "0";
      yScroller.style.opacity = "0";
    }, 1000);
  }

  enable() {
    this._enable = true;
    this.xScroller.style.display = "block";
    this.yScroller.style.display = "block";
    this.transformed();
  }

  disable() {
    this._enable = false;
    this.xScroller.style.display = "none";
    this.yScroller.style.display = "none";
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  onMouseDown(e: MouseEvent, orient: "x" | "y") {
    this.temps = {
      current: orient === "x" ? e.clientX : e.clientY,
      offset:
        orient === "x"
          ? parseFloat(this.xSlider.style.left)
          : parseFloat(this.ySlider.style.top),
      max: orient === "x" ? this.graph.get("width") : this.graph.get("height"),
      size:
        orient === "x"
          ? parseFloat(this.xSlider.style.width)
          : parseFloat(this.ySlider.style.height),
      orient,
    };
  }

  onMouseMove(e: MouseEvent) {
    const temps = this.temps;
    if (!temps) {
      return;
    }
    const { clientX, clientY } = e;
    const { current, offset, max, orient, size } = temps;
    const zoomRatio = this.graph.getZoomRatio();
    const yRatio = this._bbox.height / this.graph.get("height");
    const xRatio = this._bbox.width / this.graph.get("width");
    let diff = current - (orient === "x" ? clientX : clientY);
    if (offset - diff < 0) {
      diff = offset;
    } else if (offset - diff + size > max) {
      diff = offset + size - max;
    }
    if (diff === 0) {
      return;
    }
    if (orient === "x") {
      this.graph.translate(diff * xRatio * zoomRatio, 0);
    } else {
      this.graph.translate(0, diff * yRatio * zoomRatio);
    }
    temps.current = current - diff;
  }

  onMouseUp(e: MouseEvent) {
    this.temps = null;
    if (!(e.target as HTMLElement)?.classList.contains("vgraph-slider")) {
      this.hideScroller();
    }
  }

  getDefaultOptions() {
    return {
      size: 10,
      show: "hover",
      panZoom: true,
      dragCanvas: true,
    };
  }
  beforeDestroy() {
    this.clearTimer();
    this.xScroller.remove();
    this.yScroller.remove();
    document.body.removeEventListener("mousemove", this._mousemove);
  }
}
