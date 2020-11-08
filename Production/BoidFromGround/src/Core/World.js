// World.js
// Should maintain the agents, objects, etc. 
const Diagnostics = require('Diagnostics');
const Time = require('Time'); 

import { Vector3 } from 'math-ds'; 
import { HoodManager } from '../Managers/HoodManager'
import { OctreeManager } from '../Managers/OctreeManager'
import { DeathManager } from '../Managers/DeathManager'
import { AudioManager } from '../Managers/AudioManager'

import * as AgentUtility from '../Utilities/AgentUtility'
import * as SparkUtility from '../Utilities/SparkUtility'

import { AGENT_SPEED } from '../Utilities/AgentUtility'

export const WORLD_STATE = {
    SPAWN: 0, 
    FLOCK_PHONE: 1, 
    FLOCK_HOOD: 2,
    PATTERN_HOOD: 3, 
    REST_HOOD: 4
}; 

const STAGGER_TIME = 1000; // 1 second. 
export class World {
    constructor(sceneObjects) {
        // Agents. 
        this.agents = []; 
        this.curSpawnIdx = 0; 
        this.setupAgents(sceneObjects); 

        // Manages all the logic for the hood and octrees. 
        this.hoodManager = new HoodManager(sceneObjects, this.agents);  
        this.octreeManager = new OctreeManager(); 
        this.deathManager = new DeathManager(sceneObjects); 
        this.audioManager = new AudioManager(); 

        // Current world state. 
        this.curWorldState = WORLD_STATE.SPAWN; 

        // Phone target
        this.phoneTarget = new Vector3(0, 0, 0); 
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
    update(snapshot) {  
        // Update phone target. 
        this.phoneTarget.set(snapshot['lastTargetX'], snapshot['lastTargetY'], snapshot['lastTargetZ']);
        this.hoodManager.update(this.curWorldState); 
        this.octreeManager.update(this.curWorldState, this.agents, this.phoneTarget, this.hoodManager.getFlockTarget()); 
        this.updateAgents(); 
    }

    updateAgents() {
        let idx = 0; 
        this.agents.forEach(a => { // Bind local scope. 
            if (a.awake) {
                let nAgents = [];
                // Agent is interactable and moving in the world. 
                if (a.deathCounter > 0) {
                    // Get neighbors from the phoneOctree
                    if (this.curWorldState === WORLD_STATE.FLOCK_PHONE) {
                        nAgents = this.octreeManager.getNeighbours(true, a.position);
                    }

                    // Get neighbors from the hoodOctree 
                    if (this.curWorldState === WORLD_STATE.FLOCK_HOOD) {
                        nAgents = this.octreeManager.getNeighbours(false, a.position); 
                    }
        
                    if (this.curWorldState === WORLD_STATE.SPAWN 
                        || this.curWorldState === WORLD_STATE.FLOCK_PHONE) {
                        a.evaluateInitialSpawnTarget(this.phoneTarget); 
                    }

                    if (this.curWorldState === WORLD_STATE.FLOCK_HOOD) {
                        let fTarget = this.hoodManager.getFlockTarget(); 
                        a.setHoodTarget(fTarget); 
                    }

                    if (this.curWorldState === WORLD_STATE.PATTERN_HOOD) {
                        let aTarget = this.hoodManager.getAgentPatternTarget(idx); 
                        a.setHoodTarget(aTarget); 
                        a.setAgentSpeed(AGENT_SPEED.MEDIUM);
                    }

                    if (this.curWorldState === WORLD_STATE.REST_HOOD) {
                        let aTarget = this.hoodManager.getAgentRestTarget(idx); 
                        a.setHoodTarget(aTarget); 
                        a.evaluateRestTarget(); 

                        SparkUtility.syncSceneObject(a.targetObject, aTarget); 
                    }
                } else {
                    let dTarget = this.deathManager.getDeathTarget(idx); 
                    a.setHoodTarget(dTarget); 
                }
                
                // Send neighbors to update. 
                a.update(nAgents); 
            }

            idx++; 
        });
    }

    releaseAgents() {
        // In spawn state, stagger the agents one by one to come off the floor. 
        if (this.curSpawnIdx < this.agents.length) {
            let a = this.agents[this.curSpawnIdx];
            a.spawn();
            this.curSpawnIdx++; 

            Time.setTimeout(() => {
                this.releaseAgents();
            }, STAGGER_TIME); 
        }
    }

    // Checks if there are agents in phoneOctree.
    // Applies some updates on them. 
    handleTap(snapshot) {
        // let focalTarget = new Vector3(snapshot['lastX'], snapshot['lastY'], snapshot['lastZ']); 
        let agents = this.octreeManager.getAgentsNearPhone(this.phoneTarget); 
        if (agents.length > 0) {
            Diagnostics.log('Agents found near the phone.');
            this.audioManager.playInteractSound(); 
            agents.forEach(a => a.enableExcitation(this.deathManager)); 
        } else {
            Diagnostics.log('Agents not found near the phone.'); 
        }
    }

    // Handles state overrides for the agents. 
    handleLongPress() {
        // Play background sound. 
        this.audioManager.playBgSound();

        switch (this.curWorldState) {
            case WORLD_STATE.SPAWN: {
                this.releaseAgents(); 
                this.curWorldState = WORLD_STATE.FLOCK_PHONE; 
                Diagnostics.log('New State: FLOCK_PHONE'); 
                break;
            }

            case WORLD_STATE.FLOCK_PHONE: {
                this.curWorldState = WORLD_STATE.FLOCK_HOOD; 
                Diagnostics.log('New State: FLOCK_HOOD'); 
                break;
            }

            case WORLD_STATE.FLOCK_HOOD: {
                this.curWorldState = WORLD_STATE.PATTERN_HOOD;
                Diagnostics.log('New State: PATTERN_HOOD');  
                break;
            }

            case WORLD_STATE.PATTERN_HOOD: {
                this.curWorldState = WORLD_STATE.REST_HOOD; 
                Diagnostics.log('New State: REST_HOOD'); 
                break;
            }

            case WORLD_STATE.REST_HOOD: {
                this.curWorldState = WORLD_STATE.FLOCK_PHONE; 
                Diagnostics.log('New State: FLOCK_PHONE'); 
                break;
            }

            default: {
                break; 
            }
        }
    }
}