# Tag Tool
Custom nodes are one of the biggest pain points in developing graph visualization applications. vGraph has summarized common custom node components from business scenarios and abstracted them into configurable tool methods to help everyone solve some visual effects that are not easy to implement.

Tags are often used in custom nodes and can be configured with icons that have business meaning, as well as add/close functions. You can generate a single tag or a row of tags, with built-in overflow handling. You can experience this in the [custom node with tags](/vgraph/demo/nodes/customTagNode) demo.

```javascript
import { TagUtils, Layer } from '@visactor/vgraph';

// container is the tag container, which is generally the Layer parameter passed in by the node's custom method
const container = new Layer({...});

// Generate a single tag
const tagLayer = TagUtils.initTag(container, tagOption);

// Remove a single tag
TagUtils.removeTag(tagLayer);
```

The configuration for a single tag is as follows:

| Field | Type | Description |
| --- | --- | --- |
| text | string | \[Required] The text displayed on the tag. |
| left | number | \[Required] The horizontal coordinate of the top-left corner of the tag. |
| top | number | \[Required] The vertical coordinate of the top-left corner of the tag. |
| maxWidth | number | The maximum width of the tag. |
| theme | 'rect' \| 'capsule' | The style of the tag. The default is rectangle. |
| label | | The custom style of the tag text. |
| label.fillStyle | string | The color of the tag text. |
| label.fontSize | number | The font size of the tag text. |
| label.lineHeight | number | The line height of the tag text. |
| label.triggerId | string | Used to bind with a tooltip. |
| label.fontFamily | string | The font family of the badge text. |
| background | | The background configuration of the tag. |
| background.fillStyle | string | The background fill color of the tag. |
| background.strokeStyle | string | The background border color of the tag. |
| background.padding | number \| number[] | The padding around the tag. |
| background.radius | number | The border radius of the tag. |
| icon | number | The configuration for the icon on the left of the tag. |
| icon.icon | string | The iconfont reference for the icon on the left of the tag. |
| icon.fillStyle | number | The color of the icon on the left of the tag. |
| icon.size | number | The size of the icon on the left of the tag. |
| icon.onClick | (e: GraphEvent, layer: Layer) => void | The click event for the icon on the left of the tag. |
| close | number | The configuration for the close icon on the right of the tag. |
| close.icon | string | The iconfont reference for the close icon on the right of the tag. |
| close.fillStyle | number | The color of the close icon on the right of the tag. |
| close.size | number | The size of the close icon on the right of the tag. |
| close.onClick | (e: GraphEvent, layer: Layer) => void | The click event for the close icon on the right of the tag. |

TagUtils also has good support for single-line multiple texts. You can refer to the [node with deletable tags](/vgraph/demo/nodes/customDeleteTagNode) demo.
```javascript
import { TagUtils, Layer } from '@visactor/vgraph';

// container is the tag container, which is generally the Layer parameter passed in by the node's custom method
const container = new Layer({...});

// Generate multiple tags
const tagsLayer = TagUtils.initTag(container, tagsOption);

// Remove a single tag
TagUtils.removeTag(tagLayer);

// Add a single tag
TagUtils.addTag(tagsLayer, tagOption);
```

| Field | Type | Description |
| --- | --- | --- |
| left | number | \[Required] The horizontal coordinate of the top-left corner of the tag. |
| top | number | \[Required] The vertical coordinate of the top-left corner of the tag. |
| maxWidth | number | The maximum width of the row where the tag is located. |
| theme | 'rect' \| 'capsule' | The style of the tag. The default is rectangle. |
| tags | tagOption | The style of the tag text. Refer to the configuration for a single tag. `left` and `top` will be calculated automatically and do not need to be passed. |
| overflowTag | tagOption | The style of the tag for the overflow count. Refer to the configuration for a single tag. `left` and `top` will be calculated automatically and do not need to be passed. |
