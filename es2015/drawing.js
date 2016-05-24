import { randomFloat, randomInt } from './universal/mathFunctions';
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
  }

  init() {
    this.test();
  }

  test() {
    for (let i = 0; i < 12; i++) {
      const testSegment = new Segment({
        outerRadius: 40,
        innerRadius: 25,
        width: Math.PI / 6, //in radians
        offset: i * Math.PI / 6, //in radians
        color: randomInt(0x612f60, 0xffffff),
      });
      this.renderer.add(testSegment);
    }
  }
}
