# 聚簇图布局

在已知节点的类别属性的情况下，我们可能希望同类别的节点聚集在一起，不同类别的节点分开。

在这个场景下，我们可以通过类间力 InterClusterForce 和类内力 IntraClusterForce 的组合来实现类间的排斥及类内的吸引。

例如这个例子中的用法：
``` javascript
const forces = {
    link: new ForceLink({ edges: data.edges, options: { distance: 0 } }), // 力导向吸引力
    manybody: new ForceManyBody({ options: { strength: -100 } }), // 力导向排斥力，整体依旧呈现力导向布局。
    attrCluster: new IntraClusterForce({ options: { strength: 0.2 } }), // 类内吸引力, 如果聚簇效果不够显著可以尝试增加该值
    repulCluster: new InterClusterForce({ options: { strength: -10 } }), // 类间排斥力，可注释掉这两行看看效果
    x: new ForceX({ options: { x, strength: 0.2 } }), // 由于类间的排斥力，可能会导致不同类相距较远，通过中心里使得节点集中在中心位置
    y: new ForceY({ options: { y, strength: 0.2 } }), //
    collision: new ForceCollision({
        options: { radius: (d: any) => d.r || 5 }
    }),
    center: new ForceCenter({ options: { x, y } }),
};
```

