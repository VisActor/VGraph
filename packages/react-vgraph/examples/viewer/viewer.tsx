import {
  Graph,
  panZoom,
  dragCanvas,
  DAGLayout,
  Node,
  EdgeEditor,
  AnchorConfigs,
  registerNode,
  resizeToExport,
  Layer,
  TagUtils,
  Text,
} from "@visactor/vgraph";
import { Tabs, Typography, Tag } from "@arco-design/web-react";
import {
  IconSettings,
  IconShrink,
  IconExpand,
  IconPlusCircle,
  IconMinusCircle,
} from "@arco-design/web-react/icon";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Viewer } from "../../src";
import data from "../static/data.json";
import "@arco-design/web-react/dist/css/arco.css";

const TabPane = Tabs.TabPane;

registerNode("exportNode", {
  type: "exportNode",
  extends: "rect",
  drawCurrentLabel: false,
  getConfigsForShape(nodeData: any) {
    return {
      ...nodeData,
      radius: 4,
      label: {
        offsetY: 12,
        text: "Tab1: some description \nTab2: some description \nTab3: some description",
        height: 60,
        lineHeight: 16,
      },
    };
  },
  shape(layer: Layer, configs: any) {
    const { width, height } = configs;
    const tagLayer = TagUtils.initTag(layer, {
      text: "正常",
      left: -width / 2 + 12,
      top: -height / 2 + 6,
      label: {
        fillStyle: "#2E62F1",
      },
      background: {
        fillStyle: "#E9EEFE",
        strokeStyle: "#E1E4E8",
      },
    });
    const bbox = tagLayer.getBBox();
    const text = new Text({
      x: -width / 2 + 16 + bbox.width,
      y: -height / 2 + 13,
      text: configs.name,
      fillStyle: "#595959",
      fontWeight: 500,
    });
    layer.add(text);
  },
});

