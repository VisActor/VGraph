# Animation

Animation is an important part of graph analysis applications. The clever use of animation can greatly improve the efficiency and user experience of the application. vGraph encapsulates commonly used animation effects in graph analysis, which can be directly referenced by users. It also provides a general animation interface for flexible custom animation.

The animation interface encapsulated by vGraph `animate(options) => string;` will return an animation id that can be used to stop the animation. The encapsulation configuration consists of the following four parts:
- Animation object `target`: a specific node/edge instance;
- Animation type `type`: specifies the type of encapsulated animation to be executed;
- Custom configuration `custom`: different custom configurations for different animation types;
- Common configuration `common`: common configurations such as animation duration and effects.


## Node diffuse animation
The node diffusion animation is often used to highlight one or more nodes. It can be an infinite animation, such as in [this case](/vgraph/demo/animate/diffuse) for alarming abnormal nodes. It can also be a finite animation for lightweight node focus.
```javascript
graph.animate({
  target: node,
  type: 'diffuse',
  custom: {...},
  common: {...}
});
```

**custom configuration**

| custom configuration | Type | Description |
| --- | --- | --- |
| fillStyle | string | The fill color of the diffusion shape, defaults to the color configured for the node |
| strokeStyle | string | The stroke color of the diffusion shape, defaults to null |
| opacity | number | The opacity of the diffusion shape, defaults to 0.3 |
| size| number\[] | The maximum size of the diffusion shape, defaults to a 10px diffusion on all four sides based on the original size of the node |

**common configuration**

| common configuration | Type | Description |
| --- | --- | --- |
| duration | number | Duration of a single animation (ms), defaults to 400 |
| repeat | boolean \| number | Whether to repeat. When configured as a number, it indicates the number of times the animation repeats. Defaults to 2 |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | Animation effect, defaults to 'easelinear' |
| onFinish | () => void; | Callback when the animation finishes |

## Node loading animation
The node loading animation is commonly used as a user-friendly transition when waiting for a single node's data request. For example, in [this case](/vgraph/demo/animate/loading), it's the waiting animation between requesting data to refresh the node and updating the node's state.
```javascript
graph.animate({
  target: node,
  type: 'loading',
  custom: {...},
  common: {...}
});
```

**custom configuration**

| custom configuration | Type | Description |
| --- | --- | --- |
| x | number | The x-coordinate of the center of the loading circle, defaults to the center of the node 0 |
| y | number | The y-coordinate of the center of the loading circle, defaults to the center of the node 0 |
| r | number | The radius of the loading circle, defaults to 8px |
| lineWidth | number | The thickness of the loading circle, defaults to 2px |
| color | string | The color of the loading circle |
| mask | boolean \| Record<string, any> | Background mask configuration, refer to [rect configuration](/docs/1.x/shape-spec_rect) |


**common configuration**

| common configuration | Type | Description |
| --- | --- | --- |
| duration | number | Duration of a single animation (ms), defaults to 1000 |
| repeat | boolean \| number | Whether to repeat. When configured as a number, it indicates the number of times the animation repeats. Defaults to true |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | Animation effect, defaults to 'easelinear' |
| onFinish | () => void; | Callback when the animation finishes |

## Node flash animation
The node flash animation is commonly used for lightweight focus on a single node. For example, in [this case](/vgraph/demo/animate/flash), the find node function will move the node to the center of the viewport and use a flash animation for lightweight focus. However, it is not recommended to set it as an infinite animation.

```javascript
graph.animate({
  target: node,
  type: 'flash',
  custom: {...},
  common: {...}
});
```

**custom configuration**






The custom configuration content is the style of the node's [key shape](/vgraph/guide/keyshape). These styles will be applied during the flash animation and will be restored to their original state after the animation ends. For graphic style configuration, please refer to [rect configuration](/vgraph/guide/shape-spec/rect).
**Note**: The custom configuration is suitable for infinite animations with simple style adjustments in conjunction with `graph.stopAnimate()`, which can conveniently and automatically restore the state of the connection line before the animation. If you are executing a single animation and need to retain the animation state until the mouse moves out, it is suitable to use it in combination with `setState`, as you can refer to [this case](/vgraph/demo/animate/grow).


**common configuration**




