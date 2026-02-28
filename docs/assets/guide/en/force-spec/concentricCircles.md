# Custom Layout Usage
You can achieve a custom layout effect by configuring the x and y properties of the nodes. After executing the custom layout function, you can update and draw the graph's position information by calling `graph.refresh()`. Generally, it can be used as follows:
```javascript
graph.data(data);
customLayout(data); // If configuring the original data, just configure x and y for the nodes in the original data.
// customLayout(graph); // If getting data through graph.getNodes(), you can also directly operate on the graph nodes by using node.set('x',xxx) and node.set('y',xxx).
graph.refresh();
```
This demo implements a custom layout method of concentric circles, which can evenly distribute nodes on the rings.
