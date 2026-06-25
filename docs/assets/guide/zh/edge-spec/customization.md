# 自定义连线

我们推荐使用内置连线以获得默认好看的节点样式和优良的运行性能。当内置连线不满足你的需求时，可以选择自定义连线。vGraph 的内置连线种类较齐全，在遇到的大部分图分析场景中仅需扩展内置连线即可。

## 扩展内置连线
当基于已有内置连线进行扩展时，可以认为可以用上述内置连线的配置定义完内置连线后再在内置连线的图形基础上添加/更新一部分图形即可。在这种情况下，你需要覆写至少四个方法：

- **getConfigsForShape(edgeData: any) => nodeConfigs**: 根据连线数据准备内置连线的属性。随后返回处理后的全量属性。

- **shape(layer: Layer, edgeConfigs: any) => KeyShape | void**: 向已经生成的内置连线中添加自定义图形，若返回了某个图形则会将其作为连线的 Keyshape，否则会用内置连线的 KeyShape 取代。

- **afterUpdatePath(layer: Layer,  edgeConfigs: any) => void**: 这个方法是连线独有，用于在两端节点的平移而导致连线重新计算的场景。此方法是在连线位置更新后的 hook 方法，可以在此方法定义如何更新自定义图形。

- **updateShapes(layer: Layer, nodeConfigs: any) => void**: 当连线数据发生变化，连线样式则相应需要更新。定义此更新方法能提高批量更新的效率。其中内置连线的更新会先完成，在此方法中仅需更新 shape 方法中自定义的图形。


**注意：** 自定义连线也需要遵循[连线配置](/vgraph/guide/edge-spec/options#%E9%85%8D%E7%BD%AE%E9%A1%B9)规范，请在`setDefaultEdge`中配置连线的 `source`, `target`。在自定义连线中定义这些属性会导致点线连接等各种问题。


接下来我们继承直线 `line` 来扩展出一个 hover 出操作 icon 的自定义连线：
```javascript
import { Graph, registerEdge, Layer, Icon } from '@visactor/vgraph';

registerEdge('iconLine', {
  extends: 'line',
  // edgeData 是一个连线实例通过 setDefaultEdge 之后 merge 的全量连线配置
  getConfigsForShape(edgeData: any) {
  // 大多数情况下直接使用内置连线绘制无须修改配置，相应的更新时也无须新增更新步骤
    return edgeData;
  },
  shape(layer: Layer, edgeConfigs: any) {
    const edge = layer.find((shape:any) => shape.get('_keyShape'));
    // 获取连线中心点定位
    const p = edge.getPointAt(0.5);
    // icon 用法详见图形对象-图标
    const icon = new Icon({
      x: p.x,
      y: p.y,
      icon: '&#xe7a9;',
      fillStyle: '#0057fe',
    });
    // 先隐藏，hover 连线时出现
    icon.hide();
    // todo 可以添加点击 icon handler
    // icon.on('click', e => {});
    layer.add(icon);
    layer.set('icon', icon);
  },
  // 节点位置更新引发连线更新，icon 位置随之更新。如果不需要更新 icon 位置就可以不用覆写此方法
  afterUpdatePath(layer: any, configs: any) {
    const edge = layer.find((shape:any) => shape.get('_keyShape'));
    // 在 shape 方法中将 icon 保存到了 layer 上，方便这里取出更新
    const icon = layer.get('icon');
    const p = edge.getPointAt(0.5);
    icon.set(p);
  }
});

const graph = new Graph({
  ...
  setDefaultEdge() {
    return {
      // 指定类型为注册的连线名称
      type: 'iconLine',
      // 扩大热区以方便进行连线交互
      hitWidth: 6,
    }
  }
});

graph.on('edge:mouseenter', e => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    // 取消以下注释可以让 icon 出现时在鼠标位置更方便操作提升体验
    // const point = graph.clientToCanvas(e.clientX, e.clientY);
    // icon.set({
    //   x: point.x,
    //   y: point.y
    // });
    icon.show();
    graph.draw();
  });

  graph.on('edge:mouseleave', e => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.hide();
    graph.draw();
  });
```

以下是 icon 跟随鼠标定位出现的效果图：

<p><img src="/vgraph/guide/api/edge.gif" width="500"></p>