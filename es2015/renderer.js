//import * as E from './universal/mathFunctions';
//import { Point, Circle } from './universal/universalElements';
// * ***********************************************************************
// *
// *  RENDERER CLASS
// *
// *  Controller for THREE.js
// *************************************************************************
export class Renderer {
  constructor(renderElem) {
    this.scene = new THREE.Scene();
    this.initCamera();
    this.initRenderer(renderElem);
  }

  reset() {
    this.clearScene();
    this.pattern = null; //reset materials;
    this.setCamera();
    this.setRenderer();
  }

  clearScene() {
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const object = this.scene.children[i];
      if (object.type === 'Mesh') {
        object.geometry.dispose();
        object.material.dispose();
        this.scene.remove(object);
      }
    }
  }

  initCamera() {
    this.camera = new THREE.OrthographicCamera();
    this.setCamera();
    this.scene.add(this.camera);
  }

  setCamera() {
    this.camera.left = -window.innerWidth / 2;
    this.camera.right = window.innerWidth / 2;
    this.camera.top = window.innerHeight / 2;
    this.camera.bottom = -window.innerHeight / 2;
    this.camera.near = -2;
    this.camera.far = 1;
    this.camera.frustumCulled = false;
    this.camera.updateProjectionMatrix();
  }

  initRenderer(renderElem) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    if (renderElem) {
      this.renderer.domElement = renderElem;
    }
    else {
      document.body.appendChild(this.renderer.domElement);
    }
    this.setRenderer();
  }

  setRenderer() {
    this.renderer.setClearColor(0x000000, 1.0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  disk(circle, color) {
    if (color === undefined) color = 0xffffff;
    const geometry = new THREE.CircleGeometry(circle.radius, 100, 0, 2 * Math.PI);
    const material = new THREE.MeshBasicMaterial({ color });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = circle.centre.x;
    mesh.position.y = circle.centre.y;

    this.scene.add(mesh);
  }

  //NOTE: some polygons are inverted due to vertex order,
  //solved this by making material doubles sided
  createMesh(geometry, color, textures, materialIndex, wireframe, elem) {
    if (wireframe === undefined) wireframe = false;
    if (color === undefined) color = 0xffffff;

    if (!this.pattern) {
      this.createPattern(color, textures, wireframe, elem);
    }
    return new THREE.Mesh(geometry, this.pattern.materials[materialIndex]);
  }

  //render to image elem
  renderToImageElem(elem) {
    this.renderer.render(this.scene, this.camera);
    this.appendImageToDom(elem);
    this.clearScene();
  }

  //allows drawing of the image once adding this image to DOM elem
  appendImageToDom(elem) {
    document.querySelector(elem).setAttribute('src', this.renderer.domElement.toDataURL());
  }

  //Download the canvas as a png image
  downloadImage() {
    const link = document.querySelector('#download-image');
    link.href = this.renderer.domElement.toDataURL();
    link.download = 'hyperbolic-tiling.png';
  }

  //convert the canvas to a base64URL and send to saveImage.php
  saveImage() {
    const data = this.renderer.domElement.toDataURL();
    const xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'saveImage.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send(`img=${data}`);
  }

  addBoundingBoxHelper(mesh) {
    const box = new THREE.BoxHelper(mesh);
    //box.update();
    this.scene.add(box);
  }

  render() {
    window.requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera);
  }
}

/* UNUSED FUNCTIONS


  segment(circle, startAngle, endAngle, color) {
    if (color === undefined) color = 0xffffff;

    const curve = new THREE.EllipseCurve(
      circle.centre.x * this.radius,
      circle.centre.y * this.radius,
      circle.radius * this.radius,
      circle.radius * this.radius, // xRadius, yRadius
      startAngle, endAngle,
      false // aClockwise
    );

    const points = curve.getSpacedPoints(100);

    const path = new THREE.Path();
    const geometry = path.createGeometry(points);

    const material = new THREE.LineBasicMaterial({
      color: color
    });
    const s = new THREE.Line(geometry, material);

    this.scene.add(s);
  }

  line(start, end, color) {
    if (color === undefined) color = 0xffffff;

    const geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3(start.x * this.radius, start.y * this.radius, 0),
      new THREE.Vector3(end.x * this.radius, end.y * this.radius, 0)
    );
    const material = new THREE.LineBasicMaterial({
      color: color
    });
    const l = new THREE.Line(geometry, material);
    this.scene.add(l);
  }
*/
