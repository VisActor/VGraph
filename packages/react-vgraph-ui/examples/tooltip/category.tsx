import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Graph, panZoom, DAGLayout, CategoryLegend } from '@visactor/vgraph';
import '@arco-design/web-react/dist/css/arco.css';
import { Tooltip } from '../../src';
import data from '../static/data.json';

(() => {
  const App = () => {
    const [graph, setGraph] = useState<Graph | null>(null);
    const [legend, setLegend] = useState<CategoryLegend | null>(null);
    useEffect(() => {
      const colors = ['#33d6cc', '#ffbc0a', '#ed55b0', '#33d6cc', '#8a77ed', '#5dcd81'];
      const g = new Graph({
        container: 'reactTooltipExample',
        width: 800,
        height: 600,
        minRatio: 0.3,
        maxRatio: 8,
        setDefaultNode(node: any) {
          return {
            type: 'category',
            radius: 2,
            width: 80,
            height: 20,
            color: colors[Math.round(Math.random() * 5)],
            label: {
              text: node.class,
              triggerId: 'triggerLabel',
            },
          };
        },
        setDefaultEdge() {
          return {
            type: 'line',
            strokeStyle: '#ddd',
            appendSize: 2,
          };
        },
      });
      g.addBehavior(panZoom);
      g.data(data);
      const dag = new DAGLayout({
        graph: g,
        rankDir: 'TB',
        nodeSep: 50,
        rankSep: 50,
      });
      g.refresh();
      g.fitView();
      setGraph(g);

      const category = new CategoryLegend(g, {
        container: 'category',
        encodeAttr: 'color',
        target: 'node',
        encodeStyles(nodeData) {
          return {
            marker: {
              type: 'circle',
              fillStyle: nodeData.color,
            },
            label: nodeData.color,
          };
        },
        width: 100,
        height: 300,
        hover: {
          enable: true,
          legendActiveState: 'active',
          legendBlurState: 'blur',
        },
        click: {
          enable: true,
          multiple: true,
          filter: true,
        },
        setLegendStateStyles(state: string, markerData: any) {
          if (state === 'active') {
            return {
              strokeStyle: markerData.fillStyle ? markerData.fillStyle : '#ccc',
              lineWidth: 3,
              textStyles: {
                fontWeight: 'bolder',
              },
            };
          }
          if (state === 'blur') {
            return {
              opacity: 0.3,
              textStyles: {
                opacity: 0.3,
              },
            };
          }
        },
      });
      setLegend(category);
    }, []);

    function getLegendContent(entity: any, shape: any) {
      return entity.get('encodeValue');
    }
    return (
      <div style={{ width: 1000, height: 600, position: 'relative' }} id="reactTooltipExample">
        {legend && <Tooltip legend={legend} getContent={getLegendContent} target="legend" position="right" />}
        <div id="category" style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }} />
      </div>
    );
  };
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
