import { Graph, TreeGraph } from "../../graph";
import { Circle, Shape, ShapeBase } from "../../renderer";
import { Node, Edge } from "../../models/entities";
import { ShapeEvent } from "../../typings/event";
import { throttle } from "../../utils";

import { ComponentBase } from "../base";
import { Fisheye } from "./fisheye";

export type FisheyeOptions = {
  /**
   * The distortion ratio.
   * 鱼眼效果，默认为 `3`
   */
  distortion?: number;
  /**
   * The fish eye radius.
   * 鱼眼作用半径
   */
  r?: number;
  /**
   * The visible fish eye radius.
   * 鱼眼可见半径
   */
  inEyeR?: number;
  /**
   * Whether to show label of entities in the eye area.
   * 是否展示鱼眼区域中实例的文本标签
   */
  showLabel?: "node" | "edge" | "both" | "none" | null | undefined;
  /**
   * Whether to add state to nodes in eye area.
   * 是否给节点附额外状态
   */
  isSetState?: boolean;
  /**
   * Whether to scale node in eye area.
   * 是否放大鱼眼中的节点
   */
  isScaling?: boolean;
  /**
   * Styles of background shape of the eye area.
   * 辅助显示鱼眼可见范围的背景图形
   */
  bkgShape?: boolean | Shape | Record<string, unknown>;
  /**
   * The system fish eye is applied.
   * 鱼眼作用在 graph 上还是 canvas 上
   */
  coordinateSystem?: "graph" | "canvas";
  /**
   * A function that will be called when a node is in the eye area.
   * 节点进入鱼眼范围的回调函数
   */
  inEye?: (node: Node) => void;
  /**
   * A function that will be called when a node is out of the eye area.
   * 节点离开鱼眼范围的回调函数
   */
  outEye?: (node: Node) => void;
};

export class FisheyePlugin extends ComponentBase {
  fisheye: any;
  inEye: (node: Node) => void = () => {};
  outEye: (node: Node) => void = () => {};
  isEnable = true;
  shape: Shape | null = null;
  constructor(graph: Graph | TreeGraph, options?: FisheyeOptions) {
    super(graph, options);
    const { distortion, r, inEyeR, showLabel, inEye, outEye, bkgShape } =
      this.options;
    this.fisheye = Fisheye({
      distortion,
      r,
      inEyeRadius: inEyeR,
    });

    if (showLabel && showLabel !== "none") {
      if (inEye === undefined && outEye === undefined) {
        this.inEye = (node: Node) => {
          if (showLabel === "node" || showLabel === "both") {
            const label: Shape = node.getLabel();
            label?.set("opacity", 1);
            node.toFront();
          }
          if (showLabel === "edge" || showLabel === "both") {
            node.edges.forEach((edge: Edge) => {
              const edgeLabel = edge.getLabel();
              edgeLabel.set("opacity", 1);
              edge.toFront();
            });
          }
        };
        this.outEye = (node: Node) => {
          if (showLabel === "node" || showLabel === "both") {
            const label: Shape = node.getLabel();
            label?.set("opacity", 0);
          }
          if (showLabel === "edge" || showLabel === "both") {
            node.edges.forEach((edge: Edge) => {
              if (edge?.source?.configs?.fisheye?.inFisheye) {
                return;
              }
              if (edge?.target?.configs?.fisheye?.inFisheye) {
                return;
              }
              const edgeLabel = edge.getLabel();
              edgeLabel.set("opacity", 0);
            });
          }
        };
      } else {
        console.info(
          "Set custom inEye and outEye, so highlightMethod is ignored."
        );
        this.inEye = inEye || (() => {});
        this.outEye = inEye || (() => {});
      }
    }
    if (bkgShape) {
      this.initBkgShape();
    }
  }

  initBkgShape() {
    const bkgShape = this.options.bkgShape;
    let shape: Shape;
    const shapeConfigs = {
      cx: 0,
      cy: 0,
      r: 0,
      fillStyle: "#AAA",
      opacity: 0.2,
    };
    if (bkgShape instanceof ShapeBase) {
      shape = bkgShape;
    } else {
      shape = new Circle(
        bkgShape === true ? shapeConfigs : Object.assign(shapeConfigs, bkgShape)
      );
    }
    shape.capture = false;
    this.graph.getContainer().add(shape);
    this.shape = shape;
  }

  // canvas
  onTransformed() {
    if (
      this.shape &&
      this.fisheye !== undefined &&
      this.isEnable &&
      this.options.coordinateSystem === "canvas"
    ) {
      const matrix = this.graph.getMatrix();
      // const domRect = dom.getBoundingClientRect();
      this.fisheye.setInEyeRadius(this.options.inEyeR! / matrix[0]);
      this.fisheye.setRadius(this.options.r! / matrix[0]);
      if (this.shape) {
        this.shape.set("r", this.fisheye.getInEyeRadius());
      }
      const nodes = this.graph.getNodes();
      // fisheye
      this.fisheye.applyNodes(nodes, this.inEye, this.outEye); // apply fisheye
      this.refreshNodes(
        nodes,
        this.options.isSetState ?? true,
        this.options.isScaling ?? false
      ); // 刷新节点渲染属性
      this.graph.refresh();
      if (!this.graph.get("autoDraw")) {
        this.graph.draw();
      }
    }
  }

