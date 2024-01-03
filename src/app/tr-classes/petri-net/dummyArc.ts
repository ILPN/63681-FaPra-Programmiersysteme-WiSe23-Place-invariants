import { Node } from 'src/app/tr-interfaces/petri-net/node';
import { Point } from './point';
import { Place } from './place';
import { Transition } from './transition';

export class DummyArc {
    points: Point[];

    constructor(
        points: Point[] = [],
    ) {
        this.points = points;
    }

    get polyLinePoints(): string {
        return this.pointArrayToString(this.points);
    }

    // get lineSegments(): Point[][] {
    //     const polyLinePointsArray: Point[] = this.polyLinePointsArray;
    //     if (polyLinePointsArray.length < 2) {
    //         throw new Error(
    //             'polyLinePointsArray must have at least two elements',
    //         );
    //     }
    //     const lineSegments: Point[][] = [];
    //     for (let i = 1; i < polyLinePointsArray.length; i++) {
    //         lineSegments.push([
    //             polyLinePointsArray[i - 1],
    //             polyLinePointsArray[i],
    //         ]);
    //     }
    //     return lineSegments;
    // }

    // get polyLinePointsArray(): Point[] {
    //     // ToDo: the application should make sure that no anchor points lie
    //     // within the boundaries of the shapes associated with the from and
    //     // to nodes

    //     let start: Point;
    //     let end: Point;

    //     // Determine start point of the line
    //     const pForStartCalc: Point = [...this.anchors, this.to.position][0];
    //     if (this.from.pLiesOutsideNodeShapeBoudary(pForStartCalc)) {
    //         start = this.from.intersectionOfBoundaryWithLineTo(pForStartCalc);
    //     } else {
    //         // Fall back solution: if pForStartCalc lies within the boundaries
    //         // of the shape, the start for the line is given as the center
    //         // of the from-node --> a graphical representation of the petri-net
    //         // can still be produced, even though the layout may not (yet) be
    //         // optimal (e.g. somewhat overlapping nodes)
    //         start = this.from.position;
    //     }

    //     // Determine end point of the line
    //     const anchorsPlusFrom: Point[] = [this.from.position, ...this.anchors];
    //     const pForEndCalc: Point = anchorsPlusFrom[anchorsPlusFrom.length - 1];
    //     if (this.to.pLiesOutsideNodeShapeBoudary(pForEndCalc)) {
    //         end = this.to.intersectionOfBoundaryWithLineTo(pForEndCalc);
    //     } else {
    //         // Fall back solution as above
    //         end = this.to.position;
    //     }

    //     return [start, ...this.anchors, end];
    // }

    pointArrayToString(points: Point[]): string {
        let s = '';
        for (let point of points) {
            s = s + point.x + ',' + point.y + ' ';
        }
        return s;
    }
}
