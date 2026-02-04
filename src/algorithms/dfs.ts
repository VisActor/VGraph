import { Graph, GraphStructure, TreeGraph } from '../';

export function depthFirstSearch(graph: GraphStructure | Graph | TreeGraph, startNode: any, callbacks: any) {
  const previousNode = null;
  depthFirstSearchRecursive(graph, startNode, previousNode, initCallbacks(callbacks));
}

function initCallbacks(callbacks: any) {
  // tslint:disable-next-line: no-empty
  const stubCallback = () => {};
  const shouldVisitCallback = (() => {
    const seen: any = {};
    return ({ nextNode }: { nextNode: any }) => {
      const id = nextNode.get('id');
      if (!seen[id]) {
        seen[id] = true;
        return true;
      }
      return false;
    };
  })();

  if (typeof callbacks === 'function') {
    return {
      shouldVisit: shouldVisitCallback,
      enterNode: callbacks,
      leaveNode: stubCallback,
    };
  }

  return {
    shouldVisit: callbacks.shouldVisit || shouldVisitCallback,
    enterNode: callbacks.enterNode || stubCallback,
    leaveNode: callbacks.leaveNode || stubCallback,
  };
}

function depthFirstSearchRecursive(
  graph: GraphStructure | Graph | TreeGraph,
  currentNode: any,
  previousNode: any,
  callbacks: any
) {
  callbacks.enterNode({ currentNode, previousNode });
  if (!currentNode.targets) {
    callbacks.leaveNode({ currentNode, previousNode });
    return;
  }
  currentNode.targets.forEach((child: string) => {
    const nextNode = graph.getNodeMap()[child];
    if (callbacks.shouldVisit({ previousNode, currentNode, nextNode })) {
      depthFirstSearchRecursive(graph, nextNode, currentNode, callbacks);
    }
  });

  callbacks.leaveNode({ currentNode, previousNode });
}
