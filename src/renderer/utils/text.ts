import { TextConfigs } from '../../typings/renderer';
const charCache: Record<string, Record<string, number>> = {};
const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d')!;

export function getFontByConfigs(configs: TextConfigs): string {
  const { fontSize, fontFamily, fontWeight, fontStyle, fontVariant } = configs;
  return [fontStyle, fontVariant, fontWeight, fontSize + 'px', fontFamily].join(' ');
}

export function getCharLen(char: string, font: string): number {
  if (!charCache[font]) {
    charCache[font] = {};
  }
  if (!charCache[font][char]) {
    ctx.font = font;
    const len = ctx.measureText(char).width;
    charCache[font][char] = len;
    return len;
  }
  return charCache[font][char];
}

export function measureText(text: string | string[], configs: TextConfigs): number {
  const font = getFontByConfigs(configs);
  let textArr = text;
  if (typeof text === 'string' && text.indexOf('\n')) {
    textArr = text.split('\n');
  }
  let length = 0;
  for (const line of textArr) {
    let lineLen = 0;
    for (const char of line) {
      lineLen += getCharLen(char, font);
    }
    length = Math.max(length, lineLen);
  }
  return length;
}
