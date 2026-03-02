import {
  DAGFlowEditor,
  GraphEvent,
  Node,
  attachableDragNode,
  registerEdge,
  Layer,
  Cubic,
  Image,
  ShapeEvent,
  CountBadgeUtils,
  colorParser,
  Shape,
  GRAPH_EVENTS,
  LayerEvent,
  Rect,
} from "../../src";

const RANK_SEP = 50;

registerEdge("iconEdge", {
  extends: "vCubic",
  // edgeData 是一个连线实例通过 setDefaultEdge 之后 merge 的全量连线配置
  getConfigsForShape(edgeData: { [k: string]: any }) {
    // 大多数情况下直接使用内置连线绘制无须修改配置，相应的更新时也无须新增更新步骤
    return edgeData;
  },
  shape(layer: Layer, edgeConfigs: { [k: string]: any }) {
    const edge = layer.find((shape: any) => shape.get("_keyShape")) as Cubic;
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
    const edge = layer.find((shape: any) => shape.get("_keyShape")) as Cubic;
    // 在 shape 方法中将 icon 保存到了 layer 上，方便这里取出更新
    const icon = layer.get("icon");
    const p = edge.getPointAt(0.5);
    icon.set({ left: p.x - 8, top: p.y - 8 });
  },
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
      rankDir: "LR",
      rankSep: RANK_SEP,
      coordAssignment: "treeLike",
    },
    // mask: {
    //   enable: true
    // },
    onChange() {
      console.log("change========");
    },
    setDefaultNode(nodeData: any) {
      const icons: any = [
        {
          setStyles() {
            return { icon: "&#xe613;", fillStyle: "#3073ff", action: "target" };
          },
          position: [1, 0.5],
          offset: [0, -10],
          show: "hover",
        },
        {
          setStyles() {
            return { icon: "&#xe6a7;", fillStyle: "#F50", action: "remove" };
          },
          position: [0, 0],
          show: "hover",
        },
      ];
      // if (nodeData.children) {
      icons.push({
        type: "category",
        show: "hover",
        position: [1, 0.5],
        offset: [20, 0],
        setStyles() {
          return {
            opacity: 0,
            fillStyle: "#3073F2",
            icon: "&#xe617;",
            cursor: "pointer",
          };
        },
        setBgStyles() {
          return {
            type: "circle",
            styles: { opacity: 0 },
            size: 14,
          };
        },
        onClick(e: ShapeEvent, nodeData: any) {
          const node = graph.getNodeById(nodeData.id);
          node["iconLayer"] = e.target;
          collapseNode(nodeData.id);
        },
        onMouseEnter(e: ShapeEvent) {
          const bkg = e.target.children[0];
          bkg.set("fillStyle", "#E4EDFE");
          graph.draw();
        },
        onMouseLeave(e: ShapeEvent) {
          const bkg = e.target.children[0];
          bkg.set("fillStyle", "#FFF");
          graph.draw();
        },
      });
      // }
      return {
        width: 140,
        height: 40,
        label: nodeData.id + "",
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        icons,
      };
    },
    setNodeStateStyles(state: string) {
      return { strokeStyle: "#3073FF" };
    },
    setDefaultEdge() {
      return {
        type: "hCubic",
      };
    },
    onClickNode(target: Node, event: GraphEvent) {
      const relatedTarget = event.relatedTarget;
      const id = target.get("id");
      if (relatedTarget?.type === "icon") {
        switch (relatedTarget.get("action")) {
          // case 'source':
          //   editor.addSource(target.get('id'));
          //   break;
          case "target":
            // editor.addTarget(target.get('id'));

            if (target.get("collapsed")) {
              expandNode(id);
            }
            editor.addTarget(id, {}, false);
            break;
          // case 'siblingBefore':
          //   // editor.addSiblingBefore(target.get('id'));
          //   editor.addSiblingBefore(target.get('id'), {}, false);
          //   break;
          // case 'siblingAfter':
          //   // editor.addSiblingAfter(target.get('id'));
          //   editor.addSiblingAfter(target.get('id'), {}, false);
          //   break;
          case "remove":
            editor.removeNode(id, true);
            break;
          default:
            break;
        }
      }
    },
  });
  editor.stack.collab = true;

  const graph = editor.getGraph();

  // graph.on('node:click', (e) => {
  //   editor.copy(e.target, true);
  // });

  // graph.on('node:contextmenu', (e) => {
  //   editor.paste(e.target, undefined).then((status) => {
  //     if (status) {
  //       console.log(editor.getSelectedNode());
  //     }
  //   });

  // });

  graph.on("node:mouseenter", (e: GraphEvent) => {
    const node = e.target as Node;
    const icon = node.layer.get("__icons")[2];
    if (node.targets.length > 0) {
      icon.children[0].set("opacity", 1);
      icon.children[1].set("opacity", 1);
      icon.show();
      graph.draw();
    } else {
      icon.hide();
      graph.draw();
    }
  });

  graph.on("node:mouseleave", (e: GraphEvent) => {
    const node = e.target as Node;
    if (node.targets.length > 0) {
      const icon = node.layer.get("__icons")[2];
      icon.hide();
      graph.draw();
    }
  });

  graph.on(GRAPH_EVENTS.EXPAND_NODE_END, (ev) => {
    const node = ev.target;
    const sumLayer = node["sumLayer"];
    const iconLayer = node["iconLayer"];
    iconLayer?.hide();
    sumLayer?.hide();
    graph.draw();
  });

  graph.on(GRAPH_EVENTS.COLLAPSE_NODE_END, (ev) => {
    const node = ev.target;
    const iconLayer = node["iconLayer"];
    iconLayer?.hide();
    showSum(node.get("id"));
    graph.draw();
  });

  function collapseNode(nodeId: string) {
    editor.collapseNode(nodeId);
  }

  function expandNode(nodeId: string) {
    editor.expandNode(nodeId);
    const node = graph.getNodeById(nodeId);
    const iconLayer = node.iconLayer as Shape;
    iconLayer?.show();
    graph.draw();
  }

  function showSum(nodeId: string) {
    const node = graph.getNodeById(nodeId);
    const count = getChildrenCount(node);
    const sumLayer = CountBadgeUtils.init(node, {
      position: "right",
      text: count + "",
      color: node.get("color"),
      onClick() {
        expandNode(nodeId);
      },
      onMouseEnter(e: LayerEvent) {
        const rect = sumLayer.children[1];
        rect.set(
          "fillStyle",
          colorParser(rect.get("strokeStyle")).lerp("#ffffff", 0.875).hex()
        );
        graph.draw();
      },
      onMouseLeave(e: LayerEvent) {
        const rect = sumLayer.children[1];
        rect.set("fillStyle", "#FFF");
        graph.draw();
      },
    });
    node["sumLayer"] = sumLayer;
    sumLayer.show();
  }

  function getChildrenCount(node: Node) {
    const children = node.targets;
    if (!children || children.length === 0) {
      return 0;
    }
    let count = children.length;
    children.forEach((child: any) => {
      const node = graph.getNodeById(child);
      count += getChildrenCount(node);
    });

    return count;
  }

  graph.on("stackchange", (e) => {
    console.log(e);
  });
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
      const id = e.target.get("id");
      const rootId = graph.getNodeById("vgraphDagFlowRoot").targets[0];
      if (id === "vgraphDagFlowRoot" || id === rootId) {
        return false;
      }
      editor.setNodeDownstreamVisibility(e.target as Node, false);
      return true;
    },
    // 拖拽过程中判断可以移动到哪个节点上
    findClosestNode(target: Node) {
      const { x, y, id } = target.configs;
      let min = Infinity;
      let closest: any = null;
      graph.disableAutoDraw();
      if (attached) {
        attached.removeState("attached");
      }
      graph.getNodes().forEach((node: Node) => {
        const nodeX = node.get("x");
        const nodeY = node.get("y");
        // 仅找被拖拽节点水平位置更前的可见节点
        if (nodeX > x || node.get("id") === id || !node.isVisible()) {
          return;
        }
        const dist = (x - nodeX) * (x - nodeX) + (y - nodeY) * (y - nodeY);
        if (dist < min) {
          min = dist;
          closest = node;
        }
      });
      attached = closest;
      attached && (attached as Node).setState("attached");
      graph.enableAutoDraw(true);
      return attached;
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
      return true;
    },
    onDrop(node: Node, parent: Node) {
      editor.setNodeDownstreamVisibility(node, true);
      const y = node.get("y");
      let index = -1;
      const children = parent.targets;
      for (let i = 0; i < children.length - 1; i++) {
        const node = graph.getNodeById(children[i]) as Node;
        if (i === 0 && y < node.get("y")) {
          index = 0;
          break;
        }
        if (
          node.get("y") <= y &&
          graph.getNodeById(children[i + 1]).get("y") > y
        ) {
          index = i + 1;
          break;
        }
      }
      parent && editor.moveTreeNode(node.get("id"), parent.get("id"), index);
    },
  });

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

  const rect = new Rect({ left: 0, top: 0, width: 10, height: 10 });
  console.log(rect.clone());
})();
