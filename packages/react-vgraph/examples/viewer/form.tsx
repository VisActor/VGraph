import React, { useEffect, useState, useRef } from "react";
import { render } from "react-dom";
import { Collapse, Form, Input, Select } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import {
  Graph,
  panZoom,
  dragCanvas,
  DAGLayout,
  Stack,
  AddCommand,
  SelectCommand,
  RemoveCommand,
  CopyCommand,
  PasteCommand,
  UpdateCommand,
  CutCommand,
  getDefaultShortcuts,
  MoveNodeCommand,
  Grid,
  Router,
  NodeMover,
  EdgeEditor,
  Shortcuts,
  AnchorConfigs,
  Node,
  BBox,
  Minimap,
  Background,
} from "@visactor/vgraph";
import { Viewer } from "../../src";
import "./style.less";

(() => {
  const Sidebar = () => {
    return (
      <div
        style={{
          width: 108,
          border: "1px solid #F0F1F3",
          boxShadow: "0px 1px 8px 0px #00000014",
          padding: 10,
          position: "absolute",
          zIndex: 2,
          background: "#fff",
          textAlign: "center",
        }}
      >
        <b>节点类型</b>
        <div
          style={{
            marginTop: 6,
            border: "1px solid #E1E4EB",
            borderRadius: 4,
            cursor: "grab",
          }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer?.setData("name", "demo");
          }}
        >
          示例节点
        </div>
      </div>
    );
  };
  const App = () => {
    const [graph, setGraph] = useState<null | Graph>(null);
    const formRef = useRef(null);

    useEffect(() => {
      const g = new Graph({
        container: "graphContainer",
        width: 800,
        height: 600,
        minRatio: 0.3,
        maxRatio: 8,
        renderMode: "dom",
        throwError: false,
        setDefaultNode(node: any) {
          return {
            type: "rect",
            strokeStyle: "rgba(1,1,1,0)",
            fillStyle: "rgba(1,1,1,0)",
            radius: 4,
            width: 300,
            height: 100,
            anchors: [
              {
                show: "hover",
                position: [0, 0.5],
                offsets: [-0, 0],
                // size: 8,
                // setStyles: (a: any) => {
                //   return { fillStyle: 'rgba(1,1,1,0)', strokeStyle: 'rgba(1,1,1,0)' };
                // },
              },
              {
                show: "hover",
                position: [1, 0.5],
                offsets: [0, 0],
                // size: 8,
                // setStyles: (a: any) => {
                //   return { fillStyle: 'rgba(1,1,1,0)', strokeStyle: 'rgba(1,1,1,0)' };
                // },
              },
            ],
          };
        },
        setDefaultEdge(edgeData: any) {
          return {
            type: edgeData.target ? "turningLine" : "line",
            endArrow: true,
            radius: 10,
            hitWidth: 6,
          };
        },
        setEdgeStateStyles(state: string) {
          if (state === "select") {
            return { strokeStyle: "#3073F2" };
          }
        },
      });
      // 平移缩放手势
      g.addBehavior(panZoom);
      // 拖拽画布
      g.addBehavior(dragCanvas);
      // 拖拽节点

      const stack = new Stack(g, {
        commands: {
          add: AddCommand,
          select: SelectCommand,
          remove: RemoveCommand,
          copy: CopyCommand,
          cut: CutCommand,
          paste: PasteCommand,
          moveNode: MoveNodeCommand,
          update: UpdateCommand,
        },
      });

      g.on("edge:click", (e) => {
        stack.execute("select", { selections: [e.target] });
      });

      g.on("node:contextmenu", (e) => {
        stack.execute("select", { selections: [e.target] });
        stack.execute("remove");
      });

      g.on("node:click", (e) => {
        stack.execute("select", { selections: [e.target] });
      });

      g.on("canvas:click", () => {
        stack.execute("select", { selections: [] });
      });

      const gridComponent = new Grid(g, { step: 10, extraWidth: 5 });
      gridComponent.refresh();
      const router = new Router(gridComponent, { minDist: 20 });
      g.set("router", router);
      new NodeMover(g, {
        router,
        stack,
        alignGrid: false,
        shouldTrigger(ev: any, triggerShape: any) {
          if (!triggerShape) {
            return false;
          }
          if (["INPUT", "TEXTAREA"].includes(triggerShape.tagName)) {
            return false;
          }
          return !triggerShape.classList.contains("vgraph-viewer-anchor");
        },
        onDrop() {},
      });
      new Background(g, { type: "dot" });
      new EdgeEditor(g, {
        router,
        stack,
        magnet: true,
        magnetAnchorStyles: {
          // lineWidth: 2,
          // strokeStyle: '#f50'
        },
        // 这里可以控制显示的锚点，下面是只显示节点左侧锚点的逻辑，注释掉则都可以连接
        // showAnchors: (anchor: AnchorConfigs) => anchor.index === 0,
        shouldTrigger(ev: any, triggerShape: any) {
          if (!triggerShape) {
            return false;
          }
          return triggerShape.classList.contains("vgraph-viewer-anchor");
        },
        shouldDrop: (source: Node, target: Node) => {
          return !!source && !!target;
        },
      });
      const shortcuts = getDefaultShortcuts(stack);
      new Shortcuts(shortcuts);

      // 写这句就是继续编辑/恢复数据之类的功能，不写就是新建
      // g.data(data);
      const dag = new DAGLayout({
        graph: g,
        rankDir: "LR",
        nodeSep: 30,
        rankSep: 150,
        allControlPoints: true,
      });
      g.set("layout", dag);
      g.set("stack", stack);
      g.refresh();
      (window as any).graph = g;
      // g.on('node:click', (e) => {
      //   console.log(e.target, e);
      // });

      const canvas = g.getCanvasDom();

      canvas.ondragover = (e: any) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      };

      canvas.ondrop = (e: any) => {
        const { clientX, clientY } = e;
        const point = g.clientToCanvas(clientX, clientY);
        stack.execute("add", {
          configs: {
            x: point.x,
            y: point.y,
            name: `新增节点${g.getNodes().length}`,
            taskType: e.dataTransfer.getData("taskType"),
          },
        });
      };

      setGraph(g);

      const minimap = new Minimap(g, {
        container: "minimap",
        width: 200,
        height: 100,
        type: "delegate",
        showEdges: true,
        getNodeStyles(node) {
          return {
            fillStyle: "#3073F2",
          };
        },
      });
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
                // 这边 update 方法要接 vgraph 的下个版本，才能有效 trigger onChange,remove 是正常的
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
      (formRef.current as any)
        .validate()
        .then((values: Record<string, any>) => {
          console.log(values, graph?.getNodes());
          const data = graph?.getData((entity: any) => {
            if (entity.type === "node") {
              const id = entity.get("id");
              return {
                id,
                x: entity.get("x"),
                y: entity.get("y"),
                name: entity.get("name"),
                taskType: entity.get("taskType"),
                ...values[id],
              };
            }
            return {
              source: entity.get("source"),
              target: entity.get("target"),
            };
          });
          console.log(data);
        });
    }

    function reLayout() {
      const dag = graph?.get("layout");
      dag && dag.layout();
      graph?.refresh();
      graph?.fitView();
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
      if (!graph) {
        return;
      }
      node.set("collapsed", false);
      const { nodes, edges } = node.get("hideData");
      nodes.forEach((nodeData: any) => {
        graph.add("node", nodeData);
      });

      edges.forEach((edgeData: any) => {
        graph.add("edge", edgeData);
      });
    }

    function setNode(node: any) {
      const id = node.get("id");
      let border = "";
      if (node.hasState("attached")) {
        border = "1px solid red";
      } else if (node.hasState("select") || node.hasState("active")) {
        border = "1px solid #3073FF";
      }
      return (
        <div
          className="border"
          style={{
            width: 200,
            position: "relative",
            border,
            borderRadius: 4,
            // padding: '8px',
            background: node.hasState("select") ? "#EDF6FF" : "#fff",
          }}
        >
          <Collapse style={{ maxWidth: 200 }} bordered={false}>
            <Collapse.Item header="个人信息" name="1">
              <Form.Item label="姓名" field={`${id}.name`}>
                <Input />
              </Form.Item>
            </Collapse.Item>
            <Collapse.Item header="教育经历" name="2">
              <Form.Item label="学历" field={`${id}.education`}>
                <Select>
                  {["本科", "专科", "研究生", "博士"].map((value: string) => (
                    <Select.Option key={value} value={value}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="学校"
                field={`${id}.school`}
                style={{ marginTop: 12 }}
              >
                <Input />
              </Form.Item>
            </Collapse.Item>
          </Collapse>
        </div>
      );
    }
    function setAnchor(node: Node, anchor: AnchorConfigs) {
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

    function onResizeNode(node: Node, bbox: BBox) {
      const edges = node.edges;
      const router = graph!.get("router");
      const { left, top, width, height } = bbox;
      graph!.update(node, {
        width,
        height,
        x: node.get("x") + left + width / 2,
        y: node.get("y") + top + height / 2,
      });
      // graph.get('layout').layout();
      edges.forEach((edge) => {
        router.updateEdgePath(edge);
        edge.updatePosition();
      });
      console.log(node, bbox);
      // graph.get('layout').layout();
      // graph.refresh();
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
            graph?.get("stack")?.undo();
          }}
          style={{ position: "relative", left: 140, top: -80, zIndex: 1 }}
        >
          {"撤销"}
        </button>
        <button
          onClick={() => {
            graph?.get("stack")?.redo();
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
          <Sidebar />
          <Form ref={formRef} initialValues={{}}>
            {graph && (
              <Viewer
                localRendering={false}
                responsiveNode
                graph={graph}
                setNode={setNode}
                setAnchor={setAnchor}
                setAnchorClassName={setAnchorClassName}
                hideDetails={{ ratio: 0.2, getNodeStyles }}
                onResizeNode={onResizeNode}
              />
            )}
          </Form>
        </div>
        <div
          id="minimap"
          style={{
            position: "absolute",
            right: 0,
            top: 200,
            width: 200,
            height: 100,
          }}
        ></div>
      </div>
    );
  };
  const rootElement = document.getElementById("root");
  render(<App />, rootElement);
})();
