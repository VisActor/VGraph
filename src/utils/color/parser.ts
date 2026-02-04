import {
  isGradient,
  parseLinearGradientValues,
  parseRadialGradientValues,
} from './gradient';

const COLOR_MAP = {
  aliceblue: '#f0f8ff',
  antiquewhite: '#faebd7',
  aqua: '#00ffff',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  beige: '#f5f5dc',
  bisque: '#ffe4c4',
  black: '#000000',
  blanchedalmond: '#ffebcd',
  blue: '#0000ff',
  blueviolet: '#8a2be2',
  brown: '#a52a2a',
  burlywood: '#deb887',
  cadetblue: '#5f9ea0',
  chartreuse: '#7fff00',
  chocolate: '#d2691e',
  coral: '#ff7f50',
  cornflowerblue: '#6495ed',
  cornsilk: '#fff8dc',
  crimson: '#dc143c',
  cyan: '#00ffff',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  floralwhite: '#fffaf0',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  gold: '#ffd700',
  goldenrod: '#daa520',
  gray: '#808080',
  green: '#008000',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  lime: '#00ff00',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  magenta: '#ff00ff',
  maroon: '#800000',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4b5',
  navajowhite: '#ffdead',
  navy: '#000080',
  oldlace: '#fdf5e6',
  olive: '#808000',
  olivedrab: '#6b8e23',
  orange: '#ffa500',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  pink: '#ffc0cb',
  plum: '#dda0dd',
  powderblue: '#b0e0e6',
  purple: '#800080',
  red: '#ff0000',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  salmon: '#fa8072',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  silver: '#c0c0c0',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  tan: '#d2b48c',
  teal: '#008080',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
  white: '#ffffff',
  whitesmoke: '#f5f5f5',
  yellow: '#ffff00',
  yellowgreen: '#9acd32',
};

type RGBA = [number, number, number, number];

/**
 * 颜色转换接口
 */
export interface IColorTransform {
  /**
   * 颜色加法
   */
  add: (color: string) => this;
  /**
   * 颜色减法
   */
  sub: (color: string) => this;
  /**
   * 颜色标量乘法
   */
  scalar: (scale: number) => this;
  /**
   * 颜色分量乘法
   */
  multiply: (color: string) => this;
  /**
   * 颜色插值
   */
  lerp: (color: string, alpha: number) => this;
  /**
   * 反色
   */
  reverse: () => this;
  [x: string]: any;
}

export interface OrdinaryColor extends IColorTransform {
  value: () => RGBA;
  rgba: () => string;
  hex: () => string;
  vec4: () => [number, number, number, number];
}

export interface GradientColor extends IColorTransform {
  toString: () => string;
  type: () => 0 | 1;
  params: () => number[];
  stops: () => number[];
  vec4: () => [number, number, number, number][];
}

/**
 * 从颜色字符串获取归一化的vec4对象
 * @param color 颜色字符串
 * @returns rgba四通道值域均为0-1的数组[r, g, b, a]
 */
export function getVec4(color: RGBA): [number, number, number, number] {
  const [r, g, b, a] = color;
  return [r / 255, g / 255, b / 255, a];
}

/**
 * 从颜色字符串转换成rgba表示法的字符串
 * @param color 颜色字符串
 * @returns 形如rgba(0,0,0,1)的颜色字符串
 */
