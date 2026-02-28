# Tree Chart

A tree chart is a special form of a node-link diagram, usually used to display hierarchical data, emphasizing the hierarchical relationship between individuals. Among them, the hierarchical relationship is mainly manifested in two categories: inclusion and subordination.

## Demo - File Architecture

### Data Interpretation

The files and directories in a computer file system are a typical hierarchical structure, used to help people organize and recognize information. The file architecture demo selects the file architecture of the Flare visualization tool library as the data source, which describes the subordinate relationship between various folders and files in the tool library.

### Scene Encoding

**Layout:** Radial ecotree layout.

**Elements:** Each node in the graph represents a folder or a specific file under the file directory, and the connection between the nodes represents the hierarchical relationship between the two; the starting point of the entire tree graph is located in the center of the view, and other nodes extend outwards in turn. The inner layer nodes contain the connected outer layer nodes, and the outermost leaf nodes represent specific files.
 
**Interaction:** 

1. pan + zoom canvas: view navigation, easy to browse and observe the overall structure
2. hover node: highlights the start and end paths of the node; by tracing back the root of the folder/file and tracking its subsequent content, the position of the folder/file in the entire directory is presented.
3. click node: collapse/expand the node to organize the overall file architecture for easy observation
4. drag node: drag the node to other nodes to change the hierarchical structure, helping to adjust and plan the entire file directory architecture

### Design Thinking

* The radial tree layout can overcome the problem of wasted space. The root node is located at the center of the circle, and nodes of different levels are placed on concentric circles with different radii. The larger the outer concentric circle, the more nodes it can accommodate. The entire layout presents a circular shape, which makes reasonable use of space.
* In the file architecture data, the outermost leaf nodes are the code files that carry the actual content, and they all have direct and substantial meaning; therefore, the demo as a whole uses the layout of an ecotree, uniformly distributing this group of files with substantial meaning on the outermost concentric circle, so as to strengthen the correlation between them and facilitate user identification.
