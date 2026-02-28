# Relationship Graph

Relational graph data is a more generalized network data. Unlike the topological sorting characteristics of DAGs, the content expressed by relational graphs is more free and complex. It exists in all aspects of life and naturally reflects the real world, such as biological gene networks, social friend networks, etc.

## Demo - Social Relationships

### Data Interpretation

Social relationships are the interactions between people. Two people may know each other or not, they may be very close, or they may just be acquaintances. There is a complex network of relationships here. The demo selects the character relationship data from the book "Les Misérables", which provides data such as character names, categories, and the number of contacts between them.

### Scene Encoding

**Layout:** Force-directed layout.

**Elements:** Each node in the graph represents a character in the book "Les Misérables", and the node color maps to the character's category; the connection between nodes represents the existence of a social connection between the two, and the width of the edge represents the depth of the connection; the wider the edge, the higher the intimacy between the two characters connected by the edge.
 
**Interaction:** 

1. hover node: display the name of the character represented by the node
2. click node: highlight the adjacent nodes of the node, showing all the people the character knows
3. drag node: drag the node to change its position, allowing users to adjust the social relationship network layout
4. click legend: filter a certain category of character groups, focusing on observing the social connections within the group
5. click canvas: clear the view interaction, restore the initial state, allowing users to re-explore the social network data
6. Toolbar:
   1. Find the shortest path between nodes (shortcut: shift + click): select two nodes, highlight the shortest path between them, to help explore the potential social relationship between these two characters
   2. Friend filter icon (shortcut: alt + click): select a node, highlight the nodes whose connection width with the selected node exceeds a certain value, to help find the character's friend relationship

**Components:**

1. Tooltip: Used with the 'hover node' interaction to present the node content
2. Toolbar: Contains the interaction icons for 'find node path' and 'friend filter'
3. Legend: Explains the corresponding character category represented by the node color

### Design Thinking

* In a force-directed layout, each particle has a repulsive force, and each connected particle has an attractive force. It constantly evolves from an initial random and disordered layout and gradually tends to a balanced and stable state; it is often used to describe the relationship between things and is one of the classic ways of undirected graph layout.
* The connection in the social relationship graph represents the connection between characters, so the value representing the weight of the connection is mapped to the width of the line, symbolizing the precarious or indestructible social connection. The combination of the two complements each other and promotes the user's perception.
* In the interaction of finding the connected path between nodes, only the shortest path between nodes is matched for the user, which is also related to the interaction goal. When two people are introduced to each other by others, the fewer intermediaries, the greater the probability that this method will be adopted. Therefore, when implementing specific interactions, the effectiveness of the solution combined with the task purpose is stronger.
