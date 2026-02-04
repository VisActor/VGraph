import { BaseConfigs, Layer, Path } from '../../renderer';

export type IMarkerOptions = BaseConfigs & {
  width: number;
  height: number;
  position?: 'left' | 'right';
  triggerId?: string;
  radius?: number;
};

export function init(layer: Layer, options: IMarkerOptions) {
  const { width, height, position, radius } = options;
  const halfWidth = layer.get('width') / 2;
  const halfHeight = layer.get('height') / 2;
  let path: (string | number)[][] = [];
  if (position === 'left') {
    if (!radius) {
      path = [
        ['M', -halfWidth - 0.5, -halfHeight],
        ['L', -halfWidth + width, -halfHeight],
        ['L', -halfWidth, -halfHeight + height],
        ['L', -halfWidth, -halfHeight],
      ];
    } else {
      path = [
        ['M', -halfWidth, -halfHeight + radius],
        ['A', radius, radius, 0, 0, 1, -halfWidth + radius, -halfHeight],
        ['L', -halfWidth + width, -halfHeight],
        ['L', -halfWidth, -halfHeight + height],
        ['Z'],
      ];
    }
  } else {
    if (!radius) {
      path = [
        ['M', halfWidth + 0.5, -halfHeight],
        ['L', halfWidth - width, -halfHeight],
        ['L', halfWidth, -halfHeight + height],
        ['L', halfWidth, -halfHeight],
      ];
    } else {
      path = [
        ['M', halfWidth, -halfHeight + radius],
        ['A', radius, radius, 0, 0, 0, halfWidth - radius, -halfHeight],
        ['L', halfWidth - width, -halfHeight],
        ['L', halfWidth, -halfHeight + height],
        ['Z'],
      ];
    }
  }

  const shape = new Path({
    ...options,
    path,
  });

  layer.add(shape);
  return shape;
}
