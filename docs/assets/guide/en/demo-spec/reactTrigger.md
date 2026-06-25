# Trigger
The Trigger listens for hover or click events on elements in the graph and pops up a dropdown box. In a graph, it is often used to pop up a configuration panel or menu bar when a node/edge, or some internal shape is clicked or hovered over. The simplest usage is as follows. When any node in the graph is clicked, a panel will pop up on the right side of the node.

```javascript
import { Trigger } from '@visactor/react-vgraph-ui';

<div id="graphContainerId">
  <Trigger
    graph={graph}
    target="node"
    trigger="click"
    position="right"
    popupAlign={{ right: 6 }}
    popup={(entity) => <div>you just clicked {entity.get('id')}</div>}
    />
</div>
```

| Configuration Item | Type | Description |
| --- | --- | --- |
| graph | Graph \| TreeGraph | **[Required]** Specify the graph object to which the tooltip is added |
| popup | (entity: any, shape: any) => string \| HTML | **[Required]** The content in the trigger container, supports string and html |
| trigger | 'hover' \| 'click' | The trigger method for the trigger, default is hover |
| target | 'node' \| 'edge' \| 'group' | The entity type that triggers the trigger, default is 'node' |
| triggerId | string | Specifies that the trigger is triggered by a graphic in the entity that contains `triggerId`. The Trigger will be positioned based on this graphic. If `triggerId` is configured, clicking on other parts of the node/edge will not trigger the trigger |
| className | string | Add a class name to the trigger container |
| styles | object | Add css styles to the trigger |
| hideDelay | number | The delay for the trigger to disappear, only effective for the hover type. For the click type, it will disappear immediately after clicking anywhere. |


For more configuration items, please see [Arco Trigger](https://arco.design/react/components/trigger)

The following is an example of how to use [node icon](/vgraph/guide/node-spec/options#Icons) with `triggerId`. The trigger panel will pop up when the corresponding icon on the node is clicked.
```javascript
import { Graph } from '@visactor/vgraph';
import { Trigger } from '@visactor/react-vgraph';

const graph = new Graph({
  container: 'graphContainer',
  setDefaultNode() {
    return {
      icons: [{
        setStyles() {
          return {
            // Specify triggerId, Trigger will match and position based on this field
            triggerId: 'triggerIcon',
            fillStyle: 'blue',
            cursor: 'pointer',
            // The iconfont reference corresponding to the icon
            icon: '&#xe60a;',
          };
        },
        // icon position
        position: [1, 0.5],
        offset: [6, 0],
        // icon display mode
        show: 'hover',
      }],
    }
  },
  ...,
});

<div id="graphContainer">
  <Trigger
    graph={graph}
    trigger="click"
    // Corresponds to the triggerId configured in the icon
    triggerId="triggerIcon"
    target="node"
    popup={entity => <div>you clicked {entity.get('id')}</div>}
   />
</div>
```
