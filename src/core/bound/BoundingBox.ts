import { Frustum } from './Frustum';
import { IBound } from './IBound';
import { Object3D } from '../entities/Object3D';
import { Ray } from '../../math/Ray';
import { Vector3 } from '../../math/Vector3';

/**
 * BoundingBox
 * @internal
 * @group Core
 */
export class BoundingBox implements IBound {
    /**
     * The center of the bounding box.
     */
    public center: Vector3;
    /**
     *
     * The range of the bounding box. This is always half the size of these Bounds.
     */
    public extents: Vector3;
    /**
     *
     *  The maximum point of the box body. This always equals center+extensions.
     */
    public max: Vector3;
    /**
     *
     *  The minimum point of the box body. This always equals center extensions.
     */
    public min: Vector3;
    /**
     *
     * The total size of the box. This is always twice as much as extensions.
     */
    public size: Vector3;
    /**
     *
     * Create a new Bounds.
     * @param center the center of the box.
     * @param size The size of the box.
     */
    constructor(center: Vector3, size: Vector3) {
        this.center = center;
        this.extents = new Vector3(size.x / 2, size.y / 2, size.z / 2);
        this.size = size;
        this.max = this.center.add(this.extents);
        this.min = this.center.subtract(this.extents);
    }

    public setFromMinMax(min: Vector3, max: Vector3) {
        this.size = max.subtract(min);
        this.center = this.size.div(2.0).add(min);
        this.extents = new Vector3(this.size.x / 2, this.size.y / 2, this.size.z / 2);
        this.min = min;
        this.max = max;
    }

    public setFromCenterAndSize(center: Vector3, size: Vector3) {
        this.size = size;
        this.center = center;
        this.extents = new Vector3(this.size.x / 2, this.size.y / 2, this.size.z / 2);
        this.min = new Vector3(this.center.x + -this.extents.x, this.center.y + -this.extents.y, this.center.z + -this.extents.z);
        this.max = new Vector3(this.center.x + this.extents.x, this.center.y + this.extents.y, this.center.z + this.extents.z);
    }

    public containsFrustum(obj: Object3D, frustum: Frustum) {
        return frustum.containsBox(obj);
    }


    public merge(bound: BoundingBox) {
        if (bound.min.x < this.min.x) this.min.x = bound.min.x;
        if (bound.min.y < this.min.y) this.min.y = bound.min.y;
        if (bound.min.z < this.min.z) this.min.z = bound.min.z;

        if (bound.max.x > this.max.x) this.max.x = bound.max.x;
        if (bound.max.y > this.max.y) this.max.y = bound.max.y;
        if (bound.max.z > this.max.z) this.max.z = bound.max.z;

        this.size.x = bound.max.x - bound.min.x;
        this.size.y = bound.max.y - bound.min.y;
        this.size.z = bound.max.z - bound.min.z;

        this.extents.x = this.size.x * 0.5;
        this.extents.y = this.size.y * 0.5;
        this.extents.z = this.size.z * 0.5;

        this.center.x = this.extents.x + bound.min.x;
        this.center.y = this.extents.y + bound.min.y;
        this.center.z = this.extents.z + bound.min.z;
    }

    public intersects(bounds: IBound): boolean {
        return this.min.x <= bounds.max.x && this.max.x >= bounds.min.x && this.min.y <= bounds.max.y && this.max.y >= bounds.min.y && this.min.z <= bounds.max.z && this.max.z >= bounds.min.z;
    }

    public intersectsSphere(sphere: IBound): boolean {
        return this.min.x <= sphere.max.x && this.max.x >= sphere.min.x && this.min.y <= sphere.max.y && this.max.y >= sphere.min.y && this.min.z <= sphere.max.z && this.max.z >= sphere.min.z;
    }

    /**
     *
     * Does the target bounding box intersect with the bounding box
     * @param box
     * @returns
     */
    public intersectsBox(box: IBound): boolean {
        return this.min.x <= box.max.x && this.max.x >= box.min.x && this.min.y <= box.max.y && this.max.y >= box.min.y && this.min.z <= box.max.z && this.max.z >= box.min.z;
    }

    /**
     *
     * Does the ray collide with the bounding box
     * @param ray
     * @param bounds
     * @returns
     */
    public static intersectRay(ray: Ray, bounds: IBound): boolean {
        let tmin: number = 0;
        let tmax: number = Number.MAX_VALUE;
        let invdirx: number = 1 / ray.direction.x;
        let invdiry: number = 1 / ray.direction.y;
        let invdirz: number = 1 / ray.direction.z;
        let origin: Vector3 = ray.origin;
        let dirx: number = ray.direction.x;
        let diry: number = ray.direction.y;
        let dirz: number = ray.direction.z;
        let min: Vector3 = bounds.min;
        let max: Vector3 = bounds.max;
        let t1: number;
        let t2: number;
        if (dirx >= 0) {
            t1 = (min.x - origin.x) * invdirx;
            t2 = (max.x - origin.x) * invdirx;
        } else {
            t1 = (max.x - origin.x) * invdirx;
            t2 = (min.x - origin.x) * invdirx;
        }
        if (t1 > tmin) {
            tmin = t1;
        }
        if (t2 < tmax) {
            tmax = t2;
        }
        if (diry >= 0) {
            t1 = (min.y - origin.y) * invdiry;
            t2 = (max.y - origin.y) * invdiry;
        } else {
            t1 = (max.y - origin.y) * invdiry;
            t2 = (min.y - origin.y) * invdiry;
        }
        if (t1 > tmin) {
            tmin = t1;
        }
        if (t2 < tmax) {
            tmax = t2;
        }
        if (dirz >= 0) {
            t1 = (min.z - origin.z) * invdirz;
            t2 = (max.z - origin.z) * invdirz;
        } else {
            t1 = (max.z - origin.z) * invdirz;
            t2 = (min.z - origin.z) * invdirz;
        }
        if (t1 > tmin) {
            tmin = t1;
        }
        if (t2 < tmax) {
            tmax = t2;
        }
        return tmax >= tmin;
    }

