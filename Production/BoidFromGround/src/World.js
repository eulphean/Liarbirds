// World.js
// Should maintain the agents, objects, etc. 

import { Vector3 } from 'math-ds'; 
import Octree from './Octree.js';
import * as AgentUtility from './AgentUtility.js'

export const WORLD_STATE = {
    SPAWN: 0, 
    TARGET_PHONE: 1, 
    TARGET_FLOCK: 2,
    TARGET_PATTERN: 3, 
    TARGET_REST: 4
}; 

export class World {
    constructor(sceneObjects) {
        // Agents. 
        this.agents = []; 
        this.curSpawnIdx = 0; 
        this.setupAgents(sceneObjects); 

        // Octrees. 
        this.octreeBoundary = 0.1; 
        // Maintains the octree around the phone. 
        this.phoneOctree = {};

        // World state
        this.curWorldState = WORLD_STATE.SPAWN; 
    }

    setupAgents(sceneObjects) {
        let sceneAgents = sceneObjects['agents']; 
        let sceneTargets = sceneObjects['targets']; 
        let initialVelocities = AgentUtility.prepareInitialAgentVelocities(); 
        for (let i = 0; i < sceneAgents.length; i++) {
            let agent = AgentUtility.prepareAgent(sceneAgents[i], sceneTargets[i], i, initialVelocities[i]); 
            this.agents.push(agent); 
        }
    }

    setupPhoneOctree(snapshot) {
        // Recreate a new tree with every iteration (much faster than updating an existing one)
        this.phoneOctree = new Octree(snapshot, this.octreeBoundary); 
        this.agents.forEach(a => {
            if (a.awake) {
                let p = a.position; 
                this.phoneOctree.insertPoint(p, a); 
            }
        }); 
    }

    update(snapshot) {
        this.setupPhoneOctree(snapshot); 
        this.updateAgents(snapshot); 
    }

    updateAgents(snapshot) {
        this.agents.forEach(a => { // Bind local scope. 
            if (a.awake) {
                // Get agents within a radius. 
                let neighbours = this.phoneOctree.scanForPoints(a.position, 0.05); 
                
                // Extract agent data from the return object. 
                let nAgents = []; 
                neighbours.forEach(n => {
                    let a = n['data']; 
                    nAgents.push(a); 
                }); 


                // Based on the state I'm in, call the required function. 
                // Have I reached? 
                a.evaluateSeekTarget(snapshot); 
                
                // Send neighboring agent. 
                a.update(nAgents); 
            }
        });
    }

    // TODO: Sync with portal animation. 
    // Make this really smart. 
    releaseAgents() {
        // In spawn state, stagger the agents one by one to come off the floor. 
        if (this.curSpawnIdx < this.agents.length) {
            let a = this.agents[this.curSpawnIdx];
            a.spawn();
            this.curSpawnIdx++; 
        }
    }

    // Checks if there are agents in phoneOctree.
    // Applies some updates on them. 
    handleTap(snapshot) {
        let focalTarget = new Vector3(snapshot['lastX'], snapshot['lastY'], snapshot['lastZ']); 
        let points = this.phoneOctree.scanForPoints(focalTarget, boundary); 
        if (points.length > 0) {   
            Diagnostics.log('Agents found near the phone.'); 
            points.forEach(n => {
                let a = n['data']; 
                a.setTapUpdates(); 
            }); 
        } else {
            Diagnostics.log('Agents not found near the phone.')
        }
    }

    handleLongPress() {
        switch (this.curWorldState) {
            case WORLD_STATE.SPAWN: {
                this.releaseAgents(); 
                break;
            }

            case WORLD_STATE.TARGET_FLOCK: {
                break;
            }

            case WORLD_STATE.TARGET_PATTERN: {
                break;
            }

            case WORLD_STATE.TARGET_PHONE: {
                break;
            }

            case WORLD_STATE.TARGET_REST: {
                break;
            }

            default: {
                break; 
            }
        }
    }
}

// Recursively invoke itself until we are done releasing all the agents. 
// Time.setTimeout(() => {
//     releaseNextAgent(spawnPoint); 
// }, staggerTime); 