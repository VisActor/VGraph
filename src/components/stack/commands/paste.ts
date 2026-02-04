import { Graph } from '../../../graph';
import { uuid } from '../../../utils';
import { CommandBase } from './base';
import { batchAdd, batchRemove } from './utils';
import { ACTION_TYPES } from '../../../consts/action_types';

export const PasteCommand = Object.assign({}, CommandBase, {
  name: 'paste',
  shouldExecute(graph: Graph, args: { event: ClipboardEvent, position?: number[] }) {
    const event = args.event;
    const text = event.clipboardData?.getData('text/plain');
    if (!text) {
      return false;
    }
    let copyInfo;
    try {
      copyInfo = JSON.parse(text);
    } catch (e) {
      return false;
    }
    if (!copyInfo || copyInfo.id !== 'xgraphEditor') {
      return false;
    }
    return true;
  },

  getSnapshot(graph: Graph, args: { event: ClipboardEvent, position?: number[] }) {
    const text = args.event.clipboardData?.getData('text/plain');
    const copyInfo = JSON.parse(text!);
    if (!graph.get('_paste')) {
      graph.set('_paste', {});
    }
    const paste = graph.get('_paste');
    const count = paste[copyInfo.uuid] || 0;
    let offset = (count + 1) * 20;
    if (copyInfo.type === 'cut') {
      offset -= 20;
    }
    const nodeMap = {};
    const position = args.position;
    const grid = graph.get('_grid');
    if (position && grid){
      const step = grid?.getStep() || 10;
      position[0] = Math.round(position[0] / step) * step;
      position[1] = Math.round(position[1] / step) * step;
    }
    const bbox = {
      // left: 0, top: 0, width: 0, height: 0,
      x: 0,
      y: 0
    };
    if (position) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      ['group', 'node'].forEach((type: string) => {
        copyInfo[type].forEach((configs: any) => {
          const { x, y, width, height } = configs;
          minX = Math.min(minX, x - 0.5 * width);
          minY = Math.min(minY, y - 0.5 * height);
          maxX = Math.max(maxX, x + 0.5 * width);
          maxY = Math.max(maxY, y + 0.5 * height);
        });
      });
      bbox.x = 0.5 * (minX + maxX);
      bbox.y = 0.5 * (minY + maxY);
    }
    let offsetX = offset;
    let offsetY = offset;
    if (position) {
      offsetX = position[0] - bbox.x;
      offsetY = position[1] - bbox.y;
    }
    ['group', 'node'].forEach((type: string) => {
      const transform = type === 'node' ? graph.get('setDefaultNode') : graph.get('setDefaultGroup');
      copyInfo[type].forEach((configs: any) => {
        const formerId = configs.id;
        delete configs.id;
        const id = transform?.(configs)?.id || uuid(10);
        nodeMap[formerId] = id;
        configs.id = id;
        if (configs.groupId) {
          configs.groupId = nodeMap[configs.groupId];
        }
        if ((position || offset) && type === 'node') {
          configs.x += offsetX;
          configs.y += offsetY;
        }
      });
    });

    copyInfo.edge.forEach((configs: any) => {
      configs.id = graph.get('setDefaultEdge')?.(configs)?.id || uuid(10);
      // FIXME: 目前单个连线的复制会与原连线重合，之后遇到相关场景再结合诉求看怎么展示
      configs.source = nodeMap[configs.source] || configs.source;
      configs.target = nodeMap[configs.target] || configs.target
      configs.startPoint[0] += offsetX;
      configs.startPoint[1] += offsetY;
      configs.endPoint[0] += offsetX;
      configs.endPoint[1] += offsetY;

      configs.controlPoints?.forEach((point: number[]) => {
        point[0] += offsetX;
        point[1] += offsetY;
      });
    });

    copyInfo.group.forEach((configs: any) => {
      configs.children.forEach((id: string, index: number) => {
        configs.children[index] = nodeMap[id];
      });
    });

    return {
      addConfigs: copyInfo,
      offset,
      position,
      bbox,
    };
  },
  execute(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    const { addConfigs, position } = snapshot;

    // execute count 应该递减
    if (!position) {
      const paste = graph.get('_paste');
      const count = paste[addConfigs.uuid] || 0;
      paste[addConfigs.uuid] = count + 1;
    }
    batchAdd(graph, addConfigs);
    graph.enableAutoDraw(autoDraw);
    return {
      node: addConfigs.node.map((configs: any) => configs.id),
      edge: addConfigs.edge.map((configs: any) => configs.id),
      group: addConfigs.group.map((configs: any) => configs.id)
    };
  },
  undo(snapshot: Record<string, any>, graph: Graph) {
    const autoDraw = graph.disableAutoDraw();
    const { addConfigs, position } = snapshot;

    // undo count 应该递减
    if (!position) {
      const paste = graph.get('_paste');
      const count = paste[addConfigs.uuid] || 0;
      paste[addConfigs.uuid] = count - 1;
    }

    batchRemove(graph, addConfigs);
    graph.enableAutoDraw(autoDraw);
  },
  getExecuteChanges(snapshot: Record<string, any>) {
    return {
      action: ACTION_TYPES.ADD,
      change: snapshot.addConfigs,
    };
  },
  getUndoChanges(snapshot: Record<string, any>) {
    return {
      action: ACTION_TYPES.REMOVE,
      change: snapshot.addConfigs,
    };
  },
});
