import { isGradient, changedMatrix } from '../../../utils/';
import { ShapeBase } from '../../shape';
import { Rect } from '../../shapes/rect';
import { LayerBase } from '../../layers/base';
import LAYER_TYPES from '../../../consts/layer_types';
import SHAPE_TYPES from '../../../consts/shape_types';
import { GRAPH_EVENTS } from '../../../consts/meta_events';
import { Painter } from '..';
import { CANVAS_DRAW_CONFIGS, COLOR_CONFIGS } from '../../../consts/canvas_configs';
import { BBox } from '../../../typings/renderer';
import { DownloadImageOptions } from '../../../typings/graph';
import shapePaths from './shape_path';
import { getGradient } from '../../utils/gradients';

const regexPR = /^p\s*\(\s*([axyn])\s*\)\s*(.*)/i;
const NOT_READY = 'NOT_READY';
const ERROR = 'ERROR';

export default class CanvasPainter implements Painter {
  container: HTMLDivElement;
  canvasDom: HTMLCanvasElement;
  canvas: any;
  ctx: any;
  imgCache: any = {};

  constructor(canvas: any) {
    this.container = canvas.get('container');
    this.canvasDom = document.createElement('canvas');
    this.ctx = this.canvasDom.getContext('2d');
    this.canvas = canvas;
    this.container.appendChild(this.canvasDom);
    this.init();
  }

  downloadImageWithImageCheck(options: DownloadImageOptions = {}, waitTime = 0) {
    const { maxWaitTime } = options;
    // 确保所有图片已进入 imgCache
    const canvas = this.canvas;
    const container = canvas.viewportContainer;
    const imgCache = this.imgCache;
    this.drawLayer(canvas, container.getBBox());
    let onDownloadFinish = options.onDownloadFinish;
    // 超时处理，返回导出失败图片
    if (maxWaitTime && waitTime > maxWaitTime) {
      const failImgs = [];
      for (const key of Object.keys(imgCache)) {
        if (imgCache[key] === NOT_READY || imgCache[key] === ERROR) {
          failImgs.push(key);
        }
      }
      if (onDownloadFinish && failImgs.length) {
        onDownloadFinish = onDownloadFinish.bind(null, failImgs);
      }
    } else {
      for (const value of Object.values(imgCache)) {
        if (value === NOT_READY) {
          console.warn('Slow network is detected. Waiting for loading images.');
          setTimeout(() => {
            this.downloadImageWithImageCheck(options, waitTime + 200);
          }, 200);
          return;
        }
      }
    }
    this.downloadImage(options.name, options.maxWidth, options.maxHeight, options.scale, options.padding, onDownloadFinish, options.backgroundColor);
  }

  downloadImage(name?: string, maxWidth?: number, maxHeight?: number, scale = 1, padding?: number[], onDownloadFinish?: () => void, backgroundColor?: string) {
    setTimeout(() => {
      const ctx = this.ctx;
      const container = this.canvas.viewportContainer;
      const matrix = container.getMatrix();
      container.setMatrix([1, 0, 0, 1, 0, 0]);
      const imagePadding = padding ?? [0, 0, 0, 0];
      const paddingWidth = imagePadding[1] + imagePadding[3];
      const paddingHeight = imagePadding[0] + imagePadding[2];
      const bbox = container.getBBox();
      const { left, top } = bbox;
      const drawWidth = Math.min((maxWidth || 10000), bbox.width);
      const drawHeight = Math.min((maxHeight || 10000), bbox.height);
      const width = drawWidth + paddingWidth;
      const height = drawHeight + paddingHeight;
      const paddingLeft = left - imagePadding[3];
      const paddingTop = top - imagePadding[0];
      let rect = null;
      if (backgroundColor) {
        rect = new Rect({
          left: paddingLeft,
          top: paddingTop,
          width,
          height,
          fillStyle: backgroundColor,
        });
        container.add(rect);
        rect.toBack();
      }

      const scaleRatio = 2 * scale;
      let ratio = 1;
      if (drawWidth < bbox.width || drawHeight < bbox.height) {
        ratio = Math.min(drawWidth / bbox.width, (drawHeight) / bbox.height);
      }
      container.translate(-paddingLeft, -paddingTop);
      container.scale(ratio * scaleRatio);
      const canvas = document.createElement('canvas');
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.setAttribute('width', `${width * scaleRatio}px`);
      canvas.setAttribute('height', `${height * scaleRatio}px`);
      this.ctx = canvas.getContext('2d');
      this.drawLayer(container, bbox);
      const imageDataUrl = canvas.toDataURL('image/png', 1);
      const a = document.createElement('a');
      a.download = name || 'xgraph.png';
      a.href = imageDataUrl;
      a.click();
      this.ctx = ctx;
      container.setMatrix(matrix);
      rect?.destroy();
      onDownloadFinish?.();
    }, 16);
  }

