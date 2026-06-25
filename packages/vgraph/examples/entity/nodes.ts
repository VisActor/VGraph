import { Graph, panZoom } from "../../src";

(() => {
  const div = document.createElement("div");
  div.style.border = "1px solid #666";
  div.style.width = "800px";
  document.body.append(div);

  const IMG_URL =
    "https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VGraph/dev-demos/file_184761c054531.svg";

  const graph = new Graph({
    container: div,
    width: 800,
    height: 600,
    minRatio: 0.3,
    maxRatio: 8,
  });

  graph.addBehavior(panZoom);

  graph.add("node", {
    x: 100,
    y: 100,
    width: 140,
    height: 40,
    type: "rect",
    label: "默认矩形节点样式",
    radius: 4,
  });

  graph.add("node", {
    type: "rect",
    x: 260,
    y: 100,
    width: 140,
    height: 40,
    color: "#4170F2",
    radius: 4,
    label: {
      text: "带 color 配置的矩形样式",
      fillStyle: "#4170F2",
      textOverflow: "ellipsis",
    },
  });

  graph.add("node", {
    type: "rect",
    x: 420,
    y: 100,
    width: 140,
    height: 40,
    strokeStyle: "#4170F2",
    fillStyle: "#F2F6FF",
    radius: 4,
    label: {
      text: "带背景色的矩形样式",
      fillStyle: "#4170F2",
    },
  });

  graph.add("node", {
    type: "rect",
    x: 580,
    y: 100,
    width: 140,
    height: 40,
    strokeStyle: null,
    fillStyle: "#4170F2",
    radius: 4,
    label: {
      text: "填充风格的矩形样式",
      fillStyle: "#fff",
      textOverflow: "ellipsis",
    },
  });

  graph.add("node", {
    type: "rect",
    x: 100,
    y: 152,
    width: 140,
    height: 40,
    label: "默认圆角矩形样式",
    radius: 20,
  });

  graph.add("node", {
    type: "rect",
    x: 260,
    y: 152,
    width: 140,
    height: 40,
    color: "#4170F2",
    radius: 20,
    label: {
      text: "带 color 配置的圆角矩形样式",
      fillStyle: "#4170F2",
      textOverflow: "ellipsis",
    },
  });

  graph.add("node", {
    type: "rect",
    x: 420,
    y: 152,
    width: 140,
    height: 40,
    strokeStyle: "#4170F2",
    fillStyle: "#F2F6FF",
    radius: 20,
    label: {
      text: "带背景色的圆角矩形",
      fillStyle: "#4170F2",
    },
  });

  graph.add("node", {
    type: "rect",
    x: 580,
    y: 152,
    width: 140,
    height: 40,
    strokeStyle: null,
    fillStyle: "#4170F2",
    radius: 20,
    label: {
      text: "填充风格的圆角矩形",
      fillStyle: "#fff",
      textOverflow: "ellipsis",
    },
  });

  graph.add("node", {
    type: "tag",
    color: "#4170F2",
    width: 140,
    height: 40,
    x: 100,
    y: 232,
    label: "默认样式标签",
    icon: "&#xe60a;",
    theme: "lighted",
    radius: 4,
  });

  graph.add("node", {
    type: "tag",
    width: 140,
    height: 40,
    x: 260,
    y: 232,
    color: "#4170F2",
    label: "描边风格标签",
    icon: "&#xe60a;",
    theme: "outlined",
    radius: 4,
  });

  graph.add("node", {
    type: "tag",
    color: "#4170F2",
    width: 140,
    height: 40,
    x: 420,
    y: 232,
    label: "填充深色反色标签",
    icon: "&#xe60a;",
    theme: "filled",
    radius: 4,
  });

  graph.add("node", {
    type: "tag",
    color: "#5AC8FA",
    width: 140,
    height: 40,
    x: 580,
    y: 232,
    label: {
      text: "填充浅色默认标签",
    },
    icon: "&#xe60a;",
    theme: "filled",
    radius: 4,
  });

  graph.add("node", {
    type: "capsule",
    color: "#4170F2",
    width: 140,
    height: 40,
    x: 100,
    y: 284,
    label: "默认样式胶囊",
    icon: "&#xe60a;",
    theme: "lighted",
  });

  graph.add("node", {
    type: "capsule",
    color: "#4170F2",
    width: 140,
    height: 40,
    x: 260,
    y: 284,
    label: "描边风格胶囊",
    icon: "&#xe60a;",
    theme: "outlined",
  });

  graph.add("node", {
    type: "capsule",
    color: "#4170F2",
    width: 140,
    height: 40,
    x: 420,
    y: 284,
    label: "填充风格反色胶囊节点",
    icon: "&#xe60a;",
    theme: "filled",
  });

  graph.add("node", {
    type: "capsule",
    color: "#4170F2",
    width: 140,
    height: 40,
    x: 420,
    y: 284,
    label: "填充风格反色节点",
    icon: "&#xe60a;",
    theme: "filled",
  });

  graph.add("node", {
    type: "capsule",
    color: "#5AC8FA",
    width: 140,
    height: 40,
    x: 580,
    y: 284,
    label: "填充浅色节点",
    icon: "&#xe60a;",
    theme: "filled",
  });

  graph.add("node", {
    x: 50,
    y: 364,
    width: 48,
    height: 48,
    type: "icon",
    color: "#4170F2",
    theme: "lighted",
    icon: "&#xe60a;",
    label: "默认图标节点",
    radius: 4,
  });

  graph.add("node", {
    x: 140,
    y: 364,
    width: 48,
    height: 48,
    type: "icon",
    color: "#2E62F1",
    theme: "outlined",
    icon: "&#xe60a;",
    label: "描边图标节点",
    radius: 4,
  });

  graph.add("node", {
    x: 230,
    y: 364,
    width: 48,
    height: 48,
    type: "icon",
    color: "#2E62F1",
    theme: "filled",
    icon: "&#xe60a;",
    label: "填充图标节点",
    radius: 4,
  });

  graph.add("node", {
    x: 50,
    y: 436,
    width: 48,
    height: 48,
    type: "icon",
    color: "#4170F2",
    theme: "lighted",
    icon: "&#xe60a;",
    label: "默认图标节点",
    radius: 24,
  });

  graph.add("node", {
    x: 140,
    y: 436,
    width: 48,
    height: 48,
    type: "icon",
    color: "#2E62F1",
    theme: "outlined",
    icon: "&#xe60a;",
    label: "描边图标节点",
    radius: 24,
  });

  graph.add("node", {
    x: 230,
    y: 436,
    width: 48,
    height: 48,
    type: "icon",
    color: "#2E62F1",
    theme: "filled",
    icon: "&#xe60a;",
    label: "填充图标节点",
    radius: 24,
  });

  graph.add("node", {
    x: 360,
    y: 364,
    width: 48,
    height: 48,
    type: "image",
    strokeStyle: "#E1E4EB",
    fillStyle: "#fff",
    image: {
      width: 24,
      height: 24,
      url: IMG_URL,
    },
    label: "图片节点",
    theme: "lighted",
    radius: 4,
  });

  graph.add("node", {
    x: 440,
    y: 364,
    width: 48,
    height: 48,
    type: "image",
    color: "#2E62F1",
    theme: "outlined",
    image: {
      width: 24,
      height: 24,
      url: IMG_URL,
    },
    label: "描边图片节点",
    radius: 4,
  });

  graph.add("node", {
    x: 530,
    y: 364,
    width: 24,
    height: 24,
    type: "image",
    image: {
      url: IMG_URL,
    },
    label: "普通图片节点",
    radius: 4,
  });

  graph.add("node", {
    x: 360,
    y: 436,
    width: 48,
    height: 48,
    type: "image",
    strokeStyle: "#E1E4EB",
    fillStyle: "#fff",
    image: {
      width: 24,
      height: 24,
      url: IMG_URL,
    },
    label: "图片节点",
    radius: 24,
  });

  graph.add("node", {
    x: 440,
    y: 436,
    width: 48,
    height: 48,
    type: "image",
    color: "#2E62F1",
    theme: "outlined",
    image: {
      width: 24,
      height: 24,
      url: IMG_URL,
    },
    label: "描边图片节点",
    radius: 24,
  });

  graph.add("node", {
    x: 100,
    y: 526,
    width: 140,
    height: 40,
    type: "category",
    color: "#4170F2",
    label: "轻分类节点",
    radius: 4,
  });

  graph.add("node", {
    x: 250,
    y: 526,
    width: 140,
    height: 40,
    type: "category",
    color: "#4170F2",
    label: "轻分类节点",
    position: "top",
    radius: 4,
  });

  graph.add("node", {
    x: 360,
    y: 526,
    width: 48,
    height: 48,
    type: "circle",
    strokeStyle: "#4170F2",
    label: "圆节点",
  });

  graph.add("node", {
    x: 440,
    y: 526,
    width: 48,
    height: 48,
    type: "circle",
    fillStyle: "#4170F2",
    strokeStyle: null,
    label: {
      text: "圆节点",
      fillStyle: "#fff",
      textAlign: "center",
    },
  });

  graph.add("node", {
    x: 130,
    y: 624,
    width: 200,
    height: 90,
    type: "title",
    title: {
      text: "title",
      fontWeight: 500,
      height: 30,
      backgroundColor: "#F6F8FA",
      borderColor: "#E1E4EB",
    },
    label:
      "中文中文中文中文中文中文中文中文中文ontentcontentcontentcontentcontentcontentcontentcontentcontent",
    radius: 4,
  });

  graph.add("node", {
    x: 356,
    y: 624,
    width: 200,
    height: 90,
    type: "title",
    title: {
      text: "title",
      fontWeight: 500,
      fillStyle: "#fff",
      height: 30,
      backgroundColor: "#2E62F1",
    },
    label:
      "123123123123123123123contentcontentcontentcontentcontentcontentcontent",
    radius: 4,
  });

  graph.add("node", {
    x: 586,
    y: 524,
    width: 140,
    height: 40,
    radius: 4,
    type: "imageTag",
    label: "带图片的标签节点",
    image: IMG_URL,
  });

  graph.add("node", {
    x: 586,
    y: 624,
    width: 200,
    height: 70,
    radius: 4,
    type: "imageTag",
    label:
      "带图片的多行标签节点带图片的多行标签节点带图片的多行标签节点带图片的多行标签节点",
    image: IMG_URL,
  });

  graph.fitView();

  graph.on("node:click", (e) => {
    console.log(e.target);
  });

  document.fonts.ready.then(() => {
    graph.draw();
  });
})();
