# 触发器 Trigger
Trigger 监听图中元素的 hover 或 click 事件，并且弹出下拉框。在图中往往用于点击或者鼠标移动到节点/连线，或者内部的一些 shape 上时，而弹出配置面板或菜单栏。最简单的用法如下。当点击图中任意一个节点时，会在节点右侧弹出面板。

```javascript
import { Trigger } from '@dp/xgraph-react-ui';

<div id="graphContainerId">
  <Trigger
    graph={graph}
    target="node"
    trigger="click"
    position="right"
    popupAlign={{ right: 6 }}
    popup={(entity) => <div>you just clicked {entity.get('id')}</div>}
    />
</div>
```

| 配置项    | 类型                                                         | 描述                                               |
| --------- | ------------------------------------------------------------ | -------------------------------------------------- |
| graph     | Graph \| TreeGraph                                            | **\[必填\]** 指定添加 tooltip 的图对象                      |
| popup   | (entity: any, shape: any) => string \| HTML | **\[必填\]** trigger 容器中的内容，支持 string 和 html                  |
| trigger   | 'hover' \| 'click'                                           | trigger 触发方式，默认为 hover                     |
| target    | 'node' \| 'edge' \| 'group'                                  | 触发 trigger 的实体类型，默认为 'node' |
| triggerId   | string       | 指定触发 trigger 的为实体中包含 triggerId 的图形。Trigger 会根据此图形来定位。若配置了 triggerId,点击节点/连线的其他部分不会触发 trigger  |
| className | string                                                       | 给 trigger 容器添加类名                            |
| styles    | object                                                       | 给 trigger 添加 css 样式                           |
| hideDelay | number                                                       | trigger 消失时延,仅对 hover 类型有效。类型为 click 的会在点击任意位置后立即消失。                           |


更多配置项请见[Arco Trigger](https://arco.design/react/components/trigger)

以下是[节点 icon](../node-spec/options#Icons) 配合 triggerId 的使用方法示例。当点击节点上对应 icon 时会弹出 trigger 面板。
```javascript
import { Graph } from '@dp/xgraph';
import { Trigger } from '@dp/xgraph-react';

const graph = new Graph({
  container: 'graphContainer',
  setDefaultNode() {
    return {
      icons: [{
        setStyles() {
          return {
            // 指定 triggerId,Trigger 会根据此字段匹配和定位
            triggerId: 'triggerIcon',
            fillStyle: 'blue',
            cursor: 'pointer',
            // icon 对应的 iconfont 引用
            icon: '&#xe60a;',
          };
        },
        // icon 位置
        position: [1, 0.5],
        offset: [6, 0],
        // icon 显示模式
        show: 'hover',
      }],
    }
  },
  ...,
});

<div id="graphContainer">
  <Trigger
    graph={graph}
    trigger="click"
    // 与 icon 中配置的 triggerId 对应
    triggerId="triggerIcon"
    target="node"
    popup={entity => <div>you clicked {entity.get('id')}</div>}
   />
</div>
```