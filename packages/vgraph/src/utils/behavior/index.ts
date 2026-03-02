import { Graph, TreeGraph } from "../../graph";
import { Node, Group } from "../../models/entities";
import { getPointDist } from "../math";

export function detectTrackPad(e: any) {
  const deltaY = e.deltaY;
  const deltaX = e.deltaX;
  const wheelDeltaY = e.wheelDeltaY;
  // 具有X方向滚动
  if (deltaX !== 0) {
    return true;
  }
  // mac 触摸板
  if (
    wheelDeltaY === -3 * deltaY ||
    wheelDeltaY === -6 * deltaY ||
    (Number.isInteger(wheelDeltaY) &&
      Number.isInteger(deltaY) &&
      wheelDeltaY % 120 !== 0 &&
      wheelDeltaY % 180 !== 0)
  ) {
    return true;
  }
  // 240 是 Mac 的滚轮滚动距离
  // 180 是 Win 的滚轮滚动距离
  // 还有可能是 120

  // windows 触摸板
  if (
    Math.abs(wheelDeltaY) <= Math.abs(deltaY) &&
    Math.abs(deltaY) !== 1.25 &&
    wheelDeltaY % 120 !== 0 &&
    wheelDeltaY % 180 !== 0
  ) {
    return true;
  }

  // windows 鼠标
  return false;
}

export function isDragDist(point: { x: number; y: number }, ev: any) {
  const { clientX, clientY } = ev;
  return getPointDist([clientX, clientY], [point.x, point.y]) >= 25;
}

export function getMagnetAnchor(
  point: { x: number; y: number },
  source: Node,
  graph: Graph | TreeGraph,
  magnetDist = 28,
  group = false
) {
  let minDist = Infinity;
  let minNode = null;
  let minAnchorIndex = -1;
  const viewport = graph.getCanvas().getViewport();
  let entities: (Group | Node)[] = graph.getNodes();
  if (group) {
    entities = entities.concat(graph.getGroups());
  }
  entities.forEach((node: Node | Group) => {
    // if (node === source) {
    //   return;
    // }
    if (node.layer.shouldDraw(viewport)) {
      const positions = node.getAnchorPositions();
      const anchors = node.get("anchors");
      positions.forEach((pos: number[], i: number) => {
        if (!anchors[i].visible) {
          return;
        }
        const dist =
          (pos[0] - point.x) * (pos[0] - point.x) +
          (pos[1] - point.y) * (pos[1] - point.y);
        if (dist < minDist) {
          minDist = dist;
          minNode = node;
          minAnchorIndex = i;
        }
      });
    }
  });

  if (Math.sqrt(minDist) < magnetDist) {
    return { node: minNode as Node | null, anchorIndex: minAnchorIndex };
  }
  return null;
}
