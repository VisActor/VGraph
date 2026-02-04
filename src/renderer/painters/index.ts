import CanvasPainter from './canvas';
import { DownloadImageOptions } from '../../typings/graph';

export interface Painter {
  container: HTMLDivElement;

  init: () => void;

  getDomNode: () => any;
  setSize: () => void;
  resetMatrix: () => void;
  beforeDraw: () => void;
  draw: () => void;
  afterDraw: () => void;
  downloadImage: (name?: string, maxWidth?: number, maxHeight?: number, scale?: number, padding?: number[], onDownloadFinish?: () => void, backgroundColor?: string) => void;
  downloadImageWithImageCheck: (options?: DownloadImageOptions) => void;
  destroy: () => void;
}

export function getPainter(renderer = 'canvas') {
  return CanvasPainter;
}
