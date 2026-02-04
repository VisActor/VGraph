import {
  brushSelect,
  CommonFlowEditor,
  Node,
  Edge,
  getDefaultBizData,
  dragCanvas,
  GraphEvent,
} from "../../src";

(() => {
  const aside = document.createElement("div");
  aside.style.border = "1px solid #666";
  aside.style.display = "inline-block";
  aside.style.width = "100px";
  aside.style.height = "200px";
  document.body.append(aside);
  const span = document.createElement("span");
  span.classList.add("iconfont");
  span.style.fontSize = "36px";
  span.innerHTML = "&#xe601;";
  span.draggable = true;
  aside.appendChild(span);

  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.display = "inline-block";
  div.style.width = "800px";

  const btn = document.createElement("button");
  btn.textContent = "export data";
  div.appendChild(btn);
  const btn1 = document.createElement("button");
  btn1.textContent = "undo";
  div.appendChild(btn1);

  const btn2 = document.createElement("button");
  btn2.textContent = "redo";
  div.appendChild(btn2);

  const btn3 = document.createElement("button");
  btn3.textContent = "group";
  div.appendChild(btn3);

  const btn4 = document.createElement("button");
  btn4.textContent = "ungroup";
  div.appendChild(btn4);

  const btn5 = document.createElement("button");
  btn5.textContent = "focus";
  div.appendChild(btn5);

  const btn6 = document.createElement("button");
  btn6.textContent = "select";
  div.appendChild(btn6);

  const btn8 = document.createElement("button");
  btn8.textContent = "clear";
  div.appendChild(btn8);

  const btn9 = document.createElement("button");
  btn9.textContent = "copy";
  div.appendChild(btn9);

  const btn10 = document.createElement("button");
  btn10.textContent = "cut";
  div.appendChild(btn10);

  const btn11 = document.createElement("button");
  btn11.textContent = "paste";
  div.appendChild(btn11);

  document.body.append(div);
  // let triggerShape: any = null;
  const editor = new CommonFlowEditor({
    container: div,
    graphSize: [800, 600],
    data: {
      nodes: [
        { id: "Task1", x: 320, y: 80 },
        { id: "Task2", x: 520, y: 210 },
        { id: "Task3", x: 120, y: 210 },
      ],
      edges: [
        {
          source: "Task1",
          target: "Task2",
          controlPoints: [
            [320, 140],
            [520, 140],
            [520, 150],
          ],
        },
        {
          source: "Task1",
          target: "Task3",
          controlPoints: [
            [320, 150],
            [120, 150],
          ],
        },
      ],
      groups: [
        {
          children: ["Task1", "Task3"],
        },
      ],
    },
    setDefaultNode(node: any) {
      return {
        type: "rect",
        radius: 4,
        width: 128,
        height: 45,
        label: node.name || node.id,

        anchors: [
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
        return { strokeStyle: "#5678D6" };
      }
      return {};
    },
    setDefaultEdge(edgeData) {
      return {
        type: edgeData.target ? "routerCubic" : "vLine",
        endArrow: true,
        hitWidth: 12,
      };
    },
    setEdgeStateStyles(state: string) {
      if (state === "select") {
        return { strokeStyle: "#5678D6" };
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
    scroller: {
      enable: false,
    },
    nodeMover: {
      options: {
        group: true,
        shouldDrop(e, target) {
          // 示例：禁止节点重叠
          return true;
        },
        onDrag() {},
      },
    },
  });
  editor.getGraph();
  editor.getGraph().on("group:click", (e: GraphEvent) => {
    editor.getStack().execute("select", { selections: [e.target] });
  });
  customReadLaxMode(editor);

  const graph = editor.graph;

  graph.on("edge:click", (e: any) => {
    console.log(e.target);
  });

  graph.on("edge:dblclick", (e: any) => {
    const edge = e.target;
    console.log("edge:dblclick");
    editor.updateEdge(edge, { strokeStyle: "green" });
  });

  aside.ondragstart = (e: any) => {
    e.dataTransfer?.setData("taskType", "11222");
  };

  const canvas = graph.getCanvasDom();

  canvas.ondragover = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  canvas.ondrop = (e: any) => {
    const { clientX, clientY } = e;
    const point = graph.clientToCanvas(clientX, clientY);
    editor.addNode({
      x: point.x,
      y: point.y,
      name: `新增节点${graph.getNodes().length}`,
      taskType: e.dataTransfer.getData("taskType"),
    });
  };
  (window as any).editor = editor;
  (window as any).graph = graph;

  btn.onclick = () => {
    console.log(JSON.stringify(graph.getData(getDefaultBizData)));
  };

  btn1.onclick = () => {
    editor.undo();
  };
  btn2.onclick = () => {
    editor.redo();
  };
  btn3.onclick = () => {
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
  };
  btn4.onclick = () => {
    const { group } = editor.getSelection();
    // 单选分组时生效
    if (group.length > 1) {
      return;
    }
    editor.stack?.execute("remove", { ungroup: true });
  };
  btn5.onclick = () => {
    editor.getGraph()?.focus(editor.getGraph().getNodes()[0]);
  };

  btn6.onclick = () => {
    if (btn6.textContent === "select") {
      btn6.textContent = "unselect";
      graph.removeBehavior(dragCanvas);
      graph.addBehavior(brushSelect, {
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
          // this.graph.set('_selections', { node: selected.map((d) => d.get('id')) });
        },
      });
    } else {
      btn6.textContent = "select";
      graph.addBehavior(dragCanvas);
      graph.removeBehavior(brushSelect);
    }
  };

  btn8.onclick = () => {
    editor.clear();
  };

  btn9.onclick = () => {
    editor.copy();
  };
  btn10.onclick = () => {
    editor.cut();
  };
  btn11.onclick = () => {
    editor.paste();
  };
})();

function customReadLaxMode(editor: CommonFlowEditor) {
  const commands = editor.getCommands();
  commands["select"].mode = ["edit", "read", "read-lax"];
  commands["copy"].mode = ["edit", "read", "read-lax"];
  commands["moveNode"].mode = ["edit", "read-lax"];
  commands["batch"].mode = ["edit", "read-lax"];
}
