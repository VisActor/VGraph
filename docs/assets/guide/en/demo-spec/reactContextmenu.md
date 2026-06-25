# Contextmenu
The context menu is often used to carry functions for a single entity or the overall graph product, which can improve user operation efficiency. vgraph provides a Contextmenu for the React framework. Due to the different visual styles of various products, it only responds to the container's show/hide, and the internal functions can be implemented by yourself.
```javascript
import { Contextmenu } from '@visactor/react-vgraph-ui';

<div id="graphContainerId">
  <Contextmenu graph={graph} getContent={getContent} targets={['node', 'edge']} />
</div>
```
| Configuration Item | Type | Description |
| --- | --- | --- |
| getContent | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* ReactNode | **[Required]** Context menu content |
| showContextmenu | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* boolean | Whether to show the context menu, default returns true |
| targets | 'node' \|'edge' \|'group'\| string[] | The element that triggers the context menu, default is \['node'] |
| style | Object | CSS style attached to the context menu container |
| classNames | string \| string[] | Class name attached to the context menu container |
