# Force-directed Node Grouping Layout

A normal force-directed layout cannot prevent different groups from overlapping. vGraph has developed a grouping layout component, `ForceDirectedGrouping`, suitable for force-directed layouts. This component avoids overlap between groups by using a non-overlapping force between them. The component also encapsulates the display and interaction of group nodes. The `ForceDirectedGrouping` component is generally used in conjunction with a force-directed layout.

```typescript
import { Graph, ForceDirectedGrouping, ForceDirectedLayout} from '@visactor/vgraph';

const graph = new Graph(...options);
const forceGrouping = new ForceDirectedGrouping({graph, options:{...}} );

const fdp = new ForceDirectedLayout({forces:{
    'someforce' : new ForceXXX({
        ...,
        iterationCallback: forceGrouping.groupVelocity,
    }), // Generally placed on the iterationCallback of ForceCollision, but if not, it can be placed on another Force.
},...});
```

For detailed configuration, please refer to [Force-directed Grouping Layout ForceDirectedGrouping](/vgraph/guide/plugin-spec/raw-plugins#力导向分组布局-ForceDirectedGrouping).
