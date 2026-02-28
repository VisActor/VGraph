# 数据结构

vgraph 中为两种类型的数据结构打造了两种类型的图：
- **关系图 Graph**：面向点边组关系型数据，打造网图，有向无环图，力导图等。
- **树图 TreeGraph**: 面向嵌套关系型数据，适用于树图，思维图。

## Graph 数据结构
Graph 接受点边组类型数据结构。其中，节点和连线属性必须存在，但可以为空，如 `edges: []` ；分组属性数据可选。如果存在连线和分组数据，须保证连线的来源去向节点，分组的孩子节点都在 nodes 中定义过。为了保证运行时性能，vGraph 会直接修改源数据。不过不用担心，vGraph 提供了数据导出的方法。一份具有节点、连线、分组的最小化数据样例如下：
```js
const graphData = {
  // 节点数据。id 是节点的唯一标识不能为空。groupId 指定了节点直接归属的分组。
  nodes: [{
    id: 'node1',
    groupId: 'group1',
  }, {
    id: 'node2',
    groupId: 'group2',
  }],
  // 连线数据。source 和 target 为来源和去向节点的 id。
  edges: [{
    source: 'node1',
    edge: 'node2',
  }],
  // 分组数据。id 是分组的唯一标识不能为空。
  groups: [{
    id: 'group1',
  }, {
    id: 'group2',
  }],
};
```

## TreeGraph 数据结构
TreeGraph 接受嵌套结构数据。由于节点之间存在嵌套关系本身就代表了联系，因此无须指定 edges。以下是一份最小化数据样例：
```js
const treeGraphData = {
  // id 依然是节点的唯一标识不可为空
  id: 'root',
  // children 下是直接关联的节点数据
  children: [{
    id: 'child1',
    children: [{
      id: 'leaf1',
    }, {
      id: 'leaf2',
    }],
  }, {
    id: 'leaf3',
  }],
};
```


## GraphStructure 数据结构
vGraph 中的场景解决方案和图算法都接受 GraphStructure 为数据输入。一般我们开发图产品的过程为 **原始数据输入** -> **算法预处理(剪枝、过滤、聚类等)** -> **布局** -> **展示**。我们面对的很多场景数据量很大，因此直接灌数据到 graph 实例中再做各种处理显然是不合适的。出于性能考虑，我们又想将预处理中的一些中间结果直接用到布局和 graph 中加速后续计算和初始化。因此设计了`GraphStructure`这个数据结构。
### 配置项
Graph 默认约定节点都有 id，且连线的来源与去向都由 id 指定。可以使用以下配置项转换。

| 字段          | 类型                                                         | 描述                                                         |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| directed      | boolean                                                      | 是否是有向图                                                 |
| nodes         | NodeStructure[]                                                       | 节点原数据                                                   |
| edges         | EdgeStructure[]                                                       | 连线原数据                                                   |
| groups        | GroupStructure[]                                                      | 分组原始数据                                                 |
| getNodeId     | (nodeData: any) => string                                    | 指定节点 id。节点原数据中已存在 id 则无需指定。              |
| getEdgeSource | (edgeData: any) => string                                    | 指定连线的来源。当连线存在 source 字段并指向节点的 id 时无需指定 |
| getEdgeTarget | (edgeData: any) => string                                    | 指定连线的去向。当连线存在 target 字段并指向节点的 id 时无需指定 |
| getGroupData  | (groupData: any) => {id: string; children: string\[\]; \[key:string\]: any; } | 指定分组数据，分组中包含的节点用 children 字段指定节点 id    |


### 实例方法
| 实例方法                               | 返回值                      | 描述                                    |
| -------------------------------------- | --------------------------- | --------------------------------------- |
| add(type: 'node' \| 'edge', data: any) | entity                      | 添加节点/连线，返回实体                 |
| remove(entity: any)                    | void                        | 移除实体                                |

| getNodes()                             | NodeStructure[]             | 获取节点实体数组                        |
| getEdges()                             | EdgeStructure[]             | 获取连线实体数组                        |
| getEdges()                             | EdgeStructure[]             | 获取连线实体数组                        |
| getGroups()                             | GroupStructure[]             | 获取分组实体数组                        |
| getGroups()                             | GroupStructure[]             | 获取分组实体数组                        |
| getNodeById(id: string)                 | NodeStructure \| undefined |  根据 id 获取对应节点 |
| getGroupById(id: string)                 | GroupStructure \| undefined |  根据 id 获取对应分组 |

使用方式如下：


```javascript
import { GraphStructure } from '@visactor/vgraph';

const graphData = new GraphStructure({
   nodes: data.nodes,
   edges: data.edges,
   getNodeId(nodeData:any) {
       return nodeData.uid;
   }
});

someAlogrithms(graphData);

const data = graphData.getData();
graph.data(data);
```


GraphStructure 中的元素 NodeStructure, EdgeStructure 和 GroupStructure 分别也对应 Graph | TreeGraph 中的 Node, Edge 和 Group。一些数据获取方法也是通用的，用 GraphStructure 做数据预处理是非常方便的。

### NodeStructure
| 实例方法                                 | 返回值  | 描述                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------ |
| get(key: string)                         | any     | 获取节点原始数据或属性。                                     |
| set(key: string)                         | void   | 获取节点原始数据或属性。                                     |
| getSources()                         |  string[]  | 获取与节点直接相连并的来源节点                                 |
| getTargets()                         |  string[]  | 获取与节点直接相连并的去向节点                                 |
| getEdges()                    |  EdgeStructure[]  | 获取与节点直接相连的连线实例                  |