  init() {
    const canvas = this.canvas;
    const pixelRatio = canvas.get('pixelRatio');
    if (!pixelRatio) {
      canvas.set('pixelRatio', window.devicePixelRatio ? window.devicePixelRatio : 2);
    }
    this.setSize();
    this.resetMatrix();
  }

  getDomNode() {
    return this.canvasDom;
  }

  destroy() {
    this.container.removeChild(this.canvasDom);
  }

  setSize() {
    const canvasDom = this.canvasDom;
    const canvas = this.canvas;
    const width = canvas.get('width');
    const height = canvas.get('height');
    const pixelRatio = canvas.get('pixelRatio');
    canvasDom.style.width = `${width}px`;
    canvasDom.style.height = `${height}px`;
    canvasDom.setAttribute('width', `${width * pixelRatio}px`);
    canvasDom.setAttribute('height', `${height * pixelRatio}px`);
  }

  resetMatrix() {
    const canvas = this.canvas;
    const pixelRatio = canvas.get('pixelRatio');
    canvas.setMatrix([1, 0, 0, 1, 0, 0]);
    canvas.scale(pixelRatio, pixelRatio);
  }

  beforeDraw() {
    const ctx = this.ctx;
    const canvasDom = this.canvasDom;
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height);
  }

  draw() {
    const canvas = this.canvas;
    canvas.emit(GRAPH_EVENTS.DRAW_START);
    const viewport = canvas.getViewport();
    this.drawLayer(canvas, viewport);
    canvas.emit(GRAPH_EVENTS.DRAW_END);
  }

  drawLayer(layer: any, viewport: BBox) {
    if (!layer.shouldDraw(viewport)) {
      return;
    }
    this.setLayerCtx(layer);
    if (layer.type === LAYER_TYPES.GROUP && layer.shape) {
      layer.shape.configs = { ...layer.shape.configs, ...layer.getBBox() };
      this.drawShape(layer.shape);
    }
    for (const child of layer.children) {
      if (!child.isLayer()) {
        this.drawShape(child);
      } else {
        this.drawLayer(child, viewport);
      }
    }
    this.ctx.restore();
  }

  drawShape(shape: ShapeBase) {
    if (!shape.shouldDraw()) {
      return;
    }
    this.setShapeCtx(shape);
    this.drawShapePath(shape);
    this.ctx.restore();
  }

  setLayerCtx(layer: LayerBase) {
    const ctx = this.ctx;
    ctx.save();
    this.setTransform(layer);
    // TODO 统一设置 layer 中的绘图属性，可被 children 属性覆盖
    const { opacity } = layer.configs;
    if (opacity) {
      this.ctx.globalAlpha = opacity;
    }
    const clip = layer.get('clip');
    if (clip) {
      this.setTransform(clip);
      this.drawShapePath(clip);
      ctx.clip();
    }
  }

  setShapeCtx(shape: ShapeBase) {
    const ctx = this.ctx;
    ctx.save();
    const clip = shape.get('clip');
    if (clip) {
      this.setTransform(clip);
      this.drawShapePath(clip);
      ctx.clip();
    }
    this.setTransform(shape);
    this.setDrawStyle(shape);
  }

  afterDraw() {
    this.canvas.emit('refreshed');
  }

  setTransform(shape: ShapeBase) {
    const m = shape.getMatrix();
    if (shape.get('fixed')) {
      const pixelRatio = this.canvas.get('pixelRatio');
      this.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    } else if (m && changedMatrix(m)) {
      this.ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }
  }

  setDrawStyle(shape: ShapeBase) {
    const configs = shape.configs;
    const ctx = this.ctx;
    for (const key in configs) {
      if (CANVAS_DRAW_CONFIGS[key]) {
        const value = configs[key];
        if (COLOR_CONFIGS.includes(key)) {
          if (isGradient(value)) {
            ctx[CANVAS_DRAW_CONFIGS[key]] = this.getGradient(value, shape);
          } else {
            ctx[CANVAS_DRAW_CONFIGS[key]] = configs[key];
          }
        } else {
          ctx[CANVAS_DRAW_CONFIGS[key]] = configs[key];
        }
      } else if (key === 'lineDash' && configs[key]) {
        let lineDash = configs[key];
        if (typeof lineDash === 'number') {
          lineDash = [lineDash];
        }
        ctx.setLineDash(lineDash);
      }
    }
  }

  getGradient(color: string, shape: ShapeBase) {
    if (color[0] === 'p') {
      const arr = regexPR.exec(color);
      if (!arr) {
        return null;
      }
      let repeat = arr[1];
      const source = arr[2];
      switch (repeat) {
        case 'a':
          repeat = 'repeat';
          break;
        case 'x':
          repeat = 'repeat-x';
          break;
        case 'y':
          repeat = 'repeat-y';
          break;
        case 'n':
          repeat = 'no-repeat';
          break;
        default:
          repeat = 'no-repeat';
      }
      const image = this.imgCache[source];
      if (image) {
        if (image !== NOT_READY && image !== ERROR) {
          const p = this.ctx.createPattern(image, repeat);
          shape[color] = p;
          return p;
        }
      } else {
        this.loadImage(source, shape.get('crossOrigin'), (img: any) => {
          const p = this.ctx.createPattern(img, repeat);
          shape[color] = p;
        });
      }
    } else {
      if (typeof color === 'string') {
        return getGradient(color, shape, this.ctx);
      }
      return color;
    }
  }

  drawShapePath(shape: ShapeBase) {
    const ctx = this.ctx;
    switch (shape.type) {
      case SHAPE_TYPES.RECT:
        shapePaths.rectPath(ctx, shape);
        break;
      case SHAPE_TYPES.CIRCLE:
        shapePaths.circlePath(ctx, shape);
        break;
      default:
      case SHAPE_TYPES.PATH:
        shapePaths.pathPath(ctx, shape);
        break;
      case SHAPE_TYPES.IMAGE:
        // eslint-disable-next-line no-case-declarations
        const url = shape.get('url');
        // eslint-disable-next-line no-case-declarations
        const img = shape.get('img') || this.imgCache[url];
        if (img) {
          if (img !== NOT_READY && img !== ERROR) {
            shapePaths.imagePath(ctx, shape, img);
          }
        } else {
          this.loadImage(url, shape.get('crossOrigin') !== undefined ? shape.get('crossOrigin') : 'anonymous');
        }
        break;
      case SHAPE_TYPES.TEXT:
        shapePaths.textPath(ctx, shape);
        break;
      case SHAPE_TYPES.QUADRATIC:
        shapePaths.quadraticPath(ctx, shape);
        break;
      case SHAPE_TYPES.CUBIC:
        shapePaths.cubicPath(ctx, shape);
        break;
      case SHAPE_TYPES.ICON:
        shapePaths.iconPath(ctx, shape);
        break;
      case SHAPE_TYPES.POLYGON:
        shapePaths.polygonPath(ctx, shape);
        break;
      case SHAPE_TYPES.RHOMBUS:
        shapePaths.rhombusPath(ctx, shape);
        break;
    }

    // text 多段，在 textPath 中处理
    if (shape.type !== 'text' && shape.configs.fillStyle) {
      ctx.fill();
    }
    if (shape.type !== 'text' && shape.configs.strokeStyle) {
      ctx.stroke();
    }
  }

  loadImage(url: string, crossOrigin = 'anonymous', callback?: any) {
    const image = new Image();

    if (!url.match(/^data:/i)) {
      image.crossOrigin = crossOrigin;
    }
    this.imgCache[url] = NOT_READY;
    image.onload = () => {
      this.imgCache[url] = image;
      if (callback) {
        callback(image);
      }
      this.canvas.draw();
    };
    image.onerror = (e: any) => {
      this.imgCache[url] = ERROR;
    }
    image.src = url;
  }
}
