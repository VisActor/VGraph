# 状态管理
我们发现大量的图分析交互都是**轻微的改变一些节点的外观状态然后恢复原状**，如果全部用 updateData 来实现这种变更会非常重, 因为 updateData 会比较节点中每个配置并计算更新。于是我们设计了状态机制，用于在一些微交互上快速改变 [keyShape](/vgraph/guide/keyshape) 样式的简便更新方法。

## 简单用法

从上一节可知首先要在 graph 实例上设置 `setStateStyles` 来指定每种状态的样式，然后在节点上设置对应的状态。比如一个常见交互为鼠标移动到到节点内边框高亮，移出时节点恢复原状就可以这样实现：
```typescript
// 设置节点状态，初始化 graph 实例时直接配置也能达到一样的效果
graph.set('setNodeStateStyles', (state: string, data: any) => {
  if (state === 'highlight') {
    // 改变 keyShape 的边框色
    return { strokeStyle: '#3370FF' };
  }
});

// 鼠标移入节点时设置状态
graph.on('node:mouseenter', e => {
  e.target.setState('highlight');
});

// 鼠标移出节点移除状态
graph.on('node:mouseenter', e => {
  e.target.removeState('highlight');
});
```


## 多状态叠加

节点可以存在多个状态，状态样式也可叠加。如果多个状态修改了同一个属性，则后置的会覆盖前置的。例如节点有状态 `highlight` 和 `focus` 都要更新 keyShape 的 `strokeStyle` 属性，先置 `highlight` 后置 `focus` 则生效的就是 `focus` 的 `strokeStyle` 属性。但是若想一个实例同时仅存在一个状态，可以设置 `setState('state', true)` 来实现。



## 多个图形响应
假如在你的场景下并不仅是要改变 keyShape 的样式，一种方法是可以在 `setStateStyle` 中获取实例直接修改。例如一个 rect 类型的节点，希望在 hover 时节点的边框和文本的颜色同时做出样式更新。

```typescript
graph.set('setNodeStateStyles', (state: string, data: any) => {
      // 获取当前节点实例
      const node = graph.getNodeById(data.id);
      // 获取节点内文本图形对象
      const label = node.getLabel();
      if (state === 'hover') {
         // 更新文本样式
        label.set('fillStyle', '#3370FF');
        // 返回待更新的 keyShape 矩形样式
        return { strokeStyle: '#3370FF' };
      } 
      // 节点 default 样式
      else {
        // 恢复节点原本样式
        label.set('fillStyle', '#666');
        return { strokeStyle: '#666' };
      }
    }
  
  // 鼠标移入节点时更新到 hover 样式  
  graph.on('node:mouseenter', e => {
      e.target.setState('hover', true);
  });  
  // 鼠标移出节点时置回原本样式
   graph.on('node:mouseleave', e => {
      e.target.setState('default', true);
  }); 
```
在多个图形响应状态移除时使用 removeState 只会恢复 keyShape 状态，其他图形状态不会恢复。这需要在 `setStateStyle` 设置节点的 default 状态，在该状态中规定节点的原本样式，之后使用 `setState` 将 `default` 置为唯一状态，才会恢复全部修改图形状态。


### 请注意
- 如果状态不是短暂更改后**恢复**的情况，后续的交互和数据变更(如调用 `updateData`)等可能会**覆盖**状态中指定的样式。
- 如果某交互下更改的内容特别多，也可以考虑使用`updateData`直接更新整体样式。