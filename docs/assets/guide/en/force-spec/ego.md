# Ego Network Circular Layout Usage

An ego network is a common type of graph data. A circular layout can not only display the hierarchical relationships in an ego network clearly but also show the topological structure between nodes at the same level through the circular space.

The main principle is to constrain the nodes within a circle related to their hierarchy using `ForceRadial`. Unlike d3, vgraph not only allows users to pass a fixed radial but also a range of radials (which is equivalent to a fixed radial when the minimum and maximum values are the same).
```javascript
{
      const minRs = data.nodes.map((d: any) => d.depth * radial - gap);
      const maxRs = data.nodes.map((d: any) => d.depth * radial + gap); // Nodes of different levels are in different circular ranges
      radial: new ForceRadial({
            options: {
                  minR: minRs,
                  maxR: maxRs,
                  strength: 0.1,
                  withAlpha: false, // Strength does not decay as the number of iterations increases
                  posX: centerX,
                  posY: centerY,
            },
      }),
}
```

<!--
References:
[Xue, Mingliang, et al. "Target Netgrams: An Annulus-Constrained Stress Model for Radial Graph Visualization." IEEE Transactions on Visualization and Computer Graphics (2022).](https://ieeexplore.ieee.org/document/9814874/)
-->
