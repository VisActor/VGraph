# 力导向节点分组布局

普通的力导向布局无法让不同分组避免重叠。vGraph 研发了一种适用于力导向布局的分组布局组件 ForceDirectedGrouping，该组件通过分组之间的无重叠力来避免分组之间的重叠。 该组件还封装了分组节点的展示和交互。 ForceDirectedGrouping 组件一般结合力导向布局一起使用。

```typescript
import { Graph, ForceDirectedGrouping, ForceDirectedLayout} from '@visactor/vgraph';

const graph = new Graph(...options);
const forceGrouping = new ForceDirectedGrouping({graph, options:{...}} );

const fdp = new ForceDirectedLayout(forces:{
    'someforce' : new ForceXXX({
        ...,
        iterationCallback: forceGrouping.groupVelocity,
    }), // 一般放在 ForceCollision 的 iterationCallback上，如果没有，放在其他的 Force 上也可。
},...);
```

详细配置可以参考 [力导向分组布局 ForceDirectedGrouping](/vgraph/guide/plugin-spec/raw-plugins#力导向分组布局-ForceDirectedGrouping)。
