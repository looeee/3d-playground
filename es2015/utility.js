//The following three functions convert values from percentages starting at
//(0,0) bottom left to (100,100) top right screen coords
const xPercent = window.innerWidth / 100;
const yPercent = window.innerHeight / 100;
export const xCoord = (x) => {
  return x < 50 ? (-50 + x) * xPercent : (x - 50) * xPercent;
};
export const yCoord = (y) => {
  return y < 50 ? (-50 + y) * yPercent : (y - 50) * yPercent;
};
//Lengths are calculated from a percentage of screen width
//or height depending on which is smaller. This means that
//objects assigned a length of 100 (or circles radius 50)
//will never be drawn off screen
export const length = (len) => {
  return (xPercent < yPercent) ? len * xPercent : len * yPercent;
};
