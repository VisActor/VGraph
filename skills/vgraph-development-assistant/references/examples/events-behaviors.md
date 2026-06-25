# Events And Behaviors Example

```ts
import {
  Graph,
  panZoom,
  dragCanvas,
  dragNode,
  brushSelect,
  highlightRelations,
  GRAPH_EVENTS
} from "@visactor/vgraph";

const graph = new Graph({
  container: "container",
  width: 900,
  height: 560,
  layout: { type: "dag" }
});

graph.data(data);

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
graph.addBehavior(dragNode);
graph.addBehavior(highlightRelations);

graph.on("node:click", ev => {
  graph.setState(ev.target, "selected", true);
});

graph.on(GRAPH_EVENTS.LAYOUT_END, () => {
  console.log("layout finished");
});

function enableBrushMode() {
  graph.removeBehavior("dragCanvas");
  graph.addBehavior(brushSelect, {
    trigger: "shift"
  });
}

function disableBrushMode() {
  graph.removeBehavior("brushSelect");
  graph.addBehavior(dragCanvas);
}
```

When showing this to users, explain that entity events use string names such as `node:click`, while lifecycle events use `GRAPH_EVENTS`.
