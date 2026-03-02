# 限制节点在视觉窗口内

vgraph 可以通过坐标力 ForceX、ForceY 将所有节点限制在一个固定的矩形范围内，从而达到将节点约束在视觉窗口内的目的。

```javascript
  const borderDist = 100;
  const consForceX = new ForceX({
    options: {
      strength: 1.0,
      minX: nodes.map((d) => {
        return borderDist  + d.layer.getBBoxForHit().width / 2; // 考虑标签的宽度
      }),
      // 这里如果不考虑节点标签宽高范围的情况下，则可以简单的设置为固定值即可，如：
      // minX: borderDist
      // maxX：width - borderDist
      // 即可将所有节点约束在 [borderDist, width - borderDist] 之间；高度限制同理
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
        return height - borderDist - d.layer.getBBoxForHit().height / 2; // 考虑标签的高度
      }),
      withAlpha: false,
    },
  });
```