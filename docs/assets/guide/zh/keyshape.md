# 关键图形
关键图形 keyShape 用于计算节点与连线如何连接，以及如何响应节点状态变化。




例如同一个外观看起来是圆形节点，指定不同的 keyShape 连线的连接效果就不一致。左上的节点由于返回的 keyShape 是一个圆，计算连接点的时候就能贴紧圆形外边缘，而如果如右下节点返回的是一个矩形，连线则会贴紧矩形，视觉上看就没有连接到圆形。

<p><img src="/vgraph/guide/keyshape.png" width="200"></p>

在对节点设置状态时，默认是修改 keyShape 的样式。对上述例子同样执行:
```js
// 更新图对于节点状态的配置,当节点有 highlight 状态时改变 keyShape 的边框颜色
graph.set('setStateStyles', (state: string) => {
    if (state === 'highlight') {
        return { strokeStyle: '#3370FF' }
     }
});

// 设置节点状态
node.setState('highlight');
```




得到结果如下图所示。如果在你的场景下仅用 keyShape 响应状态变化不能满足需求，可参考[状态管理](/vgraph/guide/states)。

<p><img src="/vgraph/guide/keyshape-state.png" width="200"></p>