# DAG Chart

A DAG (Directed Acyclic Graph) is a directed graph with no directed cycles. In graph theory, if there is no path starting from any vertex that follows a sequence of edges and returns to the same vertex, then the graph is a directed acyclic graph.

## Demo - Basic Directed Graph

### Data Interpretation

The basic directed graph selects data on the flow of company funds, showing the operating process of things.

### Scene Encoding

**Layout:** Hierarchical layout based on DAGLayout.

**Elements:** Each node in the graph represents a sum of money in the company, and the directed edges between the nodes represent the flow relationship between each sum of money in the company; the in-degree represents the inflow of funds, and the out-degree represents the outflow of funds; nodes with only out-degrees represent the initial funds of the company, and nodes with only in-degrees represent the final destination of the company's funds.
 
**Interaction:** 

1. hover node: highlights the start and end paths of the node, representing the entire process of the fund from its initial inflow into the company to its final output.

### Design Thinking

* The DAGLayout is similar to the tree layout but different. A tree layout only allows each node to have one source node, but in a directed acyclic graph, a node can have multiple source nodes. Therefore, any directed tree graph is a directed acyclic graph, but a directed acyclic graph is not necessarily a directed tree graph.
* Due to its strict topological properties, the Darge layout has a strong ability to express processes and is widely used in scenarios with sequential restrictions.
