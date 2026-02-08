import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import {
  Graph,
  DAGLayout,
  AnchorConfigs,
  CommonFlowEditor,
  Node,
} from "@visactor/vgraph";
import { Viewer } from "../../src";
import "./style.less";

const data = {
  nodes: [
    {
      name: "任务1",
      taskType: "condition",
      id: "1",
    },
    {
      name: "任务2",
      taskType: "normal",
      id: "2",
    },
    {
      name: "任务3",
      taskType: "normal",
      id: "3",
    },
    {
      name: "任务4",
      taskType: "normal",
      id: "4",
    },
    {
      name: "任务5",
      taskType: "normal",
      id: "5",
    },
    {
      name: "任务6",
      taskType: "normal",
      id: "6",
    },
    {
      name: "任务7",
      taskType: "normal",
      id: "7",
    },
    {
      name: "任务8",
      taskType: "condition",
      id: "8",
    },
    {
      name: "任务9",
      taskType: "normal",
      id: "9",
    },
    {
      name: "任务10",
      taskType: "normal",
      id: "10",
    },
    {
      name: "任务11",
      taskType: "normal",
      id: "11",
    },
  ],
  edges: [
    {
      source: "1",
      target: "2",
    },
    {
      source: "1",
      target: "3",
    },
    {
      source: "1",
      target: "4",
    },
    {
      source: "1",
      target: "5",
    },
    {
      source: "2",
      target: "8",
    },
    {
      source: "3",
      target: "6",
    },
    {
      source: "6",
      target: "7",
    },
    {
      source: "7",
      target: "8",
    },
    {
      source: "8",
      target: "9",
    },
    {
      source: "8",
      target: "10",
    },
    {
      source: "8",
      target: "11",
    },
  ],
};

(() => {
  const App = () => {
    const [editor, setEditor] = useState<null | CommonFlowEditor>(null);
    const [graph, setGraph] = useState<null | Graph>(null);
    useEffect(() => {
      const editor = new CommonFlowEditor({
        container: "graphContainer",
        graphSize: [800, 600],
        renderMode: "dom",
        setDefaultNode(node: any) {
          return {
            type: "rect",
            strokeStyle: "rgba(1,1,1,0)",
            fillStyle: "rgba(1,1,1,0)",
            radius: 4,
            label: node.id,
            width: 140,
            height: 40,
            anchors: [
              {
                show: "always",
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
            type: edgeData.type || "turningLine",
            endArrow: true,
            radius: 10,
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
      g.set("canvasNode", false);
      g.set("editable", true);
      const stack = editor.getStack();
      g.on("node:contextmenu", (e) => {
        stack.execute("select", { selections: [e.target] });
        stack.execute("remove");
      });

      g.data(data);
      const dag = new DAGLayout({
        graph: g,
        rankDir: "LR",
        nodeSep: 30,
        rankSep: 150,
        allControlPoints: true,
      });
      g.set("layout", dag);
      g.refresh();
      g.fitView();
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

      return () => {
        g.destroy();
      };
    }, []);

    function getContent(entity: any, type: string) {
      if (type === "edge") {
        return (
          <div
            onClick={() => {
              graph?.remove(entity);
            }}
          >
            删除连线
          </div>
        );
      }
      return (
        <div>
          {["编辑节点", "删除节点", "Menu3"].map((item) => (
            <div
              onClick={(e) => {
                // 根据 item 做对应的事情，update,remove....
                // 这边 update 方法要接 xgraph 的下个版本，才能有效 trigger onChange,remove 是正常的
                console.log(item, e);
              }}
              key={item}
              className="trigger-menu-item"
            >
              {item}
            </div>
          ))}
        </div>
      );
    }

    function exportData() {
      const data = graph?.getData((entity: any) => {
        if (entity.type === "node") {
          return {
            id: entity.get("id"),
            x: entity.get("x"),
            y: entity.get("y"),
            name: entity.get("name"),
            taskType: entity.get("taskType"),
          };
        }
        return {
          source: entity.get("source"),
          target: entity.get("target"),
        };
      });
      console.log(JSON.stringify(data));
    }

    function reLayout() {
      const dag = graph?.get("layout");
      dag && dag.layout();
      editor!.refreshEdgesPath();
    }

    function getNodeRelativePos(node: Node) {
      const { x, y } = node.configs;
      return graph!.canvasToViewport(x, y);
    }

    function setNode(node: Node) {
      return (
        <div
          style={{
            width: 140,
            height: 40,
            border: "1px solid #ccc",
            lineHeight: "40px",
            textAlign: "center",
          }}
        >
          {node.get("name")}
        </div>
      );
    }

    function setAnchor(node: Node, anchor: AnchorConfigs) {
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
        <button
          onClick={reLayout}
          style={{ position: "relative", left: 180, top: -80, zIndex: 1 }}
        >
          {"重新布局"}
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
