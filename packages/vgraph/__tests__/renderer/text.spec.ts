import { Text } from "../../src/renderer/shapes/text";
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
    expect(text.getBBox().top).toBe(-45);
    expect(text.getBBox().height).toBe(90);
  });

  it("bugfix: 文本阶段长度计算", () => {
    const text = new Text({
      text: "支付用户渗透率支付用户渗透率",
      x: 0,
      y: 0,
      width: 122,
    });
    if (OS_PLATFORM === "linux") {
      expect(text.getDrawText()).toEqual(["支付用户渗透率支"]);
    } else {
      expect(text.getDrawText()).toEqual(["支付用户渗透率支付用"]);
    }

    text.set("textOverflow", "ellipsis");
    if (OS_PLATFORM === "linux") {
      expect(text.getDrawText()).toEqual(["支付用户渗透率..."]);
    } else {
      expect(text.getDrawText()).toEqual(["支付用户渗透率支付..."]);
    }
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
