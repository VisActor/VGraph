export function tarjanScc(graph: any) {
  const visitedTime: any = {};
  const lowTime: any = {};
  const stack: string[] = [];
  const visited: string[] = [];
  const result: any = [];
  let time = 0;
  const nodeMap = graph.getNodeMap();
  Object.values(nodeMap).forEach((node: any) => {
    if (visited.includes(node.get("id"))) {
      return;
    }
    scc(node);
  });

  function scc(node: any) {
    const id = node.get("id");
    visited.push(id);
    visitedTime[id] = time;
    lowTime[id] = time;
    time++;
    stack.push(id);
    if (node.targets) {
      node.targets.forEach((targetId: string) => {
        // 如果后续节点未访问，访问节点，看是否有回溯边，如果有，更新此节点 lowTime
        if (!visited.includes(targetId)) {
          scc(nodeMap[targetId]);
          lowTime[id] = Math.min(lowTime[id], lowTime[targetId]);
        } else if (stack.includes(targetId)) {
          lowTime[id] = Math.min(lowTime[id], visitedTime[targetId]);
        }
      });
    }
    // 如果 lowTime === visitedTime，则是一个强连通分量的起点
    if (lowTime[id] === visitedTime[id]) {
      let v;
      const component = [];
      do {
        v = stack.pop();
        component.push(v);
      } while (id !== v);
      result.push(component);
    }
  }
  return result;
}
