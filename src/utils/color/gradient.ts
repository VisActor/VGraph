import { degToRadian } from '../math';

type GradientStop = {
  stop: number;
  color: string;
};

export function isGradient(color: string | CanvasGradient) {
  if (!color) {
    return;
  }
  if (typeof color === 'string') {
    return color && (color[1] === '(' || color[2] === '(');
  }
  return true;
}

const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
const regexColorStop = /[\d.]+:(#[0-9a-fA-F]+|\S+\([^\)]+\)|[a-zA-Z]+)/gi;

export function parseLinearGradientValues(color: string) {
  const bbox = {
    left: 0,
    top: 0,
    width: 1,
    height: 1,
  };
  const arr = regexLG.exec(color);
  if (!arr) {
    return null;
  }
  const angle = degToRadian(parseFloat(arr[1])) % (Math.PI * 2);
  const stopsStr = arr[2];
  let start;
  let end;
  if (angle >= 0 && angle < 0.5 * Math.PI) {
    start = {
      x: bbox.left,
      y: bbox.top,
    };
    end = {
      x: bbox.left + bbox.width,
      y: bbox.top + bbox.height,
    };
  } else if (0.5 * Math.PI <= angle && angle < Math.PI) {
    start = {
      x: bbox.left + bbox.width,
      y: bbox.top,
    };
    end = {
      x: bbox.left,
      y: bbox.top + bbox.height,
    };
  } else if (Math.PI <= angle && angle < 1.5 * Math.PI) {
    start = {
      x: bbox.left + bbox.width,
      y: bbox.top + bbox.height,
    };
    end = {
      x: bbox.left,
      y: bbox.top,
    };
  } else {
    start = {
      x: bbox.left,
      y: bbox.top + bbox.height,
    };
    end = {
      x: bbox.left + bbox.width,
      y: bbox.top,
    };
  }

  const tanTheta = Math.tan(angle);
  const tanTheta2 = tanTheta * tanTheta;

  const x =
    (end.x - start.x + tanTheta * (end.y - start.y)) / (tanTheta2 + 1) +
    start.x;
  const y =
    (tanTheta * (end.x - start.x + tanTheta * (end.y - start.y))) /
      (tanTheta2 + 1) +
    start.y;
  const stops = getStops(stopsStr);

  return {
    x0: start.x,
    y0: start.y,
    x1: x,
    y1: y,
    stops,
  };
}

export function parseRadialGradientValues(color: string) {
  const arr = regexRG.exec(color);
  if (!arr) {
    return null;
  }
  const fx = parseFloat(arr[1]);
  const fy = parseFloat(arr[2]);
  const fr = parseFloat(arr[3]);
  const stops = getStops(arr[4]);
  const x0 = fx;
  const y0 = fy;
  const r0 = fr;
  const x1 = 0.5;
  const y1 = 0.5;
  const r1 = 1;
  return {
    x0,
    y0,
    r0,
    x1,
    y1,
    r1,
    stops,
  };
}

function getStops(stops: string) {
  const arr = stops.match(regexColorStop);
  if (!arr) {
    return [];
  }
  const colorStops = [] as GradientStop[];
  arr.forEach((stopString: string) => {
    const step = stopString.split(':');
    colorStops.push({
      stop: parseFloat(step[0]),
      color: step[1],
    });
  });
  return colorStops;
}
