import { GraphStructure } from "@visactor/vgraph";
import { IDataOptions } from "./types";

const SUB_GROUP_HEADER = 28;
const SUB_GROUP_GAP = 20;
const TABLE_HEIGHT = 40;

function normalizeData(
  data: GraphStructure,
  baseTable: string,
  filter?: any,
  search?: any
) {
  let minDepth = 0;
  let maxDepth = 0;

  // const cycles = detectAllCycles(data);

  // // 如果有环，将环的其中一条边反转
  // if (cycles.length) {
  //   cycles.forEach((cycle: string[]) => {
  //     const sourceData = nodeMap[cycle[0]];
  //     const sourceIndex = sourceData.targets.indexOf(cycle[1]);
  //     sourceData.targets.splice(sourceIndex, 1);
  //     sourceData.sources.push(cycle[1]);
  //     const targetData = nodeMap[cycle[1]];
  //     const targetIndex = targetData.sources.indexOf(cycle[0]);
  //     targetData.sources.splice(targetIndex, 1);
  //     targetData.targets.push(cycle[0]);
  //   });
  // }

  const nodeMap = data.getNodeMap();
  // 边整理
  normalizeEdges(data);
  if (nodeMap[baseTable].depth === undefined) {
    Object.values(nodeMap).forEach((node: any) => {
      delete node.depth;
      delete node.filtered;
      node.set("search", false);
    });
    nodeMap[baseTable].depth = 0;
    setDepth(baseTable, -1);
    setDepth(baseTable, 1);
  } else {
    // Bugfix: 由于 minDepth maxDepth 放开，很多业务未指定 minDepth maxDepth
    // 未指定 minDepth 和 maxDepth 且未更换数据的情况下，options 发生变更，如搜索
    // 会导致 minDepth 和 maxDepth 是 0，从而导致叠在一起。
    // 已有多个业务方导致该问题，在此进行兜底。
    Object.values(nodeMap).forEach((node: any) => {
      delete node.filtered;
      node.set("search", false);
      if (node.depth !== undefined) {
        minDepth = Math.min(node.depth, minDepth);
        maxDepth = Math.max(maxDepth, node.depth);
      }
    });
  }

  function setDepth(id: string, step: number) {
    const queue: any = [];
    const visited: string[] = [];
    queue.push(nodeMap[id]);

    while (queue.length > 0) {
      const tableData = queue.shift();
      const id = tableData.get("id");
      if (id && !visited.includes(id)) {
        visited.push(id);
        if (step > 0) {
          tableData.targets.forEach((child: string) => {
            const childData = nodeMap[child];
            if (childData.depth === undefined) {
              childData.depth = tableData.depth + step;
              maxDepth = Math.max(maxDepth, tableData.depth + step);
              queue.push(childData);
            }
          });
        } else {
          tableData.sources.forEach((parent: string) => {
            const parentData = nodeMap[parent];
            if (parentData.depth === undefined) {
              parentData.depth = tableData.depth + step;
              minDepth = Math.min(minDepth, tableData.depth + step);
              queue.push(parentData);
            }
          });
        }
      }
    }
  }

  const groups: any = {};
  Object.values(nodeMap).forEach((entity: any) => {
    if (entity.depth === undefined) {
      return;
    }
    const id = entity.get("id");
    let searched = false;
    if (search?.(entity)) {
      entity.set("search", true);
      searched = entity;
    }
    if (filter && !filter.value.includes(entity.get(filter.type))) {
      entity.filtered = true;
      if (entity.get("search")) {
        console.warn("The item searched is filtered!");
      }
      if (!groups[entity.depth]) {
        groups[entity.depth] = {
          id: entity.depth,
          depth: entity.depth,
          children: [],
          scroll: 0,
          searched,
        };
      }
      return;
    }
    if (groups[entity.depth]) {
      groups[entity.depth].searched = groups[entity.depth].searched || searched;
      groups[entity.depth].children.push(id);
    } else {
      groups[entity.depth] = {
        id: entity.depth,
        depth: entity.depth,
        children: [id],
        scroll: 0,
        searched,
      };
    }
    return entity;
  });
  return { groups, minDepth, maxDepth };
}

function normalizeEdges(data: GraphStructure) {
  const edgeMap: any = {};
  data.getEdges().forEach((edge: any) => {
    const key = `${edge.configs.source}:${edge.configs.target}`;
    if (edgeMap[key]) {
      edgeMap[key].configs.tasks.push(
        edge.configs.taskEntity || edge.configs.processId
      );
    } else {
      edgeMap[key] = {
        ...edge,
        configs: {
          ...edge.configs,
          tasks: [edge.configs.taskEntity || edge.configs.processId],
        },
        id: key,
      };
    }
  });
  data.entityMap.edge = edgeMap;
}

