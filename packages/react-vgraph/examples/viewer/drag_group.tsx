import React, { useEffect, useState, useRef } from "react";
import { render } from "react-dom";
import {
  Graph,
  Node,
  AnchorConfigs,
  CommonFlowEditor,
  Edge,
  DAGLayout,
  GraphEvent,
  brushSelect,
  dragCanvas,
} from "@visactor/vgraph";
import {
  Tabs,
  Typography,
  Tag,
  Collapse,
  Form,
  Input,
  Select,
  Button,
  Modal,
} from "@arco-design/web-react";
import { IconBranch, IconLoop, IconBug } from "@arco-design/web-react/icon";
import "@arco-design/web-react/dist/css/arco.css";
import { Viewer } from "../../src";
import "./style.less";

(() => {
  const App = () => {
    const [editor, setEditor] = useState<null | CommonFlowEditor>(null);
    const [graph, setGraph] = useState<null | Graph>(null);
    useEffect(() => {
      const editor = new CommonFlowEditor({
        container: "graphContainer",
        graphSize: [800, 600],
        router: true,
        renderMode: "dom",
        nodeMover: {
          options: {
            group: true,
            shouldDrop(e, target) {
              return true;
            },
          },
        },
        setDefaultNode(node: any) {
          return {
            width: 140,
            height: node.temp ? 80 : 40,
            anchors: node.temp
              ? null
              : [
                  {
                    show: "hover",
                    position: [0, 0.5],
                  },
                  {
                    show: "hover",
                    position: [1, 0.5],
                  },
                ],
          };
        },
        setDefaultEdge(edgeData: any) {
          return {
            type: "line",
            endArrow: true,
            radius: 6,
            hitWidth: 6,
          };
        },
        setEdgeStateStyles(state: string) {
          if (state === "select") {
            return { strokeStyle: "#3073F2" };
          }
          return {};
        },
        setDefaultGroup(data) {
          return {
            strokeStyle: "#D9D9D9",
            fillStyle: "#FAFBFC",
            radius: 4,
            linkNode: true,
          };
        },
        setGroupStateStyles(state) {
          if (state === "select") {
            return {
              strokeStyle: "#5678D6",
            };
          }
          return {};
        },
      });
      const g = editor.getGraph();

      g.on("group:click", (e: GraphEvent) => {
        editor.getStack().execute("select", { selections: [e.target] });
      });

      g.addBehavior(brushSelect, {
        targets: ["group", "node", "edge"],
        onSelect(item: Node | Edge) {
          if (item.type === "edge") {
            if (
              (item.source as Node).states.includes("select") &&
              (item.target as Node).states.includes("select")
            ) {
              item.toFront();
              item.setState("select");
              return true;
            } else {
              item.removeState("select");
              return false;
            }
          }
          item.toFront();
          item.setState("select");
          return true;
        },
        onDeselect(item: Node | Edge) {
          item.removeState("select");
        },
        onChange(selected: any[]) {
          editor.getStack().execute("select", { selections: selected });
        },
      });

      (window as any).editor = editor;
      (window as any).graph = g;

      const canvas = g.getCanvasDom();
      canvas.ondragover = (e: any) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      };

      canvas.ondrop = (e: any) => {
        const { clientX, clientY } = e;
        const point = g.clientToCanvas(clientX, clientY);
        editor.addNode({
          x: point.x,
          y: point.y,
          name: `新增节点${g.getNodes().length}`,
          taskType: e.dataTransfer.getData("taskType"),
        });
      };

      setEditor(editor);
      setGraph(g);
      g.removeBehavior("dragCanvas");
      g.addBehavior(dragCanvas, {
        shouldTrigger(e: GraphEvent) {
          if (e.nativeEvent && (e.nativeEvent as MouseEvent).buttons === 1) {
            return false;
          }
          return true;
        },
      });

      return () => {
        editor.destroy();
      };
    }, []);

    function setNode(node: Node) {
      let border = "1px solid #E1E4EB";
      if (node.hasState("select")) {
        border = "1px solid #3073F2";
      }

      let content = null as any;
      switch (node.get("taskType")) {
        case "condition":
          content = (
            <IconBranch
              style={{ background: "#FF9D22", color: "#fff", marginRight: 4 }}
            />
          );
          break;
        case "normal":
          content = (
            <IconBug
              style={{ background: "#78AF4B", color: "#fff", marginRight: 4 }}
            />
          );
          break;
        default:
          break;
      }
      return (
        <div
          className="xgraph-react-custom-node"
          style={{ border, height: node.get("height") }}
        >
          {content}
          {node.get("name")}
        </div>
      );
    }

    function setAnchor(node: Node, anchor: any) {
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

    function exportData() {
      console.log(editor?.exportData());
    }

    return (
      <div>
        <div
          style={{
            position: "relative",
            left: 0,
            top: 0,
            width: 100,
            height: 80,
            border: "1px solid #ddd",
            zIndex: 1,
          }}
          onDragStart={(e) => {
            e.dataTransfer?.setData("taskType", (e.target as any).innerText);
          }}
        >
          {["normal", "condition"].map((task: string) => (
            <div
              draggable
              style={{
                cursor: "grab",
                height: 30,
                border: "1px solid #ddd",
                marginBottom: 12,
              }}
              key={task}
            >
              {task}
            </div>
          ))}
        </div>
        <button
          onClick={exportData}
          style={{ position: "relative", left: 120, top: -80, zIndex: 1 }}
        >
          导出数据
        </button>

        <button
          onClick={() => {
            editor?.undo();
          }}
          style={{ position: "relative", left: 140, top: -80, zIndex: 1 }}
        >
          撤销
        </button>
        <button
          onClick={() => {
            editor?.redo();
          }}
          style={{ position: "relative", left: 160, top: -80, zIndex: 1 }}
        >
          重做
        </button>
        <button
          onClick={() => {
            if (!editor) {
              return null;
            }
            const { node, group } = editor.getSelection();
            const graph = editor.getGraph();
            let shouldGroup = true;
            for (const id of node) {
              const n = graph.getNodeById(id);
              if (n?.belong) {
                shouldGroup = false;
              }
            }
            // 选中的节点已有分组，不继续执行
            if (!shouldGroup) {
              return;
            }
            for (const id of group) {
              const g = graph.getGroupById(id);
              if (g?.belong) {
                shouldGroup = false;
              }
            }
            // 选中的分组已有分组，不继续执行
            if (!shouldGroup) {
              return;
            }
            const id = graph.getEntityId({}, "group");
            editor.stack?.execute("add", {
              type: "group",
              configs: {
                id: id,
                children: node.concat(group),
              },
            });
          }}
          style={{ position: "relative", left: 180, top: -80, zIndex: 1 }}
        >
          成组
        </button>
        <button
          onClick={() => {
            if (!editor) {
              return;
            }
            const { group } = editor.getSelection();
            // 单选分组时生效
            if (group.length > 1) {
              return;
            }
            editor.stack?.execute("remove", { ungroup: true });
          }}
          style={{ position: "relative", left: 200, top: -80, zIndex: 1 }}
        >
          拆分
        </button>
        <div
          style={{ position: "relative", width: 1000, height: 600, top: -30 }}
          id="graphContainer"
        >
          {editor && (
            <Viewer
              graph={editor.getGraph()}
              setNode={setNode}
              setAnchor={setAnchor}
              setAnchorClassName={setAnchorClassName}
              hideDetails={{ ratio: 0.2, getNodeStyles }}
              localRendering={false}
            />
          )}
        </div>
      </div>
    );
  };
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
})();
