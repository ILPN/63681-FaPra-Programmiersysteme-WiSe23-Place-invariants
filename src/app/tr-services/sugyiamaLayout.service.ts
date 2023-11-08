import { Injectable } from "@angular/core";
import { Node } from "src/app/tr-interfaces/petri-net/node";
import { Arc } from "../tr-classes/petri-net/arc";
import { Place } from "../tr-classes/petri-net/place";
import { Transition } from "../tr-classes/petri-net/transition";
import { Point } from "../tr-classes/petri-net/point";
import { Observable, of } from "rxjs";
import { DataService } from "src/app/tr-services/data.service";
import { transition } from "@angular/animations";

@Injectable({
    providedIn: 'root'
})

export class LayoutService {
    private _arcsToBeReversed: Arc[] = [];

    private _nodes: Set<Node> = new Set<Node>();
    private _arcs: Arc[] = [];

    private _stack: Set<Node> = new Set<Node>();
    private _visited: Set<Node> = new Set<Node>();

    constructor(protected dataService: DataService) {
        this.dataService = dataService;
    }

    applySugyiamaLayout() {
        // copy initial state of datamodel to local datamodel
        this._arcs = [...this.dataService.getArcs()];
        this._nodes = new Set([...this.dataService.getPlaces(), ...this.dataService.getTransitions()]);

        // Sugyiama Step 1: remove cycles
        this.removeCycles();
        this.reverseArcs();

        console.log('Result: ', this._arcsToBeReversed);

        // Sugyiama Step 2: assign layers
        // Sugyiama Step 3: vertex ordering
        // Sugyiama Step 4: coordinate assignment
    }

    removeCycles() {
        for (let node of this._nodes) {
            this.depthFirstSearchRemove(node);
        }
    }

    depthFirstSearchRemove(node: Node) {
        if (this._visited.has(node)) {
            return;
        }
        this._visited.add(node);
        this._stack.add(node);

        for (let arc of this.getPostArcsForNode(node)) {
            if (this._stack.has(arc.to)) {
                this._arcsToBeReversed.push(arc);
                // TODO: Check if it's possibly that a petrinet contains two arcs
                // leading from and to the same node ?
                this._arcs = this._arcs.filter(
                    (a) => !(a.from.label === arc.from.label && a.to.label === arc.to.label)
                );
            } else if (!this._visited.has(arc.to)) {
                this.depthFirstSearchRemove(arc.to);
            }
        }

        this._stack.delete(node);
    }

    getPostArcsForNode(node: Node) {
        if (node instanceof Transition) {
            return node.getPostArcs();
        } else {
            return this._arcs.filter((arc) => arc.from === node);
        }
    }

    reverseArcs() {
        for (let arc of this._arcsToBeReversed) {
            const newTo = arc.from;
            const newFrom = arc.to;

            arc.to = newTo;
            arc.from = newFrom;
        }
    }
}