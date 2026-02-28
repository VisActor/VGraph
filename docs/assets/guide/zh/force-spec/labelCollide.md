# 带label的无重叠力的使用

一个常见的场景就是，每个节点都带有label。本例子将讲解如何通过无重叠力来做到节点带label的情况下，做到节点和label的无重叠。

每个节点的实际重叠判断范围应该和它的包围盒有关。因此可以通过如下代码来给定节点的碰撞范围为节点实际渲染的画布的高度和宽度。

```JavaScript
const collisionForce = new xg.ForceCollision({ 
  options: {
    width: nodes.map((d) => {
      return d.layer.getBBoxForHit().width + 3; 
    }), // 定义碰撞的宽度和高度为节点的实际画布宽度和高度
    height: nodes.map((d) => {
      return d.layer.getBBoxForHit().height;
    }),
  },
});
```