
# 树图布局

树图布局需要配合[树图实例](/vgraph/guide/tree-graph-spec/options)一起使用。

目前 vGraph 支持三种树布局方式。引用方式如下
```typescript
import { CompactBox, TreeGraph } from '@visactor/vgraph';
// 推荐引用方式，配置在 TreeGraph 中
const graph = new TreeGraph({
  layout: {
    type: 'compactBox', 
    options: layoutOptions
  }
});

// 第二种引用方式，直接实例化
const layout = new CompactBox(layoutOptions);
const graph = new TreeGraph({
  layout,
  ...graphOptions,
});
```

| 布局名称         | 布局效果                                                     | 特征                                                         | 适合场景                     |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------- |
| Dendrogram 平衡树 | ![img](/vgraph/guide/api/dendrogram.png#pic_center=300) | 不管树层级如何，总是叶节点对齐，非叶节点根据层级均匀分布     | 组织架构图，亲缘谱系图       |
| MindMap 脑图树    | ![img](/vgraph/guide/api/mindmap.png#pic_center=300) | 深度相同的节点将会被放置在同一层，每棵子树占用空间不会有交叉 | 数据归纳整理，头脑风暴       |
| CompactBox 紧凑树 | ![img](/vgraph/guide/api/compactbox.png#pic_center=300) | 从根节点开始，同一深度的节点在同一层，并且布局时会将节点大小考虑进去尽量节省空间 | 数据量大或展示空间不足的树图 |



除节点配置项 (**width**: 节点宽度, **height**: 节点高度, **collapsed**: 是否收起) 外，也支持如下参数自定义布局。

| 字段      | 类型                      | 描述                                                         |
| --------- | ------------------------- | ------------------------------------------------------------ |
| direction | `LR` \ `RL` \ `TB` \ `BT`  | 布局方向；`LR` 为从左到右布局， `RL` 为从右到左布局， `TB` 为从上到下布局，`BT`为从下到上布局。默认为`TB` 布局                            |
| nodeSep   | (nodeData: TreeData) => number | 指定同层级节点之间的间距                                     |
| rankSep   | (nodeData: TreeData) => number | 指定跨层级节点间距                                           |
| nodeSize  | (nodeData: TreeData) => number | 指定节点大小。推荐在节点上直接配置 `width` 和 `height`       |
| radial    | boolean                   | 是否采用径向树分布。默认为 false。当单层节点特别多时推荐开启以获得更好的浏览体验。径向树分布时会在节点上写入 radial 辅助定义节点文本标签的旋转。具体可见[径向树布局示例](/vgraph/demo/tree/basic) |
| setTreePosition   | (nodeData: TreeData) => { leftTree: TreeData, rightTree: TreeData }             | MindMap 专有配置，设置子树的位置。默认左右平均分配。 |
