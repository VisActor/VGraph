# Instance Lineage - Statistics Mode

## Scenario Introduction
The data processing flow generally starts from RDS and MQ, goes through multiple and various calculations and storage, and finally flows into indicators, reports, and data service systems. Task instance lineage describes the interrelationships between data processing task instances. In summary, there are three application scenarios for task instance lineage graphs:
- Relationship display: Centered on the node that the user is concerned about, view the upstream and downstream dependencies of the node.
- Upstream analysis: When a node runs abnormally, trace the problem upwards, focusing on the **relationship link**.
- Downstream analysis: Analyze the downstream impact surface of the node, at which time the focus is on **statistical data**.

The statistical mode corresponds to the third scenario. When a user needs to change the task logic, they need downstream statistical information to analyze the impact surface and synchronize the changes to the downstream task owner. For documentation, please see [Instance Lineage Documentation](/graphs/2.x/solutions_commonInst).


## Design Thinking
When doing impact analysis, users are often not concerned with individual detailed node data, but rather need statistical data. Since there are generally many instances of a task (for example, a task scheduled for one hour can generate 24 task instances in one day. A single task instance may have tens of thousands of direct upstream nodes), it is definitely not appropriate to count them one by one if they are spread out. The original intention of this solution to design a statistical mode is to display statistical data in a clearer and more efficient way. Users can directly expand multi-level task downstream, and directly view a total statistical node according to their own needs, or display multiple statistical nodes by level. The statistical node can use `getGroupData` to group and display according to the required data dimension. And you can click the quantity to quickly view the node details of the data of this dimension at the current level.

## Scene Encoding
**Layout**: Adopts a vertical layout, with each layer of nodes centered and aligned, maximizing the use of the current viewport space while making the statistical information clear at a glance.

<br/>


**Elements**: In the statistical mode solution, the main node can also be customized. The registration logic for the default business instance node is `registerInstanceNode` and the interactive logic corresponding to this node is `setInstanceNodeStateStyles`. Users can directly reference it, or expand on this basis to form nodes that conform to their own business products. The form of a single statistical node is relatively fixed, so the current node is directly built-in. Users can also customize it through `setNodeStyles`.

<br/>





**Interaction**:
- click node statistics number: display the details of the group node.
- click group to view details: display all the node information collapsed by the statistical node.