export function getRgbaString(color: string): string {
  const [r, g, b, a] = getRgbaValue(color);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

/**
 * 从颜色字符串转换成rgba表示法的数组
 * @param color 颜色字符串
 * @returns rgb三通道值域均为0-255，a通道值域为0-1的数组[r, g, b, a]
 */
export function getRgbaValue(color: string): RGBA {
  const rgba = color.match(/^rgb[a]?\(((\d|\s|,|.)+)\)$/);
  const hsla = color.match(/^hsl[a]?\(((\d|\s|,|.|%)+)\)$/);
  if (color[0] === '#') {
    return hexToRgbaValue(color);
  } else if (rgba && rgba.length >= 3) {
    const values = rgba[1].split(',');
    return [
      parseInt(values[0], 10),
      parseInt(values[1], 10),
      parseInt(values[2], 10),
      values[3] ? parseFloat(values[3]) : 1.0,
    ];
  } else if (hsla && hsla.length >= 3) {
    const values = hsla[1].split(',');
    const h = parseFloat(values[0]);
    const s = parseFloat(values[1]) / 100;
    const l = parseFloat(values[2]) / 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [
      Math.round(255 * f(0)),
      Math.round(255 * f(8)),
      Math.round(255 * f(4)),
      values[3] ? parseFloat(values[3]) : 1.0,
    ];
  } else {
    return hexToRgbaValue(nameToHex(color));
  }
}

/**
 * color1 + color2
 * @returns 返回一个[r, g, b, a1]数组
 */
export function addColor(color1: RGBA, color2: RGBA): RGBA {
  const [r1, g1, b1, a1] = color1;
  const [r2, g2, b2] = color2;
  const r = r1 + r2 > 255 ? 255 : r1 + r2;
  const g = g1 + g2 > 255 ? 255 : g1 + g2;
  const b = b1 + b2 > 255 ? 255 : b1 + b2;
  return [r, g, b, a1];
}

/**
 * color1 - color2
 * @returns 返回一个[r, g, b, a1]数组
 */
export function subColor(color1: RGBA, color2: RGBA): RGBA {
  const [r1, g1, b1, a1] = color1;
  const [r2, g2, b2] = color2;
  const r = r1 - r2 < 0 ? 0 : r1 - r2;
  const g = g1 - g2 < 0 ? 0 : g1 - g2;
  const b = b1 - b2 < 0 ? 0 : b1 - b2;
  return [r, g, b, a1];
}

/**
 * 颜色标量乘法color * scale = (r * scale, g * scale, b * scale, a)
 * @returns 返回标量乘法后的[r, g, b, a1]
 */
export function multiplyScalarColor(color: RGBA, scale: number): RGBA {
  const [r1, g1, b1, a1] = color;
  const tempR = Math.round(r1 * scale);
  const tempG = Math.round(g1 * scale);
  const tempB = Math.round(b1 * scale);
  const r = tempR >= 255 ? 255 : tempR <= 0 ? 0 : tempR;
  const g = tempG >= 255 ? 255 : tempG <= 0 ? 0 : tempG;
  const b = tempB >= 255 ? 255 : tempB <= 0 ? 0 : tempB;
  return [r, g, b, a1];
}

/**
 * 颜色分量乘法color1 * color2 = (color1.r * color2.r, color1.g * color2.g, color1.b * color2.b, a)
 * @returns 返回标量乘法后的[r, g, b, a1]
 */
export function multiplyColor(color1: RGBA, color2: RGBA): RGBA {
  const [r1, g1, b1, a1] = color1;
  const [r2, g2, b2] = color2;
  const tempR = Math.round((r1 * r2) / 255);
  const tempG = Math.round((g1 * g2) / 255);
  const tempB = Math.round((b1 * b2) / 255);
  const r = tempR >= 255 ? 255 : tempR <= 0 ? 0 : tempR;
  const g = tempG >= 255 ? 255 : tempG <= 0 ? 0 : tempG;
  const b = tempB >= 255 ? 255 : tempB <= 0 ? 0 : tempB;
  return [r, g, b, a1];
}

/**
 * 颜色插值color1 * (1 - alpha) + color2 * alpha
 * @returns 插值后的颜色[r, g, b, a1]
 */
export function lerpColor(color1: RGBA, color2: RGBA, alpha: number): RGBA {
  const rgba1 = multiplyScalarColor(color1, 1 - alpha);
  const rgba2 = multiplyScalarColor(color2, alpha);
  return addColor(rgba1, rgba2);
}

/**
 * 从颜色名转换到十六进制表示法
 * @param color 颜色名
 * @returns 返回形如#ffffff的颜色的十六进制表示法
 */
export function nameToHex(color: string) {
  return COLOR_MAP[color];
}

/**
 * 将RGBA数组转换为十六进制字符串
 * @param color RGBA颜色数组
 * @returns 形如#ffffff的数组
 */
export function rgbaToHexString(color: RGBA) {
  const [r, g, b, a] = color;
  const hex = '0123456789abcdef';
  const r2 = r % 16;
  const r1 = (r - r2) / 16;
  const g2 = g % 16;
  const g1 = (g - g2) / 16;
  const b2 = b % 16;
  const b1 = (b - b2) / 16;
  if (a === 1) {
    return '#' + hex[r1] + hex[r2] + hex[g1] + hex[g2] + hex[b1] + hex[b2];
  } else {
    const alpha = Math.round(a * 255);
    const a2 = alpha % 16;
    const a1 = (alpha - a2) / 16;
    return (
      '#' +
      hex[r1] +
      hex[r2] +
      hex[g1] +
      hex[g2] +
      hex[b1] +
      hex[b2] +
      hex[a1] +
      hex[a2]
    );
  }
}

/**
 * 从十六进制表示法转换到rgba数组
 * @param color 十六进制表示法的颜色
 * @returns 返回基于rgba表示法的数组
 */
export function hexToRgbaValue(color: string): RGBA {
  const strColor = color.toLowerCase();
  const hex = '0123456789abcdef';
  const arrColor: [number, number, number, number] =
    strColor.length >= 9
      ? [
          hex.indexOf(strColor[1]) * 16 + hex.indexOf(strColor[2]),
          hex.indexOf(strColor[3]) * 16 + hex.indexOf(strColor[4]),
          hex.indexOf(strColor[5]) * 16 + hex.indexOf(strColor[6]),
          (hex.indexOf(strColor[7]) * 16 + hex.indexOf(strColor[8])) / 255,
        ]
      : strColor.length >= 7
      ? [
          hex.indexOf(strColor[1]) * 16 + hex.indexOf(strColor[2]),
          hex.indexOf(strColor[3]) * 16 + hex.indexOf(strColor[4]),
          hex.indexOf(strColor[5]) * 16 + hex.indexOf(strColor[6]),
          1.0,
        ]
      : [
          hex.indexOf(strColor[1]) * 17,
          hex.indexOf(strColor[2]) * 17,
          hex.indexOf(strColor[3]) * 17,
          1.0,
        ];
  return arrColor;
}

export function colorParser(
  color: string
): OrdinaryColor | GradientColor {
  if (isGradient(color)) {
    const transforms: ((rgba: RGBA) => RGBA)[] = [];
    // 0: linear, 1: radial
    const type = color[0] === 'l' ? 0 : 1;
    return {
      getGradient() {
        const currentColor = this.toString();
        return type === 0
          ? parseLinearGradientValues(currentColor)
          : parseRadialGradientValues(currentColor);
      },
      toString() {
        return color.replace(/:\S+(\s|$)/g, (substr) => {
          let childColor = getRgbaValue(substr.substring(1));
          transforms.forEach((transform) => {
            childColor = transform(childColor);
          });
          return ':' + rgbaToHexString(childColor) + ' ';
        });
      },
      type() {
        return type;
      },
      params() {
        const gradient = this.getGradient();
        if (!gradient) {
          return null;
        }
        if (type === 0) {
          return [
            gradient.x0 - 0.5,
            gradient.y0 - 0.5,
            gradient.x1 - 0.5,
            gradient.y1 - 0.5,
          ];
        } else {
          return [
            gradient.x0 - 0.5,
            gradient.y0 - 0.5,
            gradient.r0,
            gradient.x1 - 0.5,
            gradient.y1 - 0.5,
            gradient.r1,
          ];
        }
      },
      stops() {
        const gradient = this.getGradient();
        if (!gradient) {
          return null;
        }
        return gradient.stops.map((stop: any) => stop.stop);
      },
      vec4() {
        const gradient = this.getGradient();
        if (!gradient) {
          return null;
        }
        return gradient.stops.map((stop: any) =>
          getVec4(hexToRgbaValue(stop.color))
        );
      },
      add(c: string) {
        const color2 = getRgbaValue(c);
        transforms.push((rgba) => addColor(rgba, color2));
        return this;
      },
      sub(c: string) {
        const color2 = getRgbaValue(c);
        transforms.push((rgba) => subColor(rgba, color2));
        return this;
      },
      scalar(scale: number) {
        transforms.push((rgba) => multiplyScalarColor(rgba, scale));
        return this;
      },
      multiply(c: string) {
        const color2 = getRgbaValue(c);
        transforms.push((rgba) => multiplyColor(rgba, color2));
        return this;
      },
      lerp(c: string, alpha: number) {
        const color2 = getRgbaValue(c);
        transforms.push((rgba) => lerpColor(rgba, color2, alpha));
        return this;
      },
      reverse() {
        transforms.push((rgba) => {
          const [r, g, b, a] = rgba;
          return [255 - r, 255 - g, 255 - b, a];
        });
        return this;
      },
    } as GradientColor;
  } else {
    let rgba = getRgbaValue(color);
    return {
      value() {
        return rgba;
      },
      rgba() {
        const [r, g, b, a] = rgba;
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      },
      hex() {
        return rgbaToHexString(rgba);
      },
      vec4() {
        return getVec4(rgba);
      },
      add(c: string) {
        const color2 = getRgbaValue(c);
        rgba = addColor(rgba, color2);
        return this;
      },
      sub(c: string) {
        const color2 = getRgbaValue(c);
        rgba = subColor(rgba, color2);
        return this;
      },
      multiply(c: string) {
        const color2 = getRgbaValue(c);
        rgba = multiplyColor(rgba, color2);
        return this;
      },
      scalar(scale: number) {
        rgba = multiplyScalarColor(rgba, scale);
        return this;
      },
      lerp(c: string, alpha: number) {
        const color2 = getRgbaValue(c);
        rgba = lerpColor(rgba, color2, alpha);
        return this;
      },
      reverse() {
        const [r, g, b, a] = rgba;
        rgba = [255 - r, 255 - g, 255 - b, a];
        return this;
      },
    } as OrdinaryColor;
  }
}
