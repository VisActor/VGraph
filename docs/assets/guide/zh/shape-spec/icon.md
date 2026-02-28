# 图标 Icon

图标 Icon 是图形对象的一种，用于创建一个图标的图形实例，包含图标位置、大小、编码等信息，用于渲染引擎进行绘制及交互操作。

## 示例

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

## Icon 配置项

| 字段       | 类型   | 描述                                                                                                                                |
| ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| x          | number | icon 中心 x 坐标                                                                                                                    |
| y          | number | icon 中心 y 坐标                                                                                                                    |
| icon       | string | 图标字体的 unicode 引用标识符                                                                                                       |
| size       | number | icon 大小，默认值为 16                                                                                                              |
| fontFamily | string | 通过 CSS 自定义的图标字体的 font-family 属性，可参考[CSS font-family](https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family) |

> 注：我们支持使用 CSS 自定义字体来加载通过字体形式的存储的矢量图标，可参考[ iconfont 字体生成原理及使用技巧 ](https://www.iconfont.cn/help/article_detail?spm=a313x.7781069.1998910419.d6f75c492&article_id=1)。

> 注：获取图标字体引用标识符的方法，可参考[ 如何在 Web 端使用 iconfont ](https://www.iconfont.cn/help/detail?spm=a313x.7781069.1998910419.24&helptype=code)。

## 通用配置项

以下为所有图形对象的公共配置项：

| 字段          | 类型               | 描述                                                                                                                                                                                                                  |
| ------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| opacity       | number             | 透明度                                                                                                                                                                                                                |
| fillStyle     | string             | 填充色                                                                                                                                                                                                                |
| strokeStyle   |  string | 描边颜色                                                                                                                                                                                                              |
| lineWidth     | number             | 描边宽度                                                                                                                                                                                                              |
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
| picture         | `p(a)https://img2.baidu.com/it/u=3533360967,3021622806&fm=253` | 图片，表达式为`p(repeat)url`，当 repeat 值为 a 时表示背景重复方式为 repeat ；为 x 时表示 repeat-x ；为 y 时表示 repeat-y ；为 n 时表示 no-repeat。参数 url 表示图像路径。可参考[CSS background-repeat](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-repeat) |


## 可访问属性

| 属性      | 类型    | 描述           |
| --------- | ------- | -------------- |
| type      | 'icon'  | 形状类型       |
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