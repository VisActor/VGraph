import { Graph, TreeGraph,GraphStructure } from '../';

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

export function breadthFirstSearch(
  graph: GraphStructure | Graph | TreeGraph,
  startNode: any,
  callbacks: any,
) {
  callbacks = initCallbacks(callbacks);
  const nodeStack: any[] = [];
  let previousNode: any = null;
  const startNodeId = startNode.get('id');

  nodeStack.push(startNode);

  while (nodeStack.length) {
    const currentNode = nodeStack.shift();
    callbacks.enterNode({ currentNode, previousNode });

    currentNode?.targets.forEach((id: string) => {
      const nextNode = graph.getNodeMap()[id];
      if (
        nextNode.get('id') !== startNodeId &&
        callbacks.shouldVisit({ previousNode, currentNode, nextNode })
      ) {
        nodeStack.push(nextNode);
      }
    });

    callbacks.leaveNode({ currentNode, previousNode });
    previousNode = currentNode;
  }
}
