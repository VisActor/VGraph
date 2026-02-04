import { Graph } from '../../../graph';
import { Edge, Node, Group } from '../../../models/entities';
import { CommandBase } from './base';
import { isEmptySelections, getSelectionsSnapshot, batchAdd, batchRemove } from './utils';
import { ACTION_TYPES } from '../../../consts/action_types';

type RemoveArgs = {
  entity?: Node | Edge | Group;
  ungroup?: boolean;
};

export const RemoveCommand = Object.assign({}, CommandBase, {
  name: 'remove',
  shouldExecute(graph: Graph, args: RemoveArgs) {
    const entity = args.entity;
    if (entity) {
      if (entity.isDestroyed()) {
        console.error(`${entity.type} id ${entity.get('id')} is destroyed, remove failed.`);
        return false;
      }
    } else if (isEmptySelections(graph.get('_selections'))) {
      return false;
    }
    return true;
  },
  getSnapshot(graph: Graph, args: RemoveArgs) {
    const entity = args.entity;
    const selection = {
      node: [] as string[],
      edge: [] as string[],
      group: [] as string[],
    };
    entity && selection[entity.type].push(entity.get('id'));
    return {
      ...args,
      selectionConfigs: getSelectionsSnapshot(graph, entity ? selection : graph.get('_selections'), args.ungroup),
    }
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    batchRemove(graph, snapshot.selectionConfigs);
    graph.enableAutoDraw(autoDraw);
    return ({
      node: [],
      edge: [],
      group: [],
    });
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    batchAdd(graph, snapshot.selectionConfigs);
    graph.enableAutoDraw(autoDraw);
  },
  redo(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    batchRemove(graph, snapshot.selectionConfigs);
    graph.enableAutoDraw(autoDraw);
    return ({
      node: [],
      edge: [],
      group: [],
    });
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    const change = {};
    const type = `${snapshot.type}`;
    change[type] = [snapshot.configs];
    return {
      action: ACTION_TYPES.REMOVE,
      change: snapshot.selectionConfigs,
    };
  },
  getUndoChanges(snapshot: Record<string, any>) {
    const change = {};
    const type = `${snapshot.type}`;
    change[type] = [snapshot.configs];
    return {
      action: ACTION_TYPES.ADD,
      change: snapshot.selectionConfigs,
    };
  },
});
