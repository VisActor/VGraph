import { Text } from "../../src/renderer/shapes/text";
import { measureText } from "../../src/renderer/utils/text";
const OS_PLATFORM = process.platform;

function expectValueBySystem(value: any, macValue: any, winValue: any) {
  if (typeof value === "number") {
    expect(value).toBeCloseTo(OS_PLATFORM === "linux" ? winValue : macValue, 3);
  } else if (OS_PLATFORM === "linux") {
    expect(value).toBe(winValue);
  } else {
    expect(value).toBe(macValue);
  }
}

function expectWrappedTextWithinWidth(
  sourceText: string,
  wrappedText: string,
  width: number
) {
  const measureConfigs = { text: "", x: 0, y: 0, width };
  expect(sourceText.startsWith(wrappedText)).toBe(true);
  expect(measureText(wrappedText, measureConfigs)).toBeLessThanOrEqual(width);

  if (wrappedText.length < sourceText.length) {
    expect(
      measureText(sourceText.slice(0, wrappedText.length + 1), measureConfigs)
    ).toBeGreaterThan(width);
  }
}

function expectEllipsizedTextWithinWidth(
  sourceText: string,
  ellipsizedText: string,
  width: number
) {
  const measureConfigs = { text: "", x: 0, y: 0, width };
  expect(ellipsizedText.endsWith("...")).toBe(true);

  const visibleText = ellipsizedText.slice(0, -3);
  expect(sourceText.startsWith(visibleText)).toBe(true);
  expect(measureText(ellipsizedText, measureConfigs)).toBeLessThanOrEqual(
    width
  );

  if (visibleText.length < sourceText.length) {
    expect(
      measureText(
        `${sourceText.slice(0, visibleText.length + 1)}...`,
        measureConfigs
      )
    ).toBeGreaterThan(width);
  }
}

describe("src/shapes/text.ts", () => {
  it("should work without width & height", () => {
    const text = new Text({
      text: "long long long long long long long",
      x: 0,
      y: 0,
      textAlign: "left",
      textBaseline: "top",
    });
    const { left, top, width, height } = text.getBBox();
    expect(left).toBe(0);
    expect(top).toBe(0);
    expectValueBySystem(width, 178.81640625, 206);
    expect(height).toBe(18);
    expect(text.isOverflow()).toBe(false);
  });

  it("should work with width", () => {
    const text = new Text({
      text: "long long long long long long long",
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      textAlign: "left",
      textBaseline: "top",
    });

    const { left, top, width, height } = text.getBBox();
    expect(left).toBe(0);
    expect(top).toBe(0);
    expectValueBySystem(width, 94.078125, 97);
    expectValueBySystem(height, 36, 36);
    expectValueBySystem(text.getDrawText().length, 2, 2);
    expectValueBySystem(text.isOverflow(), false, true);
  });

  it("should work with width & height", () => {
    const text = new Text({
      text: "long long long long long long long",
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      textAlign: "left",
      textBaseline: "top",
    });

    const { left, top, width, height } = text.getBBox();
    expect(left).toBe(0);
    expect(top).toBe(0);
    expectValueBySystem(width, 94.078125, 93);
    expect(height).toBe(18);

    expect(text.getDrawText().length).toBe(1);
    expect(text.isOverflow()).toBe(true);
  });

  it("ellipsis should work", () => {
    const text = new Text({
      text: "long long long long long long long",
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      textAlign: "left",
      textBaseline: "top",
      textOverflow: "ellipsis",
    });

    const { left, top, width, height } = text.getBBox();
    expect(left).toBe(0);
    expect(top).toBe(0);
    expectValueBySystem(width, 97.40625, 98);
    expect(height).toBe(18);
    const drawText = text.getDrawText();
    expect(drawText.length).toBe(1);
    expect(drawText[0].endsWith("..."));
    expect(text.isOverflow()).toBe(true);
  });

  it("bugfix: strokeStyle should work", () => {
    const text = new Text({
      text: "long long long long long long long",
      textBaseline: "top",
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      textAlign: "left",
      strokeStyle: "#fff",
    });

    const { left, top, width, height } = text.getBBox();
    expect(left).toBe(-0.5);
    expect(top).toBe(-0.5);
    expectValueBySystem(width, 95.078125, 94);
    expect(height).toBe(19);
    expect(text.isOverflow()).toBe(true);
  });

  it("should render number", () => {
    const configs: any = {
      text: 1,
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      textAlign: "left",
      strokeStyle: "#fff",
    };
    const text = new Text(configs);
    expect(text.get("text")).toBe("1");
    expect(text.get("textBaseline")).toBe("middle");
    const { left, top, height } = text.getBBox();
    expect(height).toBe(19);
    expect(left).toBe(-0.5);
    expect(top).toBe(-9.5);

    text.set("text", 111);
    expect(text.get("text")).toBe("111");
    expect(text.isOverflow()).toBe(false);
  });

  it('"" should work', () => {
    const text = new Text({
      text: "",
      x: 0,
      y: 0,
      fillStyle: "#666",
    });
    expect(text.getBBox()).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    expect(text.isOverflow()).toBe(false);
  });

  it("bugfix: 分行时至少每行有一个字符", () => {
    const text = new Text({
      text: "abcde",
      x: 0,
      y: 0,
      width: 5,
      height: 100,
    });

    expect(text.getDrawText()).toEqual(["a", "b", "c", "d", "e"]);
    const bbox = text.getBBox();
    expect(bbox.height).toBe(text.getDrawText().length * text.getLineHeight());
    expect(bbox.top).toBe(-bbox.height / 2);
  });

  it("bugfix: 文本阶段长度计算", () => {
    const sourceText = "支付用户渗透率支付用户渗透率";
    const width = 122;
    const text = new Text({
      text: sourceText,
      x: 0,
      y: 0,
      width,
    });

    const drawText = text.getDrawText();
    expect(drawText).toHaveLength(1);
    expectWrappedTextWithinWidth(sourceText, drawText[0], width);

    text.set("textOverflow", "ellipsis");
    const ellipsizedText = text.getDrawText();
    expect(ellipsizedText).toHaveLength(1);
    expectEllipsizedTextWithinWidth(sourceText, ellipsizedText[0], width);
  });

  it("bugfix: 连续换行情况", () => {
    const text = new Text({
      text: "支付用户\n\n渗透率支付\n\n用户渗透率",
      x: 0,
      y: 0,
      width: 122,
      height: 200,
    });
    expect(text.getDrawText()).toEqual([
      "支付用户",
      "",
      "渗透率支付",
      "",
      "用户渗透率",
    ]);
  });

  it("bugfix: 配置了 ellipsis 的小宽度文本过长", () => {
    const text = new Text({
      text: "小宽度文本",
      width: 20,
      textOverflow: "ellipsis",
      x: 0,
      y: 0,
    });
    expect(text.getDrawText()).toEqual(["..."]);
  });
});
