import {
  randomFloat,
  randomInt
}
from './universal/mathFunctions';
//import { Point, Circle } from './universal/universalElements';
import {
  Arc,
  Disk,
  Segment,
}
from './objects';

// * ***********************************************************************
// *
// *  DRAWING CLASS
// *
// *  Here we will create some pretty things.
// *  Note that all objects imported from objects.js will
// *  have spec attributes converted to screen percentage
// *  positions/lengths going from (0,0) bottom left to
// *  (100,100) top right
// *
// *************************************************************************
export class Drawing {
  constructor(renderer) {
    this.renderer = renderer;
    this.init();
    this.resize();
  }

  init() {
    this.test();
  }

  resize() {
    window.addEventListener(
      'resize',
      () => {
        this.init();
      },
      false
    );
  }

  test() {
    const mouseoverCallback = (elem) => {
      elem.intersect.object.material.color = new THREE.Color(randomInt(0x612f60, 0xffffff));
      elem.intersect.object.material.needsUpdate = true;
    };

    const clickCallback = (elem) => {
      console.log('click!');
    };

    for (let i = 0; i < 12; i++) {
      const testSegment = new Segment({
        outerRadius: 40,
        innerRadius: 25,
        innerWidth: Math.PI / 6, //in radians
        outerWidth: Math.PI / 6.2, //in radians
        offset: i * Math.PI / 6, //in radians
        color: randomInt(0x612f60, 0xffffff),
      });
      this.renderer.add(testSegment);

      this.renderer.domEvents.addEventListener(
        testSegment,
        'mouseover',
        mouseoverCallback,
        false
      );

      this.renderer.domEvents.addEventListener(
        testSegment,
        'click',
        clickCallback,
        false
      );
    }
  }
}
