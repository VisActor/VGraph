# Relationship Graph

Relational graph data is a more generalized network data. Unlike the topological sorting characteristics of DAGs, the content expressed by relational graphs is more free and complex. It exists in all aspects of life and naturally reflects the real world, such as biological gene networks, social friend networks, etc.

## Demo - Traffic Network

### Data Interpretation

The combination of traffic nodes and road characteristics forms a traffic network. The demo selects the traffic data of Sioux-Falls, which includes the latitude and longitude coordinates of each intersection and information such as the length, traffic volume, and capacity of the roads.

### Scene Encoding

**Layout:** Mapping of latitude and longitude coordinates of traffic intersections.

**Elements:** Each node in the graph is a traffic intersection, and the directed edges between the nodes represent the connecting roads between the intersections. The traffic on the roads is one-way, the direction of the arrow indicates the direction of traffic, the length of the edge represents the distance between the two intersections, and the color depth of the edge represents the scale of the current actual traffic volume.
 
**Interaction:** 

1. hover edge: Length represents the length of the road, and Cost represents the time required for passage.
2. click canvas: clear the view interaction, restore the initial state, allowing users to re-explore the traffic network.
3. Toolbar:
   1. Shortest time icon (shortcut: shift + click): select two intersections, highlight the path with the shortest passage time between them, and unlock the solution with the least time consumption.
   2. Shortest distance icon (shortcut: alt + click): select two intersections, highlight the path with the shortest distance between them, and unlock the solution with the shortest distance.

**Components:**

1. Tooltip: Used with the `hover edge` interaction to present the content of the edge.
2. Toolbar: Contains the interaction icons for 'shortest time' and 'shortest distance'.

### Design Thinking

* Traffic data generally contains the geographical coordinate information of the corresponding nodes, which can be used for spatial layout; a layout scheme consistent with real spatial coordinates can reduce the user's cognitive burden.
* In road traffic, left and right lanes are generally divided for round trips, and round-trip lanes have different traffic information. In order to avoid the occlusion of road connection lines and the misunderstanding of road traffic routes caused by curve connections, the demo specifies the connection access and output positions for each intersection, so as to ensure the separation of routes.


