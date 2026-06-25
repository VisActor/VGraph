# Circular Layout

Unlike the radial layout in tree graphs, some ego network scenarios not only require a circular layout centered on a central point, with nodes of the same level on the same circle, but also require maintaining the topological connections between other nodes, i.e., a force-directed layout.

You can use `ForceRadial` to constrain nodes within a circle related to their hierarchy. Unlike d3, vgraph not only allows users to pass a fixed radial, but also a range of radials (which is equivalent to a fixed radial when the minimum and maximum values are the same).
```javascript
{
    const minRs = data.nodes.map((d: any) => d.depth * radial - gap);
    const maxRs = data.nodes.map((d: any) => d.depth * radial + gap); // The range of the circle is limited to depth * radius ± gap
    radial: new ForceRadial({
        options: {
          minR: minRs, // The minimum radius of the circle where the node is located
          maxR: maxRs, // The maximum radius of the circle where the node is located
          strength: 0.05,
          withAlpha: false,
          posX: centerX, // The x-coordinate of the center of the circle
          posY: centerY // The y-coordinate of the center of the circle
        }
    });
}
```
