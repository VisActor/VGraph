import { Icon } from "../../src/renderer/shapes/icon";

describe("standard icon entity decoding", () => {
  it("decodes decimal, hexadecimal, and supplementary-plane numeric entities", () => {
    expect(new Icon({ x: 0, y: 0, icon: "&#65;" }).get("iconText")).toBe("A");
    expect(new Icon({ x: 0, y: 0, icon: "&#x41;" }).get("iconText")).toBe("A");
    expect(new Icon({ x: 0, y: 0, icon: "&#x1F600;" }).get("iconText")).toBe(
      "\uD83D\uDE00"
    );
  });

  it("leaves malformed or out-of-range icon text unchanged", () => {
    expect(new Icon({ x: 0, y: 0, icon: "&x41;" }).get("iconText")).toBe(
      "&x41;"
    );
    expect(new Icon({ x: 0, y: 0, icon: "&#x110000;" }).get("iconText")).toBe(
      "&#x110000;"
    );
    expect(new Icon({ x: 0, y: 0, icon: "plain-text" }).get("iconText")).toBe(
      "plain-text"
    );
  });
});
