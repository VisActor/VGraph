# 自定义布局用法
通过配置节点的 x,y 属性即可达到自定义布局的效果。在执行完自定义布局函数后，通过调用 graph.refresh() 可以将图的位置信息更新绘制。 通常而言可以通过如下方法使用:
```javascript
graph.data(data);
customLayout(data); // 如果是配置原数据，则原数据 node 配置 x,y 即可
// customLayout(graph); // 如果是通过 graph.getNodes() 获取数据，也可以直接对 graph 节点通过 node.set('x',xxx) node.set('y',xxx) 进行操作 
graph.refresh();
```
本 demo 实现了一种同心圆环的自定义布局方法。可以将节点均匀的分布在圆环上。 