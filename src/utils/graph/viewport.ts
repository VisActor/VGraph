import { MatrixUtils } from '../../utils';
import { Graph, TreeGraph } from '../../graph';
export function entityToCanvas(graph: Graph | TreeGraph, entity: any, shape?: any) {
  let left;
  let top;
  let right;
  let bottom;
  // 如果是 shape，从相对 bbox 到绝对 bbox
  if (shape) {
    let matrix = shape.getMatrix();
    const bbox = shape.getBBox();
    while (1) {
      const newMatrix: number[] = [];
      MatrixUtils.multiply(shape.getMatrix(), matrix, newMatrix);
      matrix = newMatrix;
      if (shape === entity.layer) {
        break;
      }
      shape = shape.parent;
    }
    const leftTop = MatrixUtils.pointMultiply(
      {
        x: bbox.left,
        y: bbox.top,
      },
      matrix,
    );
    const rightBottom = MatrixUtils.pointMultiply(
      {
        x: bbox.left + bbox.width,
        y: bbox.top + bbox.height,
      },
      matrix,
    );
    left = leftTop.x;
    top = leftTop.y;
    right = rightBottom.x;
    bottom = rightBottom.y;
    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
    };
  }
  return entity.getBBox();
}

export function entityToViewport(graph: Graph | TreeGraph, entity: any, shape?: any) {
  const { left, top, width, height } = entityToCanvas(graph, entity, shape);
  const leftTop = graph.canvasToViewport(left, top);
  const rightBottom = graph.canvasToViewport(left + width, top + height);
  return {
    left: leftTop.x,
    top: leftTop.y,
    width: rightBottom.x - leftTop.x,
    height: rightBottom.y - leftTop.y,
  };
}