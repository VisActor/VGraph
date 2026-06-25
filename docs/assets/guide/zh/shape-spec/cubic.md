# 三次贝塞尔曲线 Cubic

三次贝塞尔曲线 Cubic 是图形对象的一种，用于创建一个三次贝塞尔曲线的图形实例，包含曲线的控制点、箭头等信息，用于渲染引擎进行绘制及交互操作。

## 示例

```typescript
import { Cubic } from '@visactor/vgraph';

const cubic = new Cubic({
    points: [[308.2842712474619, 320],  [324.8528137423857, 360], [275.1471862576143, 360],  [291.7157287525381, 320]],
    strokeStyle: '#f50',
    lineWidth: 2,
    endArrow: true,
    hitWidth: 6,
});
```

<p><img src="/vgraph/guide/shape/cubic.png" width="500"></p>

## Cubic 配置项

| 字段       | 类型       | 描述                                                              |
| ---------- | ---------- | ----------------------------------------------------------------- |
| points     | number[][] | 一个 4×2 二维数组，每个一维数组表示一个控制点坐标，总共四个控制点 |
| startArrow | ArrowType  | 起始箭头配置项                                                    |
| endArrow   | ArrowType  | 终点箭头配置项                                                    |
| hitWidth   | number     | 事件触发的感应宽度                                                |

> 注：当 startArrow 或 endArrow 被指定为 undefined，null 或 false 时，将不绘制任何箭头，当指定为 true 时，绘制默认的三角箭头，箭头配置项 ArrowType 定义如下：

```typescript
type ArrowType = boolean | {
  type?: 'default' | 'default-round',
  width?: number,
  height?: number,
};
```

| 字段   | 类型   | 描述                                                                 |
| ------ | ------ | -------------------------------------------------------------------- |
| type   | string | 箭头类型，default 为默认三角形箭头，default-round 为圆角的三角形箭头 |
| width  | number | 箭头翼展宽度                                                         |
| height | number | 箭头于终点处的切向高度                                               |


## 通用配置项

以下为所有图形对象的公共配置项：

| 字段          | 类型               | 描述                                                                                                                                                                                                                  |
| ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| opacity       | number             | 透明度                                                                                                                                                                                                                |
| fillStyle     | string             | 填充色                                                                                                                                                                                                                |
| strokeStyle   |  string | 描边颜色                                                                                                                                                                                                              |
| lineWidth     | number             | 描边宽度                                                                                                                                                                                                              |
| lineDash      | number \| number[] | 划线模式，可参考[CanvasRenderingContext2D.setLineDash()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)                                                                       |
| lineDashOffset      | number \| number[] | 虚线起始偏移，可参考[CanvasRenderingContext2D.lineDashOffset](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)                                                                      |
| shadowBlur    | number             | 阴影模糊量，可参考[CanvasRenderingContext2D.shadowBlur](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur)                                                                         |
| shadowColor   | string             | 阴影色                                                                                                                                                                                                                |
| shadowOffsetX | number             | 阴影水平偏移量，可参考[CanvasRenderingContext2D.shadowOffsetX](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetX)                                                               |
| shadowOffsetY | number             | 阴影垂直偏移量，可参考[CanvasRenderingContext2D.shadowOffsetY](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowOffsetY)                                                               |
| clip          | ShapeBase          | 裁剪形状，将指定形状设置为裁剪路径，位于该裁剪形状路径范围内的部分将会保留，其余部分会被剔除，可参考[CanvasRenderingContext2D.clip()](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clip) |
| cursor        | string             | 当该形状获得光标焦点时，光标的类型。详情参考[CSS Cursor](https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor)                                                                                                     |


> 注：颜色字符串目前可支持以下格式：

