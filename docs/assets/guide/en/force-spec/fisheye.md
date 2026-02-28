# Fisheye Magnifier

The Fisheye Magnifier is a local visual component primarily used to solve the problem of information clutter and mutual occlusion caused by too much node information. vgraph provides an out-of-the-box fisheye magnifier component. Generally, you can call it using the following method:

```javascript
import { FisheyePlugin } from '@visactor/vgraph';
const graph = ...;
const fisheye = new FisheyePlugin(graph);
```

For detailed configuration, please refer to [Fisheye Magnifier FisheyePlugin](/vgraph/guide/plugin-spec/raw-plugins#鱼眼放大镜-FisheyePlugin).
