import {
  Renderer,
}
from './renderer';
import {
  LayoutController as Layout,
}
from './layout';

import {
  Drawing,
}
from './drawing';
// * ***********************************************************************
// *
// *  CONTROLLER CLASS
// *
// *************************************************************************
export class Controller {
  constructor() {
    this.layout = new Layout();
    this.renderer = new Renderer(
      //document.querySelector('#canvas') //NOT WORKING!!
    );
    this.drawing = new Drawing(this.renderer);
    this.init();
  }

  init() {
    //this.renderer.render();
    //This will use GSAP rAF instead of THREE.js
    //also remove request animation frame from render function!
    TweenMax.ticker.addEventListener('tick', () => this.renderer.render());
  }

  onResize() {
  }

  //to use this add buttons with the classes below
  saveImageButtons() {
    document.querySelector('#save-image').onclick = () => this.render.saveImage();
    document.querySelector('#download-image').onclick = () => this.render.downloadImage();
  }
}
