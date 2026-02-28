# Count Badge
vGraph has carefully designed common interactions in relationship graphs and has precipitated them into tools for easy reuse. The count badge is mostly used in tree graphs to display the number of collapsed nodes when a node collapses its children. The count badge tool will automatically adapt to the text length, and clicking on the number will expand the children again. You can experience this in the [Compact Tree Collapse/Expand](/vgraph/demo/practiceCases/CompactBox) demo.

```javascript
import { CountBadgeUtils } from '@visactor/vgraph';
// Initialize the node's badge
badgeLayer = CountBadgeUtils.init(node, options);
// Destroy the corresponding badge on the node
CountBadgeUtils.remove(node, badgeLayer);
```
The count badge configuration is as follows:

| Field | Type | Description |
| --- | --- | --- |
| text | string | \[Required] The text displayed on the badge. |
| position | 'left' \| 'right' \| 'top' \| 'bottom' | The positioning of the badge. It currently supports the four directions of top, bottom, left, and right of the node. The default is the right side. |
| color | string | The theme color of the badge. |
| label | | The text style configuration of the badge. |
| label.fillStyle | string | The text color of the badge. |
| label.fontSize | number | The font size of the badge text. |
| label.fontFamily | string | The font family of the badge text. |
| background | | The background configuration of the badge text. |
| background.fillStyle | string | The background color of the badge text. |
| background.strokeStyle | string | The border color of the badge text. |
| background.radius | number | The border radius of the badge text. |
| onMouseEnter | (e: GraphEvent) => void | The mouse enter event of the badge. |
| onMouseLeave | (e: GraphEvent) => void | The mouse leave event of the badge. |
| onClick | (e: GraphEvent) => void | The click event of the badge. |
