# Graph Options Quick Reference

Common `GraphConfigs` fields:

```ts
{
  container: string | HTMLDivElement;
  width: number;
  height: number;
  autoDraw?: boolean;
  autoLayout?: boolean;
  layout?: LayoutConfig | LayoutBase;
  renderMode?: "canvas" | "dom";
  padding?: number | number[];
  minRatio?: number;
  maxRatio?: number;
  fitViewAfterLayout?: boolean;
  throwError?: boolean;
  setDefaultNode?: (nodeData: any) => NodeConfigs;
  setDefaultEdge?: (edgeData: any) => EdgeConfigs;
  setDefaultGroup?: (groupData: any) => GroupConfigs;
}
```

Layout config union:

```ts
{ type: "dag"; options?: Partial<DAGLayoutOptions> }
{ type: "force"; options?: ForceDirectedLayoutOptions }
{ type: "compactBox"; options?: CompactBoxConfigs }
{ type: "dendrogram"; options?: DendrogramConfigs }
{ type: "mindMap"; options?: MindMapConfigs }
{ type: "indented"; options?: IndentedConfigs }
{ type: "pipeline"; options?: PipelineLayoutOptions }
{ type: "nestedDag"; options?: NestedDAGOptions }
```

Instance methods worth suggesting:

- `addBehavior(behavior, options?)`
- `removeBehavior(behaviorOrType)`
- `getNodeById(id)`, `getEdgeById(id)`, `getGroupById(id)`
- `setState(entity, state, onlyState?)`, `removeState(entity, state)`
- `updateData(data)`
- `layout(id?, args?)`
- `disableAutoDraw()`, `enableAutoDraw(previous?)`
- `disableAutoLayout()`, `enableAutoLayout(previous?)`
- `fitView()`, `focus(entity)`, `alignView()`
- `clear()`, `destroy()`
