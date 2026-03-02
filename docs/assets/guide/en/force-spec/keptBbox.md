# Restrict Nodes within the Visual Window

vgraph can restrict all nodes to a fixed rectangular area using the coordinate forces `ForceX` and `ForceY`, thereby keeping the nodes within the visual window.

```javascript
  const borderDist = 100;
  const consForceX = new ForceX({
    options: {
      strength: 1.0,
      minX: nodes.map((d) => {
        return borderDist  + d.layer.getBBoxForHit().width / 2; // Consider the width of the label
      }),
      // If the node label width and height are not considered, this can be simply set to a fixed value, such as:
      // minX: borderDist
      // maxX: width - borderDist
      // This will constrain all nodes between [borderDist, width - borderDist]; the height constraint is similar.
      maxX: nodes.map((d) => {
        return width - borderDist - d.layer.getBBoxForHit().width / 2;
      }),
      withAlpha: false,
    },
  });
  const consForceY = new ForceY({
    options: {
      strength: 1.0,
      minY: nodes.map((d) => {
        return borderDist  + d.configs.height / 2;
      }),
      maxY: nodes.map((d) => {
        return height - borderDist - d.layer.getBBoxForHit().height / 2; // Consider the height of the label
      }),
      withAlpha: false,
    },
  });
```
