# Custom Edges

We recommend using built-in edges to get default good-looking node styles and excellent running performance. When built-in edges do not meet your needs, you can choose to customize edges. vGraph has a complete variety of built-in edges, and in most graph analysis scenarios, you only need to extend the built-in edges.

## Extending Built-in Edges
When extending based on existing built-in edges, it can be considered that you can first define the built-in edge with the above built-in edge configuration, and then add/update a part of the graphics on the basis of the built-in edge's graphics. In this case, you need to override at least four methods:

- **getConfigsForShape(edgeData: any) => nodeConfigs**: Prepare the properties of the built-in edge based on the edge data. Then return the processed full properties.

- **shape(layer: Layer, edgeConfigs: any) => KeyShape | void**: Add custom graphics to the generated built-in edge. If a certain graphic is returned, it will be used as the Keyshape of the edge, otherwise the KeyShape of the built-in edge will be used instead.

- **afterUpdatePath(layer: Layer, edgeConfigs: any) => void**: This method is unique to edges and is used in scenarios where the edge is recalculated due to the translation of the nodes at both ends. This method is a hook method after the edge position is updated. You can define how to update the custom graphics in this method.

- **updateShapes(layer: Layer, nodeConfigs: any) => void**: When the edge data changes, the edge style needs to be updated accordingly. Defining this update method can improve the efficiency of batch updates. The update of the built-in edge will be completed first. In this method, you only need to update the custom graphics in the shape method.


**Note:** Custom edges also need to follow the [edge configuration](/vgraph/guide/edge-spec/options#Configuration) specification. Please configure the `source` and `target` of the edge in `setDefaultEdge`. Defining these properties in a custom edge will cause various problems such as point-line connection.


Next, we will inherit the straight line `line` to extend a custom edge that shows an operation icon on hover:
```javascript
import { Graph, registerEdge, Layer, Icon } from '@visactor/vgraph';

registerEdge('iconLine', {
  extends: 'line',
  // edgeData is the full edge configuration after being merged by setDefaultEdge
  getConfigsForShape(edgeData: any) {
  // In most cases, there is no need to modify the configuration for drawing with built-in edges, and no new update steps are needed for corresponding updates.
    return edgeData;
  },
  shape(layer: Layer, edgeConfigs: any) {
    const edge = layer.find((shape:any) => shape.get('_keyShape'));
    // Get the center point of the edge for positioning
    const p = edge.getPointAt(0.5);
    // For icon usage, see Graphics Object - Icon
    const icon = new Icon({
      x: p.x,
      y: p.y,
      icon: '&#xe7a9;',
      fillStyle: '#0057fe',
    });
    // Hide first, show on edge hover
    icon.hide();
    // todo Can add a click icon handler
    // icon.on('click', e => {});
    layer.add(icon);
    layer.set('icon', icon);
  },
  // Node position update triggers edge update, icon position is updated accordingly. If you don't need to update the icon position, you can skip overriding this method.
  afterUpdatePath(layer: any, configs: any) {
    const edge = layer.find((shape:any) => shape.get('_keyShape'));
    // The icon was saved to the layer in the shape method, making it easy to retrieve and update here
    const icon = layer.get('icon');
    const p = edge.getPointAt(0.5);
    icon.set(p);
  }
});

const graph = new Graph({
  ...
  setDefaultEdge() {
    return {
      // Specify the type as the name of the registered edge
      type: 'iconLine',
      // Expand the hot area to facilitate edge interaction
      hitWidth: 6,
    }
  }
});

graph.on('edge:mouseenter', e => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    // Uncomment the following to make the icon appear at the mouse position for a better experience
    // const point = graph.clientToCanvas(e.clientX, e.clientY);
    // icon.set({
    //   x: point.x,
    //   y: point.y
    // });
    icon.show();
    graph.draw();
  });

  graph.on('edge:mouseleave', e => {
    const edge = e.target;
    const icon = edge.layer.get('icon');
    icon.hide();
    graph.draw();
  });
```

The following is an effect diagram of the icon following the mouse position:

<p><img src="/vgraph/guide/api/edge.gif" width="500"></p>
