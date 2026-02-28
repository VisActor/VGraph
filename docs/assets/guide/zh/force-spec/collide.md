# 无重叠力使用

通过配置无重叠的力可以达到节点之间具有至少的指定间隔的效果，从而避免节点之间的重叠。

一般而言通过如下方法简单进行配置
```javascript
{
    collision: new ForceCollision({
        options: { radius: 10}
    });
}
```
这样所有节点的间隔被设置为至少为10。

同样可以通过节点的属性来设置间隔:
```javascript
{
    collision: new ForceCollision({
        options: { radius: data.nodes.map((nodeData) => nodeData.radius) }
    });
}
```

这样节点间的间隔就被设置为了节点的半径大小。