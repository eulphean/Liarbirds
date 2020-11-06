// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

import { BaseAgent } from './BaseAgent.js'
import { ANIMATION_STATE, ROTATION_SPEED, AGENT_SPEED } from '../Utilities/AgentUtility.js'
import * as SparkUtility from '../Utilities/SparkUtility.js';

export class Agent extends BaseAgent {
    constructor(obj) {
        super(obj); 

        // SPAWN / PHONE_TARGET State variable. g
        this.hasReachedInitialTarget = false; 

        // Script to patch bridge variables. 
        this.animationString = 'animationNum' + obj['idx'].toString(); 
        this.rotationString = 'rotSpeed' + obj['idx'].toString();
        this.setAnimation(ANIMATION_STATE.CURL); 
    }

    spawn() {
        this.setAnimation(ANIMATION_STATE.SWIM_SLOW); 
        this.setAgentSpeed(AGENT_SPEED.LOW);
        this.setRotationSpeed(ROTATION_SPEED.SLOW);

        // Show the agent if it's hidden. 
        this.sceneObject.hidden = false;
        this.awake = true; 
    }

    // NOTE: Contentious method. Be careful. 
    // TODO: Very tricky function. Clean it up with. 
    evaluateSeekTarget(targetSnapshot) {
        if (!this.hasReachedInitialTarget) {
            // Update target as soon as we know that we have reached the initial target. 
            let d = this.diffVec.subVectors(this.target, this.position).lengthSquared(); 
            if (d < this.arriveTolerance) { // Have I reached? 
                this.hasReachedInitialTarget = true; 
            }
        } else {
            this.target.set(targetSnapshot['lastTargetX'], targetSnapshot['lastTargetY'], targetSnapshot['lastTargetZ']);
        }
    } 

    // Called when agent is within the 
    // TODO: These should lerp. 
    // Use Patch editor to lerp values. 
    enableRotations() {          
        this.setAnimation(ANIMATION_STATE.SWIM_FAST); 
        this.setRotationSpeed(ROTATION_SPEED.FAST);
        this.updateDeathCounter(); 

        // TODO: Set a timer to disable Rotations. 
        // Disable rotations after a certain time. 
    }

    updateDeathCounter() {
        if (this.deathCounter > 0) {
            this.deathCounter--; 
        }

        if (this.deathCounter === 0) {
            this.setAnimation(BakedAnimation.CURL); 
            this.awake = false; 
        }
    }

    setAgentSpeed(aSpeed) {
        this.maxForce = aSpeed.FORCE; 
        this.maxSpeed = aSpeed.SPEED;
        this.maxSlowDownSpeed = aSpeed.SLOWSPEED;  
    }  

    setAnimation(ani) {
        SparkUtility.setPatchVariable(this.animationString, ani);
    }

    setRotationSpeed(rotSpeed) {
        // TODO: Lerp this variable. 
        SparkUtility.setPatchVariable(this.rotationString, rotSpeed); 
    }
}