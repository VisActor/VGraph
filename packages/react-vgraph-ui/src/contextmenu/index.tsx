import { Graph, GraphEvent } from '@visactor/vgraph';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './index.less';

export const Contextmenu: any = ({
  graph,
  targets,
  getContent,
  style,
  classNames,
  showContextmenu,
}: {
  graph: Graph;
  getContent: (entityData: any, type: 'node' | 'edge' | 'group', e: GraphEvent) => ReactNode;
  style?: { [key: string]: string };
  classNames?: string | string[];
  targets?: 'node' | 'edge' | 'group' | 'canvas' | string[];
  showContextmenu: (entityData: any, type: 'node' | 'edge' | 'group', e: GraphEvent) => boolean;
}) => {
  const [styles, setStyles] = useState<{ [k: string]: any }>({
    visibility: 'hidden',
    left: -9999,
    top: -9999,
  });
  const [content, setContent] = useState<ReactNode | null>(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!graph) {
      return;
    }
    let entities = targets || ['node'];
    if (typeof entities === 'string') {
      entities = [entities];
    }
    entities.forEach((target: string) => {
      graph.on(`${target}:contextmenu`, onContextmenu);
    });
    graph.on('transformed', () => {
      onHideContextmenu();
    });
  }, [graph]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const bbox = (ref.current as HTMLDivElement).getBoundingClientRect();
    const { left, top } = styles;
    const container = graph.getCanvas().get('container');
    const containerBox = container.getBoundingClientRect();
    const newStyles: { [k: string]: any } = {
      visibility: 'visible',
      left,
      top,
    };

    if (left + bbox.width > graph.get('width')) {
      delete newStyles.left;
      newStyles.right = containerBox.width - left;
    }
    if (top + bbox.height > graph.get('height')) {
      delete newStyles.top;
      newStyles.bottom = containerBox.height - top;
    }
    setStyles(newStyles);
  }, [content]);

  function onContextmenu(e: GraphEvent) {
    const entity = e.target;
    if (showContextmenu && !showContextmenu(entity, entity.type as 'node' | 'edge' | 'group', e)) {
      return;
    }
    let c: any = getContent;
    if (typeof getContent === 'function') {
      c = getContent(entity, entity.type as 'node' | 'edge' | 'group', e);
      if (!c) {
        return;
      }
    }
    const point = graph.clientToViewport(e.clientX, e.clientY);
    setStyles({
      visibility: 'visible',
      left: point.x,
      top: point.y,
    });
    setContent(c);
    document.body.addEventListener('click', onHideContextmenu);
  }

  function onHideContextmenu() {
    setStyles({ visibility: 'hidden', left: -9999, top: -9999 });
    document.body.removeEventListener('click', onHideContextmenu);
  }

  let clsNames = 'vgraph-contextmenu-container';
  if (classNames) {
    clsNames += ' ';
    clsNames += typeof classNames === 'string' ? classNames : classNames.join(' ');
  }

  return (
    graph &&
    createPortal(
      <div className={clsNames} style={{ ...styles, ...style }} ref={ref}>
        {content}
      </div>,
      graph.getCanvas().get('container')
    )
  );
};
