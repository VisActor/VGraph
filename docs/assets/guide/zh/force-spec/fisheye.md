# 鱼眼放大镜

鱼眼放大镜是一种局部视觉组件，主要用于解决节点信息过多产生信息混乱和互相遮挡问题。vgraph 提供开箱即用的鱼眼放大镜组件。一般来说只需要通过如下方法即可调用:

```javascript
import { FisheyePlugin } from '@visactor/vgraph';
const graph = ...;
const fisheye = new FisheyePlugin(graph);
```

详细配置可以参考 [鱼眼放大镜 FisheyePlugin](/vgraph/guide/plugin-spec/raw-plugins#鱼眼放大镜-FisheyePlugin)。