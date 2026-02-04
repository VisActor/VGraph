import { Graph } from '../../../graph';
import { uuid } from '../../../utils';
import { CommandBase } from './base';
import { isEmptySelections, getCleanSnapshot } from './utils';

export const CopyCommand = Object.assign({}, CommandBase, {
  name: 'copy',
  instack: false,
  mode: ['edit', 'read'],
  shouldExecute(graph: Graph, args: { event: ClipboardEvent }) {
    if (isEmptySelections(graph.get('_selections'))) {
      return false;
    }
    return true;
  },
  execute(snapshot: { event: ClipboardEvent }, graph: Graph) {
    const selections = graph.get('_selections');
    const event = snapshot.event;
    const configs = getCleanSnapshot(graph, selections);
    configs.id = 'xgraphEditor';
    configs.uuid = uuid(10);
    graph.set('_paste', {});
    // configs.selections = cloneDeep(selections);
    // graph.set('pasteSelections', configs.selections);
    event.clipboardData?.setData('text/plain', JSON.stringify(configs));
    event.preventDefault();
  }
});