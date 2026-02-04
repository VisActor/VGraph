import { Graph } from '../../../graph';
import { CommandBase } from '../../../components/stack/commands/base';
type ExpandNodeArgs = {
  id: string;
};

export const CollapseNodeCommand = Object.assign({}, CommandBase, {
  name: 'collapseNode',
  savePosition: false,
  getSnapshot(graph: Graph, args: ExpandNodeArgs) {
    return {
      ...args,
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const selections = {
      node: [snapshot.id],
      edge: [],
      group: []
    };
    return selections;
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const selections = {
      node: [snapshot.id],
      edge: [],
      group: []
    };
    return selections;
  },
});