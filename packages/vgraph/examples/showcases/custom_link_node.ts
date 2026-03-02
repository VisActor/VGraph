import { Graph, registerNode, Layer, panZoom, LinkUtils } from "../../src";

function registerMarkerNodes() {
  registerNode("linkNode", {
    type: "linkNode",
    extends: "rect",
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        label: {
          text: nodeData.label,
          textAlign: nodeData.align === "right" ? "left" : nodeData.align,
          offsetY: nodeData.align === "right" ? 0 : -10,
          width: 92,
          textOverflow: "ellipsis",
        },
      };
    },
    shape(layer: Layer, configs: any) {
      const align = configs.align;
      let x = -configs.width / 2 + 12;
      let y = -configs.height / 2 + 42;
      if (align === "center") {
        x = 0;
      } else if (align === "right") {
        x = configs.width / 2 - 12;
        y = -0;
      }
      let underline: any = false;
      if (configs.label.textAlign === "center") {
        if (configs.icon) {
          underline = {
            strokeStyle: "#3A5FBE",
            lineDash: [2, 2],
          };
        } else {
          underline = true;
        }
      }
      LinkUtils.init(layer, {
        x,
        y,
        align: configs.align,
        text: configs.link || "查看链接",
        maxWidth: configs.align === "right" ? 68 : undefined,
        disabled: configs.disabled,
        icon: configs.icon
          ? {
              icon: "&#xe61d;",
            }
          : undefined,
        onClick() {
          console.log("You just clicked a link");
        },
        underline,
      });
    },
  });
}

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  registerMarkerNodes();

  // 初始化 graph 实例
  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.2,
    maxRatio: 8,
    linkCenter: false,
    setDefaultNode(node) {
      return {
        type: "linkNode",
        icon: node.y === 200,
        radius: 4,
      };
    }, // 定制节点样式
    setNodeStateStyles(state) {
      if (state === "active") {
        return {
          opacity: 1.0,
        };
      }
      return { opacity: 0.2 };
    },
  });

  graph.add("node", {
    x: 100,
    y: 100,
    width: 140,
    height: 58,
    align: "left",
    label: "左对齐链接节点",
  });

  graph.add("node", {
    x: 260,
    y: 100,
    width: 140,
    height: 58,
    align: "center",
    label: "居中对齐链接节点",
  });

  graph.add("node", {
    x: 440,
    y: 100,
    width: 180,
    height: 48,
    align: "right",
    label: "右对齐链接节点",
  });

  graph.add("node", {
    x: 120,
    y: 300,
    width: 180,
    height: 48,
    align: "right",
    disabled: true,
    link: "超长链接超长链接",
    label: "禁用长链接节点",
  });

  graph.add("node", {
    x: 100,
    y: 200,
    width: 140,
    height: 58,
    align: "left",
    label: "带图标链接节点",
  });

  graph.add("node", {
    x: 260,
    y: 200,
    width: 140,
    height: 58,
    align: "center",
    label: "居中对齐图标链接",
  });

  graph.add("node", {
    x: 440,
    y: 200,
    width: 180,
    height: 48,
    align: "right",
    label: "右对齐图标链接节点",
  });

  graph.add("node", {
    x: 330,
    y: 300,
    width: 180,
    height: 48,
    align: "right",
    disabled: true,
    link: "超长链接超长链接",
    label: "禁用长图标链接",
  });

  graph.addBehavior(panZoom);
  console.log(graph);
})();
