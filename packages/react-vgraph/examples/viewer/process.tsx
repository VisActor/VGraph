import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DAGFlowEditor,
  attachableDragNode,
  highlightRelations,
  generateSnapshot,
  Layer,
  registerEdge,
  Image,
  Graph,
  GraphEvent,
  Node,
  Path,
} from "@visactor/vgraph";
import { Trigger } from "@arco-design/web-react";
import {
  IconPlusCircle,
  IconCloseCircle,
  IconDownload,
} from "@arco-design/web-react/icon";
import "@arco-design/web-react/dist/css/arco.css";
import { Viewer } from "../../src";
import data from "../static/data.json";
import "./style.less";

function register() {
  registerEdge("iconEdge", {
    extends: "vLine",
    drawCurrentLabel: false,
    // edgeData 是一个连线实例通过 setDefaultEdge 之后 merge 的全量连线配置
    getConfigsForShape(edgeData: { [k: string]: any }) {
      // 大多数情况下直接使用内置连线绘制无须修改配置，相应的更新时也无须新增更新步骤
      return edgeData;
    },
    shape(layer: Layer, edgeConfigs: { [k: string]: any }) {
      const edge = layer.find((shape: any) => shape.get("_keyShape")) as Path;
      // 获取连线中心点定位
      const p = edge.getPointAt(0.5);
      const icon = new Image({
        left: p.x - 8,
        top: p.y - 8,
        width: 16,
        height: 16,
        url: "https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/dev-demos/file_18f5710dba932.svg",
      });
      // 先隐藏，hover 连线时出现
      icon.hide();
      layer.add(icon);
      layer.set("icon", icon);
    },
    // 节点位置更新引发连线更新，icon 位置随之更新。如果不需要更新 icon 位置就可以不用覆写此方法
    afterUpdatePath(layer: Layer, configs: { [k: string]: any }) {
      const edge = layer.find((shape: any) => shape.get("_keyShape")) as Path;
      // 在 shape 方法中将 icon 保存到了 layer 上，方便这里取出更新
      const icon = layer.get("icon");
      const p = edge.getPointAt(0.5);
      icon.set({ left: p.x - 8, top: p.y - 8 });
    },
  });
}

