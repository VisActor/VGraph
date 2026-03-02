# UI Trigger

Trigger is a UI trigger auxiliary tool developed by vGraph. vGraph's native text bubble RawTooltip, as well as the Tooltip and Trigger encapsulated based on Arco, all rely on this tool. You can rely on this tool to develop various UI components that interact with vGraph elements.

```javascript
import { Trigger } from '@visactor/vgraph';

// Instantiate Trigger
const trigger = new Trigger(graph, options);
```

| Field | Type | Description |
| --- | --- | --- |
| target | 'node' \| 'edge' \| 'group' | \[Required] The graphic element to trigger the UI for. |
| onVisibleChange | (visible: boolean, evt?: GraphEvent, entityBBox?: Record<string, number>) => void; | \[Required] The callback for when the UI is shown or hidden. `entityBox` is the positioning data of the triggered element relative to the viewport. |
| trigger | 'hover' \| 'click' \| 'contextMenu' | The trigger method. |
| triggerId | string | The UI is only displayed when triggered on a graphic element whose `triggerId` matches. |
| showDelay | string | The delay in milliseconds for the UI to appear when the trigger is 'hover'. |
| hideDelay | string | The delay in milliseconds for the UI to hide when the trigger is 'hover'. |

**Note**
- The principle of using Trigger in conjunction with UI components is that when `onVisibleChange` occurs, the user can add a placeholder div at `entityBox` to allow the UI component to perform relative positioning.
- Since the placeholder div is above the graph, the graph cannot directly respond to events when the Tooltip is active. If you need the graph to respond to click events when the Tooltip is active, you can listen to the click event of the placeholder div and manually trigger it on the graph using `graph.emitEvent`. You can refer to [this demo](/vgraph/demo/react/triggerTooltip).

Here is a summary example of how to use Trigger with a React component:
```javascript
import { Trigger } from '@visactor/vgraph';
import { Tooltip } from 'some-ui-component';

export default () => {
  // The style of the placeholder div, for the UI component to perform relative positioning
  const [entityBox, setEntityBox] = useState(null);
  useEffect(() => {
    // Instantiate the Trigger component
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

  // If the tooltip is to appear, the placeholder div is on top of the canvas
  if (entityBox) {
    Object.assign(styles, entityBox);
  } else {
    // Otherwise, the placeholder div is below the canvas
    styles.zIndex = -1;
  }

  return <Tooltip visible={!!entityBox} onVisibleChange={visible => { if (!visible) { setEntityBox(null) } }}>
      <div style={styles} onClick={e => { graph.handleEvent(e.nativeEvent); }} />
  </Tooltip>;
}
```
