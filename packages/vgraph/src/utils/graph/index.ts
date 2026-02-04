import { Graph, TreeGraph } from "../../graph";

export function normalizePadding(
  padding: number | number[]
): [number, number, number, number] {
  if (typeof padding === "number") {
    return [padding, padding, padding, padding];
  } else if (padding.length === 2) {
    // 上 右 下 左
    return [padding[0], padding[1], padding[0], padding[1]];
  }
  return padding as [number, number, number, number];
}

export function isPointInScreen(
  point: { x: number; y: number },
  configs: { width: number; height: number; [k: string]: any }
) {
  const { x, y } = point;
  if (x < 0 || x > configs.width) {
    return false;
  }
  if (y < 0 || y > configs.height) {
    return false;
  }
  return true;
}

/**
 * Resizes a graph or tree graph to fit within specified maximum width
 * and height while maintaining aspect ratio and applying optional padding.
 * 以原始比例缩放视图并调整画布大小，多用于外部导出图片
 *
 * @param {Graph | TreeGraph} graph - The graph or tree graph instance.
 * @param [options] - `maxWidth` and `maxHeight` is the maximum width and height of the graph.
 * `padding` is the padding between content and graph border.
 * @returns `matrix` is the origin transform matrix which can be used to recover former viewport. `width` and
 * `height` is the current canvas size.
 */
export function resizeToExport(
  graph: Graph | TreeGraph,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    padding?: number | number[];
  }
) {
  const matrix = graph.getMatrix().concat();
  graph.set("emitGraphEvents", false);
  graph.resetMatrix();
  const padding = options?.padding
    ? normalizePadding(options!.padding)
    : [0, 0, 0, 0];
  const bbox = graph.getGraphBBox();
  const width =
    Math.min(options?.maxWidth || 10000, bbox.width) + padding[1] + padding[3];
  const height =
    Math.min(options?.maxHeight || 1000, bbox.height) + padding[0] + padding[2];
  const left = bbox.left - padding[3];
  const top = bbox.top - padding[0];
  let ratio = 1;
  if (width < bbox.width || height < bbox.height) {
    ratio = Math.min(width / bbox.width, height / bbox.height);
  }
  graph.translate(-left, -top);
  graph.scale(ratio);
  graph.set("emitGraphEvents", true);
  graph.changeSize(width, height);
  return { matrix, width, height };
}
