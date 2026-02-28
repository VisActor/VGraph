import React, { useEffect, useState, useRef } from "react";
import { render } from "react-dom";
import {
  Graph,
  Node,
  AnchorConfigs,
  CommonFlowEditor,
  Edge,
  DAGLayout,
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
        edgeEditor: {
          options: {
            editTerminal: true,
            shouldDrop: () => {
              return true;
            },
            onDrop: (edge: Edge) => {
              // 没有连到具体节点，则应新增节点
              if (!edge.get("target")) {
                const endPoint = edge.get("endPoint");
                const node = g.add("node", {
                  x: endPoint[0] + 100, // 连线末梢 + width / 2
                  y: endPoint[1],
                  name: `新增表`,
                  temp: true,
                  cols: [],
                  relateEdgeId: edge.get("id"),
                });
                editor.selectNode(node);
                // 将连线指向新节点，计算合适的连线位置
                edge.setTarget(node.get("id"));
                edge.set("targetAnchor", 0);
                // editor.components.router.updateEdgePath(edge, true);
                edge.updatePosition();
              }
            },
          },
        },
        setDefaultNode(node: any) {
          return {
            width: 140,
            height: node.temp ? 80 : 40,
            strokeStyle: null,
            anchors: node.temp
              ? null
              : [
                  {
                    show: "hover",
                    position: [0, 0.5],
                    temp: node.temp,
                  },
                  {
                    show: "hover",
                    position: [1, 0.5],
                    temp: node.temp,
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
      });
      const g = editor.getGraph();
      g.on("edge:click", (e) => {
        const edge = e.target;
        Modal.confirm({
          title: "编辑关系",
          content: <Input defaultValue={edge.get("label" || "")} id="input" />,
          onOk: () => {
            const value = (document.querySelector("#input") as HTMLInputElement)
              .value;
            g.update(edge, { label: value });
          },
        });
      });

      const dag = new DAGLayout({
        graph: g,
        rankDir: "LR",
        nodeSep: 30,
        rankSep: 150,
        allControlPoints: true,
      });
      g.set("layout", dag);
      (window as any).editor = editor;
      (window as any).graph = g;
      g.on("node:click", (e) => {
        console.log(e.target, e);
      });

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
      return () => {
        editor.destroy();
      };
    }, []);

    function cancelAddNode(node: Node) {
      if (!graph || !editor) {
        return;
      }
      graph.remove(node);
      editor.undo();
    }

    function addNode(node: Node, taskType: string) {
      if (!graph || !editor) {
        return;
      }
      const edge = graph.getEdgeById(node.get("relateEdgeId"));
      const configs = edge.configs;
      // 恢复添加前初始态
      editor.undo();
      graph.remove(node);
      // 留存 undo 快照
      const formerData = editor.getSnapshot();
      // 添加节点
      const n = graph.add("node", {
        x: node.get("x"),
        y: node.get("y"),
        name: node.get("name"),
        taskType,
      });
      delete configs.endPoint;
      configs.target = n.get("id");
      // 添加连线
      graph.add("edge", configs);
      editor.getStack().execute("select", { selections: [n] });
      // 留存 redo 快照
      const currentData = editor.getSnapshot();
      editor.batchChange({ formerData, currentData });
    }

    function setNode(node: Node) {
      let border = "1px solid #E1E4EB";
      if (node.hasState("select")) {
        border = "1px solid #3073F2";
      }
      if (node.get("temp")) {
        return (
          <div>
            <div
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                zIndex: -1,
              }}
              onClick={(e: any) => {
                e.stopPropagation();
                cancelAddNode(node);
              }}
              onMouseDown={(e: any) => {
                debugger;
                e.stopPropagation();
              }}
            ></div>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 4,
                backgroundColor: "#fff",
              }}
            >
              {[
                {
                  type: "condition",
                  name: "条件节点",
                  icon: (
                    <IconBranch
                      style={{
                        background: "#FF9D22",
                        color: "#fff",
                        marginRight: 4,
                      }}
                    />
                  ),
                },
                {
                  type: "loop",
                  name: "循环节点",
                  icon: (
                    <IconLoop
                      style={{
                        background: "#FFC528",
                        color: "#fff",
                        marginRight: 4,
                      }}
                    />
                  ),
                },
                {
                  type: "debug",
                  name: "调试节点",
                  icon: (
                    <IconBug
                      style={{
                        background: "#78AF4B",
                        color: "#fff",
                        marginRight: 4,
                      }}
                    />
                  ),
                },
              ].map((item: any, i: number) => {
                return (
                  <div
                    style={{
                      padding: "4px 12px",
                      borderTop: i === 0 ? "none" : "1px solid #ccc",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addNode(node, item.type);
                    }}
                    key={item.type}
                  >
                    {item.icon}
                    {item.name}
                  </div>
                );
              })}
            </div>
          </div>
        );
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
        case "loop":
          content = (
            <IconLoop
              style={{ background: "#FFC528", color: "#fff", marginRight: 4 }}
            />
          );
          break;
        case "debug":
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
          className="vgraph-react-custom-node"
          style={{ border, height: node.get("height") }}
        >
          {content}
          {node.get("name")}
        </div>
      );
    }

    function setAnchor(node: Node, anchor: any) {
      if (anchor.temp) {
        return null;
      }
      return <div />;
    }

    function setAnchorClassName(node: Node, anchor: AnchorConfigs) {
      const classNames: string[] = [];
      if (anchor.position?.[0] === 0) {
        classNames.push("vgraph-anchor-left");
      }
      if (anchor.position?.[1] === 0) {
        classNames.push("vgraph-anchor-top");
      }
      if (anchor.position?.[0] === 1) {
        classNames.push("vgraph-anchor-right");
      }
      if (anchor.position?.[1] === 1) {
        classNames.push("vgraph-anchor-bottom");
      }
      if (anchor.magnet) {
        classNames.push("vgraph-anchor-magnet");
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
          {"撤销"}
        </button>
        <button
          onClick={() => {
            editor?.redo();
          }}
          style={{ position: "relative", left: 160, top: -80, zIndex: 1 }}
        >
          {"重做"}
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