    public equals(bounds: IBound): boolean {
        return this.center.equals(bounds.center) && this.extents.equals(bounds.extents);
    }

    public expandByPoint(point: Vector3): void {
        if (point.x < this.min.x) {
            this.min.x = point.x;
        }
        if (point.x > this.max.x) {
            this.max.x = point.x;
        }

        if (point.y < this.min.y) {
            this.min.y = point.y;
        }
        if (point.y > this.max.y) {
            this.max.y = point.y;
        }
        if (point.z < this.min.z) {
            this.min.z = point.z;
        }
        if (point.z > this.max.z) {
            this.max.z = point.z;
        }
    }

    public static fromPoints(points: Vector3[]): BoundingBox {
        var bounds: BoundingBox = new BoundingBox(new Vector3(), new Vector3());
        for (var i: number = 0; i < points.length; i++) {
            bounds.expandByPoint(points[i]);
        }
        return bounds;
    }

    public calculateTransform(obj: Object3D): void {

    }

    public clone(): IBound {
        var bound: BoundingBox = new BoundingBox(this.center.clone(), this.size.clone());
        return bound;
    }

    public intersectsRay(ray: Ray, point: Vector3): boolean {
        throw new Error('Method not implemented.');
    }

    public containsPoint(point: Vector3): boolean {
        return this.min.x <= point.x && this.max.x >= point.x && this.min.y <= point.y && this.max.y >= point.y && this.min.z <= point.z && this.max.z >= point.z;
    }

    public getBoundVertex() {
        let p0 = new Vector3(this.min.x, this.min.y, this.min.z);
        let p1 = new Vector3(this.max.x, this.min.y, this.min.z);
        let p2 = new Vector3(this.max.x, this.min.y, this.max.z);
        let p3 = new Vector3(this.min.x, this.min.y, this.max.z);

        let p4 = new Vector3(this.min.x, this.max.y, this.min.z);
        let p5 = new Vector3(this.max.x, this.max.y, this.min.z);
        let p6 = new Vector3(this.max.x, this.max.y, this.max.z);
        let p7 = new Vector3(this.min.x, this.max.y, this.max.z);
        return [
            p2.x,
            p2.y,
            p2.z,
            1.0,
            p3.x,
            p3.y,
            p3.z,
            1.0,
            p0.x,
            p0.y,
            p0.z,
            1.0,
            p1.x,
            p1.y,
            p1.z,
            1.0,
            p2.x,
            p2.y,
            p2.z,
            1.0,
            p0.x,
            p0.y,
            p0.z,
            1.0,

            p6.x,
            p6.y,
            p6.z,
            1.0,
            p2.x,
            p2.y,
            p2.z,
            1.0,
            p1.x,
            p1.y,
            p1.z,
            1.0,
            p5.x,
            p5.y,
            p5.z,
            1.0,
            p6.x,
            p6.y,
            p6.z,
            1.0,
            p1.x,
            p1.y,
            p1.z,
            1.0,

            p7.x,
            p7.y,
            p7.z,
            1.0,
            p6.x,
            p6.y,
            p6.z,
            1.0,
            p5.x,
            p5.y,
            p5.z,
            1.0,
            p4.x,
            p4.y,
            p4.z,
            1.0,
            p7.x,
            p7.y,
            p7.z,
            1.0,
            p5.x,
            p5.y,
            p5.z,
            1.0,

            p3.x,
            p3.y,
            p3.z,
            1.0,
            p7.x,
            p7.y,
            p7.z,
            1.0,
            p4.x,
            p4.y,
            p4.z,
            1.0,
            p0.x,
            p0.y,
            p0.z,
            1.0,
            p3.x,
            p3.y,
            p3.z,
            1.0,
            p4.x,
            p4.y,
            p4.z,
            1.0,

            p6.x,
            p6.y,
            p6.z,
            1.0,
            p7.x,
            p7.y,
            p7.z,
            1.0,
            p3.x,
            p3.y,
            p3.z,
            1.0,
            p3.x,
            p3.y,
            p3.z,
            1.0,
            p2.x,
            p2.y,
            p2.z,
            1.0,
            p6.x,
            p6.y,
            p6.z,
            1.0,

            p1.x,
            p1.y,
            p1.z,
            1.0,
            p0.x,
            p0.y,
            p0.z,
            1.0,
            p4.x,
            p4.y,
            p4.z,
            1.0,
            p5.x,
            p5.y,
            p5.z,
            1.0,
            p1.x,
            p1.y,
            p1.z,
            1.0,
            p4.x,
            p4.y,
            p4.z,
            1.0,
        ];
    }
}
