# React Node Component
The React node component `Viewer` allows you to define nodes in the form of React components, mainly for graph analysis scenarios with **small amounts of data** that require **interactive node display**. Before using this component, please consider the following points:
- If it's a simple node style and does not contain complex UI such as tabs, it is encouraged to use vGraph's [built-in nodes](/vgraph/guide/node-spec/prebuilt) in conjunction with [atomic components](/vgraph/guide/node-addon-spec/tag) to implement custom node styles.
- `Viewer` comes with a local rendering configuration item (`localRendering`) to improve display performance, but the total number of DOMs (not nodes) on the screen should not exceed **2k**, as this may cause significant performance issues.
- After enabling local rendering, nodes only support **Stateless Components**. Business data should be stored on the node (`node.set`), and then the `Viewer`'s `refresh` method should be called to refresh the view. Alternatively, you can disable the local rendering configuration item to support **Stateful Components**.
- The component supports built-in connection and layout reorganization animations. For node animations, please use React's related mechanisms.

### Viewer Usage
`Viewer` will render React component nodes on the basis of Graph's data. Therefore, users can directly implement interactive logic according to the usage of Graph or TreeGraph, and then refresh the node styles in `Viewer` to achieve synchronous modification. `Viewer` will perceive built-in Graph interactions such as `panZoom` and automatically update the view, so you only need to manually refresh for custom interactions.
```javascript
import React, { useEffect, useState, useRef } from "react";
import { Graph, GraphEvent } from '@visactor/vgraph';
import { Viewer } from '@visactor/react-vgraph';

export default () => {
  // Graph instance
  const [graph, setGraph] = useState<null | Graph>(null);
  const viewer = useRef();

  useEffect(() => {
    const g = new Graph(...);
    setGraph(g);

    // Example of custom interaction: click a node to expand downstream data
    g.on('node:click', (e: GraphEvent) => {
      e.target.set('expand', true);
      expandNode(...);
      // Manually refresh the node view after updating the graph
      viewer.current.refresh();
    });
  }, []);

  return <div id="graphContainer">
    {graph && <Viewer graph={graph} ref={viewer} ...props />}
  </div>;
}
``` 

### Viewer Configuration
| Configuration Item | Type | Description |
| --- | --- | --- |
| graph | Graph \| TreeGraph | \[Required] Specifies the graph instance corresponding to the `Viewer`. |
| setNode | (node: Node) => ReactNode | \[Required] The React node component. |
| setNodeClassName | (node: Node) => string \| string[] | Adds a `className` to the node container. |
| setAnchor | (node: Node, anchor: AnchorConfigs) => ReactNode | The React anchor component. |
| setAnchorClassName | (node: Node) => string \| string[] | Adds a `className` to the anchor container. |
| setGroupTitle | (group: Group) => ReactNode | \[NEW] The React group title component. Please configure `titleSize` on the group to use it. |
| localRendering | boolean | Whether to enable local rendering. When enabled, nodes only support stateless components. When disabled, they support stateful components. Default is enabled. |
| hideDetails | object | When the zoom ratio is very small, there may be many nodes on the screen, and the content of these nodes is basically unreadable. You can configure this option to display summary information and improve fluency. |
| hideDetails.ratio | number | Hides node details when the zoom ratio is less than `ratio`. |
| hideDetails.getNodeStyles | (node: Node) => Record<string, any> | The CSS style to be added to the container when the node is hidden. This can be used to display node categories, etc., to help users quickly locate nodes when they are very small. |
| responsiveNode | boolean | Whether to enable responsive React nodes. If enabled, it will respond to changes in the width and height of React nodes and trigger the redrawing of connection positions. |
| onResizeNode | (node: Node, bbox: BBox) => void | The callback function for when the width and height of a node change. |

### Viewer ref Methods
| Method | Type | Description |
| --- | --- | --- |
| refresh | (forced=false) => void; | Refreshes the React view. `Viewer` will only automatically refresh when the graph is panned or zoomed. In other cases, please refresh manually as needed. When data is refreshed, it is recommended to set `force` to `true` to force a refresh once. |
| updateSize | () => void; | When the size of the graph instance changes, please call `updateSize` to keep the size of the component consistent. |
