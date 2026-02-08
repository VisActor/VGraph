import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import {
  TreeGraph,
  dragCanvas,
  panZoom,
  CompactBox,
  Node,
  AnchorConfigs,
} from "@visactor/vgraph";
import { Viewer } from "../../src";
import { Tabs } from "@arco-design/web-react";
import { IconPlusCircle, IconMinusCircle } from "@arco-design/web-react/icon";
import "@arco-design/web-react/dist/css/arco.css";
import data from "../static/flare.json";
const TabPane = Tabs.TabPane;

(() => {
  const App = () => {
    const [graph, setGraph] = useState<null | TreeGraph>(null);
    useEffect(() => {
      const layout = new CompactBox({
        direction: "TB",
        size() {
          return [800, 600];
        },
        nodeSep() {
          return 15;
        },
        nodeSize(nodeData: any) {
          return [280, 150];
        },
        rankSep() {
          return 50;
        },
      });

      const g = new TreeGraph({
        container: "viewerExample",
        width: 800,
        height: 600,
        minRatio: 0.01,
        maxRatio: 8,
        layout,
        animate: true,
        renderMode: "dom",
        // fitViewAfterLayout: false,
        setDefaultNode(nodeData: any) {
          let collapsed = true;
          if (nodeData.depth === 0) {
            collapsed = false;
          } else {
            collapsed =
              nodeData.collapsed !== undefined ? nodeData.collapsed : true;
          }
          return {
            width: 280,
            expanded: true,
            height: 150,
            opacity: 0,
            // collapsed: nodeData.collapsed !== undefined ? nodeData.collapsed: true,
            anchors: [
              [0.5, 0],
              [0.5, 1],
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
      g.data(data);
      g.root!.hide();
      g.setZoomRatio(1);
      const node = g.getNodes()[1];
      g.focus(node);
      g.translate(0, -300);
      // g.refresh();
      // g.fitView();
      setGraph(g);
    }, []);

    function toggleNode(node: Node) {
      graph!.toggleCollapse(node);
    }

    function setNode(node: Node) {
      const style = {
        textAlign: "center",
        marginTop: 20,
      };
      const activeTab = node.get("activeTab") || "1";
      const expand = node.get("expanded");
      const iconStyles: any = {
        color: "#3073FF",
        position: "absolute",
        left: 132,
        top: 142,
        fontSize: 16,
      };

      let icon: any = null;
      if (node.get("children")) {
        icon = node.get("collapsed") ? (
          <IconPlusCircle
            style={iconStyles}
            onClick={() => {
              toggleNode(node);
            }}
            className="icon"
          />
        ) : (
          <IconMinusCircle
            style={iconStyles}
            onClick={() => {
              toggleNode(node);
            }}
            className="icon"
          />
        );
      }

      return (
        <div style={{ border: "1px solid #E1E4EB", borderRadius: 4 }}>
          <div style={{ marginTop: 8, textAlign: "center", fontWeight: 500 }}>
            {" "}
            {node.get("id")}
          </div>

          <Tabs
            defaultActiveTab={activeTab}
            onChange={(tab: string) => {
              node.set("activeTab", tab);
            }}
          >
            <TabPane key="1" title="O1">
              <div style={{ paddingLeft: 12 }}>KR1: some content</div>
              <div style={{ paddingLeft: 12 }}>KR2: some content</div>
              <div style={{ paddingLeft: 12 }}>KR3: some content</div>
            </TabPane>
            <TabPane key="2" title="O2">
              <div style={{ paddingLeft: 12 }}>KR1: some content</div>
              <div style={{ paddingLeft: 12 }}>KR2: some content</div>
              <div style={{ paddingLeft: 12 }}>KR3: some content</div>
            </TabPane>
            <TabPane key="3" title="O3">
              <div style={{ paddingLeft: 12 }}>KR1: some content</div>
              <div style={{ paddingLeft: 12 }}>KR2: some content</div>
              <div style={{ paddingLeft: 12 }}>KR3: some content</div>
            </TabPane>
          </Tabs>
          {icon}
        </div>
      );
    }

    function setAnchor(node: Node, anchor: any) {
      if (anchor.temp) {
        return null;
      }
      if (node.get("taskType") === "condition") {
        if (anchor.index === 1) {
          return (
            <div style={{ fontSize: 10, margin: "-4px 0 0 12px" }}>是</div>
          );
        }
        if (anchor.index === 2) {
          return (
            <div style={{ fontSize: 10, margin: "-4px 0 0 -20px" }}>否</div>
          );
        }
      }
      return <div />;
    }

    function setAnchorClassName(node: Node, anchor: AnchorConfigs) {
      const classNames: string[] = [];
      if (anchor.position?.[0] === 0) {
        classNames.push("xgraph-anchor-left");
      }
      if (anchor.position?.[1] === 0) {
        classNames.push("xgraph-anchor-top");
      }
      if (anchor.position?.[0] === 1) {
        classNames.push("xgraph-anchor-right");
      }
      if (anchor.position?.[1] === 1) {
        classNames.push("xgraph-anchor-bottom");
      }
      if (anchor.magnet) {
        classNames.push("xgraph-anchor-magnet");
      }
      return classNames.join(" ");
    }

    function getNodeStyles(node: Node) {
      return {
        backgroundColor: "#3073FF",
      };
    }

    return (
      <div id="viewerExample" style={{ width: "100%", height: "100%" }}>
        {graph && (
          <Viewer
            graph={graph}
            setNode={setNode}
            hideDetails={{ ratio: 0.2, getNodeStyles }}
          />
        )}
      </div>
    );
  };
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
})();
