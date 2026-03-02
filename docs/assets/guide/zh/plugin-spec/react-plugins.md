# React 组件
分析组件可以辅助用户更好的理解数据，发现数据特征。为了更好的支持业务场景使用， vGraph 从中封装并提供一些通用的 React 组件，并将持续不断补充分析能力。

## 文字气泡 Tooltip
Tooltip 是常用的辅助信息展示途径。vGraph 提供基于 Arco Design Tooltip 的封装以提升基于 React 开发产品的开发效率。

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
| graph     | Graph \| TreeGraph                                            |  \[必填\]指定添加 tooltip 的图对象                      |
| getContent   | (entity: any, shape: any ) => string \| HTML | \[必填\]tooltip 内容，支持 string 和 html                  |
| className | string                                                       | 给 tooltip 容器添加类名                            |
| style    | object                                                       | 给 tooltip 添加 css 样式                           |
| target    | 'node' \| 'edge' \| 'group'                                  | 触发 tooltip 的元素，单选。默认为 'node'  |
| triggerId | string                                                       | 局部图形响应 tooltip。实体中包含 triggerId 的图形才会触发 tooltip。Tooltip 则会根据此图形来定位。若配置了 triggerId, hover 节点/连线的其他部分不会触发 tooltip  |
| hideDelay | number                                                       | tooltip 消失时延                           |
| visible |  boolean                                 |  tooltip 是否可见，用于受控模式                    |
| onVisibleChange |   (visible: boolean) => void          |  tooltip 显示或隐藏时触发的回调          |

更多配置项请见[Arco Tooltip](https://arco.design/react/components/tooltip)。

以下是[节点 label](/vgraph/guide/node-spec/options#Label) 配合 triggerId 的使用方法示例。当 hover 节点 label 时会展示对应的 tooltip。
```javascript
import { Graph } from '@visactor/vgraph';
import { Tooltip } from '@visactor/react-vgraph-ui';

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

## 触发器 Trigger
Trigger 监听图中元素的 hover 或 click 事件，并且弹出下拉框。在图中往往用于点击或者鼠标移动到节点/连线，或者内部的一些 shape 上时，而弹出配置面板或菜单栏。最简单的用法如下。当点击图中任意一个节点时，会在节点右侧弹出面板。

```javascript
import { Trigger } from '@visactor/react-vgraph-ui';

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
| graph     | Graph \| TreeGraph                                            |  \[必填\]指定添加 tooltip 的图对象                      |
| popup   | (entity: any, shape: any) => string \| HTML | \[必填\] trigger 容器中的内容，支持 string 和 html                  |
| trigger   | 'hover' \| 'click'                                           | trigger 触发方式，默认为 hover                     |
| target    | 'node' \| 'edge' \| 'group'                                  | 触发 trigger 的实体类型，默认为 'node' |
| triggerId   | string       | 指定触发 trigger 的为实体中包含 triggerId 的图形。Trigger 会根据此图形来定位。若配置了 triggerId,点击节点/连线的其他部分不会触发 trigger  |
| className | string                                                       | 给 trigger 容器添加类名                            |
| styles    | object                 | 给 trigger 添加 css 样式            |
| showDelay | number                                                       | trigger 出现前时延,仅对 hover 类型有效。            |
| hideDelay | number              | trigger 消失时延,仅对 hover 类型有效。类型为 click 的会在点击任意位置后立即消失。        |


更多配置项请见[Arco Trigger](https://arco.design/react/components/trigger)

以下是[节点 icon](/vgraph/guide/node-spec/options#Icons) 配合 triggerId 的使用方法示例。当点击节点上对应 icon 时会弹出 trigger 面板。
```javascript
import { Graph } from '@visactor/vgraph';
import { Trigger } from '@visactor/react-vgraph-ui';

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

## 右键菜单 Contextmenu
右键菜单常用于承载对单个实体或整体图产品的功能，能提升用户的操作效率。vGraph 提供 react 框架的 Contextmenu。出于各个产品视觉风格不一的考虑仅做容器显隐响应，内部功能可自行实现。
```javascript
import { Contextmenu } from '@visactor/react-vgraph-ui';

<div id="graphContainerId">
  <Contextmenu graph={graph} getContent={getContent} targets={['node', 'edge']} />
</div>
```
| 配置项          | 类型                                                         | 描述                                |
| --------------- | ------------------------------------------------------------ | ----------------------------------- |
| getContent      | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* ReactNode | [必填]右键菜单内容                  |
| showContextmenu | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* boolean | 是否出现右键菜单，默认返回 true     |
| targets         | 'node' \|'edge' \|'group'\| string[]                         | 触发右键菜单的元素，默认为 ['node'] |
| style           | Object                                                       | 附加到右键菜单容器上的 css 样式     |
| classNames      | string \| string[]                                           | 附加到右键菜单容器上的样式类名      |
