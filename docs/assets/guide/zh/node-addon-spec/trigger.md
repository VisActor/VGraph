# UI 触发器

Trigger 是 vGraph 研发的 UI 触发辅助工具，vGraph 原生的文字气泡 RawTooltip, 基于 Arco 封装的 Tooltip 和 Trigger 都依赖于此工具，可以依赖此工具研发各种与 vGraph 图元联动的 ui 组件。

```javascript
import { Trigger } from '@visactor/vgraph';

// 实例化 Trigger
const trigger = new Trigger(graph, options);
```


| 字段          | 类型                 | 描述                                        |
| ------------- | -------------------- | ------------------------------------------- |
| target        | 'node' \| 'edge' \| 'group' | \[必填\] 要触发 ui 的图元 |
| onVisibleChange   | (visible: boolean, evt?: GraphEvent, entityBBox?: Record<string, number>) => void; | \[必填\] ui 显示或隐藏的回调，entityBox 是被触发元素相对于视窗的定位数据 |
| trigger       | 'hover' \| 'click' \| 'contextMenu' |  触发方式 |
| triggerId     | string | 仅在图元的指定图形的 triggerId 匹配时触发时显示 ui |
| showDelay     | string | trigger 为 hover 时 ui 出现延时的毫秒数 |
| hideDelay     | string | trigger 为 hover 时 ui 隐藏延时的毫秒数 |

**注意**
- Trigger 与 ui 组件配合使用的原理是在 `onVisibleChange` 时用户可在 `entityBox` 处添加一个占位 div 以便 ui 组件去做一个相对定位。
- 由于占位 div 在 graph 上层，因此 Tooltip 活跃时 graph 无法直接响应事件。若有 Tooltip 激活时关系图要响应点击事件的诉求，可以监听占位 div 的点击事件，使用 graph.emitEvent 手动触发到图上。可参考[此 demo](/vgraph/demo/react/triggerTooltip)



以 react 组件为例概要示范 Trigger 的使用方法
```javascript
import { Trigger } from '@visactor/vgraph';
import { Tooltip } from 'some-ui-component';

export default () => {
  // 占位 div 的样式，便于 UI 组件进行相对定位
  const [entityBox, setEntityBox] = useState(null);
  useEffect(() => {
    // 实例化 Trigger 组件
    const trigger = new Trigger(graph, {
      ...options,
      onVisibleChange(visible, evt, entityBox) {
        if (visible) {
          setEntityBox(entityBox);
        } else {
          setEntityBox(null);
        }
      }
    });
  }, [graph]);

  const styles = {
    position: 'absolute',
    zIndex: 1,
  };

  // 要出现 tooltip 则占位 div 在 canvas 上层
  if (entityBox) {
    Object.assign(styles, entityBox);
  } else {
    // 否则占位 div 在 canvas 下层
    styles.zIndex = -1;
  }

  return <Tooltip visible={!!entityBox} onVisibleChange={visible => { if (!visible) { setEntityBox(null) } }}>
      <div style={styles} onClick={e => { graph.handleEvent(e.nativeEvent); }} />
  </Tooltip>;
}
```


