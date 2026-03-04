# Data Lineage Scenario Solution

## Scenario Introduction
The data processing flow generally starts from RDS and MQ, goes through multiple and various calculations and storage, and finally flows into indicators, reports, and data service systems. Data lineage describes the source and destination of data, as well as the transformation of data in multiple processing processes. It can help users better understand the table, so as to make full use of the data. For component usage documentation, please see [Data Lineage Documentation](/vgraph/guide/analysis-solution-spec/dataLineage).
The main scenarios of data lineage are:


| Scenario | User Focus | Scenario Description |
| --- | --- | --- |
| Impact Analysis | Downstream | Before a table producer makes a change, they need to know which downstream tables, fields, and indicators will be affected. |
| Finding and Understanding Data | Upstream | Starting from a business process, understand the processing logic of the fields in the table, and find data that fits your own business. Find tables or fields with the same caliber, and judge whether they are redundant tables that can be taken offline. |
| Link Combing | Link | View the point-to-point relationship link, which is mostly used for internal audit and data governance. |
| Attribution Analysis | Upstream | When there is a problem with the data/output time of a certain indicator or field, by viewing the upstream tasks or assets of the lineage, the root cause of the problem can be investigated. |
| Usage Analysis | Downstream | The more downstream tables a table has, the more frequently it is used, and the greater its value can be considered. |

## Scene Encoding

**Elements**: Since the visual styles of different products are different, and the node content varies greatly. Therefore, the component supports customizing nodes with React components. For details, please see the `getTableContent` configuration item.


**Interaction**:
- click node: In the data lineage scenario, it is difficult to see the link relationship between nodes in the default view due to the large amount of data. The component defaults to adding a click node to highlight all paths from the node to the main node. This allows users to see the link relationship of any node on one screen by scrolling and positioning.
- hover connection line: In the data lineage scenario, the connection line not only represents the dependency relationship between the two, but also a good carrier for the processing logic relationship between tables. Therefore, the component supports customizing the tooltip content of the hover connection line. For details, please see the configuration item `getTaskTooltipContent`.
- click filter: Filter according to the attributes that users are concerned about, to help users better focus on the problem.
- click group: Group according to the attributes that users are concerned about, to make the structure more organized and clearer.

## Design Thinking
In the process of use, what users value is the **efficiency of viewing relationships** and the **completeness of attributes**. Therefore, when designing optimization solutions, we will try to consider these two points. Due to the large number of tables to be displayed and the complex dependency relationships, it is necessary to support **tens of thousands of data and relationship displays**, and at the same time, to clearly **display all data and dependency relationships**. A normal DAG graph layout cannot do this. At this time, we need a more compact and clear data presentation method.

And when it comes to compact layout methods, we naturally think of lists. If we can use a list to carry the nodes of the hierarchical lineage, and use lines to connect the nodes of different levels to express the lineage relationship between the nodes. When there are too many nodes to fit on one screen, you can drag the scroll bar of this column to view more nodes, and the lines will be refreshed accordingly. When the level is less than one screen, it is displayed centered as a whole. When there are too many levels to fit on one screen, you can slide left and right to view. In this way, while retaining the hierarchical structure information, the visible area is used to the greatest extent, and as much data as possible is displayed.
If you can have a certain understanding of the overall distribution while viewing the local, it can improve the user's use efficiency. Therefore, we have also added level information and node statistics at the top of each column list, and there will be corresponding statistical information updates when filtering.

