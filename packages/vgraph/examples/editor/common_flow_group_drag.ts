import {
  brushSelect,
  CommonFlowEditor,
  Node,
  Icon,
  Edge,
  getDefaultBizData,
  Group,
  GraphEvent,
  Graph,
  Grid,
  Layer,
  Rect,
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
  span.setAttribute("type", "node");
  aside.appendChild(span);

  const span2 = document.createElement("span");
  span2.classList.add("iconfont");
  span2.style.fontSize = "36px";
  span2.innerHTML = "&#xe612;";
  span2.draggable = true;
  span2.setAttribute("type", "group");
  aside.appendChild(span2);

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

  function resetGroup(group: Group) {
    group.set("fixLeft", undefined);
    group.set("fixTop", undefined);
    group.set("fixWidth", undefined);
    group.set("fixHeight", undefined);
    group.refreshBox();
    const router = editor.getComponent("router")!;
    for (const edge of group.edges) {
      router?.updateEdgePath(edge);
      edge.updatePosition();
    }
  }

  let dragTarget: Node | null = null;
  // 限制节点移动在分组范围内
  const editor = new CommonFlowEditor({
    container: div,
    graphSize: [800, 600],
    data: {
      nodes: [
        { id: "1", x: 100, y: 300 },
        { id: "2", x: 300, y: 500 },
        { id: "3", x: 100, y: 0 },
      ],
      edges: [{ source: "1", target: "2" }],
      groups: [{ id: "group1", children: ["1", "2"] }],
    },
    setDefaultNode(node: any) {
      return {
        type: "rect",
        radius: 4,
        width: 140,
        height: 40,
        label: node.name || node.id,
        anchors: [
          {
            show: "hover",
            position: [0.5, 0].concat(),
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
            position: [0.5, 1].concat(),
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
    setDefaultEdge() {
      return {
        type: "vLine",
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
    setDefaultGroup(groupData) {
      return {
        linkNode: true,
        strokeStyle: "#D9D9D9",
        fillStyle: null,
        radius: 4,
        padding: 20,
        titlePosition: "top",
        titleSize: 36,
        title: {
          text: {
            text: groupData.id,
            fillStyle: "#626978",
          },
          background: {
            fillStyle: "#F0F3F6",
          },
        },
        anchors: [
          {
            show: "hover",
            position: [0.5, 0],
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
    setGroupStateStyles(state: string) {
      if (state === "select") {
        return {
          strokeStyle: "#3073F2",
        };
      }
      return {
        strokeStyle: "red",
      };
    },
    scroller: {
      enable: false,
    },
    nodeMover: {
      options: {
        group: true,
        onDragStart(target: Node | Group) {
          // 拖拽分组不处理
          if (target.type === "group") {
            dragTarget = null;
            return;
          }
          const group = target.belong;
          dragTarget = target as Node;
          // 如果有分组，先保持分组大小从分组中去除
          if (group) {
            const bbox = group.getContentBox();
            group.set("fixLeft", bbox.left);
            group.set("fixTop", bbox.top);
            group.set("fixWidth", bbox.width);
            group.set("fixHeight", bbox.height);
            target.set("enterGroup", group);
            target.set("formerGroup", group);
            dragTarget.removeFromGroup(false);
          }
        },
        onDragEnter(target) {
          if (target.type === "group" && dragTarget) {
            target.setState("active");
            dragTarget.set("enterGroup", target);
          }
        },
        onDragLeave(target) {
          if (target.type === "group" && dragTarget) {
            target.removeState("active");
            dragTarget.set("enterGroup", null);
          }
        },
        onDrop(target: Node | Group) {
          dragTarget = null;
          if (target.type === "group") {
            editor.selectEntities([target]);
            return;
          }
          const newGroup = target.get("enterGroup");
          const formerGroup = target.get("formerGroup");
          target.set("enterGroup", null);
          target.set("formerGroup", null);
          // 同一个 group 中移动
          if (newGroup === formerGroup) {
            formerGroup.addChild(target);
            resetGroup(formerGroup);
            return;
          }
          // 移出之前的 group
          if (formerGroup && formerGroup.get("children").length > 0) {
            resetGroup(formerGroup);
          }
          // 移入新的 group
          if (newGroup) {
            resetGroup(newGroup);
            newGroup.removeState("active");
            newGroup.addChild(target);
          }
        },
      },
    },
    gridStep: 10,
    grid: {
      enable: true,
      options: {
        ignoreGroupTitle: false,
      },
    },
    shortcuts: {
      customShortcuts: (defaultShortcuts, stack) => {
        const shortcuts = defaultShortcuts;
        delete shortcuts.selectAll;
        shortcuts.paste.handler = (event: any) => {
          const status = stack?.execute("paste", {
            event,
            position: editor.getLastMousePosition(),
          });
          if (!status) {
            console.log("paste 失败");
          } else {
            console.log("paste 成功");
            editor.selectionIntoView();
          }
        };
        return shortcuts;
      },
    },
    edgeEditor: {
      enable: true,
      options: {
        group: true,
      },
    },
    // edgeEditor: {
    //   enable: true,
    //   options: {
    //     editTerminal: true,
    //     shouldTrigger(e, shape, target, edge) {
    //       triggerShape = shape;
    //       triggerShape.set('edge', edge);
    //       return shape?.get('_anchor');
    //     },
    //     showAnchors(anchorConfigs, anchorShape, node) {
    //       if (triggerShape.get('_anchor')) {
    //         const shapeAnchorIndex = triggerShape.get('anchorIndex');
    //         const notEdit = !triggerShape.get('edge');
    //         return (anchorConfigs.index !== shapeAnchorIndex) === notEdit;
    //       } else {
    //         return false;
    //       }

    //     },
    //     shouldDrop(source, target, sourceAnchor, targetAnchor) {
    //       console.log(sourceAnchor, targetAnchor);
    //       return targetAnchor !== sourceAnchor;
    //     },
    //   }
    // },
  });

  editor.stack.collab = true;
  editor.getGraph().on("stackchange", (data) => {
    console.log(data);
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

  graph.addBehavior(brushSelect, {
    targets: ["node", "edge"],
    onSelect(item: Node | Edge) {
      if (item.type === "edge") {
        if (
          (item.source as Node).states.includes("select") &&
          (item.source as Node).states.includes("select")
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

  edgeInsertNodeBehavior(editor);

  let dragNode = false;
  let groupId = "";
  graph.on("group:mouseenter", (e: GraphEvent) => {
    if (dragNode) {
      e.target.setState("active");
      groupId = e.target.get("id");
    }
  });

  graph.on("group:mouseleave", (e: GraphEvent) => {
    if (dragNode) {
      e.target.removeState("active");
      groupId = "";
    }
  });
  (window as any).editor = editor;

  aside.ondragstart = (e: any) => {
    const type = e.target.getAttribute("type");
    groupId = "";
    if (type === "node") {
      dragNode = true;
    }
    e.dataTransfer?.setData("type", type);
    canvas.focus();
  };

  graph.on("group:click", (e: GraphEvent) => {
    editor.selectEntities([e.target]);
  });

  const canvas = graph.getCanvasDom();

  canvas.addEventListener("dragover", (e: any) => {
    if (dragNode) {
      const event = new MouseEvent("mousemove", {
        clientX: e.clientX,
        clientY: e.clientY,
      });
      graph.handleEvent(event);
    }
  });

  canvas.ondragover = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  canvas.ondrop = (e: any) => {
    const graph = editor.getGraph();
    const { clientX, clientY } = e;
    const point = graph.clientToCanvas(clientX, clientY);
    const type = e.dataTransfer.getData("type");
    dragNode = false;
    if (type === "node") {
      if (groupId) {
        // FIXME:  操作未入操作栈。 先 hold， 后续再考虑。
        const group = graph.getGroupById(groupId);
        group.removeState("active");
        resetGroup(group);
      }
      editor.addNode({
        x: point.x,
        y: point.y,
        name: `新增节点${graph.getNodes().length}`,
        taskType: e.dataTransfer.getData("taskType"),
        groupId: groupId || undefined,
      });
    } else {
      editor.getStack().execute("add", {
        type: "group",
        configs: {
          fixLeft: point.x,
          fixTop: point.y,
          fixWidth: 100,
          fixHeight: 100,
        },
      });
      graph.refresh();
    }
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

function edgeInsertNodeBehavior(editor: CommonFlowEditor) {
  const graph = editor.getGraph();
  const icon = new Icon({
    x: 100,
    y: 100,
    size: 16,
    fillStyle: "#25a868",
    background: {},
    icon: "&#xe606;",
  });
  graph.getContainer().add(icon);
  icon.toFront();
  icon.hide();
  let timer: any;
  let lastEdge: Edge | null = null;
  graph.on("edge:mouseenter", (e: any) => {
    const edge = e.target as Edge;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!timer || lastEdge !== edge) {
      lastEdge = edge;
      const { x, y } = edge.getKeyShape().getPointAt(0.5);
      icon.set("x", x);
      icon.set("y", y);
      icon.set("targetEdge", edge);
      icon.show();
      graph.draw();
    }
  });
  graph.on("change", (e: any) => {
    icon.hide();
  });
  icon.on("mouseenter", () => {
    clearTimeout(timer);
    timer = null;
  });
  icon.on("mouseleave", () => {
    timer = setTimeout(() => {
      icon.hide();
      graph.draw();
      timer = null;
    }, 200);
  });
  icon.on("click", () => {
    editor.insertNode(icon.get("targetEdge"));
    icon.hide();
    graph.draw();
  });
  graph.on("edge:mouseleave", (e: any) => {
    timer = setTimeout(() => {
      icon.hide();
      graph.draw();
      timer = null;
    }, 200);
  });
}
