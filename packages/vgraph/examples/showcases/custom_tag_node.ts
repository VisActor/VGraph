import {
  Graph,
  registerNode,
  Layer,
  dragNode,
  panZoom,
  TagUtils,
  GraphEvent,
} from "../../src";
import data from "../static/custom_tag_node.json";

const CLOSE_ICON = "&#xe61a;";

function registerTagNodes(graph: Graph) {
  registerNode("tagRect", {
    type: "tagRect",
    extends: "rect",
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        radius: 4,
        label: {
          text: nodeData.label,
          textAlign: "left",
          textBaseline: "middle",
          textOverflow: "ellipsis",
          width: nodeData.width - 12,
          fillStyle: "#21252C",
          // 为 icon 预留出空间，与 icon 间距为 4px
          offsetY: 11,
        },
      };
    },
    shape(layer: Layer, configs: any) {
      TagUtils.initTag(layer, {
        text: "标签文本",
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: "tag",
        theme: configs.theme,
        // label: {
        //   fillStyle: '#2E62F1'
        // },
        // background: {
        //   fillStyle: '#E9EEFE',
        //   strokeStyle: '#E1E4E8'
        // }
      });
    },
  });

  registerNode("closableTagRect", {
    type: "closableTagRect",
    extends: "rect",
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        radius: 4,
        label: {
          text: nodeData.label,
          textAlign: "left",
          textBaseline: "middle",
          textOverflow: "ellipsis",
          // 为 icon 预留出空间，与 icon 间距为 4px
          offsetY: 11,
        },
      };
    },
    shape(layer: Layer, configs: any) {
      TagUtils.initTag(layer, {
        text: "标签文本",
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: "tag",
        theme: configs.theme,
        label: {
          fillStyle: "#2E62F1",
        },
        background: {
          fillStyle: "#E9EEFE",
          strokeStyle: "#E1E4E8",
        },
        close: {
          icon: CLOSE_ICON,
          fillStyle: "#2E62F1",
          onClose(e: GraphEvent, layer: Layer) {
            layer.parent!.remove(layer);
            graph.draw();
          },
        },
      });
    },
  });

  registerNode("iconTagRect", {
    type: "iconTagRect",
    extends: "rect",
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        radius: 4,
        label: {
          text: nodeData.label,
          textAlign: "left",
          textBaseline: "middle",
          textOverflow: "ellipsis",
          // 为 icon 预留出空间，与 icon 间距为 4px
          offsetY: 11,
        },
      };
    },
    shape(layer: Layer, configs: any) {
      TagUtils.initTag(layer, {
        text: "标签文本",
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: "tag",
        theme: configs.theme,
        label: {
          fillStyle: "#2E62F1",
        },
        background: {
          fillStyle: "#E9EEFE",
          strokeStyle: "#E1E4E8",
        },
        icon: {
          icon: configs.icon,
          fillStyle: "#2E62F1",
          // onClose(e: GraphEvent, layer: Layer) {
          //   layer.parent.remove(layer);
          //   graph.draw();
          // }
        },
      });
    },
  });

  registerNode("multiTagAdd", {
    type: "multiTagAdd",
    extends: "rect",
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        radius: 4,
        label: {
          text: nodeData.label,
          textAlign: "left",
          textBaseline: "middle",
          textOverflow: "ellipsis",
          // 为 icon 预留出空间，与 icon 间距为 4px
          offsetY: 11,
        },
      };
    },
    shape(layer: Layer, configs: any) {
      // 定义添加按钮 tag
      const addTag = TagUtils.initTag(layer, {
        left: 0,
        top: -configs.height / 2 + 8,
        text: "添加",
        icon: {
          icon: "&#xe61b;",
        },
      });
      addTag.children[1].set("cursor", "pointer");
      const bbox = addTag.getBBox();
      // 定位到顶部最右侧
      addTag.translate(configs.width / 2 - 12 - bbox.width, 0);

      const options = {
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: "tag",
        // 节点全宽减去左右 padding 和添加按钮宽度
        maxWidth: configs.width - 28 - bbox.width,
        // overflowTag: {
        //   background: { strokeStyle: null }
        // },
        tags: configs.tags,
      };

      let tagsLayer = TagUtils.initTags(layer, options);

      addTag.on("click", () => {
        tagsLayer = TagUtils.addTag(tagsLayer, {
          text: `标签${configs.tags.length + 1}`,
        });
        graph.draw();
      });
    },
  });

  registerNode("multiTagDelete", {
    type: "multiTagDelete",
    extends: "rect",
    drawCurrentLabel: false,
    getConfigsForShape(nodeData: any) {
      return {
        ...nodeData,
        radius: 4,
        label: {
          text: nodeData.label,
          textAlign: "left",
          textBaseline: "middle",
          textOverflow: "ellipsis",
          // 为 icon 预留出空间，与 icon 间距为 4px
          offsetY: 11,
        },
      };
    },
    shape(layer: Layer, configs: any) {
      TagUtils.initTags(layer, {
        left: -configs.width / 2 + 12,
        top: -configs.height / 2 + 8,
        id: "tag",
        maxWidth: configs.width - 24,
        // overflowTag: {
        //   background: { strokeStyle: null }
        // },
        tags: configs.tags.map((text: string) => {
          return {
            text,
            // label: {
            //   fillStyle: '#2E62F1'
            // },
            // background: {
            //   fillStyle: '#E9EEFE',
            //   strokeStyle: '#E1E4E8'
            // },
            close: configs.close
              ? {
                  icon: CLOSE_ICON,
                  onClose(e: GraphEvent, layer: Layer) {
                    TagUtils.removeTag(layer);
                    graph.draw();
                  },
                }
              : undefined,
          };
        }),
      });
      const tagLayer = TagUtils.initTag(layer, { left: 0, top: 0, text: "" });
      layer.set("tagLayer", tagLayer);
    },
    updateShape(layer: Layer) {
      const tag = layer.get("tagLayer");
      TagUtils.removeTag(tag);
      const tagLayer = TagUtils.initTag(layer, { left: 0, top: 0, text: "" });
      layer.set("tagLayer", tagLayer);
    },
  });
}

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

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
        strokeStyle: "#E1E4E8",
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

  registerTagNodes(graph);
  // 写入数据
  graph.data(data);

  graph.addBehavior(dragNode, {
    delegate: false,
  });
  graph.addBehavior(panZoom, {
    zoom: false,
  });
  console.log(graph);
})();
