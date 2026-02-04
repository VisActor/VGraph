import { colorParser } from './parser';

export function getGrayScale(color: string, opacity?: number) {
  const rgba = colorParser(color).value();
  const grayScale = Math.round(
    (rgba[0] * 0.299 + rgba[1] * 0.587 + rgba[2] * 0.114) / (opacity ? opacity : rgba[3])
  );
  return grayScale;
}

export function isDarkColor(color: string, opacity?: number) {
  const DARK_THRESHOLD = 160;
  return getGrayScale(color, opacity) <= DARK_THRESHOLD;
}


export { colorParser } from './parser';
export { isGradient, parseLinearGradientValues, parseRadialGradientValues } from './gradient';