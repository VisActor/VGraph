# 文字气泡 Tooltip
Tooltip 是常用的辅助信息展示途径。vgraph 提供基于 Arco Design Tooltip 的封装以提升基于 React 开发产品的开发效率。

```javascript
import { Tooltip } from '@visactor/react-vgraph-ui';

<div style={{ width: 1000, height: 600 }} id="reactTooltipExample">
  <Tooltip
    graph={graph}
    getContent={(entity: any, shape: any) => string | ReactNode}
    target='edge'
    hideDelay={300}
    />
</div>
```

| 配置项    | 类型                                                         | 描述                                               |
| --------- | ------------------------------------------------------------ | -------------------------------------------------- |
| graph     | Graph \| TreeGraph                                            |  **\[必填\]**指定添加 tooltip 的图对象                      |
| getContent   | (entity: any, shape: any ) => string \| HTML | **\[必填\]**tooltip 内容，支持 string 和 html                  |
| className | string                                                       | 给 tooltip 容器添加类名                            |
| styles    | object                                                       | 给 tooltip 添加 css 样式                           |
| target    | 'node' \| 'edge' \| 'group'                                  | 触发 tooltip 的元素，单选。默认为 'node'  |
| triggerId | string                                                       | 局部图形响应 tooltip。实体中包含 triggerId 的图形才会触发 tooltip。Tooltip 则会根据此图形来定位。若配置了 triggerId, hover 节点/连线的其他部分不会触发 tooltip  |
| hideDelay | number                                                       | tooltip 消失时延                           |

更多配置项请见[Arco Tooltip](https://arco.design/react/components/tooltip)。

以下是[节点 label](../node-spec/options#Label) 配合 triggerId 的使用方法示例。当 hover 节点 label 时会展示对应的 tooltip。
```javascript
import { Graph } from '@visactor/vgraph';
import { Tooltip } from '@visactor/react-vgraph';

const graph = new Graph({
  container: 'graphContainer',
  setDefaultNode(node) {
    return {
      type: 'category',
      radius: 2,
      width: 80,
      height: 20,
      label: {
        text: node.name,
        // 指定 triggerId, Tooltip 会根据此字段匹配和定位
        triggerId: 'triggerLabel',
      },
    };
  },
  ...,
});

function getLabelContent(entity: any, shape: any) {
  return `${entity.get('name')}: ${entity.get('class')}`;
}

<div id="graphContainer">
  <Tooltip
    graph={graph}
    getContent={getLabelContent}
    target="node"
    // 与 label 中配置的 triggerId 对应
    triggerId="triggerLabel"
    hideDelay={300}
  />
</div>
```