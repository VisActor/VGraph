# Force-directed Basic Usage

Force-directed layout is a common layout algorithm mainly used for undirected graphs (or in directed graphs where the influence of hierarchical relationships on the layout is not a concern). The characteristics of force-directed layout are: simple and intuitive principles, easy implementation, and strong customization capabilities. It is often used to display the relationships of node connections and can be used for analysis of relationship networks, knowledge graphs, and relationship graphs.

This algorithm has built-in force functions that are applicable in most scenarios. Generally, you only need to use it as follows:

```javascript
import { Graph, ForceDirectedLayout } from '@visactor/vgraph';
const graph = new Graph(...);
const fdp = new ForceDirectedLayout({
      data: { nodes: [...], edges: [...] },
      onTick:()=>{graph.refresh();}
});
```

For detailed configuration, please refer to [ForceDirectedLayout](/vgraph/guide/layout-spec/force).
You can also experience the [automatic layout force-directed graph](/vgraph/demo/force/autoForce) to calculate the force configuration suitable for the current dataset based on the data.
