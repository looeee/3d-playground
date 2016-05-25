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
    endAngle, this.spec.offset, true //clockwise
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
    window.addEventListener('mousemove', function (e) {
      var x = e.pageX;
      var y = e.pageY;
      var w = window.innerWidth;
      var h = window.innerHeight;

      var offsetX = x === 0 ? 0 : x / w;
      var offsetY = y === 0 ? 0.999 : 1 - y / h;

      console.log(offsetX, offsetY);
      background.style({
        offset: [offsetX, offsetY],
        smooth: [1, offsetY],
        //grainScale: offsetY,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlczIwMTUvbWFpbi5qcyIsIm5vZGVfbW9kdWxlcy90aHJlZS12aWduZXR0ZS1iYWNrZ3JvdW5kL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4c0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBiYWJlbEhlbHBlcnMgPSB7fTtcblxuYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmJhYmVsSGVscGVycy5pbmhlcml0cyA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn07XG5cbmJhYmVsSGVscGVycy5wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59O1xuXG5iYWJlbEhlbHBlcnM7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIFBPU1RQUk9DRVNTSU5HIENMQVNTXG4vLyAqXG4vLyAqICBQb3N0IGVmZmVjdHMgZm9yIFRIUkVFLmpzXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbnZhciBQb3N0cHJvY2Vzc2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUG9zdHByb2Nlc3NpbmcocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgUG9zdHByb2Nlc3NpbmcpO1xuXG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIHRoaXMuc2NlbmUgPSBzY2VuZTtcbiAgICB0aGlzLmNhbWVyYSA9IGNhbWVyYTtcbiAgICBpZiAoIURldGVjdG9yLndlYmdsKSBEZXRlY3Rvci5hZGRHZXRXZWJHTE1lc3NhZ2UoKTtcblxuICAgIHZhciByZW5kZXJQYXNzID0gbmV3IFRIUkVFLlJlbmRlclBhc3Moc2NlbmUsIGNhbWVyYSk7XG4gICAgdmFyIGNvcHlQYXNzID0gbmV3IFRIUkVFLlNoYWRlclBhc3MoVEhSRUUuQ29weVNoYWRlcik7XG4gICAgY29weVBhc3MucmVuZGVyVG9TY3JlZW4gPSB0cnVlO1xuXG4gICAgdGhpcy5jb21wb3NlciA9IG5ldyBUSFJFRS5FZmZlY3RDb21wb3NlcihyZW5kZXJlcik7XG4gICAgdGhpcy5jb21wb3Nlci5hZGRQYXNzKHJlbmRlclBhc3MpO1xuXG4gICAgdGhpcy5lZmZlY3RzKCk7XG5cbiAgICB0aGlzLmNvbXBvc2VyLmFkZFBhc3MoY29weVBhc3MpO1xuXG4gICAgLy90aGlzLmFudGlhbGlhcygpO1xuICAgIHJldHVybiB0aGlzLmNvbXBvc2VyO1xuICB9XG5cbiAgUG9zdHByb2Nlc3NpbmcucHJvdG90eXBlLmFudGlhbGlhcyA9IGZ1bmN0aW9uIGFudGlhbGlhcygpIHtcbiAgICB2YXIgbXNhYVJlbmRlclBhc3MgPSBuZXcgVEhSRUUuTWFudWFsTVNBQVJlbmRlclBhc3ModGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIG1zYWFSZW5kZXJQYXNzLnNhbXBsZUxldmVsID0gNDtcbiAgICAvL21zYWFSZW5kZXJQYXNzLnVuYmlhc2VkID0gdHJ1ZTtcbiAgICB0aGlzLmNvbXBvc2VyLmFkZFBhc3MobXNhYVJlbmRlclBhc3MpO1xuICB9O1xuXG4gIFBvc3Rwcm9jZXNzaW5nLnByb3RvdHlwZS5lZmZlY3RzID0gZnVuY3Rpb24gZWZmZWN0cygpIHtcbiAgICB2YXIgdGVzdFBhc3MgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyhUSFJFRS5Db2xvcmlmeVNoYWRlcik7XG4gICAgdGVzdFBhc3MudW5pZm9ybXNbXCJjb2xvclwiXS52YWx1ZSA9IG5ldyBUSFJFRS5Db2xvcigweGZmMDAwMCk7XG4gICAgLy90aGlzLmNvbXBvc2VyLmFkZFBhc3ModGVzdFBhc3MpO1xuICB9O1xuXG4gIHJldHVybiBQb3N0cHJvY2Vzc2luZztcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgUkVOREVSRVIgQ0xBU1Ncbi8vICpcbi8vICogIENvbnRyb2xsZXIgZm9yIFRIUkVFLmpzXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cblxudmFyIFJlbmRlcmVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBSZW5kZXJlcihyZW5kZXJFbGVtKSB7XG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIFJlbmRlcmVyKTtcblxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICB0aGlzLmluaXRDYW1lcmEoKTtcbiAgICB0aGlzLmluaXRSZW5kZXJlcihyZW5kZXJFbGVtKTtcbiAgICB0aGlzLnBvc3RSZW5kZXJlciA9IG5ldyBQb3N0cHJvY2Vzc2luZyh0aGlzLnJlbmRlcmVyLCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG5cbiAgICB0aGlzLnNob3dTdGF0cygpO1xuICAgIHRoaXMucmVzaXplKCk7XG4gICAgdGhpcy5zZXR1cERPTUV2ZW50cygpO1xuICB9XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChtZXNoKSB7XG4gICAgdGhpcy5zY2VuZS5hZGQobWVzaCk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5jbGVhclNjZW5lKCk7XG4gICAgdGhpcy5wYXR0ZXJuID0gbnVsbDsgLy9yZXNldCBtYXRlcmlhbHM7XG4gICAgdGhpcy5zZXRDYW1lcmEoKTtcbiAgICB0aGlzLnNldFJlbmRlcmVyKCk7XG4gIH07XG5cbiAgLy9odHRwczovL2dpdGh1Yi5jb20vamVyb21lZXRpZW5uZS90aHJlZXguZG9tZXZlbnRzXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2V0dXBET01FdmVudHMgPSBmdW5jdGlvbiBzZXR1cERPTUV2ZW50cygpIHtcbiAgICB0aGlzLmRvbUV2ZW50cyA9IG5ldyBUSFJFRXguRG9tRXZlbnRzKHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICB9O1xuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5jbGVhclNjZW5lKCk7XG4gICAgICBfdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgLy90aGlzLmNhbWVyYS5hc3BlY3RcdD0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICBfdGhpcy5zZXRDYW1lcmEoKTtcbiAgICAgIC8vdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH0sIGZhbHNlKTtcbiAgfTtcblxuICAvL2NsZWFyIGFsbCBtZXNoZXMgZnJvbSB0aGUgc2NlbmUsIGJ1dCBwcmVzZXJ2ZSBjYW1lcmEvcmVuZGVyZXJcblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5jbGVhclNjZW5lID0gZnVuY3Rpb24gY2xlYXJTY2VuZSgpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5zY2VuZS5jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIG9iamVjdCA9IHRoaXMuc2NlbmUuY2hpbGRyZW5baV07XG4gICAgICBpZiAob2JqZWN0LnR5cGUgPT09ICdNZXNoJykge1xuICAgICAgICBvYmplY3QuZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgICAgICBvYmplY3QubWF0ZXJpYWwuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLnNjZW5lLnJlbW92ZShvYmplY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuaW5pdENhbWVyYSA9IGZ1bmN0aW9uIGluaXRDYW1lcmEoKSB7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKCk7XG4gICAgdGhpcy5zZXRDYW1lcmEoKTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmNhbWVyYSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnNldENhbWVyYSA9IGZ1bmN0aW9uIHNldENhbWVyYSgpIHtcbiAgICB0aGlzLmNhbWVyYS5sZWZ0ID0gLXdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICB0aGlzLmNhbWVyYS5yaWdodCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICB0aGlzLmNhbWVyYS50b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuICAgIHRoaXMuY2FtZXJhLmJvdHRvbSA9IC13aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuICAgIHRoaXMuY2FtZXJhLm5lYXIgPSAtMTA7XG4gICAgdGhpcy5jYW1lcmEuZmFyID0gMTA7XG4gICAgdGhpcy5jYW1lcmEuZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuaW5pdFJlbmRlcmVyID0gZnVuY3Rpb24gaW5pdFJlbmRlcmVyKHJlbmRlckVsZW0pIHtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe1xuICAgICAgYW50aWFsaWFzOiB0cnVlXG4gICAgfSk7XG4gICAgLy9wcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICAgIGlmIChyZW5kZXJFbGVtKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQgPSByZW5kZXJFbGVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgfVxuICAgIHRoaXMuc2V0UmVuZGVyZXIoKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2V0UmVuZGVyZXIgPSBmdW5jdGlvbiBzZXRSZW5kZXJlcigpIHtcbiAgICB0aGlzLnJlbmRlcmVyLnNldENsZWFyQ29sb3IoMHgwMDAwMDAsIDEuMCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICB9O1xuXG4gIC8vcmVuZGVyIHRvIGltYWdlIGVsZW1cblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJUb0ltYWdlRWxlbSA9IGZ1bmN0aW9uIHJlbmRlclRvSW1hZ2VFbGVtKGVsZW0pIHtcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgdGhpcy5hcHBlbmRJbWFnZVRvRG9tKGVsZW0pO1xuICAgIHRoaXMuY2xlYXJTY2VuZSgpO1xuICB9O1xuXG4gIC8vYWxsb3dzIGRyYXdpbmcgb2YgdGhlIGltYWdlIG9uY2UgYWRkaW5nIHRoaXMgaW1hZ2UgdG8gRE9NIGVsZW1cblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5hcHBlbmRJbWFnZVRvRG9tID0gZnVuY3Rpb24gYXBwZW5kSW1hZ2VUb0RvbShlbGVtKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbGVtKS5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudC50b0RhdGFVUkwoKSk7XG4gIH07XG5cbiAgLy9Eb3dubG9hZCB0aGUgY2FudmFzIGFzIGEgcG5nIGltYWdlXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuZG93bmxvYWRJbWFnZSA9IGZ1bmN0aW9uIGRvd25sb2FkSW1hZ2UoKSB7XG4gICAgdmFyIGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZG93bmxvYWQtaW1hZ2UnKTtcbiAgICBsaW5rLmhyZWYgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG4gICAgbGluay5kb3dubG9hZCA9ICdoeXBlcmJvbGljLXRpbGluZy5wbmcnO1xuICB9O1xuXG4gIC8vY29udmVydCB0aGUgY2FudmFzIHRvIGEgYmFzZTY0VVJMIGFuZCBzZW5kIHRvIHNhdmVJbWFnZS5waHBcblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5zYXZlSW1hZ2UgPSBmdW5jdGlvbiBzYXZlSW1hZ2UoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCk7XG4gICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGh0dHAub3BlbignUE9TVCcsICdzYXZlSW1hZ2UucGhwJywgdHJ1ZSk7XG4gICAgeGh0dHAuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIHhodHRwLnNlbmQoJ2ltZz0nICsgZGF0YSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmFkZEJvdW5kaW5nQm94SGVscGVyID0gZnVuY3Rpb24gYWRkQm91bmRpbmdCb3hIZWxwZXIobWVzaCkge1xuICAgIHZhciBib3ggPSBuZXcgVEhSRUUuQm94SGVscGVyKG1lc2gpO1xuICAgIC8vYm94LnVwZGF0ZSgpO1xuICAgIHRoaXMuc2NlbmUuYWRkKGJveCk7XG4gIH07XG5cbiAgLy9pbmNsdWRlIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2Ivc3RhdHMuanMvYmxvYi9tYXN0ZXIvYnVpbGQvc3RhdHMubWluLmpzXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2hvd1N0YXRzID0gZnVuY3Rpb24gc2hvd1N0YXRzKCkge1xuICAgIHRoaXMuc3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgICB0aGlzLnN0YXRzLnNob3dQYW5lbCgwKTsgLy8gMDogZnBzLCAxOiBtcywgMjogbWIsIDMrOiBjdXN0b21cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuc3RhdHMuZG9tKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX3RoaXMyLnJlbmRlcigpO1xuICAgIH0pO1xuICAgIGlmICh0aGlzLnN0YXRzKSB0aGlzLnN0YXRzLnVwZGF0ZSgpO1xuICAgIHRoaXMucG9zdFJlbmRlcmVyLnJlbmRlcigpO1xuICB9O1xuXG4gIHJldHVybiBSZW5kZXJlcjtcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgTEFZT1VUIENPTlRST0xMRVIgQ0xBU1Ncbi8vICpcbi8vICogIGNvbnRyb2xzIHBvc2l0aW9uL2xvYWRpbmcvaGlkaW5nIGV0Yy5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBMYXlvdXRDb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCkge1xuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBMYXlvdXRDb250cm9sbGVyKTtcblxuICAgIHRoaXMuc2V0dXBMYXlvdXQoKTtcbiAgfVxuXG4gIExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldHVwTGF5b3V0ID0gZnVuY3Rpb24gc2V0dXBMYXlvdXQoKSB7fTtcblxuICBMYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5vblJlc2l6ZSA9IGZ1bmN0aW9uIG9uUmVzaXplKCkge307XG5cbiAgTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuYm90dG9tUGFuZWwgPSBmdW5jdGlvbiBib3R0b21QYW5lbCgpIHt9O1xuXG4gIExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmhpZGVFbGVtZW50cyA9IGZ1bmN0aW9uIGhpZGVFbGVtZW50cygpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZWxlbWVudHMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGVsZW1lbnRzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGVsZW1lbnRzLCBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkoX2l0ZXJhdG9yKSwgX2kgPSAwLCBfaXRlcmF0b3IgPSBfaXNBcnJheSA/IF9pdGVyYXRvciA6IF9pdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdKCk7Oykge1xuICAgICAgdmFyIF9yZWY7XG5cbiAgICAgIGlmIChfaXNBcnJheSkge1xuICAgICAgICBpZiAoX2kgPj0gX2l0ZXJhdG9yLmxlbmd0aCkgYnJlYWs7XG4gICAgICAgIF9yZWYgPSBfaXRlcmF0b3JbX2krK107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfaSA9IF9pdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChfaS5kb25lKSBicmVhaztcbiAgICAgICAgX3JlZiA9IF9pLnZhbHVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgZWxlbWVudCA9IF9yZWY7XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgIH1cbiAgfTtcblxuICBMYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zaG93RWxlbWVudHMgPSBmdW5jdGlvbiBzaG93RWxlbWVudHMoKSB7XG4gICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBlbGVtZW50cyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICBlbGVtZW50c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgIH1cblxuICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBlbGVtZW50cywgX2lzQXJyYXkyID0gQXJyYXkuaXNBcnJheShfaXRlcmF0b3IyKSwgX2kyID0gMCwgX2l0ZXJhdG9yMiA9IF9pc0FycmF5MiA/IF9pdGVyYXRvcjIgOiBfaXRlcmF0b3IyW1N5bWJvbC5pdGVyYXRvcl0oKTs7KSB7XG4gICAgICB2YXIgX3JlZjI7XG5cbiAgICAgIGlmIChfaXNBcnJheTIpIHtcbiAgICAgICAgaWYgKF9pMiA+PSBfaXRlcmF0b3IyLmxlbmd0aCkgYnJlYWs7XG4gICAgICAgIF9yZWYyID0gX2l0ZXJhdG9yMltfaTIrK107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfaTIgPSBfaXRlcmF0b3IyLm5leHQoKTtcbiAgICAgICAgaWYgKF9pMi5kb25lKSBicmVhaztcbiAgICAgICAgX3JlZjIgPSBfaTIudmFsdWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBlbGVtZW50ID0gX3JlZjI7XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gTGF5b3V0Q29udHJvbGxlcjtcbn0oKTtcblxudmFyIHJhbmRvbUludCA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpICsgbWluKTtcbn07XG5cbi8vVGhlIGZvbGxvd2luZyB0aHJlZSBmdW5jdGlvbnMgY29udmVydCB2YWx1ZXMgZnJvbSBwZXJjZW50YWdlcyBzdGFydGluZyBhdFxuLy8oMCwwKSBib3R0b20gbGVmdCB0byAoMTAwLDEwMCkgdG9wIHJpZ2h0IHNjcmVlbiBjb29yZHNcbnZhciB4UGVyY2VudCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMTAwO1xudmFyIHlQZXJjZW50ID0gd2luZG93LmlubmVySGVpZ2h0IC8gMTAwO1xuLy9MZW5ndGhzIGFyZSBjYWxjdWxhdGVkIGZyb20gYSBwZXJjZW50YWdlIG9mIHNjcmVlbiB3aWR0aFxuLy9vciBoZWlnaHQgZGVwZW5kaW5nIG9uIHdoaWNoIGlzIHNtYWxsZXIuIFRoaXMgbWVhbnMgdGhhdFxuLy9vYmplY3RzIGFzc2lnbmVkIGEgbGVuZ3RoIG9mIDEwMCAob3IgY2lyY2xlcyByYWRpdXMgNTApXG4vL3dpbGwgbmV2ZXIgYmUgZHJhd24gb2ZmIHNjcmVlblxudmFyIGxlbmd0aCA9IGZ1bmN0aW9uIChsZW4pIHtcbiAgcmV0dXJuIHhQZXJjZW50IDwgeVBlcmNlbnQgPyBsZW4gKiB4UGVyY2VudCA6IGxlbiAqIHlQZXJjZW50O1xufTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgT0JKRUNUUyBTVVBFUkNMQVNTXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbnZhciBPYmplY3RzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBPYmplY3RzKHNwZWMpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgT2JqZWN0cyk7XG5cbiAgICBzcGVjLmNvbG9yID0gc3BlYy5jb2xvciB8fCAweGZmZmZmZjtcbiAgICB0aGlzLnNwZWMgPSBzcGVjO1xuICB9XG5cbiAgT2JqZWN0cy5wcm90b3R5cGUuY3JlYXRlTWVzaCA9IGZ1bmN0aW9uIGNyZWF0ZU1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgIC8vbWVzaC5wb3NpdGlvbi56ID0gMjtcbiAgICByZXR1cm4gbWVzaDtcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0cztcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgU0VHTUVOVCBDTEFTU1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gc3BlYyA9IHtcbi8vICAgb3V0ZXJSYWRpdXMsXG4vLyAgIGlubmVyUmFkaXVzLFxuLy8gICBpbm5lcldpZHRoLCAvL2luIHJhZGlhbnNcbi8vICAgb3V0ZXJXaWR0aFxuLy8gICBvZmZzZXQsIC8vaW4gcmFkaWFuc1xuLy8gICBtYXRlcmlhbCxcbi8vICAgY29sb3IsXG4vLyB9XG5cblxudmFyIFNlZ21lbnQgPSBmdW5jdGlvbiAoX09iamVjdHMpIHtcbiAgYmFiZWxIZWxwZXJzLmluaGVyaXRzKFNlZ21lbnQsIF9PYmplY3RzKTtcblxuICBmdW5jdGlvbiBTZWdtZW50KHNwZWMpIHtcbiAgICB2YXIgX3JldDtcblxuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBTZWdtZW50KTtcblxuICAgIHZhciBfdGhpcyA9IGJhYmVsSGVscGVycy5wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9PYmplY3RzLmNhbGwodGhpcywgc3BlYykpO1xuXG4gICAgX3RoaXMuc2V0dXAoKTtcbiAgICByZXR1cm4gX3JldCA9IF90aGlzLmNyZWF0ZU1lc2goX3RoaXMuZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiBfdGhpcy5zcGVjLmNvbG9yIH0pKSwgYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMsIF9yZXQpO1xuICB9XG5cbiAgU2VnbWVudC5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICB0aGlzLnNwZWMub3V0ZXJSYWRpdXMgPSBsZW5ndGgodGhpcy5zcGVjLm91dGVyUmFkaXVzKTtcbiAgICB0aGlzLnNwZWMuaW5uZXJSYWRpdXMgPSBsZW5ndGgodGhpcy5zcGVjLmlubmVyUmFkaXVzKTtcbiAgICB0aGlzLmJ1aWxkU2hhcGUoKTtcbiAgICB0aGlzLmJ1aWxkR2VvbWV0cnkoKTtcbiAgfTtcblxuICBTZWdtZW50LnByb3RvdHlwZS5idWlsZFNoYXBlID0gZnVuY3Rpb24gYnVpbGRTaGFwZSgpIHtcbiAgICB2YXIgZW5kQW5nbGUgPSB0aGlzLnNwZWMub2Zmc2V0ICsgdGhpcy5zcGVjLmlubmVyV2lkdGg7XG4gICAgdmFyIHgxID0gTWF0aC5jb3ModGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMuaW5uZXJSYWRpdXM7XG4gICAgdmFyIHkxID0gTWF0aC5zaW4odGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMuaW5uZXJSYWRpdXM7XG4gICAgdmFyIHgyID0gTWF0aC5jb3ModGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMub3V0ZXJSYWRpdXM7XG4gICAgdmFyIHkyID0gTWF0aC5zaW4odGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMub3V0ZXJSYWRpdXM7XG4gICAgdmFyIHgzID0gTWF0aC5jb3MoZW5kQW5nbGUpICogdGhpcy5zcGVjLmlubmVyUmFkaXVzO1xuICAgIHZhciB5MyA9IE1hdGguc2luKGVuZEFuZ2xlKSAqIHRoaXMuc3BlYy5pbm5lclJhZGl1cztcblxuICAgIHRoaXMuc2hhcGUgPSBuZXcgVEhSRUUuU2hhcGUoKTtcbiAgICB0aGlzLnNoYXBlLm1vdmVUbyh4MSwgeTEpO1xuICAgIHRoaXMuc2hhcGUubGluZVRvKHgyLCB5Mik7XG4gICAgdGhpcy5zaGFwZS5hYnNhcmMoMCwgMCwgLy9jZW50cmVcbiAgICB0aGlzLnNwZWMub3V0ZXJSYWRpdXMsIC8vcmFkaXVzXG4gICAgdGhpcy5zcGVjLm9mZnNldCwgLy9zdGFydEFuZ2xlXG4gICAgdGhpcy5zcGVjLm9mZnNldCArIHRoaXMuc3BlYy5vdXRlcldpZHRoLCAvL2VuZEFuZ2xlXG4gICAgdHJ1ZSAvL2Nsb2Nrd2lzZVxuICAgICk7XG4gICAgdGhpcy5zaGFwZS5saW5lVG8oeDMsIHkzKTtcblxuICAgIC8vdGhpcyBhcmMgaXMgZ29pbmcgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbiBzbyBzdGFydC9lbmRBbmdsZSBzd2FwcGVkXG4gICAgdGhpcy5zaGFwZS5hYnNhcmMoMCwgMCwgLy9jZW50cmVcbiAgICB0aGlzLnNwZWMuaW5uZXJSYWRpdXMsIC8vcmFkaXVzXG4gICAgZW5kQW5nbGUsIHRoaXMuc3BlYy5vZmZzZXQsIHRydWUgLy9jbG9ja3dpc2VcbiAgICApO1xuICB9O1xuXG4gIFNlZ21lbnQucHJvdG90eXBlLmJ1aWxkR2VvbWV0cnkgPSBmdW5jdGlvbiBidWlsZEdlb21ldHJ5KCkge1xuICAgIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU2hhcGVHZW9tZXRyeSh0aGlzLnNoYXBlKTtcbiAgfTtcblxuICByZXR1cm4gU2VnbWVudDtcbn0oT2JqZWN0cyk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIERJU0sgQ0xBU1Ncbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIHNwZWMgPSB7XG4vLyAgIHJhZGl1cyxcbi8vICAgY29sb3IsXG4vLyAgIHgsXG4vLyAgIHlcbi8vIH1cbnZhciBEaXNrID0gZnVuY3Rpb24gKF9PYmplY3RzMikge1xuICBiYWJlbEhlbHBlcnMuaW5oZXJpdHMoRGlzaywgX09iamVjdHMyKTtcblxuICBmdW5jdGlvbiBEaXNrKHNwZWMpIHtcbiAgICB2YXIgX3JldDI7XG5cbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgRGlzayk7XG5cbiAgICB2YXIgX3RoaXMyID0gYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX09iamVjdHMyLmNhbGwodGhpcywgc3BlYykpO1xuXG4gICAgX3RoaXMyLnNwZWMucmFkaXVzID0gbGVuZ3RoKF90aGlzMi5zcGVjLnJhZGl1cyk7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkNpcmNsZUdlb21ldHJ5KF90aGlzMi5zcGVjLnJhZGl1cywgMTAwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgdmFyIG1hdGVyaWFsID0gX3RoaXMyLmNyZWF0ZU1lc2hNYXRlcmlhbChfdGhpczIuc3BlYy5jb2xvcik7XG4gICAgcmV0dXJuIF9yZXQyID0gX3RoaXMyLmNyZWF0ZU1lc2goX3RoaXMyLnNwZWMueCwgX3RoaXMyLnNwZWMueSwgZ2VvbWV0cnksIG1hdGVyaWFsKSwgYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMyLCBfcmV0Mik7XG4gIH1cblxuICByZXR1cm4gRGlzaztcbn0oT2JqZWN0cyk7XG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBBUkMgQ0xBU1Ncbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBBcmMgPSBmdW5jdGlvbiAoX09iamVjdHMzKSB7XG4gIGJhYmVsSGVscGVycy5pbmhlcml0cyhBcmMsIF9PYmplY3RzMyk7XG5cbiAgZnVuY3Rpb24gQXJjKHNwZWMpIHtcbiAgICB2YXIgX3JldDM7XG5cbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgQXJjKTtcblxuICAgIHZhciBfdGhpczMgPSBiYWJlbEhlbHBlcnMucG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfT2JqZWN0czMuY2FsbCh0aGlzLCBzcGVjKSk7XG5cbiAgICBfdGhpczMuc3BlYy5yb3RhdGlvbiA9IF90aGlzMy5zcGVjLnJvdGF0aW9uIHx8IDA7XG4gICAgX3RoaXMzLnNwZWMuY2xvY2t3aXNlID0gX3RoaXMzLnNwZWMucm90YXRpb24gfHwgZmFsc2U7XG4gICAgX3RoaXMzLnNwZWMucG9pbnRzID0gX3RoaXMzLnNwZWMucG9pbnRzIHx8IDUwO1xuXG4gICAgdmFyIG1hdGVyaWFsID0gX3RoaXMzLmNyZWF0ZUxpbmVNYXRlcmlhbChfdGhpczMuc3BlYy5jb2xvcik7XG4gICAgdmFyIGN1cnZlID0gbmV3IFRIUkVFLkVsbGlwc2VDdXJ2ZShfdGhpczMuc3BlYy54LCBfdGhpczMuc3BlYy55LCBfdGhpczMuc3BlYy54UmFkaXVzLCBfdGhpczMuc3BlYy55UmFkaXVzLCBfdGhpczMuc3BlYy5zdGFydEFuZ2xlLCBfdGhpczMuc3BlYy5lbmRBbmdsZSwgX3RoaXMzLnNwZWMuY2xvY2t3aXNlLCBfdGhpczMuc3BlYy5yb3RhdGlvbik7XG5cbiAgICB2YXIgcGF0aCA9IG5ldyBUSFJFRS5QYXRoKGN1cnZlLmdldFBvaW50cyhzcGVjLnBvaW50cykpO1xuICAgIHZhciBnZW9tZXRyeSA9IHBhdGguY3JlYXRlUG9pbnRzR2VvbWV0cnkoc3BlYy5wb2ludHMpO1xuICAgIHJldHVybiBfcmV0MyA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCksIGJhYmVsSGVscGVycy5wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKF90aGlzMywgX3JldDMpO1xuICB9XG5cbiAgcmV0dXJuIEFyYztcbn0oT2JqZWN0cyk7XG5cbnZhciBjcmVhdGVCYWNrZ3JvdW5kID0gcmVxdWlyZSgndGhyZWUtdmlnbmV0dGUtYmFja2dyb3VuZCcpO1xuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgRFJBV0lORyBDTEFTU1xuLy8gKlxuLy8gKiAgSGVyZSB3ZSB3aWxsIGNyZWF0ZSBzb21lIHByZXR0eSB0aGluZ3MuXG4vLyAqICBOb3RlIHRoYXQgYWxsIG9iamVjdHMgaW1wb3J0ZWQgZnJvbSBvYmplY3RzLmpzIHdpbGxcbi8vICogIGhhdmUgc3BlYyBhdHRyaWJ1dGVzIGNvbnZlcnRlZCB0byBzY3JlZW4gcGVyY2VudGFnZVxuLy8gKiAgcG9zaXRpb25zL2xlbmd0aHMgZ29pbmcgZnJvbSAoMCwwKSBib3R0b20gbGVmdCB0b1xuLy8gKiAgKDEwMCwxMDApIHRvcCByaWdodFxuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxudmFyIERyYXdpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIERyYXdpbmcocmVuZGVyZXIpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJhd2luZyk7XG5cbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgdGhpcy5yZXNpemUoKTtcbiAgfVxuXG4gIERyYXdpbmcucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIHRoaXMuYWRkQmFja2dyb3VuZCgpO1xuICAgIC8vdGhpcy50ZXN0KCk7XG4gIH07XG5cbiAgRHJhd2luZy5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gcmVzaXplKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgX3RoaXMuaW5pdCgpO1xuICAgIH0sIGZhbHNlKTtcbiAgfTtcblxuICBEcmF3aW5nLnByb3RvdHlwZS5hZGRCYWNrZ3JvdW5kID0gZnVuY3Rpb24gYWRkQmFja2dyb3VuZCgpIHtcbiAgICB2YXIgYmFja2dyb3VuZCA9IGNyZWF0ZUJhY2tncm91bmQoe1xuICAgICAgZ2VvbWV0cnk6IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDIsIDIsIDEpLFxuICAgICAgY29sb3JzOiBbJyNmZmYnLCAnIzI4Mzg0NCddLFxuICAgICAgYXNwZWN0OiAxLFxuICAgICAgZ3JhaW5TY2FsZTogMC4wMDEsXG4gICAgICBncmFpblRpbWU6IDAsXG4gICAgICBub2lzZUFscGhhOiAwLjQsXG4gICAgICBzbW9vdGg6IFsxLCAwLjk5OV0sXG4gICAgICBzY2FsZTogWzEsIDFdLFxuICAgICAgb2Zmc2V0OiBbMSwgMV0sXG4gICAgICBhc3BlY3RDb3JyZWN0aW9uOiBmYWxzZVxuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHggPSBlLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnBhZ2VZO1xuICAgICAgdmFyIHcgPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIHZhciBoID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICB2YXIgb2Zmc2V0WCA9IHggPT09IDAgPyAwIDogeCAvIHc7XG4gICAgICB2YXIgb2Zmc2V0WSA9IHkgPT09IDAgPyAwLjk5OSA6IDEgLSB5IC8gaDtcblxuICAgICAgY29uc29sZS5sb2cob2Zmc2V0WCwgb2Zmc2V0WSk7XG4gICAgICBiYWNrZ3JvdW5kLnN0eWxlKHtcbiAgICAgICAgb2Zmc2V0OiBbb2Zmc2V0WCwgb2Zmc2V0WV0sXG4gICAgICAgIHNtb290aDogWzEsIG9mZnNldFldLFxuICAgICAgICAvL2dyYWluU2NhbGU6IG9mZnNldFksXG4gICAgICAgIG5vaXNlQWxwaGE6IG9mZnNldFggPiAwLjQgPyBvZmZzZXRYIDogMC40XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLnJlbmRlcmVyLmFkZChiYWNrZ3JvdW5kKTtcbiAgfTtcblxuICBEcmF3aW5nLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24gdGVzdCgpIHtcbiAgICB2YXIgbW91c2VvdmVyQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgZWxlbS5pbnRlcnNlY3Qub2JqZWN0Lm1hdGVyaWFsLmNvbG9yID0gbmV3IFRIUkVFLkNvbG9yKHJhbmRvbUludCgweDYxMmY2MCwgMHhmZmZmZmYpKTtcbiAgICAgIGVsZW0uaW50ZXJzZWN0Lm9iamVjdC5tYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfTtcblxuICAgIHZhciBjbGlja0NhbGxiYWNrID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjbGljayEnKTtcbiAgICB9O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICB2YXIgdGVzdFNlZ21lbnQgPSBuZXcgU2VnbWVudCh7XG4gICAgICAgIG91dGVyUmFkaXVzOiA0MCxcbiAgICAgICAgaW5uZXJSYWRpdXM6IDI1LFxuICAgICAgICBpbm5lcldpZHRoOiBNYXRoLlBJIC8gNiwgLy9pbiByYWRpYW5zXG4gICAgICAgIG91dGVyV2lkdGg6IE1hdGguUEkgLyA2LjIsIC8vaW4gcmFkaWFuc1xuICAgICAgICBvZmZzZXQ6IGkgKiBNYXRoLlBJIC8gNiwgLy9pbiByYWRpYW5zXG4gICAgICAgIGNvbG9yOiByYW5kb21JbnQoMHg2MTJmNjAsIDB4ZmZmZmZmKVxuICAgICAgfSk7XG4gICAgICB0aGlzLnJlbmRlcmVyLmFkZCh0ZXN0U2VnbWVudCk7XG5cbiAgICAgIHRoaXMucmVuZGVyZXIuZG9tRXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIodGVzdFNlZ21lbnQsICdtb3VzZW92ZXInLCBtb3VzZW92ZXJDYWxsYmFjaywgZmFsc2UpO1xuXG4gICAgICB0aGlzLnJlbmRlcmVyLmRvbUV2ZW50cy5hZGRFdmVudExpc3RlbmVyKHRlc3RTZWdtZW50LCAnY2xpY2snLCBjbGlja0NhbGxiYWNrLCBmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBEcmF3aW5nO1xufSgpO1xuXG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBIVE1MIENMQVNTRVNcbi8vICpcbi8vICogIEFueSBIVE1MIGNvbnRyb2xsaW5nIGNsYXNzZXMgZ28gaGVyZVxuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBDRU5UUkVDSVJDTEUgQ0xBU1Ncbi8vICpcbi8vICogIFRoaXMgY29udHJvbHMgdGhlIGNlbnRyZSBjaXJjbGUgbGF5b3V0XG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG52YXIgQ2VudHJlQ2lyY2xlID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBDZW50cmVDaXJjbGUoKSB7XG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIENlbnRyZUNpcmNsZSk7XG5cbiAgICB0aGlzLmVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2VudHJlQ2lyY2xlJyk7XG4gICAgdGhpcy5sYXlvdXQoKTtcbiAgfVxuXG4gIENlbnRyZUNpcmNsZS5wcm90b3R5cGUubGF5b3V0ID0gZnVuY3Rpb24gbGF5b3V0KCkge1xuICAgIHRoaXMuZWxlbS5zdHlsZS53aWR0aCA9IGxlbmd0aCg1MCkgKyAncHgnO1xuICAgIHRoaXMuZWxlbS5zdHlsZS5oZWlnaHQgPSBsZW5ndGgoNTApICsgJ3B4JztcbiAgfTtcblxuICByZXR1cm4gQ2VudHJlQ2lyY2xlO1xufSgpO1xuXG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBDRU5UUkVDSVJDTEVDT05URU5UUyBDTEFTU1xuLy8gKlxuLy8gKiAgVGhpcyBjb250cm9scyB0aGUgY2VudHJlIGNpcmNsZSBjb250ZW50c1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxudmFyIENlbnRyZUNpcmNsZUNvbnRlbnRzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBDZW50cmVDaXJjbGVDb250ZW50cygpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2VudHJlQ2lyY2xlQ29udGVudHMpO1xuXG4gICAgdGhpcy5lbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NlbnRyZUNpcmNsZUNvbnRlbnRzJyk7XG4gIH1cblxuICBDZW50cmVDaXJjbGVDb250ZW50cy5wcm90b3R5cGUuc3dpdGNoQ29udGVudHMgPSBmdW5jdGlvbiBzd2l0Y2hDb250ZW50cyhuZXdDb250ZW50c0ZpbGUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy9kb24ndCBsb2FkIHRoZSBzYW1lIGNvbnRlbnRzIHR3aWNlXG4gICAgaWYgKHRoaXMuY3VycmVudENvbnRlbnRzRmlsZSA9PT0gbmV3Q29udGVudHNGaWxlKSByZXR1cm47XG5cbiAgICB0aGlzLmN1cnJlbnRDb250ZW50c0ZpbGUgPSBuZXdDb250ZW50c0ZpbGU7XG4gICAgLy8gdXJsIChyZXF1aXJlZCksIG9wdGlvbnMgKG9wdGlvbmFsKVxuICAgIGZldGNoKG5ld0NvbnRlbnRzRmlsZSwge1xuICAgICAgbWV0aG9kOiAnZ2V0J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgIF90aGlzLmVsZW0uaW5uZXJIVE1MID0gaHRtbDtcbiAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCAnICsgbmV3Q29udGVudHNGaWxlKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gQ2VudHJlQ2lyY2xlQ29udGVudHM7XG59KCk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIENPTlRST0xMRVIgQ0xBU1Ncbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBDb250cm9sbGVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBDb250cm9sbGVyKCkge1xuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBDb250cm9sbGVyKTtcblxuICAgIHRoaXMubGF5b3V0ID0gbmV3IExheW91dENvbnRyb2xsZXIoKTtcbiAgICB0aGlzLnJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKCk7XG4gICAgdGhpcy5jZW50cmVDaXJjbGUgPSBuZXcgQ2VudHJlQ2lyY2xlKCk7XG4gICAgdGhpcy5DZW50cmVDaXJjbGVDb250ZW50cyA9IG5ldyBDZW50cmVDaXJjbGVDb250ZW50cygpO1xuICAgIHRoaXMuZHJhd2luZyA9IG5ldyBEcmF3aW5nKHRoaXMucmVuZGVyZXIpO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgQ29udHJvbGxlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIoKTtcblxuICAgIC8vVGhpcyB3aWxsIHVzZSBHU0FQIHJBRiBpbnN0ZWFkIG9mIFRIUkVFLmpzXG4gICAgLy9hbHNvIHJlbW92ZSByZXF1ZXN0IGFuaW1hdGlvbiBmcmFtZSBmcm9tIHJlbmRlciBmdW5jdGlvbiFcbiAgICAvL1R3ZWVuTWF4LnRpY2tlci5hZGRFdmVudExpc3RlbmVyKCd0aWNrJywgKCkgPT4gdGhpcy5yZW5kZXJlci5yZW5kZXIoKSk7XG5cbiAgICB0aGlzLkNlbnRyZUNpcmNsZUNvbnRlbnRzLnN3aXRjaENvbnRlbnRzKCcuL2h0bWxfY29tcG9uZW50cy9jZW50cmVfY2lyY2xlL3Rlc3QuaHRtbCcpO1xuICB9O1xuXG4gIC8vdG8gdXNlIHRoaXMgYWRkIGJ1dHRvbnMgd2l0aCB0aGUgY2xhc3NlcyBiZWxvd1xuXG5cbiAgQ29udHJvbGxlci5wcm90b3R5cGUuc2F2ZUltYWdlQnV0dG9ucyA9IGZ1bmN0aW9uIHNhdmVJbWFnZUJ1dHRvbnMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzYXZlLWltYWdlJykub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfdGhpcy5yZW5kZXIuc2F2ZUltYWdlKCk7XG4gICAgfTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZG93bmxvYWQtaW1hZ2UnKS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLnJlbmRlci5kb3dubG9hZEltYWdlKCk7XG4gICAgfTtcbiAgfTtcblxuICByZXR1cm4gQ29udHJvbGxlcjtcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgIFBPTFlGSUxMU1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICAgU0VUVVBcbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxudmFyIGNvbnRyb2xsZXIgPSB2b2lkIDA7XG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTtcbn07XG5cbndpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy9jb250cm9sbGVyLm9uUmVzaXplKCk7XG59OyIsIlxudmFyIHZlcnQgPSBcIiNkZWZpbmUgR0xTTElGWSAxXFxuYXR0cmlidXRlIHZlYzMgcG9zaXRpb247XFxudW5pZm9ybSBtYXQ0IG1vZGVsVmlld01hdHJpeDtcXG51bmlmb3JtIG1hdDQgcHJvamVjdGlvbk1hdHJpeDtcXG52YXJ5aW5nIHZlYzIgdlV2O1xcbnZvaWQgbWFpbigpIHtcXG4gIGdsX1Bvc2l0aW9uID0gdmVjNChwb3NpdGlvbiwgMS4wKTtcXG4gIHZVdiA9IHZlYzIocG9zaXRpb24ueCwgcG9zaXRpb24ueSkgKiAwLjUgKyAwLjU7XFxufVwiXG52YXIgZnJhZyA9IFwicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XFxuI2RlZmluZSBHTFNMSUZZIDFcXG4vL1xcbi8vIEdMU0wgdGV4dHVyZWxlc3MgY2xhc3NpYyAzRCBub2lzZSBcXFwiY25vaXNlXFxcIixcXG4vLyB3aXRoIGFuIFJTTC1zdHlsZSBwZXJpb2RpYyB2YXJpYW50IFxcXCJwbm9pc2VcXFwiLlxcbi8vIEF1dGhvcjogIFN0ZWZhbiBHdXN0YXZzb24gKHN0ZWZhbi5ndXN0YXZzb25AbGl1LnNlKVxcbi8vIFZlcnNpb246IDIwMTEtMTAtMTFcXG4vL1xcbi8vIE1hbnkgdGhhbmtzIHRvIElhbiBNY0V3YW4gb2YgQXNoaW1hIEFydHMgZm9yIHRoZVxcbi8vIGlkZWFzIGZvciBwZXJtdXRhdGlvbiBhbmQgZ3JhZGllbnQgc2VsZWN0aW9uLlxcbi8vXFxuLy8gQ29weXJpZ2h0IChjKSAyMDExIFN0ZWZhbiBHdXN0YXZzb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXFxuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLiBTZWUgTElDRU5TRSBmaWxlLlxcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzE2MDQxNTA1NTkodmVjMyB4KVxcbntcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgbW9kMjg5XzE2MDQxNTA1NTkodmVjNCB4KVxcbntcXG4gIHJldHVybiB4IC0gZmxvb3IoeCAqICgxLjAgLyAyODkuMCkpICogMjg5LjA7XFxufVxcblxcbnZlYzQgcGVybXV0ZV8xNjA0MTUwNTU5KHZlYzQgeClcXG57XFxuICByZXR1cm4gbW9kMjg5XzE2MDQxNTA1NTkoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8xNjA0MTUwNTU5KHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG52ZWMzIGZhZGVfMTYwNDE1MDU1OSh2ZWMzIHQpIHtcXG4gIHJldHVybiB0KnQqdCoodCoodCo2LjAtMTUuMCkrMTAuMCk7XFxufVxcblxcbi8vIENsYXNzaWMgUGVybGluIG5vaXNlLCBwZXJpb2RpYyB2YXJpYW50XFxuZmxvYXQgcG5vaXNlXzE2MDQxNTA1NTkodmVjMyBQLCB2ZWMzIHJlcClcXG57XFxuICB2ZWMzIFBpMCA9IG1vZChmbG9vcihQKSwgcmVwKTsgLy8gSW50ZWdlciBwYXJ0LCBtb2R1bG8gcGVyaW9kXFxuICB2ZWMzIFBpMSA9IG1vZChQaTAgKyB2ZWMzKDEuMCksIHJlcCk7IC8vIEludGVnZXIgcGFydCArIDEsIG1vZCBwZXJpb2RcXG4gIFBpMCA9IG1vZDI4OV8xNjA0MTUwNTU5KFBpMCk7XFxuICBQaTEgPSBtb2QyODlfMTYwNDE1MDU1OShQaTEpO1xcbiAgdmVjMyBQZjAgPSBmcmFjdChQKTsgLy8gRnJhY3Rpb25hbCBwYXJ0IGZvciBpbnRlcnBvbGF0aW9uXFxuICB2ZWMzIFBmMSA9IFBmMCAtIHZlYzMoMS4wKTsgLy8gRnJhY3Rpb25hbCBwYXJ0IC0gMS4wXFxuICB2ZWM0IGl4ID0gdmVjNChQaTAueCwgUGkxLngsIFBpMC54LCBQaTEueCk7XFxuICB2ZWM0IGl5ID0gdmVjNChQaTAueXksIFBpMS55eSk7XFxuICB2ZWM0IGl6MCA9IFBpMC56enp6O1xcbiAgdmVjNCBpejEgPSBQaTEuenp6ejtcXG5cXG4gIHZlYzQgaXh5ID0gcGVybXV0ZV8xNjA0MTUwNTU5KHBlcm11dGVfMTYwNDE1MDU1OShpeCkgKyBpeSk7XFxuICB2ZWM0IGl4eTAgPSBwZXJtdXRlXzE2MDQxNTA1NTkoaXh5ICsgaXowKTtcXG4gIHZlYzQgaXh5MSA9IHBlcm11dGVfMTYwNDE1MDU1OShpeHkgKyBpejEpO1xcblxcbiAgdmVjNCBneDAgPSBpeHkwICogKDEuMCAvIDcuMCk7XFxuICB2ZWM0IGd5MCA9IGZyYWN0KGZsb29yKGd4MCkgKiAoMS4wIC8gNy4wKSkgLSAwLjU7XFxuICBneDAgPSBmcmFjdChneDApO1xcbiAgdmVjNCBnejAgPSB2ZWM0KDAuNSkgLSBhYnMoZ3gwKSAtIGFicyhneTApO1xcbiAgdmVjNCBzejAgPSBzdGVwKGd6MCwgdmVjNCgwLjApKTtcXG4gIGd4MCAtPSBzejAgKiAoc3RlcCgwLjAsIGd4MCkgLSAwLjUpO1xcbiAgZ3kwIC09IHN6MCAqIChzdGVwKDAuMCwgZ3kwKSAtIDAuNSk7XFxuXFxuICB2ZWM0IGd4MSA9IGl4eTEgKiAoMS4wIC8gNy4wKTtcXG4gIHZlYzQgZ3kxID0gZnJhY3QoZmxvb3IoZ3gxKSAqICgxLjAgLyA3LjApKSAtIDAuNTtcXG4gIGd4MSA9IGZyYWN0KGd4MSk7XFxuICB2ZWM0IGd6MSA9IHZlYzQoMC41KSAtIGFicyhneDEpIC0gYWJzKGd5MSk7XFxuICB2ZWM0IHN6MSA9IHN0ZXAoZ3oxLCB2ZWM0KDAuMCkpO1xcbiAgZ3gxIC09IHN6MSAqIChzdGVwKDAuMCwgZ3gxKSAtIDAuNSk7XFxuICBneTEgLT0gc3oxICogKHN0ZXAoMC4wLCBneTEpIC0gMC41KTtcXG5cXG4gIHZlYzMgZzAwMCA9IHZlYzMoZ3gwLngsZ3kwLngsZ3owLngpO1xcbiAgdmVjMyBnMTAwID0gdmVjMyhneDAueSxneTAueSxnejAueSk7XFxuICB2ZWMzIGcwMTAgPSB2ZWMzKGd4MC56LGd5MC56LGd6MC56KTtcXG4gIHZlYzMgZzExMCA9IHZlYzMoZ3gwLncsZ3kwLncsZ3owLncpO1xcbiAgdmVjMyBnMDAxID0gdmVjMyhneDEueCxneTEueCxnejEueCk7XFxuICB2ZWMzIGcxMDEgPSB2ZWMzKGd4MS55LGd5MS55LGd6MS55KTtcXG4gIHZlYzMgZzAxMSA9IHZlYzMoZ3gxLnosZ3kxLnosZ3oxLnopO1xcbiAgdmVjMyBnMTExID0gdmVjMyhneDEudyxneTEudyxnejEudyk7XFxuXFxuICB2ZWM0IG5vcm0wID0gdGF5bG9ySW52U3FydF8xNjA0MTUwNTU5KHZlYzQoZG90KGcwMDAsIGcwMDApLCBkb3QoZzAxMCwgZzAxMCksIGRvdChnMTAwLCBnMTAwKSwgZG90KGcxMTAsIGcxMTApKSk7XFxuICBnMDAwICo9IG5vcm0wLng7XFxuICBnMDEwICo9IG5vcm0wLnk7XFxuICBnMTAwICo9IG5vcm0wLno7XFxuICBnMTEwICo9IG5vcm0wLnc7XFxuICB2ZWM0IG5vcm0xID0gdGF5bG9ySW52U3FydF8xNjA0MTUwNTU5KHZlYzQoZG90KGcwMDEsIGcwMDEpLCBkb3QoZzAxMSwgZzAxMSksIGRvdChnMTAxLCBnMTAxKSwgZG90KGcxMTEsIGcxMTEpKSk7XFxuICBnMDAxICo9IG5vcm0xLng7XFxuICBnMDExICo9IG5vcm0xLnk7XFxuICBnMTAxICo9IG5vcm0xLno7XFxuICBnMTExICo9IG5vcm0xLnc7XFxuXFxuICBmbG9hdCBuMDAwID0gZG90KGcwMDAsIFBmMCk7XFxuICBmbG9hdCBuMTAwID0gZG90KGcxMDAsIHZlYzMoUGYxLngsIFBmMC55eikpO1xcbiAgZmxvYXQgbjAxMCA9IGRvdChnMDEwLCB2ZWMzKFBmMC54LCBQZjEueSwgUGYwLnopKTtcXG4gIGZsb2F0IG4xMTAgPSBkb3QoZzExMCwgdmVjMyhQZjEueHksIFBmMC56KSk7XFxuICBmbG9hdCBuMDAxID0gZG90KGcwMDEsIHZlYzMoUGYwLnh5LCBQZjEueikpO1xcbiAgZmxvYXQgbjEwMSA9IGRvdChnMTAxLCB2ZWMzKFBmMS54LCBQZjAueSwgUGYxLnopKTtcXG4gIGZsb2F0IG4wMTEgPSBkb3QoZzAxMSwgdmVjMyhQZjAueCwgUGYxLnl6KSk7XFxuICBmbG9hdCBuMTExID0gZG90KGcxMTEsIFBmMSk7XFxuXFxuICB2ZWMzIGZhZGVfeHl6ID0gZmFkZV8xNjA0MTUwNTU5KFBmMCk7XFxuICB2ZWM0IG5feiA9IG1peCh2ZWM0KG4wMDAsIG4xMDAsIG4wMTAsIG4xMTApLCB2ZWM0KG4wMDEsIG4xMDEsIG4wMTEsIG4xMTEpLCBmYWRlX3h5ei56KTtcXG4gIHZlYzIgbl95eiA9IG1peChuX3oueHksIG5fei56dywgZmFkZV94eXoueSk7XFxuICBmbG9hdCBuX3h5eiA9IG1peChuX3l6LngsIG5feXoueSwgZmFkZV94eXoueCk7XFxuICByZXR1cm4gMi4yICogbl94eXo7XFxufVxcblxcbi8vXFxuLy8gRGVzY3JpcHRpb24gOiBBcnJheSBhbmQgdGV4dHVyZWxlc3MgR0xTTCAyRC8zRC80RCBzaW1wbGV4XFxuLy8gICAgICAgICAgICAgICBub2lzZSBmdW5jdGlvbnMuXFxuLy8gICAgICBBdXRob3IgOiBJYW4gTWNFd2FuLCBBc2hpbWEgQXJ0cy5cXG4vLyAgTWFpbnRhaW5lciA6IGlqbVxcbi8vICAgICBMYXN0bW9kIDogMjAxMTA4MjIgKGlqbSlcXG4vLyAgICAgTGljZW5zZSA6IENvcHlyaWdodCAoQykgMjAxMSBBc2hpbWEgQXJ0cy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cXG4vLyAgICAgICAgICAgICAgIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExJQ0VOU0UgZmlsZS5cXG4vLyAgICAgICAgICAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG4vL1xcblxcbnZlYzMgbW9kMjg5XzExMTc1Njk1OTkodmVjMyB4KSB7XFxuICByZXR1cm4geCAtIGZsb29yKHggKiAoMS4wIC8gMjg5LjApKSAqIDI4OS4wO1xcbn1cXG5cXG52ZWM0IG1vZDI4OV8xMTE3NTY5NTk5KHZlYzQgeCkge1xcbiAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG59XFxuXFxudmVjNCBwZXJtdXRlXzExMTc1Njk1OTkodmVjNCB4KSB7XFxuICAgICByZXR1cm4gbW9kMjg5XzExMTc1Njk1OTkoKCh4KjM0LjApKzEuMCkqeCk7XFxufVxcblxcbnZlYzQgdGF5bG9ySW52U3FydF8xMTE3NTY5NTk5KHZlYzQgcilcXG57XFxuICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcbn1cXG5cXG5mbG9hdCBzbm9pc2VfMTExNzU2OTU5OSh2ZWMzIHYpXFxuICB7XFxuICBjb25zdCB2ZWMyICBDID0gdmVjMigxLjAvNi4wLCAxLjAvMy4wKSA7XFxuICBjb25zdCB2ZWM0ICBEXzExMTc1Njk1OTkgPSB2ZWM0KDAuMCwgMC41LCAxLjAsIDIuMCk7XFxuXFxuLy8gRmlyc3QgY29ybmVyXFxuICB2ZWMzIGkgID0gZmxvb3IodiArIGRvdCh2LCBDLnl5eSkgKTtcXG4gIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXFxuLy8gT3RoZXIgY29ybmVyc1xcbiAgdmVjMyBnXzExMTc1Njk1OTkgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG4gIHZlYzMgbCA9IDEuMCAtIGdfMTExNzU2OTU5OTtcXG4gIHZlYzMgaTEgPSBtaW4oIGdfMTExNzU2OTU5OS54eXosIGwuenh5ICk7XFxuICB2ZWMzIGkyID0gbWF4KCBnXzExMTc1Njk1OTkueHl6LCBsLnp4eSApO1xcblxcbiAgLy8gICB4MCA9IHgwIC0gMC4wICsgMC4wICogQy54eHg7XFxuICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG4gIC8vICAgeDIgPSB4MCAtIGkyICArIDIuMCAqIEMueHh4O1xcbiAgLy8gICB4MyA9IHgwIC0gMS4wICsgMy4wICogQy54eHg7XFxuICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcbiAgdmVjMyB4MiA9IHgwIC0gaTIgKyBDLnl5eTsgLy8gMi4wKkMueCA9IDEvMyA9IEMueVxcbiAgdmVjMyB4MyA9IHgwIC0gRF8xMTE3NTY5NTk5Lnl5eTsgICAgICAvLyAtMS4wKzMuMCpDLnggPSAtMC41ID0gLUQueVxcblxcbi8vIFBlcm11dGF0aW9uc1xcbiAgaSA9IG1vZDI4OV8xMTE3NTY5NTk5KGkpO1xcbiAgdmVjNCBwID0gcGVybXV0ZV8xMTE3NTY5NTk5KCBwZXJtdXRlXzExMTc1Njk1OTkoIHBlcm11dGVfMTExNzU2OTU5OShcXG4gICAgICAgICAgICAgaS56ICsgdmVjNCgwLjAsIGkxLnosIGkyLnosIDEuMCApKVxcbiAgICAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuICAgICAgICAgICArIGkueCArIHZlYzQoMC4wLCBpMS54LCBpMi54LCAxLjAgKSk7XFxuXFxuLy8gR3JhZGllbnRzOiA3eDcgcG9pbnRzIG92ZXIgYSBzcXVhcmUsIG1hcHBlZCBvbnRvIGFuIG9jdGFoZWRyb24uXFxuLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcbiAgZmxvYXQgbl8gPSAwLjE0Mjg1NzE0Mjg1NzsgLy8gMS4wLzcuMFxcbiAgdmVjMyAgbnMgPSBuXyAqIERfMTExNzU2OTU5OS53eXogLSBEXzExMTc1Njk1OTkueHp4O1xcblxcbiAgdmVjNCBqID0gcCAtIDQ5LjAgKiBmbG9vcihwICogbnMueiAqIG5zLnopOyAgLy8gIG1vZChwLDcqNylcXG5cXG4gIHZlYzQgeF8gPSBmbG9vcihqICogbnMueik7XFxuICB2ZWM0IHlfID0gZmxvb3IoaiAtIDcuMCAqIHhfICk7ICAgIC8vIG1vZChqLE4pXFxuXFxuICB2ZWM0IHggPSB4XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IHkgPSB5XyAqbnMueCArIG5zLnl5eXk7XFxuICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXFxuICB2ZWM0IGIwID0gdmVjNCggeC54eSwgeS54eSApO1xcbiAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cXG4gIC8vdmVjNCBzMCA9IHZlYzQobGVzc1RoYW4oYjAsMC4wKSkqMi4wIC0gMS4wO1xcbiAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuICB2ZWM0IHMwID0gZmxvb3IoYjApKjIuMCArIDEuMDtcXG4gIHZlYzQgczEgPSBmbG9vcihiMSkqMi4wICsgMS4wO1xcbiAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXFxuICB2ZWM0IGEwID0gYjAueHp5dyArIHMwLnh6eXcqc2gueHh5eSA7XFxuICB2ZWM0IGExXzExMTc1Njk1OTkgPSBiMS54enl3ICsgczEueHp5dypzaC56end3IDtcXG5cXG4gIHZlYzMgcDBfMTExNzU2OTU5OSA9IHZlYzMoYTAueHksaC54KTtcXG4gIHZlYzMgcDEgPSB2ZWMzKGEwLnp3LGgueSk7XFxuICB2ZWMzIHAyID0gdmVjMyhhMV8xMTE3NTY5NTk5Lnh5LGgueik7XFxuICB2ZWMzIHAzID0gdmVjMyhhMV8xMTE3NTY5NTk5Lnp3LGgudyk7XFxuXFxuLy9Ob3JtYWxpc2UgZ3JhZGllbnRzXFxuICB2ZWM0IG5vcm0gPSB0YXlsb3JJbnZTcXJ0XzExMTc1Njk1OTkodmVjNChkb3QocDBfMTExNzU2OTU5OSxwMF8xMTE3NTY5NTk5KSwgZG90KHAxLHAxKSwgZG90KHAyLCBwMiksIGRvdChwMyxwMykpKTtcXG4gIHAwXzExMTc1Njk1OTkgKj0gbm9ybS54O1xcbiAgcDEgKj0gbm9ybS55O1xcbiAgcDIgKj0gbm9ybS56O1xcbiAgcDMgKj0gbm9ybS53O1xcblxcbi8vIE1peCBmaW5hbCBub2lzZSB2YWx1ZVxcbiAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuICBtID0gbSAqIG07XFxuICByZXR1cm4gNDIuMCAqIGRvdCggbSptLCB2ZWM0KCBkb3QocDBfMTExNzU2OTU5OSx4MCksIGRvdChwMSx4MSksXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3QocDIseDIpLCBkb3QocDMseDMpICkgKTtcXG4gIH1cXG5cXG5mbG9hdCBncmFpbl8yMjgxODMxMTIzKHZlYzIgdGV4Q29vcmQsIHZlYzIgcmVzb2x1dGlvbiwgZmxvYXQgZnJhbWUsIGZsb2F0IG11bHRpcGxpZXIpIHtcXG4gICAgdmVjMiBtdWx0ID0gdGV4Q29vcmQgKiByZXNvbHV0aW9uO1xcbiAgICBmbG9hdCBvZmZzZXQgPSBzbm9pc2VfMTExNzU2OTU5OSh2ZWMzKG11bHQgLyBtdWx0aXBsaWVyLCBmcmFtZSkpO1xcbiAgICBmbG9hdCBuMSA9IHBub2lzZV8xNjA0MTUwNTU5KHZlYzMobXVsdCwgb2Zmc2V0KSwgdmVjMygxLjAvdGV4Q29vcmQgKiByZXNvbHV0aW9uLCAxLjApKTtcXG4gICAgcmV0dXJuIG4xIC8gMi4wICsgMC41O1xcbn1cXG5cXG5mbG9hdCBncmFpbl8yMjgxODMxMTIzKHZlYzIgdGV4Q29vcmQsIHZlYzIgcmVzb2x1dGlvbiwgZmxvYXQgZnJhbWUpIHtcXG4gICAgcmV0dXJuIGdyYWluXzIyODE4MzExMjModGV4Q29vcmQsIHJlc29sdXRpb24sIGZyYW1lLCAyLjUpO1xcbn1cXG5cXG5mbG9hdCBncmFpbl8yMjgxODMxMTIzKHZlYzIgdGV4Q29vcmQsIHZlYzIgcmVzb2x1dGlvbikge1xcbiAgICByZXR1cm4gZ3JhaW5fMjI4MTgzMTEyMyh0ZXhDb29yZCwgcmVzb2x1dGlvbiwgMC4wKTtcXG59XFxuXFxudmVjMyBibGVuZFNvZnRMaWdodF8xNTQwMjU5MTMwKHZlYzMgYmFzZSwgdmVjMyBibGVuZCkge1xcbiAgICByZXR1cm4gbWl4KFxcbiAgICAgICAgc3FydChiYXNlKSAqICgyLjAgKiBibGVuZCAtIDEuMCkgKyAyLjAgKiBiYXNlICogKDEuMCAtIGJsZW5kKSwgXFxuICAgICAgICAyLjAgKiBiYXNlICogYmxlbmQgKyBiYXNlICogYmFzZSAqICgxLjAgLSAyLjAgKiBibGVuZCksIFxcbiAgICAgICAgc3RlcChiYXNlLCB2ZWMzKDAuNSkpXFxuICAgICk7XFxufVxcblxcbi8vIFVzaW5nIGNvbmRpdGlvbmFsc1xcbi8vIHZlYzMgYmxlbmRTb2Z0TGlnaHQodmVjMyBiYXNlLCB2ZWMzIGJsZW5kKSB7XFxuLy8gICAgIHJldHVybiB2ZWMzKFxcbi8vICAgICAgICAgKChibGVuZC5yIDwgMC41KSA/ICgyLjAgKiBiYXNlLnIgKiBibGVuZC5yICsgYmFzZS5yICogYmFzZS5yICogKDEuMCAtIDIuMCAqIGJsZW5kLnIpKSA6IChzcXJ0KGJhc2UucikgKiAoMi4wICogYmxlbmQuciAtIDEuMCkgKyAyLjAgKiBiYXNlLnIgKiAoMS4wIC0gYmxlbmQucikpKSxcXG4vLyAgICAgICAgICgoYmxlbmQuZyA8IDAuNSkgPyAoMi4wICogYmFzZS5nICogYmxlbmQuZyArIGJhc2UuZyAqIGJhc2UuZyAqICgxLjAgLSAyLjAgKiBibGVuZC5nKSkgOiAoc3FydChiYXNlLmcpICogKDIuMCAqIGJsZW5kLmcgLSAxLjApICsgMi4wICogYmFzZS5nICogKDEuMCAtIGJsZW5kLmcpKSksXFxuLy8gICAgICAgICAoKGJsZW5kLmIgPCAwLjUpID8gKDIuMCAqIGJhc2UuYiAqIGJsZW5kLmIgKyBiYXNlLmIgKiBiYXNlLmIgKiAoMS4wIC0gMi4wICogYmxlbmQuYikpIDogKHNxcnQoYmFzZS5iKSAqICgyLjAgKiBibGVuZC5iIC0gMS4wKSArIDIuMCAqIGJhc2UuYiAqICgxLjAgLSBibGVuZC5iKSkpXFxuLy8gICAgICk7XFxuLy8gfVxcblxcbnVuaWZvcm0gdmVjMyBjb2xvcjE7XFxudW5pZm9ybSB2ZWMzIGNvbG9yMjtcXG51bmlmb3JtIGZsb2F0IGFzcGVjdDtcXG51bmlmb3JtIHZlYzIgb2Zmc2V0O1xcbnVuaWZvcm0gdmVjMiBzY2FsZTtcXG51bmlmb3JtIGZsb2F0IG5vaXNlQWxwaGE7XFxudW5pZm9ybSBib29sIGFzcGVjdENvcnJlY3Rpb247XFxudW5pZm9ybSBmbG9hdCBncmFpblNjYWxlO1xcbnVuaWZvcm0gZmxvYXQgZ3JhaW5UaW1lO1xcbnVuaWZvcm0gdmVjMiBzbW9vdGg7XFxuXFxudmFyeWluZyB2ZWMyIHZVdjtcXG5cXG52b2lkIG1haW4oKSB7XFxuICB2ZWMyIHEgPSB2ZWMyKHZVdiAtIDAuNSk7XFxuICBpZiAoYXNwZWN0Q29ycmVjdGlvbikge1xcbiAgICBxLnggKj0gYXNwZWN0O1xcbiAgfVxcbiAgcSAvPSBzY2FsZTtcXG4gIHEgLT0gb2Zmc2V0O1xcbiAgZmxvYXQgZHN0ID0gbGVuZ3RoKHEpO1xcbiAgZHN0ID0gc21vb3Roc3RlcChzbW9vdGgueCwgc21vb3RoLnksIGRzdCk7XFxuICB2ZWMzIGNvbG9yID0gbWl4KGNvbG9yMSwgY29sb3IyLCBkc3QpO1xcbiAgXFxuICBpZiAobm9pc2VBbHBoYSA+IDAuMCAmJiBncmFpblNjYWxlID4gMC4wKSB7XFxuICAgIGZsb2F0IGdTaXplID0gMS4wIC8gZ3JhaW5TY2FsZTtcXG4gICAgZmxvYXQgZyA9IGdyYWluXzIyODE4MzExMjModlV2LCB2ZWMyKGdTaXplICogYXNwZWN0LCBnU2l6ZSksIGdyYWluVGltZSk7XFxuICAgIHZlYzMgbm9pc2VDb2xvciA9IGJsZW5kU29mdExpZ2h0XzE1NDAyNTkxMzAoY29sb3IsIHZlYzMoZykpO1xcbiAgICBnbF9GcmFnQ29sb3IucmdiID0gbWl4KGNvbG9yLCBub2lzZUNvbG9yLCBub2lzZUFscGhhKTtcXG4gIH0gZWxzZSB7XFxuICAgIGdsX0ZyYWdDb2xvci5yZ2IgPSBjb2xvcjtcXG4gIH1cXG4gIGdsX0ZyYWdDb2xvci5hID0gMS4wO1xcbn1cIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJhY2tncm91bmRcbmZ1bmN0aW9uIGNyZWF0ZUJhY2tncm91bmQgKG9wdCkge1xuICBvcHQgPSBvcHQgfHwge31cbiAgdmFyIGdlb21ldHJ5ID0gb3B0Lmdlb21ldHJ5IHx8IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KDIsIDIsIDEpXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5SYXdTaGFkZXJNYXRlcmlhbCh7XG4gICAgdmVydGV4U2hhZGVyOiB2ZXJ0LFxuICAgIGZyYWdtZW50U2hhZGVyOiBmcmFnLFxuICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgdW5pZm9ybXM6IHtcbiAgICAgIGFzcGVjdENvcnJlY3Rpb246IHsgdHlwZTogJ2knLCB2YWx1ZTogZmFsc2UgfSxcbiAgICAgIGFzcGVjdDogeyB0eXBlOiAnZicsIHZhbHVlOiAxIH0sXG4gICAgICBncmFpblNjYWxlOiB7IHR5cGU6ICdmJywgdmFsdWU6IDAuMDA1IH0sXG4gICAgICBncmFpblRpbWU6IHsgdHlwZTogJ2YnLCB2YWx1ZTogMCB9LFxuICAgICAgbm9pc2VBbHBoYTogeyB0eXBlOiAnZicsIHZhbHVlOiAwLjI1IH0sXG4gICAgICBvZmZzZXQ6IHsgdHlwZTogJ3YyJywgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKDAsIDApIH0sXG4gICAgICBzY2FsZTogeyB0eXBlOiAndjInLCB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoMSwgMSkgfSxcbiAgICAgIHNtb290aDogeyB0eXBlOiAndjInLCB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIoMC4wLCAxLjApIH0sXG4gICAgICBjb2xvcjE6IHsgdHlwZTogJ2MnLCB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjZmZmJykgfSxcbiAgICAgIGNvbG9yMjogeyB0eXBlOiAnYycsIHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyMyODM4NDQnKSB9XG4gICAgfSxcbiAgICBkZXB0aFRlc3Q6IGZhbHNlXG4gIH0pXG4gIHZhciBtZXNoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKVxuICBtZXNoLnN0eWxlID0gc3R5bGVcbiAgaWYgKG9wdCkgbWVzaC5zdHlsZShvcHQpXG4gIHJldHVybiBtZXNoXG5cbiAgZnVuY3Rpb24gc3R5bGUgKG9wdCkge1xuICAgIG9wdCA9IG9wdCB8fCB7fVxuICAgIGlmIChBcnJheS5pc0FycmF5KG9wdC5jb2xvcnMpKSB7XG4gICAgICB2YXIgY29sb3JzID0gb3B0LmNvbG9ycy5tYXAoZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgYyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLkNvbG9yKGMpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNcbiAgICAgIH0pXG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2xvcjEudmFsdWUuY29weShjb2xvcnNbMF0pXG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5jb2xvcjIudmFsdWUuY29weShjb2xvcnNbMV0pXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0LmFzcGVjdCA9PT0gJ251bWJlcicpIHtcbiAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmFzcGVjdC52YWx1ZSA9IG9wdC5hc3BlY3RcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHQuZ3JhaW5TY2FsZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIG1hdGVyaWFsLnVuaWZvcm1zLmdyYWluU2NhbGUudmFsdWUgPSBvcHQuZ3JhaW5TY2FsZVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdC5ncmFpblRpbWUgPT09ICdudW1iZXInKSB7XG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5ncmFpblRpbWUudmFsdWUgPSBvcHQuZ3JhaW5UaW1lXG4gICAgfVxuICAgIGlmIChvcHQuc21vb3RoKSB7XG4gICAgICB2YXIgc21vb3RoID0gZnJvbUFycmF5KG9wdC5zbW9vdGgsIFRIUkVFLlZlY3RvcjIpXG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5zbW9vdGgudmFsdWUuY29weShzbW9vdGgpXG4gICAgfVxuICAgIGlmIChvcHQub2Zmc2V0KSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gZnJvbUFycmF5KG9wdC5vZmZzZXQsIFRIUkVFLlZlY3RvcjIpXG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5vZmZzZXQudmFsdWUuY29weShvZmZzZXQpXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygb3B0Lm5vaXNlQWxwaGEgPT09ICdudW1iZXInKSB7XG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5ub2lzZUFscGhhLnZhbHVlID0gb3B0Lm5vaXNlQWxwaGFcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHQuc2NhbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgc2NhbGUgPSBvcHQuc2NhbGVcbiAgICAgIGlmICh0eXBlb2Ygc2NhbGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHNjYWxlID0gWyBzY2FsZSwgc2NhbGUgXVxuICAgICAgfVxuICAgICAgc2NhbGUgPSBmcm9tQXJyYXkoc2NhbGUsIFRIUkVFLlZlY3RvcjIpXG4gICAgICBtYXRlcmlhbC51bmlmb3Jtcy5zY2FsZS52YWx1ZS5jb3B5KHNjYWxlKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdC5hc3BlY3RDb3JyZWN0aW9uICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgbWF0ZXJpYWwudW5pZm9ybXMuYXNwZWN0Q29ycmVjdGlvbi52YWx1ZSA9IEJvb2xlYW4ob3B0LmFzcGVjdENvcnJlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZnJvbUFycmF5IChhcnJheSwgVmVjdG9yVHlwZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycmF5KSkge1xuICAgICAgcmV0dXJuIG5ldyBWZWN0b3JUeXBlKCkuZnJvbUFycmF5KGFycmF5KVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlcbiAgfVxufVxuIl19
