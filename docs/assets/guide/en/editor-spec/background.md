# Background

In graph editing scenarios, a grid background is usually needed for auxiliary editing. The Background component has two built-in background styles: 'dot' and 'grid'.

The following is an example of how to use the Background component. You can also experience it in the demo.

```javascript
import { Graph, Background } from "@visactor/vgraph";
const background = new Background(graph, { type: 'dot' });
```

## Configuration Items

`BackgroundOptions` is defined as follows.

| Field | Type | Description |
| --- | --- | --- |
| type | 'grid' \| 'dot' | Grid style type. Default is 'grid'. |
| step | number | Step size. By default, it is consistent with the step size of the Grid component. |
| backgroundColor | string | Background color. Default is pure white '#FFFFFF'. |
| opacity | number | Background opacity. |
| color | string | Foreground color. Depending on the type, it is either the grid line color or the dot fill color. |
| imgUrl | string | Custom background image. Default is empty. |



## Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| enable() | void | Enable the component. |
| disable() | void | Disable the component. |
| changeSize() | void | Change the width and height to fit the width and height of the Graph. |
| update() | void | Update the background image position. |
| destroy() | void | Destroy the component. |
