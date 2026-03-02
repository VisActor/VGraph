# 环状布局

区别于树图中的 radial 布局，有些 ego network 的场景不仅仅要求呈现为以中心点为圆心的环状布局，相同层级的节点在同一个圆环内。此外还要求其他节点之间保持拓扑连接关系，即呈现力导向布局的状态。

可以通过 ForceRadial 把节点约束在与层级相关的圆环内。 区别于d3, vgraph 不仅仅允许用户传入固定的radial，还允许传入一个radial的范围(当最小值和最大值相同时等价于固定的radial)。
```javascript
{
    const minRs = data.nodes.map((d: any) => d.depth * radial - gap);
    const maxRs = data.nodes.map((d: any) => d.depth * radial + gap); // 限定圆环的范围是 depth * radius +- gap
    radial: new ForceRadial({
        options: {
          minR: minRs, // 节点所在圆环的最小半径
          maxR: maxRs, // 节点所在圆环的最大半径
          strength: 0.05,
          withAlpha: false,
          posX: centerX, // 圆环的中心点x坐标
          posY: centerY // 圆环的中心点y坐标
        }
    });
}
```