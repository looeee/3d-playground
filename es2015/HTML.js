import {
  xCoord,
  yCoord,
  length,
}
from './utility';
// * ***********************************************************************
// *
// *  HTML CLASSES
// *
// *  Any HTML controlling classes go here
// *
// *************************************************************************


// * ***********************************************************************
// *
// *  CENTRECIRCLE CLASS
// *
// *  This controls the centre circle layout
// *
// *************************************************************************
export class CentreCircle {
  constructor() {
    this.elem = document.querySelector('#centreCircle');
    this.layout();
  }

  layout() {
    this.elem.style.width = `${length(50)}px`;
    this.elem.style.height = `${length(50)}px`;
  }
}

// * ***********************************************************************
// *
// *  CENTRECIRCLECONTENTS CLASS
// *
// *  This controls the centre circle contents
// *
// *************************************************************************
export class CentreCircleContents {
  constructor() {

  }
}
