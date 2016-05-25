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
    //const testPass = new THREE.ShaderPass(THREE.ColorifyShader);
    //testPass.uniforms[ "color" ].value = new THREE.Color( 0xff0000 );
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

    console.log(this.postRenderer);
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
    this.camera.near = -2;
    this.camera.far = 1;
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

var Objects = function Objects(spec) {
  babelHelpers.classCallCheck(this, Objects);

  spec.color = spec.color || 0xffffff;
  this.spec = spec;
};

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
    return _ret = new THREE.Mesh(_this.geometry, new THREE.MeshBasicMaterial({ color: _this.spec.color })), babelHelpers.possibleConstructorReturn(_this, _ret);
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
    this.test();
  };

  Drawing.prototype.resize = function resize() {
    var _this = this;

    window.addEventListener('resize', function () {
      _this.init();
    }, false);
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
console.log('obj');
var controller = void 0;
window.onload = function () {
  controller = new Controller();
};

window.onresize = function () {
  //controller.onResize();
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJlczIwMTUvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJhYmVsSGVscGVycyA9IHt9O1xuXG5iYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxuYmFiZWxIZWxwZXJzLmluaGVyaXRzID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTtcblxuYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4gPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07XG5cbmJhYmVsSGVscGVycztcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgUE9TVFBST0NFU1NJTkcgQ0xBU1Ncbi8vICpcbi8vICogIFBvc3QgZWZmZWN0cyBmb3IgVEhSRUUuanNcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxudmFyIFBvc3Rwcm9jZXNzaW5nID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQb3N0cHJvY2Vzc2luZyhyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSkge1xuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBQb3N0cHJvY2Vzc2luZyk7XG5cbiAgICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xuICAgIHRoaXMuY2FtZXJhID0gY2FtZXJhO1xuICAgIGlmICghRGV0ZWN0b3Iud2ViZ2wpIERldGVjdG9yLmFkZEdldFdlYkdMTWVzc2FnZSgpO1xuXG4gICAgdmFyIHJlbmRlclBhc3MgPSBuZXcgVEhSRUUuUmVuZGVyUGFzcyhzY2VuZSwgY2FtZXJhKTtcbiAgICB2YXIgY29weVBhc3MgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyhUSFJFRS5Db3B5U2hhZGVyKTtcbiAgICBjb3B5UGFzcy5yZW5kZXJUb1NjcmVlbiA9IHRydWU7XG5cbiAgICB0aGlzLmNvbXBvc2VyID0gbmV3IFRIUkVFLkVmZmVjdENvbXBvc2VyKHJlbmRlcmVyKTtcbiAgICB0aGlzLmNvbXBvc2VyLmFkZFBhc3MocmVuZGVyUGFzcyk7XG5cbiAgICB0aGlzLmVmZmVjdHMoKTtcblxuICAgIHRoaXMuY29tcG9zZXIuYWRkUGFzcyhjb3B5UGFzcyk7XG5cbiAgICAvL3RoaXMuYW50aWFsaWFzKCk7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9zZXI7XG4gIH1cblxuICBQb3N0cHJvY2Vzc2luZy5wcm90b3R5cGUuYW50aWFsaWFzID0gZnVuY3Rpb24gYW50aWFsaWFzKCkge1xuICAgIHZhciBtc2FhUmVuZGVyUGFzcyA9IG5ldyBUSFJFRS5NYW51YWxNU0FBUmVuZGVyUGFzcyh0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG4gICAgbXNhYVJlbmRlclBhc3Muc2FtcGxlTGV2ZWwgPSA0O1xuICAgIC8vbXNhYVJlbmRlclBhc3MudW5iaWFzZWQgPSB0cnVlO1xuICAgIHRoaXMuY29tcG9zZXIuYWRkUGFzcyhtc2FhUmVuZGVyUGFzcyk7XG4gIH07XG5cbiAgUG9zdHByb2Nlc3NpbmcucHJvdG90eXBlLmVmZmVjdHMgPSBmdW5jdGlvbiBlZmZlY3RzKCkge1xuICAgIC8vY29uc3QgdGVzdFBhc3MgPSBuZXcgVEhSRUUuU2hhZGVyUGFzcyhUSFJFRS5Db2xvcmlmeVNoYWRlcik7XG4gICAgLy90ZXN0UGFzcy51bmlmb3Jtc1sgXCJjb2xvclwiIF0udmFsdWUgPSBuZXcgVEhSRUUuQ29sb3IoIDB4ZmYwMDAwICk7XG4gICAgLy90aGlzLmNvbXBvc2VyLmFkZFBhc3ModGVzdFBhc3MpO1xuICB9O1xuXG4gIHJldHVybiBQb3N0cHJvY2Vzc2luZztcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgUkVOREVSRVIgQ0xBU1Ncbi8vICpcbi8vICogIENvbnRyb2xsZXIgZm9yIFRIUkVFLmpzXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cblxudmFyIFJlbmRlcmVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBSZW5kZXJlcihyZW5kZXJFbGVtKSB7XG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIFJlbmRlcmVyKTtcblxuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICB0aGlzLmluaXRDYW1lcmEoKTtcbiAgICB0aGlzLmluaXRSZW5kZXJlcihyZW5kZXJFbGVtKTtcbiAgICB0aGlzLnBvc3RSZW5kZXJlciA9IG5ldyBQb3N0cHJvY2Vzc2luZyh0aGlzLnJlbmRlcmVyLCB0aGlzLnNjZW5lLCB0aGlzLmNhbWVyYSk7XG5cbiAgICB0aGlzLnNob3dTdGF0cygpO1xuICAgIHRoaXMucmVzaXplKCk7XG4gICAgdGhpcy5zZXR1cERPTUV2ZW50cygpO1xuXG4gICAgY29uc29sZS5sb2codGhpcy5wb3N0UmVuZGVyZXIpO1xuICB9XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChtZXNoKSB7XG4gICAgdGhpcy5zY2VuZS5hZGQobWVzaCk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5jbGVhclNjZW5lKCk7XG4gICAgdGhpcy5wYXR0ZXJuID0gbnVsbDsgLy9yZXNldCBtYXRlcmlhbHM7XG4gICAgdGhpcy5zZXRDYW1lcmEoKTtcbiAgICB0aGlzLnNldFJlbmRlcmVyKCk7XG4gIH07XG5cbiAgLy9odHRwczovL2dpdGh1Yi5jb20vamVyb21lZXRpZW5uZS90aHJlZXguZG9tZXZlbnRzXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2V0dXBET01FdmVudHMgPSBmdW5jdGlvbiBzZXR1cERPTUV2ZW50cygpIHtcbiAgICB0aGlzLmRvbUV2ZW50cyA9IG5ldyBUSFJFRXguRG9tRXZlbnRzKHRoaXMuY2FtZXJhLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICB9O1xuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5jbGVhclNjZW5lKCk7XG4gICAgICBfdGhpcy5yZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgICAgLy90aGlzLmNhbWVyYS5hc3BlY3RcdD0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICBfdGhpcy5zZXRDYW1lcmEoKTtcbiAgICAgIC8vdGhpcy5jYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgIH0sIGZhbHNlKTtcbiAgfTtcblxuICAvL2NsZWFyIGFsbCBtZXNoZXMgZnJvbSB0aGUgc2NlbmUsIGJ1dCBwcmVzZXJ2ZSBjYW1lcmEvcmVuZGVyZXJcblxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5jbGVhclNjZW5lID0gZnVuY3Rpb24gY2xlYXJTY2VuZSgpIHtcbiAgICBmb3IgKHZhciBpID0gdGhpcy5zY2VuZS5jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIG9iamVjdCA9IHRoaXMuc2NlbmUuY2hpbGRyZW5baV07XG4gICAgICBpZiAob2JqZWN0LnR5cGUgPT09ICdNZXNoJykge1xuICAgICAgICBvYmplY3QuZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgICAgICBvYmplY3QubWF0ZXJpYWwuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLnNjZW5lLnJlbW92ZShvYmplY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuaW5pdENhbWVyYSA9IGZ1bmN0aW9uIGluaXRDYW1lcmEoKSB7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKCk7XG4gICAgdGhpcy5zZXRDYW1lcmEoKTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmNhbWVyYSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnNldENhbWVyYSA9IGZ1bmN0aW9uIHNldENhbWVyYSgpIHtcbiAgICB0aGlzLmNhbWVyYS5sZWZ0ID0gLXdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICB0aGlzLmNhbWVyYS5yaWdodCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcbiAgICB0aGlzLmNhbWVyYS50b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuICAgIHRoaXMuY2FtZXJhLmJvdHRvbSA9IC13aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xuICAgIHRoaXMuY2FtZXJhLm5lYXIgPSAtMjtcbiAgICB0aGlzLmNhbWVyYS5mYXIgPSAxO1xuICAgIHRoaXMuY2FtZXJhLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmNhbWVyYS51cGRhdGVQcm9qZWN0aW9uTWF0cml4KCk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmluaXRSZW5kZXJlciA9IGZ1bmN0aW9uIGluaXRSZW5kZXJlcihyZW5kZXJFbGVtKSB7XG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICAgIGFudGlhbGlhczogdHJ1ZVxuICAgIH0pO1xuICAgIC8vcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgICBpZiAocmVuZGVyRWxlbSkge1xuICAgICAgdGhpcy5yZW5kZXJlci5kb21FbGVtZW50ID0gcmVuZGVyRWxlbTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgIH1cbiAgICB0aGlzLnNldFJlbmRlcmVyKCk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnNldFJlbmRlcmVyID0gZnVuY3Rpb24gc2V0UmVuZGVyZXIoKSB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MDAwMDAwLCAxLjApO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgfTtcblxuICAvL3JlbmRlciB0byBpbWFnZSBlbGVtXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyVG9JbWFnZUVsZW0gPSBmdW5jdGlvbiByZW5kZXJUb0ltYWdlRWxlbShlbGVtKSB7XG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICAgIHRoaXMuYXBwZW5kSW1hZ2VUb0RvbShlbGVtKTtcbiAgICB0aGlzLmNsZWFyU2NlbmUoKTtcbiAgfTtcblxuICAvL2FsbG93cyBkcmF3aW5nIG9mIHRoZSBpbWFnZSBvbmNlIGFkZGluZyB0aGlzIGltYWdlIHRvIERPTSBlbGVtXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuYXBwZW5kSW1hZ2VUb0RvbSA9IGZ1bmN0aW9uIGFwcGVuZEltYWdlVG9Eb20oZWxlbSkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbSkuc2V0QXR0cmlidXRlKCdzcmMnLCB0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQudG9EYXRhVVJMKCkpO1xuICB9O1xuXG4gIC8vRG93bmxvYWQgdGhlIGNhbnZhcyBhcyBhIHBuZyBpbWFnZVxuXG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmRvd25sb2FkSW1hZ2UgPSBmdW5jdGlvbiBkb3dubG9hZEltYWdlKCkge1xuICAgIHZhciBsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Rvd25sb2FkLWltYWdlJyk7XG4gICAgbGluay5ocmVmID0gdGhpcy5yZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgpO1xuICAgIGxpbmsuZG93bmxvYWQgPSAnaHlwZXJib2xpYy10aWxpbmcucG5nJztcbiAgfTtcblxuICAvL2NvbnZlcnQgdGhlIGNhbnZhcyB0byBhIGJhc2U2NFVSTCBhbmQgc2VuZCB0byBzYXZlSW1hZ2UucGhwXG5cblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2F2ZUltYWdlID0gZnVuY3Rpb24gc2F2ZUltYWdlKCkge1xuICAgIHZhciBkYXRhID0gdGhpcy5yZW5kZXJlci5kb21FbGVtZW50LnRvRGF0YVVSTCgpO1xuICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhodHRwLm9wZW4oJ1BPU1QnLCAnc2F2ZUltYWdlLnBocCcsIHRydWUpO1xuICAgIHhodHRwLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB4aHR0cC5zZW5kKCdpbWc9JyArIGRhdGEpO1xuICB9O1xuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5hZGRCb3VuZGluZ0JveEhlbHBlciA9IGZ1bmN0aW9uIGFkZEJvdW5kaW5nQm94SGVscGVyKG1lc2gpIHtcbiAgICB2YXIgYm94ID0gbmV3IFRIUkVFLkJveEhlbHBlcihtZXNoKTtcbiAgICAvL2JveC51cGRhdGUoKTtcbiAgICB0aGlzLnNjZW5lLmFkZChib3gpO1xuICB9O1xuXG4gIC8vaW5jbHVkZSBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3N0YXRzLmpzL2Jsb2IvbWFzdGVyL2J1aWxkL3N0YXRzLm1pbi5qc1xuXG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnNob3dTdGF0cyA9IGZ1bmN0aW9uIHNob3dTdGF0cygpIHtcbiAgICB0aGlzLnN0YXRzID0gbmV3IFN0YXRzKCk7XG4gICAgdGhpcy5zdGF0cy5zaG93UGFuZWwoMCk7IC8vIDA6IGZwcywgMTogbXMsIDI6IG1iLCAzKzogY3VzdG9tXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnN0YXRzLmRvbSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzMi5yZW5kZXIoKTtcbiAgICB9KTtcbiAgICBpZiAodGhpcy5zdGF0cykgdGhpcy5zdGF0cy51cGRhdGUoKTtcbiAgICB0aGlzLnBvc3RSZW5kZXJlci5yZW5kZXIoKTtcbiAgfTtcblxuICByZXR1cm4gUmVuZGVyZXI7XG59KCk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIExBWU9VVCBDT05UUk9MTEVSIENMQVNTXG4vLyAqXG4vLyAqICBjb250cm9scyBwb3NpdGlvbi9sb2FkaW5nL2hpZGluZyBldGMuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG52YXIgTGF5b3V0Q29udHJvbGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgTGF5b3V0Q29udHJvbGxlcik7XG5cbiAgICB0aGlzLnNldHVwTGF5b3V0KCk7XG4gIH1cblxuICBMYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zZXR1cExheW91dCA9IGZ1bmN0aW9uIHNldHVwTGF5b3V0KCkge307XG5cbiAgTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUub25SZXNpemUgPSBmdW5jdGlvbiBvblJlc2l6ZSgpIHt9O1xuXG4gIExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmJvdHRvbVBhbmVsID0gZnVuY3Rpb24gYm90dG9tUGFuZWwoKSB7fTtcblxuICBMYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5oaWRlRWxlbWVudHMgPSBmdW5jdGlvbiBoaWRlRWxlbWVudHMoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGVsZW1lbnRzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBlbGVtZW50c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBlbGVtZW50cywgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5KF9pdGVyYXRvciksIF9pID0gMCwgX2l0ZXJhdG9yID0gX2lzQXJyYXkgPyBfaXRlcmF0b3IgOiBfaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSgpOzspIHtcbiAgICAgIHZhciBfcmVmO1xuXG4gICAgICBpZiAoX2lzQXJyYXkpIHtcbiAgICAgICAgaWYgKF9pID49IF9pdGVyYXRvci5sZW5ndGgpIGJyZWFrO1xuICAgICAgICBfcmVmID0gX2l0ZXJhdG9yW19pKytdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2kgPSBfaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICBpZiAoX2kuZG9uZSkgYnJlYWs7XG4gICAgICAgIF9yZWYgPSBfaS52YWx1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGVsZW1lbnQgPSBfcmVmO1xuXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICB9XG4gIH07XG5cbiAgTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc2hvd0VsZW1lbnRzID0gZnVuY3Rpb24gc2hvd0VsZW1lbnRzKCkge1xuICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgZWxlbWVudHMgPSBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgZWxlbWVudHNbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaXRlcmF0b3IyID0gZWxlbWVudHMsIF9pc0FycmF5MiA9IEFycmF5LmlzQXJyYXkoX2l0ZXJhdG9yMiksIF9pMiA9IDAsIF9pdGVyYXRvcjIgPSBfaXNBcnJheTIgPyBfaXRlcmF0b3IyIDogX2l0ZXJhdG9yMltTeW1ib2wuaXRlcmF0b3JdKCk7Oykge1xuICAgICAgdmFyIF9yZWYyO1xuXG4gICAgICBpZiAoX2lzQXJyYXkyKSB7XG4gICAgICAgIGlmIChfaTIgPj0gX2l0ZXJhdG9yMi5sZW5ndGgpIGJyZWFrO1xuICAgICAgICBfcmVmMiA9IF9pdGVyYXRvcjJbX2kyKytdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX2kyID0gX2l0ZXJhdG9yMi5uZXh0KCk7XG4gICAgICAgIGlmIChfaTIuZG9uZSkgYnJlYWs7XG4gICAgICAgIF9yZWYyID0gX2kyLnZhbHVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgZWxlbWVudCA9IF9yZWYyO1xuXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIExheW91dENvbnRyb2xsZXI7XG59KCk7XG5cbnZhciByYW5kb21JbnQgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XG59O1xuXG4vL1RoZSBmb2xsb3dpbmcgdGhyZWUgZnVuY3Rpb25zIGNvbnZlcnQgdmFsdWVzIGZyb20gcGVyY2VudGFnZXMgc3RhcnRpbmcgYXRcbi8vKDAsMCkgYm90dG9tIGxlZnQgdG8gKDEwMCwxMDApIHRvcCByaWdodCBzY3JlZW4gY29vcmRzXG52YXIgeFBlcmNlbnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAvIDEwMDtcbnZhciB5UGVyY2VudCA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDEwMDtcbi8vTGVuZ3RocyBhcmUgY2FsY3VsYXRlZCBmcm9tIGEgcGVyY2VudGFnZSBvZiBzY3JlZW4gd2lkdGhcbi8vb3IgaGVpZ2h0IGRlcGVuZGluZyBvbiB3aGljaCBpcyBzbWFsbGVyLiBUaGlzIG1lYW5zIHRoYXRcbi8vb2JqZWN0cyBhc3NpZ25lZCBhIGxlbmd0aCBvZiAxMDAgKG9yIGNpcmNsZXMgcmFkaXVzIDUwKVxuLy93aWxsIG5ldmVyIGJlIGRyYXduIG9mZiBzY3JlZW5cbnZhciBsZW5ndGggPSBmdW5jdGlvbiAobGVuKSB7XG4gIHJldHVybiB4UGVyY2VudCA8IHlQZXJjZW50ID8gbGVuICogeFBlcmNlbnQgOiBsZW4gKiB5UGVyY2VudDtcbn07XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIE9CSkVDVFMgU1VQRVJDTEFTU1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG52YXIgT2JqZWN0cyA9IGZ1bmN0aW9uIE9iamVjdHMoc3BlYykge1xuICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgT2JqZWN0cyk7XG5cbiAgc3BlYy5jb2xvciA9IHNwZWMuY29sb3IgfHwgMHhmZmZmZmY7XG4gIHRoaXMuc3BlYyA9IHNwZWM7XG59O1xuXG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBTRUdNRU5UIENMQVNTXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyBzcGVjID0ge1xuLy8gICBvdXRlclJhZGl1cyxcbi8vICAgaW5uZXJSYWRpdXMsXG4vLyAgIGlubmVyV2lkdGgsIC8vaW4gcmFkaWFuc1xuLy8gICBvdXRlcldpZHRoXG4vLyAgIG9mZnNldCwgLy9pbiByYWRpYW5zXG4vLyAgIG1hdGVyaWFsLFxuLy8gICBjb2xvcixcbi8vIH1cblxuXG52YXIgU2VnbWVudCA9IGZ1bmN0aW9uIChfT2JqZWN0cykge1xuICBiYWJlbEhlbHBlcnMuaW5oZXJpdHMoU2VnbWVudCwgX09iamVjdHMpO1xuXG4gIGZ1bmN0aW9uIFNlZ21lbnQoc3BlYykge1xuICAgIHZhciBfcmV0O1xuXG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIFNlZ21lbnQpO1xuXG4gICAgdmFyIF90aGlzID0gYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX09iamVjdHMuY2FsbCh0aGlzLCBzcGVjKSk7XG5cbiAgICBfdGhpcy5zZXR1cCgpO1xuICAgIHJldHVybiBfcmV0ID0gbmV3IFRIUkVFLk1lc2goX3RoaXMuZ2VvbWV0cnksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiBfdGhpcy5zcGVjLmNvbG9yIH0pKSwgYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMsIF9yZXQpO1xuICB9XG5cbiAgU2VnbWVudC5wcm90b3R5cGUuc2V0dXAgPSBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICB0aGlzLnNwZWMub3V0ZXJSYWRpdXMgPSBsZW5ndGgodGhpcy5zcGVjLm91dGVyUmFkaXVzKTtcbiAgICB0aGlzLnNwZWMuaW5uZXJSYWRpdXMgPSBsZW5ndGgodGhpcy5zcGVjLmlubmVyUmFkaXVzKTtcbiAgICB0aGlzLmJ1aWxkU2hhcGUoKTtcbiAgICB0aGlzLmJ1aWxkR2VvbWV0cnkoKTtcbiAgfTtcblxuICBTZWdtZW50LnByb3RvdHlwZS5idWlsZFNoYXBlID0gZnVuY3Rpb24gYnVpbGRTaGFwZSgpIHtcbiAgICB2YXIgZW5kQW5nbGUgPSB0aGlzLnNwZWMub2Zmc2V0ICsgdGhpcy5zcGVjLmlubmVyV2lkdGg7XG4gICAgdmFyIHgxID0gTWF0aC5jb3ModGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMuaW5uZXJSYWRpdXM7XG4gICAgdmFyIHkxID0gTWF0aC5zaW4odGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMuaW5uZXJSYWRpdXM7XG4gICAgdmFyIHgyID0gTWF0aC5jb3ModGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMub3V0ZXJSYWRpdXM7XG4gICAgdmFyIHkyID0gTWF0aC5zaW4odGhpcy5zcGVjLm9mZnNldCkgKiB0aGlzLnNwZWMub3V0ZXJSYWRpdXM7XG4gICAgdmFyIHgzID0gTWF0aC5jb3MoZW5kQW5nbGUpICogdGhpcy5zcGVjLmlubmVyUmFkaXVzO1xuICAgIHZhciB5MyA9IE1hdGguc2luKGVuZEFuZ2xlKSAqIHRoaXMuc3BlYy5pbm5lclJhZGl1cztcblxuICAgIHRoaXMuc2hhcGUgPSBuZXcgVEhSRUUuU2hhcGUoKTtcbiAgICB0aGlzLnNoYXBlLm1vdmVUbyh4MSwgeTEpO1xuICAgIHRoaXMuc2hhcGUubGluZVRvKHgyLCB5Mik7XG4gICAgdGhpcy5zaGFwZS5hYnNhcmMoMCwgMCwgLy9jZW50cmVcbiAgICB0aGlzLnNwZWMub3V0ZXJSYWRpdXMsIC8vcmFkaXVzXG4gICAgdGhpcy5zcGVjLm9mZnNldCwgLy9zdGFydEFuZ2xlXG4gICAgdGhpcy5zcGVjLm9mZnNldCArIHRoaXMuc3BlYy5vdXRlcldpZHRoLCAvL2VuZEFuZ2xlXG4gICAgdHJ1ZSAvL2Nsb2Nrd2lzZVxuICAgICk7XG4gICAgdGhpcy5zaGFwZS5saW5lVG8oeDMsIHkzKTtcblxuICAgIC8vdGhpcyBhcmMgaXMgZ29pbmcgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbiBzbyBzdGFydC9lbmRBbmdsZSBzd2FwcGVkXG4gICAgdGhpcy5zaGFwZS5hYnNhcmMoMCwgMCwgLy9jZW50cmVcbiAgICB0aGlzLnNwZWMuaW5uZXJSYWRpdXMsIC8vcmFkaXVzXG4gICAgZW5kQW5nbGUsIHRoaXMuc3BlYy5vZmZzZXQsIHRydWUgLy9jbG9ja3dpc2VcbiAgICApO1xuICB9O1xuXG4gIFNlZ21lbnQucHJvdG90eXBlLmJ1aWxkR2VvbWV0cnkgPSBmdW5jdGlvbiBidWlsZEdlb21ldHJ5KCkge1xuICAgIHRoaXMuZ2VvbWV0cnkgPSBuZXcgVEhSRUUuU2hhcGVHZW9tZXRyeSh0aGlzLnNoYXBlKTtcbiAgfTtcblxuICByZXR1cm4gU2VnbWVudDtcbn0oT2JqZWN0cyk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIERJU0sgQ0xBU1Ncbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIHNwZWMgPSB7XG4vLyAgIHJhZGl1cyxcbi8vICAgY29sb3IsXG4vLyAgIHgsXG4vLyAgIHlcbi8vIH1cbnZhciBEaXNrID0gZnVuY3Rpb24gKF9PYmplY3RzMikge1xuICBiYWJlbEhlbHBlcnMuaW5oZXJpdHMoRGlzaywgX09iamVjdHMyKTtcblxuICBmdW5jdGlvbiBEaXNrKHNwZWMpIHtcbiAgICB2YXIgX3JldDI7XG5cbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgRGlzayk7XG5cbiAgICB2YXIgX3RoaXMyID0gYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX09iamVjdHMyLmNhbGwodGhpcywgc3BlYykpO1xuXG4gICAgX3RoaXMyLnNwZWMucmFkaXVzID0gbGVuZ3RoKF90aGlzMi5zcGVjLnJhZGl1cyk7XG4gICAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkNpcmNsZUdlb21ldHJ5KF90aGlzMi5zcGVjLnJhZGl1cywgMTAwLCAwLCAyICogTWF0aC5QSSk7XG4gICAgdmFyIG1hdGVyaWFsID0gX3RoaXMyLmNyZWF0ZU1lc2hNYXRlcmlhbChfdGhpczIuc3BlYy5jb2xvcik7XG4gICAgcmV0dXJuIF9yZXQyID0gX3RoaXMyLmNyZWF0ZU1lc2goX3RoaXMyLnNwZWMueCwgX3RoaXMyLnNwZWMueSwgZ2VvbWV0cnksIG1hdGVyaWFsKSwgYmFiZWxIZWxwZXJzLnBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMyLCBfcmV0Mik7XG4gIH1cblxuICByZXR1cm4gRGlzaztcbn0oT2JqZWN0cyk7XG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICBBUkMgQ0xBU1Ncbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBBcmMgPSBmdW5jdGlvbiAoX09iamVjdHMzKSB7XG4gIGJhYmVsSGVscGVycy5pbmhlcml0cyhBcmMsIF9PYmplY3RzMyk7XG5cbiAgZnVuY3Rpb24gQXJjKHNwZWMpIHtcbiAgICB2YXIgX3JldDM7XG5cbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgQXJjKTtcblxuICAgIHZhciBfdGhpczMgPSBiYWJlbEhlbHBlcnMucG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfT2JqZWN0czMuY2FsbCh0aGlzLCBzcGVjKSk7XG5cbiAgICBfdGhpczMuc3BlYy5yb3RhdGlvbiA9IF90aGlzMy5zcGVjLnJvdGF0aW9uIHx8IDA7XG4gICAgX3RoaXMzLnNwZWMuY2xvY2t3aXNlID0gX3RoaXMzLnNwZWMucm90YXRpb24gfHwgZmFsc2U7XG4gICAgX3RoaXMzLnNwZWMucG9pbnRzID0gX3RoaXMzLnNwZWMucG9pbnRzIHx8IDUwO1xuXG4gICAgdmFyIG1hdGVyaWFsID0gX3RoaXMzLmNyZWF0ZUxpbmVNYXRlcmlhbChfdGhpczMuc3BlYy5jb2xvcik7XG4gICAgdmFyIGN1cnZlID0gbmV3IFRIUkVFLkVsbGlwc2VDdXJ2ZShfdGhpczMuc3BlYy54LCBfdGhpczMuc3BlYy55LCBfdGhpczMuc3BlYy54UmFkaXVzLCBfdGhpczMuc3BlYy55UmFkaXVzLCBfdGhpczMuc3BlYy5zdGFydEFuZ2xlLCBfdGhpczMuc3BlYy5lbmRBbmdsZSwgX3RoaXMzLnNwZWMuY2xvY2t3aXNlLCBfdGhpczMuc3BlYy5yb3RhdGlvbik7XG5cbiAgICB2YXIgcGF0aCA9IG5ldyBUSFJFRS5QYXRoKGN1cnZlLmdldFBvaW50cyhzcGVjLnBvaW50cykpO1xuICAgIHZhciBnZW9tZXRyeSA9IHBhdGguY3JlYXRlUG9pbnRzR2VvbWV0cnkoc3BlYy5wb2ludHMpO1xuICAgIHJldHVybiBfcmV0MyA9IG5ldyBUSFJFRS5MaW5lKGdlb21ldHJ5LCBtYXRlcmlhbCksIGJhYmVsSGVscGVycy5wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKF90aGlzMywgX3JldDMpO1xuICB9XG5cbiAgcmV0dXJuIEFyYztcbn0oT2JqZWN0cyk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIERSQVdJTkcgQ0xBU1Ncbi8vICpcbi8vICogIEhlcmUgd2Ugd2lsbCBjcmVhdGUgc29tZSBwcmV0dHkgdGhpbmdzLlxuLy8gKiAgTm90ZSB0aGF0IGFsbCBvYmplY3RzIGltcG9ydGVkIGZyb20gb2JqZWN0cy5qcyB3aWxsXG4vLyAqICBoYXZlIHNwZWMgYXR0cmlidXRlcyBjb252ZXJ0ZWQgdG8gc2NyZWVuIHBlcmNlbnRhZ2Vcbi8vICogIHBvc2l0aW9ucy9sZW5ndGhzIGdvaW5nIGZyb20gKDAsMCkgYm90dG9tIGxlZnQgdG9cbi8vICogICgxMDAsMTAwKSB0b3AgcmlnaHRcbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBEcmF3aW5nID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBEcmF3aW5nKHJlbmRlcmVyKSB7XG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIERyYXdpbmcpO1xuXG4gICAgdGhpcy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIHRoaXMucmVzaXplKCk7XG4gIH1cblxuICBEcmF3aW5nLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLnRlc3QoKTtcbiAgfTtcblxuICBEcmF3aW5nLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBfdGhpcy5pbml0KCk7XG4gICAgfSwgZmFsc2UpO1xuICB9O1xuXG4gIERyYXdpbmcucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbiB0ZXN0KCkge1xuICAgIHZhciBtb3VzZW92ZXJDYWxsYmFjayA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICBlbGVtLmludGVyc2VjdC5vYmplY3QubWF0ZXJpYWwuY29sb3IgPSBuZXcgVEhSRUUuQ29sb3IocmFuZG9tSW50KDB4NjEyZjYwLCAweGZmZmZmZikpO1xuICAgICAgZWxlbS5pbnRlcnNlY3Qub2JqZWN0Lm1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFyIGNsaWNrQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgY29uc29sZS5sb2coJ2NsaWNrIScpO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgIHZhciB0ZXN0U2VnbWVudCA9IG5ldyBTZWdtZW50KHtcbiAgICAgICAgb3V0ZXJSYWRpdXM6IDQwLFxuICAgICAgICBpbm5lclJhZGl1czogMjUsXG4gICAgICAgIGlubmVyV2lkdGg6IE1hdGguUEkgLyA2LCAvL2luIHJhZGlhbnNcbiAgICAgICAgb3V0ZXJXaWR0aDogTWF0aC5QSSAvIDYuMiwgLy9pbiByYWRpYW5zXG4gICAgICAgIG9mZnNldDogaSAqIE1hdGguUEkgLyA2LCAvL2luIHJhZGlhbnNcbiAgICAgICAgY29sb3I6IHJhbmRvbUludCgweDYxMmY2MCwgMHhmZmZmZmYpXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVuZGVyZXIuYWRkKHRlc3RTZWdtZW50KTtcblxuICAgICAgdGhpcy5yZW5kZXJlci5kb21FdmVudHMuYWRkRXZlbnRMaXN0ZW5lcih0ZXN0U2VnbWVudCwgJ21vdXNlb3ZlcicsIG1vdXNlb3ZlckNhbGxiYWNrLCBmYWxzZSk7XG5cbiAgICAgIHRoaXMucmVuZGVyZXIuZG9tRXZlbnRzLmFkZEV2ZW50TGlzdGVuZXIodGVzdFNlZ21lbnQsICdjbGljaycsIGNsaWNrQ2FsbGJhY2ssIGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIERyYXdpbmc7XG59KCk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIEhUTUwgQ0xBU1NFU1xuLy8gKlxuLy8gKiAgQW55IEhUTUwgY29udHJvbGxpbmcgY2xhc3NlcyBnbyBoZXJlXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIENFTlRSRUNJUkNMRSBDTEFTU1xuLy8gKlxuLy8gKiAgVGhpcyBjb250cm9scyB0aGUgY2VudHJlIGNpcmNsZSBsYXlvdXRcbi8vICpcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBDZW50cmVDaXJjbGUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENlbnRyZUNpcmNsZSgpIHtcbiAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2VudHJlQ2lyY2xlKTtcblxuICAgIHRoaXMuZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjZW50cmVDaXJjbGUnKTtcbiAgICB0aGlzLmxheW91dCgpO1xuICB9XG5cbiAgQ2VudHJlQ2lyY2xlLnByb3RvdHlwZS5sYXlvdXQgPSBmdW5jdGlvbiBsYXlvdXQoKSB7XG4gICAgdGhpcy5lbGVtLnN0eWxlLndpZHRoID0gbGVuZ3RoKDUwKSArICdweCc7XG4gICAgdGhpcy5lbGVtLnN0eWxlLmhlaWdodCA9IGxlbmd0aCg1MCkgKyAncHgnO1xuICB9O1xuXG4gIHJldHVybiBDZW50cmVDaXJjbGU7XG59KCk7XG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogIENFTlRSRUNJUkNMRUNPTlRFTlRTIENMQVNTXG4vLyAqXG4vLyAqICBUaGlzIGNvbnRyb2xzIHRoZSBjZW50cmUgY2lyY2xlIGNvbnRlbnRzXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG52YXIgQ2VudHJlQ2lyY2xlQ29udGVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENlbnRyZUNpcmNsZUNvbnRlbnRzKCkge1xuICAgIGJhYmVsSGVscGVycy5jbGFzc0NhbGxDaGVjayh0aGlzLCBDZW50cmVDaXJjbGVDb250ZW50cyk7XG5cbiAgICB0aGlzLmVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2VudHJlQ2lyY2xlQ29udGVudHMnKTtcbiAgfVxuXG4gIENlbnRyZUNpcmNsZUNvbnRlbnRzLnByb3RvdHlwZS5zd2l0Y2hDb250ZW50cyA9IGZ1bmN0aW9uIHN3aXRjaENvbnRlbnRzKG5ld0NvbnRlbnRzRmlsZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvL2Rvbid0IGxvYWQgdGhlIHNhbWUgY29udGVudHMgdHdpY2VcbiAgICBpZiAodGhpcy5jdXJyZW50Q29udGVudHNGaWxlID09PSBuZXdDb250ZW50c0ZpbGUpIHJldHVybjtcblxuICAgIHRoaXMuY3VycmVudENvbnRlbnRzRmlsZSA9IG5ld0NvbnRlbnRzRmlsZTtcbiAgICAvLyB1cmwgKHJlcXVpcmVkKSwgb3B0aW9ucyAob3B0aW9uYWwpXG4gICAgZmV0Y2gobmV3Q29udGVudHNGaWxlLCB7XG4gICAgICBtZXRob2Q6ICdnZXQnXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgfSkudGhlbihmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgX3RoaXMuZWxlbS5pbm5lckhUTUwgPSBodG1sO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkICcgKyBuZXdDb250ZW50c0ZpbGUpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBDZW50cmVDaXJjbGVDb250ZW50cztcbn0oKTtcblxuLy8gKiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gKlxuLy8gKiAgQ09OVFJPTExFUiBDTEFTU1xuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxudmFyIENvbnRyb2xsZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENvbnRyb2xsZXIoKSB7XG4gICAgYmFiZWxIZWxwZXJzLmNsYXNzQ2FsbENoZWNrKHRoaXMsIENvbnRyb2xsZXIpO1xuXG4gICAgdGhpcy5sYXlvdXQgPSBuZXcgTGF5b3V0Q29udHJvbGxlcigpO1xuICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIoKTtcbiAgICB0aGlzLmNlbnRyZUNpcmNsZSA9IG5ldyBDZW50cmVDaXJjbGUoKTtcbiAgICB0aGlzLkNlbnRyZUNpcmNsZUNvbnRlbnRzID0gbmV3IENlbnRyZUNpcmNsZUNvbnRlbnRzKCk7XG4gICAgdGhpcy5kcmF3aW5nID0gbmV3IERyYXdpbmcodGhpcy5yZW5kZXJlcik7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBDb250cm9sbGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcigpO1xuXG4gICAgLy9UaGlzIHdpbGwgdXNlIEdTQVAgckFGIGluc3RlYWQgb2YgVEhSRUUuanNcbiAgICAvL2Fsc28gcmVtb3ZlIHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lIGZyb20gcmVuZGVyIGZ1bmN0aW9uIVxuICAgIC8vVHdlZW5NYXgudGlja2VyLmFkZEV2ZW50TGlzdGVuZXIoJ3RpY2snLCAoKSA9PiB0aGlzLnJlbmRlcmVyLnJlbmRlcigpKTtcblxuICAgIHRoaXMuQ2VudHJlQ2lyY2xlQ29udGVudHMuc3dpdGNoQ29udGVudHMoJy4vaHRtbF9jb21wb25lbnRzL2NlbnRyZV9jaXJjbGUvdGVzdC5odG1sJyk7XG4gIH07XG5cbiAgLy90byB1c2UgdGhpcyBhZGQgYnV0dG9ucyB3aXRoIHRoZSBjbGFzc2VzIGJlbG93XG5cblxuICBDb250cm9sbGVyLnByb3RvdHlwZS5zYXZlSW1hZ2VCdXR0b25zID0gZnVuY3Rpb24gc2F2ZUltYWdlQnV0dG9ucygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NhdmUtaW1hZ2UnKS5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF90aGlzLnJlbmRlci5zYXZlSW1hZ2UoKTtcbiAgICB9O1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNkb3dubG9hZC1pbWFnZScpLm9uY2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX3RoaXMucmVuZGVyLmRvd25sb2FkSW1hZ2UoKTtcbiAgICB9O1xuICB9O1xuXG4gIHJldHVybiBDb250cm9sbGVyO1xufSgpO1xuXG4vLyAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyAqXG4vLyAqICAgUE9MWUZJTExTXG4vLyAqXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8vICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICpcbi8vICogICBTRVRVUFxuLy8gKlxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuY29uc29sZS5sb2coJ29iaicpO1xudmFyIGNvbnRyb2xsZXIgPSB2b2lkIDA7XG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICBjb250cm9sbGVyID0gbmV3IENvbnRyb2xsZXIoKTtcbn07XG5cbndpbmRvdy5vbnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy9jb250cm9sbGVyLm9uUmVzaXplKCk7XG59OyJdfQ==
