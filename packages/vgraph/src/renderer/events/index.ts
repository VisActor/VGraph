import { ShapeBase } from "../shape";
import canvasHandler from "./canvas_handler";
import LAYER_TYPES from "../../consts/layer_types";
import { LayerBase } from "../layers/base";

const EVENTS = [
  "dblclick",
  "mouseover",
  "mouseout",
  "mousedown",
  "mouseup",
  "mousemove",
  "contextmenu",
  "touchstart",
  "touchmove",
  "touchend",
  "touchcancel",
];

export default class EventManager {
  canvas: any;
  dom: HTMLCanvasElement;
  eventHandler: any;
  preShape: ShapeBase | null = null;
  prePos: { x: number; y: number } | null = null;
  preMouseDown: ShapeBase | null = null;
  enterPath: ShapeBase[] = [];
  timeout: any = null;

  constructor(canvas: any) {
    this.canvas = canvas;
    this.dom = this.canvas.painter.getDomNode();
    this.eventHandler = new canvasHandler(canvas);
    this.registerEvents();
  }

  registerEvents() {
    const dom = this.dom;
    for (const event of EVENTS) {
      if (event === "contextmenu") {
        // 统一阻止右键默认行为
        dom.addEventListener(
          event,
          (e) => {
            e.preventDefault();
            this.handleEvent(e);
          },
          false
        );
      } else {
        dom.addEventListener(event, this.handleEvent, false);
      }
    }
  }

  handleEvent = (e: any) => {
    if (!this.canvas.capture) {
      return;
    }
    const shape = this.eventHandler.getShape(e);
    this.emitEvent(e.type, e, shape || this.canvas);
    if (this[e.type]) {
      this[e.type](e, shape);
    }
    if (this.eventHandler[e.type]) {
      this.eventHandler[e.type](e, shape);
    }
  };

  mousedown(e: MouseEvent, shape: ShapeBase) {
    // dblClick
    if (this.timeout) {
      return;
    }
    this.prePos = {
      x: e.clientX,
      y: e.clientY,
    };
    this.preMouseDown = shape;
    this.timeout = setTimeout(() => {
      this.timeout = null;
    }, 300);
  }

  mouseup(e: MouseEvent, shape: ShapeBase) {
    if (!this.prePos) {
      return;
    }
    const { x, y } = this.prePos;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    if (shape === this.preMouseDown && Math.sqrt(dx * dx + dy * dy) <= 4) {
      this.emitEvent("click", e, shape || this.canvas);
    }
    this.preMouseDown = null;
    this.prePos = null;
  }

  mousemove(e: MouseEvent, shape: ShapeBase) {
    const enterPath: ShapeBase[] = [];
    const canvas = this.canvas;
    if (!shape || shape === canvas) {
      if (this.preShape) {
        this.emitEvent("mouseout", e, this.preShape);
        if (this.preShape.get("cursor") || this.preShape.destroyed) {
          this.dom.style.cursor = "default";
        }
      }

      this.enterPath.forEach((pathShape: ShapeBase) => {
        this.emitEventWithoutBubble("mouseleave", e, pathShape);
      });
      this.enterPath = enterPath;
      this.preShape = null;
      return;
    }
    if (shape === this.preShape) {
      return;
    }
    if (this.preShape && shape !== this.preShape) {
      this.emitEvent("mouseout", e, this.preShape);
      if (this.preShape.get("cursor") || this.preShape.destroyed) {
        this.dom.style.cursor = "default";
      }
    }

    if (shape?.get("cursor")) {
      this.dom.style.cursor = shape.get("cursor");
    } else if (this.preShape?.get("cursor") || this.preShape?.destroyed) {
      this.dom.style.cursor = "default";
    }

    let currentShape = shape;
    while (currentShape && currentShape !== canvas) {
      enterPath.push(currentShape);
      currentShape = currentShape.getParent();
    }

    // 先 bubble leave 再 over 再 enter
    this.enterPath.forEach((formerShape: ShapeBase) => {
      if (!enterPath.includes(formerShape)) {
        this.emitEventWithoutBubble("mouseleave", e, formerShape);
      }
    });

    this.emitEvent("mouseover", e, shape);

    enterPath.forEach((pathShape: ShapeBase) => {
      if (!this.enterPath.includes(pathShape)) {
        this.emitEventWithoutBubble("mouseenter", e, pathShape);
      }
    });
    this.enterPath = enterPath;
    this.preShape = shape;
  }

  emitEvent(eventType: string, event: MouseEvent, shape: ShapeBase) {
    const e = this.getEvent(eventType, event, shape);
    let target = shape;
    while (target) {
      target.emit(eventType, e);
      if (!e.bubbles) {
        break;
      }
      target = target.getParent();
    }
  }

  emitEventWithoutBubble(
    eventType: string,
    event: MouseEvent,
    shape: ShapeBase
  ) {
    if (shape) {
      const e = this.getEvent(eventType, event, shape);
      shape.emit(eventType, e);
    }
  }

  getEvent(eventType: string, e: MouseEvent, shape: ShapeBase) {
    return {
      type: eventType,
      target: shape,
      nativeEvent: e,
      clientX: e.clientX,
      clientY: e.clientY,
      bubbles: true,
      stopPropagation() {
        this.bubbles = false;
      },
    };
  }

  getLayerParent(shape: any): LayerBase {
    let target = shape;
    while (target) {
      if (
        [LAYER_TYPES.NODE, LAYER_TYPES.EDGE, LAYER_TYPES.GROUP].includes(
          target.type
        )
      ) {
        break;
      }
      target = target.getParent();
    }
    return target;
  }

  destroy() {
    const el = this.canvas.painter.getDomNode();
    for (const event of EVENTS) {
      el.removeEventListener(event, this.handleEvent);
    }
  }
}
