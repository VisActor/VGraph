# Tooltip
Tooltip is a commonly used way to display auxiliary information. vgraph provides an encapsulation of Arco Design Tooltip to improve the development efficiency of products developed based on React.

```javascript
import { Tooltip } from '@visactor/react-vgraph-ui';

<div style={{ width: 1000, height: 600 }} id="reactTooltipExample">
  <Tooltip
    graph={graph}
    getContent={(entity: any, shape: any) => string | ReactNode}
    target='edge'
    hideDelay={300}
    />
</div>
```

| Configuration Item | Type | Description |
| --- | --- | --- |
| graph | Graph \| TreeGraph | **[Required]** Specify the graph object to which the tooltip is added |
| getContent | (entity: any, shape: any ) => string \| HTML | **[Required]** Tooltip content, supports string and html |
| className | string | Add a class name to the tooltip container |
| styles | object | Add css styles to the tooltip |
| target | 'node' \| 'edge' \| 'group' | The element that triggers the tooltip, single selection. Default is 'node' |
| triggerId | string | Local graphics respond to tooltips. Only graphics that contain `triggerId` in the entity will trigger the tooltip. The tooltip will be positioned based on this graphic. If `triggerId` is configured, hovering over other parts of the node/edge will not trigger the tooltip |
| hideDelay | number | The delay for the tooltip to disappear |

For more configuration items, please see [Arco Tooltip](https://arco.design/react/components/tooltip).

The following is an example of how to use [node label](/vgraph/guide/node-spec/options#Label) with `triggerId`. The corresponding tooltip will be displayed when hovering over the node label.
```javascript
import { Graph } from '@visactor/vgraph';
import { Tooltip } from '@visactor/react-vgraph';

const graph = new Graph({
  container: 'graphContainer',
  setDefaultNode(node) {
    return {
      type: 'category',
      radius: 2,
      width: 80,
      height: 20,
      label: {
        text: node.name,
        // Specify triggerId, Tooltip will match and position based on this field
        triggerId: 'triggerLabel',
      },
    };
  },
  ...,
});

function getLabelContent(entity: any, shape: any) {
  return `${entity.get('name')}: ${entity.get('class')}`;
}

<div id="graphContainer">
  <Tooltip
    graph={graph}
    getContent={getLabelContent}
    target="node"
    // Corresponds to the triggerId configured in the label
    triggerId="triggerLabel"
    hideDelay={300}
  />
</div>
```
