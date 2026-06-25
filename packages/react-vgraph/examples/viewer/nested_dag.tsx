import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Graph, panZoom, NestedDAG, Node, Text, Group } from "@visactor/vgraph";
import { Tag } from "@arco-design/web-react";
import { IconExpand, IconShrink } from "@arco-design/web-react/icon";
import "@arco-design/web-react/dist/css/arco.css";
import { Viewer } from "../../src";
import data from "../static/multi_nested_dag.json";

(() => {
  const text = new Text({ text: "", x: 0, y: 0, textAlign: "left" });
  const App = () => {
    const [graph, setGraph] = useState<Graph | null>(null);
    useEffect(() => {
      const g = new Graph({
        container: "viewerExample",
        width: 800,
        height: 600,
        minRatio: 0.3,
        maxRatio: 8,
        renderMode: "dom",
        setDefaultNode(node: any) {
          return {
            width: 140,
            height: 40,
            opacity: 0,
            anchors: [
              [0, 0.5],
              [1, 0.5],
            ],
          };
        },
        setDefaultEdge() {
          return {
            type: "line",
            endArrow: true,
          };
        },
        setDefaultGroup(groupData: any) {
          return {
            linkNode: true,
            padding: 20,
            linkGroupOnCollapse: true,
            fillStyle: "#F3F9FF",
            strokeStyle: "#3073F2",
            lineWidth: 2,
            titleSize: 30,
            anchors: [
              [0, 0.5],
              [1, 0.5],
            ],
          };
        },
      });
      g.addBehavior(panZoom);
      g.data(data);
      const dag = new NestedDAG({
        graph: g,
        controlPoints: true,
        dagOptions: {
          rankDir: "LR",
          nodeSep: 30,
          edgeSep: 10,
          rankSep: 50,
          allControlPoints: true,
          cache: true,
        },
      });
      g.refresh();
      g.fitView();
      g.set("layout", dag);
      g.refresh();
      g.fitView();
      setGraph(g);
    }, []);

    function setNode(node: Node) {
      return (
        <div
          style={{
            width: 140,
            height: 40,
            overflow: "hidden",
            textOverflow: "ellipsis",
            border: "1px solid #ccc",
            textAlign: "center",
          }}
        >
          {node.get("id")}
        </div>
      );
    }

    function toggleGroup(group: Group) {
      const nestedDag = graph?.get("layout");
      if (group.get("collapsed")) {
        // 清除收起的分组宽度
        group.set("fixWidth", undefined);
        group.expand();
      } else {
        group.collapse();
        // 根据标题文本长度设置分组宽度
        text.set("text", group.get("id"));
        group.set("fixWidth", text.getBBox().width + 60);
        group.refreshBox();
      }
      nestedDag.layout({ rank: true, order: true });
      graph?.refresh();
    }

    function setGroupTitle(group: Group) {
      return (
        <div
          style={{
            border: "1px solid red",
            backgroundColor: "#ccc",
            color: "#fff",
            height: "100%",
          }}
        >
          <Tag color="#168cff">{group.get("id")}</Tag>
          {group.get("collapsed") ? (
            <IconExpand
              style={{ position: "absolute", right: 4 }}
              onClick={() => {
                toggleGroup(group);
              }}
            />
          ) : (
            <IconShrink
              style={{ position: "absolute", right: 4 }}
              onClick={() => {
                toggleGroup(group);
              }}
            />
          )}
        </div>
      );
    }

    return (
      <div style={{ width: 1000, height: 600 }} id="viewerExample">
        {graph && (
          <Viewer
            graph={graph}
            setNode={setNode}
            setGroupTitle={setGroupTitle}
          />
        )}
      </div>
    );
  };
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
