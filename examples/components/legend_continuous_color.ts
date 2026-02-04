import { Graph } from '../../src';
import { ContinuousLegend } from '../../src/components';
import data from '../static/traffic.json';

// 边映射
const edgeMap = (value: number, min: number, base: number) => {
    return (value - min) / base;
};

const width = 800;
const height = 600;

(() => {
    const div = document.createElement('div');
    div.style.border = '1px solid #666';
    div.style.width = '800px';
    document.body.append(div);
    const legendDiv = document.createElement('div');
    legendDiv.style.position = 'absolute';
    legendDiv.style.right = '10px';
    legendDiv.style.top = '10px';
    legendDiv.style.border = '1px solid #666';

    const graph = new Graph({
        container: div,
        width,
        height,
        minRatio: 0.3,
        maxRatio: 10,
        linkCenter: true,
        setDefaultNode(node) {
            return {
                label: {
                    width: 20,
                    text: node.id.toString(),
                    textBaseline: 'middle',
                    textAlign: 'center',
                    fontSize: 12,
                    fillStyle: 'white'
                },
                type: 'rect',
                radius: 2,
                width: 20,
                height: 20,
                fillStyle: '#4c72b0',
                anchors: [
                    [0, 0.25],
                    [0, 0.75],
                    [0.25, 0],
                    [0.25, 1],
                    [0.75, 0],
                    [0.75, 1],
                    [1, 0.25],
                    [1, 0.75]
                ]
            };
        },
        setDefaultEdge(edge) {
            return {
                lineWidth: 3,
                strokeStyle: [
                    '#fff5f0',
                    '#fee0d2',
                    '#fcbba1',
                    '#fc9272',
                    '#fb6a4a',
                    '#ef3b2c',
                    '#cb181d',
                    '#a50f15',
                    '#67000d'
                ][Math.round(edgeMap(edge.volume, 4000, 24000) * 8)],
                endArrow: true,
                sourceAnchor: edge.sourceAnchor,
                targetAnchor: edge.targetAnchor
            };
        },
        setEdgeStateStyles(state) {
            if (state === 'active') {
                return {
                    strokeStyle: '#DEC63E'
                };
            } else if (state === 'hover') {
                return {
                    strokeStyle: '#F5B508'
                };
            }
        }
    });
    data.nodes.forEach((node: any) => {
        node.x = node.posX * 10 + 50;
        node.y = (60 - node.posY) * 10;
    });

    graph.data(data);

    div.children[0].append(legendDiv);

    new ContinuousLegend(graph, {
        container: legendDiv,
        encodeAttr: 'volume',
        channel: 'strokeStyle',
        // color: {
        //     min: "#fff5f0",
        //     max: "#67000d"
        // },
        target: 'edge',
        width: 200,
        height: 100,
        title: {
            text: 'Legend',
            background: {
                height: 20,
                fillStyle: '#eee',
            },
        },
        // orient: 'vertical',
        slide: {
            enable: true,
            filter: true
        }
    });
})();
