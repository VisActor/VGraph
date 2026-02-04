import { invert, pointMultiply, animationFrame } from '../utils';
import { LayerBase } from './layers/base';
import { AnimationConfigs, CanvasConfigs, Point } from '../typings/renderer';
import { getPainter, Painter } from './painters';
import EventManager from './events';
import AnimationManager from '../animations';
import { DownloadImageOptions } from '../typings/graph';

export class Canvas extends LayerBase {
  type = 'canvas';
  // 渲染组件
  painter: Painter;
  // 是否开启事件捕获
  capture = true;
  // 事件捕获组件
  eventManager: EventManager;
  // 动画组件
  animationManager: AnimationManager;
  // 视口控制容器
  viewportContainer: LayerBase;

  constructor(configs: CanvasConfigs) {
    super(configs);
    const painterClass = getPainter();
    this.painter = new painterClass(this);
    this.eventManager = new EventManager(this);
    this.animationManager = new AnimationManager(this);
    this.viewportContainer = this;
  }

  // 初始化画布容器
  init(configs: CanvasConfigs) {
    this.configs = configs;
    let parent = this.get('container');
    if (typeof parent === 'string') {
      parent = document.getElementById(parent);
    }
    const container = document.createElement('div');
    container.style.position = 'relative';
    parent.appendChild(container);
    this.set('container', container);
  }

  /**
   * Throttle repaint the canvas.
   * 节流重绘视图。xGraph 主要的渲染入口
   */
  draw() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    function throttleDraw() {
      self.directSet(
        'animateHandler',
        animationFrame(() => {
          self.directSet('animateHandler', undefined);
          if (self.get('toDraw')) {
            throttleDraw();
          }
        })
      );
      self.painter.beforeDraw();
      try {
        // const now = performance.now();
        self.painter.draw();
        self.emit('afterDraw');
      } catch (error) {
        console.warn(error);
        self.directSet('toDraw', false);
      }
      self.directSet('toDraw', false);
    }

    if (self.get('destroyed')) {
      return;
    }
    if (self.get('animateHandler')) {
      self.directSet('toDraw', true);
    } else {
      throttleDraw();
    }
  }

  /**
   * Export and download an image with all canvas contents.
   * 将 canvas 上所有内容导出成图片
   * @param {string} [name] - A string that specifies the name of the image to be
   * downloaded.
   * @param {number} [maxWidth] - The maximum width that the downloaded image should have.
   * @param {number} [maxHeight] - The maximum height that the downloaded image should have.
   * @param {number[]} [padding] - An array that specifies the padding values for the downloaded image.
   * The padding for the top, right, bottom, and left sides of the image, respectively.
   * @param [onDownloadFinish] - A callback function that will be called when the image download process is finished.
   * @param {string} [backgroundColor] - Specify the background color, default is `transparent`.
   */
  downloadImage(
    name?: string,
    maxWidth?: number,
    maxHeight?: number,
    padding?: number[],
    onDownloadFinish?: () => void,
    backgroundColor?: string
  ) {
    this.painter?.downloadImage(name, maxWidth, maxHeight, 1, padding, onDownloadFinish, backgroundColor);
  }

  downloadImageWithImgCheck(configs?: DownloadImageOptions) {
    this.painter?.downloadImageWithImageCheck(configs);
  }

  /**
   * Repaint the canvas immediately.
   * 直接重绘视图
   *
   */
  instantDraw() {
    this.directSet('toDraw', false);
    this.painter.beforeDraw();
    try {
      this.painter.draw();
      this.emit('afterDraw');
    } catch (error) {
      console.warn(error);
    }
  }

  /**
   * Set the width and height of the canvas.
   * @param {number} width - The new width value.
   * @param {number} height - The new height value.
   */
  changeSize(width: number, height: number) {
    const container = this.get('container');
    this.set('width', width);
    this.set('height', height);
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    this.painter.setSize();
  }

  /**
   * Reset the viewport transform. Shape transform will not be changed.
   * 重置 canvas 上的变换矩阵
   */
  resetMatrix() {
    this.painter.resetMatrix();
  }

  /**
   * Return the visible canvas size in pixels.
   * 获取正在视窗中的 canvas 尺寸
   */
  getViewport() {
    const { width, height } = this.configs;
    const matrix = this.viewportContainer.getMatrix();
    let pixelRatio = 1;
    if (this.viewportContainer === this) {
      pixelRatio = this.get('pixelRatio') || 1;
    }

    return {
      left: -matrix[4] / matrix[0] / pixelRatio,
      top: -matrix[5] / matrix[3] / pixelRatio,
      width: (width / matrix[0]) * pixelRatio,
      height: (height / matrix[3]) * pixelRatio,
    };
  }

  setCapture(capture: boolean) {
    this.capture = capture;
  }

  getCanvasDom() {
    return this.painter.getDomNode();
  }

  canvasCoordToPoint(point: Point): Point {
    const matrix = this.viewportContainer.getMatrix();
    return pointMultiply(point, matrix);
  }

  pointCoordToCanvas(point: Point): Point {
    const matrix = [...this.viewportContainer.getMatrix()];
    const invertMatrix = invert(matrix);
    if (invertMatrix) {
      return pointMultiply(point, invertMatrix);
    }
    return point;
  }

  clientToCanvas(clientX: number, clientY: number): Point {
    const canvasDom = this.getCanvasDom();
    const bbox = canvasDom.getBoundingClientRect();
    const width = bbox.right - bbox.left;
    const height = bbox.bottom - bbox.top;
    return {
      x: (clientX - bbox.left) * (canvasDom.width / width),
      y: (clientY - bbox.top) * (canvasDom.height / height),
    };
  }

  animate(configs: AnimationConfigs): string {
    return this.animationManager.addAnimator(configs);
  }

  setViewportContainer(layer: LayerBase) {
    this.viewportContainer = layer;
  }

  stopAnimate(uuid?: string) {
    if (uuid) {
      this.animationManager.removeAnimator(uuid);
    } else {
      this.animationManager.stop();
    }
  }

  destroy() {
    this.painter.destroy();
    this.eventManager.destroy();
    this.animationManager.destroy();
    this.get('container').remove();
    super.destroy();
  }
}
