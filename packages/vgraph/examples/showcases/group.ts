import { Graph, dragNode, panZoom, Group } from "../../src";

const expandIcon = "&#xeb15;";
const collapseIcon = "&#xeb14;";

import data from "../static/group.json";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(nodeData: any) {
      return {
        label: {
          text: nodeData.label,
          // fillStyle: "#3073F2",
          textAlign: "center",
        },
        type: "rect",
        width: 100,
        height: 40,
        radius: 3,
        //strokeStyle: "#3073F2",
        anchors: [
          [0, 0.5],
          [0.5, 0],
          [0.5, 1],
          [1, 0.5],
        ],
      };
    },
    setDefaultEdge() {
      return {
        strokeStyle: "#D1D5DA",
        endArrow: true,
      };
    },
    setDefaultGroup() {
      return {
        fillStyle: "#fff",
        strokeStyle: "#E1E4EB",
        // strokeStyle: "#3073F2",
        radius: 6,
        linkNode: true,
        padding: [24, 20, 24, 20],
        lineWidth: 1,
        titleSize: 32,
        title: {
          text: { text: "需求层" },
          // text: { text: '需求层', fillStyle: '#3073F2' },
          background: {
            fillStyle: "#F0F3F6",
            // fillStyle: '#F2F6FF',
          },
          icon: {
            icon: collapseIcon,
            // fillStyle: "#3073F2",
            cursor: "pointer",
            onClick: (e: any, group: Group) => {
              if (group.get("collapsed")) {
                e.target.set("icon", collapseIcon);
                group.expand();
              } else {
                e.target.set("icon", expandIcon);
                group.collapse();
              }
            },
          },
        },
        // renderGroupTitle(group: Group, layer: Layer, width: number) {
        //   // 定义标题文本
        //   const text = new Text({
        //     text: group.get("name"),
        //     x: width / 2,
        //     y: 18,
        //     fontSize: 10,
        //     textBaseline: "middle",
        //     textAlign: "center",
        //     fillStyle: "#3073F2"
        //   });

        //   // 定义标题栏上方的数据条
        //   const rect = new Rect({
        //     left: 0,
        //     top: 0,
        //     width: width,
        //     height: 15,
        //     radius: [6, 6, 0, 0],
        //     fillStyle: "#3073F2"
        //   });

        //   const clip = new Rect({
        //     left: 0.5,
        //     top: 8,
        //     width: width - 1,
        //     height: 22,
        //     fillStyle: '#fff',
        //     radius: 6
        //   });
        //   layer.set('background', clip);
        //   layer.add(rect);
        //   layer.add(clip);
        //   layer.add(text);
        //   // 返回标题高度，此高度不包含上 padding
        //   return 30;
        // }
      };
    },
  });

  graph.data(data);

  (window as any)._graph = graph;
  graph.on("node:mouseenter", (e) => {
    e.target.setState("hover");
  });

  graph.on("node:mouseleave", (e) => {
    e.target.clearStates();
  });

  graph.on("node:contextmenu", (e) => {
    console.log(e.target);
  });

  graph.addBehavior(panZoom);

  graph.addBehavior(dragNode, {
    delegate: false,
    delegateStyle: { strokeStyle: "orange" },
    onDragStart(node: any, ev: any) {
      console.log("start dragging node", node, ev);
    },
    onDrag(node: any, x: number, y: number) {
      console.log("dragging node", node, x, y);
    },
    onDrop(node: any) {
      console.log("drop node", node);
    },
  });

  graph.on("node:click", (e) => {
    console.log(1111111111111);
  });

  // graph.on("group:click", (e) => {
  //   const group = e.target;
  //   if (group.get("collapsed")) {
  //     group.expand();
  //   } else {
  //     group.collapse();
  //   }
  // });

  (window as any)._graph = graph;
})();
