import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Graph,
  panZoom,
  DAGLayout,
  Node,
  GroupUtils,
  Group,
  NodeMover,
} from "@visactor/vgraph";
import { Input } from "@arco-design/web-react";
import { IconExpand, IconShrink } from "@arco-design/web-react/icon";
import "@arco-design/web-react/dist/css/arco.css";
import { Viewer } from "../../src";
import rawData from "../static/nested_dag.json";

(() => {
  const TitleEditor = ({ group }: { group: Group }) => {
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState(group.get("name") || group.get("id"));
    return (
      <div
        style={{
          lineHeight: "40px",
          height: "100%",
          border: "1px solid #E3E5EB",
          borderRadius: "4px 4px 0 0",
          background: "#fff",
        }}
        onDoubleClick={() => {
          setVisible(true);
        }}
      >
        {visible ? (
          <Input
            autoFocus
            value={name}
            onChange={(v) => {
              setName(v);
            }}
            onPressEnter={() => {
              group.set("name", name);
              setVisible(false);
            }}
          />
        ) : (
          <span style={{ paddingLeft: 12 }}>{name}</span>
        )}
        {/* <IconShrink style={{ position: 'absolute', right: 4, top: 8 }} /> */}
      </div>
    );
  };

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
            padding: [16, 12, 16, 12],
            opacity: 1,
            fillStyle: "#F6F7F9",
            strokeStyle: "#E3E5EB",
            lineWidth: 1,
            titleSize: 40,
            radius: 4,
          };
        },
      });
      g.addBehavior(panZoom);
      // 原始数据处理，将分组全部折叠
      // const data = GroupUtils.getCollapsableData(rawData);
      g.data({
        nodes: [
          { id: "1", name: "数据整理" },
          { id: "2", name: "建模分析" },
          { id: "3", name: "描述分析" },
        ],
        edges: [
          { source: "1", target: "2" },
          { source: "1", target: "3" },
        ],
        groups: [{ id: "12", name: "子流程1", children: ["1", "2", "3"] }],
      });
      const dag = new DAGLayout({
        graph: g,
        rankDir: "LR",
        nodeSep: 80,
        edgeSep: 20,
        rankSep: 100,
      });

      g.set("layout", dag);
      new NodeMover(g, {
        group: true,
      });
      g.refresh();
      g.fitView();
      setGraph(g);
    }, []);

    function setNode(node: Node) {
      let icon: any = null;
      if (node.get("childNodes")) {
        icon = (
          <IconExpand
            style={{ position: "absolute", left: 126, top: 4 }}
            onClick={() => {
              expandNode(node);
            }}
          />
        );
      }
      return (
        <div
          style={{
            width: 116,
            borderRadius: 4,
            paddingLeft: 12,
            paddingRight: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            border: "1px solid #ccc",
            lineHeight: "40px",
            textAlign: "center",
            backgroundColor: "#fff",
          }}
        >
          {node.get("name")}
          {icon}
        </div>
      );
    }

    function expandNode(node: Node) {
      if (!graph) {
        return;
      }
      // 展开分组
      const group = GroupUtils.expandGroupNode(graph, node);
      // 重布局
      graph.get("layout").layout();
      graph.refresh();
      // 聚焦分组，以防用户焦点丢失
      graph.focus(group);
    }

    function collapseGroup(group: Group) {
      if (!graph) {
        return;
      }
      // 收起分组为节点
      const groupNode = GroupUtils.collapseGroup(graph, group);
      // 重布局
      graph.get("layout").layout();
      graph.refresh();
      // 聚焦节点，以防用户焦点丢失
      graph.focus(groupNode);
      return groupNode;
    }

    function setGroupTitle(group: Group) {
      return <TitleEditor group={group} />;
    }

    return (
      <div style={{ width: 1000, height: 600 }} id="viewerExample">
        {graph && (
          <Viewer
            // responsiveNode
            // onResizeNodesFinished={onResizeNodesFinished}
            graph={graph}
            setNode={setNode}
            setGroupTitle={setGroupTitle}
            // hideDetails={{ ratio: 0.2, getNodeStyles }}
          />
        )}
      </div>
    );
  };
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
