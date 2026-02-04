let renderer = 'canvas';

export function getRenderer() {
  return renderer;
}

export function setRenderer(newRenderer: 'canvas' | 'svg' | 'webgl') {
  renderer = newRenderer;
}