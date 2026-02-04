import { BBox, IconConfigs } from '../../typings/renderer';
import { ShapeBase } from '../shape';

export class Icon extends ShapeBase {
  constructor(configs: IconConfigs) {
    super(configs);
    this.type = 'icon';
    if (configs.icon) {
      this.configs.iconText = this.getIconText(configs.icon);
    }
  }
  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      x: 0,
      y: 0,
      size: 16,
      icon: '',
      textBaseline: 'middle',
      textAlign: 'center',
      fontFamily: 'iconfont',
    };
  }

  getIconText(text: string) {
    let iconText = text;
    try {
      // tslint:disable-next-line: no-eval
      iconText = eval('("' + text.replace('&#x', '\\u').replace(';', '') + '")');
    } catch (e) {
      console.warn(e);
    }
    return iconText;
  }

  setConfig(key: string, value: any): void {
    super.setConfig(key, value);
    // 如果设置了可能修改文字布局的属性，清空文本缓存
    if (key === 'icon') {
      this.configs.iconText = this.getIconText(value);
    }
  }

  calculateBBox():BBox {
    const { x, y, size } = this.configs;
    return {
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
    }
  }
}
