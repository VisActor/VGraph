# 自中心网络环状布局用法

自中心网络(ego network)是常见的一种图数据，通过环状布局可以不仅较为清晰的展示自中心网络中的层级关系，还能够通过圆环空间展示同层节点间的拓扑结构。

主要原理还是通过 ForceRadial 把节点约束在与层级相关的圆环内。 区别于d3, vgraph 不仅仅允许用户传入固定的radial，还允许传入一个radial的范围(当最小值和最大值相同时等价于固定的radial)。
```javascript
{
      const minRs = data.nodes.map((d: any) => d.depth * radial - gap);
      const maxRs = data.nodes.map((d: any) => d.depth * radial + gap); // 不同层级的节点处于不同的圆环范围
      radial: new ForceRadial({
            options: {
                  minR: minRs,
                  maxR: maxRs,
                  strength: 0.1,
                  withAlpha: false, // 强度不衰迭代次数增加而衰减
                  posX: centerX,
                  posY: centerY,
            },
      }),
}
```

<!-- 参考文献：
[Xue, Mingliang, et al. "Target Netgrams: An Annulus-Constrained Stress Model for Radial Graph Visualization." IEEE Transactions on Visualization and Computer Graphics (2022).](https://ieeexplore.ieee.org/document/9814874/)
 -->
