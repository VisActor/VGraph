# Smart Layout Relationship Graph

## Scene Introduction
A force-directed layout is a general display form for a broad category of graphs. In a force-directed graph, nodes connected by lines represent the relationship between two entities. Force-directed graphs are often used to display relationship networks.

In real business scenarios, it is often necessary to display multiple types of nodes, and even multiple types of lines. In this scenario, users often focus on two levels of information:
- Overall view: looking at the distribution of data, which nodes are more closely related, which node has the greatest influence, etc.
- Individual view: after looking at the overall structure, users often locate nodes of interest for further analysis. At this time, they need to look at the detailed data and direct connections of the individual.


## Design Thinking
In this scenario, the scale of the data cannot be predicted in advance. It may be sparse data or very dense data. In the case of sparse data, the interface is simple and the relationship between nodes is clear, so a full display is used, with relationships highlighted on hover. However, if it is dense data of tens of thousands, it is easy to have too many lines in some areas, making it difficult to see the overall distribution of nodes and causing the display to be unsmooth. Therefore, we hide the lines by default. When the user locates an individual, clicking on the node will highlight the directly related nodes and lines. In addition, in this scenario, how to clearly locate a node is also a problem. Research shows that after locating a node, users usually look at the details and direct connections of the node. If it is not clear at a very small zoom ratio, and if the user is asked to zoom in after positioning, it is difficult to ensure that the focus is not lost. Therefore, when positioning, we have added zoom and pan animations, moving the node to the center of the viewport, and then adding an animation to this node to highlight it, which is convenient for identification and subsequent operations.

## Scene Encoding
**Layout**: In this scenario, the scale and characteristics of the relationship network cannot be determined in advance. Because the distribution effect of the graph depends entirely on the configuration parameters, the force-directed layout has a certain threshold for use. And when the data set characteristics are different, even a set of configuration parameters cannot guarantee a good layout effect. Therefore, xGraph has developed an [automatic configuration force function](/docs/2.x/layout-spec_force#automatic-configuration-force-function) based on data sets of various scales and characteristics.

<br/>


**Elements**: Using the color of the graphics to distinguish different types of data is a commonly used mapping method, but what color to use is a big question. The color matching needs to have a certain degree of discrimination, be beautiful, and the saturation should not be too high to avoid eye fatigue after long-term use. The saturation should not be too low, which will make it difficult to see on low-resolution displays. xGraph has carefully created the following color palette, and the effect has been tested by the business for a long time.
<p style="text-align:center;"><img src="/images/docs/guide/palette.png" width="600"></p>

In many business scenarios, lines also have classifications. To display the classification of lines, it is easy to think of configuring text labels on the lines. This method is used a lot in DAG graphs, but not in force-directed graphs. The reason is that force-directed graphs may have some areas with dense lines, and text labels are basically unreadable. In addition, the distance between nodes in the force-directed graph scene is not fixed, so the length of the text and the line may not match, and the aesthetics are not good enough. Research shows that although users sometimes look at the classification of lines, they mainly look at the nodes, and should not steal the show. Therefore, in this scene, color is also used to display the classification of lines, and text labels are displayed on the lines when highlighting relationships. Considering the variety of node colors, a gray gradient is used to display the line colors.
<p style="text-align:center;"><img src="/images/docs/guide/gradient_palette.png" width="450"></p>
Since the color classification of lines is relatively small, starting from the lightest color will make the default view too light and not convenient for further analysis. Therefore, a light and dark interval method is used for the final presentation.
<p style="text-align:center;"><img src="/images/docs/guide/final_palette.png" width="450"></p>

<br/>

**Interaction**:
- click to switch data: switch the data displayed in the graph, you can experience the performance under different orders of magnitude of data.
- click to hide/show lines: hide/show the lines in the graph.
- click to locate node: locate the node with the id of the input box value, focus animation.
- click node: highlight the relationship when the data volume is large.
- hover node: highlight the relationship when the data volume is small.
