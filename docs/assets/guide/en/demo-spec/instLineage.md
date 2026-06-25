# Instance Lineage - Common Mode

## Scenario Introduction
The data processing flow generally starts from RDS and MQ, goes through multiple and various calculations and storage, and finally flows into indicators, reports, and data service systems. Task instance lineage describes the interrelationships between data processing task instances. In summary, there are three application scenarios for task instance lineage graphs:
- Relationship display: Centered on the node that the user is concerned about, view the upstream and downstream dependencies of the node.
- Upstream analysis: When a node runs abnormally, trace the problem upwards, focusing on the **relationship link**.
- Downstream analysis: Analyze the downstream impact surface of the node, at which time the focus is on **statistical data**.

The common mode corresponds to the first scenario in the figure. Users can freely expand the dependent tasks upwards and downwards to better understand the focused nodes. For documentation, please see [Instance Lineage Documentation](/graphs/2.x/solutions_commonInst).


## Design Thinking
Since there are generally many instances of a task (for example, a task scheduled for one hour can generate 24 task instances in one day. A single task instance may have tens of thousands of direct upstream nodes), if a single layer is spread out, the image will be very large, and it will be difficult to perform more operations if the focus is lost. We need a more focused way to display the relationship between nodes to help users understand and analyze.
In the common mode, the nodes are displayed in layers. In order to better analyze the continuity, the relative position of the current operation node is fixed when expanding/collapsing the upstream/downstream of the node to ensure that the focus position does not change after the view is refreshed. Users in this scenario are very concerned about the running status of the instance nodes. Therefore, when the number of direct upstream/downstream nodes of a node exceeds 10, all detailed nodes will be collapsed and a statistical node will be displayed (the maximum number of detailed nodes displayed can be configured). The statistical node will display the status and quantity of the nodes, and users can directly click the quantity to quickly expand the nodes to continue exploring. In order to make the relationship display more focused, this solution supports collapsing a single node and collapsing all upstream/downstream, making the entire graph visually simpler.

## Scene Encoding
**Layout**: Adopts the [DAGLayout](/vgraph/guide/layout-spec/dag) layout, and the custom ranker ensures that the aggregation nodes and task nodes are on the same layer, making the direct dependencies of a node clearer. DAGLayout optimizes the minimum cross-linking of dependencies between nodes at the same level. Even if there are many dependencies between nodes at the same level, the display is relatively clear.

<br/>


**Elements**: Due to the different visual styles of different products, the solution exports the registration logic of the default business node `registerInstanceNode` and the interactive logic corresponding to this node `setInstanceNodeStateStyles`. Users can directly reference it, or expand on this basis to form nodes that conform to their own business products. In the default solution, color + icon are used to highlight the status of the nodes, improving the efficiency of users' graph analysis.

<br/>





**Interaction**:
- click node: select a node, generally used with a sidebar, which can display the detailed information of the current node and perform more operations on the node
- hover over a node and click to expand: expand the direct upstream/downstream of a node.
- hover over a node and click to collapse: collapse the direct upstream/downstream of a node.
- click the type statistics number of the cluster node: quickly expand the nodes of the corresponding category.
- hover over a connection line and click to collapse: collapse a single upstream/downstream of a node.


