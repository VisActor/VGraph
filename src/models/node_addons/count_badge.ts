import { Layer, Path, Rect, Text } from '../../renderer';
import { Node } from '../entities/node';
import { LayerEvent } from '../../typings/event';

const PATH_WIDTH = 8;
const TEXT_PADDING = 8;

export type CountBadgeOptions = {
  text: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  color?: string;
  label?: {
    fontSize?: number;
    fontFamily?: string;
    fillStyle?: string;
  };
  background?: {
    fillStyle?: string;
    strokeStyle?: string;
    radius?: number;
  };
  onMouseEnter?: (e: LayerEvent) => void;
  onMouseLeave?: (e: LayerEvent) => void;
  onClick?: (e: LayerEvent) => void;
};

// -（ 123 )
// https://www.figma.com/file/9DZW5QHmVjGczKVXrIzWkP/rq-%E5%9B%BE%E8%B0%B1demo?node-id=2113%3A72675&t=y4EikgClhoLFW8uE-0
export function init(node: Node, options: CountBadgeOptions) {
  const layer = node instanceof Node ? node.layer : node; // 仅兼容旧版本可能用户可能已经使用了 Layer 作为参数。
  const badgeLayer = new Layer({ id: 'countBadge' });
  const halfWidth = node.get('width') / 2;
  const halfHeight = node.get('height') / 2;
  options.color = options.color || node.get('color') || '#3073F2';
  layer.add(badgeLayer);
  const appendSize = [0, 0, 0, 0];
  const text = new Text({
    x: 0,
    y: 0,
    textAlign: 'left',
    text: options.text,
    fontWeight: 500,
    fillStyle: options.color,
    ...options.label,
    action: 'expand',
  });
  const textWidth = text.getBBox().width;
  const rectWidth = textWidth + TEXT_PADDING * 2;
  const badgeWidth = rectWidth + PATH_WIDTH;
  let path;
  let textX = -textWidth / 2;
  let textY = 0;
  let bgLeft = -rectWidth / 2;
  let bgTop = -10;
  switch (options.position) {
    case 'top':
      path = [
        ['M', 0, -halfHeight],
        ['L', 0, -halfHeight - PATH_WIDTH]
      ];
      textY = -halfHeight - PATH_WIDTH - 10;
      bgTop = -halfHeight - PATH_WIDTH - 20;
      appendSize[0] = 20 + PATH_WIDTH;
      break;
    case 'bottom':
      path = [
        ['M', 0, halfHeight],
        ['L', 0, halfHeight + PATH_WIDTH]
      ];
      textY = halfHeight + PATH_WIDTH + 10;
      bgTop = halfHeight + PATH_WIDTH;
      appendSize[2] = 20 + PATH_WIDTH;
      break;
    case 'left':
      path = [
        ['M', -halfWidth, 0],
        ['L', -halfWidth - PATH_WIDTH, 0]
      ];
      textX = -halfWidth - PATH_WIDTH - TEXT_PADDING - textWidth;
      bgLeft = -halfWidth - PATH_WIDTH - rectWidth;
      appendSize[3] = badgeWidth;
      break;
    default:
      path = [
        ['M', halfWidth, 0],
        ['L', halfWidth + PATH_WIDTH, 0]
      ];
      textX = halfWidth + PATH_WIDTH + TEXT_PADDING;
      bgLeft = halfWidth + PATH_WIDTH;
      appendSize[1] = badgeWidth;
      break;
  }
  text.set({
    x: textX,
    y: textY,
  });
  const link = new Path({
    path,
    lineWidth: 2,
    strokeStyle: options.color || '#E1E4E8',
  });
  badgeLayer.add(link);
  const bg = new Rect({
    left: bgLeft,
    top: bgTop,
    width: rectWidth,
    height: 20,
    radius: 10,
    fillStyle: '#fff',
    strokeStyle: options.color,
    ...options.background,
    hitWidth: 10,
    action: 'expand',
  });
  badgeLayer.add(bg);
  badgeLayer.add(text);
  // 添加交互热区
  layer.set('customAppendSize', appendSize);
  (node as Node).updateLayerAppendSize?.();
  if (options.onMouseEnter) {
    badgeLayer.on('mouseenter', e => {
      options.onMouseEnter!(e);
    });
  }
  if (options.onMouseLeave) {
    badgeLayer.on('mouseleave', e => {
      options.onMouseLeave!(e);
    });
  }
  if (options.onClick) {
    badgeLayer.on('click', e => {
      options.onClick!(e);
      e.stopPropagation();
    });
  }
  return badgeLayer;
}

export function remove(node: Node, layer: Layer) {
  const nodeLayer = node.layer;
  delete nodeLayer.configs.customAppendSize;
  node.updateLayerAppendSize();
  nodeLayer.remove(layer);
}

