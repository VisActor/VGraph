import {
  DAGFlowEditor,
  GraphEvent,
  Node,
  uuid,
  Graph,
  registerEdge,
  highlightRelations,
  attachableDragNode,
} from "../../src";
import { IRanks } from "../../src/layouts/dag/rank";

const RANK_SEP = 50;

registerEdge("lineCurve", {
  getPath(configs: any) {
    const { startPoint, endPoint } = configs;
    const path = [] as (string | number)[][];
    path.push(["M", startPoint[0], startPoint[1]]);
    if (startPoint[0] === endPoint[0]) {
      path.push(["L", endPoint[0], endPoint[1]]);
      return path;
    }
    if (endPoint[1] - startPoint[1] > 50) {
      path.push(["L", startPoint[0], endPoint[1] - RANK_SEP]);
    }
    path.push([
      "C",
      startPoint[0],
      endPoint[1] - RANK_SEP / 2,
      endPoint[0],
      endPoint[1] - RANK_SEP / 2,
      endPoint[0],
      endPoint[1],
    ]);
    return path;
  },
  updateShapes() {},
});

(() => {
  const div = document.createElement("div");
  div.id = "container";
  div.style.border = "1px solid #666";
  div.style.width = "840px";
  div.style.height = "640px";
  div.style.overflow = "auto";
  document.body.append(div);
  const btnUndo = document.createElement("button");
  btnUndo.textContent = "undo";
  div.appendChild(btnUndo);

  const btnRedo = document.createElement("button");
  btnRedo.textContent = "redo";
  div.appendChild(btnRedo);
  const editor = new DAGFlowEditor({
    container: div,
    graphSize: [800, 600],
    scroller: {
      enable: false,
    },
    layout: {
      rankDir: "TB",
      rankSep: RANK_SEP,
    },
    // mask: {
    //   enable: true
    // },
    onChange() {
      console.log("change========");
    },
    setDefaultNode(nodeData: any) {
      const iconStyles = {
        icon: "&#xe613;",
        fillStyle: "#3073ff",
      };
      const setBgStyles = () => ({
        type: "circle",
        size: 16,
        styles: {
          fillStyles: "#fff",
        },
      });
      return {
        width: 140,
        height: 40,
        label: nodeData.id,
        anchors: [
          [0.5, 0],
          [0.5, 1],
        ],
        icons: [
          {
            setStyles() {
              return { ...iconStyles, action: "source" };
            },
            setBgStyles,
            position: [0.5, 0],
            show: "hover",
          },
          {
            setStyles() {
              return { ...iconStyles, action: "target" };
            },
            setBgStyles,
            position: [0.5, 1],
            show: "hover",
          },
          {
            setStyles() {
              return { ...iconStyles, action: "siblingBefore" };
            },
            setBgStyles,
            position: [0, 0.5],
            show: "hover",
          },
          {
            setStyles() {
              return { ...iconStyles, action: "siblingAfter" };
            },
            setBgStyles,
            position: [1, 0.5],
            show: "hover",
          },
          {
            setStyles() {
              return { icon: "&#xe6a7;", fillStyle: "#F50", action: "remove" };
            },
            setBgStyles,
            position: [1, 0],
            show: "hover",
          },
          {
            setStyles() {
              return {
                icon: "&#xe613;",
                fillStyle: "#3073ff",
                action: "batch",
              };
            },
            setBgStyles,
            position: [1, 1],
            show: "hover",
          },
        ],
      };
    },
    setDefaultEdge() {
      return {
        type: "lineCurve",
      };
    },
    setNodeStateStyles(state: string) {
      if (state === "select") {
        return {
          strokeStyle: "#3073F2",
          fillStyle: "#E8F4FF",
        };
      }
      if (state === "active") {
        return {
          strokeStyle: "#3073F2",
        };
      }
      return {};
    },
    setEdgeStateStyles(state: string) {
      if (state === "active") {
        return {
          strokeStyle: "#3073F2",
        };
      }
      return {};
    },
    onClickNode(target: Node, event: GraphEvent) {
      // TODO: addSource  addSource addSiblingBefore addSiblingAfter 在节点收起情况下连线的隐藏状态处理
      const relatedTarget = event.relatedTarget;
      if (relatedTarget?.type === "icon") {
        switch (relatedTarget.get("action")) {
          case "source":
            editor.addSource(target.get("id"));
            break;
          case "target":
            editor.addSource(target.get("id"));
            break;
          case "siblingBefore":
            editor.addSiblingBefore(target.get("id"));
            break;
          case "siblingAfter":
            editor.addSiblingAfter(target.get("id"));
            break;
          case "remove":
            editor.removeNode(target.get("id"));
            break;
          case "batch":
            batchChange(target);
            break;
          default:
            break;
        }
      }
    },
  });
  const graph = editor.getGraph();
  // editor.setData({"nodes":[{"id":"initial","name":"初始化节点","x":85,"y":110,"width":140,"height":40,"label":"initial","anchors":[[0.5,0],[0.5,1]],"icons":[{"position":[0.5,0],"show":"hover"},{"position":[0.5,1],"show":"hover"},{"position":[0,0.5],"show":"hover"},{"position":[1,0.5],"show":"hover"},{"position":[1,0],"show":"hover"},{"position":[1,1],"show":"hover"}],"rank":1,"sources":["vgraphDagFlowRoot"],"targets":["9frhdhOkPM","AODiyx"]},{"id":"vgraphDagFlowRoot","x":85,"y":20,"width":140,"height":40,"label":"vgraphDagFlowRoot","anchors":[[0.5,0],[0.5,1]],"icons":[{"position":[0.5,0],"show":"hover"},{"position":[0.5,1],"show":"hover"},{"position":[0,0.5],"show":"hover"},{"position":[1,0.5],"show":"hover"},{"position":[1,0],"show":"hover"},{"position":[1,1],"show":"hover"}],"rank":0,"sources":[],"targets":["initial"]},{"id":"9frhdhOkPM","x":0,"y":200,"width":140,"height":40,"label":"9frhdhOkPM","anchors":[[0.5,0],[0.5,1]],"icons":[{"position":[0.5,0],"show":"hover"},{"position":[0.5,1],"show":"hover"},{"position":[0,0.5],"show":"hover"},{"position":[1,0.5],"show":"hover"},{"position":[1,0],"show":"hover"},{"position":[1,1],"show":"hover"}],"rank":2,"sources":["initial"],"targets":["Qqd5X6C8iC"]},{"id":"Qqd5X6C8iC","x":0,"y":290,"width":140,"height":40,"label":"Qqd5X6C8iC","anchors":[[0.5,0],[0.5,1]],"icons":[{"position":[0.5,0],"show":"hover"},{"position":[0.5,1],"show":"hover"},{"position":[0,0.5],"show":"hover"},{"position":[1,0.5],"show":"hover"},{"position":[1,0],"show":"hover"},{"position":[1,1],"show":"hover"}],"rank":3,"sources":["9frhdhOkPM"],"targets":["raSFIQhO1d"]},{"id":"raSFIQhO1d","x":85,"y":380,"width":140,"height":40,"label":"raSFIQhO1d","anchors":[[0.5,0],[0.5,1]],"icons":[{"position":[0.5,0],"show":"hover"},{"position":[0.5,1],"show":"hover"},{"position":[0,0.5],"show":"hover"},{"position":[1,0.5],"show":"hover"},{"position":[1,0],"show":"hover"},{"position":[1,1],"show":"hover"}],"rank":4,"sources":["Qqd5X6C8iC","3eTC5C"],"targets":[]},{"id":"AODiyx","x":170,"y":200,"width":140,"height":40,"label":"AODiyx","anchors":[[0.5,0],[0.5,1]],"icons":[{"position":[0.5,0],"show":"hover"},{"position":[0.5,1],"show":"hover"},{"position":[0,0.5],"show":"hover"},{"position":[1,0.5],"show":"hover"},{"position":[1,0],"show":"hover"},{"position":[1,1],"show":"hover"}],"rank":2,"sources":["initial"],"targets":["3eTC5C"]},{"id":"3eTC5C","x":170,"y":290,"width":140,"height":40,"label":"3eTC5C","anchors":[[0.5,0],[0.5,1]],"icons":[{"position":[0.5,0],"show":"hover"},{"position":[0.5,1],"show":"hover"},{"position":[0,0.5],"show":"hover"},{"position":[1,0.5],"show":"hover"},{"position":[1,0],"show":"hover"},{"position":[1,1],"show":"hover"}],"rank":3,"sources":["AODiyx"],"targets":["raSFIQhO1d"]}],"edges":[{"source":"vgraphDagFlowRoot","target":"initial","type":"lineCurve","__source":1,"__target":0,"id":"ekh89N"},{"source":"initial","target":"9frhdhOkPM","type":"lineCurve","__source":1,"__target":0,"id":"Gpe1va"},{"source":"9frhdhOkPM","target":"Qqd5X6C8iC","type":"lineCurve","__source":1,"__target":0,"id":"tC4S9F"},{"source":"Qqd5X6C8iC","target":"raSFIQhO1d","type":"lineCurve","__source":1,"__target":0,"id":"sS7xBX"},{"source":"initial","target":"AODiyx","type":"lineCurve","__source":1,"__target":0,"id":"w94yVJ"},{"source":"AODiyx","target":"3eTC5C","type":"lineCurve","__source":1,"__target":0,"id":"gRD6PK"},{"source":"3eTC5C","target":"raSFIQhO1d","type":"lineCurve","__source":1,"__target":0,"id":"xqqH01"}]});
  graph.addBehavior(highlightRelations);
  // graph.addBehavior(dragNode);
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
      // 被拖拽节点置于上层
      node.toFront();
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
        if (
          id !== target.get("id") &&
          id !== "vgraphDagFlowRoot" &&
          node.get("y") <= y
        ) {
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
      attached?.setState("attached");
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
      node.removeState("dragging");
      attached?.removeState("attached");
      attached = null;
      return !!relativeNode;
    },
    onDrop(node: Node, parent: Node) {
      const pos = getAlignPosition(node, parent);
      editor.moveNode(node.get("id"), parent.get("id"), pos);
    },
  });
  graph.set("layout", editor.layout);

  graph.on("node:contextmenu", (e: GraphEvent) => {
    const node = e.target as Node;
    if (node.get("collapsed")) {
      editor.expandNode(node.get("id"));
    } else {
      editor.collapseNode(node.get("id"));
    }
  });

  graph.on("node:click", (e) => {
    console.log(e.target);
  });

  // editor.getGraph().addBehavior(highlightRelations);
  function getRanks(graph: Graph) {
    const ranks = {} as IRanks;
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
  function getAlignPosition(node: Node, relativeNode: Node, serial?: boolean) {
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
    const formerData = editor.getSnapshot();
    const ranks = getRanks(editor.graph);
    const node = target;
    const rank = node.get("rank");
    const maxRank = Math.max(...Object.keys(ranks).map((d) => parseInt(d)));
    const maxRankNode = ranks[maxRank][0];
    let sourceNode = node;
    for (let i = rank + 1; i < maxRank; i++) {
      const newNode = editor.graph.add("node", { id: uuid() });
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
    const currentData = editor.getSnapshot();
    editor.batchChange({ formerData, currentData });
  }

  btnUndo.onclick = () => {
    editor.undo();
  };
  btnRedo.onclick = () => {
    editor.redo();
  };

  // setTimeout(() => {
  //   // editor.updateNode(editor.getGraph().getNodes()[0].get('id'), {
  //   //   label: '111'
  //   // });
  //   editor.setData(data);
  // }, 1000);
  (window as any).editor = editor;
  (window as any).graph = editor.getGraph();
})();
