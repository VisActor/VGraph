# React hooks
vGraph provides classic hooks for React users to improve the development efficiency and experience of common logic. If the React hooks you need are not yet supported, please feel free to contact us.

### useNodes
Returns all current node instances. Components using this hook will re-render when nodes are added, updated, deleted, their positions are refreshed, the layout is re-run, or the data is reset. For the node API, please see [Node Instance Methods](/vgraph/guide/node-spec/api).
```javascript
import { useNodes } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const nodes = useNodes(graph);
 
  return <div>There are currently {nodes.length} nodes</div>;
}
``` 

### useEdges
Returns all current edge instances. Components using this hook will re-render when edges are added, updated, deleted, their positions are refreshed, the layout is re-run, or the data is reset. For the edge API, please see [Edge Instance Methods](/vgraph/guide/edge-spec/api).
```javascript
import { useEdges } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const edges = useEdges(graph);
 
  return <div>There are currently {edges.length} edges</div>;
}
``` 

### useZoomRatio
`useZoomRatio` can be used with common view control components. When the canvas zoom ratio is updated, the component will re-render. For usage, see the [demo](/vgraph/demo/reactNodes/useZoomRatio).
```javascript
import { useZoomRatio } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const [zoomRatio, setZoomRatio] = useZoomRatio();
 
  return <div>The current zoom ratio is {zoomRatio}</div>;
}
``` 

### useSelections
`useSelections` can be used with the [state mechanism](/vgraph/guide/states) to get the currently selected nodes, edges, and groups (`entity.hasState('select')`). It is used to trigger and refresh supplementary information such as sidebars. When the `select` state of an element in the graph changes, the component re-renders.
```javascript
import { useSelections } from '@visactor/react-vgraph';
 
export default function (graph: Graph) {
  const selections = useSelections(graph);
 
  return <div>The currently selected items are {selections.map(entity => entity.get('id')).join(',')}</div>;
}
``` 
