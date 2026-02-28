# Scroller

The Scroller is a scrollbar component in vGraph used for scrolling, panning, and zooming the canvas. When this component is enabled, do not add `panZoom` and `dragCanvas` interactions simultaneously; related capabilities can be configured uniformly within the component.

Here is an example of how to use the Scroller component. You can also try it out in the demo.

```javascript
import { Graph, Scroller} from "@visactor/vgraph";
const scroller = new Scroller(graph, scrollerOptions );
```

## Configuration

| Field | Type | Description |
| --- | --- | --- |
| size | number | The size of the scrollbar style, in px. The default value is 10. |
| padding | number \| number[] | The padding value for the scrollbar at the graph's border. Defaults to 10. If set to undefined or null, the graph's padding will be used. |
| show | 'always' \| 'hover' | The display method for the scrollbar. Defaults to 'hover'. |
| dragCanvas | boolean \| Record<string, any> | Whether to enable the dragCanvas interaction, defaults to true. You can also pass parameter configurations for the [dragCanvas](/vgraph/guide/behaviors#dragCanvas/拖拽画布) interaction. |
| panZoom | boolean \| Record<string, any> | Whether to enable the panZoom interaction, defaults to true. You can also pass parameter configurations for the [panZoom](/vgraph/guide/behaviors#panZoom/平移缩放) interaction. |
