// Octree.js
// Holds the octree 
const Diagnostics = require('Diagnostics'); 

import { Vector3 } from 'math-ds';
import { PointOctree } from 'sparse-octree'; 

const BIAS = 0.0; // No loose octree. 
const MAX_POINTS = 2.0; // Maximum points before the tree splits. 
export class Octree {
    constructor(origin, boundary) {
        let min = new Vector3(0, 0, 0);
        let max = new Vector3(0, 0, 0);

        min.x = origin.x - boundary; 
        min.y = origin.y - boundary; 
        min.z = origin.z - boundary; 

        max.x = origin.x + boundary; 
        max.y = origin.y + boundary; 
        max.z = origin.z + boundary;

        this.tree = new PointOctree(min, max, BIAS, MAX_POINTS); 
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
