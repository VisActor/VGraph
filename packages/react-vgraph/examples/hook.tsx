import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import {
  IconPlusCircle,
  IconCloseCircle,
  IconDownload,
} from "@arco-design/web-react/icon";
import { Trigger, Drawer } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import {
  DAGFlowEditor,
  Graph,
  highlightRelations,
  Node,
  Edge,
} from "@visactor/vgraph";
import {
  Viewer,
  useNodes,
  useEdges,
  useZoomRatio,
  useSelections,
} from "../src";
import "./viewer/style.less";

(() => {
  const App = () => {
    const [editor, setEditor] = useState<null | DAGFlowEditor>(null);
    const [graph, setGraph] = useState<null | Graph>(null);
    const nodes = useNodes(graph!);
    const edges = useEdges(graph!);

    useEffect(() => {
      const inst = new DAGFlowEditor({
        container: "viewerExample",
        graphSize: [800, 600],
        scroller: {
          enable: false,
        },
        layout: {
          rankDir: "TB",
          rankSep: 50,
          ignoreControlPoints: true,
        },
        mask: {
          enable: false,
        },
        onChange() {
          // viewer.current.refresh(true);
        },
        setDefaultNode(nodeData: any) {
          return {
            width: 140,
            height: 40,
            strokeStyle: null,
            anchors: [
              [0.5, 0],
              [0.5, 1],
            ],
          };
        },
        setDefaultEdge(edgeData: any) {
          return {
            // type: 'lineCurve',
            type: edgeData.temp ? "hLine" : "vLine",
            styles: {
              curvePosition: 1,
              curveOffset: -25,
            },
          };
        },
        setEdgeStateStyles(state: string) {
          if (state === "active") {
            return {
              strokeStyle: "#3073F2",
            };
          }
          return {};
        },
      });
      setEditor(inst);
      const g = inst.getGraph();
      setGraph(inst.getGraph());

      g.on("canvas:click", () => {
        inst.stack.execute("select", { selections: [] });
      });
      g.addBehavior(highlightRelations);
      return () => {
        inst.destroy();
      };
    }, []);

    function setNode(node: any) {
      const id = node.get("id");
      let border = "";
      if (node.hasState("attached")) {
        border = "1px solid red";
      } else if (node.hasState("select") || node.hasState("active")) {
        border = "1px solid #3073FF";
      }
      return (
        <Trigger
          popupAlign={{ top: 8 }}
          popup={() => (
            <div
              style={{
                border: "1px solid #E1E4EB",
                borderRadius: 4,
                padding: "4px",
                background: "#fff",
                boxShadow: "0px 8px 8px 0px #21252C0A",
              }}
            >
              <IconDownload style={{ color: "#89909D" }} />
              <span style={{ padding: "0 4px", color: "#E1E4E8" }}>|</span>
              <IconCloseCircle
                style={{ color: "#89909D" }}
                onClick={(e) => {
                  e.stopPropagation();
                  editor?.removeNode(id);
                }}
              />
            </div>
          )}
          clickToClose
          showArrow={false}
          position="tr"
        >
          <div
            className="border"
            style={{
              position: "relative",
              border,
              borderRadius: 4,
              width: 140,
              height: 40,
              padding: "8px 12px",
              background: node.hasState("select") ? "#EDF6FF" : "#fff",
            }}
          >
            {id}
            <IconPlusCircle
              style={{
                position: "absolute",
                left: -8,
                top: 12,
                color: "#3073F2",
                backgroundColor: "#FFF",
              }}
              onClick={(e) => {
                e.stopPropagation();
                editor?.addSiblingBefore(id);
              }}
            />
            <IconPlusCircle
              style={{
                position: "absolute",
                left: 132,
                top: 12,
                color: "#3073F2",
                backgroundColor: "#FFF",
              }}
              onClick={(e) => {
                e.stopPropagation();
                editor?.addSiblingAfter(id);
              }}
            />
            <IconPlusCircle
              style={{
                position: "absolute",
                left: 62,
                top: -8,
                color: "#3073F2",
                backgroundColor: "#FFF",
              }}
              onClick={(e) => {
                e.stopPropagation();
                editor?.addSource(id);
              }}
            />
            <IconPlusCircle
              style={{
                position: "absolute",
                left: 62,
                top: 32,
                color: "#3073F2",
                backgroundColor: "#FFF",
              }}
              onClick={(e) => {
                e.stopPropagation();
                editor?.addTarget(id);
              }}
            />
          </div>
        </Trigger>
      );
    }

    return (
      <>
        <button
          onClick={() => {
            editor!.undo();
          }}
        >
          undo
        </button>
        <button
          onClick={() => {
            editor!.redo();
          }}
        >
          redo
        </button>
        <button
          onClick={() => {
            const graph = editor!.getGraph();
            const selected =
              editor!.getSelectedNode() || graph.getNodeById("initial");
            graph.focus(selected);
          }}
        >
          focus selected node
        </button>
        {nodes?.length}个节点, {edges?.length}连线
        {editor && <Viewport graph={editor.getGraph()} />}
        <div style={{ width: 1000, height: 600 }} id="viewerExample">
          {editor && <Viewer graph={editor.getGraph()} setNode={setNode} />}
        </div>
        {editor && <RightDrawer graph={editor.getGraph()} />}
      </>
    );
  };

  const Viewport = ({ graph }: { graph: Graph }) => {
    const [ratio, setRatio] = useZoomRatio(graph);

    return (
      <>
        <span
          onClick={() => {
            setRatio(ratio - 0.1);
          }}
        >
          -
        </span>
        {Math.round(ratio * 100) + "%"}
        <span
          onClick={() => {
            setRatio(ratio + 0.1);
          }}
        >
          +
        </span>
      </>
    );
  };

  const RightDrawer = ({ graph }: { graph: Graph }) => {
    const [visible, setVisible] = useState(false);
    const [node, setNode] = useState<Node | null>(null);
    const selections = useSelections(graph);
    useEffect(() => {
      if (selections.length === 0) {
        setVisible(false);
        return;
      }
      const selectedNode = selections.filter(
        (entity) => entity.type === "node"
      );
      if (selectedNode.length === 0) {
        setVisible(false);
        return;
      }
      if (!node || selectedNode[0].get("id") !== node.get("id")) {
        setNode(selectedNode[0] as Node);
        if (!visible) {
          setVisible(true);
        }
      }
    }, [selections]);

    return (
      <Drawer
        visible={visible}
        title={<span>编辑节点信息</span>}
        onOk={() => {
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
      ></Drawer>
    );
  };
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
})();
