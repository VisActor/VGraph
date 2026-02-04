import {
  dragCanvas,
  Graph,
  hideDetails,
  panZoom,
  Text,
  dragNode,
  Edge,
  Icon,
  Group,
} from "../../../src";

import data from "../../static/dag_nested_collapse.json";

const expandIcon = "&#xe610;";
const collapseIcon = "&#xe60f;";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  const btn = document.createElement("button");
  btn.textContent = "toggle edge";
  div.appendChild(btn);

  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(node: any) {
      return {
        // type: 'stats',
        width: 80,
        height: 30,
        radius: 5,
        lineDash: node.id.length > 2 ? [5, 5] : undefined,
        text: node.id ?? "null",
        // color: colors[Math.round(Math.random() * 5)],
        label: {
          width: 80,
          text: node.id ?? "null",
          fontSize: 10,
          // textBaseline: 'middle',
          // textAlign: 'center',
        },
        children: [1, 2, 3],
        rectWidth: 20,
        // icons: [{
        //   show: 'always',
        //   setStyles() {
        //     return { fillStyle: '#666', icon: '&#xe77a;', left: 0, top: -26 };
        //   },
        // }]
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      const label: any = node.layer.find((shape: any) => shape.type === "text");
      if (state === "hide") {
        return { fillStyle: data.color };
      }
      if (state === "hover") {
        label.set("fillStyle", "#3370FF");
        return { strokeStyle: "#3370FF" };
      } else {
        label.set("fillStyle", "#666");
        return { strokeStyle: "#ccc" };
      }
    },
    setDefaultEdge(edge: any) {
      return {
        id: edge.source + "-" + edge.target,
        type: "line",
        strokeStyle: "#ddd",
        endArrow: {
          type: "arrow",
          style: "triangleSolid",
          size: 10,
          strokeStyle: "#ddd",
        },
      };
    },
    setDefaultGroup(group: any) {
      return {
        linkNode: true,
        linkGroupOnCollapse: true,
        fillStyle: "#fff",
        strokeStyle: "#DDE2E9",
        padding: 20,
        radius: 4,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        titleSize: 32,
        renderGroupTitle(group: Group, layer: any, width: number) {
          const icon = new Icon({
            x: 28,
            y: 16,
            fillStyle: "#595959",
            icon: group.get("collapsed") ? expandIcon : collapseIcon,
            cursor: "pointer",
          });
          layer.add(icon);

          icon.on("click", () => {
            toggleGroup(group);
          });

          const text = new Text({
            x: 40,
            y: 16,
            text: group.get("id"),
            width: width - 40 - 16,
            textOverflow: "ellipsis",
          });
          layer.add(text);
        },
      };
    },
  });

  // graph.on('group:click', e => {
  //   const group = e.target;
  //   if (!group.get('collapsed')) {
  //     group.collapse(false, () => {
  //       group.children.forEach((child:any) => {
  //         if (child.type === 'node') {
  //           child.configs.y += 48;
  //         }
  //       });
  //       graph.refresh();
  //     });

  //   } else {
  //     group.expand(false);
  //   }

  //   console.log(group);
  //   console.log(group.getBBox().left);
  // });

  let showEdge = true;
  function toggleGroup(group: Group) {
    if (group.get("collapsed")) {
      group.expand();
    } else {
      group.collapse();
      !showEdge &&
        graph.getEdges().forEach((edge: Edge) => {
          edge.hide();
        });
      graph.draw();
    }
    // console.log(graph.getEdgeById('d-e').isVisible());
  }

  btn.onclick = () => {
    showEdge = !showEdge;
    if (showEdge) {
      graph.getEdges().forEach((edge: Edge) => {
        const source = edge.getSource();
        const target = edge.getTarget();
        if (source.isVisible() && target.isVisible()) {
          edge.show();
        }
      });
    } else {
      graph.getEdges().forEach((edge: Edge) => {
        edge.hide();
      });
    }
    graph.draw();
  };
  graph.data({
    nodes: [
      { label: "a", class: "type-TOP", id: "a", x: 100, y: 100 },
      { label: "b", class: "type-S", id: "b", x: 200, y: 100 },
      { label: "c", class: "type-NP", id: "c", x: 300, y: 200 },
      { label: "d", class: "type-DT", id: "d", x: 400, y: 300 },
      { label: "e", class: "type-TK", id: "e", x: 400, y: 400 },
    ],
    edges: [
      { source: "d", target: "e" },
      { source: "c", target: "d" },
      { source: "b", target: "a" },
      { source: "e", target: "b" },
      { source: "a", target: "e" },
    ],
    groups: [
      {
        id: "group1",
        groupId: "group2",
        children: ["d", "e"],
      },
      {
        id: "group2",
        children: ["c"],
      },
      {
        id: "group3",
        children: ["b"],
      },
    ],
  });
  graph.draw();
  (window as any).__graph = graph;

  // graph.updateData(graphData.getData());
  // console.log(graphData);
  // graph.getEdgeById('1-2').updateData({ controlPoints: null });
  // graph.getEdges().forEach((edge: any) => {
  //   edge.hide();
  // });
  graph.refresh();
  graph.fitView();
  // const bbox = graph.container.getBBox();
  // graph.translate(-bbox.left, -bbox.top);
  // graph.draw();
  graph.addBehavior(panZoom, { sensitivity: 5 });
  graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: "hide" });
  graph.addBehavior(dragCanvas);
  graph.addBehavior(dragNode);
  graph.draw();
})();
