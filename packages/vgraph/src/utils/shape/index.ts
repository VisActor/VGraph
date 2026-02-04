import { ShapeBase } from "../../renderer";
import { DOM_CONTAINER_CLASS_SELECTOR } from "../../consts/entity_types";

export function isNodeShape(shape?: ShapeBase | HTMLElement) {
  if (!shape) {
    return false;
  }
  // shape 对象
  let current: any = shape;
  if (current.type) {
    while (current) {
      if (current.type === "node") {
        return true;
      }
      if (current.type === "group" || current.type === "edge") {
        return false;
      }
      current = current.parent;
    }
  } else {
    // dom 对象
    // TODO 2.0 viewer className
    const container = current.closest(DOM_CONTAINER_CLASS_SELECTOR);
    return !!container;
  }
  return false;
}
