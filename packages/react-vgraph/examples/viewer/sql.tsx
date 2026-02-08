import {
  Graph,
  panZoom,
  dragCanvas,
  DAGLayout,
  Node,
  EdgeEditor,
  AnchorConfigs,
  GraphStructure,
  NestedDAG,
  Group,
} from "@visactor/vgraph";
import {
  IconSettings,
  IconShrink,
  IconExpand,
  IconPlusCircle,
  IconMinusCircle,
} from "@arco-design/web-react/icon";
import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { Viewer } from "../../src";
import data from "../static/sql.json";
import "@arco-design/web-react/dist/css/arco.css";

// 层间距
const rankSep = 100;
// 每层中表的上下间距
const tableSep = 50;
// 字段宽度
const nodeWidth = 180;
// 字段高度
const nodeHeight = 20;
// 表名高度
const groupHeight = 20;

(() => {
  function customLayout(
    subGraph: Graph | GraphStructure,
    reuse?: { rank?: boolean; order?: boolean },
    rankOnly?: boolean
  ) {
    const nodeSep =
      subGraph.getNodes()[0].get("parent").id === "_nested_dag_mock_root"
        ? tableSep
        : 0;
    new DAGLayout({
      graph: subGraph,
      rankDir: "LR",
      nodeSep: nodeSep,
      edgeSep: 10,
      rankSep: rankSep,
      ranker: reuse?.rank ? "custom" : "networkSimplex",
      order: reuse?.order ? "custom" : "minCross",
      rankOnly: rankOnly,
      cache: true,
    });
  }
  const App = () => {
    const [graph, setGraph] = useState<Graph | null>(null);

    useEffect(() => {
      const g = new Graph({
        container: "viewerExample",
        width: 800,
        height: 600,
        minRatio: 0.1,
        renderMode: "dom",
        setDefaultNode(nodeData: any) {
          // 表中字段样式
          return {
            width: nodeWidth,
            height: nodeHeight,
            strokeStyle: null,
            label: nodeData.id,
            anchors: [
              [0, 0.5],
              [1, 0.5],
            ],
          };
        },
        setNodeStateStyles(state: string, nodeData: any) {
          const node = g.getNodeById(nodeData.id);
          const label = node.getLabel();
          if (state === "highlight") {
            label.set("fillStyle", "red");
            return {};
          } else {
            label.set("fillStyle", "#666");
            return {};
          }
        },
        setDefaultEdge() {
          return {
            type: "line",
            endArrow: true,
          };
        },
        setDefaultGroup(group: any) {
          return {
            linkNode: true,
            linkGroupOnCollapse: true,
            strokeStyle: "#3073FF",
            radius: [4, 4, 0, 0],
            padding: 1,
            titleSize: groupHeight,
            anchors: [
              { position: [0, 0], offsets: [0, 0.5 * groupHeight] },
              { position: [1, 0], offsets: [0, 0.5 * groupHeight] },
            ],
          };
        },
      });

      // 添加交互
      g.addBehavior(panZoom);
      g.addBehavior(dragCanvas);
      g.data(data);
      // 布局
      const nestedDag = new NestedDAG({
        graph: g,
        customLayout,
      });
      g.set("nestedDag", nestedDag);
      g.refresh();
      g.getEdgeContainer().toBack();
      // 适应视图大小
      g.fitView();
      setGraph(g);
    }, []);

    function setNode(node: Node) {
      return (
        <div
          style={{
            boxSizing: "border-box",
            width: nodeWidth,
            height: nodeHeight,
            border: "1px solid #E1E4EB",
            backgroundColor: "#fff",
            borderRadius: 4,
          }}
        >
          {node.get("id")}
        </div>
      );
    }

    function setGroupTitle(group: Group) {
      return (
        <div style={{ backgroundColor: "#3073F2", color: "#fff" }}>
          {group.get("id")}
        </div>
      );
    }

    return (
      <>
        <div style={{ width: 1000, height: 600 }} id="viewerExample">
          {graph && (
            <Viewer
              graph={graph}
              setNode={setNode}
              setGroupTitle={setGroupTitle}
            />
          )}
        </div>
      </>
    );
  };
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
})();
