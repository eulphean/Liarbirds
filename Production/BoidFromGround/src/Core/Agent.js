// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
const Time = require('Time'); 

import { BaseAgent } from './BaseAgent.js'
import { ANIMATION_STATE, ROTATION_SPEED, AGENT_SPEED } from '../Utilities/AgentUtility.js'
import * as SparkUtility from '../Utilities/SparkUtility.js';
import { Vector3 } from 'math-ds';

const EXCITATION_TIME = 4000; 
export class Agent extends BaseAgent {
    constructor(obj) {
        super(obj); 

        // SPAWN / PHONE_TARGET State variable. g
        this.hasReachedInitialTarget = false; 

        // Script to patch bridge variables. 
        this.animationString = 'animationNum' + this.agentIdx.toString(); 
        this.rotationString = 'rotSpeed' + this.agentIdx.toString();
        this.setAnimation(ANIMATION_STATE.CURL); 

        this.faceVelocity = new Vector3(0, 0.1, 0); 
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
    evaluateInitialSpawnTarget(phoneTarget) {
        if (!this.hasReachedInitialTarget) {
            // Update target as soon as we know that we have reached the initial target. 
            let d = this.diffVec.subVectors(this.target, this.position).lengthSquared(); 
            if (d < this.arriveTolerance) { // Have I reached? 
                this.hasReachedInitialTarget = true; 
            }
        } else {
            this.target.copy(phoneTarget); 
        }
    } 

    evaluateRestTarget() {
        let d = this.diffVec.subVectors(this.target, this.position).lengthSquared(); 
        if (d < this.arriveTolerance) { // Have I reached? 
            this.velocity = this.velocity.lerp(this.faceVelocity, 0.02); 
        }
    }

    evaluateDeath() {
        if (this.deathCounter === 0) {
            // Override target

        }
    }

    // TODO: Lerp rotation value. 
    enableExcitation(deathManager) {   
        this.deathCounter--; 

        // Am I not dead yet? 
        if (this.deathCounter > 0) {
            Diagnostics.log('Agent Excited'); 
            this.setAnimation(ANIMATION_STATE.SWIM_FAST); 
            this.setRotationSpeed(ROTATION_SPEED.FAST);
            Time.setTimeout(() => {
                this.setAnimation(ANIMATION_STATE.SWIM_SLOW); 
                this.setRotationSpeed(ROTATION_SPEED.SLOW); 
            }, EXCITATION_TIME); 
        }
        else {
            Diagnostics.log('Beginning death sequence'); 
            this.setAgentSpeed(AGENT_SPEED.DEATH);
            this.setAnimation(ANIMATION_STATE.CURL); 
            this.setRotationSpeed(ROTATION_SPEED.NONE);
            // Calculates the death target and shows the bed there. 
            deathManager.calcDeathTarget(this.agentIdx, this.position);
            // this.target.copy(deathTarget); 
        }
    }

    setHoodTarget(targetVector) {
        this.target.copy(targetVector); 
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