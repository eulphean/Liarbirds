// Octree.js
// Holds the octree 
const Diagnostics = require('Diagnostics'); 

import { Vector3 } from 'math-ds';
import { PointOctree } from 'sparse-octree'; 
import * as CANNON from 'cannon-es';

export default class Octree {
    constructor(snapshot) {
        this.min = new Vector3 (0, 0, 0);
        this.max = new Vector3 (0, 0, 0);

        this.min.x = snapshot['lastTargetX'] - 0.2; 
        this.min.y = snapshot['lastTargetY'] - 0.2; 
        this.min.z = snapshot['lastTargetZ'] - 0.2; 

        this.max.x = snapshot['lastTargetX'] + 0.2; 
        this.max.y = snapshot['lastTargetY'] + 0.2; 
        this.max.z = snapshot['lastTargetZ'] + 0.2;

        this.bias = 0.0; // No loose octree. 
        this.maxPoints = 2; // Maximum points before the tree splits. 
        this.tree = new PointOctree(this.min, this.max, this.bias, this.maxPoints); 
    }

    // Insert a point into the octree along with the data that should be retried. 
    insertPoint(position, agent) {
        let p = new Vector3(position.x, position.y, position.z); 
        this.tree.insert(p, agent); 
    }

    // Finds all the points in the octree within a given radius. 
    scanForPoints(position, radius) {
        let p = new Vector3(position.x, position.y, position.z); 
        return this.tree.findPoints(p, radius, true); 
    }

    pointCount() {
        return this.tree.pointCount; 
    } 
}
