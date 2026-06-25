# Data Lineage Graph Solution

DataLineageGraph is a data lineage graph component, an out-of-the-box solution designed for data lineage scenarios. It has been implemented in scenes like coral lineage graph. This component supports two display forms: [Table View](/vgraph/demo/solutions/dataLineage) and [Column View](/vgraph/demo/solutions/columnLineage). It is imported as follows:
```javascript
import { DataLineageGraph } from '@visactor/react-vgraph';

() => <DataLineageGraph ...options />
```

### Configuration Options

| Field | Type | Description |
| --- | --- | --- |
| data | GraphStructure | The data lineage component accepts data of type GraphStructure. The structure is slightly different for table view and column view (mode = 'table' \|\| mode = 'column'). In table view, node data corresponds to `nodes` and relationships to `edges`, without the need to specify `groups`. Grouping is implemented internally by `getGroupData`. In column view, field data corresponds to `nodes`, relationships to `edges`, and table data to `groups`, with each table containing several fields. |
| baseTableId | string | The id of the main node. In table mode, this is the node id. In column mode, this should be the id of the corresponding group. |
| mode | 'table' \| 'column' | Table view \| Column view |
| size | number[] | The size of the graph container, `size:[800, 600]` means the container is 800px wide and 600px high. |
| minDepth | number | The lineage level, upstream is negative. -1 represents one level upstream. Required for table view. Used to ensure the number of columns remains unchanged before and after filtering. |
| maxDepth | number | The lineage level, downstream is positive. 1 represents one level downstream. Required for table view. Used to ensure the number of columns remains unchanged before and after filtering. |
| options | IOptions | Personalized customization options. |


The personalized customization options included in `IOptions` are as follows:





| Field | Type | Description |
| --- | --- | --- |
| tableHeight | number | The height of the node, with three levels: 60px, 40px, 32px, corresponding to table view with more attributes, regular table view, and regular column view. |
| groupGap | number | The gap width between each layer, default is 50. |
| getGroupWidth | (depth: number, count: number) => number | Get the layer width. 304 for table view, 240 for column view. |
| activeColumn | string[] | [Column View] The currently checked fields of the main table. |
| getGroupData | (data: tableData) => string; | [Table View] The grouping method. Given each node's data, returns the grouping value. |
| filter | { type: string; value: string[];} | [Table View] Filter based on the given filter type and value. |
| minDepth | number | The minimum level limit, upstream is negative. |
| maxDepth | number | The maximum level limit, downstream is positive. |
| getEdgeStyles | (sourceId: string, targetId: string) => object | The style of the edge in its default state. Default is: { strokeStyle: '#D1D5DA',lineWidth: 1,hitWidth: 6, }. |
| getEdgeHighlightStyles | (*sourceId*: *string*, *targetId*: *string*) *=>* object; | The style of the edge in its highlighted state, which will be merged with the default state style. Default is: { strokeStyle: '#3073F2'}. |
| getGroupTitle | (groupData: any) => ReactNode | [Table View] Get the display content of the group title for each level. |
| getGroupContent | (groupData: any) => ReactNode | [Column View] Get the display content of the table header. |
| getGroupName | (groupData: any) => string | Get the group name, and render the group title with the default style. |
| getTableContent | (tableData, group: any) => ReactNode \| string | Get the node content. |
| getEmptyContent | (group: any) => ReactNode \| string | Get the content to display for an empty column. Default is null, no display. |
| getTaskTooltipContent | (edgeData.taskEntity[]) => string \| ReactNode | Get the tooltip content for an edge. Requires the `taskEntity` field in the edge data to correspond to the task data. |
| onClickTable | (tableData) => void | The click event for a node. |
| onClickEdge | (edgeData) => void | The click event for an edge. |
| highlightEdge | boolean | Whether to enable edge hover and tooltip display interaction. |
| highlightMode | "MAIN" \| "ALL" | The highlight mode after clicking a node. Default is "MAIN", which only highlights upstream or downstream. Set to "ALL" to highlight both upstream and downstream. |
| search | (nodeData: any) => boolean | Define how to accurately search for a node. If no matching node is found, the `onEmptySearch` method will be called. |
| onEmptySearch | () => void | Called when the search result is empty. |
