import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip as ArcoTooltip } from '@arco-design/web-react';
import {
  CategoryLegend,
  entityToViewport,
  uuid,
  Graph,
  TreeGraph,
  Layer,
  GraphEvent,
  GRAPH_EVENTS,
} from '@visactor/vgraph';

const id = `vgraph${uuid(10)}`;

export const Tooltip: any = ({
  graph,
  legend,
  getContent,
  target = 'node',
  triggerId = '',
  hideDelay = 300,
  showDelay,
  trigger = 'hover',
  visible,
  onVisibleChange,
  ...props
}: {
  graph?: Graph | TreeGraph;
  legend?: CategoryLegend;
  getContent: any;
  visible?: boolean;
  onVisibleChange: (visible: boolean) => void;
  trigger?: 'hover' | 'click';
  style?: { [key: string]: string };
  classNames?: string | string[];
  position?: 'top' | 'right' | 'bottom' | 'left';
  target?: 'node' | 'edge' | 'group' | 'legend';
  triggerId?: string;
  showDelay?: number;
  hideDelay?: number;
}) => {
  const [content, setContent] = useState(null);
  const [styles, setStyles] = useState({});
  const [show, setShow] = useState(false);

  let timer = 0;
  let showTimer: any = 0;
  let curTarget: any = null;
  let shape: any = null;

  useEffect(() => {
    if (!graph) {
      return;
    }
    if (target === 'legend' && legend) {
      legend.legendItems.forEach((item: Layer) => {
        if (trigger === 'click') {
          item.on('click', onShowTooltip);
        } else {
          item.on('mousemove', onShowTooltip);
          item.on('mouseleave', onMouseLeave);
        }
      });
    } else {
      if (trigger === 'click') {
        graph!.on(`${target}:click`, onShowTooltip);
      } else {
        graph!.on(`${target}:mouseover`, onShowTooltip);
      }
      graph!.on(`${target}:mouseleave`, onMouseLeave);
      graph!.on(GRAPH_EVENTS.TRANSFORMED, () => {
        hideTooltip();
      });
      graph!.on('contextmenu', () => {
        hideTooltip();
      });
      graph!.on(GRAPH_EVENTS.MOVE_START, () => {
        hideTooltip();
      });
    }
  }, [graph]);

  useEffect(() => {
    if (visible !== undefined) {
      setShow(visible);
    }
  }, [visible]);

  useEffect(() => {
    if (visible === undefined && 'left' in styles) {
      setShow(true);
    } // 除初始化外，每次 styles 变更后伴随展示状态变更
  }, [styles]);

  function onShowTooltip(e: GraphEvent) {
    let target;
    if (!triggerId || e.target.get('triggerId') === triggerId) {
      target = e.target;
    } else if (e.relatedTarget?.get?.('triggerId') === triggerId) {
      target = e.relatedTarget;
      shape = target;
    } else {
      return;
    }
    if (target === curTarget) {
      return;
    } else {
      onVisibleChange?.(false);
      setShow(false);
      curTarget = target;
    }

    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = 0;
    }
    if (showDelay) {
      showTimer = setTimeout(() => {
        showTooltip(e);
      }, showDelay);
    } else {
      showTooltip(e);
    }
  }

  function showTooltip(e: GraphEvent) {
    let c = getContent;
    const entity = e.target;
    if (typeof getContent === 'function') {
      c = getContent(legend ? entity.parent : entity, shape);
      if (!c) {
        return;
      }
    }
    setContent(c);
    const newStyles = setPosition(entity, e, shape);
    setStyles(newStyles);
    onVisibleChange?.(true);

    const fn = () => {
      shape?.off('mouseleave', fn);
      onMouseLeave();
    };
    shape?.on('mouseleave', fn);

    setTimeout(() => {
      const tooltip = document.querySelector(`#${id}`);
      if (tooltip) {
        tooltip.addEventListener('mouseenter', onEnterTooltip);
        tooltip.addEventListener('mouseleave', onMouseLeave);
      }
    }, 20);
  }

  function onMouseLeave() {
    curTarget = null;
    shape = null;
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = 0;
    }
    timer = setTimeout(() => {
      hideTooltip();
      timer = 0;
    }, hideDelay) as any;
  }

  function onEnterTooltip() {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
  }

  function hideTooltip() {
    curTarget = null;
    shape = null;
    onVisibleChange?.(false);
    const tooltip = document.querySelector(`#${id}`);
    if (tooltip) {
      tooltip.removeEventListener('mouseenter', onEnterTooltip);
      tooltip.removeEventListener('mouseleave', onMouseLeave);
    }
    if (visible === undefined) {
      setShow(false);
    }
  }

  function setPosition(entity: any, e: any, shape?: any) {
    let newStyles: any;
    if (entity.type === 'edge' && !shape && graph) {
      const point = graph.clientToViewport(e.clientX, e.clientY);
      const keyShape = entity.getKeyShape();
      const size = keyShape.get('hitWidth') || (keyShape.get('lineWidth') || 1) * 3;
      newStyles = {
        left: point.x,
        top: point.y,
        width: size,
        height: size,
      };
    } else {
      if (graph) {
        newStyles = entityToViewport(graph, entity, shape);
      } else if (legend) {
        if (entity.type !== 'layer') {
          entity = entity.parent;
        }
        const bbox = entity.getBBox();
        const matrix = entity.parent.getMatrix();
        newStyles = {
          left: bbox.left + matrix[4],
          top: bbox.top + matrix[5],
          width: bbox.width,
          height: bbox.height,
        };
      }
    }
    return newStyles;
  }

  return (
    graph &&
    createPortal(
      <ArcoTooltip content={<div id={id}>{content}</div>} popupVisible={show} trigger={trigger} {...props}>
        <div style={{ position: 'absolute', zIndex: -1, ...styles }}></div>
      </ArcoTooltip>,
      graph ? graph.getCanvas().get('container') : (legend as any).canvas.get('container')
    )
  );
};