function layoutTableData(
  data: GraphStructure,
  options: any,
  minDepth: number,
  maxDepth: number
) {
  const baseTable = options.baseTableId;
  const nodeMap = data.getNodeMap();
  const result = normalizeData(data, baseTable, options.filter, options.search);
  const groups = result.groups;
  // 自由布局诉求很多因此放开，但要注意这种情况下筛选某列数据为空时列也将不展示
  if (!minDepth) {
    minDepth = result.minDepth;
  }
  if (!maxDepth) {
    maxDepth = result.maxDepth;
  }
  let depth = minDepth + 1;
  if (!groups[minDepth]) {
    groups[minDepth] = {
      depth: minDepth,
      children: [],
      scroll: 0,
    };
  }
  groups[minDepth].x = options.groupGap;
  groups[minDepth].width = options.getGroupWidth(
    minDepth,
    groups[minDepth].children.length
  );

  while (depth <= maxDepth) {
    if (!groups[depth]) {
      groups[depth] = {
        depth,
        children: [],
        scroll: 0,
      };
    }
    const width = options.getGroupWidth(depth, groups[depth].children.length);
    groups[depth].x = groups[depth - 1].x + options.groupGap + width;
    groups[depth].width = width;
    depth++;
  }

  const tableHeight = options.tableHeight || TABLE_HEIGHT;

  if (options.getGroupData) {
    // 分组
    Object.values(groups).forEach((group: any) => {
      const keyMap: any = {};
      const empty: string[] = [];
      group.children.forEach((id: string) => {
        const key = options.getGroupData(nodeMap[id].configs);
        if (!key && key !== 0) {
          empty.push(id);
        } else if (keyMap[key]) {
          keyMap[key].push(id);
        } else {
          keyMap[key] = [id];
        }
      });
      group.subGroupTitles = Object.keys(keyMap);
      if (empty.length) {
        keyMap.dataLineageEmptyGroup = empty;
        group.subGroupTitles.push("dataLineageEmptyGroup");
      }
      group.subGroups = keyMap;
    });
    // 根据分组定位
    Object.values(groups).forEach((group: any) => {
      let y = SUB_GROUP_HEADER;
      group.subGroupTitles.forEach((key: string) => {
        const subGroup = group.subGroups[key];
        subGroup.forEach((id: string) => {
          const node = nodeMap[id];
          node.y = y;
          y += tableHeight;
        });
        y += SUB_GROUP_GAP;
        y += SUB_GROUP_HEADER;
      });
      group.height = y + tableHeight;
    });
  } else {
    // 直接定位
    Object.values(groups).forEach((group: any) => {
      group.children.forEach((id: string, i: number) => {
        const node = nodeMap[id];
        node.y = i * tableHeight;
      });
      group.height = group.children.length * tableHeight;
    });
  }
  return {
    groupData: groups,
    width: groups[maxDepth].x + groups[maxDepth].width + options.groupGap,
  };
}

function layoutColumnData(data: GraphStructure, options: any) {
  const baseTable = data.getGroupById(options.baseTableId);
  const nodeMap = data.getNodeMap();
  const visited: string[] = [];
  let maxDepth = 0;
  let minDepth = 0;

  normalizeEdges(data);
  // 如果没有给到层级，自行计算
  if (baseTable.depth === undefined) {
    setDepth(baseTable, 0, -1);
    baseTable.depth = undefined;
    setDepth(baseTable, 0, 1);
  } else {
    data.getGroups().forEach((group: any) => {
      minDepth = Math.min(group.depth, minDepth);
      maxDepth = Math.max(group.depth, maxDepth);
    });
  }

  // TODO: 下面仅为临时做法。后续视业务方情况优化。
  const tempMaxDepth = maxDepth;
  data.getGroups().forEach((group: any) => {
    if (group.depth === undefined) {
      // 成环可能会有未被赋予depth的group，这里统一先放在 maxDepth + 1 层位置。
      group.depth = tempMaxDepth + 1;
      maxDepth = tempMaxDepth + 1;
    }
  });

  function setDepth(baseTable: any, depth: number, step: number) {
    if (baseTable.depth !== undefined) {
      return;
    }
    baseTable.depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    minDepth = Math.min(minDepth, depth);
    baseTable.children.forEach((colId: string) => {
      const col = nodeMap[colId];
      if (step < 0) {
        col.sources.forEach((parentId: string) => {
          const parent = nodeMap[parentId];
          const groupId = parent.get("groupId") || parent.groupId;
          if (!visited.includes(groupId)) {
            visited.push(groupId);
            const parentTable = data.getGroupById(groupId);
            setDepth(parentTable, depth + step, step);
          }
        });
      } else {
        col.targets.forEach((childId: string) => {
          const child = nodeMap[childId];
          const groupId = child.get("groupId") || child.groupId;
          if (!visited.includes(groupId)) {
            visited.push(groupId);
            const childTable = data.getGroupById(groupId);
            setDepth(childTable, depth + step, step);
          }
        });
      }
    });
  }
  return layoutColumns(data, options, minDepth, maxDepth);
}

