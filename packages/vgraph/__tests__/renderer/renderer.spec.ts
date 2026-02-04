import { getRenderer, setRenderer } from "../../src/renderer/renderer";

describe("src/renderer", () => {
  it("getter & setter should work", () => {
    expect(getRenderer()).toBe("canvas");
    setRenderer("webgl");
    expect(getRenderer()).toBe("webgl");
  });
});
