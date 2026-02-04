import { ShapeBase } from '../shape';
import { BBox, TextConfigs } from '../../typings/renderer';
import { measureText, getCharLen, getFontByConfigs } from '../utils/text';

export class Text extends ShapeBase {
  // 缓存文本避免重复计算
  private drawText: string[] | null = null;
  // 缓存文本字体
  private font: string | null = null;
  // 是否有文本溢出
  private overflow = false;

  constructor(configs: TextConfigs) {
    super(configs);
    this.type = 'text';
    this.configs.text += '';
  }
  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      text: '',
      x: 0,
      y: 0,
      fontSize: 12,
      fontFamily: 'sans-serif',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontVariant: 'normal',
      textAlign: 'start',
      textBaseline: 'middle',
      textOverflow: 'clip',
      fillStyle: '#666',
      lineWidth: 1,
    };
  }

  setConfig(key: string, value: any) {
    if (key === 'text') {
      value += '';
    }
    super.setConfig(key, value);
    // 如果设置了可能修改文字布局的属性，清空文本缓存
    if (['text', 'fontSize', 'fontFamily', 'fontWeight'].includes(key)) {
      this.drawText = null;
      this.font = null;
    }
    if (['width', 'height', 'textOverflow'].includes(key)) {
      this.drawText = null;
    }
  }

  getFont() {
    if (this.font) {
      return this.font;
    }
    this.font = getFontByConfigs(this.configs);
    return this.font;
  }

  getDrawText(): string[] {
    if (this.drawText) {
      return this.drawText;
    }
    this.overflow = false;
    const { width, height, text, textOverflow } = this.configs;
    const font = this.getFont();
    let textArr;
    if (text.indexOf('\n') >= 0) {
      textArr = text.split('\n');
    } else {
      textArr = [text];
    }
    // 如果没有设置宽度，直接按照文本朝向画完
    if (!width) {
      this.drawText = textArr;
      return textArr;
    }
    let lineCount = 1;
    // 如果有高度，根据高度和行高的关系计算能容纳几行
    if (height) {
      lineCount = Math.max(Math.floor(height / this.getLineHeight()), 1);
    }
    // 如果设置了溢出 ... 最后一行预留出宽度
    let restSpace = 0;
    if (textOverflow === 'ellipsis') {
      restSpace = getCharLen('.', font) * 3;
    }
    const result = [];
    let linePos = 1;
    let lineChar = '';
    for (const line of textArr) {
      let textWidth = width;
      if (linePos === lineCount) {
        // 距离够就直接放下
        if (measureText(line, this.configs) <= width) {
          result.push(line);
          break;
        } else {
          // 不够减去 ... 的空间继续遍历
          textWidth = width - restSpace;
        }
      }
      if (line.length === 0) {
        result.push(lineChar);
        linePos += 1;
        lineChar = '';
        continue;
      }
      const charWidth = getCharLen(line[0], font);
      // 一个字符都放不下的时候，如果配置了 ... 就返回 ...
      if (textWidth < charWidth) {
        this.overflow = true;
        if (textOverflow === 'ellipsis' && textWidth > 0) {
          result.push('...');
          break;
        }
      }
      // 否则一行至少绘制一个文字
      lineChar = line[0];
      textWidth -= charWidth;
      for (let i = 1; i < line.length; i++) {
        const char = line[i];
        const charLen = getCharLen(char, font);
        if (textWidth > charLen) {
          lineChar += char;
          textWidth -= charLen;
        } else {
          textWidth = width - charLen;
          linePos += 1;
          if (linePos === lineCount) {
            textWidth = width - restSpace - charLen;
          }
          if (linePos > lineCount) {
            this.overflow = true;
            if (textOverflow === 'ellipsis') {
              lineChar += '...';
            }
            result.push(lineChar);
            break;
          }
          result.push(lineChar);
          lineChar = char;
        }
      }
      if (linePos > lineCount) {
        this.overflow = true;
        break;
      }
      result.push(lineChar);
      linePos += 1;
      lineChar = '';
    }
    this.drawText = result;
    return result;
  }

  getLineHeight() {
    const { fontSize, lineHeight } = this.configs;
    if (lineHeight) {
      return lineHeight;
    }
    return fontSize * 1.5;
  }

  calculateBBox(): BBox {
    const text = this.get('text');
    if (text === '') {
      return {
        left: this.get('x'),
        top: this.get('y'),
        width: 0,
        height: 0,
      };
    }
    const drawText = this.getDrawText();
    const width = measureText(drawText, this.configs);
    const height = drawText.length * this.getLineHeight();
    const left = this.getStartPointX(width);
    const top = this.getStartPointY(height);
    return {
      left,
      top,
      width,
      height,
    };
  }

  getStartPointX(textLength: number): number {
    const { x, textAlign } = this.configs;
    let left: number;
    switch (textAlign) {
      case 'center':
        left = x - textLength / 2;
        break;
      case 'right':
      case 'end':
        left = x - textLength;
        break;
      default:
        left = x;
    }
    return left;
  }

  getStartPointY(height: number): number {
    const { y, textBaseline } = this.configs;
    let top: number;
    switch (textBaseline) {
      case 'top':
      case 'hanging':
        top = y;
        break;
      case 'middle':
        top = y - height / 2;
        break;
      default:
        top = y - height;
    }
    return top;
  }

  isOverflow() {
    if (!this.drawText) {
      this.getDrawText();
    }
    return this.overflow;
  }
}
