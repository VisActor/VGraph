import { Icon } from "../../src/renderer/shapes/icon";

describe("src/shapes/icon.ts", () => {
  it("create & update should work", () => {
    const icon = new Icon({
      x: 0,
      y: 10,
      icon: "&#xe836;",
    });

    expect(icon.get("x")).toBe(0);
    expect(icon.get("y")).toBe(10);
    expect(icon.get("icon")).toBe("&#xe836;");
    const iconText = icon.get("iconText");
    expect(iconText).not.toBe("&#xe836;");

    icon.set("icon", "&#xe837;");
    expect(icon.get("icon")).toBe("&#xe837;");
    expect(icon.get("iconText")).not.toBe("&#xe837;");
    expect(icon.get("iconText")).not.toBe(iconText);
  });

  it("getBBox should work", () => {
    const icon = new Icon({
      x: 50,
      y: 10,
      icon: "&#xe836;",
    });
    expect(icon.getBBox()).toEqual({
      left: 42,
      top: 2,
      width: 16,
      height: 16,
    });

    icon.set("size", 24);
    expect(icon.getBBox()).toEqual({
      left: 38,
      top: -2,
      width: 24,
      height: 24,
    });
  });
});
