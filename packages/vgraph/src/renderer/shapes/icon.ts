import { BBox, IconConfigs } from "../../typings/renderer";
import { ShapeBase } from "../shape";

export class Icon extends ShapeBase {
  constructor(configs: IconConfigs) {
    super(configs);
    this.type = "icon";
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
      icon: "",
      textBaseline: "middle",
      textAlign: "center",
      fontFamily: "iconfont",
    };
  }

  getIconText(text: string) {
    const match = /^&#(x[0-9a-fA-F]+|\d+);$/.exec(text);
    if (!match) {
      return text;
    }

    const codePoint =
      match[1][0].toLowerCase() === "x"
        ? parseInt(match[1].slice(1), 16)
        : parseInt(match[1], 10);

    if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
      return text;
    }

    if (codePoint <= 0xffff) {
      return String.fromCharCode(codePoint);
    }

    const offset = codePoint - 0x10000;
    return String.fromCharCode(
      0xd800 + (offset >> 10),
      0xdc00 + (offset & 0x3ff)
    );
  }

  setConfig(key: string, value: any): void {
    super.setConfig(key, value);
    // 如果设置了可能修改文字布局的属性，清空文本缓存
    if (key === "icon") {
      this.configs.iconText = this.getIconText(value);
    }
  }

  calculateBBox(): BBox {
    const { x, y, size } = this.configs;
    return {
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
    };
  }
}
