# Polygon

A Polygon is a graphic object used to create a polygon graphic instance, containing information such as the polygon's coordinates, number of sides, and size, for the rendering engine to draw and interact with.

## Example

```typescript
import { Polygon } from '@visactor/vgraph';

// Regular hexagon
const polygon = new Polygon({
    type: "regular",
    n: 6,
    edgeLength: 20,
    cx: 400,
    cy: 200,
    lineWidth: 2,
    fillStyle: "#eee",
    strokeStyle: "#666",
});
// Six-pointed star
const pentagram = new Polygon({
    type: "star",
    n: 6,
    outerRadius: 20,
    cx: 300,
    cy: 200,
    lineWidth: 2,
    fillStyle: "#eee",
    strokeStyle: "#666",
});
```

<p><img src="/vgraph/guide/shape/polygon.png" width="500"></p>

## Polygon Configuration

| Field | Type | Description |
| --- | --- | --- |
| points | number[][] | An n x 2 two-dimensional array specifying the polygon's vertex coordinates. If this parameter is given, all other parameters below will be ignored. |
| type | `regular` \| `star` | The type of polygon. `regular` represents a regular N-sided polygon, and `star` represents an N-pointed star. |
| n | number | Describes the N of the polygon. |
| cx | number | The x-coordinate of the polygon's center. |
| cy | number | The y-coordinate of the polygon's center. |
| edgeLength | number | The length of the polygon's edges. This is only valid for the `regular` type. If this is specified, `outerRadius` will be ignored. |
| outerRadius | number | The radius of the polygon's circumscribed circle. |
| innerRadius | number | The radius of the polygon's inscribed circle. This is only valid for the `star` type. |

## Common Configurations

The following are common configurations for all graphic objects:

| Field | Type | Description |
| --- | --- | --- |
| opacity | number | Opacity |
| fillStyle | string | Fill color |
| strokeStyle | string | Stroke color |
| lineWidth | number | Stroke width |
| lineDash | number \| number[] | Dash pattern, refer to [CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash) |
| lineDashOffset | number \| number[] | Dash line starting offset, refer to [CanvasRenderingContext2D.lineDashOffset](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset) |
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
| picture | `p(a)https://img2.baidu.com/it/u=3533360967,3021622806&fm=253` | Image, the expression is `p(repeat)url`. When `repeat` is `a`, it means the background repeat mode is `repeat`; when it is `x`, it means `repeat-x`; when it is `y`, it means `repeat-y`; when it is `n`, it means `no-repeat`. The parameter `url` represents the image path. Refer to [CSS background-repeat](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-repeat) |

## Accessible Properties

| Property | Type | Description |
| --- | --- | --- |
| type | 'polygon' | Shape type |
| capture | boolean | Whether it is captured by focus |
| animating | boolean | Whether it is an animation |
| destroyed | boolean | Whether it has been destroyed |
| parent | any | Parent shape node |

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
