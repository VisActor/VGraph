import {
  colorParser,
  getRgbaValue,
  GradientColor,
  OrdinaryColor,
} from "../../../src/utils/color/parser";
describe("./utils/color.ts", () => {
  it("getRgbaValue should work", () => {
    expect(getRgbaValue("black")).toEqual([0, 0, 0, 1]);
    expect(getRgbaValue("cyan")).toEqual([0, 255, 255, 1]);
    expect(getRgbaValue("red")).toEqual([255, 0, 0, 1]);
    expect(getRgbaValue("#ffffff")).toEqual([255, 255, 255, 1]);
    expect(getRgbaValue("#ffffff33")).toEqual([255, 255, 255, 0.2]);
    expect(getRgbaValue("#FFB6C1")).toEqual([255, 182, 193, 1]);
    expect(getRgbaValue("#FFB6C1CC")).toEqual([255, 182, 193, 0.8]);
    expect(getRgbaValue("rgb(123, 234, 0)")).toEqual([123, 234, 0, 1]);
    expect(getRgbaValue("rgba( 123, 234, 0, 0.23)")).toEqual([
      123, 234, 0, 0.23,
    ]);
    expect(getRgbaValue("hsl(13, 100%, 11%)")).toEqual([56, 12, 0, 1]);
    expect(getRgbaValue("hsla(13, 100%, 11%, 0.4)")).toEqual([56, 12, 0, 0.4]);
  });

  it("OrdinaryColor should work", () => {
    const ordinaryColor = colorParser("#141414") as OrdinaryColor;
    expect(ordinaryColor.hex()).toBe("#141414");
    expect(ordinaryColor.value()).toEqual([20, 20, 20, 1]);
    expect(ordinaryColor.vec4()).toEqual([
      0.0784313725490196, 0.0784313725490196, 0.0784313725490196, 1,
    ]);
    expect(ordinaryColor.rgba()).toBe("rgba(20,20,20,1)");
    ordinaryColor.add("#141414");
    expect(ordinaryColor.hex()).toBe("#282828");
    ordinaryColor.sub("#101010");
    expect(ordinaryColor.hex()).toBe("#181818");
    ordinaryColor.multiply("#808080");
    expect(ordinaryColor.hex()).toBe("#0c0c0c");
    ordinaryColor.scalar(2);
    expect(ordinaryColor.hex()).toBe("#181818");
    ordinaryColor.reverse();
    expect(ordinaryColor.hex()).toBe("#e7e7e7");
    ordinaryColor.lerp("#ffffff", 0.25);
    expect(ordinaryColor.hex()).toBe("#ededed");
  });

  it("GradientColor should word", () => {
    const gradientColor = colorParser(
      "l(0) 0:#fff 0.5:#7ec2f3 1:#1890ff"
    ) as GradientColor;
    expect(gradientColor.toString()).toBe(
      "l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff "
    );
    expect(gradientColor.type()).toEqual(0);
    expect(gradientColor.params()).toEqual([-0.5, -0.5, 0.5, -0.5]);
    expect(gradientColor.stops()).toEqual([0, 0.5, 1]);
    expect(gradientColor.vec4()).toEqual([
      [1, 1, 1, 1],
      [0.49411764705882355, 0.7607843137254902, 0.9529411764705882, 1],
      [0.09411764705882353, 0.5647058823529412, 1, 1],
    ]);
    gradientColor.sub("#000011");
    expect(gradientColor.toString()).toBe(
      "l(0) 0:#ffffee 0.5:#7ec2e2 1:#1890ee "
    );
    gradientColor.add("#000002");
    expect(gradientColor.toString()).toBe(
      "l(0) 0:#fffff0 0.5:#7ec2e4 1:#1890f0 "
    );
    gradientColor.reverse();
    expect(gradientColor.toString()).toBe(
      "l(0) 0:#00000f 0.5:#813d1b 1:#e76f0f "
    );
  });
});