function layoutColumns(
  data: GraphStructure,
  options: any,
  minDepth: number,
  maxDepth: number
) {
  const groupData: any = {};
  const rankMap: any = {};
  const nodeMap = data.getNodeMap();
  data.getGroups().forEach((group: any) => {
    let y = rankMap[group.depth] ? rankMap[group.depth] + 48 : 28;
    if (!groupData[group.depth]) {
      groupData[group.depth] = {
        depth: group.depth,
        scroll: 0,
        subGroups: [group],
      };
    } else {
      groupData[group.depth].subGroups.push(group);
    }
    if (group.collapsed) {
      rankMap[group.depth] = y;
      group.children.forEach((childId: string) => {
        const child = nodeMap[childId];
        child.depth = group.depth;
        child.y = y;
      });
      return;
    }
    group.children.forEach((childId: string) => {
      const child = nodeMap[childId];
      child.depth = group.depth;
      child.y = y;
      y += options.tableHeight;
    });
    rankMap[group.depth] = y;
  });
  let i = minDepth;
  let x = 50;
  while (i <= maxDepth) {
    const group = groupData[i];
    const width = options.getGroupWidth(i, group.subGroups.length);
    group.x = x;
    group.width = width;
    group.children = [];
    group.height = rankMap[i];
    group.subGroups.forEach((subGroup: any) => {
      group.children = group.children.concat(subGroup.children);
    });
    x += width + options.groupGap;
    i++;
  }
  return {
    groupData,
    width:
      groupData[maxDepth].x -
      groupData[minDepth].x +
      groupData[maxDepth].width +
      50,
  };
}

export function layoutData(
  data: GraphStructure,
  options: any,
  minDepth?: number,
  maxDepth?: number
) {
  if (options.mode === "column") {
    return layoutColumnData(data, options);
  }
  return layoutTableData(data, options, minDepth || 0, maxDepth || 0);
}

export function mergeOptions(options: IDataOptions) {
  return Object.assign(
    {
      groupGap: 50,
      mode: "table",
      tableHeight: 40,
      highlightEdge: true,
      highlightMode: "MAIN",
      resetOnClickBlank: true,
      getEdgeStyles() {
        return { strokeStyle: "#D1D5DA", lineWidth: 1 };
      },
      getEdgeHighlightStyles() {
        return { strokeStyle: "#3073F2" };
      },
      getGroupWidth(depth: number, count: number) {
        return 304;
      },
      getGroupName(depth: number, count: number) {
        if (depth === 0) {
          return "主节点";
        } else {
          return `${Math.abs(depth)}层${depth > 0 ? "下游" : "上游"}:${count}`;
        }
      },
      getTableId(table: any) {
        return table.id;
      },
      getTableName(table: any) {
        return table.name;
      },
    },
    options
  );
}

export function getCurvePoints(startBox: any, endBox: any, offset: number) {
  if (!startBox || !endBox) {
    return null;
  }
  const startX = startBox.left + startBox.width;
  const startPoint = [startX, startBox.top + startBox.height / 2];
  const endPoint = [endBox.left, endBox.top + endBox.height / 2];
  const startCP =
    startBox.top > endBox.top
      ? [startX + offset, startBox.top]
      : [startX + offset, startBox.top + startBox.height];
  const endCP =
    startBox.top > endBox.top
      ? [endBox.left - offset, endBox.top + endBox.height]
      : [endBox.left - offset, endBox.top];
  return [startPoint, startCP, endCP, endPoint];
}

export function getPath(startBox: any, endBox: any, source: any, target: any) {
  if (!startBox || !endBox) {
    return null;
  }
  const sourceTop = startBox.top + startBox.height / 2;
  const endTop = endBox.top + endBox.height / 2;
  let p;
  // 自环
  if (source.get("id") === target.get("id")) {
    const left = startBox.left + startBox.width;
    const top = startBox.top + 6;
    p = [
      ["M", left, top],
      ["L", left + 16, top],
      ["L", left + 16, top + startBox.height - 12],
      ["L", left, top + startBox.height - 12],
    ];
  } else if (source.depth === target.depth) {
    // 同层级引用
    const left = startBox?.left + startBox?.width;
    p = [
      ["M", left, sourceTop],
      ["L", left + 28, sourceTop],
      ["L", left + 28, endTop],
      ["L", left, endTop],
    ];
  } else {
    p = [
      ["M", startBox.left + startBox.width, sourceTop],
      ["L", endBox.left, endTop],
    ];
  }
  return p;
}

export function uuid(length: number) {
  const keys = "abcdefghijklmnopqrstuvwxyz".split("");
  let uuid = "";
  for (let i = 0; i < length; i++) {
    uuid += keys[Math.round(Math.random() * 26)];
  }
  return uuid;
}
