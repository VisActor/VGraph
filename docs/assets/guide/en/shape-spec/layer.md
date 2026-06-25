# Layer

A Layer is an abstract graphic object that can serve as a container for all graphic objects or layers, allowing you to build shapes in a tree-like structure. It does not directly participate in the rendering engine's drawing. In elements like nodes and edges, encapsulated `NodeLayer`, `EdgeLayer`, and `GroupLayer` are used to accelerate rendering and event response. In scenarios like custom nodes, `Layer` is usually used directly.

## Example

```typescript
import { Layer } from '@visactor/vgraph';

const layer = new Layer({ id: 'parent' });
const image = new Image({
    left: 300,
    top: 100,
    width: 164,
    height: 51,
    url: 'https://url/to/img.svg',
});
layer.add(image);
```

## Basic Configuration

| Field | Type | Description |
| --- | --- | --- |
| type | 'node' \| 'edge' \| 'group' | Specifies the layer type as a node layer, link layer, or group layer. |
| x | number | The x-coordinate of the node's center (valid for NodeLayer). |
| y | number | The y-coordinate of the node's center (valid for NodeLayer). |
| width | number | The width of the layer (valid for NodeLayer). |
| height | number | The height of the layer (valid for NodeLayer). |
| appendSize | number \| number[] | The extended width in four directions for event identification. If it is a 4-dimensional array, it represents the extended width of the top, right, bottom, and left sides in order (valid for NodeLayer). |
| hitWidth | number | The event trigger identification width at the edge of the layer (valid for NodeLayer). |
| padding | number \| number[] | The extended width in four directions for event identification in a group layer. If it is a 4-dimensional array, it represents the extended width of the top, right, bottom, and left sides in order (valid for GroupLayer). |
| source | ShapeBase | The starting key shape of the link (valid for EdgeLayer). |
| target | ShapeBase | The ending key shape of the link (valid for EdgeLayer). |

## Layer Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| add(shape: ShapeBase) | void | Adds a child shape to the layer. |
| addBefore(shape: ShapeBase, beforeShape: ShapeBase) | void | Adds a child shape before a specified child shape in the layer. |
| remove(shape: ShapeBase) | void | Removes the specified child shape. |
| findById(id: string) | ShapeBase \| null | Queries a child shape by ID. If found, it returns the shape; otherwise, it returns `null`. |
| find(fn: () => {}) | ShapeBase \| null | Queries the first child shape that meets a custom function's criteria. If found, it returns the shape; otherwise, it returns `null`. |
| findAll(fn: () => {}) | ShapeBase[] \| null | Queries all child shapes that meet a custom function's criteria. If found, it returns them; otherwise, it returns `null`. |
| shouldDraw(bbox: BBox) | boolean | Determines whether this layer needs to be drawn within the specified BBox. If so, it returns `true`; otherwise, it returns `false`. |
| getBBoxForHit() | BBox | Gets the BBox of this layer used for event triggering. |
| clear() | void | Clears all child shapes within this layer. |
| destroy() | void | Removes this layer. |

## Accessible Properties

| Property | Type | Description |
| --- | --- | --- |
| children | ShapeBase[] | An array of all child nodes of this layer. |
| type | string | The type of this layer. |
| capture | boolean | Whether it is captured by focus. |
| animating | boolean | Whether it is an animation. |
| destroyed | boolean | Whether it has been destroyed. |
| parent | any | Parent shape node. |

## Common Configurations

The following are common configurations for all graphic objects:

| Field | Type | Description |
| --- | --- | --- |
| opacity | number | Opacity |
| fillStyle | string | Fill color |
| strokeStyle | string | Stroke color |
| lineWidth | number | Stroke width |
| shadowBlur | number | Shadow blur amount, refer to [CanvasRenderingContext2D.shadowBlur](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur) |
| shadowColor | string | Shadow color |
| shadowOffsetX | number | Horizontal shadow offset, refer to [CanvasRenderingContext2D.shadowOffsetX](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX) |
| shadowOffsetY | number | Vertical shadow offset, refer to [CanvasRenderingContext2D.shadowOffsetY](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY) |
| clip | ShapeBase | Clipping shape. Sets the specified shape as the clipping path. The part within the clipping shape's path will be retained, and the rest will be culled. Refer to [CanvasRenderingContext2D.clip()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clip) |
| cursor | string | The type of cursor when this shape gains focus. For details, refer to [CSS Cursor](https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor) |

> Note: Color strings currently support the following formats:

| Type | Example | Description |
| --- | --- | --- |
| rgb | `rgb(255, 255, 255)` | White represented in RGB mode |
| rgba | `rgba(255, 255, 255, 1.0)` | White represented in RGBA mode |
| hsl | `hsl(13, 100%, 10%)` | Color represented in HSL mode, equivalent to `rgb(56, 12, 0)` |
| hsla | `hsla(13, 100%, 10%, 0.4)` | Color represented in HSL mode, equivalent to `rgba(56, 12, 0, 0.4)` |
| hex | `#fff` | Pure color represented by a three-digit hexadecimal number, case-insensitive |
| hex | `#FF00FF` | Pure color represented by a six-digit hexadecimal number, case-insensitive |
| hex | `#3037ffff` | Color with transparency represented by an eight-digit hexadecimal number, case-insensitive |
| name | `cyan` | Color represented by its name |
| linear gradient | `l(0) 0:#fff 0.5:#7ec2f3 1:#1890ff` | Linear gradient, the expression is `l(deg) step1:color1 step2:color2 ...`, which means a linear gradient with a linear tilt angle of `deg`, and the colors are interpolated at `step1`, `step2`... with `color1`, `color2`... |
| radial gradient | `r(0.5,0.5,0) 0:#fff 0.5:#7ec2f3 1:#1890ff` | Radial gradient, the expression is `r(cx, cy, r0) r1:color1 r2:color2 ...`, which means a radial gradient centered at the relative coordinate `(cx, cy)` within the bounding box, with a starting radius `r0`, and the colors are interpolated at radii `r1`, `r2`... with `color1`, `color2`... |
| picture | `p(a)./pattern.png` | Image, the expression is `p(repeat)url`. When `repeat` is `a`, it means the background repeat mode is `repeat`; when it is `x`, it means `repeat-x`; when it is `y`, it means `repeat-y`; when it is `n`, it means `no-repeat`. The parameter `url` represents the image path. Refer to [CSS background-repeat](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-repeat) |

## Instance Methods

| Instance Method | Return Value | Description |
| --- | --- | --- |
| getBBox() | BBox | Gets the bounding box position and size |
| translate(x: number, y: number) | void | Translates |
| scale(xRatio: number, yRatio?: number) | void | Scales |
| rotate(deg: number, radian: boolean) | void | Rotates around the center. `radian` is used to specify whether the parameter `deg` is in radians. If it is `true`, it is in radians; otherwise, it is in degrees. The default is `false`. |
| rawRotate(deg: number, radian: boolean) | void | Rotates based on the matrix origin, with the same definition as `rotate` |
| clone() | IShape | Gets a copy of a shape |
| show() | void | Shows the shape |
| hide() | void | Hides the shape |
| get(k: string) | any | Gets the property named `k` of this shape |
| set(k: string, v: any) | IShape | Sets the value of the property named `k` of this shape to `v` |
| set(data: Record<string, any>) | IShape | Passes an object to set properties in bulk |
| on(eventName: string, callback: () => void) | void | Sets a trigger for when an event occurs |
| off(eventName: string, callback: () => void) | void | Sets a trigger for when an event stops |
| emit(eventName: string, data: Record<string, any>) | void | Triggers the specified event |
