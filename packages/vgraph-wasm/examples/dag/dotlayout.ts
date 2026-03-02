import {
  dragCanvas,
  Graph,
  Group,
  highlightRelations,
  Icon,
  panZoom,
  Path,
  registerEdge,
  Text,
} from "@visactor/vgraph";
import { WasmDAGLayout } from "../../src";

import { getSplinePath, loadWasm } from "../../src/dag";
// import data from '../static/instance4.json';
// import data from '../static/nested_dag_data.json';
// import fundSecurityData from '../static/fund_security.json';
// const data = dealData(fundSecurityData);
// import soda from '../static/soda.json';
// import data from '../static/nested_dag_data.json';
// const data = JSON.parse(JSON.stringify(dataraw));
const expandIcon = "&#xe610;";
const collapseIcon = "&#xe60f;";
//

const data = {
  nodes: [
    { id: "1", label: "1", width: 100, height: 40 },
    { id: "2", label: "2", width: 100, height: 40 },
    { id: "3", label: "3", width: 100, height: 40 },
    { id: "4", label: "4", width: 100, height: 40 },
  ],
  edges: [
    { source: "1", target: "2" },
    { source: "2", target: "3" },
    { source: "3", target: "4" },
    { source: "4", target: "1" },
    // { source: 'g3', target: 'g4' },
  ],
  groups: [
    { id: "g1", children: ["2", "3"] },
    { id: "g3", children: ["4"] },
    { id: "g5", children: ["g3"] },
    { id: "g6", children: ["g5"] },
    { id: "g4", children: ["1"] },
  ],
};

const changeTypeColor = {
  other: "#ffffff",
  "#c44e52": "#c44e52",
  "#25a868": "#25a868",
  "#dd8452": "#dd8452",
};
const changeTypeIcon = {
  "#c44e52": "&#xe605;",
  "#25a868": "&#xe606;",
  "#dd8452": "&#xe601;",
};
registerEdge("spline", {
  extends: null,
  getShape(shapeConfigs: any) {
    return new Path(shapeConfigs);
  },

  updateKeyShape(keyShape: any, configs: any): any {
    const path = this.getPath(configs);
    keyShape.set("path", path);
  },
  getPath(configs: any) {
    return getSplinePath(configs);
  },
});

