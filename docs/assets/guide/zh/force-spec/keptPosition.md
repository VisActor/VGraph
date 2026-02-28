# 带label的无重叠力的使用

一个常见的场景就是，当画布中的节点数据发生变化时，如节点的展开和收起，用户通常希望原有的数据能够尽可能的保持原有的结构。

通过对原有节点施加坐标力 ForceX 和 ForceY 令这些节点尽可能的保持在原有位置，并令新增节点尽可能向其父节点靠拢。因此可以通过如下方式实现：

```JavaScript
  // 在这里通过x坐标力和y坐标力让原有节点尽可能保持在原有位置上
  // 展开的节点尽可能保持在父节点周围，权重稍小
  const originNodes = graph.getNodes().map((d) => d.configs);
  const consForcePosX = new ForceX({
    nodes: originNodes,
    options: {
      strength: originNodes.map((d) =>
        d.expended || d.id === id ? 0.05 : 0.1
      ),
      x: originNodes.map((d) => (d.expended ? x : d.x)),
    },
  });
  const consForcePosY = new ForceY({
    nodes: originNodes,
    options: {
      strength: originNodes.map((d) =>
        d.expended || d.id === id ? 0.05 : 0.1
      ),
      y: originNodes.map((d) => (d.expended ? y : d.y)),
    },
  });
  originNodes.map((d) => (d.expended = undefined)); // 仅做本次展开使用
  fdp.removeForce('consForcePosX');
  fdp.addForce('consForcePosX', consForcePosX);
  fdp.removeForce('consForcePosY');
  fdp.addForce('consForcePosY', consForcePosY);

  // 重新调整布局
  fdp.updateData(graph);
  fdp.setOptions({ restartAlpha: 1.0, maxIteration: 150 });
  fdp.setOnEnd(() => {});
  fdp.restart();
```