# Icon

An Icon is a graphic object used to create an icon graphic instance, containing information such as the icon's position, size, and encoding, for the rendering engine to draw and interact with.

## Example

```typescript
import { Icon } from '@visactor/vgraph';

const icon = new Icon({
    x: 100,
    y: 50,
    icon: '&#xe698;',
    size: 32,
    fillStyle: 'l(0) 0:#fff 0.5:#7ec2f3 1:#1890ff',
    fontFamily: 'iconfont'
});
```

<p><img src="/vgraph/guide/shape/icon.png" width="300"></p>

## Icon Configuration

| Field | Type | Description |
| --- | --- | --- |
| x | number | The x-coordinate of the icon's center. |
| y | number | The y-coordinate of the icon's center. |
| icon | string | The unicode reference identifier for the icon font. |
| size | number | The size of the icon. The default value is 16. |
| fontFamily | string | The `font-family` property of the custom icon font defined via CSS. Refer to [CSS font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family). |

> Note: We support using CSS custom fonts to load vector icons stored in font format. Refer to [Iconfont Font Generation Principles and Usage Tips](https://www.iconfont.cn/help/article_detail?spm=a313x.7781069.1998910419.d6f75c492&article_id=1).

> Note: To get the icon font reference identifier, refer to [How to Use Iconfont on the Web](https://www.iconfont.cn/help/detail?spm=a313x.7781069.1998910419.24&helptype=code).

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

## Accessible Properties

| Property | Type | Description |
| --- | --- | --- |
| type | 'icon' | Shape type |
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
