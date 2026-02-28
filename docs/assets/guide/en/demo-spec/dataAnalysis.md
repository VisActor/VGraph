# DAG Chart

A DAG (Directed Acyclic Graph) is a directed graph with no directed cycles. In graph theory, if there is no path starting from any vertex that follows a sequence of edges and returns to the same vertex, then the graph is a directed acyclic graph.

## Demo - Grouped Directed Graph

### Data Interpretation

The grouped directed graph selects data from a data analysis process. In this data, the data analysis process is divided into four major stages, and each stage has different steps to implement.

### Scene Encoding

**Layout:** Fixed data layout.

**Elements:** The nodes in the graph are contained in four groups, representing the four stages of data analysis; each node represents a step in the data analysis process, and the directed edges between the nodes represent the connection between each step; the in-degree of a node is the input of the analysis step, and the out-degree is the output after completing the analysis step; nodes with only out-degrees are the initial goals of the data analysis, and nodes with only in-degrees are the results obtained after data analysis.
 
**Interaction:** 

1. hover group: highlight the group and its internal elements to help identify the content of the group, representing the steps that need to be completed in this stage of data analysis
2. hover edge: highlight the in-degree and out-degree nodes connected by the edge, representing the analysis steps connected by the edge, and showing the context relationship
3. hover node: highlight the start and end paths of the node in the group, showing the position of the node in this group stage, and representing the context relationship of the data analysis steps

### Design Thinking

* In grouped data, different inter-group node connection behaviors can be matched according to the specific meaning of the node data: group-to-group connection / inter-group node-to-node connection. In this scenario, each step node of the data analysis has a corresponding context node relationship, so the connection relationship between inter-group nodes is selected.
* In this scenario, the data provides a fixed horizontal and vertical grid layout for the grouped nodes. In order to avoid the diagonal relationship between the node connections destroying the existing layout, the graph selects the horizontal / vertical turning lines of hLine / vLine to match the grouped node layout, so as to improve the visual coordination.
