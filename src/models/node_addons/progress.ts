import { Text, Path, Circle, Layer } from '../../renderer';

export type IProgressOptions = {
  x: number;
  y: number;
  percent: number;
  width: number;
  lineWidth?: number;
  type?: 'line' | 'circle';
  color?: string;
  trailColor?: string;
  label?: {
    text: string;
    fillStyle?: string;
    fontSize?: number;
    lineHeight?: number;
    fontFamily?: string;
    width?: number;
    textOverflow?: 'ellipsis' | 'clip';
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
    triggerId?: string;
  };
  lineCap?: 'butt' | 'round' | 'square';
};

type ProcessAnimateConfigs = {
  duration?: number;
  repeat?: boolean;
  easing?: 'easelinear' | 'easeCubic' | 'easePoly' | 'easeQuad' | 'easeSin' | 'easeExp' | 'easeBounce';
  onFinish?: () => void;
}
export type IProgressUpdateOptions = {
  percent: number;
  color?: string;
  updateLabel?: (percent: number) => string;
  animate?: boolean | ProcessAnimateConfigs;
};

export function init(layer: Layer, options: IProgressOptions) {
  const container = new Layer();
  layer.add(container);
  if (options.type === 'circle') {
    initCircleProgress(container, options);
  } else {
    initPathProgress(container, options);
  }
  container.set('options', options);
  return container;
}

export function update(layer: Layer, options: IProgressUpdateOptions) {
  const animateShape = layer.children[1];
  const textShape = layer.children[2];
  if (!animateShape?.get('lineDash')) {
    return;
  }
  const { animate, updateLabel } = options;
  const initOptions = layer.get('options');
  const fromPercent = initOptions.percent;
  const toPercent = options.percent;
  let length = initOptions.width;
  if (initOptions.type === 'circle') {
    length *= Math.PI;
  }
  if (!options.animate) {
    if (options.color) {
      animateShape.set('strokeStyle', options.color);
    }
    animateShape.set('lineDash', [length * toPercent, length]);
    updateLabel && textShape?.set('text', updateLabel(toPercent));
    return;
  }

  let canvas: any = layer;
  while (canvas.type !== 'canvas') {
    canvas = canvas.parent;
  }

  let animateConfigs = animate;
  initOptions.percent = toPercent;
  if (typeof animateConfigs === 'boolean') {
    animateConfigs = {
      duration: 1000,
      repeat: false,
    };
  }
  canvas.animate({
    ...animateConfigs,
    target: animateShape,
    onFrame(ratio: number) {
      const per = (toPercent - fromPercent) * ratio + fromPercent;
      animateShape.set('lineDash', [length * per, length]);
      updateLabel && textShape?.set('text', updateLabel(per));
    },
    onFinish() {
      if (options.color) {
        animateShape.set('strokeStyle', options.color);
      }
      (animateConfigs as ProcessAnimateConfigs)?.onFinish?.();
    }
  });
}

function initCircleProgress(layer: Layer, options: IProgressOptions) {
  const { x, y, percent, width, lineWidth = 4, trailColor = '#E3E5EB', color = '#3073F2', lineCap = 'round', label } = options;
  const trail = new Circle({
    cx: x,
    cy: y,
    r: width / 2,
    lineWidth,
    strokeStyle: trailColor,
    lineCap,
  });
  layer.add(trail);

  const length = Math.PI * width;
  const progress = new Circle({
    cx: x,
    cy: y,
    r: width / 2,
    lineWidth,
    strokeStyle: color,
    lineCap,
    lineDash: [length * percent, length]
  });
  progress.rotate(90);
  layer.add(progress);

  if (label) {
    const text = new Text({
      textOverflow: 'ellipsis',
      width: width - lineWidth,
      ...label,
      x,
      y,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    layer.add(text);
  }
}

function initPathProgress(layer: Layer, options: IProgressOptions) {
  const { x, y, percent, width, lineWidth = 8, trailColor = '#E3E5EB', color = '#3073F2', lineCap = 'round', label } = options;
  const trail = new Path({
    strokeStyle: trailColor,
    path: [
      ['M', x, y],
      ['L', x + width, y]
    ],
    lineWidth,
    lineCap,
  });
  layer.add(trail);

  const progress = new Path({
    strokeStyle: color,
    path: [
      ['M', x, y],
      ['L', x + width, y]
    ],
    lineWidth,
    lineCap,
    lineDash: [width * percent, width],
  });
  layer.add(progress);

  if (label) {
    const text = new Text({
      textOverflow: 'ellipsis',
      ...label,
      x: x + width + (lineCap === 'butt' ? 0 : lineWidth / 2) + 8,
      y,
      textAlign: 'left',
      textBaseline: 'middle',
    });
    layer.add(text);
  }
}

