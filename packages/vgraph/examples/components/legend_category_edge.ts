import {
  dragCanvas,
  dragNode,
  Graph,
  panZoom,
  DAGLayout,
  CategoryLegend,
  CategoryLegendDataItem,
} from "../../src";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);
  const legendDiv = document.createElement("div");
  legendDiv.style.position = "absolute";
  legendDiv.style.right = "10px";
  legendDiv.style.top = "10px";
  legendDiv.style.border = "1px solid #666";
  document.body.append(legendDiv);

  const data = {
    nodes: [
      {
        id: "1",
        legendType: "type1",
      },
      {
        id: "2",
        legendType: "type2",
      },
      {
        id: "3",
        legendType: "type1",
      },
      {
        id: "4",
        legendType: "type3",
      },
    ],
    edges: [
      {
        source: "1",
        target: "2",
        cost: "edge-type1",
      },
      {
        source: "1",
        target: "4",
        cost: "edge-type3",
      },
      {
        source: "3",
        target: "4",
        cost: "edge-type2",
      },
      {
        source: "2",
        target: "4",
        cost: "edge-type1",
      },
    ],
  };

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: true,
    setDefaultNode(node) {
      return {
        type: "circle",
        width: 15,
        height: 15,
        strokeStyle: null,
        fillStyle: "#4c72b0",
      };
    },
    setDefaultEdge(edgeData) {
      let type = "line";
      let strokeStyle = "#F6BD16";
      if (edgeData.cost === "edge-type2") {
        type = "cubic";
        strokeStyle = "#64D5CD";
      } else if (edgeData.cost === "edge-type3") {
        type = "quadratic";
        strokeStyle = "#6F5EF9";
      }
      return {
        type,
        strokeStyle,
        lineWidth: 1,
        endArrow: true,
      };
    },
  });
  graph.data(data);
  new DAGLayout({
    graph,
    rankDir: "TB",
    ranker: "bfs",
  });
  graph.refresh();
  graph.fitView();

  graph.addBehavior(panZoom);
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  (window as any)._graph = graph;

  const legendData: CategoryLegendDataItem[] = [
    {
      marker: {
        type: "line",
        strokeStyle: "#F6BD16",
      },
      label: "edge-type1",
      value: "edge-type1",
    },
    {
      marker: {
        type: "cubic",
        strokeStyle: "#64D5CD",
      },
      label: "edge-type2",
      value: "edge-type2",
    },
    {
      marker: {
        type: "quadratic",
        strokeStyle: "#6F5EF9",
      },
      label: "edge-type3",
      value: "edge-type3",
    },
  ];

  new CategoryLegend(graph, {
    legendData,
    container: legendDiv,
    encodeAttr: "cost",
    target: "edge",
    // encodeStyles(edgeData) {
    //   return {
    //     marker: {
    //       type: edgeData.type,
    //       strokeStyle: edgeData.strokeStyle
    //     },
    //     label: edgeData.value,
    //   };
    // },
    width: 400,
    height: 50,
    orient: "horizontal",
    click: {
      enable: true,
    },
  });
})();
