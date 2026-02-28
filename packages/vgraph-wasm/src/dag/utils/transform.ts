import { Graph } from "@visactor/vgraph";
import { DotLayoutConfigs } from "../type";

export function normalizePadding(padding: number | number[]) {
  if (typeof padding === "number") {
    return [padding, padding, padding, padding];
  } else if (padding.length === 2) {
    // 上 右 下 左
    return [padding[0], padding[1], padding[0], padding[1]];
  }
  return padding;
}

const DOT_SCALE = 96;
// 1 IN = 72 Points = 96 pixels
// 1 pixel = 0.75 points
function toNestGroup(graph: Graph) {
  const groups = graph.getGroups();
  const groupMap = new Map<string, any>();
  for (const group of groups) {
    // 创建新的 Group
    const groupId = group.get("id");
    const asNode = group.get("collapsed") && group.get("linkGroupOnCollapse");
    // 当做节点来看待
    const padding = normalizePadding(group.get("padding"));

    const newGroup = {
      id: groupId,
      isGroup: !asNode, // 收起且 linkGroupOnCollapse 的 Group 当做节点来看
      titleHeight: group.titleHeight,
      padding,
      width: group.get("width"),
      height: group.get("height"),
      // 收起切linkGroup
      children: [],
    };
    groupMap.set(groupId, newGroup);
  }

  const topGroups = [] as any[];
  for (const group of groups) {
    // 获取嵌套关系，groups 是平铺的，需要从 children 里面获取嵌套关系
    const children = group.get("children") ?? group.children;
    const groupId = group.get("id");
    if (!group.belong) {
      topGroups.push(groupMap.get(groupId));
    }
    if (!children) {
      continue;
    }
    for (const child of children) {
      const childId = child;
      const childGroup = groupMap.get(childId);
      const parent = groupMap.get(groupId);
      if (childGroup) {
        childGroup.parent = parent;
        parent.children = parent.children || [];
        parent.children.push(childGroup);
      } else {
        parent.children.push({
          id: childId,
          width: graph.getNodeById(childId).get("width"),
          height: graph.getNodeById(childId).get("height"),
          isGroup: false,
        });
      }
    }
  }
  for (const node of graph.getNodes()) {
    if (!node.get("groupId")) {
      topGroups.push({
        id: node.get("id"),
        width: node.get("width"),
        height: node.get("height"),
        isGroup: false,
      });
    }
  }
  return { topGroups, groupMap };
}

function groupsToGraphVizDotStr(groups: any) {
  let resStr = "";
  for (const group of groups) {
    if (group.isGroup) {
      const padding = normalizePadding(group.padding ?? 10);
      resStr += 'subgraph "cluster_' + group.id + '" ' + " { \n";
      resStr += `titleHeight=${group.titleHeight * 0.75}\n`;
      resStr += `pad0=${padding[0] * 0.75}\n`;
      resStr += `pad1=${padding[1] * 0.75}\n`;
      resStr += `pad2=${padding[2] * 0.75}\n`;
      resStr += `pad3=${padding[3] * 0.75}\n`;
      resStr += `margin="${4}" ;\n`; // graphviz 目前只支持相同的 margin
      resStr += 'label = "."; \n';
      resStr += groupsToGraphVizDotStr(group.children);
      resStr += "}\n";
      // 1 pixel = 0.75 point
    } else {
      console.log(group.width, group.height);
      resStr +=
        ' "' +
        group.id +
        '" ' +
        `[label="",shape=rect,width=${group.width / DOT_SCALE},height=${
          group.height / DOT_SCALE
        }];\n`;
    }
  }
  return resStr;
}
function edgesToGraphVizDotStr(
  graph: any,
  groupMap: Map<string, any>,
  compassAnchor = true
) {
  let resStr = "";
  const edges = graph.getEdges();
  const compassAnchorStr = compassAnchor ? ":_" : "";
  for (const edge of edges) {
    const source = edge.get("source");
    const isSourceGroup = groupMap.get(source)?.isGroup;
    const target = edge.get("target");
    const isTargetGroup = groupMap.get(target)?.isGroup;
    if (edge.isVisible() || !(isSourceGroup || isTargetGroup)) {
      resStr += `"${source}"${compassAnchorStr}->"${target}"${compassAnchorStr} [dir=none arrowhead=none arrowtail=none]; \n`;
    }
  }
  return resStr;
}

export function dotStr(graph: Graph, options: DotLayoutConfigs["options"]) {
  let resStr = `digraph dotgraph {
     #   samehead=1;
     #   sametail=1;
        splines=${options!.lineType};
        compound=true;
        CL_OFFSET_RANK=${8};
        CL_OFFSET=${8};
   #    newrank=1;
        rankdir="${options!.rankDir}";
        nodesep=${options!.nodeSep! / DOT_SCALE};
        ranksep=${options!.rankSep! / DOT_SCALE};
    `;

  const { topGroups, groupMap } = toNestGroup(graph);
  resStr += groupsToGraphVizDotStr(topGroups);
  resStr += edgesToGraphVizDotStr(
    graph,
    groupMap,
    options?.lineType === "spline" ? false : options?.compassAnchor
  );
  resStr += "}\n";
  return resStr;
}

export function dealGraphVizResult(resStr: string) {
  const res = {
    nodePos: {} as any,
    edgeCp: {} as any,
  };
  const edgeCnt = {} as Record<string, number>;
  for (const line of resStr.split(/\r?\n/)) {
    if (line.startsWith("node")) {
      const info = line.split(/"([^"]+)"|\s+/).filter(Boolean);
      res.nodePos[info[1]] = {
        x: parseFloat(info[2]) * DOT_SCALE,
        y: -parseFloat(info[3]) * DOT_SCALE,
        rank: parseInt(info[4]),
        order: parseInt(info[5]),
        width: parseFloat(info[6]) * DOT_SCALE,
        height: parseFloat(info[7]) * DOT_SCALE,
      };
    }
    if (line.startsWith("edge")) {
      const info = line.split(/"([^"]+)"|\s+/).filter(Boolean);
      let srcTgt =
        info[1].replace(/\"/g, "") + "-and-" + info[2].replace(/\"/g, "");
      if (edgeCnt[srcTgt] === undefined) {
        edgeCnt[srcTgt] = 0;
      } else {
        edgeCnt[srcTgt]++;
        srcTgt += "-" + edgeCnt[srcTgt];
      }
      const len = parseInt(info[3]);
      const cps = [];
      for (let i = 0; i < len; i++) {
        cps.push([
          parseFloat(info[2 * i + 4]) * DOT_SCALE,
          -parseFloat(info[2 * i + 5]) * DOT_SCALE,
        ]);
      }
      res.edgeCp[srcTgt] = cps;
    }
  }
  return res;
}
