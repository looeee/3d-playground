import { Controller } from './controller';
// * ***********************************************************************
// *
// *   POLYFILLS
// *
// *************************************************************************


// * ***********************************************************************
// *
// *   SETUP
// *
// *************************************************************************

let controller;
window.onload = () => {
  controller = new Controller();
};

window.onresize = () => {
  //controller.onResize();
};
