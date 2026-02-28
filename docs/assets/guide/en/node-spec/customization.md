# Custom Node Types

We recommend using built-in nodes to get good-looking default node styles and excellent runtime performance. When the built-in nodes do not meet your needs, you can choose to customize them. There are two ways to customize nodes: one is to extend the existing built-in nodes, and the other is to completely customize them. **vGraph currently provides a d2c service that can directly generate custom node code from Figma design drafts. You can experience it in [Intelligent Code Generation](d2c_node).**

> The positioning basis for built-in nodes in vGraph is `{ x, y }` in the configuration, which is the center position of the built-in node. Therefore, the horizontal coordinate range of a node is `[ x - width/ 2, x + width / 2 ]`; the vertical coordinate range is `[ y - height / 2, y + height / 2 ]`.

> Custom nodes are for registering the graphical part that defines the node type. After registration, they can be consumed in the same way as specifying built-in node types.

## Extending Built-in Nodes

When extending existing built-in nodes, you can think of it as first defining the built-in node with the above built-in node configuration, and then adding/updating some graphics on top of the built-in node's graphics. In this case, you need to override at least three methods:

- **getConfigsForShape(nodeData: any) => nodeConfigs**: Prepares the properties of the built-in node based on the node data. Then returns the processed full properties.

- **shape(layer: Layer, nodeConfigs: any) => KeyShape | void**: Adds custom graphics to the already generated built-in node. If a certain graphic is returned, it will be used as the node's Keyshape; otherwise, the built-in node's KeyShape will be used instead.

- **updateShapes(layer: Layer, nodeConfigs: any) => void**: When the node data changes, the node style needs to be updated accordingly. Defining a node update method can improve the efficiency of batch updates. The update of the built-in node will be completed first. In this method, you only need to update the custom graphics in the `shape` method.

**Note:** Custom nodes also need to follow the [Node Configuration](/vgraph/guide/node-spec/options#通用配置项) specification. Please configure the node's `id`, `width`, `height`, `x`, and `y` in `setDefaultNode`. Defining these properties in a custom node will cause various problems such as point-line connections.

Next, let's look at a specific example of how to extend `rect` to define a `category` node:

```javascript
import { registerNode, Text } from '@visactor/vgraph';
registerNode('category', {
    type: 'category',
    // Inherits from rect
    extends: 'rect',
    // Uses the rect's label drawing, does not draw the label itself
    drawCurrentLabel: false,
    // Prepares parameters to initialize rect
    // data is the full node configuration data after merging through setDefaultNode
    getConfigsForShape(data: any) {
      // The rect's label is centered by default. The category has a color block on the left, so it needs to be shifted to the right a bit.
      label = prepareLabel(data);
      return {
        strokeStyle: '#ccc',
        ...data,
        label,
      }
    },
    // Draws a color block on top of the rect node
    shape(layer: Layer, configs: any) {
      // Calculates color block properties based on user configuration, such as positioning, style, etc.
      const categoryConfigs = getCategoryConfigs(layer, configs);
      // Defines the color block and adds it to the node. An id is specified here to facilitate finding the color block graphic during updates.
      const category = new Rect(categoryConfigs);
      category.set('id', 'categoryRect');
      layer.add(category);
    },
    // How to update the color block
    updateShapes(layer: Layer, configs: any) {
      // Finds the color block graphic
      const categoryRect = layer.findById('categoryRect');
      if (categoryRect) {
        // Calculates the new color block style and updates it
        categoryRect.set(getCategoryConfigs(layer, configs));
      }
    }
});
```

## Complete Customization

If the built-in nodes do not meet your needs, you can perform complete customization. Note that at this time, the built-in node's `label`, `icons`, etc. configurations are not effective. A node has three main stages: initialization, update, and destruction. If you want to completely customize a node, you need to implement the definitions for the initialization and update stages. The update logic is for better runtime performance. When the update logic is not defined, vgraph will destroy the graphic and then re-initialize it during an update. So if your graph nodes do not need to have their styles changed driven by data changes, or if the graph is very simple, you can also not define it.

- **init(layer: Layer, nodeConfigs: any) => Shape**: Given an empty layer, adds graphics based on the node data, and finally returns the KeyShape.

- **update(layer: Layer, nodeConfigs: any) => void**: Given a layer with existing graphics, updates the graphics based on the updated node data.

```JavaScript
import { registerNode, Text } from '@visactor/vgraph';

// Register a plain text node demo
registerNode('text', {
    init(layer: Layer, nodeConfigs: any) {
       const text = new Text({
           id: 'textId',
           // Centered text configuration within the node
           x: 0,
           y: 0,
           textAlign: nodeConfigs.textAlign,
           textBaseline: nodeConfigs.textBaseline,
       });
       // Add the text graphic
       layer.add(text);
       // text as the node's keyShape
       return text;
    },
    update(layer: Layer, nodeConfigs: any) {
        const text = layer.findById('textId');
        text.set({
           textAlign: nodeConfigs.textAlign,
           textBaseline: nodeConfigs.textBaseline,
        });
    }
});
```
