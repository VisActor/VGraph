import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Graph, panZoom, DAGLayout } from '@visactor/vgraph';
import '@arco-design/web-react/dist/css/arco.css';
import { Trigger, Tooltip } from '../../src';
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
            label: {
              text: node.label,
              triggerId: 'triggerLabel',
            },
            icons: [
              {
                setStyles(data: any) {
                  return {
                    fillStyle: 'blue',
                    cursor: 'pointer',
                    icon: '&#xe60a;',
                    triggerId: 'triggerIcon',
                  };
                },
                position: [1, 0.5],
                offset: [6, 0],
                show: 'always',
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
      g.data(data);
      g.addBehavior(panZoom);
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
    }, []);

    function getEdgeContent(entity: any) {
      return `From ${entity.getSource().get('label')} to ${entity.getTarget().get('label')}`;
    }

    return (
      <div style={{ width: 1000, height: 600 }} id="reactTooltipExample">
        <Tooltip graph={graph} getContent={getEdgeContent} target="edge" />
        <Trigger
          graph={graph}
          trigger="click"
          target="node"
          triggerId="triggerLabel"
          position="right"
          popup={(entity: any) => <div>{'id: ' + entity.get('id') + '-----'}</div>}
        />
        <Trigger
          graph={graph}
          trigger="click"
          target="node"
          triggerId="triggerIcon"
          position="rt"
          popupAlign={{ right: 4 }}
          clickToClose={true}
          popup={(entity: any, shape: any) => {
            // 测试 render 次数
            console.log('render popup');
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
