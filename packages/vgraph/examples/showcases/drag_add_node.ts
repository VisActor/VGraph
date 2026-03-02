import {
  brushSelect,
  CommonFlowEditor,
  Node,
  Edge,
  EdgeEditor,
} from "../../src";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.display = "inline-block";
  div.style.width = "800px";

  const btn = document.createElement("button");
  btn.textContent = "export data";
  div.appendChild(btn);

  const btn1 = document.createElement("button");
  btn1.textContent = "layout";
  div.appendChild(btn1);

  const input = document.createElement("input");
  div.appendChild(input);
  const btn2 = document.createElement("button");
  btn2.textContent = "update node name";
  div.appendChild(btn2);

  document.body.append(div);
  const editor = new CommonFlowEditor({
    container: div,
    graphSize: [800, 600],
    setDefaultNode(node: any) {
      return {
        radius: 4,
        width: node.type === "circle" ? 40 : 140,
        height: 40,
        label: node.name || node.id,
        anchors:
          node.type === "circle"
            ? [
                {
                  show: "hover",
                  position: [0.5, 1],
                  // size: 16,
                  setStyles() {
                    return {
                      fillStyle: "#F3F9FF",
                      strokeStyle: "#3073F2",
                      cursor: "crosshair",
                    };
                  },
                },
              ]
            : [
                {
                  show: "hover",
                  position: [0.5, 0],
                  // size: 16,
                  setStyles() {
                    return {
                      fillStyle: "#F3F9FF",
                      strokeStyle: "#3073F2",
                      cursor: "crosshair",
                    };
                  },
                },
                {
                  show: "hover",
                  position: [0.5, 1],
                  // size: 16,
                  setStyles() {
                    return {
                      fillStyle: "#F3F9FF",
                      strokeStyle: "#3073F2",
                      cursor: "crosshair",
                    };
                  },
                },
              ],
      };
    },
    setNodeStateStyles(state: string) {
      if (state === "select") {
        return { strokeStyle: "#3073F2", fillStyle: "#EDF6FF" };
      }
      return { strokeStyle: "#3073F2" };
    },
    setDefaultEdge() {
      return {
        type: "vLine",
        endArrow: true,
        hitWidth: 6,
      };
    },
    setEdgeStateStyles(state: string) {
      if (state === "select") {
        return { strokeStyle: "#3073F2" };
      }
      return { strokeStyle: "#89909D" };
    },
    scroller: {
      enable: false,
    },
    gridStep: 10,
    // shortcuts: {
    //   customShortcuts: (defaultShortcuts, stack) => {
    //     const shortcuts = defaultShortcuts;
    //     shortcuts.paste.handler = (event: any) => {
    //       const status = stack?.execute('paste', { event, position: editor.getLastMousePosition() });
    //       if (!status) {
    //         console.log('paste 失败');
    //       } else {
    //         console.log('paste 成功');
    //         editor.selectionScaleIntoView();
    //       }
    //     }
    //     return shortcuts;
    //   },
    // },
  });

  const graph = editor.graph;
  // 初始化节点
  graph.add("node", {
    x: 400,
    y: 80,
    type: "circle",
    name: "开始",
  });
  // 拖拽连线添加节点交互
  const edgeEditor = editor.components.edgeEditor as EdgeEditor;
  edgeEditor.options.editTerminal = false;
  edgeEditor.options.shouldDrop = () => true;
  edgeEditor.options.onDrop = (edge: Edge) => {
    // 没有连到具体节点，则应新增连线
    if (!edge.get("target")) {
      const configs = edge.configs;
      const endPoint = edge.get("endPoint");
      editor.undo();
      const formerData = editor.getSnapshot();
      const node = graph.add("node", {
        x: endPoint[0], // 连线末梢 + width / 2
        y: endPoint[1] + 20,
        name: `新增节点${graph.getNodes().length}`,
      });
      delete configs.endPoint;
      configs.target = node.get("id");
      configs.targetAnchor = 0;
      const newEdge = graph.add("edge", configs);
      (editor.components.router as any).updateEdgePath(newEdge, true);
      newEdge.updatePosition();
      const currentData = editor.getSnapshot();
      editor.batchChange({ formerData, currentData });
    }
  };

  graph.removeBehavior("dragCanvas");
  graph.addBehavior(brushSelect, {
    targets: ["node", "edge"],
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
      // this.graph.set('_selections', { node: selected.map((d) => d.get('id')) });
    },
  });

  (window as any).editor = editor;
  (window as any).graph = graph;

  btn.onclick = () => {
    console.log(JSON.stringify(editor.exportData()));
  };

  btn1.onclick = () => {
    const formerData = editor.getSnapshot();
    // layout.layout();
    editor.refreshEdgesPath();
    graph.alignView("cc");
    const currentData = editor.getSnapshot();
    // gridShape(editor.graph, editor.graph.get('_grid'));
    editor.batchChange({ formerData, currentData });
  };

  btn2.onclick = () => {
    const value = input.value;
    const graph = editor.getGraph();
    const selection = graph.get("_selections");
    if (value && selection.node.length === 1) {
      const node = graph.getNodeById(selection.node[0]);
      editor.updateNode(node, { name: value });
    }
  };
})();
