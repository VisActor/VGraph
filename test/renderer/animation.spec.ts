import { Canvas, Circle } from '../../src';

describe('src/animation', () => {
  const div = document.createElement('div');
  document.body.append(div);
  const canvas = new Canvas({
    width: 100,
    height: 100,
    container: div,
  });
  const circle = new Circle({
    cx: 50,
    cy: 50,
    r: 10,
    fillStyle: '#eee',
  });

  it('single config animation should work', done => {
    canvas.animate({
      target: circle,
      configs: {
        cy: 200,
      },
      duration: 500,
      delay: 1000,
      onFinish() {
        expect(circle.get('cy')).toBe(200);
        done();
      }
    });
  });

  it('multiple config animation should work', done => {
    canvas.animate({
      target: circle,
      configs: {
        cy: 100,
        fillStyle: '#111',
      },
      duration: 1000,
      onFinish() {
        expect(circle.get('cy')).toBe(100);
        expect(circle.get('fillStyle')).toBe('#111');
        done();
      }
    });
  });

  it('override animation config should work', done => {
    canvas.animate({
      target: circle,
      configs: {
        cy: 300,
        r: 100,
      },
      duration: 1000,
    });
    canvas.animate({
      target: circle,
      configs: {
        r: 200,
      },
      duration: 500,
      easing: 'easeCubic',
      onFinish() {
        const cy = circle.get('cy');
        expect(circle.get('r')).toBe(200);
        expect(Math.max(Math.min(cy, 200), 200)).toBe(200);
        done();
      }
    });
  });

  it('onFrame should work', done => {
    let last = 0;
    canvas.animate({
      target: circle,
      duration: 1000,
      onFrame(ratio) {
        const offset = 100 * (ratio - last);
        circle.translate(offset, offset);
        last = ratio;
      },
      onFinish() {
        const matrix = circle.getMatrix();
        matrix[4] = Math.round(matrix[4]);
        matrix[5] = Math.round(matrix[5]);
        expect(circle.getMatrix()).toEqual([1, 0, 0, 1, 100, 100]);
        done();
      }
    });
  });

  it('stop animation should work', done => {
    let last = 0;
    const uuid = canvas.animate({
      target: circle,
      duration: 1000,
      repeat: true,
      onFrame(ratio) {
        const offset = 100 * (ratio - last);
        circle.translate(offset, offset);
        last = ratio;
      },
    });

    setTimeout(() => {
      expect(circle.animating);
      expect(canvas.animationManager.animating);
      canvas.stopAnimate(uuid);

      expect(circle.animating).toBe(false);
      expect(canvas.animationManager.animating).toBe(false);
      done();
    }, 2000);
  });

});
