# Clustered Graph Layout

When the category attribute of nodes is known, we may want nodes of the same category to cluster together and different categories to be separated.

In this scenario, we can achieve repulsion between classes and attraction within classes by combining InterClusterForce and IntraClusterForce.

For example, in this use case:
```javascript
const forces = {
    link: new ForceLink({ edges: data.edges, options: { distance: 0 } }), // Force-directed attraction
    manybody: new ForceManyBody({ options: { strength: -100 } }), // Force-directed repulsion, the overall layout still presents a force-directed layout.
    attrCluster: new IntraClusterForce({ options: { strength: 0.2 } }), // Intra-cluster attraction, if the clustering effect is not significant, you can try increasing this value
    repulCluster: new InterClusterForce({ options: { strength: -10 } }), // Inter-cluster repulsion, you can comment out these two lines to see the effect
    x: new ForceX({ options: { x, strength: 0.2 } }), // Due to the repulsion between clusters, different clusters may be far apart. Use center force to concentrate nodes in the center.
    y: new ForceY({ options: { y, strength: 0.2 } }), //
    collision: new ForceCollision({
        options: { radius: (d: any) => d.r || 5 }
    }),
    center: new ForceCenter({ options: { x, y } }),
};
```
