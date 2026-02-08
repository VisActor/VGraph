import React, { useEffect, useState, useRef } from "react";
import { render } from "react-dom";
import { Graph, Node, AnchorConfigs, CommonFlowEditor } from "@visactor/vgraph";
import { Viewer } from "../../src";
import data from "../static/flow_chart.json";
import "./style.less";

(() => {
  const App = () => {
    const [editor, setEditor] = useState<null | CommonFlowEditor>(null);
    const [graph, setGraph] = useState<null | Graph>(null);
    const viewer = useRef();
    const [value, setValue] = useState("");
    useEffect(() => {
      const editor = new CommonFlowEditor({
        container: "graphContainer",
        graphSize: [800, 600],
        data,
        renderMode: "dom",
        nodeMover: {
          options: {
            getLimitBox(target: Node) {
              const bbox = target.getBBox();
              return {
                left: bbox.left - 30,
                top: bbox.top - 30,
                width: bbox.width + 60,
                height: bbox.height + 60,
              };
            },
            shouldDrop: () => {
              return true;
            },
            // onDrop: (edge: Edge) => {
            //   // 没有连到具体节点，则应新增节点
            //   if (!edge.get('target')) {
            //     const endPoint = edge.get('endPoint');
            //     const node = g.add('node', {
            //       x: endPoint[0],
            //       y: endPoint[1] + 40,
            //       name: '',
            //       temp: true, // 临时节点
            //       relateEdgeId: edge.get('id'),
            //     });
            //     // 将连线指向新节点，计算合适的连线位置
            //     edge.setTarget(node.get('id'));
            //     edge.set('targetAnchor', 0);
            //     editor.components.router.updateEdgePath(edge, true);
            //     edge.updatePosition();
            //   }
            // },
          },
        },
        setDefaultNode(nodeData: any) {
          const anchorConfigs = {
            show: "always",
            size: 6,
          };
          if (nodeData.taskType === "condition") {
            return {
              width: 140,
              height: 60,
              type: "rhombus",
              radius: 4,
              strokeStyle: "#ccc",
              anchors: [
                {
                  ...anchorConfigs,
                  position: [0.5, 0],
                },
                {
                  ...anchorConfigs,
                  position: [0, 0.5],
                  offsets: [8, 0],
                },
                {
                  ...anchorConfigs,
                  position: [1, 0.5],
                  offsets: [-8, 0],
                },
              ],
            };
          }
          return {
            width: 100,
            height: 40,
            strokeStyle: null,
            anchors: [
              {
                ...anchorConfigs,
                position: [0.5, 0],
                temp: nodeData.temp,
              },
              {
                ...anchorConfigs,
                position: [0.5, 1],
                temp: nodeData.temp,
              },
            ],
          };
        },
        setDefaultEdge(edgeData: any) {
          return {
            type: "hLine",
            endArrow: true,
            radius: 6,
            hitWidth: 6,
          };
        },
        setNodeStateStyles(state: string, nodeData: any) {
          if (nodeData.taskType === "condition" && state === "select") {
            return { strokeStyle: "#3073F2" };
          }
          return {};
        },
        setEdgeStateStyles(state: string) {
          if (state === "select") {
            return { strokeStyle: "#3073F2" };
          }
          return {};
        },
      });
      const g = editor.getGraph();
      // 感觉这种指定连接锚点的布局出来会很奇怪，不推荐带布局了
      // const dag = new DAGLayout({
      //   graph: g,
      //   options: {
      //     rankDir: 'LR',
      //     nodeSep: 30,
      //     rankSep: 150,
      //     allControlPoints: true,
      //   },
      // });
      // g.set('layout', dag);
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
          name: "",
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
      const endPoint = edge.get("endPoint");
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
      // 添加节点
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
            ></div>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 4,
                backgroundColor: "#fff",
              }}
            >
              {["normal", "condition"].map((item) => (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    addNode(node, item);
                  }}
                  key={item}
                  style={{ height: 32 }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
      }
      let content = node.get("name");
      if (node.hasState("select") && !content) {
        content = (
          <input
            style={{ width: 88, border: "none" }}
            autoFocus
            onBlur={(e) => {
              e.target.value &&
                editor!.updateNode(node, { name: e.target.value });
            }}
          />
        );
      }
      let border = "1px solid #ccc";
      if (node.hasState("select")) {
        border = "1px solid #3073F2";
      }
      // 条件节点
      if (node.get("taskType") === "condition") {
        return (
          // <div style={{ border, width: 100, height: 100, transform: 'rotate(45deg) skew(-20deg, -20deg)', position: 'absolute', left: 46, top: -4 }}>
          //   <div style={{ transform: 'skew(20deg, 20deg) rotate(-45deg)', position: 'absolute', left: -24, top: 40, width: 150, textAlign: 'center' }}>{node.get('name')}</div>
          // </div>
          <div style={{ padding: "18px 8px", textAlign: "center" }}>
            {content}
          </div>
        );
      }

      return (
        <div
          style={{
            border,
            width: 100,
            height: 38,
            textAlign: "center",
            lineHeight: "40px",
          }}
        >
          {content}
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

    function exportData() {
      console.log(editor?.exportData());
    }

    function updateNode() {
      if (!editor) {
        return;
      }
      const selections = editor.getSelection();
      const graph = editor.getGraph();
      if (selections.node.length === 1) {
        editor.updateNode(graph.getNodeById(selections.node[0]), {
          name: value,
        });
      }
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
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          style={{ position: "relative", left: 200, top: -80, zIndex: 1 }}
        />
        <button
          onClick={updateNode}
          style={{ position: "relative", left: 220, top: -80, zIndex: 1 }}
        >
          更新节点
        </button>
        <div
          style={{ position: "relative", width: 1000, height: 600, top: -30 }}
          id="graphContainer"
        >
          {editor?.getGraph() && (
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
