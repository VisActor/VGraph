# React Components
Analysis components can help users better understand data and discover data features. To better support business scenarios, vGraph has encapsulated and provided some common React components and will continue to supplement its analysis capabilities.

## Text Bubble Tooltip
The Tooltip is a common way to display supplementary information. vGraph provides an encapsulation based on Arco Design's Tooltip to improve development efficiency for React-based products.

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
| graph | Graph \| TreeGraph | \[Required] Specifies the graph object to which the tooltip is added. |
| getContent | (entity: any, shape: any) => string \| HTML | \[Required] The content of the tooltip, which supports string and HTML. |
| className | string | Adds a class name to the tooltip container. |
| style | object | Adds CSS styles to the tooltip. |
| target | 'node' \| 'edge' \| 'group' | The element that triggers the tooltip. Single selection. The default is 'node'. |
| triggerId | string | A local graphic responds to the tooltip. Only graphics containing the `triggerId` will trigger the tooltip. The Tooltip will be positioned based on this graphic. If `triggerId` is configured, hovering over other parts of the node/edge will not trigger the tooltip. |
| hideDelay | number | The delay for the tooltip to disappear. |
| visible | boolean | Whether the tooltip is visible, used for controlled mode. |
| onVisibleChange | (visible: boolean) => void | The callback triggered when the tooltip is shown or hidden. |

For more configuration items, please see [Arco Tooltip](https://arco.design/react/components/tooltip).

The following is an example of how to use [node label](/vgraph/guide/node-spec/options#Label) in conjunction with `triggerId`. When hovering over the node label, the corresponding tooltip will be displayed.
```javascript
import { Graph } from '@visactor/vgraph';
import { Tooltip } from '@visactor/react-vgraph-ui';

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

## Trigger
The Trigger listens for `hover` or `click` events on elements in the graph and pops up a dropdown box. In a graph, it is often used to pop up a configuration panel or menu bar when a node, edge, or some internal shape is clicked or hovered over. The simplest usage is as follows. When any node in the graph is clicked, a panel will pop up on the right side of the node.

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
| graph | Graph \| TreeGraph | \[Required] Specifies the graph object to which the tooltip is added. |
| popup | (entity: any, shape: any) => string \| HTML | \[Required] The content in the trigger container, which supports string and HTML. |
| trigger | 'hover' \| 'click' | The trigger method for the trigger. The default is `hover`. |
| target | 'node' \| 'edge' \| 'group' | The entity type that triggers the trigger. The default is 'node'. |
| triggerId | string | Specifies that the graphic containing the `triggerId` in the entity triggers the trigger. The Trigger will be positioned based on this graphic. If `triggerId` is configured, clicking on other parts of the node/edge will not trigger the trigger. |
| className | string | Adds a class name to the trigger container. |
| styles | object | Adds CSS styles to the trigger. |
| showDelay | number | The delay before the trigger appears, only effective for the `hover` type. |
| hideDelay | number | The delay before the trigger disappears, only effective for the `hover` type. For the `click` type, it will disappear immediately after clicking anywhere. |

For more configuration items, please see [Arco Trigger](https://arco.design/react/components/trigger).

The following is an example of how to use [node icon](/vgraph/guide/node-spec/options#Icons) in conjunction with `triggerId`. When the corresponding icon on the node is clicked, the trigger panel will pop up.
```javascript
import { Graph } from '@visactor/vgraph';
import { Trigger } from '@visactor/react-vgraph-ui';

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
            // iconfont reference corresponding to the icon
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

## Context Menu (Contextmenu)
The context menu is often used to carry functions for a single entity or the entire graph product, which can improve user operation efficiency. vGraph provides a Contextmenu for the React framework. Considering the different visual styles of various products, it only responds to the container's visibility, and the internal functions can be implemented by yourself.
```javascript
import { Contextmenu } from '@visactor/react-vgraph-ui';

<div id="graphContainerId">
  <Contextmenu graph={graph} getContent={getContent} targets={['node', 'edge']} />
</div>
```
| Configuration Item | Type | Description |
| --- | --- | --- |
| getContent | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* ReactNode | \[Required] The content of the context menu. |
| showContextmenu | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* boolean | Whether to show the context menu. The default is `true`. |
| targets | 'node' \|'edge' \|'group'\| string[] | The elements that trigger the context menu. The default is `['node']`. |
| style | Object | The CSS styles attached to the context menu container. |
| classNames | string \| string[] | The class names attached to the context menu container. |
