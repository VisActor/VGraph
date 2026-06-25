# State Management
We have found that a large number of graph analysis interactions involve **slightly changing the appearance state of some nodes and then restoring them**. It would be very heavy to implement this change entirely with `updateData`, because `updateData` would compare each configuration in the node and calculate the update. Therefore, we have designed a state mechanism for a convenient update method that quickly changes the [keyShape](/vgraph/guide/keyshape) style in some micro-interactions.

## Simple Usage

As can be seen from the previous section, you must first set `setStateStyles` on the graph instance to specify the style for each state, and then set the corresponding state on the node. For example, a common interaction is to highlight the border of a node when the mouse moves into it, and restore the node to its original state when the mouse moves out, which can be implemented as follows:
```typescript
// Set the node state. The same effect can be achieved by direct configuration when initializing the graph instance.
graph.set('setNodeStateStyles', (state: string, data: any) => {
  if (state === 'highlight') {
    // Change the border color of the keyShape
    return { strokeStyle: '#3370FF' };
  }
});

// Set the state when the mouse enters the node
graph.on('node:mouseenter', e => {
  e.target.setState('highlight');
});

// Remove the state when the mouse leaves the node
graph.on('node:mouseleave', e => {
  e.target.removeState('highlight');
});
```

## Multiple State Overlay

A node can have multiple states, and the state styles can also be overlaid. If multiple states modify the same property, the latter will override the former. For example, if a node has states `highlight` and `focus` that both update the `strokeStyle` property of the keyShape, setting `highlight` first and then `focus` will make the `strokeStyle` property of `focus` effective. However, if you want an instance to have only one state at the same time, you can achieve this by setting `setState('state', true)`.

## Multiple Graphics Response
If your scenario requires changing more than just the style of the keyShape, one method is to get the instance directly in `setStateStyle` and modify it. For example, for a rect-type node, you might want the node's border and text color to update simultaneously on hover.

```typescript
graph.set('setNodeStateStyles', (state: string, data: any) => {
      // Get the current node instance
      const node = graph.getNodeById(data.id);
      // Get the text graphic object inside the node
      const label = node.getLabel();
      if (state === 'hover') {
         // Update text style
        label.set('fillStyle', '#3370FF');
        // Return the keyShape rectangle style to be updated
        return { strokeStyle: '#3370FF' };
      }
      // Node default style
      else {
        // Restore the node's original style
        label.set('fillStyle', '#666');
        return { strokeStyle: '#666' };
      }
    }

  // Update to hover style when mouse enters the node
  graph.on('node:mouseenter', e => {
      e.target.setState('hover', true);
  });
  // Reset to original style when mouse leaves the node
   graph.on('node:mouseleave', e => {
      e.target.setState('default', true);
  });
```
When removing states for multiple graphics using `removeState`, only the keyShape state will be restored; other graphic states will not. This requires setting the node's `default` state in `setStateStyle`, which defines the node's original style. Then, using `setState` to set `default` as the only state will restore all modified graphic states.

### Please note
- If the state is not a temporary change that is later **restored**, subsequent interactions and data changes (such as calling `updateData`) may **override** the styles specified in the state.
- If a particular interaction changes a lot of content, you can also consider using `updateData` to directly update the overall style.