  throttleOnMove: (clientX: number, clientY: number) => void = throttle(
    (clientX: number, clientY: number) => {
      this.onMove(clientX, clientY);
    },
    10
  );

  onMouseMove(ev: ShapeEvent) {
    const clientX = ev.clientX;
    const clientY = ev.clientY;
    this.throttleOnMove(clientX, clientY);
  }
  onMove: (clientX: number, clientY: number) => void = (
    clientX: number,
    clientY: number
  ) => {
    if (!this.isEnable) {
      return;
    }
    const domRect = this.graph.getCanvasDom().getBoundingClientRect();
    const matrix = this.graph.getMatrix();
    const x = (clientX - domRect.x - matrix[4]) / matrix[0];
    const y = (clientY - domRect.y - matrix[5]) / matrix[3];
    if (this.options.coordinateSystem === "canvas") {
      // 如果是canvas坐标系，则需要转换在fisheye在graph坐标系的半径
      // fisheye操作都是在graph坐标系操作的，所以需要转换
      this.fisheye.setInEyeRadius(this.options.inEyeR! / matrix[0]);
      this.fisheye.setRadius(this.options.r! / matrix[0]);
    }
    if (this.shape) {
      this.shape.translate(
        x - this.shape.getMatrix()[4],
        y - this.shape.getMatrix()[5]
      );
      this.shape.set("r", this.fisheye.getInEyeRadius());
    }
    this.fisheye.setFocus(x, y);
    this.apply();
  };

  apply() {
    const nodes = this.graph.getNodes();
    // fisheye
    this.fisheye.applyNodes(nodes, this.inEye, this.outEye); // apply fisheye

    this.refreshNodes(
      nodes,
      this.options.isSetState ?? true,
      this.options.isScaling ?? false
    ); // 刷新节点渲染属性
    this.graph.refresh();
    if (!this.graph.get("autoDraw")) {
      this.graph.draw();
    }
  }
  refreshNodes = (nodes: Node[], setState = true, scaling = false) => {
    const autoDraw = this.graph.get("autoDraw");
    this.graph.set("autoDraw", false);
    nodes.forEach((node: Node) => {
      const fisheyeConfig = node.configs.fisheye;
      if (setState) {
        if (fisheyeConfig.inFisheye) {
          node.removeState("outEye");
          node.setState("inEye");
        } else {
          node.removeState("inEye");
          node.setState("outEye");
        }
      }
      if (node.layer !== undefined) {
        const layer = node.getLayer();
        const layerMatrix = layer.getMatrix();
        if (scaling) {
          layerMatrix[0] = fisheyeConfig.z;
          layerMatrix[3] = fisheyeConfig.z;
        }
        layerMatrix[4] = fisheyeConfig.x;
        layerMatrix[5] = fisheyeConfig.y;
        layer.setMatrix(layerMatrix);
      }
    });
    this.graph.set("autoDraw", autoDraw);
  };
  enable() {
    this.isEnable = true;
    if (this.shape) {
      this.shape?.set("opacity", 0.2);
      this.graph.refresh();
      if (!this.graph.get("autoDraw")) {
        this.graph.draw();
      }
    }
  }
  stop() {
    this.isEnable = false; // Stop 意味着暂停鱼眼交互，但是会保留当前鱼眼状态。
  }

  clear() {
    const nodes = this.graph.getNodes();
    nodes.forEach((node: Node) => {
      const fisheyeConfig = node.configs.fisheye;
      fisheyeConfig && (fisheyeConfig.inFisheye = false);
      fisheyeConfig && (fisheyeConfig.outFisheye = false);
      if (this.outEye) {
        this.outEye(node);
      }
      node.removeState("inEye");
      node.removeState("outEye");
      if (node.layer !== undefined) {
        const layer = node.getLayer();
        const layerMatrix = layer.getMatrix();
        layerMatrix[0] = 1;
        layerMatrix[3] = 1;
        layerMatrix[4] = node.configs.x;
        layerMatrix[5] = node.configs.y;
        layer.setMatrix(layerMatrix);
      }
    });
  }
  disable() {
    this.isEnable = false;
    if (this.shape) {
      this.shape?.set("opacity", 0);
      this.clear();
      this.graph.refresh();
      if (!this.graph.get("autoDraw")) {
        this.graph.draw();
      }
    }
  }
  getEvents() {
    if (this.options.coordinateSystem === "canvas") {
      return {
        mousemove: "onMouseMove",
        transformed: "onTransformed",
      };
    }
    return {
      mousemove: "onMouseMove",
    };
  }

  updateOption(k: string, v: unknown) {
    this.options[k] = v;
    switch (k) {
      case "bkgShape":
        this.shape?.destroy();
        this.shape = null;
        v && this.initBkgShape();
        break;
      case "distortion":
        this.fisheye.setDistortion(v);
        this.apply();
        break;
      case "r":
        this.fisheye.setRadius(v);
        this.apply();
        break;
      case "inEyeR":
        this.fisheye.setInEyeRadius(v);
        this.apply();
        break;
      default:
        break;
    }
  }

  getDefaultOptions() {
    return {
      distortion: 3,
      r: 200,
      inEyeR: 120,
      bkgShape: true,
      showLabel: "node",
      coordinateSystem: "graph",
      isSetState: false,
      isScaling: false,
    };
  }

  beforeDestroy() {
    this.disable();
    if (this.shape) {
      this.shape.destroy();
    }
  }
}
