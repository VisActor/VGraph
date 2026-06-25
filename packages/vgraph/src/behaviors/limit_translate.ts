import { Graph, TreeGraph } from "../graph";
import { BBox } from "../typings/renderer";

/**
 * Restrict translation within a specified bounding box.
 * 限制视口移动范围
 * @param {Graph | TreeGraph} graph - A `Graph` or a `TreeGraph` instance.
 * @param {number} x - The horizontal distance by which the graph is being translated.
 * @param {number} y - The vertical distance by which the graph is being translated.
 * @param {number} [padding] - Specify the padding around the bounding box of the graph.
 * @param [strict=false] - Determines whether strict boundary checking is enabled.
 * @param {BBox} [bbox] - The bounding box of the graph.
 * @returns The distances after applying the specified limits and adjustments.
 */
export function limitTranslate(
  graph: Graph | TreeGraph,
  x: number,
  y: number,
  padding?: number,
  strict = false,
  bbox?: BBox
) {
  if (!bbox) {
    bbox = graph.getGraphBBox(padding);
  }
  const { left, top } = bbox;
  let { width, height } = bbox;
  width = Math.round(width);
  height = Math.round(height);
  const zoomRatio = graph.getZoomRatio();
  x /= zoomRatio;
  y /= zoomRatio;
  const leftTop = graph.viewportToCanvas(0, 0);
  const rightBottom = graph.viewportToCanvas(
    graph.get("width"),
    graph.get("height")
  );
  const vWidth = Math.round(rightBottom.x - leftTop.x);
  const vHeight = Math.round(rightBottom.y - leftTop.y);
  const maxX = left + width;
  const maxY = top + height;
  // 图形全部在视野中了就不能再移动，需配合 zoom: false 使用
  if (
    strict &&
    vWidth > width &&
    leftTop.x < left &&
    rightBottom.x > left + width
  ) {
    x = 0;
  }
  if (
    strict &&
    vHeight > height &&
    leftTop.y < top &&
    rightBottom.y > top + height
  ) {
    y = 0;
  }
  if (vWidth === width && Math.round(leftTop.x) === Math.round(left)) {
    x = 0;
  }
  if (vHeight === height && Math.round(leftTop.y) === Math.round(top)) {
    y = 0;
  }
  // 向下滑动
  if (y < 0) {
    // 上边界
    if (vHeight < height && leftTop.y + y < top) {
      y = Math.min(top - leftTop.y, 0);
    } else if (vHeight > height && rightBottom.y + y < maxY) {
      // 下边界
      y = Math.min(maxY - rightBottom.y, 0);
    }
  }
  // 向上滑动
  else if (y > 0) {
    // 下边界
    if (vHeight < height && rightBottom.y + y > maxY) {
      y = Math.max(maxY - rightBottom.y, 0);
      // 上边界
    } else if (vHeight > height && leftTop.y + y > top) {
      y = Math.max(top - leftTop.y, 0);
    }
  }
  // 向右滑动超过图的左边界
  if (x < 0) {
    // 左边界
    if (vWidth < width && leftTop.x + x < left) {
      x = Math.min(left - leftTop.x, 0);
    } else if (vWidth > width && rightBottom.x + x < maxX) {
      // 右边界
      x = Math.min(maxX - rightBottom.x, 0);
    }
  }
  //向左滑动超过图右边界
  if (x > 0) {
    // 右边界
    if (vWidth < width && rightBottom.x + x > maxX) {
      x = Math.max(maxX - rightBottom.x, 0);
    } else if (vWidth > width && leftTop.x + x > left) {
      // 左边界
      x = Math.max(left - leftTop.x, 0);
    }
  }
  return { x: x * zoomRatio, y: y * zoomRatio };
}
