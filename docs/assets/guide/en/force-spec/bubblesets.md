# Outline Wrapping Node Set

The node set outline calculation method uses the classic bubbleset algorithm (a third-party library's capability). By calling this method, you can obtain the outline path of a node set. vgraph can render this path.

This example code encapsulates the relevant logic for updating the bubbleset outline, so you only need to call it as follows.

```javascript
const pathShape = new Path({
    path: [
        ['M', 0, 0],
        ['L', 0, 0],
    ],
    fillStyle: '#ED848F',
    strokeStyle: '#D95145',
});
const bubbleSetNodes: string[] = ['Favourite', 'Fameuil', 'Dahlia', 'Zephine', 'Blacheville'];
const scale = 8;
updateBubble(bubbleSetNodes, pathShape, scale);
graph.container.addBefore(pathShape, graph.groupContainer);
```
