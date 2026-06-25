import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Graph, panZoom, DAGLayout } from '@visactor/vgraph';
import '@arco-design/web-react/dist/css/arco.css';
import { Trigger, Tooltip } from '../../src';
import data from '../static/data.json';
import './shape_demo.less';

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
            icons: [
              {
                setStyles(data: any) {
                  return {
                    triggerId: 'triggerIcon',
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
        setDefaultEdge() {
          return {
            type: 'line',
            strokeStyle: '#ddd',
            appendSize: 2,
          };
        },
      });
      // g.addBehavior(panZoom);
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
    }, []);

    function getEdgeContent(entity: any) {
      return `From ${entity.getSource().get('label')} to ${entity.getTarget().get('label')}`;
    }

    return (
      <div style={{ width: 1000, height: 600 }} id="reactTooltipExample">
        <Tooltip graph={graph} getContent={getEdgeContent} target="edge" />
        <Trigger
          graph={graph}
          trigger="contextMenu"
          target="node"
          position="right"
          popupAlign={{ right: 4 }}
          popup={(entity: any, shape: any) => {
            return (
              <div style={{ border: '1px solid #ccc' }}>
                {['Menu1', 'Menu2', 'Menu3'].map((item) => (
                  <div
                    onClick={(e) => {
                      console.log(item, e);
                    }}
                    key={item}
                    className="trigger-menu-item"
                  >
                    {item}
                  </div>
                ))}
              </div>
            );
          }}
        />
      </div>
    );
  };
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
