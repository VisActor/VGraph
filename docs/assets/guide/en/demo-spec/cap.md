# Tree Chart

A tree chart is a special form of a node-link diagram, usually used to display hierarchical data, emphasizing the hierarchical relationship between individuals. Among them, the hierarchical relationship is mainly manifested in two categories: inclusion and subordination.

## Demo - Mind Map

### Data Interpretation

A mind map is a diagram that organizes information graphically; the overall layout starts from the central keyword and radiates outwards to connect all related words, ideas, tasks, etc. The mind map demo selects the data of the relationship between the Six Thinking Hats and product planning. This data simplifies the thinking characteristics of the Six Thinking Hats and defines and sorts them from the perspective of product planning.

### Scene Encoding

**Layout:** Mind map layout.

**Elements:** Each node in the graph represents a keyword, and the connection between nodes represents the association between the two; in the demo, starting from the central keyword "Six Thinking Hats", the corresponding keywords are associated to the left and right sides in turn.
 
**Interaction:** 

1. hover node: highlights the start and end paths of the node, showing the entire association link where the current keyword is located, expanding from the start node to the current keyword, and then radiating outwards from the current keyword to the outer leaf nodes.
2. click the node's collapse/expand icon: collapse/expand the node to organize the overall thinking structure for easy observation
3. drag a first-level node: drag the node to change the sorting position of the current node, which is used to help adjust the relationship between the Six Thinking Hats and the product design process

### Design Thinking

* Each keyword node in the mind map has a corresponding meaning, and there may be some connection between the nodes of each level; we can select the style and color for the nodes according to this information, so as to enhance readability. For example, the keywords of the Six Thinking Hats are related to color, and the demo gives the corresponding color to the subclass nodes corresponding to each thinking hat; and in order to distinguish the hierarchical structure, the graph selects different node styles for each level of nodes, intuitively showing the meaning represented by the nodes of each level and all keyword nodes.
* When the icon of the node may overlap with the connection line, some visual errors may occur. At this time, it is recommended to configure a background for the icon to distinguish the two.