(async () => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  // 初始化 graph 实例
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.01,
    maxRatio: 8,
    // linkCenter: false,
    animate: false,
    setDefaultNode(nodeData: any) {
      let icons = null as any;
      // 设置icon随changeType变化
      if (nodeData?.changeType) {
        const icon =
          changeTypeIcon[nodeData.changeType as keyof typeof changeTypeIcon];
        icon &&
          (icons = [
            {
              setStyles: (data: any) => {
                return {
                  icon,
                  size: 15,
                  fillStyle:
                    changeTypeColor[
                      (nodeData?.changeType ??
                        "other") as keyof typeof changeTypeColor
                    ],
                };
              },
              position: [0.9, 0.5],
            },
          ]);
      }

      return {
        type: "Rect",
        radius: 10,
        width: nodeData.width ?? 100,
        height: nodeData.height ?? 20,
        strokeStyle: "#4170F2",
        fillStyle: changeTypeColor["other"],
        label: {
          offsetX: nodeData?.changeType ? -6 : 0,
          width: 80,
          text: nodeData.text ?? nodeData.id,
          fillStyle: "111",
          textOverflow: "ellipsis",
          opacity: 1.0,
        },
        icons,
        anchors: [
          [0, 0.5],
          [1, 0.5],
          // [0.5, 0],
          // [0.5, 1],
        ],
        opacity: 0.5,
      };
    },
    setNodeStateStyles(state: string, data: any) {
      if (state === "hide") {
        return { fillStyle: data.color };
      }
    },
    setDefaultEdge(edge: any) {
      return {
        type: "spline",
        useSplineTerminal: true,
        endArrow: {
          width: 5,
          height: 7,
        },
        radius: 10,
        strokeStyle: "#666666",
        appendSize: 2,
        lineWidth: 2,
        opacity: 1.0,
      };
    },
    setEdgeStateStyles(state) {
      if (state === "active") {
        return {
          opacity: 1.0,
          strokeStyle: "#666666",
        };
      }
      return { opacity: 0.01 };
    },
    setDefaultGroup(groupData: any) {
      return {
        linkNode: true,
        fillStyle: "rgba(44, 160, 44,0.15)",
        strokeStyle: "#DDE2E9",
        linkGroupOnCollapse: true,
        padding: [10, 10, 10, 10],
        radius: 4,
        anchors: [
          [0, 0.5],
          [1, 0.5],
          [0.5, 0],
          [0.5, 1],
        ],
        capture: false,
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
            text: group.get("text") ?? group.get("id"),
            width: width - 40 - 16,
            textOverflow: "ellipsis",
          });
          layer.add(text);
          return 32;
        },
      };
    },
  });
  // 写入数据
  graph.data(data as any);

  console.time("loadWasm");
  await loadWasm(new URL("../static/dotlayout.wasm", import.meta.url));
  console.timeEnd("loadWasm");
  const dot = new WasmDAGLayout({
    graph,
    options: {
      rankDir: "LR",
      lineType: "polyline",
      rankSep: 50,
      nodeSep: 50,
    },
  });
  graph.refresh();
  graph.fitView();

  graph.addBehavior(dragCanvas, { canvasOnly: false });
  graph.addBehavior(panZoom);
  graph.addBehavior(highlightRelations);
  graph.on("node:click", (e) => {
    console.log(e.target);
  });
  graph.on("edge:click", (e) => {
    console.log(e.target);
  });
  graph.on("group:click", (e) => {
    console.log(e.target);
  });
  (window as any)._graph = graph;
  function toggleGroup(group: Group) {
    if (group.get("collapsed")) {
      group.expand();
      group.set("fixLeft", undefined);
      group.set("fixTop", undefined);
      group.set("fixWidth", undefined);
      group.set("fixHeight", undefined);
      group.refreshBox();
      dot.layout();
      graph.refresh();
      // graph.fitView()
    } else {
      group.collapse();
      group.refreshBox();
      dot.layout();
      graph.refresh();
    }
  }
})();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dealData(data: any) {
  const nodes = data.nodes.filter(
    (d: { is_group: string }) => d.is_group === "0"
  );
  const groups = data.nodes.filter(
    (d: { is_group: string }) => d.is_group === "1"
  );
  const groupMap: any = {};
  for (const group of groups) {
    if (groupMap[group.id]) {
      console.log("duplicate group:", group.id);
    } else {
      groupMap[group.id] = { ...group };
    }
  }

  // const edges = data.edges.concat();
  const edges: any[] = data.edges.map(
    (d: { source: string; target: string }) => {
      return {
        source: data.nodes[parseInt(d.source)].id,
        target: data.nodes[parseInt(d.target)].id,
      };
    }
  ); // egdes 应该具有 source 和 target

  const topGroup = [] as any[];
  for (const group of groups) {
    // 从 groups 构造 group 的嵌套关系
    if (group.group && group.group !== "") {
      if (groupMap[group.group]) {
        const parent = groupMap[group.group];
        parent.children = parent.children || [];
        parent.children.push(group);
        (group as any).parent = parent;
      } else {
        console.log("group not found:", group.group);
      }
    } else {
      topGroup.push(group);
    }
  }

  for (const node of nodes) {
    // 将叶子节点添加到 group 中
    if (groupMap[node.group as string]) {
      const parent = groupMap[node.group as string];
      parent.children = parent.children || [];
      parent.children.push(node);
      (node as any).parent = parent;
    } else {
      console.log("group not found:", node.group);
    }
  }
  const groupData: any = [];
  Object.keys(groupMap).forEach((key: any) => {
    const group = groupMap[key];
    group._children = group.children;
    group.children = group.children.map((child: any) => child.id || child.key);
    groupData.push(group);
  });
  console.log(edges);
  return { nodes, edges, groups: groupData };
}
