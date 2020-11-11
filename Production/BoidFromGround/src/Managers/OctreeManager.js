// OctreeManager.js
// Manages all the octrees. Octrees are special data structures that we are using 
// to find nearest neighbors and apply techniques like Flocking, etc. 
// 1: For the Phone target. 
// 2: For the Hood target. 
import { Octree } from '../Core/Octree.js'
import { WORLD_STATE } from '../Core/World.js'

const OCTREE_PHONE_BOUNDARY = 0.05; 
const OCTREE_HOOD_BOUNDARY = 0.08; 
const NEIGHBOUR_RADIUS = 0.02; // Radius from the origin.
export class OctreeManager {
    constructor() {
        this.phoneOctree = {}; 
        this.hoodOctree = {}; 
    }

    update(curWorldState, agents, phoneTarget, hoodFlockTargetVec) {
        // No matter what, always setup the phone octree.   
        this.setupPhoneOctree(phoneTarget, agents); 

        // Create hoodOctree when I'm doing these things. 
        if (curWorldState === WORLD_STATE.FLOCK_HOOD) {
            this.setupHoodOctree(hoodFlockTargetVec, agents); 
        }
    }

    setupPhoneOctree(phoneTarget, agents) {
        // Populate the tree with all the agent positions. 
        this.phoneOctree = new Octree(phoneTarget, OCTREE_PHONE_BOUNDARY); 
        agents.forEach(a => {
            this.phoneOctree.insertPoint(a.position, a); 
        }); 
    }

    setupHoodOctree(hoodFlockTargetVec, agents) {
        this.hoodOctree = new Octree(hoodFlockTargetVec, OCTREE_HOOD_BOUNDARY); 
        agents.forEach(a => {
            this.hoodOctree.insertPoint(a.position, a); 
        }); 
    }

    getNeighbours(isPhoneTarget, origin) {
        let neighbours; let nAgents=[]; 

        // If it's a phone target, lookup phoneOctree.. Else hoodOctree. 
        if (isPhoneTarget) {
            neighbours = this.phoneOctree.scanForPoints(origin, NEIGHBOUR_RADIUS); 
        } else {
            neighbours = this.hoodOctree.scanForPoints(origin, NEIGHBOUR_RADIUS);
        }
        
        neighbours.forEach(n => {
            let a = n['data']; 
            nAgents.push(a); 
        }); 

        return nAgents; 
    }

    getAgentsNearPhone(phoneTarget) {
        let agents = [];
        let points = this.phoneOctree.scanForPoints(phoneTarget, OCTREE_PHONE_BOUNDARY); 
        if (points.length > 0) {   
            points.forEach(n => {
                let a = n['data']; 
                agents.push(a);  
            }); 
        }
        return agents; 
    }
}

          