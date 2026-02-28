# 滚动条 Scroller

Scroller 是 vGraph 中的滚动条组件，用于画布的滚动、平移、缩放等操作。当启用此组件，请不要同时添加 `panZoom` 和 `dragCanvas` 交互，可统一在组件中配置相关能力。

以下是 Scroller 组件的使用示例，也可以在 demo 中进行体验。

```javascript
import { Graph, Scroller} from "@visactor/vgraph";
const scroller = new Scroller(graph, scrollerOptions );
```

## 配置项

| 字段       | 类型                           | 描述                                                                                                    |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| size       | number                         | 滚动条样式大小，单位为 px。默认值为10。                                                                    |
| padding    | number \| number[]             | 滚动条位于 graph 边界的 padding 值。默认为 10。如果设置为 undefined 或 null， 则会取 graph 的padding。  |
| show       | 'always' \| 'hover'            |       滚动条显隐方式。默认为 hover。 |
| dragCanvas | boolean \| Record<string, any> |  是否开启 dragCanvas 交互， 默认为 true。也可以传 [dragCanvas](/vgraph/guide/behaviors#dragCanvas/拖拽画布) 交互的参数配置。 |
| panZoom    | boolean \| Record<string, any> | 是否开启 panZoom 交互， 默认为 true。也可以传 [panZoom](/vgraph/guide/behaviors#panZoom/平移缩放) 交互的参数配置。 |
