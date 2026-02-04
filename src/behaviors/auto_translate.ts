import { BBox } from '../renderer';
import { Graph, TreeGraph } from '../graph';

/**
 * Adjusts the view of a graph or tree graph within a bounding box by translating it if necessary.
 * 当指定包围盒触边时自动平移画布
 * @param {Graph | TreeGraph} graph - A `Graph` or a `TreeGraph` instance.
 * @param {BBox} bbox - The bounding box of an entity on the graph.
 * @param [onTranslate] - A callback function that is called every time graph is translated.
 * @param [padding=50] -The distance in pixels from the edges of the bounding box.
 * @returns An interval ID is being returned.
 */
export function autoTranslate(
  graph: Graph | TreeGraph,
  bbox: BBox,
  onTranslate?: (x: number, y: number) => void,
  padding = 50) {
  const { left, top, width, height } = bbox;
  const leftTop = graph.canvasToViewport(left, top);
  const rightBottom = graph.canvasToViewport(left + width, top + height);
  let x = 0;
  let y = 0;

  if (leftTop.x <= padding) {
    x = 10;
  } else if (rightBottom.x > graph.get('width') - padding) {
    x = -10;
  }

  if (leftTop.y <= padding) {
    y = 10;
  } else if (rightBottom.y > graph.get('height') - padding) {
    y = -10;
  }
  if (x || y) {
    const ratio = graph.getZoomRatio();
    const offsetX = x / ratio;
    const offsetY = y / ratio;
    // onTranslate?.(offsetX, offsetY);
    // graph.translate(x, y);
    return setInterval(() => {
      onTranslate?.(offsetX, offsetY);
      graph.translate(x, y);
    }, 100);
  }
  return null;
}
