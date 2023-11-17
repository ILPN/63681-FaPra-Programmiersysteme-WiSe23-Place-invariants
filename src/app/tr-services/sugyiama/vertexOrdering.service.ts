import { Node } from "src/app/tr-interfaces/petri-net/node";
import { DummyNode } from "src/app/tr-classes/petri-net/dummyNode";
import { Arc } from "src/app/tr-classes/petri-net/arc";
import { WrappedNodeExpr } from "@angular/compiler";
import { Point } from "src/app/tr-classes/petri-net/point";

export class VertexOrderingService {
    // Initial set of nodes and arcs
    private _nodes: Node[] = [];
    private _arcs: Arc[] = [];

    // Maps of adjacent nodes
    private _nodeInputMap: Map<Node, Node[]> = new Map();
    private _nodeOutputMap: Map<Node, Node[]> = new Map();
    
    
    private _layers: Record<number, Node[]> = {};

    constructor(
        layers: Record<number, Node[]>,
        arcs: Arc[],
        nodeInputMap: Map<Node, Node[]>,
        nodeOutputMap: Map<Node, Node[]>
    ) {
        this._layers = layers;
        this._arcs = arcs;

        this._nodeInputMap = nodeInputMap;
        this._nodeOutputMap = nodeOutputMap;
    }

    orderVertices() {
        this.insertDummyNodes();

        // TODO: Now follow barycenter algorithm by Ganser et al.
    }

    insertDummyNodes() {
        let dummyIndex = 0;
        for (const [layerId, nodes] of Object.entries(this._layers)) {
            const nextLayer = this._layers[+layerId + 1];
            if (!nextLayer) continue;

            for (let node of nodes) {
                // check if there are incoming edges from a vertex from a layer
                // that is not the previous one
                const inputNodes = this._nodeInputMap.get(node);
                if (inputNodes) {
                    for (let preNode of inputNodes) {
                        const preNodeLayer = this.findLayerIdForNode(preNode);

                        if (Math.abs(preNodeLayer) - +layerId > 1) {
                            this.addDummyNodeAndArcs(dummyIndex, nextLayer, preNode, node);
                            dummyIndex++;
                        }
                    }
                }

                const outputNodes = this._nodeOutputMap.get(node);
                if (outputNodes) {
                    // check if there are incoming edges from a vertex from a layer
                    // that is not the next one
                    for (let postNode of outputNodes) {
                        const postNodeLayer = this.findLayerIdForNode(postNode);

                        if (Math.abs(postNodeLayer) - +layerId > 1) {
                            this.addDummyNodeAndArcs(dummyIndex, nextLayer, node, postNode);
                            dummyIndex++;
                        }
                    }
                }

                // Update the now outdated node maps to reflect the dummy arcs & nodes
                this.generateAdjacentNodeMaps();
            }
        }
    }

    addDummyNodeAndArcs(index: number, layer: Node[], from: Node, to: Node) {
        // console.log('[Vertex Ordering]: Create dummy for  ' , from, 'to: ', to);
        const dummy = new DummyNode(new Point(1, 1), `dummyNode-${index}`, `DummyNode ${index}`);
        layer.push(dummy);

        // Remove original arc
        const arcIndex = this._arcs.findIndex((arc) => arc.equals(new Arc(from, to)));
        const weight = this._arcs[arcIndex].weight;
        this._arcs.splice(arcIndex, 1);

        // Instead add two arc sections to and from the dummy node
        this._arcs.push(new Arc(from, dummy, weight));
        this._arcs.push(new Arc(dummy, to, weight));
    }

    findLayerIdForNode(node: Node): number {
        for (const [layerId, nodes] of Object.entries(this._layers)) {
            if (nodes.includes(node)) return +layerId; // keys are turned to strings, but we need numbers
        }
        return 0;
    }

    generateAdjacentNodeMaps() {
        this._nodeInputMap.clear();
        this._nodeOutputMap.clear();

        this._arcs.forEach((arc) => {
            if (this._nodeInputMap.get(arc.to)) {
                this._nodeInputMap.get(arc.to)?.push(arc.from);
            } else {
                this._nodeInputMap.set(arc.to, [arc.from]);
            }

            if (this._nodeOutputMap.get(arc.from)) {
                this._nodeOutputMap.get(arc.from)?.push(arc.to);
            } else {
                this._nodeOutputMap.set(arc.from, [arc.to]);
            }
        });
    }
}