# 力导向基础用法

力导向布局是一种主要用于无向图（或者在有向图中不在意层级关系对布局的影响）的常用布局算法。力导向布局的特点：原理简单直观、易于实现、定制能力强。常用于节点连接的关系展示，可以进行如关系网络、知识图谱、关系图谱的分析。

本算法中内置了大多数场景下都适用的力函数，一般来说仅需采用以下用法：

```javascript
import { Graph, ForceDirectedLayout } from '@visactor/vgraph';
const graph = new Graph(...);
const fdp = new ForceDirectedLayout({
      data: { nodes: [...], edges: [...] },
      onTick:()=>{graph.refresh();}
});
```

详细配置可以参考 [ForceDirectedLayout](/vgraph/guide/layout-spec/force)。
也可以体验[自动布局力导向图](/vgraph/demo/force/autoForce)根据数据计算得到使用于当前数据集的力配置。
