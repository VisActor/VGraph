# Using Non-overlapping Force with Labels

A common scenario is that when the node data in the canvas changes, such as when nodes are expanded or collapsed, users usually want the original data to maintain its structure as much as possible.

By applying coordinate forces `ForceX` and `ForceY` to the original nodes, these nodes can be kept in their original positions as much as possible, and new nodes can be brought closer to their parent nodes. This can be achieved as follows:

```JavaScript
  // Here, the coordinate forces x and y are used to keep the original nodes in their original positions as much as possible.
  // The expanded nodes are kept as close to the parent node as possible, with a slightly smaller weight.
  const originNodes = graph.getNodes().map((d) => d.configs);
  const consForcePosX = new ForceX({
    nodes: originNodes,
    options: {
      strength: originNodes.map((d) =>
        d.expended || d.id === id ? 0.05 : 0.1
      ),
      x: originNodes.map((d) => (d.expended ? x : d.x)),
    },
  });
  const consForcePosY = new ForceY({
    nodes: originNodes,
    options: {
      strength: originNodes.map((d) =>
        d.expended || d.id === id ? 0.05 : 0.1
      ),
      y: originNodes.map((d) => (d.expended ? y : d.y)),
    },
  });
  originNodes.map((d) => (d.expended = undefined)); // Only for this expansion
  fdp.removeForce('consForcePosX');
  fdp.addForce('consForcePosX', consForcePosX);
  fdp.removeForce('consForcePosY');
  fdp.addForce('consForcePosY', consForcePosY);

  // Readjust the layout
  fdp.updateData(graph);
  fdp.setOptions({ restartAlpha: 1.0, maxIteration: 150 });
  fdp.setOnEnd(() => {});
  fdp.restart();
```
