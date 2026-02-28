# Edge Configuration

Edges are used to identify the relationship and the logic of the relationship between nodes (e.g., direction of the relationship, strength of the relationship), and are usually controlled by a `source` (start node) and a `target` (end node).

> Edge state and relationship are properties that an edge has after it is constructed, and can be manipulated through instance methods.
> KeyShape and States are defined as follows:
>
> - KeyShape: Can be considered the skeleton of the edge, used to define the path of the edge, including event capture, node control, etc. For more details, see the [KeyShape](/vgraph/guide/keyshape) section.
> - States: Edge states can be considered a convenient method used when the position of the edge does not change, but its appearance does. For more details, see the [State Management](/vgraph/guide/states) section.


vGraph has 9 built-in edge types, and the built-in edge types have the following common configuration items.

## Configuration Items

| Field | Type | Description |
| --- | --- | --- |
| source | string | **[Required]** The id of the source node of the edge. |
| target | string | **[Required]** The id of the target node of the edge. |
| type | 'line' \| 'hLIne' \| 'vLine' \| 'turningLine' \| 'quadratic' \| 'cubic' \| 'loop' \| 'hCubic' \| 'vCubic' \| ... | Edge type. vgraph has 9 built-in edge types, and users can also extend and reference based on these edge types. The default value is 'line'. For details, see [Built-in Edges](/vgraph/guide/edge-spec/prebuilt). |
| id | string | The unique identifier of the edge. |
| startArrow | ArrowType | The arrow at the start of the edge. |
| endArrow | ArrowType | The arrow at the end of the edge. |
| hitWidth | number | The hot zone of the edge (px). Used to expand the active area of the edge to make it easier for users to interact with the edge. |
| strokeStyle | string | The color of the edge. |
| label | string \| LabelConfigs | The label text configuration. If it is a string, the default position is at the center of the edge. For details, see [Label Configuration](/vgraph/guide/edge-spec/options#Label-Configuration). |
| sourceAnchor | number | Specify the index of the source node's anchor point to which the edge is connected. |
| targetAnchor | number | Specify the index of the target node's anchor point to which the edge is connected. |

## Label Configuration

| Field | Type | Description |
| --- | --- | --- |
| text | string | **[Required]** The text label content. |
| width | number | Limit the maximum width of the text. |
| height | number | Limit the maximum height of the text. |
| fillStyle | string | The text color. |
| strokeStyle | string | The text stroke color. |
| lineWidth | number | The text stroke width. |
| background | RectConfigs | The text background. The position is determined by the text, and the size of the shell can be configured by `padding`. For other style configurations, please refer to [Rectangle Configuration](/vgraph/guide/shape-spec/rect). |
| autoRotate | boolean | Whether the text automatically rotates with the edge, default is false. |
| capture | boolean | The picking efficiency of auto-rotated labels may not be good when the data volume is large. In this case, it is recommended to set `capture` to false and respond to events by expanding the `hitWidth` of the edge. |
| position | number | The position of the text relative to the length of the edge. The default label is at the midpoint of the edge, with `position` being 0.5. |
| fontSize | number | The text font size, default is 12. |
| lineHeight | number | The line height. |
| fontWeight: | 'normal' \| 'bold' \| 'bolder' \| 'lighter' \| 'number' | The font weight. |
| textOverflow | 'clip' \| 'ellipsis' | The text overflow handling, either clip or ellipsis. |
| textAlign | 'start' \| 'center' \| 'end' \| 'left' \| 'right' | The text alignment. |
| textBaseline | 'top' \| 'hanging' \| 'middle' \| 'alphabetic' \| 'ideographic' \| 'bottom' | The text baseline position, default is 'middle'. |
| fontStyle | 'normal' \| 'italic' \| 'oblique' | The text style. |
| fontFamily | string | The font family. |
| offsetX | number | The horizontal offset of the text from its default position (px). |
| offsetY | number | The vertical offset of the text from its default position (px). |
| fillStyle | string | The text fill color. |
| strokeStyle | string | The text stroke color. |

Nodes all have a unique KeyShape, so they also inherit the common configuration items of KeyShape. **Note:** The properties of the KeyShape configuration item and the common configuration item are at the same level. The usage priority of the KeyShape configuration is higher than the node configuration item (e.g., the configuration of `color`). The following are the common configuration items for graphic objects:

| Field | Type | Description |
| --- | --- | --- |
| opacity | number | Opacity. |
| fillStyle | string | Fill color. |
| cursor | string | The style to display when the mouse pointer hovers over the element. See [CSS.cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor#syntax). |
| strokeStyle | number \| number\[] | Stroke color. |
| lineWidth | number | Stroke width. |
| lineDash | number \| number\[] | Dashing pattern. See [CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash). |
| shadowBlur | number | Shadow blur amount. See [CanvasRenderingContext2D.shadowBlur](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur). |
| shadowColor | string | Shadow color. |
| shadowOffsetX | number | Horizontal shadow offset. See [CanvasRenderingContext2D.shadowOffsetX](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX). |
| shadowOffsetY | number | Vertical shadow offset. See [CanvasRenderingContext2D.shadowOffsetY](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY). |
| clip | ShapeBase | Clipping shape. The specified shape is set as the clipping path, and the part within the path of the clipping shape will be retained, while the rest will be culled. See [CanvasRenderingContext2D.clip()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip). |
| cursor | string | The type of cursor when the shape gets focus. For details, see [CSS Cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor). |

> Note: Color strings currently support the following formats: rgb, rgba, hsl, hsla, hex (3, 6, 8-digit hexadecimal numbers), name, linear gradient, radial gradient, and picture, etc.

## Arrow Configuration
Edges support adding arrows at the start and end positions, corresponding to the `startArrow` and `endArrow` configuration items. When `startArrow` or `endArrow` is specified as `undefined`, `null`, or `false`, no arrow will be drawn. When specified as `true`, the default triangular arrow will be drawn. The arrow configuration item `ArrowType` is defined as follows:

```typescript
type ArrowType = boolean | {
  type?: 'default' | 'default-round',
  width?: number,
  height?: number,
};
```

| Field | Type | Description |
| --- | --- | --- |
| type | string | The arrow type. `default` is the default triangular arrow, and `default-round` is a rounded triangular arrow. |
| width | number | The wingspan width of the arrow. |
| height | number | The tangential height of the arrow at the endpoint. |
