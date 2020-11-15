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
import { InstructionsManager, IState } from '../Managers/InstructionsManager';

export const WORLD_STATE = {
    SPAWN: 0, 
    FLOCK_PHONE: 1, 
    FLOCK_HOOD: 2,
    PATTERN_HOOD: 3, 
    REST_HOOD: 4
}; 

const STAGGER_TIME = 1000;
const PORTAL_ANIMATION_TIME = 3000; // Change to sync to portal.

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
        this.instructionsManager = new InstructionsManager(); 

        // Current world state. 
        this.curWorldState = WORLD_STATE.SPAWN; 

        // Phone target
        this.phoneTarget = new Vector3(0, 0, 0); 

        // Portal animation string.
        this.portalAnim = 'firePortalAnim'; 
    }

    setupAgents(sceneObjects) {
        let sceneAgents = sceneObjects['agents']; 
        let sceneTargets = sceneObjects['targets']; 
        let spawnStates = AgentUtility.prepareSpawnStates(); 
        for (let i = 0; i < sceneAgents.length; i++) {
            let agent = AgentUtility.prepareAgent(sceneAgents[i], sceneTargets[i], i, spawnStates[i]); 
            this.agents.push(agent); 
        }
    }
    update(snapshot) {  
        // Get new phone target. 
        this.phoneTarget.set(snapshot['lastTargetX'], snapshot['lastTargetY'], snapshot['lastTargetZ']);

        // Critical managers. 
        this.hoodManager.update(this.curWorldState); 
        this.octreeManager.update(this.curWorldState, this.agents, this.phoneTarget, this.hoodManager.getFlockTarget()); 

        // Agents. 
        this.updateAgents(); 
    }

    updateAgents() {
        let idx = 0; 
        this.agents.forEach(a => {
            // No agent updates if it hasn't spawned yet. 
            if (a.isActive) {
                let nAgents = [];
                // Agent is interactable and moving in the world. 
                if (a.deathCounter > 0) {
                    // Get neighbors from the phoneOctree
                    if (this.curWorldState === WORLD_STATE.FLOCK_PHONE) {
                        a.setTarget(this.phoneTarget); 
                        nAgents = this.octreeManager.getNeighbours(true, a.position);
                    }

                    // Get neighbors from the hoodOctree 
                    if (this.curWorldState === WORLD_STATE.FLOCK_HOOD) {
                        nAgents = this.octreeManager.getNeighbours(false, a.position); 
                    }
        

                    if (this.curWorldState === WORLD_STATE.FLOCK_HOOD) {
                        let fTarget = this.hoodManager.getFlockTarget(); 
                        a.setTarget(fTarget); 
                        a.setAgentSpeed(AGENT_SPEED.MEDIUM); 
                    }

                    if (this.curWorldState === WORLD_STATE.PATTERN_HOOD) {
                        let aTarget = this.hoodManager.getAgentPatternTarget(idx); 
                        a.setTarget(aTarget); 
                        a.setAgentSpeed(AGENT_SPEED.FAST);
                    }

                    if (this.curWorldState === WORLD_STATE.REST_HOOD) {
                        let aTarget = this.hoodManager.getAgentRestTarget(idx); 
                        a.setAgentSpeed(AGENT_SPEED.REST); 
                        a.setTarget(aTarget); 
                        a.evaluateRestTarget(); 

                        // SparkUtility.syncSceneObject(a.targetObject, aTarget); 
                    }
                } else {
                    let dTarget = this.deathManager.getDeathTarget(idx); 
                    a.setTarget(dTarget); 
                    a.evaluateRestTarget(); 
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
            if (a.needsPortal) {
                // Enable animation. 
                SparkUtility.setPatchPulse(this.portalAnim);
                // Release the agent. 
                Time.setTimeout(() => {
                    a.spawn(); 
                    this.scheduleNextAgent(); 
                }, PORTAL_ANIMATION_TIME); 
            } else {
                a.spawn();
                this.scheduleNextAgent(); 
            }
        }
    }

    scheduleNextAgent() {
        this.curSpawnIdx++;
        Time.setTimeout(() => {
            this.releaseAgents();           
        }, STAGGER_TIME); 
    }

    handleTap(agentIdx) {
        if (this.curWorldState !== WORLD_STATE.SPAWN) {
            // We already know that an agent was tapped here. 
            let a = this.agents[agentIdx]; 
            
            // Don't try and excite the agent if it's already dead or if it's already excited. 
            if (a.deathCounter > 0 & !a.isExcited) {
                a.enableExcitation(this.deathManager); 
                this.instructionsManager.incrementTap(this.curWorldState);
                this.audioManager.playInteractSound(); 
            }
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

                // Clear pending instructions. 
                this.instructionsManager.clearPrevInstruction(); 
                this.instructionsManager.setMultipleInstructions(IState.SOUND_ON, 
                    IState.MOVE_CLOSER, IState.TAP_CHANGE);
                
                // Future next state. 
                this.scheduleStateChange(WORLD_STATE.FLOCK_HOOD, 30000); // 30 seconds of flocking at phone. 
                break;
            }

            case WORLD_STATE.FLOCK_PHONE: {
                // Override. 
                Time.clearTimeout(this.nextStateTimer); 

                // Set current state. 
                this.curWorldState = WORLD_STATE.FLOCK_HOOD; 
                Diagnostics.log('New State: FLOCK_HOOD'); 

                break;
            }

            case WORLD_STATE.FLOCK_HOOD: {
                // Override. 
                Time.clearTimeout(this.nextStateTimer);

                // Set current state. 
                this.curWorldState = WORLD_STATE.PATTERN_HOOD;
                Diagnostics.log('New State: PATTERN_HOOD');  

                this.scheduleStateChange(WORLD_STATE.PATTERN_HOOD, 20000); 
                break;
            }

            case WORLD_STATE.PATTERN_HOOD: {
                // Override. 
                Time.clearTimeout(this.nextStateTimer); 

                // Set current state. 
                this.curWorldState = WORLD_STATE.REST_HOOD; 
                Diagnostics.log('New State: REST_HOOD'); 

                break;
            }

            case WORLD_STATE.REST_HOOD: {
                // Override. 
                Time.clearTimeout(this.nextStateTimer); 

                // Set current state. 
                this.curWorldState = WORLD_STATE.FLOCK_PHONE; 
                Diagnostics.log('New State: FLOCK_PHONE'); 

                // Activate all the agents that are sleeping. 
                this.agents.forEach(a => {
                    // Only resurrect the alive agents. 
                    if (a.deathCounter > 0 && !a.isActive) {
                        a.isActive = true; 
                    }
                }); 
                break;
            }

            default: {
                break; 
            }
        }
    }

    scheduleStateChange(nextState, time) {
        this.nextStateTimer = Time.setTimeout(() => {
            switch (nextState) {
                case WORLD_STATE.FLOCK_HOOD: {
                    // Set current state. 
                    this.curWorldState = WORLD_STATE.FLOCK_HOOD; 
                    Diagnostics.log('New State: FLOCK_HOOD'); 

                    // Future next state. 
                    this.scheduleStateChange(WORLD_STATE.PATTERN_HOOD, 20000); // 30 seconds of flocking at hood. 
                    break;
                }

                case WORLD_STATE.PATTERN_HOOD: {
                    // Set current state. 
                    this.curWorldState = WORLD_STATE.PATTERN_HOOD; 
                    Diagnostics.log('New State: PATTERN_HOOD'); 

                    // Future next state. 
                    this.scheduleStateChange(WORLD_STATE.REST_HOOD, 20000); // 30 seconds of patterns at hood. 
                    break; 
                }

                case WORLD_STATE.REST_HOOD: {
                    // Set current state. 
                    this.curWorldState = WORLD_STATE.REST_HOOD; 
                    Diagnostics.log('New State: REST_HOOD'); 

                    // Future next state. 
                    this.scheduleStateChange(WORLD_STATE.FLOCK_PHONE, 15000); // 20 seconds of resting at hood. 
                    break; 
                }

                case WORLD_STATE.FLOCK_PHONE: {
                    // Set current state. 
                    this.curWorldState = WORLD_STATE.FLOCK_PHONE; 
                    Diagnostics.log('New State: FLOCK_PHONE'); 

                    // Future next state. 
                    this.scheduleStateChange(WORLD_STATE.FLOCK_HOOD, 20000); // 20 seconds of flocking at phone. 
                    break; 
                }

                default: {
                    // Set current state. 
                    this.curWorldState = WORLD_STATE.FLOCK_PHONE;
                    Diagnostics.log('Default State Break: FLOCK_PHONE'); 
                    
                    // Future next state. 
                    this.scheduleStateChange(WORLD_STATE.FLOCK_HOOD, 20000); // 15 seconds of flocking at phone. 
                }
            }
        }, time); 
    }
}