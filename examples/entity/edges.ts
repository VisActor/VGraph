import { Graph, dragCanvas, panZoom, dragNode } from '../../src';
import data from '../static/edge_data.json';

(() => {
  const div = document.createElement('div');
  div.style.border = '1px solid #666';
  div.style.width = '800px';
  document.body.append(div);

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
    setDefaultNode(nodeData: any) {
      if (parseInt(nodeData.id, 10) >= 27) {
        return {
          type: 'rect',
          width: 100,
          height: 40,
          strokeStyle: '#2E62F1',
          label: 'example',
        };
      }
      return {
        type: 'circle',
        width: 16,
        height: 16,
        fillStyle: '#2E62F1',
        strokeStyle: null,
      };
    }
  });

  graph.data(data);

  graph.add('edge', {
    source: '1',
    target: '2',
    endArrow: true,
    cursor: 'pointer',
  });

  graph.add('edge', {
    source: '3',
    target: '4',
    label: {
      text: 'line',
      fillStyle: '#626B7B',
      offsetY: -9
    },
    endArrow: true,
    controlPoints: [[220, 70], [300, 70]],
  });

  graph.add('edge', {
    type: 'turningLine',
    source: '5',
    target: '6',
    endArrow: true,
    controlPoints: [[390, 70], [470, 70]],
    radius: 4,
  });

  graph.add('edge', {
    type: 'quadratic',
    source: '7',
    target: '8',
    endArrow: true,
  });

  graph.add('edge', {
    source: '9',
    target: '10',
    endArrow: true,
    label: {
      text: 'line',
      strokeStyle: '#fff',
      lineWidth: 2,
      autoRotate: true,
    }
  });

  graph.add('edge', {
    source: '11',
    target: '12',
    endArrow: true,
    controlPoints: [[290, 200], [290, 280]]
  });

  graph.add('edge', {
    type: 'turningLine',
    source: '13',
    target: '14',
    endArrow: true,
    controlPoints: [[460, 200], [460, 240]],
    label: 'turningLine',
    styles: { radius: 8 },
  });

  graph.add('edge', {
    type: 'quadratic',
    source: '15',
    target: '16',
    endArrow: true,
  });

  graph.add('edge', {
    source: '17',
    target: '18',
    endArrow: true,
    label: {
      text: 'label',
      autoRotate: true,
      background: {
        fillStyle: '#fff',
        strokeStyle: '#D1D5DA',
        padding: [2, 4, 2, 4],
      }
    },
  });

  graph.add('edge', {
    type: 'hLine',
    styles: { radius: 38 },
    source: '19',
    target: '20',
    endArrow: true,
    label: 'hLine',
  });

  graph.add('edge', {
    type: 'vLine',
    source: '21',
    target: '22',
    label: {
      text: 'vLine',
      offsetY: -9,
    },
    styles: {
      radius: 40,
    },
    endArrow: true,
  });

  const edge = graph.add('edge', {
    type: 'hCubic',
    source: '23',
    target: '24',
    styles: { curveOffset: [-40, 40] },
    label: {
      text: 'hCubic',
      strokeStyle: '#fff',
      autoRotate: true,
    }
  });
  console.log(edge);

  graph.add('edge', {
    type: 'vCubic',
    source: '25',
    target: '26',
    label: {
      text: 'vCubic',
      background: {
        fillStyle: '#fff'
      },
      capture: false,
    }
  });

  graph.add('edge', {
    source: '27',
    type: 'loop',
    loop: {
      dist: 35,
      radius: 8,
      position: 'right',
    }
  });

  graph.add('edge', {
    source: '28',
    type: 'loop',
    label: {
      text: 'loop',
      offsetY: -9
    },
    loop: {
      clockwise: false,
      position: 'bottom'
    }
  });

  graph.add('edge', {
    source: '29',
    target: '29',
    loop: {
      theme: 'round',
      position: 'bottom',
    },
    hitWidth: 10,
    label: {
      position: 0,
      text: 'round',
      offsetX: -2,
      offsetY: -9
    }
  });

  graph.add('edge', {
    source: '30',
    target: '30',
    loop: {
      theme: 'arc',
    }
  });

  graph.add('edge', {
    source: '31',
    target: '32',
    type: 'cubic',
  });

  graph.add('edge', {
    source: '33',
    target: '34',
    type: 'cubic',
  });

  graph.add('edge', {
    source: '35',
    target: '36',
    type: 'vCubic',
  });

  graph.add('edge', {
    source: '37',
    target: '38',
    type: 'hCubic',
  });

  graph.on('edge:click', e => {
    console.log(e.target)
  });

  graph.fitView();

  graph.on('node:click', (e) => {
    console.log(e.target.getLabel());
  });
  graph.addBehavior(dragNode);
  // graph.addBehavior(dragCanvas);
  graph.addBehavior(panZoom);
  document.fonts.ready.then(() => {
    graph.draw();
  });
})();