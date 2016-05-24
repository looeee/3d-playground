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

//import * as E from './universal/mathFunctions';
//import { Point, Circle } from './universal/universalElements';

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
    this.renderer.render(this.scene, this.camera);
  };

  return Renderer;
}();

/* UNUSED FUNCTIONS
  createMesh(geometry, color, textures, materialIndex, wireframe, elem) {
    if (wireframe === undefined) wireframe = false;
    if (color === undefined) color = 0xffffff;
    return new THREE.Mesh(geometry, this.pattern.materials[materialIndex]);
  }


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
//   width, //in radians
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
    var endAngle = this.spec.offset + this.spec.width;
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
    endAngle, //endAngle
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
    var callback = function (elem) {
      elem.intersect.object.material.color = new THREE.Color(randomInt(0x612f60, 0xffffff));
      elem.intersect.object.material.needsUpdate = true;
    };

    for (var i = 0; i < 12; i++) {
      var testSegment = new Segment({
        outerRadius: 40,
        innerRadius: 25,
        width: Math.PI / 6, //in radians
        offset: i * Math.PI / 6, //in radians
        color: randomInt(0x612f60, 0xffffff)
      });
      this.renderer.add(testSegment);

      this.renderer.domEvents.addEventListener(testSegment, 'mouseover', callback, false);
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