| 类型            | 样例                                                           | 描述                                                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rgb             | `rgb(255, 255, 255)`                                           | 用 RGB 模式表示的白色                                                                                                                                                                                                                                                      |
| rgba            | `rgba(255, 255, 255, 1.0)`                                     | 用 RGBA 模式表示的白色                                                                                                                                                                                                                                                     |
| hsl             | `hsl(13, 100%, 10%)`                                           | 用 HSL 模式表示的颜色，等价于`rgb(56, 12, 0)`                                                                                                                                                                                                                              |
| hsla            | `hsla(13, 100%, 10%, 0.4)`                                     | 用 HSL 模式表示的颜色，等价于`rgba(56, 12, 0, 0.4)`                                                                                                                                                                                                                        |
| hex             | `#fff`                                                         | 用三位十六进制数表示的纯色，可忽略大小写                                                                                                                                                                                                                                   |
| hex             | `#FF00FF`                                                      | 用六位十六进制数表示的纯色，可忽略大小写                                                                                                                                                                                                                                   |
| hex             | `#3037ffff`                                                    | 用八位十六进制数表示的带透明度的颜色，可忽略大小写                                                                                                                                                                                                                         |
| name            | `cyan`                                                         | 用颜色名表示的颜色                                                                                                                                                                                                                                                         |
| linear gradient | `l(0) 0:#fff 0.5:#7ec2f3 1:#1890ff`                            | 线性渐变，表达式为`l(deg) step1:color1 step2:color2 ...`，表示线性倾斜角度为 deg ，插值分别在 step1, step2...处插值颜色为 color1, color2... 的线性渐变                                                                                                                     |
| radial gradient | `r(0.5,0.5,0) 0:#fff 0.5:#7ec2f3 1:#1890ff`                    | 径向渐变，表达式为`r(cx, cy, r0) r1:color1 r2:color2 ...`，表示在包围盒内相对坐标为 (cx, cy) 处为圆心，起始半径 r0，半径分别为 r1, r2...处插值颜色为 color1, color2... 的径向渐变                                                                                          |
| picture         | `p(a)./pattern.png` | 图片，表达式为`p(repeat)url`，当 repeat 值为 a 时表示背景重复方式为 repeat ；为 x 时表示 repeat-x ；为 y 时表示 repeat-y ；为 n 时表示 no-repeat。参数 url 表示图像路径。可参考[CSS background-repeat](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-repeat) |

## 可访问属性

| 属性      | 类型    | 描述           |
| --------- | ------- | -------------- |
| type      | 'cubic' | 形状类型       |
| capture   | boolean | 是否被焦点捕获 |
| animating | boolean | 是否是动画     |
| destroyed | boolean | 是否被摧毁     |
| parent    | any     | 父形状节点     |

## 实例方法

| 实例方法                                     | 返回值 | 描述                                                                                          |
| -------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| getBBox()                                    | BBox   | 获取包围盒位置与大小                                                                          |
| translate(x: number, y: number)              | void   | 平移                                                                                          |
| scale(xRatio: number, yRatio?: number)       | void   | 缩放                                                                                          |
| rotate(deg: number, radian: boolean)         | void   | 中心旋转， radian 用于指定参数 deg 是否为弧度制，是则为 true ， 否则为 false ，默认值为 false |
| rawRotate(deg: number, radian: boolean)      | void   | 根据 matrix 原点旋转，定义与 rotate 相同                                                      |
| clone()                                      | IShape | 获取一个形状的副本                                                                            |
| show()                                       | void   | 显示形状                                                                                      |
| hide()                                       | void   | 隐藏形状                                                                                      |
| get(k: string)                               | any    | 获取该形状名为 k 的属性                                                                       |
| set(k: string, v: any)                       | IShape | 将该形状名为 k 的属性值设置为 v                                                               |
| set(data: Record<string, any>)                            | IShape | 传入一个对象，批量设置属性                                                                    |
| on(eventName: string, callback: () => void)  | void   | 设置一个事件发生时的触发器                                                                    |
| off(eventName: string, callback: () => void) | void   | 设置一个事件停止时的触发器                                                                    |
| emit(eventName: string, data: Record<string, any>)        | void   | 触发指定的事件                                                                                |