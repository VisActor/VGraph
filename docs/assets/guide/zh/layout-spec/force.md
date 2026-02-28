# 力导向布局

力导向布局是一种主要用于无向图（或者在有向图中不在意层级关系对布局的影响）的常用布局算法。力导向布局的特点：原理简单直观、易于实现、定制能力强。常用于节点连接的关系展示，可以进行如关系网络、知识图谱、关系图谱的分析。
本算法中内置了大多数场景下都适用的力函数，一般来说仅需采用以下用法：

```javascript
import { Graph, ForceDirectedLayout } from '@visactor/vgraph';

// 推荐引用方式，配置在 Graph 中
const graph = new Graph({
  layout: {
    type: 'force', 
    options: layoutOptions
  }
});

// 第二种引用方式，直接实例化
const graph = new Graph(...);
const fdp = new ForceDirectedLayout({
    // 指定参与布局的数据
    graph,
    ...layoutOptions
});
graph.set('layout', fdp);
```

以下是默认配置的 vgraph 与 d3 的布局效果对比:

| vGraph 效果图                                          | D3 效果图                                          |
| ------------------------------------------------------ | -------------------------------------------------- |
| <img src="/vgraph/guide/api/vis-by-vgraph.png" width="400"> | <img src="/vgraph/guide/api/vis-by-d3.png" width="400"> |
| <img src="/vgraph/guide/api/mis-by-vgraph.png" width="400"> | <img src="/vgraph/guide/api/mis-by-d3.png" width="400"> |

## 配置项

