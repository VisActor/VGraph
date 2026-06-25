window.HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillRect: function () {},
    clearRect: function () {},
    getImageData: function (x: number, y: number, w: number, h: number) {
      return {
        data: new Array(w * h * 4),
      };
    },
    putImageData: function () {},
    createImageData: function () {
      return [];
    },
    setTransform: function () {},
    drawImage: function () {},
    save: function () {},
    fillText: function () {},
    restore: function () {},
    beginPath: function () {},
    moveTo: function () {},
    lineTo: function () {},
    closePath: function () {},
    stroke: function () {},
    translate: function () {},
    scale: function () {},
    rotate: function () {},
    arc: function () {},
    fill: function () {},
    measureText: function () {
      return { width: 0 };
    },
    transform: function () {},
    rect: function () {},
    clip: function () {},
  };
} as any;

window.HTMLCanvasElement.prototype.toDataURL = function () {
  return "";
};

window.HTMLDivElement.prototype.scrollTo = function (
  x: number,
  y: number
) {} as any;
