import { Graph } from "../../../src/graph";
import { CategoryLegend as Legend } from "../../../src/components/legend/category";
import { CategoryLegendDataItem } from "../../../src/components/legend/type";
import miserablesData from "../../../examples/static/miserables.json";

describe("src/legend", () => {
  const graphDiv = document.createElement("div");
  const legendDiv = document.createElement("div");
  document.body.append(graphDiv);

  const colors = [
    "#4c72b0",
    "#dd8452",
    "#55a868",
    "#c44e52",
    "#8172b3",
    "#937860",
    "#da8bc3",
    "#8c8c8c",
    "#ccb974",
    "#64b5cd",
    "#17becf",
  ];

  it("should work with node shapes", () => {
    const data = {
      nodes: [
        {
          id: "0",
          cost: 0,
        },
        {
          id: "1",
          cost: 1,
        },
        {
          id: "2",
          cost: 2,
        },
        {
          id: "3",
          cost: 3,
        },
        {
          id: "4",
          cost: 4,
        },
      ],
      edges: [],
    };
    const customNodeLegendData: CategoryLegendDataItem[] = [
      {
        marker: {
          type: "rect",
        },
        value: 1,
      },
      {
        marker: {
          type: "circle",
        },
        value: 0,
      },
      {
        marker: {
          type: "icon",
          icon: "&#xe68c;",
        },
        value: 2,
      },
      {
        marker: {
          type: "image",
          url: "https://lf-dp.bytetos.com/obj/dp-open-internet-cn/visactor-site/bytedance/client/img/visactor/navigator-logo.svg",
        },
        value: 3,
      },
      {
        marker: {
          width: 50,
        },
        value: 4,
      },
    ];

    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      minRatio: 0.2,
      maxRatio: 8,
    });
    graph.data(data);

    const legend = new Legend(graph, {
      legendData: customNodeLegendData,
      sort: (a: any, b: any) => a.value - b.value,
      container: legendDiv,
      encodeAttr: "cost",
      target: "node",
      width: 100,
      height: 150,
    });

    const { hover, click, hSep } = legend.options;
    const { legendItems, legendData } = legend;
    // 参数项配置
    expect(hover).toEqual({
      enable: false,
      legendActiveState: "hover",
      filter: false,
      graphActiveState: "active",
      graphBlurState: "blur",
    });
    expect(click).toEqual({
      enable: false,
      multiple: false,
      legendActiveState: "click",
      filter: true,
      graphActiveState: "",
      graphBlurState: "",
    });
    // 自定义数据更新
    expect(legendData[0]).toEqual({
      marker: {
        type: "circle",
        width: 10,
        height: 10,
        fillStyle: "#666",
      },
      label: undefined,
      value: 0,
    });
    expect(legendData[4]).toEqual({
      marker: {
        type: "rect",
        width: 50,
        height: 10,
        fillStyle: "#666",
      },
      label: undefined,
      value: 4,
    });
    // 图例元素
    expect(legendItems.length).toBe(5);
    expect(legendItems[0].children.length).toBe(1);
    expect(legendItems[0].getBBox()).toEqual({
      left: 10,
      top: 10,
      width: 10,
      height: 10,
    });
    expect(legendItems[4].getBBox()).toEqual({
      left: 10,
      top: 82,
      width: 50,
      height: 10,
    });
    expect(hSep).toBe(8);
  });

  xit("should work with edge shapes", () => {
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
      container: graphDiv,
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

    const edgeLegendData: CategoryLegendDataItem[] = [
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

    const legend = new Legend(graph, {
      legendData: edgeLegendData,
      container: legendDiv,
      encodeAttr: "cost",
      target: "edge",
      width: 351,
      height: 70,
      orient: "horizontal",
      title: {
        text: "Legend",
        background: {
          height: 20,
          fillStyle: "#eee",
        },
      },
      click: {
        enable: true,
      },
    });

    const { click, vSep, encodeAttr } = legend.options;
    const { legendData, legendItems, graphTarget, titleHeight, canvas } =
      legend;

    // 参数项配置
    expect(click).toEqual({
      enable: true,
      multiple: false,
      legendActiveState: "click",
      filter: true,
      graphActiveState: "",
      graphBlurState: "",
    });
    // 自定义数据更新
    expect(legendData[0]).toEqual({
      marker: {
        type: "line",
        width: 20,
        height: 10,
        strokeStyle: "#F6BD16",
        lineWidth: 3,
        hitWidth: 7,
      },
      label: "edge-type1",
      value: "edge-type1",
    });
    expect(legendData[2]).toEqual({
      marker: {
        type: "quadratic",
        width: 20,
        height: 10,
        strokeStyle: "#6F5EF9",
        lineWidth: 3,
        hitWidth: 7,
      },
      label: "edge-type3",
      value: "edge-type3",
    });
    // 图例元素
    expect(titleHeight).toBe(20);
    expect(legendItems.length).toBe(3);
    expect(legendItems[0].children.length).toBe(2);
    const { left, top, width, height } = legendItems[0].getBBox();
    expect(left).toBe(10);
    expect(top).toBe(37.2);
    expect(width).toBe(97);
    expect(height).toBeCloseTo(15.6);
    expect(vSep).toBe(20);
    // click 交互
    const graphObj = graph.getEdges();
    expect(graphTarget).toEqual(graphObj);
    legendItems[0].on("mouseenter", () => {
      legendItems[0].parent.emit("click", {
        target: legendItems[0],
      });
    });
    legendItems[1].on("mouseenter", () => {
      legendItems[1].parent.emit("click", {
        target: legendItems[1],
      });
    });

    canvas.eventManager.mousemove({ type: "mousemove" }, legendItems[0]);
    const [edge, label] = legendItems[0].children;
    expect(edge.get("strokeStyle")).toBe("#ccc");
    expect(label.get("fillStyle")).toBe("#ccc");
    graphTarget.forEach((edge: any) => {
      if (edge.get(encodeAttr) === legendItems[0].get("encodeValue")) {
        expect(edge.visible).toBe(false);
      }
    });

    canvas.eventManager.mousemove({ type: "mousemove" }, legendItems[1]);
    expect(edge.get("strokeStyle")).toBe("#F6BD16");
    expect(label.get("fillStyle")).toBe("#666");
    graphTarget.forEach((edge: any) => {
      if (edge.get(encodeAttr) === legendItems[0].get("encodeValue")) {
        expect(edge.visible).toBe(true);
      }
    });
    const [edge1, label1] = legendItems[1].children;
    expect(edge1.get("strokeStyle")).toBe("#ccc");
    expect(label1.get("fillStyle")).toBe("#ccc");
    graphTarget.forEach((edge: any) => {
      if (edge.get(encodeAttr) === legendItems[1].get("encodeValue")) {
        expect(edge.visible).toBe(false);
      }
    });
  });

  xit("should work with pagination", () => {
    const graph = new Graph({
      container: graphDiv,
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
          fillStyle: colors[node.group % 11] || colors[0],
          opacity: 0.2,
        };
      },
      setNodeStateStyles(state, nodeData) {
        if (state === "active") {
          return {
            strokeStyle: nodeData.fillStyle,
            lineWidth: 2,
          };
        }
      },
      setDefaultEdge() {
        return {
          strokeStyle: "#ccc",
        };
      },
    });
    graph.data(miserablesData);

    const legend = new Legend(graph, {
      container: legendDiv,
      encodeAttr: "group",
      target: "node",
      encodeStyles(nodeData) {
        return {
          marker: {
            type: "circle",
            fillStyle: nodeData.fillStyle,
          },
          label: "group" + nodeData.group,
        };
      },
      width: 100,
      height: 200,
      title: {
        text: "Legend",
        background: {
          height: 20,
          fillStyle: "#eee",
        },
      },
      hover: {
        enable: true,
        legendActiveState: "active",
        filter: true,
      },
      click: {
        enable: true,
        multiple: true,
      },
      setLegendStateStyles(state: string, markerData: any) {
        if (state === "active") {
          return {
            strokeStyle: markerData.fillStyle ? markerData.fillStyle : "#ccc",
            lineWidth: 3,
            textStyles: {
              fontWeight: "bolder",
            },
          };
        }
      },
    });
    const { hover, click, hSep, encodeAttr } = legend.options;
    const { legendData, legendItems, graphTarget, canvas, paginationConfigs } =
      legend;

    // 参数项配置
    expect(hover).toEqual({
      enable: true,
      legendActiveState: "active",
      filter: true,
      graphActiveState: "active",
      graphBlurState: "",
    });
    expect(click).toEqual({
      enable: true,
      multiple: true,
      legendActiveState: "click",
      filter: true,
      graphActiveState: "",
      graphBlurState: "",
    });
    // 主动生成 legendData
    expect(legendData[0]).toEqual({
      marker: {
        type: "circle",
        width: 10,
        height: 10,
        fillStyle: "#4c72b0",
      },
      label: "group0",
      value: 0,
    });
    // 图例元素
    const graphObj = graph.getNodes();
    expect(graphTarget).toEqual(graphObj);
    expect(legendItems.length).toBe(11);
    expect(legendItems[0].children.length).toBe(2);
    const { left, top, width, height } = legendItems[10].getBBox();
    expect(left).toBe(19.5);
    expect(top).toBeCloseTo(286);
    expect(width).toBe(61);
    expect(height).toBeCloseTo(15.6);
    expect(hSep).toBe(8);

    // 翻页
    expect(paginationConfigs).toEqual({
      curPage: 0,
      distance: [0, 128, 128],
      order: [0, 5, 10],
      count: 3,
    });

    // hover 交互
    legendItems[0].on("mouseenter", () => {
      legendItems[0].parent.emit("mouseover", {
        target: legendItems[0],
      });
    });
    legendItems[0].on("mouseleave", () => {
      legendItems[0].parent.emit("mouseout", {
        target: legendItems[0],
      });
    });
    canvas.eventManager.mousemove({ type: "mousemove" }, legendItems[0]);
    const [node, label] = legendItems[0].children;
    expect(node.get("lineWidth")).toBe(3);
    expect(node.get("strokeStyle")).toBe("#4c72b0");
    expect(label.get("fontWeight")).toBe("bolder");
    graphTarget.forEach((node: any) => {
      if (node.get(encodeAttr) === legendItems[0].value) {
        expect(node.get("strokeStyle")).toBe(node.get("strokeStyle"));
        expect(node.get("lineWidth")).toBe(2);
      }
    });
    canvas.eventManager.mousemove({ type: "mousemove" }, canvas);
    expect(node.get("lineWidth")).toBe(1);
    expect(node.get("strokeStyle")).toBe(null);
    expect(label.get("fontWeight")).toBe("normal");
    graphTarget.forEach((node: any) => {
      if (node.get(encodeAttr) === legendItems[0].value) {
        expect(node.get("strokeStyle")).toBe(null);
        expect(node.get("lineWidth")).toBe(null);
      }
    });

    // 翻页交互
    const leftArrow = canvas.children[0].children[2].children[1].children[0];
    const text = canvas.children[0].children[2].children[1].children[1];
    const rightArrow = canvas.children[0].children[2].children[1].children[2];
    leftArrow.on("mouseenter", () => {
      leftArrow.emit("click", {});
    });
    rightArrow.on("mouseenter", () => {
      rightArrow.emit("click", {});
    });
    canvas.eventManager.mousemove({ type: "mousemove" }, rightArrow);
    expect(rightArrow.get("strokeStyle")).toBe("#2D5CF6");
    const matrix1 = legendItems[0].getMatrix();
    expect(matrix1[5]).toEqual(-90.2);
    expect(text.get("text")).toBe("2/3");

    canvas.eventManager.mousemove({ type: "mousemove" }, leftArrow);
    expect(leftArrow.get("strokeStyle")).toBe("#CACDD3");
    const matrix2 = legendItems[0].getMatrix();
    expect(matrix2[5]).toEqual(37.8);
    expect(text.get("text")).toBe("1/3");
  });

  xit("should work with long text", () => {
    const customNodeLegendData: CategoryLegendDataItem[] = [
      {
        label: "longtext",
      },
      {
        label: "longtextlongtextlongtext",
      },
    ];

    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      minRatio: 0.2,
      maxRatio: 8,
    });

    const legend = new Legend(graph, {
      legendData: customNodeLegendData,
      container: legendDiv,
      encodeAttr: "cost",
      target: "node",
      width: 200,
      height: 50,
    });

    const { legendItems } = legend;
    expect(legendItems.length).toBe(2);
    const width1 = legendItems[0].children[1].getBBox().width;
    const width2 = legendItems[1].children[1].getBBox().width;
    const label = legendItems[1].children[1].get("text");
    expect(width1).toBe(43);
    expect(width2).toBe(98);
    expect(label).toBe("longtextlongtextl...");
  });

  it("should work with default configs", () => {
    const graph = new Graph({
      container: graphDiv,
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
          fillStyle: colors[node.group % 11] || colors[0],
          opacity: 0.2,
        };
      },
      setDefaultEdge() {
        return {
          strokeStyle: "#ccc",
        };
      },
    });
    graph.data(miserablesData);

    const legend = new Legend(graph, {
      encodeAttr: "group",
      sort: (a: any, b: any) => a.value - b.value,
      target: "node",
      width: 100,
      height: 200,
    });

    const { legendData, container } = legend;
    // 默认 container
    expect(container).toEqual(graph.get("container"));

    // 默认配置 legendData
    expect(legendData[0]).toEqual({
      marker: {
        type: "rect",
        width: 10,
        height: 10,
        fillStyle: "#666",
      },
      label: "0",
      value: 0,
    });
  });

  it("update should work", () => {
    const graph = new Graph({
      container: graphDiv,
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
          fillStyle: colors[node.group % 11] || colors[0],
          opacity: 0.2,
        };
      },
      setDefaultEdge() {
        return {
          strokeStyle: "#ccc",
        };
      },
    });

    graph.data({
      nodes: [{ id: "1" }, { id: "2" }],
      edges: [],
    });
    const legend = new Legend(graph, {
      encodeAttr: "id",
      sort: (a: any, b: any) => a.value - b.value,
      target: "node",
      width: 100,
      height: 200,
      click: {
        enable: true,
        multiple: true,
      },
    });

    const nodeLayer = legend.canvas.children[0].children[0];
    expect(nodeLayer.children.length).toBe(2);
    expect(nodeLayer.children[0].get("encodeValue")).toBe("1");
    expect(nodeLayer.children[1].get("encodeValue")).toBe("2");
    legend.onClick(nodeLayer.children[0]);
    legend.onClick(nodeLayer.children[1]);
    expect(legend.clickActiveItem.length).toBe(2);
    expect(nodeLayer.children[0].get("clickInteraction")).toBe(true);
    expect(nodeLayer.children[1].get("clickInteraction")).toBe(true);

    graph.data({
      nodes: [{ id: "1" }, { id: "3" }],
      edges: [],
    });
    expect(nodeLayer.children.length).toBe(2);
    expect(nodeLayer.children[0].get("encodeValue")).toBe("1");
    expect(nodeLayer.children[1].get("encodeValue")).toBe("3");
    expect(legend.clickActiveItem.length).toBe(1);
    expect(nodeLayer.children[0].get("clickInteraction")).toBe(true);
    expect(nodeLayer.children[1].get("clickInteraction")).toBe(undefined);
  });

  it("should paginate legend items and update lifecycle options", () => {
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      minRatio: 0.2,
      maxRatio: 8,
    });
    const legendData: CategoryLegendDataItem[] = Array.from({ length: 8 }).map(
      (_, index) => ({
        marker: {
          type: "rect",
          width: 10,
          height: 10,
        },
        label: `group-${index}`,
        value: index,
      })
    );
    const legend = new Legend(graph, {
      legendData,
      container: legendDiv,
      encodeAttr: "group",
      target: "node",
      width: 120,
      height: 90,
      padding: 10,
      hover: {
        enable: true,
        filter: true,
      },
    });

    expect(legend.paginationConfigs.count).toBeGreaterThan(1);
    expect(legend.paginationConfigs.curPage).toBe(0);
    expect(legend.legendItems[0].visible).toBe(true);
    expect(legend.legendItems[legend.legendItems.length - 1].visible).toBe(
      false
    );

    const paginationLayer = legend.canvas.children[0].children[2];
    const leftArrow = paginationLayer.children[1].children[0];
    const pageNumber = paginationLayer.children[1].children[1];
    const rightArrow = paginationLayer.children[1].children[2];

    rightArrow.emit("click", {});
    expect(legend.paginationConfigs.curPage).toBe(1);
    expect(pageNumber.get("text")).toBe(`2/${legend.paginationConfigs.count}`);
    expect(leftArrow.get("strokeStyle")).toBe("#505968");

    leftArrow.emit("click", {});
    expect(legend.paginationConfigs.curPage).toBe(0);
    expect(pageNumber.get("text")).toBe(`1/${legend.paginationConfigs.count}`);
    expect(leftArrow.get("strokeStyle")).toBe("#CACDD3");

    const updateSpy = jest.spyOn(legend, "update").mockImplementation(() => {});
    const refreshSpy = jest
      .spyOn(legend, "refresh")
      .mockImplementation(() => {});
    legend.updateOption("hover", {
      enable: false,
      graphActiveState: "selected",
    });
    expect(legend.options.hover).toEqual(
      expect.objectContaining({
        enable: false,
        filter: true,
        graphActiveState: "selected",
      })
    );
    expect(updateSpy).toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalled();

    legend.disable();
    expect(legend._enable).toBe(false);
    updateSpy.mockRestore();
    refreshSpy.mockRestore();
    const destroySpy = jest
      .spyOn(legend.canvas, "destroy")
      .mockImplementation(() => undefined);
    jest.spyOn(legend, "clear").mockImplementation(() => undefined);
    legend.beforeDestroy();
    expect(destroySpy).toHaveBeenCalled();
  });

  it("should filter graph states and restore legend item styles", () => {
    const graph = new Graph({
      container: graphDiv,
      width: 800,
      height: 600,
      minRatio: 0.2,
      maxRatio: 8,
    });
    graph.data({
      nodes: [
        { id: "a", group: "g1" },
        { id: "b", group: "g2" },
      ],
      edges: [],
    });
    const legend = new Legend(graph, {
      encodeAttr: "group",
      target: "node",
      width: 160,
      height: 100,
      sort: (a: any, b: any) => a.value.localeCompare(b.value),
      hover: {
        enable: true,
        filter: false,
        graphActiveState: "active",
        graphBlurState: "blur",
      },
      click: {
        enable: true,
        multiple: true,
        filter: true,
      },
      setLegendStateStyles() {
        return {
          fillStyle: "#f00",
          strokeStyle: "#0f0",
          textStyles: {
            fillStyle: "#00f",
          },
        };
      },
    });
    const firstItem = legend.legendItems[0];
    const secondItem = legend.legendItems[1];
    const firstNode = graph.getNodeById("a");
    const secondNode = graph.getNodeById("b");
    const setEmitSpy = jest.spyOn(graph, "set");
    const emitSpy = jest.spyOn(graph, "emitEvent");

    legend.filterGraph([firstItem], "hover");

    expect(firstNode.hasState("active")).toBe(true);
    expect(firstNode.hasState("blur")).toBe(false);
    expect(secondNode.hasState("active")).toBe(false);
    expect(secondNode.hasState("blur")).toBe(true);
    expect(setEmitSpy).toHaveBeenCalledWith("emitGraphEvents", false);
    expect(setEmitSpy).toHaveBeenCalledWith("emitGraphEvents", true);
    expect(emitSpy).toHaveBeenCalledWith("batchstate:end", { state: "active" });

    legend.setLegendItemState("hover", firstItem, "active");
    expect(firstItem.children[0].get("fillStyle")).toBe("#f00");
    expect(firstItem.children[1].get("fillStyle")).toBe("#00f");
    legend.clearLegendItemState(firstItem);
    expect(firstItem.children[0].cacheStyle).toBeUndefined();
    expect(firstItem.children[1].cacheStyle).toBeUndefined();

    legend.onClick(firstItem);
    legend.onClick(secondItem);
    expect(legend.clickActiveItem).toHaveLength(2);
    legend.onClick(firstItem);
    expect(legend.clickActiveItem).toEqual([secondItem]);

    firstNode.hide();
    legend.clearGraph("click");
    expect(firstNode.visible).toBe(true);

    legend.clear();
    expect(firstNode.hasState("active")).toBe(false);
    expect(secondNode.hasState("blur")).toBe(false);
  });
});
