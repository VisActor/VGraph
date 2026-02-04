import { getFontByConfigs } from "../../src/renderer/utils/text";

import {
  dragCanvas,
  Graph,
  panZoom,
  Text,
  highlightRelations,
  Group,
  Icon,
  textUtil,
  Edge,
  NestedDAG,
  uuid,
  Layer,
  Rect,
} from "../../src";
import { Grid, Router } from "../../src/components";

console.time();
import data from "../static/nested_dag_data.json";
// import case1 from '../static/ads3.json';
const expandIcon = "&#xe610;";
const collapseIcon = "&#xe60f;";

const changeTypeColor = {
  other: null,
  "#c44e52": "#c44e52",
  "#25a868": "#25a868",
  "#dd8452": "#dd8452",
};
const changeTypeIcon = {
  "#c44e52": "&#xe605;",
  "#25a868": "&#xe606;",
  "#dd8452": "&#xe601;",
};

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "1800px";
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 1800,
    height: 800,
    minRatio: 0.01,
    maxRatio: 8,
    animate: false,
    setDefaultNode(nodeData: any) {
      let icons = null as any;
      if (nodeData?.changeType) {
        const icon = changeTypeIcon[nodeData.changeType];
        icons = [
          {
            setStyles: (data: any) => {
              return {
                icon,
                size: 15,
                fillStyle: changeTypeColor[nodeData?.changeType ?? "other"],
                fontFamily: "coloriconfont",
              };
            },
            position: [0.9, 0.5],
          },
        ];
      }

      return {
        type: "Rect",
        radius: 10,
        width: nodeData.width ?? 120,
        height: nodeData.height ?? 30,
        strokeStyle: "#4170F2",
        fillStyle: "#dd8452",
        label: {
          offsetX: nodeData?.changeType ? -6 : 0,
          width: 90,
          text: nodeData.text ?? nodeData.id,
          fillStyle: "#111",
          textOverflow: "ellipsis",
          opacity: 1.0,
        },
        icons,
        anchors: [
          [0.0, 0.5],
          [1.0, 0.5],
          // [0.5, 0.0],
          // [0.5, 1.0],
        ],
        opacity: 0.3,
      };
    },
    setNodeStateStyles(state: string, data: any) {
      const node = graph.getNodeById(data.id);
      const label: any = node.layer.find((shape: any) => shape.type === "text");
      // if (state === 'active') {
      //   console.log({ ...node.configs });
      // }
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
        id: edge.source + "-" + edge.target + uuid(),
        // type: 'quadratic',
        type: "vLine",
        // type: 'hCubic',
        endArrow: {
          width: 9,
          height: 12,
        },
        radius: 0,
        strokeStyle: "#64b5cd",
        appendSize: 2,
        lineWidth: 2,
        opacity: 1.0,
      };
    },
    setEdgeStateStyles(state) {
      if (state === "active") {
        return {
          opacity: 1.0,
          strokeStyle: "#64b5cd",
        };
      }
      return { opacity: 0.01 };
    },
    setDefaultGroup(groupData: any) {
      return {
        linkNode: true,
        fillStyle: [
          "rgba(243,255,239,0.5)",
          "rgba(235,194,194,0.3)",
          "rgba(192,214,204,0.3)",
          "rgba(235,194,194,0.3)",
          "rgba(192,214,204,0.3)",
        ][groupData.depth],
        // strokeStyle: '#AAB2C9',
        linkGroupOnCollapse: true,
        // padding: [10, 100, 100, 10],
        padding: 20,
        radius: 4,
        anchors: [
          [0, 0.5],
          [1, 0.5],
        ],
        capture: false,
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

  graph.addBehavior(panZoom, { sensitivity: 5 });
  //   graph.addBehavior(hideDetails, { hideRatio: 0.4, hideState: 'hide' });
  graph.addBehavior(dragCanvas, {
    canvasOnly: false,
    // shouldTrigger: (e: any, shape: any) => {
    //   console.log(e.target,shape, e.relatedTarget.parent);
    //   if (e.target.type === 'node') {
    //     return false;
    //   }
    //   return true;
    // },
  });
  // graph.addBehavior(dragNode);
  graph.addBehavior(highlightRelations);

  graph.data(data);
  const nestedDag = new NestedDAG({
    graph: graph,
    // groups: topGroup,
    dagOptions: {
      rankDir: "LR",
      nodeSep: 30,
      edgeSep: 10,
      rankSep: 50,
      ranker: "networkSimplex",
      cache: true,
    },
  });
  // 取消注释将默认收起
  // graph.getGroups().map(d=>{
  //   if (!d.belong){
  //     d.collapse(false);
  //   }
  // });

  graph.refresh();
  graph.draw();
  const gridComponent = new Grid(graph, { ignoreGroupTitle: false });
  gridComponent.refresh();
  const router = new Router(gridComponent, {
    allowDiagonal: "never",
    minDist: 20,
  });
  for (const edge of graph.getEdges()) {
    findPath(edge, router);
  }
  graph.refresh();
  graph.draw();

  graph.fitView();

  graph.on("edge:click", (e) => {
    e.target.setState("show");
    console.log(e.target, e.target.getTerminal());
  });
  // graph.data(newData);
  (window as any).__graph = graph;
  document.fonts.ready.then(() => {
    graph.draw();
  });
  function toggleGroup(group: Group) {
    if (group.get("collapsed")) {
      group.expand();
      nestedDag.layout({ rank: true, order: true });
      graph.refresh();
      // gridComponent.refresh();
      for (const edge of graph.getEdges()) {
        if (edge.isVisible()) {
          findPath(edge, router);
        }
      }
      // gridShape(graph, gridComponent);
      graph.refresh();
    } else {
      group.collapse();
      nestedDag.layout({ rank: true, order: true });
      graph.refresh();
      // gridComponent.refresh();
      for (const edge of graph.getEdges()) {
        if (edge.isVisible()) {
          findPath(edge, router);
        }
      }
      // gridShape(graph, gridComponent);
      graph.refresh();
    }
  }
})();

function findPath(edge: Edge, router: Router) {
  router.updateEdgePath(edge);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gridShape(graph: Graph, gridComponent: Grid) {
  const layer = graph.get("gridLayer") ?? new Layer();
  layer.clear();
  const { rows, cols, left, top, grid, step } = gridComponent.gridData;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 0) {
        continue;
      } else {
        layer.add(
          new Rect({
            left: left + j * step,
            top: top + i * step,
            width: step,
            height: step,
            fillStyle: "#000",
            strokeStyle: "#fff",
          })
        );
      }
    }
  }
  graph.getContainer().add(layer);
  layer.toBack();
  graph.set("gridLayer", layer);
}
