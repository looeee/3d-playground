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
    this.elem = document.querySelector('#centreCircleContents');
  }

  switchContents(newContentsFile) {
    //don't load the same contents twice
    if (this.currentContentsFile === newContentsFile) return;

    this.currentContentsFile = newContentsFile;
    // url (required), options (optional)
    fetch(newContentsFile, {
      method: 'get',
    }).then((response) => {
      return response.text();
    }).then((html) => {
      this.elem.innerHTML = html;
    })
    .catch((err) => {
      console.error(`Failed to load ${newContentsFile}`);
    });
  }

}
