import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Graph, panZoom, DAGLayout } from '@visactor/vgraph';
import '@arco-design/web-react/dist/css/arco.css';
import { Tooltip } from '../../src';
import data from '../static/data.json';

(() => {
  const App = () => {
    const [graph, setGraph] = useState<Graph | null>(null);
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
            label: node.class,
            icons: [
              {
                setStyles(data: any) {
                  return {
                    triggerId: 'triggerLabel',
                    fillStyle: 'blue',
                    cursor: 'pointer',
                    icon: '&#xe60a;',
                  };
                },
                position: [1, 0.5],
                offset: [6, 0],
                show: 'hover',
              },
            ],
          };
        },
        setNodeStateStyles(state: string) {
          if (state === 'hover') {
            return { strokeStyle: '#3073FF' };
          }
          return {};
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
        options: {
          rankDir: 'TB',
          nodeSep: 50,
          rankSep: 50,
        },
      });
      g.refresh();
      g.fitView();
      setGraph(g);

      g.on('node:mouseenter', (e) => {
        e.target.setState('hover');
      });

      g.on('node:mouseleave', (e) => {
        e.target.removeState('hover');
      });
    }, []);

    function getLabelContent(entity: any, shape: any) {
      return `${entity.get('class')}`;
      //return `${shape.get('text')}: ${entity.get('class')}`;
    }
    function getEdgeContent(entity: any, shape: any) {
      return `From ${entity.getSource().get('name')} to ${entity.getTarget().get('name')}`;
    }

    return (
      <div style={{ width: 1000, height: 600 }} id="reactTooltipExample">
        <Tooltip
          graph={graph}
          getContent={getLabelContent}
          target="node"
          // triggerId="triggerLabel"
          triggerProps={{ mouseLeaveDelay: 200 }}
        />
        <Tooltip graph={graph} getContent={getEdgeContent} target="edge" />
      </div>
    );
  };
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
