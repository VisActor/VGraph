import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Graph, panZoom, DAGLayout } from '@visactor/vgraph';
import '@arco-design/web-react/dist/css/arco.css';
import data from './static/data.json';
import { Contextmenu } from '../src';

(() => {
  const App = () => {
    const [graph, setGraph] = useState<Graph | null>(null);

    useEffect(() => {
      const colors = ['#33d6cc', '#ffbc0a', '#ed55b0', '#33d6cc', '#8a77ed', '#5dcd81'];
      const g = new Graph({
        container: 'reactTooltipExample',
        width: 1000,
        height: 800,
        minRatio: 0.3,
        maxRatio: 8,
        setDefaultNode(node: any) {
          return {
            type: 'category',
            radius: 2,
            width: 80,
            height: 20,
            color: colors[Math.round(Math.random() * 5)],
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
    }, []);

    function getContent(entity: any, type: string) {
      if (type === 'edge') {
        return (
          <div style={{ width: 100, height: 60 }}>
            {`From ${entity.getSource().get('label')} to ${entity.getTarget().get('label')}`}
          </div>
        );
      }
      return (
        <div style={{ width: 100, height: 60 }}>
          `${entity.get('label')}: ${entity.get('class')}`
        </div>
      );
    }

    return (
      <div style={{ width: 1000, height: 600 }} id="reactTooltipExample">
        <Contextmenu graph={graph} getContent={getContent} targets={['node', 'edge']} />
      </div>
    );
  };
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
