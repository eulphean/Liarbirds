// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

import { ANIMATION_STATE, ROTATION_SPEED, AGENT_SPEED, BaseAgent,  } from './BaseAgent.js'
import * as SparkUtility from './SparkUtility.js';

export class Agent extends BaseAgent {
    constructor(obj) {
        super(obj); 

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
    setTapUpdates() {          
        this.setAnimation(ANIMATION_STATE.SWIM_FAST); 
        this.setRotationSpeed(ROTATION_SPEED.FAST);
        this.updateDeathCounter(); 
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