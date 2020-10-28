// Octree.js
// Holds the octree 
const Diagnostics = require('Diagnostics'); 

import { Vector3 } from 'math-ds';
import { PointOctree } from 'sparse-octree'; 
import * as CANNON from 'cannon-es';

export default class Octree {
    constructor(snapshot) {
        this.min = new Vector3(snapshot['lastLowerBoundX'], snapshot['lastLowerBoundY'], snapshot['lastLowerBoundZ']); 
        this.max = new Vector3(snapshot['lastUpperBoundX'], snapshot['lastUpperBoundY'], snapshot['lastUpperBoundZ']); 
        this.bias = 0.0; // No loose octree. 
        this.maxPoints = 4; // Maximum points before the tree splits. 
        this.tree = new PointOctree(this.min, this.max, this.bias, this.maxPoints); 
    }

    // Insert a point into the octree along with the data that should be retried. 
    insertPoint(position, agent) {
        this.octree.insert(postion, agent); 
    }

    // Finds all the points in the octree within a given radius. 
    scanForAgents(position, radius) {
        return findPoints(position, radius, true); 
    }
}
