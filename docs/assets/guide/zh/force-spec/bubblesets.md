# 轮廓包裹节点集合

节点集合轮廓计算方法采用经典算法 bubbleset 方法（第三方库的能力）。通过调用该方法，可以得到节点集合的轮廓 path。vgraph 可以对 path 进行渲染。

本示例代码将 bubbleset 轮廓更新的相关逻辑进行了封装，仅需要如果如下方式调用即可。

```javascript
const pathShape = new Path({
    path: [
        ['M', 0, 0],
        ['L', 0, 0],
    ],
    fillStyle: '#ED848F',
    strokeStyle: '#D95145',
});
const bubbleSetNodes: string[] = ['Favourite', 'Fameuil', 'Dahlia', 'Zephine', 'Blacheville'];
const scale = 8;
updateBubble(bubbleSetNodes, pathShape, scale);
graph.container.addBefore(pathShape, graph.groupContainer);
```
