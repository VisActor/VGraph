import { TagUtils, Layer, Text } from "../../src";
const OS_PLATFORM = process.platform;

describe("src/node_addons/tag", () => {
  it("init default tag should work", () => {
    const layer = new Layer();
    const tag = TagUtils.initTag(layer, {
      text: "sdjgeairgj",
      left: -20,
      top: -20,
      id: "1111",
    });
    expect(tag.get("id")).toBe("1111");
    expect(tag.children.length).toBe(2);
    expect(tag.getMatrix()).toEqual([1, 0, 0, 1, -20, -20]);

    const text = tag.children[1];
    const bbox = text.getBBox();
    expect(text.get("text")).toBe("sdjgeairgj");
    expect(text.get("fillStyle")).toBe("#21252C");
    expect(text.get("x")).toBe(4);
    expect(text.get("y")).toBe(0);
    expect(text.get("textBaseline")).toBe("top");
    expect(text.get("fontWeight")).toBe(500);

    const rect = tag.children[0];
    expect(rect.get("fillStyle")).toBe("#F0F1F3");
    expect(rect.get("strokeStyle")).toBe(undefined);
    expect(rect.get("radius")).toBe(2);
    expect(rect.get("left")).toBe(0);
    expect(rect.get("top")).toBe(0);
    expect(rect.get("width")).toBe(bbox.width + 8);
    expect(rect.get("height")).toBe(bbox.height);
  });

  it("init tag with icon & width should work", () => {
    const layer = new Layer();
    const tag = TagUtils.initTag(layer, {
      text: "sdjgeairgj1234234",
      maxWidth: 50,
      icon: {
        icon: "1",
        size: 14,
      },
      background: {
        strokeStyle: "#E1E4E8",
      },
      left: -20,
      top: -20,
      id: "1111",
    });
    expect(tag.get("id")).toBe("1111");
    expect(tag.children.length).toBe(3);
    expect(tag.getMatrix()).toEqual([1, 0, 0, 1, -20, -20]);

    const text = tag.children[1] as Text;
    const bbox = text.getBBox();
    expect(text.get("text")).toBe("sdjgeairgj1234234");
    expect(text.get("width")).toBe(24);
    expect(text.getDrawText()[0].match(/\.\.\.$/));
    expect(text.get("fillStyle")).toBe("#21252C");
    expect(text.get("x")).toBe(22);
    expect(text.get("y")).toBe(0);
    expect(text.get("textBaseline")).toBe("top");
    expect(text.get("fontWeight")).toBe(500);

    const icon = tag.children[2];
    expect(icon.get("x")).toBe(11);
    expect(icon.get("y")).toBe(9);
    expect(icon.get("size")).toBe(14);
    expect(icon.get("icon")).toBe("1");

    const rect = tag.children[0];
    expect(rect.get("fillStyle")).toBe("#F0F1F3");
    expect(rect.get("strokeStyle")).toBe("#E1E4E8");
    expect(rect.get("radius")).toBe(2);
    expect(rect.get("left")).toBe(0);
    expect(rect.get("top")).toBe(0);
    expect(rect.get("width")).toBe(50);
    expect(rect.get("height")).toBe(bbox.height);
  });

  it("init tag with close should work", () => {
    const layer = new Layer();
    const tag = TagUtils.initTag(layer, {
      text: "sdjgeairgj1234234",
      close: {
        icon: "1",
        fillStyle: "#666",
      },
      background: {
        radius: 9,
        fillStyle: "#F6F8FA",
      },
      left: -20,
      top: -20,
      id: "1111",
    });
    expect(tag.get("id")).toBe("1111");
    expect(tag.children.length).toBe(3);
    expect(tag.getMatrix()).toEqual([1, 0, 0, 1, -20, -20]);

    const text = tag.children[1];
    const bbox = text.getBBox();
    expect(text.get("text")).toBe("sdjgeairgj1234234");
    expect(text.get("fillStyle")).toBe("#21252C");
    expect(text.get("x")).toBe(4);
    expect(text.get("y")).toBe(0);
    expect(text.get("textBaseline")).toBe("top");
    expect(text.get("fontWeight")).toBe(500);

    const icon = tag.children[2];
    expect(icon.get("x")).toBe(bbox.width + bbox.left + 4 + 6);
    expect(icon.get("y")).toBe(9);
    expect(icon.get("size")).toBe(12);
    expect(icon.get("icon")).toBe("1");
    expect(icon.get("fillStyle")).toBe("#666");

    const rect = tag.children[0];
    expect(rect.get("fillStyle")).toBe("#F6F8FA");
    expect(rect.get("strokeStyle")).toBe(undefined);
    expect(rect.get("radius")).toBe(9);
    expect(rect.get("left")).toBe(0);
    expect(rect.get("top")).toBe(0);
    expect(rect.get("width")).toBe(bbox.width + bbox.left + 8 + 12);
    expect(rect.get("height")).toBe(bbox.height);
  });

  it("init multiple tags & remove should work", () => {
    const layer = new Layer();
    const tagContainer = TagUtils.initTags(layer, {
      left: 100,
      top: 100,
      theme: "capsule",
      tags: ["tag1", "tag2"].map((text: string) => {
        return {
          text,
        };
      }),
    });

    expect(tagContainer.children.length).toBe(2);
    expect(tagContainer.get("overflow")).toBe(undefined);
    expect(tagContainer.get("__tagsOption").left).toBe(100);
    expect(tagContainer.get("__tagsOption").theme).toBe("capsule");
    expect(tagContainer.getMatrix()).toEqual([1, 0, 0, 1, 100, 100]);

    const tag1 = tagContainer.children[0] as Layer;
    expect(tag1.children[0].get("radius")).toBe(9);
    expect(tag1.children[0].get("fillStyle")).toBe("#F0F1F3");
    expect(tag1.children[1].get("text")).toBe("tag1");

    const tag2 = tagContainer.children[1] as Layer;
    expect(tag2.children[0].get("radius")).toBe(9);
    expect(tag2.children[1].get("text")).toBe("tag2");
    expect(tag1.children[1].get("fillStyle")).toBe("#21252C");

    TagUtils.removeTag(tag2);
    expect(tagContainer.children.length).toBe(1);
    const tag = tagContainer.children[0] as Layer;
    expect(tag.children[0].get("radius")).toBe(9);
    expect(tag.children[0].get("fillStyle")).toBe("#F0F1F3");
    expect(tag.children[1].get("text")).toBe("tag1");

    layer.destroy();
  });

  it("init multiple tags with maxWidth should work", () => {
    const layer = new Layer();
    let tagContainer = TagUtils.initTags(layer, {
      left: 100,
      top: 100,
      maxWidth: 100,
      tags: ["tag11", "tag22", "tag33"].map((text: string) => {
        return {
          text,
          close: {
            icon: "111",
          },
        };
      }),
    });

    expect(tagContainer.children.length).toBe(2);
    expect(tagContainer.get("overflow")).toBe(true);
    expect(tagContainer.get("__tagsOption").left).toBe(100);
    expect(tagContainer.get("__tagsOption").maxWidth).toBe(100);

    let tag1 = tagContainer.children[0] as Layer;
    expect(tag1.children[0].get("radius")).toBe(2);
    expect(tag1.children[0].get("fillStyle")).toBe("#F0F1F3");
    expect(tag1.children[1].get("text")).toBe("tag11");

    let tag2 = tagContainer.children[1] as Layer;
    expect(tag2.children[0].get("radius")).toBe(2);
    expect(tag2.children[0].get("fillStyle")).toBe("#F0F1F3");
    expect(tag2.children[1].get("text")).toBe("+2");

    tagContainer = TagUtils.removeTag(tag1) as Layer;
    expect(tagContainer.children.length).toBe(2);
    expect(tagContainer.get("overflow")).toBe(true);

    tag1 = tagContainer.children[0] as Layer;
    expect(tag1.children[0].get("radius")).toBe(2);
    expect(tag1.children[1].get("text")).toBe("tag22");

    tag2 = tagContainer.children[1] as Layer;
    expect(tag2.children[0].get("fillStyle")).toBe("#F0F1F3");
    expect(tag2.children[1].get("text")).toBe("+1");

    tagContainer = TagUtils.removeTag(tag1);
    expect(tagContainer.children.length).toBe(1);
    expect(tagContainer.get("overflow")).toBe(undefined);

    tag1 = tagContainer.children[0] as Layer;
    expect(tag1.children[0].get("radius")).toBe(2);
    expect(tag1.children[1].get("text")).toBe("tag33");

    tagContainer = TagUtils.removeTag(tag1);
    expect(tagContainer.children.length).toBe(0);
    expect(tagContainer.get("overflow")).toBe(undefined);

    layer.destroy();
  });

  it("add tag should work", () => {
    const layer = new Layer({});
    let tagsLayer: any = TagUtils.initTags(layer, {
      left: 0,
      top: 0,
      maxWidth: 100,
      tags: [
        {
          text: "标签1",
        },
      ],
    });

    expect(tagsLayer.children.length).toBe(1);
    expect(tagsLayer.get("overflow")).toBe(undefined);
    expect(tagsLayer.children[0].children[1].get("text")).toBe("标签1");

    if (OS_PLATFORM === "linux") {
      tagsLayer = TagUtils.addTag(tagsLayer, { text: "标签2" });
      expect(tagsLayer.get("overflow")).toBe(true);
      expect(tagsLayer.children[1].children[1].get("text")).toBe("+1");

      tagsLayer = TagUtils.addTag(tagsLayer, { text: "标签3" });
      expect(tagsLayer.get("overflow")).toBe(true);
      expect(tagsLayer.children[1].children[1].get("text")).toBe("+2");
    } else {
      tagsLayer = TagUtils.addTag(tagsLayer, { text: "标签2" });
      expect(tagsLayer.get("overflow")).toBe(undefined);
      expect(tagsLayer.children[1].children[1].get("text")).toBe("标签2");

      tagsLayer = TagUtils.addTag(tagsLayer, { text: "标签3" });
      expect(tagsLayer.get("overflow")).toBe(true);
      expect(tagsLayer.children[1].children[1].get("text")).toBe("+2");

      tagsLayer = TagUtils.addTag(tagsLayer, { text: "标签4" });
      expect(tagsLayer.get("overflow")).toBe(true);
      expect(tagsLayer.children[1].children[1].get("text")).toBe("+3");
    }
  });
});
