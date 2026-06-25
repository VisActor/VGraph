# 自定义节点类型

我们推荐使用内置节点以获得默认好看的节点样式和优良的运行性能。当内置节点不满足你的需求时，可以选择自定义节点。自定义节点有两种方式，一种是基于已有内置节点进行扩展，第二种是完全自定义节点。** vGraph 目前已提供 d2c 服务可以直接从 figma 视觉稿生成自定义节点代码，可以在[智能生成代码](d2c_node)体验**

> vGraph 中的内置节点定位依据为配置中的 { x, y }，这个坐标是内置节点的中心位置。因此一个节点的横坐标范围在 \[ x -  width/ 2, x + width / 2 \]；纵坐标范围在 \[ y - height / 2, y + height / 2 \]。

> 自定义节点为注册定义节点类型的图形部分。注册后即可通过制定同内置节点类型一样的方式进行消费。

## 扩展内置节点

当基于已有内置节点进行扩展时，可以认为可以用上述内置节点的配置定义完内置节点后再在内置节点的图形基础上添加/更新一部分图形即可。在这种情况下，你需要覆写至少三个方法：

- **getConfigsForShape(nodeData: any) => nodeConfigs**: 根据节点数据准备内置节点的属性。随后返回处理后的全量属性。

- **shape(layer: Layer, nodeConfigs: any) => KeyShape | void**: 向已经生成的内置节点中添加自定义图形，若返回了某个图形则会将其作为节点的 Keyshape，否则会用内置节点的 KeyShape 取代。

- **updateShapes(layer: Layer, nodeConfigs: any) => void**: 当节点数据发生变化，节点样式则相应需要更新。定义节点更新方法能提高批量更新的效率。其中内置节点的更新会先完成，在此方法中仅需更新 shape 方法中自定义的图形。

**注意：** 自定义节点也需要遵循[节点配置](/vgraph/guide/node-spec/options#通用配置项)规范，请在`setDefaultNode`中配置节点的 `id`, `width`, `height`, `x`, `y`。在自定义节点中定义这些属性会导致点线连接等各种问题。




接下来就以如何继承 rect 进行扩展来定义 category 节点为例看一下具体用法：

```javascript
import { registerNode, Text } from '@visactor/vgraph';
registerNode('category', {
    type: 'category',
    // 继承 rect
    extends: 'rect',
    // 采用 rect 的 label 绘制，本身不另行绘制 label
    drawCurrentLabel: false,
    // 准备参数初始化 rect
    // data 是一个节点通过 setDefaultNode 之后 merge 的全量节点配置数据
    getConfigsForShape(data: any) {
      // rect 的 label 默认居中，category 左侧有色块，要向右偏一些
      label = prepareLabel(data);
      return {
        strokeStyle: '#ccc',
        ...data,
        label,
      }
    },
    // 在 rect 节点的基础上画色块
    shape(layer: Layer, configs: any) {
      // 根据用户配置计算色块属性，比如定位，样式等
      const categoryConfigs = getCategoryConfigs(layer, configs);
      // 定义色块，添加到节点中。这里指定 id 方便在更新时找到色块图形
      const category = new Rect(categoryConfigs);
      category.set('id', 'categoryRect');
      layer.add(category);
    },
    // 如何更新色块
    updateShapes(layer: Layer, configs: any) {
      // 找到色块图形
      const categoryRect = layer.findById('categoryRect');
      if (categoryRect) {
        // 计算新的色块样式并更新
        categoryRect.set(getCategoryConfigs(layer, configs));
      }
    }
});
```

## 完全自定义

如果内置节点不符合你的需求，可以进行完全自定义，注意此时内置节点的 label, icons 等配置不生效。一个节点有初始化，更新，销毁三个主要阶段，若要完全自定义节点，则需要实现初始化和更新两个阶段的定义。更新逻辑是为了更好的运行时性能，当更新逻辑未定义的情况下，vgraph 会在更新时销毁图形再重新初始化。所以如果你的图节点没有数据变更驱动样式变更的需求，或者图非常简单也可以不定义。

- **init(layer: Layer, nodeConfigs: any) => Shape**: 给定一个空的图层 layer，根据节点数据添加图形，最后返回 KeyShape

- **update(layer: Layer, nodeConfigs: any) => void**: 给定一个已有图形的图层 layer，根据节点更新后的数据来更新图形

```JavaScript
import { registerNode, Text } from '@visactor/vgraph';

// 注册一个纯文本节点 demo
registerNode('text', {
    init(layer: Layer, nodeConfigs: any) {
       const text = new Text({
           id: 'textId',
           // 节点内居中的文本配置
           x: 0,
           y: 0,
           textAlign: nodeConfigs.textAlign,
           textBaseline: nodeConfigs.textBaseline,
       });
       // 添加文本图形
       layer.add(text);
       // text 作为节点 keyShape
       return text;
    },
    update(layer: Layer, nodeConfigs: any) {
        const text = layer.findById('textId');
        text.set({
           textAlign: nodeConfigs.textAlign,
           textBaseline: nodeConfigs.textBaseline,
        });
    }
});
```