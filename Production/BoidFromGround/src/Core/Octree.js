// Octree.js
// Holds the octree 
const Diagnostics = require('Diagnostics'); 

import { Vector3 } from 'math-ds';
import { PointOctree } from 'sparse-octree'; 

export default class Octree {
    constructor(snapshot, boundary) {
        this.min = new Vector3(0, 0, 0);
        this.max = new Vector3(0, 0, 0);

        this.min.x = snapshot['lastTargetX'] - boundary; 
        this.min.y = snapshot['lastTargetY'] - boundary; 
        this.min.z = snapshot['lastTargetZ'] - boundary; 

        this.max.x = snapshot['lastTargetX'] + boundary; 
        this.max.y = snapshot['lastTargetY'] + boundary; 
        this.max.z = snapshot['lastTargetZ'] + boundary;

        this.bias = 0.0; // No loose octree. 
        this.maxPoints = 2; // Maximum points before the tree splits. 
        this.tree = new PointOctree(this.min, this.max, this.bias, this.maxPoints); 
    }

    // Insert a point into the octree along with the data that should be retried. 
    insertPoint(position, agent) {
        this.tree.insert(position, agent); 
    }

    // Finds all the points in the octree within a given radius. 
    scanForPoints(position, radius) {
        return this.tree.findPoints(position, radius, true); 
    }

    pointCount() {
        return this.tree.pointCount; 
    } 
}
