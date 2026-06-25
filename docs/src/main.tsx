import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as VGraph from '@visactor/vgraph';
import * as ReactVGraph from '@visactor/react-vgraph';
import * as ReactVGraphUI from '@visactor/react-vgraph-ui';
import * as ArcoDesign from '@arco-design/web-react';
import * as ArcoDesignIcon from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';
import { App } from './app';

(window as any).VGraph = VGraph;
(window as any).ReactVGraph = ReactVGraph;
(window as any).ReactVGraphUI = ReactVGraphUI;
(window as any).ArcoDesign = ArcoDesign;
(window as any).ArcoDesignIcon = ArcoDesignIcon;

Object.assign(window as any, VGraph);
Object.assign(window as any, ReactVGraph);
Object.assign(window as any, ReactVGraphUI);

Object.assign(window as any, ArcoDesign);
Object.assign(window as any, ArcoDesignIcon);

(window as any).CONTAINER_ID = 'chart';
(window as any).React = React;
const ReactDOMCompat = Object.assign({}, ReactDOM, {
  render(element: any, container: Element | null) {
    if (!container) {
      return null;
    }
    const anyContainer = container as any;
    if (!anyContainer.__LIVE_DEMO_ROOT__) {
      anyContainer.__LIVE_DEMO_ROOT__ = createRoot(container);
    }
    anyContainer.__LIVE_DEMO_ROOT__.render(element);
    return anyContainer.__LIVE_DEMO_ROOT__;
  },
  unmountComponentAtNode(container: Element | null) {
    if (!container) {
      return;
    }
    const anyContainer = container as any;
    if (anyContainer.__LIVE_DEMO_ROOT__) {
      anyContainer.__LIVE_DEMO_ROOT__.unmount();
      anyContainer.__LIVE_DEMO_ROOT__ = null;
    }
  }
});
(window as any).ReactDom = ReactDOMCompat;
// React 18: keep createRoot while providing render compatibility.
(window as any).ReactDOM = Object.assign({}, ReactDOMCompat, { createRoot });

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