(() => {
  const App = () => {
    const [editor, setEditor] = useState<DAGFlowEditor | null>(null);
    const [graphData, setGraphData] = useState<any>(null);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
      register();
      const inst = new DAGFlowEditor({
        container: "viewerExample",
        renderMode: "dom",
        data: {
          nodes: [
            {
              id: "root",
              label: "订单金额",
              name: "订单金额",
            },
          ],
          edges: [],
        },
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
            label: "12",
            anchors: [
              [0.5, 0],
              [0.5, 1],
            ],
          };
        },
        setDefaultEdge(edgeData: any) {
          return {
            // type: 'lineCurve',
            type: "iconEdge",
            label: edgeData.label || "xxxx,",
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
      const graph = inst.getGraph();
      graph.set("canvasNode", false);
      graph.resetMatrix();
      graph.alignView("ct");
      graph.on("edge:mouseenter", (e) => {
        const edge = e.target;
        const icon = edge.layer.get("icon");
        icon.show();
        graph.draw();
      });

      // 鼠标移出 icon 消失
      graph.on("edge:mouseleave", (e) => {
        const edge = e.target;
        const icon = edge.layer.get("icon");
        icon.hide();
        graph.draw();
      });
      graph.on("edge:click", (e) => {
        graph.update(e.target, {
          label: "11111",
        });
      });

      graph.addBehavior(highlightRelations);
      // 拖拽交互
      let attached: Node | null = null;
      graph.addBehavior(attachableDragNode, {
        delegate: false,
        tempEdgeStyles: {
          lineDash: [3, 3],
          lineWidth: 1.5,
          strokeStyle: "#3073F2",
        },
        // 可以在此判断当前节点是否可被拖拽, 被拖拽节点是 e.target
        shouldTrigger(e: GraphEvent, shape: any) {
          console.log(e.target);
          return true;
        },
        onDragStart(node: Node) {
          setDragging(true);
        },
        // 拖拽过程中判断可以移动到哪个节点上
        findClosestNode(target: Node) {
          const { x, y } = target.configs;
          let minNode: Node | null = null;
          let minDist = Infinity;
          graph.disableAutoDraw();
          if (attached) {
            attached.removeState("attached");
          }
          graph.getNodes().forEach((node: Node) => {
            const id = node.get("id");
            // 在这里可以根据节点的类型判断是否可以连，现在的逻辑是节点上方最近的节点
            if (id !== target.get("id") && node.get("y") <= y) {
              const dist = Math.sqrt(
                (x - node.get("x")) * (x - node.get("x")) +
                  (y - node.get("y")) * (y - node.get("y"))
              );
              if (dist < minDist) {
                minNode = node;
                minDist = dist;
              }
            }
          });
          attached = minNode;
          (attached as Node | null)?.setState("attached");
          graph.enableAutoDraw(true);
          return minNode;
        },
        getTargetLinkPoint(node: Node, toNode: Node) {
          const { x, width, y, height } = toNode.configs;
          let posX = node.get("x");
          let posY = y + height / 2;

          if (x - width / 2 >= node.get("x")) {
            posX = x - width / 2;
            posY = y;
          }
          if (x + width / 2 <= node.get("x")) {
            posX = x + width / 2;
            posY = y;
          }
          return [posX, posY];
        },
        // 是否可以移动到当前位置
        // 因为之前有过 closest node 的判断，一般可以直接返回 true 这里主要可以用来清除节点拖拽的临时状态
        shouldDrop(e: GraphEvent, node: Node, relativeNode: Node) {
          setDragging(false);
          node.removeState("dragging");
          attached?.removeState("attached");
          attached = null;
          return true;
        },
        onDrop(node: Node, parent: Node) {
          const pos = getAlignPosition(node, parent);
          inst.moveNode(node.get("id"), parent.get("id"), pos);
          setDragging(false);
        },
      });
      //   graph.on('change', () => {
      //   console.log('onchange, =---=-=-=-====')
      // });
      //   graph.on('layout:end', () => {
      //   console.log('layout, =---=-=-=-====')
      // });
      // graph.addBehavior(attachableDragNode);
      // inst.setData(data);

      setTimeout(() => {
        setGraphData(data);
      }, 1000);
    }, []);

    useEffect(() => {
      if (!editor || !graphData) {
        return;
      }
      editor.setData(data);
      const graph = editor.getGraph();
      graph.resetMatrix();
      graph.alignView("ct");
    }, [editor, graphData]);

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
                // background: '#fff',
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
            <IconPlusCircle
              style={{
                position: "absolute",
                left: 132,
                top: 32,
                color: "#3073F2",
                backgroundColor: "#FFF",
              }}
              onClick={(e) => {
                e.stopPropagation();
                batchChange(node);
              }}
            />
          </div>
        </Trigger>
      );
    }

    function getNodeStyles(node: Node) {
      return {
        backgroundColor: "#3073FF",
      };
    }

    function setNodeClassName(node: Node) {
      return node.get("id");
    }

    function getAlignPosition(
      node: Node,
      relativeNode: Node,
      serial?: boolean
    ) {
      const { x, width } = relativeNode.configs;
      let pos: any = "target";
      if (x - width / 2 >= node.get("x")) {
        pos = "siblingBefore";
      }
      if (x + width / 2 <= node.get("x")) {
        pos = "siblingAfter";
      }
      return pos;
    }

    function batchChange(target: Node) {
      if (!editor) {
        return;
      }

      const formerData = generateSnapshot(editor.graph);
      const ranks = getRanks(editor.graph);
      const node = target;
      const rank = node.get("rank");
      const maxRank = Math.max(...Object.keys(ranks).map((d) => parseInt(d)));
      const maxRankNode = ranks[maxRank][0];
      let sourceNode = node;
      for (let i = rank + 1; i < maxRank; i++) {
        const newNode = editor.graph.add("node", {});
        editor.graph.add("edge", {
          source: sourceNode.get("id"),
          target: newNode.get("id"),
        });
        sourceNode = newNode;
      }
      editor.graph.add("edge", {
        source: sourceNode.get("id"),
        target: maxRankNode.get("id"),
      });
      editor.reLayout(node.get("id"));
      const currentData = generateSnapshot(editor.graph);
      editor.batchChange({ formerData, currentData });
    }
    function getRanks(graph: Graph) {
      const ranks: Record<string, Node[]> = {};
      graph.getNodes().forEach((node: any) => {
        delete node.baryCenter;
        const rank = node.get("rank");
        if (ranks[rank] === undefined) {
          ranks[rank] = [];
        }
        ranks[rank].push(node);
      });
      return ranks;
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
            graph.focus(selected, true);
          }}
        >
          focus selected node
        </button>
        <div style={{ width: 1000, height: 600 }} id="viewerExample">
          {editor && (
            <Viewer
              graph={editor.getGraph()}
              setNode={setNode}
              setNodeClassName={setNodeClassName}
              hideDetails={{ ratio: 0.2, getNodeStyles }}
            />
          )}
        </div>
      </>
    );
  };
  const rootElement = document.getElementById("root");
  const root = createRoot(rootElement!);
  root.render(<App />);
})();
