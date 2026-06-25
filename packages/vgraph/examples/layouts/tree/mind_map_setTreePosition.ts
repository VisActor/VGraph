import { TreeGraph, panZoom, dragCanvas } from "../../../src";

const div = document.createElement("div");
div.style.border = "1px solid #666";
div.style.width = "1000px";
div.style.height = "700px";
document.body.append(div);

const width = div.offsetWidth;
const height = div.offsetHeight;

const testData = {
  name: "杭州某人工智能研究有限公司",
  root: true,
  children: [
    {
      name: "宁波某公司",
      category: 0,
      children: [],
      amount: 490,
      ratio: 0.59,
    },
    {
      name: "张三",
      category: 0,
      children: [],
      amount: 10,
      ratio: 0.51,
    },
    {
      name: "北京某公司",
      category: 1,
      children: [],
      amount: 1000,
      ratio: 1,
    },
  ],
};

const graph = new TreeGraph({
  container: div,
  width,
  height,
  minRatio: 0.3,
  maxRatio: 8,
  animate: true,
  layout: {
    type: "mindMap",
    options: {
      direction: "TB",
      nodeSize(node: any) {
        return [200, 50];
      },
      nodeSep() {
        return 30;
      },
      rankSep() {
        return 100;
      },
      setTreePosition: (data) => {
        const leftTree: any = {
          id: data.id,
          width: data.width,
          height: data.height,
          children: [],
        };

        const rightTree: any = {
          id: data.id,
          width: data.width,
          height: data.height,
          children: [],
        };

        data.children?.forEach((child: any) => {
          if (child.category === 0) {
            leftTree.children.push(child);
          } else if (child.category === 1) {
            rightTree.children.push(child);
          }
        });

        return { leftTree, rightTree };
      },
    },
  },
  setDefaultNode(nodeData) {
    const isRoot = nodeData.root;
    const nodeConfigs: any = {
      radius: 8,
      width: nodeData.width ?? 200,
      height: nodeData.height ?? 50,
      anchors: [
        [0.5, 0],
        [0.5, 1],
      ],
      label: {
        text: nodeData.name,
        fillStyle: isRoot ? "#fff" : "#1B1F23",
        fontSize: isRoot ? 14 : 12,
        textAlign: "center",
        textBaseline: "middle",
      },
    };

    if (isRoot) {
      nodeConfigs.fillStyle = "#2E62F1";
      nodeConfigs.strokeStyle = "#2E62F1";
    } else if (nodeData.category === 0) {
      nodeConfigs.fillStyle = "#E8F3FF";
      nodeConfigs.strokeStyle = "#91CBFF";
    } else if (nodeData.category === 1) {
      nodeConfigs.fillStyle = "#F0FFF4";
      nodeConfigs.strokeStyle = "#86E8AB";
    }

    return nodeConfigs;
  },
  setDefaultEdge() {
    return {
      type: "vCubic",
      strokeStyle: "#919AA6",
      lineWidth: 2,
    };
  },
});

graph.data(testData);

graph.addBehavior(panZoom);
graph.addBehavior(dragCanvas);
