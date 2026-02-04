import { Graph } from '../../graph';

export function selectionIntoView(graph: Graph, autoScale = false) {
  const { width, height } = graph.getGraphSize();
  const padding = graph.getViewPadding();
  const selections = graph.get('_selections');
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  ['group', 'node'].forEach((type: string) => {
    selections?.[type]?.forEach((id: string) => {
      const entity = type === 'group' ? graph.getGroupById(id) : graph.getNodeById(id);
      const bbox = entity.getBBox();
      minX = Math.min(minX, bbox.left);
      minY = Math.min(minY, bbox.top);
      maxX = Math.max(maxX, bbox.left + bbox.width);
      maxY = Math.max(maxY, bbox.top + bbox.height);
    });
  });
  const matrix = graph.getMatrix();
  const center = graph.getViewCenter();
  const containerBBox = graph.getBBox();
  if ((width > containerBBox.width && height > containerBBox.height)
        || !autoScale) {
    const leftTop = graph.viewportToCanvas(0, 0);
    const rightBottom = graph.viewportToCanvas(width, height);
    let offsetX = 0;
    let offsetY = 0;
    if (minX < leftTop.x) {
      offsetX = leftTop.x - minX + padding![3];
    } else if (maxX > rightBottom.x) {
      offsetX = rightBottom.x - maxX - padding![1];
    }
    if (minY < leftTop.y) {
      offsetY = leftTop.y - minY + padding![0];
    } else if (maxY > rightBottom.y) {
      offsetY = rightBottom.y - maxY - padding![2];
    }
    if (offsetX || offsetY) {
      graph.translate(offsetX * matrix[0], offsetY * matrix[3]);
    }
  } else if (autoScale) {
    minX = minX * matrix[0] + matrix[4];
    minY = minY * matrix[3] + matrix[5];
    maxX = maxX * matrix[0] + matrix[4];
    maxY = maxY * matrix[3] + matrix[5];
    let scale = 1.0;
    // 上 下 左 右
    if (minY < 0) {
      scale = Math.min(scale, (padding[0] - center.y) / (minY - center.y));
    }
    if (maxY > height) {
      scale = Math.min(scale, (height - padding[2] - center.y) / (maxY - center.y));
    }
    if (minX < 0) {
      scale = Math.min(scale, (padding[3] - center.x) / (minX - center.x));
    }
    if (maxX > width) {
      scale = Math.min(scale, (width - padding[1] - center.x) / (maxX - center.x));
    }
    graph.scale(scale, [center.x, center.y]);
  }
}