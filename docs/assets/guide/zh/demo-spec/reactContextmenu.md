# 右键菜单 Contextmenu
右键菜单常用于承载对单个实体或整体图产品的功能，能提升用户的操作效率。xGraph 提供 react 框架的 Contextmenu。出于各个产品视觉风格不一的考虑仅做容器显隐响应，内部功能可自行实现。
```javascript
import { Contextmenu } from '@dp/xgraph-react-ui';

<div id="graphContainerId">
  <Contextmenu graph={graph} getContent={getContent} targets={['node', 'edge']} />
</div>
```
| 配置项          | 类型                                                         | 描述                                |
| --------------- | ------------------------------------------------------------ | ----------------------------------- |
| getContent      | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* ReactNode | **\[必填\]**右键菜单内容                  |
| showContextmenu | (*entityData*: *any*, *type*: 'node' \|'edge' \|'group') *=>* boolean | 是否出现右键菜单，默认返回 true     |
| targets         | 'node' \|'edge' \|'group'\| string[]                         | 触发右键菜单的元素，默认为 \['node'\] |
| style           | Object                                                       | 附加到右键菜单容器上的 css 样式     |
| classNames      | string \| string[]                                           | 附加到右键菜单容器上的样式类名      |
