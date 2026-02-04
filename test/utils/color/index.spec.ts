import {
  getGrayScale, isDarkColor, isGradient
} from '../../../src/utils/color';

describe('./utils/color.ts', () => {

  it('getGrayScale should work', () => {
    expect(getGrayScale('black')).toEqual(0);
    expect(getGrayScale('rgb(255, 255, 255)')).toEqual(255);
    expect(getGrayScale('#FFB6C1')).toEqual(205);
    expect(getGrayScale('rgb( 123, 234, 0)')).toEqual(174);
  });

  it('isDarkColor should work', () => {
    // 黑色应该是暗色
    expect(isDarkColor('black')).toEqual(true);
    // 蓝色应该是暗色
    expect(isDarkColor('#0000ff')).toEqual(true);
    // 白色应该不是暗色
    expect(isDarkColor('rgb(255, 255, 255)')).toEqual(false);
    // 黄色应该不是暗色
    expect(isDarkColor('yellow')).toEqual(false);
  });

  it('isGradient should work', () => {
    expect(isGradient('#fff')).toBe(false);
    expect(isGradient('#000000')).toBe(false);
    expect(isGradient('rgb(255, 255, 255)')).toBe(false);
    expect(isGradient('rgba(255, 255, 255, 0.1)')).toBe(false);
    expect(isGradient('red')).toBe(false);

    expect(isGradient('l(0) 0:blue 0.5:red 1:yellow')).toBe(true);
    expect(isGradient('r(0.5,0.5,0.5) 0:blue 0.5:red 1:yellow')).toBe(true);
  });
});
