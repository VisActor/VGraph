# Note Marker Tool

Custom nodes are one of the biggest pain points in developing graph visualization applications. vGraph has summarized common custom node components from business scenarios and abstracted them into configurable tool methods to help everyone solve some visual effects that are not easy to implement.

Note markers are often used to display data anomalies or supplementary information that needs attention. vGraph encapsulates the definition tool for note markers and can be used with built-in components like Tooltip to achieve a better hint experience. You can refer to the example of a [note marker node](/graphs/nodes_noteNode).

```javascript
import { NoteMarkerUtils, Layer } from '@visactor/vgraph';

// container is the label container, which is generally the Layer parameter passed in by the node custom method
const container = new Layer({...});

// Generate the note marker
const markerLayer = MarkerUtils.init(container, markerOption);
```

| Field | Type | Description |
| --- | --- | --- |
| width | number | \[Required] The width of the note marker. |
| height | number | \[Required] The height of the note marker. |
| position | 'left' \| 'right' | The position of the note marker relative to the node. Currently supports top-left and top-right directions. |
| radius | number | The corner radius of the custom note marker. |
| triggerId | string | Can be used with native and React components like Tooltip to trigger hints. |
