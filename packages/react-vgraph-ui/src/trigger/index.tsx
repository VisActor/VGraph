import { Trigger as ArcoTrigger } from '@arco-design/web-react';
import { Graph, GraphEvent, TreeGraph, Trigger as TriggerUtil, uuid } from '@visactor/vgraph';
import React, { ReactNode, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

const id = `vgraph${uuid(10)}`;

export const Trigger: any = ({
  graph,
  popup,
  target = 'node',
  showDelay = 0,
  hideDelay = 300,
  trigger = 'hover',
  triggerId = '',
  ...props
}: {
  graph: Graph | TreeGraph;
  popup: (entity?: any, shape?: any) => ReactNode;
  trigger: 'hover' | 'click' | 'contextMenu';
  triggerId?: string;
  style?: { [key: string]: string };
  className: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  target?: 'node' | 'edge' | 'group';
  showDelay?: number;
  hideDelay: number;
}) => {
  const [showInfo, setShowInfo] = useState<any>(undefined);
  const [triggerUtil, setTriggerUtil] = useState<TriggerUtil | null>(null);

  useEffect(() => {
    triggerUtil?.destroy();
    initTrigger();
  }, [graph, trigger, triggerId, hideDelay]);

  function initTrigger() {
    if (!graph) {
      return;
    }
    const triggerInst = new TriggerUtil(graph, {
      target,
      trigger,
      triggerId,
      showDelay,
      hideDelay: hideDelay || 200,
      popupContainer: `#${id}`,
      onVisibleChange(show: boolean, e?: GraphEvent, styles?: Record<string, number>) {
        if (show) {
          setShowInfo({
            e,
            styles,
          });
        } else {
          setShowInfo(null);
        }
      },
    });
    setTriggerUtil(triggerInst);
  }

  function hidePopup() {
    if (trigger !== 'hover') {
      triggerUtil?.hide();
    }
  }

  const memoPopup = useMemo(() => {
    return showInfo ? (
      <div id={id} onClick={hidePopup}>
        {popup(showInfo.e.target, showInfo.e.relatedTarget)}
      </div>
    ) : (
      <div />
    );
  }, [showInfo, popup]);

  const styles: any = {
    position: 'absolute',
    zIndex: -1,
  };

  if (showInfo?.styles) {
    Object.assign(styles, showInfo.styles);
  }

  return (
    graph &&
    createPortal(
      <ArcoTrigger {...props} trigger={trigger} popup={() => memoPopup} popupVisible={!!showInfo}>
        <div style={styles}></div>
      </ArcoTrigger>,
      graph.getCanvas().get('container')
    )
  );
};
