# 背景 Background

在图编辑场景中，通常需要网格背景进行辅助编辑。Background 组件内置了 'dot' 和 'grid' 两种样式的背景。

以下是 Background 组件的使用示例，也可以在 demo 中进行体验。

```javascript
import { Graph, Background } from "@visactor/vgraph";
const background = new Background(graph, { type: 'dot' });
```

## 配置项

`BackgroundOptions`定义如下。

| 字段   | 类型            | 描述                                   |
| ------ | --------------- | -------------------------------------- |
| type   | 'grid' \| 'dot' | 网格样式类型。默认为 'grid'。          |
| step   | number          | 步长。默认与 Grid 组件的步长保持一致。 |
| backgroundColor  | string          | 背景颜色。默认为纯白'#FFFFFF'。        |
| opacity  | number         |   背景透明度。    |
| color  | string          | 前景色，根据类型不同是网格线条色或圆点填充色。     |
| imgUrl | string          | 自定义背景图片。默认为空。             |



## 实例方法

| 实例方法     | 返回值 | 描述                          |
| ------------ | ------ | ----------------------------- |
| enable()     | void   | 开启组件。                    |
| disable()    | void   | 关闭组件。                    |
| changeSize() | void   | 改变宽高以适应 Graph 的宽高。 |
| update()     | void   | 更新背景图片位置。            |
| destroy()    | void   | 销毁组件。                    |
