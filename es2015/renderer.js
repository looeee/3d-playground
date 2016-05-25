// * ***********************************************************************
// *
// *  POSTPROCESSING CLASS
// *
// *  Post effects for THREE.js
// *************************************************************************
class Postprocessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    const renderPass = new THREE.RenderPass(scene, camera);
    const copyPass = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;

    this.composer = new THREE.EffectComposer(renderer);
    this.composer.addPass(renderPass);

    this.effects();

    this.composer.addPass(copyPass);

    //this.antialias();
    return this.composer;
  }

  antialias() {
    const msaaRenderPass = new THREE.ManualMSAARenderPass(this.scene, this.camera);
    msaaRenderPass.sampleLevel = 4;
    //msaaRenderPass.unbiased = true;
    this.composer.addPass(msaaRenderPass);
  }

  effects() {
    const testPass = new THREE.ShaderPass(THREE.ColorifyShader);
    testPass.uniforms[ "color" ].value = new THREE.Color( 0xff0000 );
    //this.composer.addPass(testPass);
  }
}

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
    this.postRenderer = new Postprocessing(this.renderer, this.scene, this.camera);

    this.showStats();
    this.resize();
    this.setupDOMEvents();
  }

  add(mesh) {
    this.scene.add(mesh);
  }

  reset() {
    this.clearScene();
    this.pattern = null; //reset materials;
    this.setCamera();
    this.setRenderer();
  }

  //https://github.com/jeromeetienne/threex.domevents
  setupDOMEvents() {
    this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);
  }

  resize() {
    window.addEventListener(
      'resize',
      () => {
        this.clearScene();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //this.camera.aspect	= window.innerWidth / window.innerHeight;
        this.setCamera();
        //this.camera.updateProjectionMatrix();
      },
      false
    );
  }

  //clear all meshes from the scene, but preserve camera/renderer
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
    this.camera.near = -10;
    this.camera.far = 10;
    this.camera.frustumCulled = false;
    this.camera.updateProjectionMatrix();
  }

  initRenderer(renderElem) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      //preserveDrawingBuffer: false,
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

  //include https://github.com/mrdoob/stats.js/blob/master/build/stats.min.js
  showStats() {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  }

  render() {
    window.requestAnimationFrame(() => this.render());
    if (this.stats) this.stats.update();
    this.postRenderer.render();
  }
}
