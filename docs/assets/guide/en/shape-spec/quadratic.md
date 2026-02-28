# Quadratic Bezier Curve (Quadratic)

A Quadratic Bezier Curve (Quadratic) is a graphic object used to create a quadratic Bezier curve graphic instance, containing information such as the curve's control points and arrows, for the rendering engine to draw and interact with.

## Example

```typescript
import { Quadratic } from '@visactor/vgraph';

const quadratic = new Quadratic({
    points: [[250, 60], [20, 110], [70, 250]],
    strokeStyle: '#545454',
    lineWidth: 1,
    startArrow: true,
    endArrow: {
      type: 'default-round',
    },
    hitWidth: 4,
});
```

<p><img src="/vgraph/guide/shape/quadratic.png" width="500"></p>

## Quadratic Configuration

| Field | Type | Description |
| --- | --- | --- |
| points | number[][] | A 3x2 two-dimensional array, where each one-dimensional array represents a control point coordinate, for a total of three control points. |
| startArrow | ArrowType | Start arrow configuration item. |
| endArrow | ArrowType | End arrow configuration item. |
| hitWidth | number | The sensitive width for event triggering. |

> Note: When `startArrow` or `endArrow` is specified as `undefined`, `null`, or `false`, no arrow will be drawn. When specified as `true`, the default triangular arrow will be drawn. The arrow configuration item `ArrowType` is defined as follows:

```typescript
type ArrowType = boolean | {
  type?: 'default' | 'default-round',
  width?: number,
  height?: number,
};
```

| Field | Type | Description |
| --- | --- | --- |
| type | string | Arrow type. `default` is the default triangular arrow, and `default-round` is a triangular arrow with rounded corners. |
| width | number | The wingspan width of the arrow. |
| height | number | The tangential height of the arrow at the endpoint. |

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
| type | 'quadratic' | Shape type |
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
