# Using Non-overlapping Force

By configuring a non-overlapping force, you can achieve a minimum specified interval between nodes, thus avoiding node overlap.

Generally, this can be configured simply as follows:
```javascript
{
    collision: new ForceCollision({
        options: { radius: 10 }
    });
}
```
This sets the interval for all nodes to be at least 10.

You can also set the interval through node properties:
```javascript
{
    collision: new ForceCollision({
        options: { radius: data.nodes.map((nodeData) => nodeData.radius) }
    });
}
```

This sets the interval between nodes to be the radius of the nodes.
