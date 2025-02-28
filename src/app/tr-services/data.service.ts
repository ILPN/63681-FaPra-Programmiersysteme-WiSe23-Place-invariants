import { Injectable } from '@angular/core';
import { Arc } from '../tr-classes/petri-net/arc';
import { Place } from '../tr-classes/petri-net/place';
import { Transition } from '../tr-classes/petri-net/transition';
import { Node } from 'src/app/tr-interfaces/petri-net/node';
import { Point } from '../tr-classes/petri-net/point';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private _places: Place[] = [];
    private _transitions: Transition[] = [];
    private _arcs: Arc[] = [];
    private _actions: string[] = [];

    constructor() {}

    getPlaces(): Place[] {
        return this._places;
    }

    getPlacesAsync(): Observable<Place[]> {
        return of(this._places);
    }

    getTransitions(): Transition[] {
        return this._transitions;
    }

    getTransitionsAsync(): Observable<Transition[]> {
        return of(this._transitions);
    }

    getArcs(): Arc[] {
        return this._arcs;
    }

    getArcsAsync(): Observable<Arc[]> {
        return of(this._arcs);
    }

    getActions(): string[] {
        return this._actions;
    }

    getActionsAsync(): Observable<string[]> {
        return of(this._actions);
    }

    set places(value: Place[]) {
        this._places = value;
    }

    set transitions(value: Transition[]) {
        this._transitions = value;
    }

    set arcs(value: Arc[]) {
        this._arcs = value;
    }

    set actions(value: string[]) {
        this._actions = value;
    }

    removePlace(deletablePlace: Place): Place[] {
        const deletableArcs = this._arcs.filter(
            (arc) => arc.from === deletablePlace || arc.to === deletablePlace,
        );
        deletableArcs.forEach((arc) => this.removeArc(arc));
        this._places = this._places.filter((place) => place !== deletablePlace);
        return this._places;
    }

    removeTransition(deletableTransition: Transition): Transition[] {
        const deletableArcs = this._arcs.filter(
            (arc) =>
                arc.from === deletableTransition ||
                arc.to === deletableTransition,
        );
        deletableArcs.forEach((arc) => this.removeArc(arc));
        this._transitions = this._transitions.filter(
            (transition) => transition !== deletableTransition,
        );
        return this._transitions;
    }

    removeArc(deletableArc: Arc): Arc[] {
        this._arcs = this._arcs.filter((arc) => arc != deletableArc);

        if (deletableArc.from instanceof Transition) {
            const t: Transition = deletableArc.from as Transition;
            t.postArcs = t.postArcs.filter((arc) => arc !== deletableArc);
        } else {
            const t: Transition = deletableArc.to as Transition;
            t.preArcs = t.preArcs.filter((arc) => arc !== deletableArc);
        }
        return this._arcs;
    }

    removeAction(deletableAction: string): string[] {
        this._transitions.forEach((transition) => {
            if (transition.label === deletableAction) {
                transition.label = undefined;
            }
        });
        this._actions = this._actions.filter(
            (action) => action !== deletableAction,
        );
        return this._actions;
    }

    removeAnchor(deletableAnchor: Point) {
        for (let arc of this._arcs) {
            for (let arcAnchor of arc.anchors) {
                if (deletableAnchor === arcAnchor) {
                    const index = arc.anchors.indexOf(deletableAnchor);
                    arc.anchors.splice(index, 1);
                }
            }
        }
    }

    checkActionUsed(action: string): boolean {
        return this._transitions.some(
            (transition) => transition.label === action,
        );
    }

    //The Nodes are not added to the Arrays during this function
    connectNodes(from: Node, to: Node): void {
        if (from instanceof Place && to instanceof Place) {
            return;
        }
        if (from instanceof Transition && to instanceof Transition) {
            return;
        }
        if (from instanceof Place && to instanceof Transition) {
            const preArcs = to.preArcs;
            if (preArcs.find((arc) => arc.from === from)) {
                return;
            } else {
                const arc = new Arc(from, to);
                to.preArcs.push(arc);
                this.getArcs().push(arc);
            }
        }
        if (from instanceof Transition && to instanceof Place) {
            const postArcs = from.postArcs;
            if (postArcs.find((arc) => arc.to === to)) {
                return;
            } else {
                const arc = new Arc(from, to);
                from.postArcs.push(arc);
                this.getArcs().push(arc);
            }
        }
    }

    clearAll(): void {
        this.places = [];
        this.transitions = [];
        this.arcs = [];
        this.actions = [];
    }

    isEmpty(): boolean {
        if (this.getPlaces().length != 0) {
            return false;
        }
        if (this.getTransitions().length != 0) {
            return false;
        }
        if (this.getArcs().length != 0) {
            return false;
        }
        if (this.getActions().length != 0) {
            return false;
        }
        return true;
    }

    hasElementsWithoutPosition(): boolean {
        // [].some search function will return true if
        // any node is found that has either no x or no y position
        return [...this.getTransitions(), ...this.getPlaces()].some(
            (node: Node) => {
                return (
                    (!node.position.x && node.position.x !== 0) ||
                    (!node.position.y && node.position.y !== 0)
                );
            },
        );
    }

    isConnectionPossible(startNode: Node, endNode: Node): boolean {
        if (startNode instanceof Transition && endNode instanceof Transition) {
            return false;
        }
        if (startNode instanceof Place && endNode instanceof Place) {
            return false;
        }
        if (startNode instanceof Transition && endNode instanceof Place) {
            const amountOfConnections = startNode.postArcs.filter((arc) => {
                return arc.to === endNode;
            }).length;
            return amountOfConnections === 0;
        }
        if (startNode instanceof Place && endNode instanceof Transition) {
            const amountOfConnections = endNode.preArcs.filter((arc) => {
                return arc.from === startNode;
            }).length;
            return amountOfConnections === 0;
        }
        return false;
    }

    mockData() {
        this.places = [
            new Place(4, new Point(100, 200), 'p1'),
            new Place(2, new Point(200, 100), 'p2'),
            new Place(3, new Point(300, 300), 'p3'),
            new Place(0, new Point(400, 200), 'p4'),
        ];

        this.transitions = [
            new Transition(new Point(150, 150), 't1'),
            new Transition(new Point(250, 200), 't2'),
            new Transition(new Point(350, 250), 't3'),
        ];

        this.arcs = [
            new Arc(this._places[0], this._transitions[0], 5),
            new Arc(this._transitions[0], this._places[1], 1),
            new Arc(this._places[1], this._transitions[1], 1),
            new Arc(this._transitions[1], this._places[2], 1, [
                new Point(250, 300),
            ]),
        ];

        this._transitions[0].appendPreArc(this._arcs[0]);
        this._transitions[0].appendPostArc(this._arcs[1]);
        this._transitions[1].appendPreArc(this._arcs[2]);
        this._transitions[1].appendPostArc(this._arcs[3]);
    }
}
