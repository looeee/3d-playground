const createBackground = require('three-vignette-background');
import {
  randomFloat,
  randomInt,
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
    this.addBackground();
    //this.test();
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

  addBackground() {
    const background = createBackground({
      geometry: new THREE.PlaneGeometry(2, 2, 1),
      colors: ['#fff', '#283844'],
      aspect: 1,
      grainScale: 0.001,
      grainTime: 0,
      noiseAlpha: 0.4,
      smooth: [1, 0.999],
      scale: [1, 1],
      offset: [1, 1],
      aspectCorrection: false,
    });
    window.addEventListener('mousemove', (e) => {
      const x = e.pageX;
      const y = e.pageY;
      const w = window.innerWidth;
      const h = window.innerHeight;

      const offsetX = (x === 0) ? 0 : x / w;
      const offsetY = (y === 0) ? 0.999 : 1 - y / h;

      console.log(offsetX, offsetY);
      background.style({
        offset: [offsetX, offsetY],
        smooth: [1, offsetY],
        //grainScale: offsetY,
        noiseAlpha: (offsetX > 0.4) ? offsetX : 0.4,
      });
    });
    this.renderer.add(background);
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