| common configuration | Type | Description |
| --- | --- | --- |
| duration | number | Duration of a single animation (ms), defaults to 400 |
| repeat | boolean \| number | Whether to repeat. When configured as a number, it indicates the number of times the animation repeats. Defaults to 2 |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | Animation effect, defaults to 'easelinear' |
| onFinish | () => void; | Callback when the animation finishes |

## Dashed line animation flow
The dashed line animation can vividly show the direction of data relationships and is suitable for infinite animations with some interactions. For example, in [this case](/vgraph/demo/animate/flow), this animation is applied to the entire related data link when hovering over a node.

```javascript
graph.animate({
  target: edge,
  type: 'flow',
  custom: {...},
  common: {...}
});
```

**custom configuration**
The custom configuration content is the style of the node's [key shape](/vgraph/guide/keyshape). These styles will be applied during the flash animation and will be restored to their original state after the animation ends. For graphic style configuration, please refer to [rect configuration](/vgraph/guide/shape-spec/path).



| custom configuration | Type | Description |
| --- | --- | --- |
| strokeStyle | string | The color of the connection line during animation, defaults to #3073FF |
| lineDash | number\[] | The dashed line style, refer to [CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash). Defaults to \[4, 2] |


**common configuration**

| common configuration | Type | Description |
| --- | --- | --- |
| duration | number | Duration of a single animation (ms), defaults to 400 |
| repeat | boolean \| number | Whether to repeat. When configured as a number, it indicates the number of times the animation repeats. Defaults to true |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | Animation effect, defaults to 'easelinear' |
| onFinish | () => void; | Callback when the animation finishes |


## Connection line extension animation grow
The connection line extension animation is suitable for showing the direct association of nodes. It can be a single animation or an infinite animation. For example, in [this case](/vgraph/demo/animate/grow), a single animation is applied to all connection lines starting from this node in conjunction with the state mechanism when hovering over the node.

```javascript
graph.animate({
  target: edge,
  type: 'grow',
  custom: {...},
  common: {...}
});
```

**custom configuration**


The custom configuration content is the style of the node's [key shape](/vgraph/guide/keyshape). These styles will be applied during the flash animation and will be restored to their original state after the animation ends. For graphic style configuration, please refer to [rect configuration](/vgraph/guide/shape-spec/path).
**Note**: The custom configuration is suitable for infinite animations with simple style adjustments in conjunction with `graph.stopAnimate()`, which can conveniently and automatically restore the state of the connection line before the animation. If you are executing a single animation and need to retain the animation state until the mouse moves out, it is suitable to use it in combination with `setState`, as you can refer to [this case](/vgraph/demo/animate/grow).
<br />
<br />

**common configuration**

| common configuration | Type | Description |
| --- | --- | --- |
| duration | number | Duration of a single animation (ms), defaults to 800 |
| repeat | boolean \| number | Whether to repeat. When configured as a number, it indicates the number of times the animation repeats. Defaults to 1. |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | Animation effect, defaults to 'easelinear' |
| onFinish | () => void; | Callback when the animation finishes |


## Connection line trail animation
The connection line trail animation is suitable for showing the direction of data relationships. It can be a single animation or an infinite animation, and can be used for displaying the running process of a pipeline, etc. For example, in [this case](/vgraph/demo/animate/trail), an infinite animation is defined for the connection line.

```javascript
graph.animate({
  target: edge,
  type: 'trail',
  custom: {...},
  common: {...}
});
```

**custom configuration**

| custom configuration | Type | Description |
| --- | --- | --- |
| length | number | The length of the light spot, defaults to 30(px) |
| getColorStops | (ratio: number) => {stop: number, color: string}[] | The gradient color of the light spot, stop range 0-1, color is the color of the corresponding percentage. The configuration is the same as [createLinearGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient).|

<br />

**common configuration**

| common configuration | Type | Description |
| --- | --- | --- |
| duration | number | Duration of a single animation (ms), defaults to 800 |
| repeat | boolean \| number | Whether to repeat. When configured as a number, it indicates the number of times the animation repeats. Defaults to 1. |
| easing | 'easelinear' \| 'easeCubic' \| 'easeSin' \| 'easeBounce' | Animation effect, defaults to 'easelinear' |
| onFinish | () => void; | Callback when the animation finishes |
