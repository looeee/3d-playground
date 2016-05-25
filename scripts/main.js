(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;

// * ***********************************************************************
// *
// *  POSTPROCESSING CLASS
// *
// *  Post effects for THREE.js
// *************************************************************************

var Postprocessing = function () {
  function Postprocessing(renderer, scene, camera) {
    babelHelpers.classCallCheck(this, Postprocessing);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    var renderPass = new THREE.RenderPass(scene, camera);
    var copyPass = new THREE.ShaderPass(THREE.CopyShader);
    copyPass.renderToScreen = true;

    this.composer = new THREE.EffectComposer(renderer);
    this.composer.addPass(renderPass);

    this.effects();

    this.composer.addPass(copyPass);

    //this.antialias();
    return this.composer;
  }

  Postprocessing.prototype.antialias = function antialias() {
    var msaaRenderPass = new THREE.ManualMSAARenderPass(this.scene, this.camera);
    msaaRenderPass.sampleLevel = 4;
    //msaaRenderPass.unbiased = true;
    this.composer.addPass(msaaRenderPass);
  };

  Postprocessing.prototype.effects = function effects() {
    var testPass = new THREE.ShaderPass(THREE.ColorifyShader);
    testPass.uniforms["color"].value = new THREE.Color(0xff0000);
    //this.composer.addPass(testPass);
  };

  return Postprocessing;
}();

// * ***********************************************************************
// *
// *  RENDERER CLASS
// *
// *  Controller for THREE.js
// *************************************************************************


var Renderer = function () {
  function Renderer(renderElem) {
    babelHelpers.classCallCheck(this, Renderer);

    this.scene = new THREE.Scene();
    this.initCamera();
    this.initRenderer(renderElem);
    this.postRenderer = new Postprocessing(this.renderer, this.scene, this.camera);

    this.showStats();
    this.resize();
    this.setupDOMEvents();
  }

  Renderer.prototype.add = function add(mesh) {
    this.scene.add(mesh);
  };

  Renderer.prototype.reset = function reset() {
    this.clearScene();
    this.pattern = null; //reset materials;
    this.setCamera();
    this.setRenderer();
  };

  //https://github.com/jeromeetienne/threex.domevents


  Renderer.prototype.setupDOMEvents = function setupDOMEvents() {
    this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);
  };

  Renderer.prototype.resize = function resize() {
    var _this = this;

    window.addEventListener('resize', function () {
      _this.clearScene();
      _this.renderer.setSize(window.innerWidth, window.innerHeight);
      //this.camera.aspect	= window.innerWidth / window.innerHeight;
      _this.setCamera();
      //this.camera.updateProjectionMatrix();
    }, false);
  };

  //clear all meshes from the scene, but preserve camera/renderer


  Renderer.prototype.clearScene = function clearScene() {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      var object = this.scene.children[i];
      if (object.type === 'Mesh') {
        object.geometry.dispose();
        object.material.dispose();
        this.scene.remove(object);
      }
    }
  };

  Renderer.prototype.initCamera = function initCamera() {
    this.camera = new THREE.OrthographicCamera();
    this.setCamera();
    this.scene.add(this.camera);
  };

  Renderer.prototype.setCamera = function setCamera() {
    this.camera.left = -window.innerWidth / 2;
    this.camera.right = window.innerWidth / 2;
    this.camera.top = window.innerHeight / 2;
    this.camera.bottom = -window.innerHeight / 2;
    this.camera.near = -10;
    this.camera.far = 10;
    this.camera.frustumCulled = false;
    this.camera.updateProjectionMatrix();
  };

  Renderer.prototype.initRenderer = function initRenderer(renderElem) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    //preserveDrawingBuffer: false,
    if (renderElem) {
      this.renderer.domElement = renderElem;
    } else {
      document.body.appendChild(this.renderer.domElement);
    }
    this.setRenderer();
  };

  Renderer.prototype.setRenderer = function setRenderer() {
    this.renderer.setClearColor(0x000000, 1.0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  //render to image elem


  Renderer.prototype.renderToImageElem = function renderToImageElem(elem) {
    this.renderer.render(this.scene, this.camera);
    this.appendImageToDom(elem);
    this.clearScene();
  };

  //allows drawing of the image once adding this image to DOM elem


  Renderer.prototype.appendImageToDom = function appendImageToDom(elem) {
    document.querySelector(elem).setAttribute('src', this.renderer.domElement.toDataURL());
  };

  //Download the canvas as a png image


  Renderer.prototype.downloadImage = function downloadImage() {
    var link = document.querySelector('#download-image');
    link.href = this.renderer.domElement.toDataURL();
    link.download = 'hyperbolic-tiling.png';
  };

  //convert the canvas to a base64URL and send to saveImage.php


  Renderer.prototype.saveImage = function saveImage() {
    var data = this.renderer.domElement.toDataURL();
    var xhttp = new XMLHttpRequest();
    xhttp.open('POST', 'saveImage.php', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('img=' + data);
  };

  Renderer.prototype.addBoundingBoxHelper = function addBoundingBoxHelper(mesh) {
    var box = new THREE.BoxHelper(mesh);
    //box.update();
    this.scene.add(box);
  };

  //include https://github.com/mrdoob/stats.js/blob/master/build/stats.min.js


  Renderer.prototype.showStats = function showStats() {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  };

  Renderer.prototype.render = function render() {
    var _this2 = this;

    window.requestAnimationFrame(function () {
      return _this2.render();
    });
    if (this.stats) this.stats.update();
    this.postRenderer.render();
  };

  return Renderer;
}();

// * ***********************************************************************
// *
// *  LAYOUT CONTROLLER CLASS
// *
// *  controls position/loading/hiding etc.
// *************************************************************************
var LayoutController = function () {
  function LayoutController() {
    babelHelpers.classCallCheck(this, LayoutController);

    this.setupLayout();
  }

  LayoutController.prototype.setupLayout = function setupLayout() {};

  LayoutController.prototype.onResize = function onResize() {};

  LayoutController.prototype.bottomPanel = function bottomPanel() {};

  LayoutController.prototype.hideElements = function hideElements() {
    for (var _len = arguments.length, elements = Array(_len), _key = 0; _key < _len; _key++) {
      elements[_key] = arguments[_key];
    }

    for (var _iterator = elements, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var element = _ref;

      document.querySelector(element).classList.add('hide');
    }
  };

  LayoutController.prototype.showElements = function showElements() {
    for (var _len2 = arguments.length, elements = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      elements[_key2] = arguments[_key2];
    }

    for (var _iterator2 = elements, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var element = _ref2;

      document.querySelector(element).classList.remove('hide');
    }
  };

  return LayoutController;
}();

var randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

//The following three functions convert values from percentages starting at
//(0,0) bottom left to (100,100) top right screen coords
var xPercent = window.innerWidth / 100;
var yPercent = window.innerHeight / 100;
//Lengths are calculated from a percentage of screen width
//or height depending on which is smaller. This means that
//objects assigned a length of 100 (or circles radius 50)
//will never be drawn off screen
var length = function (len) {
  return xPercent < yPercent ? len * xPercent : len * yPercent;
};

// * ***********************************************************************
// *
// *  OBJECTS SUPERCLASS
// *
// *************************************************************************

var Objects = function () {
  function Objects(spec) {
    babelHelpers.classCallCheck(this, Objects);

    spec.color = spec.color || 0xffffff;
    this.spec = spec;
  }

  Objects.prototype.createMesh = function createMesh(geometry, material) {
    var mesh = new THREE.Mesh(geometry, material);
    //mesh.position.z = 2;
    return mesh;
  };

  return Objects;
}();

// * ***********************************************************************
// *
// *  SEGMENT CLASS
// *
// *************************************************************************
// spec = {
//   outerRadius,
//   innerRadius,
//   innerWidth, //in radians
//   outerWidth
//   offset, //in radians
//   material,
//   color,
// }


var Segment = function (_Objects) {
  babelHelpers.inherits(Segment, _Objects);

  function Segment(spec) {
    var _ret;

    babelHelpers.classCallCheck(this, Segment);

    var _this = babelHelpers.possibleConstructorReturn(this, _Objects.call(this, spec));

    _this.setup();
    return _ret = _this.createMesh(_this.geometry, new THREE.MeshBasicMaterial({ color: _this.spec.color })), babelHelpers.possibleConstructorReturn(_this, _ret);
  }

  Segment.prototype.setup = function setup() {
    this.spec.outerRadius = length(this.spec.outerRadius);
    this.spec.innerRadius = length(this.spec.innerRadius);
    this.buildShape();
    this.buildGeometry();
  };

  Segment.prototype.buildShape = function buildShape() {
    var endAngle = this.spec.offset + this.spec.innerWidth;
    var x1 = Math.cos(this.spec.offset) * this.spec.innerRadius;
    var y1 = Math.sin(this.spec.offset) * this.spec.innerRadius;
    var x2 = Math.cos(this.spec.offset) * this.spec.outerRadius;
    var y2 = Math.sin(this.spec.offset) * this.spec.outerRadius;
    var x3 = Math.cos(endAngle) * this.spec.innerRadius;
    var y3 = Math.sin(endAngle) * this.spec.innerRadius;

    this.shape = new THREE.Shape();
    this.shape.moveTo(x1, y1);
    this.shape.lineTo(x2, y2);
    this.shape.absarc(0, 0, //centre
    this.spec.outerRadius, //radius
    this.spec.offset, //startAngle
    this.spec.offset + this.spec.outerWidth, //endAngle
    true //clockwise
    );
    this.shape.lineTo(x3, y3);

    //this arc is going in the opposite direction so start/endAngle swapped
    this.shape.absarc(0, 0, //centre
    this.spec.innerRadius, //radius
    endAngle, this.spec.offset, true //clockwisecd /v ww  h
    );
  };

  Segment.prototype.buildGeometry = function buildGeometry() {
    this.geometry = new THREE.ShapeGeometry(this.shape);
  };

  return Segment;
}(Objects);

// * ***********************************************************************
// *
// *  DISK CLASS
// *
// *************************************************************************
// spec = {
//   radius,
//   color,
//   x,
//   y
// }
var Disk = function (_Objects2) {
  babelHelpers.inherits(Disk, _Objects2);

  function Disk(spec) {
    var _ret2;

    babelHelpers.classCallCheck(this, Disk);

    var _this2 = babelHelpers.possibleConstructorReturn(this, _Objects2.call(this, spec));

    _this2.spec.radius = length(_this2.spec.radius);
    var geometry = new THREE.CircleGeometry(_this2.spec.radius, 100, 0, 2 * Math.PI);
    var material = _this2.createMeshMaterial(_this2.spec.color);
    return _ret2 = _this2.createMesh(_this2.spec.x, _this2.spec.y, geometry, material), babelHelpers.possibleConstructorReturn(_this2, _ret2);
  }

  return Disk;
}(Objects);
// * ***********************************************************************
// *
// *  ARC CLASS
// *
// *************************************************************************
var Arc = function (_Objects3) {
  babelHelpers.inherits(Arc, _Objects3);

  function Arc(spec) {
    var _ret3;

    babelHelpers.classCallCheck(this, Arc);

    var _this3 = babelHelpers.possibleConstructorReturn(this, _Objects3.call(this, spec));

    _this3.spec.rotation = _this3.spec.rotation || 0;
    _this3.spec.clockwise = _this3.spec.rotation || false;
    _this3.spec.points = _this3.spec.points || 50;

    var material = _this3.createLineMaterial(_this3.spec.color);
    var curve = new THREE.EllipseCurve(_this3.spec.x, _this3.spec.y, _this3.spec.xRadius, _this3.spec.yRadius, _this3.spec.startAngle, _this3.spec.endAngle, _this3.spec.clockwise, _this3.spec.rotation);

    var path = new THREE.Path(curve.getPoints(spec.points));
    var geometry = path.createPointsGeometry(spec.points);
    return _ret3 = new THREE.Line(geometry, material), babelHelpers.possibleConstructorReturn(_this3, _ret3);
  }

  return Arc;
}(Objects);

var createBackground = require('three-vignette-background');
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
var Drawing = function () {
  function Drawing(renderer) {
    babelHelpers.classCallCheck(this, Drawing);

    this.renderer = renderer;
    this.init();
    this.resize();
  }

  Drawing.prototype.init = function init() {
    this.addBackground();
    //this.test();
  };

  Drawing.prototype.resize = function resize() {
    var _this = this;

    window.addEventListener('resize', function () {
      _this.init();
    }, false);
  };

  Drawing.prototype.addBackground = function addBackground() {
    var body = document.querySelector('body');
    var background = createBackground({
      geometry: new THREE.PlaneGeometry(2, 2, 1),
      colors: ['#fff', '#283844'],
      aspect: 1,
      grainScale: 0.001,
      grainTime: 0,
      noiseAlpha: 0.4,
      smooth: [1, 0.999],
      scale: [1, 1],
      offset: [1, 1],
      aspectCorrection: false
    });

    body.addEventListener('mousemove', function (e) {
      var offsetX = e.pageX === 0 ? 0 : e.pageX / window.innerWidth;
      var offsetY = e.pageY === 0 ? 0.999 : 1 - e.pageY / window.innerHeight;

      //make the line well defined when moving the mouse off the top of the screen
      offsetY = offsetY > 0.97 ? 0.999 : offsetY;
      console.log(offsetY);
      background.style({
        offset: [offsetX, offsetY],
        smooth: [1, offsetY],
        //  grainScale: (offsetY === 0.999) ? 1 : 0.001,
        noiseAlpha: offsetX > 0.4 ? offsetX : 0.4
      });
    });

    this.renderer.add(background);
  };

  Drawing.prototype.test = function test() {
    var mouseoverCallback = function (elem) {
      elem.intersect.object.material.color = new THREE.Color(randomInt(0x612f60, 0xffffff));
      elem.intersect.object.material.needsUpdate = true;
    };

    var clickCallback = function (elem) {
      console.log('click!');
    };

    for (var i = 0; i < 12; i++) {
      var testSegment = new Segment({
        outerRadius: 40,
        innerRadius: 25,
        innerWidth: Math.PI / 6, //in radians
        outerWidth: Math.PI / 6.2, //in radians
        offset: i * Math.PI / 6, //in radians
        color: randomInt(0x612f60, 0xffffff)
      });
      this.renderer.add(testSegment);

      this.renderer.domEvents.addEventListener(testSegment, 'mouseover', mouseoverCallback, false);

      this.renderer.domEvents.addEventListener(testSegment, 'click', clickCallback, false);
    }
  };

  return Drawing;
}();

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
var CentreCircle = function () {
  function CentreCircle() {
    babelHelpers.classCallCheck(this, CentreCircle);

    this.elem = document.querySelector('#centreCircle');
    this.layout();
  }

  CentreCircle.prototype.layout = function layout() {
    this.elem.style.width = length(50) + 'px';
    this.elem.style.height = length(50) + 'px';
  };

  return CentreCircle;
}();

// * ***********************************************************************
// *
// *  CENTRECIRCLECONTENTS CLASS
// *
// *  This controls the centre circle contents
// *
// *************************************************************************
var CentreCircleContents = function () {
  function CentreCircleContents() {
    babelHelpers.classCallCheck(this, CentreCircleContents);

    this.elem = document.querySelector('#centreCircleContents');
  }

  CentreCircleContents.prototype.switchContents = function switchContents(newContentsFile) {
    var _this = this;

    //don't load the same contents twice
    if (this.currentContentsFile === newContentsFile) return;

    this.currentContentsFile = newContentsFile;
    // url (required), options (optional)
    fetch(newContentsFile, {
      method: 'get'
    }).then(function (response) {
      return response.text();
    }).then(function (html) {
      _this.elem.innerHTML = html;
    }).catch(function (err) {
      console.error('Failed to load ' + newContentsFile);
    });
  };

  return CentreCircleContents;
}();

// * ***********************************************************************
// *
// *  CONTROLLER CLASS
// *
// *************************************************************************
var Controller = function () {
  function Controller() {
    babelHelpers.classCallCheck(this, Controller);

    this.layout = new LayoutController();
    this.renderer = new Renderer();
    this.centreCircle = new CentreCircle();
    this.CentreCircleContents = new CentreCircleContents();
    this.drawing = new Drawing(this.renderer);
    this.init();
  }

  Controller.prototype.init = function init() {
    this.renderer.render();

    //This will use GSAP rAF instead of THREE.js
    //also remove request animation frame from render function!
    //TweenMax.ticker.addEventListener('tick', () => this.renderer.render());

    this.CentreCircleContents.switchContents('./html_components/centre_circle/test.html');
  };

  //to use this add buttons with the classes below


  Controller.prototype.saveImageButtons = function saveImageButtons() {
    var _this = this;

    document.querySelector('#save-image').onclick = function () {
      return _this.render.saveImage();
    };
    document.querySelector('#download-image').onclick = function () {
      return _this.render.downloadImage();
    };
  };

  return Controller;
}();

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

var controller = void 0;
window.onload = function () {
  controller = new Controller();
};

window.onresize = function () {
  //controller.onResize();
};
},{"three-vignette-background":2}],2:[function(require,module,exports){

var vert = "#define GLSLIFY 1\nattribute vec3 position;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nvarying vec2 vUv;\nvoid main() {\n  gl_Position = vec4(position, 1.0);\n  vUv = vec2(position.x, position.y) * 0.5 + 0.5;\n}"
var frag = "precision mediump float;\n#define GLSLIFY 1\n//\n// GLSL textureless classic 3D noise \"cnoise\",\n// with an RSL-style periodic variant \"pnoise\".\n// Author:  Stefan Gustavson (stefan.gustavson@liu.se)\n// Version: 2011-10-11\n//\n// Many thanks to Ian McEwan of Ashima Arts for the\n// ideas for permutation and gradient selection.\n//\n// Copyright (c) 2011 Stefan Gustavson. All rights reserved.\n// Distributed under the MIT license. See LICENSE file.\n// https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_1604150559(vec3 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_1604150559(vec4 x)\n{\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_1604150559(vec4 x)\n{\n  return mod289_1604150559(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_1604150559(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec3 fade_1604150559(vec3 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise, periodic variant\nfloat pnoise_1604150559(vec3 P, vec3 rep)\n{\n  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n  Pi0 = mod289_1604150559(Pi0);\n  Pi1 = mod289_1604150559(Pi1);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute_1604150559(permute_1604150559(ix) + iy);\n  vec4 ixy0 = permute_1604150559(ixy + iz0);\n  vec4 ixy1 = permute_1604150559(ixy + iz1);\n\n  vec4 gx0 = ixy0 * (1.0 / 7.0);\n  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 * (1.0 / 7.0);\n  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt_1604150559(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt_1604150559(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade_1604150559(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_1117569599(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_1117569599(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_1117569599(vec4 x) {\n     return mod289_1117569599(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_1117569599(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_1117569599(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_1117569599 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_1117569599 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_1117569599;\n  vec3 i1 = min( g_1117569599.xyz, l.zxy );\n  vec3 i2 = max( g_1117569599.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_1117569599.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_1117569599(i);\n  vec4 p = permute_1117569599( permute_1117569599( permute_1117569599(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_1117569599.wyz - D_1117569599.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_1117569599 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_1117569599 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_1117569599.xy,h.z);\n  vec3 p3 = vec3(a1_1117569599.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_1117569599(vec4(dot(p0_1117569599,p0_1117569599), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_1117569599 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_1117569599,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\nfloat grain_2281831123(vec2 texCoord, vec2 resolution, float frame, float multiplier) {\n    vec2 mult = texCoord * resolution;\n    float offset = snoise_1117569599(vec3(mult / multiplier, frame));\n    float n1 = pnoise_1604150559(vec3(mult, offset), vec3(1.0/texCoord * resolution, 1.0));\n    return n1 / 2.0 + 0.5;\n}\n\nfloat grain_2281831123(vec2 texCoord, vec2 resolution, float frame) {\n    return grain_2281831123(texCoord, resolution, frame, 2.5);\n}\n\nfloat grain_2281831123(vec2 texCoord, vec2 resolution) {\n    return grain_2281831123(texCoord, resolution, 0.0);\n}\n\nvec3 blendSoftLight_1540259130(vec3 base, vec3 blend) {\n    return mix(\n        sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend), \n        2.0 * base * blend + base * base * (1.0 - 2.0 * blend), \n        step(base, vec3(0.5))\n    );\n}\n\n// Using conditionals\n// vec3 blendSoftLight(vec3 base, vec3 blend) {\n//     return vec3(\n//         ((blend.r < 0.5) ? (2.0 * base.r * blend.r + base.r * base.r * (1.0 - 2.0 * blend.r)) : (sqrt(base.r) * (2.0 * blend.r - 1.0) + 2.0 * base.r * (1.0 - blend.r))),\n//         ((blend.g < 0.5) ? (2.0 * base.g * blend.g + base.g * base.g * (1.0 - 2.0 * blend.g)) : (sqrt(base.g) * (2.0 * blend.g - 1.0) + 2.0 * base.g * (1.0 - blend.g))),\n//         ((blend.b < 0.5) ? (2.0 * base.b * blend.b + base.b * base.b * (1.0 - 2.0 * blend.b)) : (sqrt(base.b) * (2.0 * blend.b - 1.0) + 2.0 * base.b * (1.0 - blend.b)))\n//     );\n// }\n\nuniform vec3 color1;\nuniform vec3 color2;\nuniform float aspect;\nuniform vec2 offset;\nuniform vec2 scale;\nuniform float noiseAlpha;\nuniform bool aspectCorrection;\nuniform float grainScale;\nuniform float grainTime;\nuniform vec2 smooth;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vec2 q = vec2(vUv - 0.5);\n  if (aspectCorrection) {\n    q.x *= aspect;\n  }\n  q /= scale;\n  q -= offset;\n  float dst = length(q);\n  dst = smoothstep(smooth.x, smooth.y, dst);\n  vec3 color = mix(color1, color2, dst);\n  \n  if (noiseAlpha > 0.0 && grainScale > 0.0) {\n    float gSize = 1.0 / grainScale;\n    float g = grain_2281831123(vUv, vec2(gSize * aspect, gSize), grainTime);\n    vec3 noiseColor = blendSoftLight_1540259130(color, vec3(g));\n    gl_FragColor.rgb = mix(color, noiseColor, noiseAlpha);\n  } else {\n    gl_FragColor.rgb = color;\n  }\n  gl_FragColor.a = 1.0;\n}"

module.exports = createBackground
function createBackground (opt) {
  opt = opt || {}
  var geometry = opt.geometry || new THREE.PlaneGeometry(2, 2, 1)
  var material = new THREE.RawShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    side: THREE.DoubleSide,
    uniforms: {
      aspectCorrection: { type: 'i', value: false },
      aspect: { type: 'f', value: 1 },
      grainScale: { type: 'f', value: 0.005 },
      grainTime: { type: 'f', value: 0 },
      noiseAlpha: { type: 'f', value: 0.25 },
      offset: { type: 'v2', value: new THREE.Vector2(0, 0) },
      scale: { type: 'v2', value: new THREE.Vector2(1, 1) },
      smooth: { type: 'v2', value: new THREE.Vector2(0.0, 1.0) },
      color1: { type: 'c', value: new THREE.Color('#fff') },
      color2: { type: 'c', value: new THREE.Color('#283844') }
    },
    depthTest: false
  })
  var mesh = new THREE.Mesh(geometry, material)
  mesh.style = style
  if (opt) mesh.style(opt)
  return mesh

  function style (opt) {
    opt = opt || {}
    if (Array.isArray(opt.colors)) {
      var colors = opt.colors.map(function (c) {
        if (typeof c === 'string' || typeof c === 'number') {
          return new THREE.Color(c)
        }
        return c
      })
      material.uniforms.color1.value.copy(colors[0])
      material.uniforms.color2.value.copy(colors[1])
    }
    if (typeof opt.aspect === 'number') {
      material.uniforms.aspect.value = opt.aspect
    }
    if (typeof opt.grainScale === 'number') {
      material.uniforms.grainScale.value = opt.grainScale
    }
    if (typeof opt.grainTime === 'number') {
      material.uniforms.grainTime.value = opt.grainTime
    }
    if (opt.smooth) {
      var smooth = fromArray(opt.smooth, THREE.Vector2)
      material.uniforms.smooth.value.copy(smooth)
    }
    if (opt.offset) {
      var offset = fromArray(opt.offset, THREE.Vector2)
      material.uniforms.offset.value.copy(offset)
    }
    if (typeof opt.noiseAlpha === 'number') {
      material.uniforms.noiseAlpha.value = opt.noiseAlpha
    }
    if (typeof opt.scale !== 'undefined') {
      var scale = opt.scale
      if (typeof scale === 'number') {
        scale = [ scale, scale ]
      }
      scale = fromArray(scale, THREE.Vector2)
      material.uniforms.scale.value.copy(scale)
    }
    if (typeof opt.aspectCorrection !== 'undefined') {
      material.uniforms.aspectCorrection.value = Boolean(opt.aspectCorrection)
    }
  }

  function fromArray (array, VectorType) {
    if (Array.isArray(array)) {
      return new VectorType().fromArray(array)
    }
    return array
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlczIwMTUvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy90aHJlZS12aWduZXR0ZS1iYWNrZ3JvdW5kL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4c0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBiYWJlbEhlbHBlcnMgPSB7fTtcblxuYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmJhYmVsSGVscGVycy5pbmhlcml0cyA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn07XG5cbmJhYmVsSGVscGVycy5wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59O1xuXG5iYWJlbEhlbHBlcnM7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIFBPU1RQUk9DRVNTSU5HIENMQVNTXG4vLyAqXG4vLyAqICBQb3N0IGVmZmVjdHMgZm9yIFRIUkVFLmpzXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbnZhciBQb3N0cHJvY2Vzc2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUG9zdHByb2Nlc3NpbmcocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgUG9zdHByb2Nlc3NpbmcpO1xuXG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcbiAgICB0aGlzLmNhbWVyYSA9IGNhbWVyYTtcbiAgICBpZiAoIURldGVjdG9yLndlYmdsKSBEZXRlY3Rvci5hZGRHZXRXZWJHTE1lc3NhZ2UoKTtcblxuICAgIHZhciByZW5kZXJQYXNzID0gbmV3IFRIUkVFLlJlbmRlclBhc3Moc2NlbmUsIGNhbWVyYSk7XG4gICAgdmFyIGNvcHlQYXNzID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoVEhSRUUuQ29weVNoYWRlcik7XG4gICAgY29weVBhc3MucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXG4gICAgdGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlcihyZW5kZXJlcik7XG4gICAgdGhpcy5jb21wb3Nlci5hZGRQYXNzKHJlbmRlclBhc3MpO1xuXG4gICAgdGhpcy5lZmZlY3RzKCk7XG5cbiAgICB0aGlzLmNvbXBvc2VyLmFkZFBhc3MoY29weVBhc3MpO1xuXG4gICAgLy90aGlzLmFudGlhbGlhcygpO1xuICAgIHJldHVybiB0aGlzLmNvbXBvc2VyO1xuICB9XG5cbiAgUG9zdHByb2Nlc3NpbmcucHJvdG90eXBlLmFudGlhbGlhcyA9IGZ1bmN0aW9uIGFudGlhbGlhcygpIHtcbiAgICB2YXIgbXNhYVJlbmRlclBhc3MgPSBuZXcgVEhSRUUuTWFudWFsTVNBQVJlbmRlclBhc3ModGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIG1zYWFSZW5kZXJQYXNzLnNhbXBsZUxldmVsID0gNDtcbiAgICAvL21zYWFSZW5kZXJQYXNzLnVuYmlhc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmNvbXBvc2VyLmFkZFBhc3MobXNhYVJlbmRlclBhc3MpO1xuICB9O1xuXG4gIFBvc3Rwcm9jZXNzaW5nLnByb3RvdHlwZS5lZmZlY3RzID0gZnVuY3Rpb24gZWZmZWN0cygpIHtcbiAgICB2YXIgdGVzdFBhc3MgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyhUSFJFRS5Db2xvcmlmeVNoYWRlcik7XG4gICAgdGVzdFBhc3MudW5pZm9ybXNbXCJjb2xvclwiXS52YWx1ZSA9IG5ldyBUSFJFRS5Db2xvcigweGZmMDAwMCk7XG4gICAgLy90aGlzLmNvbXBvc2VyLmFkZFBhc3ModGVzdFBhc3MpO1xuICB9O1xuXG4gIHJldHVybiBQb3N0cHJvY2Vzc2luZztcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgUkVOREVSRVIgQ0xBU1Ncbi8vICpcbi8vICogIENvbnRyb2xsZXIgZm9yIFRIUkVFLmpzXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cblxudmFyIFJlbmRlcmVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBSZW5kZXJlcihyZW5kZXJFbGVtKSB7XG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIFJlbmRlcmVyKTtcblxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICB0aGlzLmluaXRDYW1lcmEoKTtcbiAgICB0aGlzLmluaXRSZW5kZXJlcihyZW5kZXJFbGVtKTtcbiAgICB0aGlzLnBvc3RSZW5kZXJlciA9IG5ldyBQb3N0cHJvY2Vzc2luZyh0aGlzLnJlbmRlcmVyLCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG5cbiAgICB0aGlzLnNob3dTdGF0cygpO1xuICAgIHRoaXMucmVzaXplKCk7XG4gICAgdGhpcy5zZXR1cERPTUV2ZW50cygpO1xuICB9XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChtZXNoKSB7XG4gICAgdGhpcy5zY2VuZS5hZGQobWVzaCk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5jbGVhclNjZW5lKCk7XG4gICAgdGhpcy5wYXR0ZXJuID0gbnVsbDsgLy9yZXNldCBtYXRlcmlhbHM7XG4gICAgdGhpcy5zZXRDYW1lcmEoKTtcbiAgICB0aGlzLnNldFJlbmRlcmVyKCk7XG4gIH07XG5cbiAgLy9odHRwczovL2dpdGh1Yi5jb20vamVyb21lZXRpZW5uZS90aHJlZXguZG9tZXZlbnRzXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2V0dXBET01FdmVudHMgPSBmdW5jdGlvbiBzZXR1cERPTUV2ZW50cygpIHtcbiAgICB0aGlzLmRvbUV2ZW50cyA9IG5ldyBUSFJFRXguRG9tRXZlbnRzKHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICB9O1xuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5jbGVhclNjZW5lKCk7XG4gICAgICBfdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgLy90aGlzLmNhbWVyYS5hc3BlY3RcdD0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICBfdGhpcy5zZXRDYW1lcmEoKTtcbiAgICAgIC8vdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH0sIGZhbHNlKTtcbiAgfTtcblxuICAvL2NsZWFyIGFsbCBtZXNoZXMgZnJvbSB0aGUgc2NlbmUsIGJ1dCBwcmVzZXJ2ZSBjYW1lcmEvcmVuZGVyZXJcblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5jbGVhclNjZW5lID0gZnVuY3Rpb24gY2xlYXJTY2VuZSgpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5zY2VuZS5jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIG9iamVjdCA9IHRoaXMuc2NlbmUuY2hpbGRyZW5baV07XG4gICAgICBpZiAob2JqZWN0LnR5cGUgPT09ICdNZXNoJykge1xuICAgICAgICBvYmplY3QuZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgICAgICBvYmplY3QubWF0ZXJpYWwuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLnNjZW5lLnJlbW92ZShvYmplY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuaW5pdENhbWVyYSA9IGZ1bmN0aW9uIGluaXRDYW1lcmEoKSB7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKCk7XG4gICAgdGhpcy5zZXRDYW1lcmEoKTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmNhbWVyYSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnNldENhbWVyYSA9IGZ1bmN0aW9uIHNldENhbWVyYSgpIHtcbiAgICB0aGlzLmNhbWVyYS5sZWZ0ID0gLXdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICB0aGlzLmNhbWVyYS5yaWdodCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICB0aGlzLmNhbWVyYS50b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuICAgIHRoaXMuY2FtZXJhLmJvdHRvbSA9IC13aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuICAgIHRoaXMuY2FtZXJhLm5lYXIgPSAtMTA7XG4gICAgdGhpcy5jYW1lcmEuZmFyID0gMTA7XG4gICAgdGhpcy5jYW1lcmEuZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuaW5pdFJlbmRlcmVyID0gZnVuY3Rpb24gaW5pdFJlbmRlcmVyKHJlbmRlckVsZW0pIHtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuICAgICAgYW50aWFsaWFzOiB0cnVlXG4gICAgfSk7XG4gICAgLy9wcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICAgIGlmIChyZW5kZXJFbGVtKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQgPSByZW5kZXJFbGVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgfVxuICAgIHRoaXMuc2V0UmVuZGVyZXIoKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2V0UmVuZGVyZXIgPSBmdW5jdGlvbiBzZXRSZW5kZXJlcigpIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDEuMCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICB9O1xuXG4gIC8vcmVuZGVyIHRvIGltYWdlIGVsZW1cblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJUb0ltYWdlRWxlbSA9IGZ1bmN0aW9uIHJlbmRlclRvSW1hZ2VFbGVtKGVsZW0pIHtcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgdGhpcy5hcHBlbmRJbWFnZVRvRG9tKGVsZW0pO1xuICAgIHRoaXMuY2xlYXJTY2VuZSgpO1xuICB9O1xuXG4gIC8vYWxsb3dzIGRyYXdpbmcgb2YgdGhlIGltYWdlIG9uY2UgYWRkaW5nIHRoaXMgaW1hZ2UgdG8gRE9NIGVsZW1cblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5hcHBlbmRJbWFnZVRvRG9tID0gZnVuY3Rpb24gYXBwZW5kSW1hZ2VUb0RvbShlbGVtKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtKS5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKSk7XG4gIH07XG5cbiAgLy9Eb3dubG9hZCB0aGUgY2FudmFzIGFzIGEgcG5nIGltYWdlXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuZG93bmxvYWRJbWFnZSA9IGZ1bmN0aW9uIGRvd25sb2FkSW1hZ2UoKSB7XG4gICAgdmFyIGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZG93bmxvYWQtaW1hZ2UnKTtcbiAgICBsaW5rLmhyZWYgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG4gICAgbGluay5kb3dubG9hZCA9ICdoeXBlcmJvbGljLXRpbGluZy5wbmcnO1xuICB9O1xuXG4gIC8vY29udmVydCB0aGUgY2FudmFzIHRvIGEgYmFzZTY0VVJMIGFuZCBzZW5kIHRvIHNhdmVJbWFnZS5waHBcblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5zYXZlSW1hZ2UgPSBmdW5jdGlvbiBzYXZlSW1hZ2UoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG4gICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGh0dHAub3BlbignUE9TVCcsICdzYXZlSW1hZ2UucGhwJywgdHJ1ZSk7XG4gICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIHhodHRwLnNlbmQoJ2ltZz0nICsgZGF0YSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmFkZEJvdW5kaW5nQm94SGVscGVyID0gZnVuY3Rpb24gYWRkQm91bmRpbmdCb3hIZWxwZXIobWVzaCkge1xuICAgIHZhciBib3ggPSBuZXcgVEhSRUUuQm94SGVscGVyKG1lc2gpO1xuICAgIC8vYm94LnVwZGF0ZSgpO1xuICAgIHRoaXMuc2NlbmUuYWRkKGJveCk7XG4gIH07XG5cbiAgLy9pbmNsdWRlIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2Ivc3RhdHMuanMvYmxvYi9tYXN0ZXIvYnVpbGQvc3RhdHMubWluLmpzXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2hvd1N0YXRzID0gZnVuY3Rpb24gc2hvd1N0YXRzKCkge1xuICAgIHRoaXMuc3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgICB0aGlzLnN0YXRzLnNob3dQYW5lbCgwKTsgLy8gMDogZnBzLCAxOiBtcywgMjogbWIsIDMrOiBjdXN0b21cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuc3RhdHMuZG9tKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX3RoaXMyLnJlbmRlcigpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnN0YXRzKSB0aGlzLnN0YXRzLnVwZGF0ZSgpO1xuICAgIHRoaXMucG9zdFJlbmRlcmVyLnJlbmRlcigpO1xuICB9O1xuXG4gIHJldHVybiBSZW5kZXJlcjtcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgTEFZT1VUIENPTlRST0xMRVIgQ0xBU1Ncbi8vICpcbi8vICogIGNvbnRyb2xzIHBvc2l0aW9uL2xvYWRpbmcvaGlkaW5nIGV0Yy5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBMYXlvdXRDb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCkge1xuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBMYXlvdXRDb250cm9sbGVyKTtcblxuICAgIHRoaXMuc2V0dXBMYXlvdXQoKTtcbiAgfVxuXG4gIExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldHVwTGF5b3V0ID0gZnVuY3Rpb24gc2V0dXBMYXlvdXQoKSB7fTtcblxuICBMYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5vblJlc2l6ZSA9IGZ1bmN0aW9uIG9uUmVzaXplKCkge307XG5cbiAgTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuYm90dG9tUGFuZWwgPSBmdW5jdGlvbiBib3R0b21QYW5lbCgpIHt9O1xuXG4gIExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmhpZGVFbGVtZW50cyA9IGZ1bmN0aW9uIGhpZGVFbGVtZW50cygpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZWxlbWVudHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGVsZW1lbnRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGVsZW1lbnRzLCBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkoX2l0ZXJhdG9yKSwgX2kgPSAwLCBfaXRlcmF0b3IgPSBfaXNBcnJheSA/IF9pdGVyYXRvciA6IF9pdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdKCk7Oykge1xuICAgICAgdmFyIF9yZWY7XG5cbiAgICAgIGlmIChfaXNBcnJheSkge1xuICAgICAgICBpZiAoX2kgPj0gX2l0ZXJhdG9yLmxlbmd0aCkgYnJlYWs7XG4gICAgICAgIF9yZWYgPSBfaXRlcmF0b3JbX2krK107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfaSA9IF9pdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChfaS5kb25lKSBicmVhaztcbiAgICAgICAgX3JlZiA9IF9pLnZhbHVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgZWxlbWVudCA9IF9yZWY7XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgIH1cbiAgfTtcblxuICBMYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zaG93RWxlbWVudHMgPSBmdW5jdGlvbiBzaG93RWxlbWVudHMoKSB7XG4gICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBlbGVtZW50cyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICBlbGVtZW50c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgIH1cblxuICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBlbGVtZW50cywgX2lzQXJyYXkyID0gQXJyYXkuaXNBcnJheShfaXRlcmF0b3IyKSwgX2kyID0gMCwgX2l0ZXJhdG9yMiA9IF9pc0FycmF5MiA/IF9pdGVyYXRvcjIgOiBfaXRlcmF0b3IyW1N5bWJvbC5pdGVyYXRvcl0oKTs7KSB7XG4gICAgICB2YXIgX3JlZjI7XG5cbiAgICAgIGlmIChfaXNBcnJheTIpIHtcbiAgICAgICAgaWYgKF9pMiA+PSBfaXRlcmF0b3IyLmxlbmd0aCkgYnJlYWs7XG4gICAgICAgIF9yZWYyID0gX2l0ZXJhdG9yMltfaTIrK107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfaTIgPSBfaXRlcmF0b3IyLm5leHQoKTtcbiAgICAgICAgaWYgKF9pMi5kb25lKSBicmVhaztcbiAgICAgICAgX3JlZjIgPSBfaTIudmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBlbGVtZW50ID0gX3JlZjI7XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTGF5b3V0Q29udHJvbGxlcjtcbn0oKTtcblxudmFyIHJhbmRvbUludCA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcbn07XG5cbi8vVGhlIGZvbGxvd2luZyB0aHJlZSBmdW5jdGlvbnMgY29udmVydCB2YWx1ZXMgZnJvbSBwZXJjZW50YWdlcyBzdGFydGluZyBhdFxuLy8oMCwwKSBib3R0b20gbGVmdCB0byAoMTAwLDEwMCkgdG9wIHJpZ2h0IHNjcmVlbiBjb29yZHNcbnZhciB4UGVyY2VudCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMTAwO1xudmFyIHlQZXJjZW50ID0gd2luZG93LmlubmVySGVpZ2h0IC8gMTAwO1xuLy9MZW5ndGhzIGFyZSBjYWxjdWxhdGVkIGZyb20gYSBwZXJjZW50YWdlIG9mIHNjcmVlbiB3aWR0aFxuLy9vciBoZWlnaHQgZGVwZW5kaW5nIG9uIHdoaWNoIGlzIHNtYWxsZXIuIFRoaXMgbWVhbnMgdGhhdFxuLy9vYmplY3RzIGFzc2lnbmVkIGEgbGVuZ3RoIG9mIDEwMCAob3IgY2lyY2xlcyByYWRpdXMgNTApXG4vL3dpbGwgbmV2ZXIgYmUgZHJhd24gb2ZmIHNjcmVlblxudmFyIGxlbmd0aCA9IGZ1bmN0aW9uIChsZW4pIHtcbiAgcmV0dXJuIHhQZXJjZW50IDwgeVBlcmNlbnQgPyBsZW4gKiB4UGVyY2VudCA6IGxlbiAqIHlQZXJjZW50O1xufTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgT0JKRUNUUyBTVVBFUkNMQVNTXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbnZhciBPYmplY3RzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBPYmplY3RzKHNwZWMpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgT2JqZWN0cyk7XG5cbiAgICBzcGVjLmNvbG9yID0gc3BlYy5jb2xvciB8fCAweGZmZmZmZjtcbiAgICB0aGlzLnNwZWMgPSBzcGVjO1xuICB9XG5cbiAgT2JqZWN0cy5wcm90b3R5cGUuY3JlYXRlTWVzaCA9IGZ1bmN0aW9uIGNyZWF0ZU1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgIC8vbWVzaC5wb3NpdGlvbi56ID0gMjtcbiAgICByZXR1cm4gbWVzaDtcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0cztcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgU0VHTUVOVCBDTEFTU1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gc3BlYyA9IHtcbi8vICAgb3V0ZXJSYWRpdXMsXG4vLyAgIGlubmVyUmFkaXVzLFxuLy8gICBpbm5lcldpZHRoLCAvL2luIHJhZGlhbnNcbi8vICAgb3V0ZXJXaWR0aFxuLy8gICBvZmZzZXQsIC8vaW4gcmFkaWFuc1xuLy8gICBtYXRlcmlhbCxcbi8vICAgY29sb3IsXG4vLyB9XG5cblxudmFyIFNlZ21lbnQgPSBmdW5jdGlvbiAoX09iamVjdHMpIHtcbiAgYmFiZWxIZWxwZXJzLmluaGVyaXRzKFNlZ21lbnQsIF9PYmplY3RzKTtcblxuICBmdW5jdGlvbiBTZWdtZW50KHNwZWMpIHtcbiAgICB2YXIgX3JldDtcblxuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBTZWdtZW50KTtcblxuICAgIHZhciBfdGhpcyA9IGJhYmVsSGVscGVycy5wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9PYmplY3RzLmNhbGwodGhpcywgc3BlYykpO1xuXG4gICAgX3RoaXMuc2V0dXAoKTtcbiAgICByZXR1cm4gX3JldCA9IF90aGlzLmNyZWF0ZU1lc2goX3RoaXMuZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiBfdGhpcy5zcGVjLmNvbG9yIH0pKSwgYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMsIF9yZXQpO1xuICB9XG5cbiAgU2VnbWVudC5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICB0aGlzLnNwZWMub3V0ZXJSYWRpdXMgPSBsZW5ndGgodGhpcy5zcGVjLm91dGVyUmFkaXVzKTtcbiAgICB0aGlzLnNwZWMuaW5uZXJSYWRpdXMgPSBsZW5ndGgodGhpcy5zcGVjLmlubmVyUmFkaXVzKTtcbiAgICB0aGlzLmJ1aWxkU2hhcGUoKTtcbiAgICB0aGlzLmJ1aWxkR2VvbWV0cnkoKTtcbiAgfTtcblxuICBTZWdtZW50LnByb3RvdHlwZS5idWlsZFNoYXBlID0gZnVuY3Rpb24gYnVpbGRTaGFwZSgpIHtcbiAgICB2YXIgZW5kQW5nbGUgPSB0aGlzLnNwZWMub2Zmc2V0ICsgdGhpcy5zcGVjLmlubmVyV2lkdGg7XG4gICAgdmFyIHgxID0gTWF0aC5jb3ModGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMuaW5uZXJSYWRpdXM7XG4gICAgdmFyIHkxID0gTWF0aC5zaW4odGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMuaW5uZXJSYWRpdXM7XG4gICAgdmFyIHgyID0gTWF0aC5jb3ModGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMub3V0ZXJSYWRpdXM7XG4gICAgdmFyIHkyID0gTWF0aC5zaW4odGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMub3V0ZXJSYWRpdXM7XG4gICAgdmFyIHgzID0gTWF0aC5jb3MoZW5kQW5nbGUpICogdGhpcy5zcGVjLmlubmVyUmFkaXVzO1xuICAgIHZhciB5MyA9IE1hdGguc2luKGVuZEFuZ2xlKSAqIHRoaXMuc3BlYy5pbm5lclJhZGl1cztcblxuICAgIHRoaXMuc2hhcGUgPSBuZXcgVEhSRUUuU2hhcGUoKTtcbiAgICB0aGlzLnNoYXBlLm1vdmVUbyh4MSwgeTEpO1xuICAgIHRoaXMuc2hhcGUubGluZVRvKHgyLCB5Mik7XG4gICAgdGhpcy5zaGFwZS5hYnNhcmMoMCwgMCwgLy9jZW50cmVcbiAgICB0aGlzLnNwZWMub3V0ZXJSYWRpdXMsIC8vcmFkaXVzXG4gICAgdGhpcy5zcGVjLm9mZnNldCwgLy9zdGFydEFuZ2xlXG4gICAgdGhpcy5zcGVjLm9mZnNldCArIHRoaXMuc3BlYy5vdXRlcldpZHRoLCAvL2VuZEFuZ2xlXG4gICAgdHJ1ZSAvL2Nsb2Nrd2lzZVxuICAgICk7XG4gICAgdGhpcy5zaGFwZS5saW5lVG8oeDMsIHkzKTtcblxuICAgIC8vdGhpcyBhcmMgaXMgZ29pbmcgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbiBzbyBzdGFydC9lbmRBbmdsZSBzd2FwcGVkXG4gICAgdGhpcy5zaGFwZS5hYnNhcmMoMCwgMCwgLy9jZW50cmVcbiAgICB0aGlzLnNwZWMuaW5uZXJSYWRpdXMsIC8vcmFkaXVzXG4gICAgZW5kQW5nbGUsIHRoaXMuc3BlYy5vZmZzZXQsIHRydWUgLy9jbG9ja3dpc2VjZCAvdiB3dyAgaFxuICAgICk7XG4gIH07XG5cbiAgU2VnbWVudC5wcm90b3R5cGUuYnVpbGRHZW9tZXRyeSA9IGZ1bmN0aW9uIGJ1aWxkR2VvbWV0cnkoKSB7XG4gICAgdGhpcy5nZW9tZXRyeSA9IG5ldyBUSFJFRS5TaGFwZUdlb21ldHJ5KHRoaXMuc2hhcGUpO1xuICB9O1xuXG4gIHJldHVybiBTZWdtZW50O1xufShPYmplY3RzKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgRElTSyBDTEFTU1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gc3BlYyA9IHtcbi8vICAgcmFkaXVzLFxuLy8gICBjb2xvcixcbi8vICAgeCxcbi8vICAgeVxuLy8gfVxudmFyIERpc2sgPSBmdW5jdGlvbiAoX09iamVjdHMyKSB7XG4gIGJhYmVsSGVscGVycy5pbmhlcml0cyhEaXNrLCBfT2JqZWN0czIpO1xuXG4gIGZ1bmN0aW9uIERpc2soc3BlYykge1xuICAgIHZhciBfcmV0MjtcblxuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBEaXNrKTtcblxuICAgIHZhciBfdGhpczIgPSBiYWJlbEhlbHBlcnMucG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfT2JqZWN0czIuY2FsbCh0aGlzLCBzcGVjKSk7XG5cbiAgICBfdGhpczIuc3BlYy5yYWRpdXMgPSBsZW5ndGgoX3RoaXMyLnNwZWMucmFkaXVzKTtcbiAgICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkoX3RoaXMyLnNwZWMucmFkaXVzLCAxMDAsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICB2YXIgbWF0ZXJpYWwgPSBfdGhpczIuY3JlYXRlTWVzaE1hdGVyaWFsKF90aGlzMi5zcGVjLmNvbG9yKTtcbiAgICByZXR1cm4gX3JldDIgPSBfdGhpczIuY3JlYXRlTWVzaChfdGhpczIuc3BlYy54LCBfdGhpczIuc3BlYy55LCBnZW9tZXRyeSwgbWF0ZXJpYWwpLCBiYWJlbEhlbHBlcnMucG9zc2libGVDb25zdHJ1Y3RvclJldHVybihfdGhpczIsIF9yZXQyKTtcbiAgfVxuXG4gIHJldHVybiBEaXNrO1xufShPYmplY3RzKTtcbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIEFSQyBDTEFTU1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxudmFyIEFyYyA9IGZ1bmN0aW9uIChfT2JqZWN0czMpIHtcbiAgYmFiZWxIZWxwZXJzLmluaGVyaXRzKEFyYywgX09iamVjdHMzKTtcblxuICBmdW5jdGlvbiBBcmMoc3BlYykge1xuICAgIHZhciBfcmV0MztcblxuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBBcmMpO1xuXG4gICAgdmFyIF90aGlzMyA9IGJhYmVsSGVscGVycy5wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9PYmplY3RzMy5jYWxsKHRoaXMsIHNwZWMpKTtcblxuICAgIF90aGlzMy5zcGVjLnJvdGF0aW9uID0gX3RoaXMzLnNwZWMucm90YXRpb24gfHwgMDtcbiAgICBfdGhpczMuc3BlYy5jbG9ja3dpc2UgPSBfdGhpczMuc3BlYy5yb3RhdGlvbiB8fCBmYWxzZTtcbiAgICBfdGhpczMuc3BlYy5wb2ludHMgPSBfdGhpczMuc3BlYy5wb2ludHMgfHwgNTA7XG5cbiAgICB2YXIgbWF0ZXJpYWwgPSBfdGhpczMuY3JlYXRlTGluZU1hdGVyaWFsKF90aGlzMy5zcGVjLmNvbG9yKTtcbiAgICB2YXIgY3VydmUgPSBuZXcgVEhSRUUuRWxsaXBzZUN1cnZlKF90aGlzMy5zcGVjLngsIF90aGlzMy5zcGVjLnksIF90aGlzMy5zcGVjLnhSYWRpdXMsIF90aGlzMy5zcGVjLnlSYWRpdXMsIF90aGlzMy5zcGVjLnN0YXJ0QW5nbGUsIF90aGlzMy5zcGVjLmVuZEFuZ2xlLCBfdGhpczMuc3BlYy5jbG9ja3dpc2UsIF90aGlzMy5zcGVjLnJvdGF0aW9uKTtcblxuICAgIHZhciBwYXRoID0gbmV3IFRIUkVFLlBhdGgoY3VydmUuZ2V0UG9pbnRzKHNwZWMucG9pbnRzKSk7XG4gICAgdmFyIGdlb21ldHJ5ID0gcGF0aC5jcmVhdGVQb2ludHNHZW9tZXRyeShzcGVjLnBvaW50cyk7XG4gICAgcmV0dXJuIF9yZXQzID0gbmV3IFRIUkVFLkxpbmUoZ2VvbWV0cnksIG1hdGVyaWFsKSwgYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMzLCBfcmV0Myk7XG4gIH1cblxuICByZXR1cm4gQXJjO1xufShPYmplY3RzKTtcblxudmFyIGNyZWF0ZUJhY2tncm91bmQgPSByZXF1aXJlKCd0aHJlZS12aWduZXR0ZS1iYWNrZ3JvdW5kJyk7XG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBEUkFXSU5HIENMQVNTXG4vLyAqXG4vLyAqICBIZXJlIHdlIHdpbGwgY3JlYXRlIHNvbWUgcHJldHR5IHRoaW5ncy5cbi8vICogIE5vdGUgdGhhdCBhbGwgb2JqZWN0cyBpbXBvcnRlZCBmcm9tIG9iamVjdHMuanMgd2lsbFxuLy8gKiAgaGF2ZSBzcGVjIGF0dHJpYnV0ZXMgY29udmVydGVkIHRvIHNjcmVlbiBwZXJjZW50YWdlXG4vLyAqICBwb3NpdGlvbnMvbGVuZ3RocyBnb2luZyBmcm9tICgwLDApIGJvdHRvbSBsZWZ0IHRvXG4vLyAqICAoMTAwLDEwMCkgdG9wIHJpZ2h0XG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG52YXIgRHJhd2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRHJhd2luZyhyZW5kZXJlcikge1xuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBEcmF3aW5nKTtcblxuICAgIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICB0aGlzLmluaXQoKTtcbiAgICB0aGlzLnJlc2l6ZSgpO1xuICB9XG5cbiAgRHJhd2luZy5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5hZGRCYWNrZ3JvdW5kKCk7XG4gICAgLy90aGlzLnRlc3QoKTtcbiAgfTtcblxuICBEcmF3aW5nLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5pbml0KCk7XG4gICAgfSwgZmFsc2UpO1xuICB9O1xuXG4gIERyYXdpbmcucHJvdG90eXBlLmFkZEJhY2tncm91bmQgPSBmdW5jdGlvbiBhZGRCYWNrZ3JvdW5kKCkge1xuICAgIHZhciBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICAgIHZhciBiYWNrZ3JvdW5kID0gY3JlYXRlQmFja2dyb3VuZCh7XG4gICAgICBnZW9tZXRyeTogbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMiwgMiwgMSksXG4gICAgICBjb2xvcnM6IFsnI2ZmZicsICcjMjgzODQ0J10sXG4gICAgICBhc3BlY3Q6IDEsXG4gICAgICBncmFpblNjYWxlOiAwLjAwMSxcbiAgICAgIGdyYWluVGltZTogMCxcbiAgICAgIG5vaXNlQWxwaGE6IDAuNCxcbiAgICAgIHNtb290aDogWzEsIDAuOTk5XSxcbiAgICAgIHNjYWxlOiBbMSwgMV0sXG4gICAgICBvZmZzZXQ6IFsxLCAxXSxcbiAgICAgIGFzcGVjdENvcnJlY3Rpb246IGZhbHNlXG4gICAgfSk7XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgb2Zmc2V0WCA9IGUucGFnZVggPT09IDAgPyAwIDogZS5wYWdlWCAvIHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgdmFyIG9mZnNldFkgPSBlLnBhZ2VZID09PSAwID8gMC45OTkgOiAxIC0gZS5wYWdlWSAvIHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgICAgLy9tYWtlIHRoZSBsaW5lIHdlbGwgZGVmaW5lZCB3aGVuIG1vdmluZyB0aGUgbW91c2Ugb2ZmIHRoZSB0b3Agb2YgdGhlIHNjcmVlblxuICAgICAgb2Zmc2V0WSA9IG9mZnNldFkgPiAwLjk3ID8gMC45OTkgOiBvZmZzZXRZO1xuICAgICAgY29uc29sZS5sb2cob2Zmc2V0WSk7XG4gICAgICBiYWNrZ3JvdW5kLnN0eWxlKHtcbiAgICAgICAgb2Zmc2V0OiBbb2Zmc2V0WCwgb2Zmc2V0WV0sXG4gICAgICAgIHNtb290aDogWzEsIG9mZnNldFldLFxuICAgICAgICAvLyAgZ3JhaW5TY2FsZTogKG9mZnNldFkgPT09IDAuOTk5KSA/IDEgOiAwLjAwMSxcbiAgICAgICAgbm9pc2VBbHBoYTogb2Zmc2V0WCA+IDAuNCA/IG9mZnNldFggOiAwLjRcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJlci5hZGQoYmFja2dyb3VuZCk7XG4gIH07XG5cbiAgRHJhd2luZy5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uIHRlc3QoKSB7XG4gICAgdmFyIG1vdXNlb3ZlckNhbGxiYWNrID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIGVsZW0uaW50ZXJzZWN0Lm9iamVjdC5tYXRlcmlhbC5jb2xvciA9IG5ldyBUSFJFRS5Db2xvcihyYW5kb21JbnQoMHg2MTJmNjAsIDB4ZmZmZmZmKSk7XG4gICAgICBlbGVtLmludGVyc2VjdC5vYmplY3QubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH07XG5cbiAgICB2YXIgY2xpY2tDYWxsYmFjayA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICBjb25zb2xlLmxvZygnY2xpY2shJyk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgdmFyIHRlc3RTZWdtZW50ID0gbmV3IFNlZ21lbnQoe1xuICAgICAgICBvdXRlclJhZGl1czogNDAsXG4gICAgICAgIGlubmVyUmFkaXVzOiAyNSxcbiAgICAgICAgaW5uZXJXaWR0aDogTWF0aC5QSSAvIDYsIC8vaW4gcmFkaWFuc1xuICAgICAgICBvdXRlcldpZHRoOiBNYXRoLlBJIC8gNi4yLCAvL2luIHJhZGlhbnNcbiAgICAgICAgb2Zmc2V0OiBpICogTWF0aC5QSSAvIDYsIC8vaW4gcmFkaWFuc1xuICAgICAgICBjb2xvcjogcmFuZG9tSW50KDB4NjEyZjYwLCAweGZmZmZmZilcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZW5kZXJlci5hZGQodGVzdFNlZ21lbnQpO1xuXG4gICAgICB0aGlzLnJlbmRlcmVyLmRvbUV2ZW50cy5hZGRFdmVudExpc3RlbmVyKHRlc3RTZWdtZW50LCAnbW91c2VvdmVyJywgbW91c2VvdmVyQ2FsbGJhY2ssIGZhbHNlKTtcblxuICAgICAgdGhpcy5yZW5kZXJlci5kb21FdmVudHMuYWRkRXZlbnRMaXN0ZW5lcih0ZXN0U2VnbWVudCwgJ2NsaWNrJywgY2xpY2tDYWxsYmFjaywgZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gRHJhd2luZztcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgSFRNTCBDTEFTU0VTXG4vLyAqXG4vLyAqICBBbnkgSFRNTCBjb250cm9sbGluZyBjbGFzc2VzIGdvIGhlcmVcbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgQ0VOVFJFQ0lSQ0xFIENMQVNTXG4vLyAqXG4vLyAqICBUaGlzIGNvbnRyb2xzIHRoZSBjZW50cmUgY2lyY2xlIGxheW91dFxuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxudmFyIENlbnRyZUNpcmNsZSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQ2VudHJlQ2lyY2xlKCkge1xuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBDZW50cmVDaXJjbGUpO1xuXG4gICAgdGhpcy5lbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NlbnRyZUNpcmNsZScpO1xuICAgIHRoaXMubGF5b3V0KCk7XG4gIH1cblxuICBDZW50cmVDaXJjbGUucHJvdG90eXBlLmxheW91dCA9IGZ1bmN0aW9uIGxheW91dCgpIHtcbiAgICB0aGlzLmVsZW0uc3R5bGUud2lkdGggPSBsZW5ndGgoNTApICsgJ3B4JztcbiAgICB0aGlzLmVsZW0uc3R5bGUuaGVpZ2h0ID0gbGVuZ3RoKDUwKSArICdweCc7XG4gIH07XG5cbiAgcmV0dXJuIENlbnRyZUNpcmNsZTtcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgQ0VOVFJFQ0lSQ0xFQ09OVEVOVFMgQ0xBU1Ncbi8vICpcbi8vICogIFRoaXMgY29udHJvbHMgdGhlIGNlbnRyZSBjaXJjbGUgY29udGVudHNcbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBDZW50cmVDaXJjbGVDb250ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQ2VudHJlQ2lyY2xlQ29udGVudHMoKSB7XG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIENlbnRyZUNpcmNsZUNvbnRlbnRzKTtcblxuICAgIHRoaXMuZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjZW50cmVDaXJjbGVDb250ZW50cycpO1xuICB9XG5cbiAgQ2VudHJlQ2lyY2xlQ29udGVudHMucHJvdG90eXBlLnN3aXRjaENvbnRlbnRzID0gZnVuY3Rpb24gc3dpdGNoQ29udGVudHMobmV3Q29udGVudHNGaWxlKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8vZG9uJ3QgbG9hZCB0aGUgc2FtZSBjb250ZW50cyB0d2ljZVxuICAgIGlmICh0aGlzLmN1cnJlbnRDb250ZW50c0ZpbGUgPT09IG5ld0NvbnRlbnRzRmlsZSkgcmV0dXJuO1xuXG4gICAgdGhpcy5jdXJyZW50Q29udGVudHNGaWxlID0gbmV3Q29udGVudHNGaWxlO1xuICAgIC8vIHVybCAocmVxdWlyZWQpLCBvcHRpb25zIChvcHRpb25hbClcbiAgICBmZXRjaChuZXdDb250ZW50c0ZpbGUsIHtcbiAgICAgIG1ldGhvZDogJ2dldCdcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICBfdGhpcy5lbGVtLmlubmVySFRNTCA9IGh0bWw7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgJyArIG5ld0NvbnRlbnRzRmlsZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIENlbnRyZUNpcmNsZUNvbnRlbnRzO1xufSgpO1xuXG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBDT05UUk9MTEVSIENMQVNTXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG52YXIgQ29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQ29udHJvbGxlcigpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29udHJvbGxlcik7XG5cbiAgICB0aGlzLmxheW91dCA9IG5ldyBMYXlvdXRDb250cm9sbGVyKCk7XG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcigpO1xuICAgIHRoaXMuY2VudHJlQ2lyY2xlID0gbmV3IENlbnRyZUNpcmNsZSgpO1xuICAgIHRoaXMuQ2VudHJlQ2lyY2xlQ29udGVudHMgPSBuZXcgQ2VudHJlQ2lyY2xlQ29udGVudHMoKTtcbiAgICB0aGlzLmRyYXdpbmcgPSBuZXcgRHJhd2luZyh0aGlzLnJlbmRlcmVyKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIENvbnRyb2xsZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKCk7XG5cbiAgICAvL1RoaXMgd2lsbCB1c2UgR1NBUCByQUYgaW5zdGVhZCBvZiBUSFJFRS5qc1xuICAgIC8vYWxzbyByZW1vdmUgcmVxdWVzdCBhbmltYXRpb24gZnJhbWUgZnJvbSByZW5kZXIgZnVuY3Rpb24hXG4gICAgLy9Ud2Vlbk1heC50aWNrZXIuYWRkRXZlbnRMaXN0ZW5lcigndGljaycsICgpID0+IHRoaXMucmVuZGVyZXIucmVuZGVyKCkpO1xuXG4gICAgdGhpcy5DZW50cmVDaXJjbGVDb250ZW50cy5zd2l0Y2hDb250ZW50cygnLi9odG1sX2NvbXBvbmVudHMvY2VudHJlX2NpcmNsZS90ZXN0Lmh0bWwnKTtcbiAgfTtcblxuICAvL3RvIHVzZSB0aGlzIGFkZCBidXR0b25zIHdpdGggdGhlIGNsYXNzZXMgYmVsb3dcblxuXG4gIENvbnRyb2xsZXIucHJvdG90eXBlLnNhdmVJbWFnZUJ1dHRvbnMgPSBmdW5jdGlvbiBzYXZlSW1hZ2VCdXR0b25zKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2F2ZS1pbWFnZScpLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX3RoaXMucmVuZGVyLnNhdmVJbWFnZSgpO1xuICAgIH07XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Rvd25sb2FkLWltYWdlJykub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpcy5yZW5kZXIuZG93bmxvYWRJbWFnZSgpO1xuICAgIH07XG4gIH07XG5cbiAgcmV0dXJuIENvbnRyb2xsZXI7XG59KCk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogICBQT0xZRklMTFNcbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgIFNFVFVQXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbnZhciBjb250cm9sbGVyID0gdm9pZCAwO1xud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgY29udHJvbGxlciA9IG5ldyBDb250cm9sbGVyKCk7XG59O1xuXG53aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIC8vY29udHJvbGxlci5vblJlc2l6ZSgpO1xufTsiLCJcbnZhciB2ZXJ0ID0gXCIjZGVmaW5lIEdMU0xJRlkgMVxcbmF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xcbnVuaWZvcm0gbWF0NCBtb2RlbFZpZXdNYXRyaXg7XFxudW5pZm9ybSBtYXQ0IHByb2plY3Rpb25NYXRyaXg7XFxudmFyeWluZyB2ZWMyIHZVdjtcXG52b2lkIG1haW4oKSB7XFxuICBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zaXRpb24sIDEuMCk7XFxuICB2VXYgPSB2ZWMyKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpICogMC41ICsgMC41O1xcbn1cIlxudmFyIGZyYWcgPSBcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xcbiNkZWZpbmUgR0xTTElGWSAxXFxuLy9cXG4vLyBHTFNMIHRleHR1cmVsZXNzIGNsYXNzaWMgM0Qgbm9pc2UgXFxcImNub2lzZVxcXCIsXFxuLy8gd2l0aCBhbiBSU0wtc3R5bGUgcGVyaW9kaWMgdmFyaWFudCBcXFwicG5vaXNlXFxcIi5cXG4vLyBBdXRob3I6ICBTdGVmYW4gR3VzdGF2c29uIChzdGVmYW4uZ3VzdGF2c29uQGxpdS5zZSlcXG4vLyBWZXJzaW9uOiAyMDExLTEwLTExXFxuLy9cXG4vLyBNYW55IHRoYW5rcyB0byBJYW4gTWNFd2FuIG9mIEFzaGltYSBBcnRzIGZvciB0aGVcXG4vLyBpZGVhcyBmb3IgcGVybXV0YXRpb24gYW5kIGdyYWRpZW50IHNlbGVjdGlvbi5cXG4vL1xcbi8vIENvcHlyaWdodCAoYykgMjAxMSBTdGVmYW4gR3VzdGF2c29uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8xNjA0MTUwNTU5KHZlYzMgeClcXG57XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8xNjA0MTUwNTU5KHZlYzQgeClcXG57XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IHBlcm11dGVfMTYwNDE1MDU1OSh2ZWM0IHgpXFxue1xcbiAgcmV0dXJuIG1vZDI4OV8xNjA0MTUwNTU5KCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfMTYwNDE1MDU1OSh2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxudmVjMyBmYWRlXzE2MDQxNTA1NTkodmVjMyB0KSB7XFxuICByZXR1cm4gdCp0KnQqKHQqKHQqNi4wLTE1LjApKzEwLjApO1xcbn1cXG5cXG4vLyBDbGFzc2ljIFBlcmxpbiBub2lzZSwgcGVyaW9kaWMgdmFyaWFudFxcbmZsb2F0IHBub2lzZV8xNjA0MTUwNTU5KHZlYzMgUCwgdmVjMyByZXApXFxue1xcbiAgdmVjMyBQaTAgPSBtb2QoZmxvb3IoUCksIHJlcCk7IC8vIEludGVnZXIgcGFydCwgbW9kdWxvIHBlcmlvZFxcbiAgdmVjMyBQaTEgPSBtb2QoUGkwICsgdmVjMygxLjApLCByZXApOyAvLyBJbnRlZ2VyIHBhcnQgKyAxLCBtb2QgcGVyaW9kXFxuICBQaTAgPSBtb2QyODlfMTYwNDE1MDU1OShQaTApO1xcbiAgUGkxID0gbW9kMjg5XzE2MDQxNTA1NTkoUGkxKTtcXG4gIHZlYzMgUGYwID0gZnJhY3QoUCk7IC8vIEZyYWN0aW9uYWwgcGFydCBmb3IgaW50ZXJwb2xhdGlvblxcbiAgdmVjMyBQZjEgPSBQZjAgLSB2ZWMzKDEuMCk7IC8vIEZyYWN0aW9uYWwgcGFydCAtIDEuMFxcbiAgdmVjNCBpeCA9IHZlYzQoUGkwLngsIFBpMS54LCBQaTAueCwgUGkxLngpO1xcbiAgdmVjNCBpeSA9IHZlYzQoUGkwLnl5LCBQaTEueXkpO1xcbiAgdmVjNCBpejAgPSBQaTAuenp6ejtcXG4gIHZlYzQgaXoxID0gUGkxLnp6eno7XFxuXFxuICB2ZWM0IGl4eSA9IHBlcm11dGVfMTYwNDE1MDU1OShwZXJtdXRlXzE2MDQxNTA1NTkoaXgpICsgaXkpO1xcbiAgdmVjNCBpeHkwID0gcGVybXV0ZV8xNjA0MTUwNTU5KGl4eSArIGl6MCk7XFxuICB2ZWM0IGl4eTEgPSBwZXJtdXRlXzE2MDQxNTA1NTkoaXh5ICsgaXoxKTtcXG5cXG4gIHZlYzQgZ3gwID0gaXh5MCAqICgxLjAgLyA3LjApO1xcbiAgdmVjNCBneTAgPSBmcmFjdChmbG9vcihneDApICogKDEuMCAvIDcuMCkpIC0gMC41O1xcbiAgZ3gwID0gZnJhY3QoZ3gwKTtcXG4gIHZlYzQgZ3owID0gdmVjNCgwLjUpIC0gYWJzKGd4MCkgLSBhYnMoZ3kwKTtcXG4gIHZlYzQgc3owID0gc3RlcChnejAsIHZlYzQoMC4wKSk7XFxuICBneDAgLT0gc3owICogKHN0ZXAoMC4wLCBneDApIC0gMC41KTtcXG4gIGd5MCAtPSBzejAgKiAoc3RlcCgwLjAsIGd5MCkgLSAwLjUpO1xcblxcbiAgdmVjNCBneDEgPSBpeHkxICogKDEuMCAvIDcuMCk7XFxuICB2ZWM0IGd5MSA9IGZyYWN0KGZsb29yKGd4MSkgKiAoMS4wIC8gNy4wKSkgLSAwLjU7XFxuICBneDEgPSBmcmFjdChneDEpO1xcbiAgdmVjNCBnejEgPSB2ZWM0KDAuNSkgLSBhYnMoZ3gxKSAtIGFicyhneTEpO1xcbiAgdmVjNCBzejEgPSBzdGVwKGd6MSwgdmVjNCgwLjApKTtcXG4gIGd4MSAtPSBzejEgKiAoc3RlcCgwLjAsIGd4MSkgLSAwLjUpO1xcbiAgZ3kxIC09IHN6MSAqIChzdGVwKDAuMCwgZ3kxKSAtIDAuNSk7XFxuXFxuICB2ZWMzIGcwMDAgPSB2ZWMzKGd4MC54LGd5MC54LGd6MC54KTtcXG4gIHZlYzMgZzEwMCA9IHZlYzMoZ3gwLnksZ3kwLnksZ3owLnkpO1xcbiAgdmVjMyBnMDEwID0gdmVjMyhneDAueixneTAueixnejAueik7XFxuICB2ZWMzIGcxMTAgPSB2ZWMzKGd4MC53LGd5MC53LGd6MC53KTtcXG4gIHZlYzMgZzAwMSA9IHZlYzMoZ3gxLngsZ3kxLngsZ3oxLngpO1xcbiAgdmVjMyBnMTAxID0gdmVjMyhneDEueSxneTEueSxnejEueSk7XFxuICB2ZWMzIGcwMTEgPSB2ZWMzKGd4MS56LGd5MS56LGd6MS56KTtcXG4gIHZlYzMgZzExMSA9IHZlYzMoZ3gxLncsZ3kxLncsZ3oxLncpO1xcblxcbiAgdmVjNCBub3JtMCA9IHRheWxvckludlNxcnRfMTYwNDE1MDU1OSh2ZWM0KGRvdChnMDAwLCBnMDAwKSwgZG90KGcwMTAsIGcwMTApLCBkb3QoZzEwMCwgZzEwMCksIGRvdChnMTEwLCBnMTEwKSkpO1xcbiAgZzAwMCAqPSBub3JtMC54O1xcbiAgZzAxMCAqPSBub3JtMC55O1xcbiAgZzEwMCAqPSBub3JtMC56O1xcbiAgZzExMCAqPSBub3JtMC53O1xcbiAgdmVjNCBub3JtMSA9IHRheWxvckludlNxcnRfMTYwNDE1MDU1OSh2ZWM0KGRvdChnMDAxLCBnMDAxKSwgZG90KGcwMTEsIGcwMTEpLCBkb3QoZzEwMSwgZzEwMSksIGRvdChnMTExLCBnMTExKSkpO1xcbiAgZzAwMSAqPSBub3JtMS54O1xcbiAgZzAxMSAqPSBub3JtMS55O1xcbiAgZzEwMSAqPSBub3JtMS56O1xcbiAgZzExMSAqPSBub3JtMS53O1xcblxcbiAgZmxvYXQgbjAwMCA9IGRvdChnMDAwLCBQZjApO1xcbiAgZmxvYXQgbjEwMCA9IGRvdChnMTAwLCB2ZWMzKFBmMS54LCBQZjAueXopKTtcXG4gIGZsb2F0IG4wMTAgPSBkb3QoZzAxMCwgdmVjMyhQZjAueCwgUGYxLnksIFBmMC56KSk7XFxuICBmbG9hdCBuMTEwID0gZG90KGcxMTAsIHZlYzMoUGYxLnh5LCBQZjAueikpO1xcbiAgZmxvYXQgbjAwMSA9IGRvdChnMDAxLCB2ZWMzKFBmMC54eSwgUGYxLnopKTtcXG4gIGZsb2F0IG4xMDEgPSBkb3QoZzEwMSwgdmVjMyhQZjEueCwgUGYwLnksIFBmMS56KSk7XFxuICBmbG9hdCBuMDExID0gZG90KGcwMTEsIHZlYzMoUGYwLngsIFBmMS55eikpO1xcbiAgZmxvYXQgbjExMSA9IGRvdChnMTExLCBQZjEpO1xcblxcbiAgdmVjMyBmYWRlX3h5eiA9IGZhZGVfMTYwNDE1MDU1OShQZjApO1xcbiAgdmVjNCBuX3ogPSBtaXgodmVjNChuMDAwLCBuMTAwLCBuMDEwLCBuMTEwKSwgdmVjNChuMDAxLCBuMTAxLCBuMDExLCBuMTExKSwgZmFkZV94eXoueik7XFxuICB2ZWMyIG5feXogPSBtaXgobl96Lnh5LCBuX3ouencsIGZhZGVfeHl6LnkpO1xcbiAgZmxvYXQgbl94eXogPSBtaXgobl95ei54LCBuX3l6LnksIGZhZGVfeHl6LngpO1xcbiAgcmV0dXJuIDIuMiAqIG5feHl6O1xcbn1cXG5cXG4vL1xcbi8vIERlc2NyaXB0aW9uIDogQXJyYXkgYW5kIHRleHR1cmVsZXNzIEdMU0wgMkQvM0QvNEQgc2ltcGxleFxcbi8vICAgICAgICAgICAgICAgbm9pc2UgZnVuY3Rpb25zLlxcbi8vICAgICAgQXV0aG9yIDogSWFuIE1jRXdhbiwgQXNoaW1hIEFydHMuXFxuLy8gIE1haW50YWluZXIgOiBpam1cXG4vLyAgICAgTGFzdG1vZCA6IDIwMTEwODIyIChpam0pXFxuLy8gICAgIExpY2Vuc2UgOiBDb3B5cmlnaHQgKEMpIDIwMTEgQXNoaW1hIEFydHMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gICAgICAgICAgICAgICBEaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMSUNFTlNFIGZpbGUuXFxuLy8gICAgICAgICAgICAgICBodHRwczovL2dpdGh1Yi5jb20vYXNoaW1hL3dlYmdsLW5vaXNlXFxuLy9cXG5cXG52ZWMzIG1vZDI4OV8xMTE3NTY5NTk5KHZlYzMgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBtb2QyODlfMTExNzU2OTU5OSh2ZWM0IHgpIHtcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8xMTE3NTY5NTk5KHZlYzQgeCkge1xcbiAgICAgcmV0dXJuIG1vZDI4OV8xMTE3NTY5NTk5KCgoeCozNC4wKSsxLjApKngpO1xcbn1cXG5cXG52ZWM0IHRheWxvckludlNxcnRfMTExNzU2OTU5OSh2ZWM0IHIpXFxue1xcbiAgcmV0dXJuIDEuNzkyODQyOTE0MDAxNTkgLSAwLjg1MzczNDcyMDk1MzE0ICogcjtcXG59XFxuXFxuZmxvYXQgc25vaXNlXzExMTc1Njk1OTkodmVjMyB2KVxcbiAge1xcbiAgY29uc3QgdmVjMiAgQyA9IHZlYzIoMS4wLzYuMCwgMS4wLzMuMCkgO1xcbiAgY29uc3QgdmVjNCAgRF8xMTE3NTY5NTk5ID0gdmVjNCgwLjAsIDAuNSwgMS4wLCAyLjApO1xcblxcbi8vIEZpcnN0IGNvcm5lclxcbiAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuICB2ZWMzIHgwID0gICB2IC0gaSArIGRvdChpLCBDLnh4eCkgO1xcblxcbi8vIE90aGVyIGNvcm5lcnNcXG4gIHZlYzMgZ18xMTE3NTY5NTk5ID0gc3RlcCh4MC55engsIHgwLnh5eik7XFxuICB2ZWMzIGwgPSAxLjAgLSBnXzExMTc1Njk1OTk7XFxuICB2ZWMzIGkxID0gbWluKCBnXzExMTc1Njk1OTkueHl6LCBsLnp4eSApO1xcbiAgdmVjMyBpMiA9IG1heCggZ18xMTE3NTY5NTk5Lnh5eiwgbC56eHkgKTtcXG5cXG4gIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcbiAgLy8gICB4MSA9IHgwIC0gaTEgICsgMS4wICogQy54eHg7XFxuICAvLyAgIHgyID0geDAgLSBpMiAgKyAyLjAgKiBDLnh4eDtcXG4gIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcbiAgdmVjMyB4MSA9IHgwIC0gaTEgKyBDLnh4eDtcXG4gIHZlYzMgeDIgPSB4MCAtIGkyICsgQy55eXk7IC8vIDIuMCpDLnggPSAxLzMgPSBDLnlcXG4gIHZlYzMgeDMgPSB4MCAtIERfMTExNzU2OTU5OS55eXk7ICAgICAgLy8gLTEuMCszLjAqQy54ID0gLTAuNSA9IC1ELnlcXG5cXG4vLyBQZXJtdXRhdGlvbnNcXG4gIGkgPSBtb2QyODlfMTExNzU2OTU5OShpKTtcXG4gIHZlYzQgcCA9IHBlcm11dGVfMTExNzU2OTU5OSggcGVybXV0ZV8xMTE3NTY5NTk5KCBwZXJtdXRlXzExMTc1Njk1OTkoXFxuICAgICAgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG4gICAgICAgICAgICsgaS55ICsgdmVjNCgwLjAsIGkxLnksIGkyLnksIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnggKyB2ZWM0KDAuMCwgaTEueCwgaTIueCwgMS4wICkpO1xcblxcbi8vIEdyYWRpZW50czogN3g3IHBvaW50cyBvdmVyIGEgc3F1YXJlLCBtYXBwZWQgb250byBhbiBvY3RhaGVkcm9uLlxcbi8vIFRoZSByaW5nIHNpemUgMTcqMTcgPSAyODkgaXMgY2xvc2UgdG8gYSBtdWx0aXBsZSBvZiA0OSAoNDkqNiA9IDI5NClcXG4gIGZsb2F0IG5fID0gMC4xNDI4NTcxNDI4NTc7IC8vIDEuMC83LjBcXG4gIHZlYzMgIG5zID0gbl8gKiBEXzExMTc1Njk1OTkud3l6IC0gRF8xMTE3NTY5NTk5Lnh6eDtcXG5cXG4gIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXFxuICB2ZWM0IHhfID0gZmxvb3IoaiAqIG5zLnopO1xcbiAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblxcbiAgdmVjNCB4ID0geF8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcbiAgdmVjNCBoID0gMS4wIC0gYWJzKHgpIC0gYWJzKHkpO1xcblxcbiAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG4gIHZlYzQgYjEgPSB2ZWM0KCB4Lnp3LCB5Lnp3ICk7XFxuXFxuICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG4gIC8vdmVjNCBzMSA9IHZlYzQobGVzc1RoYW4oYjEsMC4wKSkqMi4wIC0gMS4wO1xcbiAgdmVjNCBzMCA9IGZsb29yKGIwKSoyLjAgKyAxLjA7XFxuICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG4gIHZlYzQgc2ggPSAtc3RlcChoLCB2ZWM0KDAuMCkpO1xcblxcbiAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcbiAgdmVjNCBhMV8xMTE3NTY5NTk5ID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXFxuICB2ZWMzIHAwXzExMTc1Njk1OTkgPSB2ZWMzKGEwLnh5LGgueCk7XFxuICB2ZWMzIHAxID0gdmVjMyhhMC56dyxoLnkpO1xcbiAgdmVjMyBwMiA9IHZlYzMoYTFfMTExNzU2OTU5OS54eSxoLnopO1xcbiAgdmVjMyBwMyA9IHZlYzMoYTFfMTExNzU2OTU5OS56dyxoLncpO1xcblxcbi8vTm9ybWFsaXNlIGdyYWRpZW50c1xcbiAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydF8xMTE3NTY5NTk5KHZlYzQoZG90KHAwXzExMTc1Njk1OTkscDBfMTExNzU2OTU5OSksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuICBwMF8xMTE3NTY5NTk5ICo9IG5vcm0ueDtcXG4gIHAxICo9IG5vcm0ueTtcXG4gIHAyICo9IG5vcm0uejtcXG4gIHAzICo9IG5vcm0udztcXG5cXG4vLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG4gIHZlYzQgbSA9IG1heCgwLjYgLSB2ZWM0KGRvdCh4MCx4MCksIGRvdCh4MSx4MSksIGRvdCh4Mix4MiksIGRvdCh4Myx4MykpLCAwLjApO1xcbiAgbSA9IG0gKiBtO1xcbiAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwXzExMTc1Njk1OTkseDApLCBkb3QocDEseDEpLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuICB9XFxuXFxuZmxvYXQgZ3JhaW5fMjI4MTgzMTEyMyh2ZWMyIHRleENvb3JkLCB2ZWMyIHJlc29sdXRpb24sIGZsb2F0IGZyYW1lLCBmbG9hdCBtdWx0aXBsaWVyKSB7XFxuICAgIHZlYzIgbXVsdCA9IHRleENvb3JkICogcmVzb2x1dGlvbjtcXG4gICAgZmxvYXQgb2Zmc2V0ID0gc25vaXNlXzExMTc1Njk1OTkodmVjMyhtdWx0IC8gbXVsdGlwbGllciwgZnJhbWUpKTtcXG4gICAgZmxvYXQgbjEgPSBwbm9pc2VfMTYwNDE1MDU1OSh2ZWMzKG11bHQsIG9mZnNldCksIHZlYzMoMS4wL3RleENvb3JkICogcmVzb2x1dGlvbiwgMS4wKSk7XFxuICAgIHJldHVybiBuMSAvIDIuMCArIDAuNTtcXG59XFxuXFxuZmxvYXQgZ3JhaW5fMjI4MTgzMTEyMyh2ZWMyIHRleENvb3JkLCB2ZWMyIHJlc29sdXRpb24sIGZsb2F0IGZyYW1lKSB7XFxuICAgIHJldHVybiBncmFpbl8yMjgxODMxMTIzKHRleENvb3JkLCByZXNvbHV0aW9uLCBmcmFtZSwgMi41KTtcXG59XFxuXFxuZmxvYXQgZ3JhaW5fMjI4MTgzMTEyMyh2ZWMyIHRleENvb3JkLCB2ZWMyIHJlc29sdXRpb24pIHtcXG4gICAgcmV0dXJuIGdyYWluXzIyODE4MzExMjModGV4Q29vcmQsIHJlc29sdXRpb24sIDAuMCk7XFxufVxcblxcbnZlYzMgYmxlbmRTb2Z0TGlnaHRfMTU0MDI1OTEzMCh2ZWMzIGJhc2UsIHZlYzMgYmxlbmQpIHtcXG4gICAgcmV0dXJuIG1peChcXG4gICAgICAgIHNxcnQoYmFzZSkgKiAoMi4wICogYmxlbmQgLSAxLjApICsgMi4wICogYmFzZSAqICgxLjAgLSBibGVuZCksIFxcbiAgICAgICAgMi4wICogYmFzZSAqIGJsZW5kICsgYmFzZSAqIGJhc2UgKiAoMS4wIC0gMi4wICogYmxlbmQpLCBcXG4gICAgICAgIHN0ZXAoYmFzZSwgdmVjMygwLjUpKVxcbiAgICApO1xcbn1cXG5cXG4vLyBVc2luZyBjb25kaXRpb25hbHNcXG4vLyB2ZWMzIGJsZW5kU29mdExpZ2h0KHZlYzMgYmFzZSwgdmVjMyBibGVuZCkge1xcbi8vICAgICByZXR1cm4gdmVjMyhcXG4vLyAgICAgICAgICgoYmxlbmQuciA8IDAuNSkgPyAoMi4wICogYmFzZS5yICogYmxlbmQuciArIGJhc2UuciAqIGJhc2UuciAqICgxLjAgLSAyLjAgKiBibGVuZC5yKSkgOiAoc3FydChiYXNlLnIpICogKDIuMCAqIGJsZW5kLnIgLSAxLjApICsgMi4wICogYmFzZS5yICogKDEuMCAtIGJsZW5kLnIpKSksXFxuLy8gICAgICAgICAoKGJsZW5kLmcgPCAwLjUpID8gKDIuMCAqIGJhc2UuZyAqIGJsZW5kLmcgKyBiYXNlLmcgKiBiYXNlLmcgKiAoMS4wIC0gMi4wICogYmxlbmQuZykpIDogKHNxcnQoYmFzZS5nKSAqICgyLjAgKiBibGVuZC5nIC0gMS4wKSArIDIuMCAqIGJhc2UuZyAqICgxLjAgLSBibGVuZC5nKSkpLFxcbi8vICAgICAgICAgKChibGVuZC5iIDwgMC41KSA/ICgyLjAgKiBiYXNlLmIgKiBibGVuZC5iICsgYmFzZS5iICogYmFzZS5iICogKDEuMCAtIDIuMCAqIGJsZW5kLmIpKSA6IChzcXJ0KGJhc2UuYikgKiAoMi4wICogYmxlbmQuYiAtIDEuMCkgKyAyLjAgKiBiYXNlLmIgKiAoMS4wIC0gYmxlbmQuYikpKVxcbi8vICAgICApO1xcbi8vIH1cXG5cXG51bmlmb3JtIHZlYzMgY29sb3IxO1xcbnVuaWZvcm0gdmVjMyBjb2xvcjI7XFxudW5pZm9ybSBmbG9hdCBhc3BlY3Q7XFxudW5pZm9ybSB2ZWMyIG9mZnNldDtcXG51bmlmb3JtIHZlYzIgc2NhbGU7XFxudW5pZm9ybSBmbG9hdCBub2lzZUFscGhhO1xcbnVuaWZvcm0gYm9vbCBhc3BlY3RDb3JyZWN0aW9uO1xcbnVuaWZvcm0gZmxvYXQgZ3JhaW5TY2FsZTtcXG51bmlmb3JtIGZsb2F0IGdyYWluVGltZTtcXG51bmlmb3JtIHZlYzIgc21vb3RoO1xcblxcbnZhcnlpbmcgdmVjMiB2VXY7XFxuXFxudm9pZCBtYWluKCkge1xcbiAgdmVjMiBxID0gdmVjMih2VXYgLSAwLjUpO1xcbiAgaWYgKGFzcGVjdENvcnJlY3Rpb24pIHtcXG4gICAgcS54ICo9IGFzcGVjdDtcXG4gIH1cXG4gIHEgLz0gc2NhbGU7XFxuICBxIC09IG9mZnNldDtcXG4gIGZsb2F0IGRzdCA9IGxlbmd0aChxKTtcXG4gIGRzdCA9IHNtb290aHN0ZXAoc21vb3RoLngsIHNtb290aC55LCBkc3QpO1xcbiAgdmVjMyBjb2xvciA9IG1peChjb2xvcjEsIGNvbG9yMiwgZHN0KTtcXG4gIFxcbiAgaWYgKG5vaXNlQWxwaGEgPiAwLjAgJiYgZ3JhaW5TY2FsZSA+IDAuMCkge1xcbiAgICBmbG9hdCBnU2l6ZSA9IDEuMCAvIGdyYWluU2NhbGU7XFxuICAgIGZsb2F0IGcgPSBncmFpbl8yMjgxODMxMTIzKHZVdiwgdmVjMihnU2l6ZSAqIGFzcGVjdCwgZ1NpemUpLCBncmFpblRpbWUpO1xcbiAgICB2ZWMzIG5vaXNlQ29sb3IgPSBibGVuZFNvZnRMaWdodF8xNTQwMjU5MTMwKGNvbG9yLCB2ZWMzKGcpKTtcXG4gICAgZ2xfRnJhZ0NvbG9yLnJnYiA9IG1peChjb2xvciwgbm9pc2VDb2xvciwgbm9pc2VBbHBoYSk7XFxuICB9IGVsc2Uge1xcbiAgICBnbF9GcmFnQ29sb3IucmdiID0gY29sb3I7XFxuICB9XFxuICBnbF9GcmFnQ29sb3IuYSA9IDEuMDtcXG59XCJcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVCYWNrZ3JvdW5kXG5mdW5jdGlvbiBjcmVhdGVCYWNrZ3JvdW5kIChvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9XG4gIHZhciBnZW9tZXRyeSA9IG9wdC5nZW9tZXRyeSB8fCBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgyLCAyLCAxKVxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUmF3U2hhZGVyTWF0ZXJpYWwoe1xuICAgIHZlcnRleFNoYWRlcjogdmVydCxcbiAgICBmcmFnbWVudFNoYWRlcjogZnJhZyxcbiAgICBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlLFxuICAgIHVuaWZvcm1zOiB7XG4gICAgICBhc3BlY3RDb3JyZWN0aW9uOiB7IHR5cGU6ICdpJywgdmFsdWU6IGZhbHNlIH0sXG4gICAgICBhc3BlY3Q6IHsgdHlwZTogJ2YnLCB2YWx1ZTogMSB9LFxuICAgICAgZ3JhaW5TY2FsZTogeyB0eXBlOiAnZicsIHZhbHVlOiAwLjAwNSB9LFxuICAgICAgZ3JhaW5UaW1lOiB7IHR5cGU6ICdmJywgdmFsdWU6IDAgfSxcbiAgICAgIG5vaXNlQWxwaGE6IHsgdHlwZTogJ2YnLCB2YWx1ZTogMC4yNSB9LFxuICAgICAgb2Zmc2V0OiB7IHR5cGU6ICd2MicsIHZhbHVlOiBuZXcgVEhSRUUuVmVjdG9yMigwLCAwKSB9LFxuICAgICAgc2NhbGU6IHsgdHlwZTogJ3YyJywgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKDEsIDEpIH0sXG4gICAgICBzbW9vdGg6IHsgdHlwZTogJ3YyJywgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKDAuMCwgMS4wKSB9LFxuICAgICAgY29sb3IxOiB7IHR5cGU6ICdjJywgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignI2ZmZicpIH0sXG4gICAgICBjb2xvcjI6IHsgdHlwZTogJ2MnLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjMjgzODQ0JykgfVxuICAgIH0sXG4gICAgZGVwdGhUZXN0OiBmYWxzZVxuICB9KVxuICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbClcbiAgbWVzaC5zdHlsZSA9IHN0eWxlXG4gIGlmIChvcHQpIG1lc2guc3R5bGUob3B0KVxuICByZXR1cm4gbWVzaFxuXG4gIGZ1bmN0aW9uIHN0eWxlIChvcHQpIHtcbiAgICBvcHQgPSBvcHQgfHwge31cbiAgICBpZiAoQXJyYXkuaXNBcnJheShvcHQuY29sb3JzKSkge1xuICAgICAgdmFyIGNvbG9ycyA9IG9wdC5jb2xvcnMubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIGMgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5Db2xvcihjKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjXG4gICAgICB9KVxuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuY29sb3IxLnZhbHVlLmNvcHkoY29sb3JzWzBdKVxuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuY29sb3IyLnZhbHVlLmNvcHkoY29sb3JzWzFdKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdC5hc3BlY3QgPT09ICdudW1iZXInKSB7XG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5hc3BlY3QudmFsdWUgPSBvcHQuYXNwZWN0XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0LmdyYWluU2NhbGUgPT09ICdudW1iZXInKSB7XG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5ncmFpblNjYWxlLnZhbHVlID0gb3B0LmdyYWluU2NhbGVcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHQuZ3JhaW5UaW1lID09PSAnbnVtYmVyJykge1xuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuZ3JhaW5UaW1lLnZhbHVlID0gb3B0LmdyYWluVGltZVxuICAgIH1cbiAgICBpZiAob3B0LnNtb290aCkge1xuICAgICAgdmFyIHNtb290aCA9IGZyb21BcnJheShvcHQuc21vb3RoLCBUSFJFRS5WZWN0b3IyKVxuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuc21vb3RoLnZhbHVlLmNvcHkoc21vb3RoKVxuICAgIH1cbiAgICBpZiAob3B0Lm9mZnNldCkge1xuICAgICAgdmFyIG9mZnNldCA9IGZyb21BcnJheShvcHQub2Zmc2V0LCBUSFJFRS5WZWN0b3IyKVxuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMub2Zmc2V0LnZhbHVlLmNvcHkob2Zmc2V0KVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdC5ub2lzZUFscGhhID09PSAnbnVtYmVyJykge1xuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMubm9pc2VBbHBoYS52YWx1ZSA9IG9wdC5ub2lzZUFscGhhXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0LnNjYWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIHNjYWxlID0gb3B0LnNjYWxlXG4gICAgICBpZiAodHlwZW9mIHNjYWxlID09PSAnbnVtYmVyJykge1xuICAgICAgICBzY2FsZSA9IFsgc2NhbGUsIHNjYWxlIF1cbiAgICAgIH1cbiAgICAgIHNjYWxlID0gZnJvbUFycmF5KHNjYWxlLCBUSFJFRS5WZWN0b3IyKVxuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuc2NhbGUudmFsdWUuY29weShzY2FsZSlcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHQuYXNwZWN0Q29ycmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmFzcGVjdENvcnJlY3Rpb24udmFsdWUgPSBCb29sZWFuKG9wdC5hc3BlY3RDb3JyZWN0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZyb21BcnJheSAoYXJyYXksIFZlY3RvclR5cGUpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnJheSkpIHtcbiAgICAgIHJldHVybiBuZXcgVmVjdG9yVHlwZSgpLmZyb21BcnJheShhcnJheSlcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5XG4gIH1cbn1cbiJdfQ==