(() => {
  const App = () => {
    const [graph, setGraph] = useState<Graph | null>(null);

    useEffect(() => {
      const g = generateGraph();
      g.data(data);
      const dag = new DAGLayout({
        graph: g,
        rankDir: "TB",
        nodeSep: 50,
        rankSep: 150,
      });
      g.set("layout", dag);
      g.changeSize(700, 800);
      g.refresh();
      g.fitView();
    }, []);

    function generateGraph() {
      const g = new Graph({
        container: "viewerExample",
        width: 1000,
        height: 800,
        minRatio: 0.3,
        maxRatio: 8,
        renderMode: "dom",
        setDefaultNode(node: any) {
          return {
            type: "exportNode",
            width: 200,
            height: 80,
            anchors: [
              { position: [0.5, 0], show: "hover" },
              { position: [0.5, 1], show: "hover" },
            ],
          };
        },
        setDefaultEdge() {
          return {
            type: "vLine",
            strokeStyle: "#ddd",
            appendSize: 2,
          };
        },
      });
      g.addBehavior(panZoom);
      g.addBehavior(dragCanvas);
      g.on("edge:mouseenter", (e: any) => {
        console.log(e.target);
      });
      setGraph(g);
      return g;
    }

    function resizeNode(node: Node) {
      if (!graph) return;
      const position = getNodeRelativePos(node);
      if (node.get("height") === 80) {
        node.set("expanded", true);
        node.updateData({ height: 150 });
      } else {
        node.set("expanded", false);
        node.updateData({ height: 80 });
      }
      graph.get("layout").layout();
      graph.refresh();
      const currentPos = getNodeRelativePos(node);
      graph.translate(position.x - currentPos.x, position.y - currentPos.y);
      graph.set("autoDraw", true);
      graph.draw();
    }

    function getNodeRelativePos(node: Node) {
      const { x, y } = node.configs;
      return graph!.canvasToViewport(x, y);
    }

    function collapse(node: Node) {
      node.set("collapsed", true);
      const nodeMap = graph!.getNodeMap();
      let nodes: any = [];
      let edges: any = [];
      const targets = node.targets;
      for (let i = targets.length - 1; i >= 0; i--) {
        const id = targets[i];
        const hideData = getNodeData(nodeMap[id]);
        nodes = nodes.concat(hideData.nodes);
        edges = edges.concat(hideData.edges);
      }
      return { nodes, edges };
    }

    function getNodeData(node: Node) {
      const nodeMap = graph!.getNodeMap();
      let nodes = [node.configs];
      const nodeId = node.get("id");
      let edges: any = [];
      node.edges.forEach((edge: any) => {
        if (edge.get("target") === nodeId) {
          edges.push(edge.configs);
        }
      });
      const targets = node.targets;
      for (let i = targets.length - 1; i >= 0; i--) {
        const id = targets[i];
        const hideData = getNodeData(nodeMap[id]);
        nodes = nodes.concat(hideData.nodes);
        edges = edges.concat(hideData.edges);
      }
      graph!.remove(node);
      return { nodes, edges };
    }

    function expand(node: Node) {
      if (!graph) return;
      node.set("collapsed", false);
      const { nodes, edges } = node.get("hideData");
      nodes.forEach((nodeData: any) => {
        graph.add("node", nodeData);
      });

      edges.forEach((edgeData: any) => {
        graph.add("edge", edgeData);
      });
    }

    function toggleData(node: Node) {
      if (!graph) return;
      const layout = graph.get("layout");
      // 记录节点原本的位置，用于布局后恢复定位，固定用户操作焦点
      const position = getNodeRelativePos(node);
      const autoDraw = graph.disableAutoDraw();
      if (node.get("collapsed")) {
        expand(node);
      } else {
        const data = collapse(node);
        node.set("hideData", data);
      }
      layout.layout();
      graph.refresh();
      // 将被操作节点移回原位
      const currentPos = getNodeRelativePos(node);
      graph.enableAutoDraw(autoDraw);
      // graph.translate(position.x - currentPos.x, position.y - currentPos.y); // TODO: debounce 导致节点未正确便平移。
      graph.draw();
    }

    function setNode(node: Node) {
      const style = {
        textAlign: "center",
        marginTop: 20,
      };
      const activeTab = node.get("activeTab") || "1";
      const expand = node.get("expanded");
      let content = <div>some description</div>;
      if (expand) {
        content = (
          <div
            onClick={() => {
              // graph.remove(node);
              // viewer.current.refresh();
            }}
          >
            <Tabs
              defaultActiveTab={activeTab}
              onChange={(tab: string) => {
                node.set("activeTab", tab);
              }}
            >
              <TabPane key="1" title="Tab 1">
                <Typography.Paragraph>
                  Content of Tab Panel 1
                </Typography.Paragraph>
              </TabPane>
              <TabPane key="2" title="Tab 2" disabled>
                <Typography.Paragraph>
                  Content of Tab Panel 2
                </Typography.Paragraph>
              </TabPane>
              <TabPane key="3" title="Tab 3">
                <Typography.Paragraph>
                  Content of Tab Panel 3
                </Typography.Paragraph>
              </TabPane>
            </Tabs>
          </div>
        );
      }

      const iconStyles: any = {
        color: "#3073FF",
        position: "absolute",
        left: 94,
        top: expand ? 142 : 72,
        fontSize: 16,
      };

      return (
        <div
          style={{
            width: 200,
            height: expand ? 150 : 80,
            border: "1px solid #E1E4EB",
            borderRadius: 4,
          }}
        >
          {expand ? (
            <IconShrink
              style={{ float: "right" }}
              onClick={() => {
                resizeNode(node);
              }}
            />
          ) : (
            <IconExpand
              style={{ float: "right" }}
              onClick={() => {
                resizeNode(node);
              }}
            />
          )}
          <Tag
            checkable
            color="arcoblue"
            defaultChecked
            style={{ marginRight: 8 }}
          >
            正常
          </Tag>
          {node.get("name")}
          {content}
          {node.get("collapsed") ? (
            <IconPlusCircle
              style={iconStyles}
              onClick={() => {
                toggleData(node);
              }}
              className="icon"
            />
          ) : (
            <IconMinusCircle
              style={iconStyles}
              onClick={() => {
                toggleData(node);
              }}
              className="icon"
            />
          )}
        </div>
      );
    }

    function changeGraph() {
      graph!.destroy();
      setGraph(null);

      const g = generateGraph();
      g.data({
        nodes: [
          { name: "TOP", class: "type-TOP", id: "0" },
          { name: "S", class: "type-S", id: "1" },
          { name: "NP", class: "type-NP", id: "2" },
          { name: "DT", class: "type-DT", id: "3" },
          { name: "This", class: "type-TK", id: "4" },
          { name: "VP", class: "type-VP", id: "5" },
          { name: "VBZ", class: "type-VBZ", id: "6" },
          { name: "is", class: "type-TK", id: "7" },
          { name: "NP", class: "type-NP", id: "8" },
          { name: "DT", class: "type-DT", id: "9" },
          { name: "an", class: "type-TK", id: "10" },
          { name: "NN", class: "type-NN", id: "11" },
          { name: "example", class: "type-TK", id: "12" },
          { name: "type.", class: "type-.", id: "13" },
          { name: "sentence", class: "type-TK", id: "14" },
        ],
        edges: [
          { source: "3", target: "4" },
          { source: "2", target: "3" },
          { source: "1", target: "2" },
          { source: "6", target: "7" },
          { source: "5", target: "6" },
          { source: "9", target: "10" },
          { source: "8", target: "9" },
          { source: "11", target: "12" },
          { source: "8", target: "11" },
          { source: "5", target: "8" },
          { source: "1", target: "5" },
          { source: "13", target: "14" },
          { source: "1", target: "13" },
          { source: "0", target: "1" },
        ],
      });
      const dag = new DAGLayout({
        graph: g,
        rankDir: "TB",
        nodeSep: 50,
        rankSep: 150,
      });
      g.set("layout", dag);
      g.refresh();
      g.fitView();
      setGraph(g);
    }

    function setAnchor(node: Node, anchor: AnchorConfigs) {
      if (anchor.index === 0) {
        return null;
      }
      return <IconSettings />;
    }

    function exportImage() {
      if (!graph) {
        return;
      }
      const instance = graph;
      setGraph(null);
      graph.updateRenderMode("canvas");
      const { matrix } = resizeToExport(graph);
      graph.downloadImage("vgraph.png", undefined, undefined, () => {
        setGraph(instance);
        graph.updateRenderMode("dom");
        graph.setMatrix(matrix);
      });
    }

    return (
      <>
        <button onClick={changeGraph}>切换实例</button>
        <button onClick={exportImage}>导出图片</button>
        <div style={{ width: 1000, height: 600 }} id="viewerExample">
          {graph && (
            <Viewer
              // responsiveNode
              // onResizeNodesFinished={onResizeNodesFinished}
              graph={graph}
              setNode={setNode}
              setAnchor={setAnchor}
              // hideDetails={{ ratio: 0.2, getNodeStyles }}
            />
          )}
        </div>
      </>
    );
  };
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
