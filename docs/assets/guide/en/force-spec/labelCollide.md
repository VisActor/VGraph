# Using Non-overlapping Force with Labels

A common scenario is that each node has a label. This example will explain how to use a non-overlapping force to ensure that nodes and their labels do not overlap.

The actual overlap detection range of each node should be related to its bounding box. Therefore, you can use the following code to set the collision range of the nodes to the actual rendered canvas height and width of the nodes.

```JavaScript
const collisionForce = new xg.ForceCollision({
  options: {
    width: nodes.map((d) => {
      return d.layer.getBBoxForHit().width + 3;
    }), // Define the collision width and height as the actual canvas width and height of the node
    height: nodes.map((d) => {
      return d.layer.getBBoxForHit().height;
    }),
  },
});
```