| 字段                   | 数据类型                          | 描述                                                                                                                                |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| data                   | {nodes:any\[\], edges?:any\[\]}       | \[必填\] 设置需要布局的数据。nodes 是必须的，edges 是可选的。如果未配置 data，可以先配置其他参数，在后续通过 setData 接口设置数据。 |
| forces                 | { \[key: string\]: ForceBase }      | 自定义应用的力函数。如果未设置，则使用默认配置。后续可以通过 [力函数实例方法](/vgraph/guide/layout-spec/force#力函数配置) 进行增删改查 |
| maxIteration   | number                            | 指定最大迭代次数                                                                                                                    |
|  clearOnEndOnFirstCall   |  boolean        |  \[NEW\]是否在首次布局结束后清空布局结束回调。常用于首次布局后需要 `fitView` 或 `alignView`，而后续布局则保持视窗内容的场景。      |
| tickIterations | number                            | 每个 tick 进行的迭代次数。默认为 1。tickIterations 越大，总的 tick 次数越少。                                                       |
| initMode       | 'pivotMDS'\| 'spiral' \| 'random' | 指定初始布局方式，默认为 'pivotMDS'。                                                                                               |
| center       | { x: number, y: number } | 指定布局的中心。                                                                                              |
| onTick                 | ()=>{}                            | 每次 tick 后运行的回调函数。常见用法为：刷新画布，达到动画效果。可以通过setOnTick(fn:()=>{}) 进行修改                              |
| onEnd                  | ()=>{}                            | 布局完成后运行的回调函数。常见用法：平移缩放布局到画布中心。可以通过setOnEnd(fn:()=>{}) 进行修改                                           |

## 实例方法

### 数据和参数

| 实例方法                                  | 返回值                           | 描述               |
| ------------------------------------------- | ---------------------------------- | -------------------- |

| setOptions(options)                       | void                             | 设置上表中的options，用法如 fdp.setOptions({maxIteration:100})。 |

### 运行状态
| 实例方法                                  | 返回值                           | 描述               |
| ------------------------------------------- | ---------------------------------- | -------------------- |
| stop()                                | void                         | 停止 timer。迭代也随之停止    |
| start()                               | void                         | 重启 timer，不会做其他状态更改 |
| restart()                             | void                         | 重新开始运行, 重置 iteration 计数并将 alpha 重置为 options.restartAlpha 并重启 timer |
| step()                           | void                      | 手动运行一个迭代步，不通过timer调用                |
| setOnTick(fn:()=>{}) | void | 修改 onTick 回调 |
| setOnEnd(fn:()=>{}) | void | 修改 onEnd 回调 |

### 力函数

| 实例方法                                  | 返回值                           | 描述               |
| ------------------------------------------- | ---------------------------------- | -------------------- |
| configForces(forces: { \[key: string\]: ForceBase } \| Map<string, ForceBase> \| undefined) | void      | 配置并初始化力。如果未指定力，则使用默认力。<br> * 会产生如下调用链: configForces -> initializeForces -> force.initialize(nodes) |
| initializeForces() | void | 初始化所有力函数。将节点数据信息灌入力函数，力函数内部进行预计算 |
| addForce(key: string, force: ForceBase) | void | 增加一个力, 键值为 key |
| removeForce(key: string) | void | 删除指定 key 的力 |
| setForce(key: string, options: {}) | void | 修改键值为 key 的力的参数 |
| getForces() | forces: Map<key, force> | 返回FDP实例目前状态的力 Map |

#### 默认力函数

默认力函数使用如下配置:

```javascript
const forces = new Map<string, ForceBase>([
    ['link', new ForceLink({ edges:[...], options: { distance: 30 } })],
    ['charge', new ForceManyBody({ options: { strength: -30 } })],
    ['collide', new ForceCollision({ options: { radius: 10 } })],
    ['center', new ForceCenter({ options: { x:..., y:... } })],
]);
```

可以复制该配置到代码中并以此配置力导向布局实例，方便调试和修改力函数配置。

## 自动配置力函数
自动配置力函数方法 `autoFDP` 大多用于预先不知晓展示数据的规模和特性的场景。此方法会分析数据规模和数据特征给出推荐的缩放比和力配置。也就是：
- 吸引力`ForceLink`
- 排斥力`ForceManyBody`
- 向心力`ForceCenter`
- 碰撞力`ForceCollision`


配置项 options 如下：



| 字段         | 类型                       | 描述                                                                                                                         |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| nodeSize         | number     | 为了加速计算，节点大小必填。如果节点大小不一，可填入大小的平均值。                  |
| graphSize     | number\[\]                 |   图尺寸。同 graph 的 width 和 height。                                                                                 |
| scaleFactor         | number        |  叠加缩放比，默认为 1。如果你的数据集得出的缩放比始终偏大/偏小，可以叠加缩放调整。                                          |



基础用法为：
```javascript
import { autoFDP, FDPLayout } from '@visactor/vgraph';

const forces = autoFDP(graph, {
  nodeSize: 10,
  graphSize: [800, 600],
});

const fdp = new FDPLayout({
  data: graph,
  forces,
  ...
});

```

在默认力的基础上添加类间的引力和斥力，使同类节点更加紧凑。
```javascript
import { autoFDP, IntraClusterForce, InterClusterForce,FDPLayout } from '@visactor/vgraph';

const forces = autoFDP(graph, {
  nodeSize: 10,
  graphSize: [800, 600],
});
forces.set('attrCluster', new IntraClusterForce({ options: { strength: 0.2 } }));
forces.set('repulCluster', new InterClusterForce({ options: { strength: -10 } }));

const fdp = new FDPLayout({
  data: graph,
  forces,
  ...
});
```

## Web Worker 版本
Web Worker 版本的力导向布局 `snycFDP` 用于在 Web Worker 中进行同步的大数据量布局计算，比在页面上直接计算耗时会低，用户体验也更好。




Worker 部分示例代码
```javascript
import { syncFDP } from '@visactor/vgraph';

const ctx = self;

ctx.addEventListener('message', (event) => {
  const { data, options } = event.data;
  syncFDP(data, options);
  ctx.postMessage({ data, options });
});
```




主流程示例代码
``` javascript
  const worker = new ForceWorker();
  // data 是通用数据结构 { nodes: [], edges: [] }
  worker.postMessage({ data, options: ForceOptions });
  worker.onmessage = (event: any) => {
    graph.data(event.data);
    graph.fitView();
  };
```

syncFDP 接受的配置项 ForceOptions 如下：

| 字段         | 类型                       | 描述                                                                                                                         |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| maxIteration         | number     | 指定最大迭代次数。           |
| nodeSize     | number               |   图中节点大小 |
| graphSize        | number\[\]        |  画布大小         |
| autoForce        | boolean        |  使用自动配置力函数推荐的力参数进行布局      |
| forces        | { \[key: string\]: any }       |  自定义力和参数。当未开启 autoForce 并未配置 forces 时会使用默认的力参数进行布局。   |




因此一个简单的同步力导向配置应如此引用：
```javascript
worker.postMessage({ data, options: {
    maxIteration: 150,
    // 可以开启 autoForces 采用自动配置力函数，开启后再配置 forces 无效
    // autoForces: true,
    nodeSize: 15,
    graphSize: [800, 600],
    forces: {
      link: { distance: 30 },
      manyBody: { strength: -30 },
      collision: { radius: 8 },
      center: { x: 400, y: 300 }
    },
  } });
```

配置项中力的 key 与正常配置力之间的对应关系如下

| key         | 力对象                  | 描述                                                                                                                         |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| link         | ForceLink    |  引力          |
| manyBody   | ForceManyBody           |   节点间斥力  |
| collision        |   ForceCollision    |  无重叠力        |
| center        | ForceCenter       |  中心力     |
| x        |  ForceX   |  水平位置约束力   |
| y       |  ForceY  |  垂直位置约束力   |
| radial      |  ForceRadial  |  距离约束力   |
| intra      |  IntraClusterForce  |  类内吸引力  |
| inter      |  InterClusterForce  |  类间排斥力  |
