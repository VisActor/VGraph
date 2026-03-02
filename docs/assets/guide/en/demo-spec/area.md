# Tree Chart

A tree chart is a special form of a node-link diagram, usually used to display hierarchical data, emphasizing the hierarchical relationship between individuals. Among them, the hierarchical relationship is mainly manifested in two categories: inclusion and subordination.

## Demo - Administrative Divisions

### Data Interpretation


Geographical division is also a kind of hierarchical data, such as the earth including seven continents, and each continent containing several countries. The data in the administrative division demo selects the data of the three-level administrative divisions of provinces, cities, and counties in China.

### Scene Encoding

**Layout:** Compact tree layout.

**Elements:** Each node in the graph represents an administrative region, and the connection between nodes represents the hierarchical relationship between the two; specifically, the horizontal extension of the entire view from left to right is the inclusion relationship between administrative divisions. The administrative region on the left of the connection line contains the administrative region on the right of the connection line.
 
**Interaction:** 

1. pan + zoom canvas: view navigation, easy to browse and observe data
2. hover leaf node: highlight the starting path of the node, trace back the subordinate relationship of the administrative region
3. click node: expand/collapse the node, view the overall administrative division data on demand

### Design Thinking

* Due to the limitation of screen size, large-scale hierarchical structure data cannot effectively present all information regardless of the layout method. The "focus + context" technology is a solution that focuses on presenting the data that users care about, while briefly expressing the context information. For example, the demo initially only displays the data of the first-level administrative divisions. Users can expand the subtrees that need to be explored by clicking, thereby improving the utilization efficiency of the overall space and effectively presenting information.
* Although the compact tree layout can display more nodes in a limited space, it is difficult to see the attribution of a certain child node when all child nodes are expanded. Therefore, the expanded subtrees are uniformly identified with a special color, so that you can see which province a certain town belongs to according to the color. When expanded to the county level, it may still be difficult to see the attribution of the city. Hovering over the node to highlight the start and end paths can help to see this detail.
* In the administrative division data, a large number of administrative regions are divided under each level of administrative region; in order to avoid the user's tedious statistical steps, the number of child nodes currently owned by the current node is attached after all non-leaf nodes, so as to help users grasp the overall administrative division structure.
