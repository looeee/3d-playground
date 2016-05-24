import {
  xCoord,
  yCoord,
  length,
}
from './utility';
import {
  distance
}
from './universal/mathFunctions';
// * ***********************************************************************
// *
// *  OBJECTS SUPERCLASS
// *
// *************************************************************************
class Objects {
  constructor(spec) {
    spec.color = spec.color || 0xffffff;
    this.spec = spec;
    this.setPosition();
  }

  setPosition() {
    if (this.spec.x) this.spec.x = xCoord(this.spec.x);
    if (this.spec.y) this.spec.y = xCoord(this.spec.y);
  }

  createMeshMaterial() {
    return new THREE.MeshBasicMaterial({
      color: this.spec.color,
    });
  }

  createLineMaterial() {
    return new THREE.LineBasicMaterial({
      color: this.spec.color,
    });
  }

  createMesh(x, y, geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x;
    mesh.position.y = y;
    return mesh;
  }
}

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
export class Segment extends Objects {
  constructor(spec) {
    super(spec);
    this.spec = spec;
    this.setup();
    return new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: this.spec.color }));
  }

  setup() {
    this.spec.outerRadius = length(this.spec.outerRadius);
    this.spec.innerRadius = length(this.spec.innerRadius);
    this.buildShape();
    this.buildGeometry();
  }

  buildShape() {
    const endAngle = this.spec.offset + this.spec.width;
    const x1 = Math.cos(this.spec.offset) * this.spec.innerRadius;
    const y1 = Math.sin(this.spec.offset) * this.spec.innerRadius;
    const x2 = Math.cos(this.spec.offset) * this.spec.outerRadius;
    const y2 = Math.sin(this.spec.offset) * this.spec.outerRadius;
    const x3 = Math.cos(endAngle) * this.spec.innerRadius;
    const y3 = Math.sin(endAngle) * this.spec.innerRadius;

    this.shape = new THREE.Shape();
    this.shape.moveTo(x1, y1);
    this.shape.lineTo(x2, y2);
    this.shape.absarc(
      0, 0, //centre
      this.spec.outerRadius, //radius
      this.spec.offset, //startAngle
      endAngle, //endAngle
      true //clockwise
    );
    this.shape.lineTo(x3, y3);

    //this arc is going in the opposite direction so start/endAngle swapped
    this.shape.absarc(
      0, 0, //centre
      this.spec.innerRadius, //radius
      endAngle,
      this.spec.offset,
      true //clockwise
    );
  }

  buildGeometry() {
    this.geometry = new THREE.ShapeGeometry(this.shape);
  }
}

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
export class Disk extends Objects {
  constructor(spec) {
    super(spec);
    this.spec.radius = length(this.spec.radius);
    const geometry = new THREE.CircleGeometry(this.spec.radius, 100, 0, 2 * Math.PI);
    const material = this.createMeshMaterial(this.spec.color);
    return this.createMesh(this.spec.x, this.spec.y, geometry, material);
  }


}
// * ***********************************************************************
// *
// *  ARC CLASS
// *
// *************************************************************************
export class Arc extends Objects {
  constructor(spec) {
    super(spec);

    this.spec.rotation = this.spec.rotation || 0;
    this.spec.clockwise = this.spec.rotation || false;
    this.spec.points = this.spec.points || 50;

    const material = this.createLineMaterial(this.spec.color);
    const curve = new THREE.EllipseCurve(
      this.spec.x, this.spec.y,
      this.spec.xRadius, this.spec.yRadius,
      this.spec.startAngle, this.spec.endAngle,
      this.spec.clockwise,
      this.spec.rotation
    );

    const path = new THREE.Path(curve.getPoints(spec.points));
    const geometry = path.createPointsGeometry(spec.points);
    return new THREE.Line(geometry, material);
  }
}
