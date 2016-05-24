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

import {
  CentreCircle,
}
from './HTML';
// * ***********************************************************************
// *
// *  CONTROLLER CLASS
// *
// *************************************************************************
export class Controller {
  constructor() {
    this.layout = new Layout();
    this.renderer = new Renderer();
    this.centreCircle = new CentreCircle();
    this.drawing = new Drawing(this.renderer);
    this.init();
  }

  init() {
    this.renderer.render();

    //This will use GSAP rAF instead of THREE.js
    //also remove request animation frame from render function!
    //TweenMax.ticker.addEventListener('tick', () => this.renderer.render());
  }


  //to use this add buttons with the classes below
  saveImageButtons() {
    document.querySelector('#save-image').onclick = () => this.render.saveImage();
    document.querySelector('#download-image').onclick = () => this.render.downloadImage();
  }
}
