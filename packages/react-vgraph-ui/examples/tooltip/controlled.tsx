import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Graph } from '@visactor/vgraph';
import '@arco-design/web-react/dist/css/arco.css';
import { Tooltip } from '../../src';

const nodes: Record<string, any>[] = [];
const edges: Record<string, any>[] = [];

for (let i = 0; i < 20; i++) {
  nodes.push({
    id: `${i}`,
    x: 100 * i,
    y: 100,
  });
}

for (let i = 1; i < 20; i++) {
  edges.push({
    source: `${i - 1}`,
    target: `${i}`,
  });
}

(() => {
  const App = () => {
    const [graph, setGraph] = useState<Graph | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
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
            label: {
              text: node.id,
              triggerId: 'triggerLabel',
            },
          };
        },
      });
      g.data({ nodes, edges });
      setGraph(g);
      g.on('node:click', () => {
        setVisible(false);
      });
    }, []);
    function getLabelContent(entity: any, shape: any) {
      return entity.get('id');
    }

    function getEdgeContent(entity: any, shape: any) {
      return `From ${entity.getSource().get('id')} to ${entity.getTarget().get('id')}`;
    }

    return (
      <div style={{ width: 500, height: 400, overflow: 'auto' }} id="reactTooltipExample">
        <Tooltip
          graph={graph}
          getContent={getLabelContent}
          target="node"
          triggerId="triggerLabel"
          relative={false}
          visible={visible}
          onVisibleChange={(toShow: boolean) => {
            setVisible(toShow);
          }}
        />
        <Tooltip graph={graph} getContent={getEdgeContent} target="edge" relative={false} />
      </div>
    );
  };
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
