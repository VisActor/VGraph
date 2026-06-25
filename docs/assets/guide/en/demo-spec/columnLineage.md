# Data Lineage - Table View

## Scene Introduction
The data processing flow generally starts from RDS and MQ, goes through multiple and various calculations and storage, and finally flows into indicators, reports, and data service systems. Data lineage describes the source and destination of data, as well as the transformation of data in multiple processing processes. It can help users better understand the table, so as to make full use of the data. When users focus on a certain field or want to modify a certain field, if they can only view the lineage relationship related to this field, it can improve the efficiency of use and optimize the experience. For documentation, please see [Data Lineage Documentation](/vgraph/guide/analysis-solution-spec/dataLineage).


## Scene Encoding
**Layout**: The layout of the table view is followed. For design thinking, please refer to the table view demo usage document.


**Elements**: Since the visual styles of different products are different, and the node content varies greatly. Therefore, the component supports customizing nodes with React components. For details, please see the `getTableContent` configuration item. In the column view, not only the field data should be displayed, but also the table data to which the field belongs. The component also supports customizing the group header style with React components. For details, please see the `getGroupContent` configuration item. 

**Interaction**:
1. click field: In the data lineage scenario, it is difficult to see the link relationship between nodes in the default view due to the large amount of data. The component defaults to adding a click node to highlight all paths from the field to the main node. This allows users to see the link relationship of any node on one screen by scrolling and positioning.
2. hover connection line: In the data lineage scenario, the connection line not only represents the dependency relationship between the two, but also a good carrier for the processing logic relationship between fields. Therefore, the component supports customizing the tooltip content of the hover connection line. For details, please see the configuration item `getTaskTooltipContent`.

## Design Thinking
If it is already very difficult to support the table lineage relationship of tens of thousands of data, the data volume of the full column view corresponding to these tens of thousands of data is hundreds of thousands. If all the data is displayed at once, it will add a lot of useless field data to interfere with the user. Therefore, when using the column view, it is recommended to display the lineage of one field by default. It is a clearer and more intuitive display method to let users choose the field lineage they are concerned about through the Toolbar or the interaction of the nodes in the graph. The column view of the Coral lineage graph adopts this method. First, you can select the main node field on the Toolbar, or you can hover over the main node field to check the fields you are interested in.
