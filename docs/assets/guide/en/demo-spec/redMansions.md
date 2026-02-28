# Relationship Graph

Relational graph data is a more generalized network data. Unlike the topological sorting characteristics of DAGs, the content expressed by relational graphs is more free and complex. It exists in all aspects of life and naturally reflects the real world, such as biological gene networks, social friend networks, etc.

## Demo - Knowledge Graph

### Data Interpretation

A knowledge graph is a structured semantic knowledge base used to describe the concepts of various things and their interrelationships. The demo selects the knowledge graph data of the character relationships in "Dream of the Red Chamber". This data includes the names of the main characters, their families, and the types of relationships between the characters, such as father, sister, etc.

### Scene Encoding

**Layout:** Force-directed layout.

**Elements:** Each node in the graph represents a character in "Dream of the Red Chamber", and the color of the node represents the family the character comes from; the directed edge between the nodes represents the relationship between the characters, and the text on the directed edge indicates the specific relationship type. For example, the arrow line from Grandma Jia to Lin Daiyu is marked with "maternal granddaughter", which means that Grandma Jia's maternal granddaughter is Lin Daiyu.
 
**Interaction:** 

1. pan + zoom canvas: zoom in on the canvas to display the specific character names on the nodes
2. hover node: highlight the adjacent nodes of the node, showing all the characters related to the character. When the canvas is zoomed in beyond a certain ratio, the specific relationship type is displayed in detail.
3. click legend: filter a certain family's character group, focusing on understanding the character relationships of that family

**Components:**

1. Legend: explains the corresponding character family represented by the node color

### Design Thinking

* In a knowledge graph, the relationships between nodes and edges are complex and have specific semantics. When the canvas zoom ratio is small, there are a lot of occlusions in the graph, which makes the information unreadable. In order to solve this problem, the relationship graph in the demo uses the method of zooming in to display details. At the beginning of the relationship graph, you can read the entire knowledge graph at a glance. When you need to understand the detailed information, you can view the details on demand through the interaction of zooming in on the canvas. In the process of zooming in to display details, we keep the size of the text and arrows unchanged, but the size of the nodes and the distance between the nodes are constantly expanding. Combined with the reverse color stroke of the text, the readability of the information is significantly enhanced.
* In scenarios where the scale of graph information is large and the complexity is high, you can use a combination of overview to display the structure and local presentation to display information; first, determine whether to present an overview or details in the initial state according to the needs and goals, and then provide corresponding interactive operations of zooming in to display details or zooming out to hide details, which can effectively help users obtain information.
* The relationships between characters in a knowledge graph are mutual. For example, Grandma Jia is Lin Daiyu's maternal grandmother, and Lin Daiyu is also Grandma Jia's maternal granddaughter. This means there is a two-way relationship between the nodes. In order to avoid the overlap of edges, the demo uses the quadratic connection line type; the configuration of the curve can be used when the connection line has no actual physical meaning, and the situation of the connection line path between nodes coinciding needs to be solved.
