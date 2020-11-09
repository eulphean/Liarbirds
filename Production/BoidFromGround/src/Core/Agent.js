// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
const Time = require('Time'); 

import { BaseAgent } from './BaseAgent.js'
import { ANIMATION_STATE, ROTATION_SPEED, AGENT_SPEED } from '../Utilities/AgentUtility.js'
import * as SparkUtility from '../Utilities/SparkUtility.js';
import { Vector3 } from 'math-ds';

const EXCITATION_TIME = 3000; 
export class Agent extends BaseAgent {
    constructor(obj) {
        super(obj); 

        // SPAWN / PHONE_TARGET State variable. g
        this.hasTouchedInitialTarget = false; 

        // Script to patch bridge variables. 
        this.animationString = 'animationNum' + this.agentIdx.toString(); 
        this.rotationString = 'rotSpeed' + this.agentIdx.toString();
        this.setAnimation(ANIMATION_STATE.CURL); 
        this.setRotationSpeed(ROTATION_SPEED.NONE); 

        // Velocity when it has reached the rest state. 
        this.faceVelocity = new Vector3(0, 0.1, 0);
        this.initialVelocity = new Vector3(0, 0, 0);
        this.initialVelocity.copy(this.velocity); // Save the initial velocity. 

        // Flag to keep the excitation in check. 
        this.isExcited = false; 
    }

    // Spawn state. 
    spawn() {
        this.setAnimation(ANIMATION_STATE.SWIM_SLOW); 
        this.setAgentSpeed(AGENT_SPEED.LOW);
        this.setRotationSpeed(ROTATION_SPEED.SLOW);

        // Show the agent if it's hidden. 
        this.sceneObject.hidden = false;
        this.isActive = true; 
    }

    evaluateInitialTarget(phoneTarget) {
        if (!this.hasTouchedInitialTarget) {
            // Update target as soon as we know that we have reached the initial target. 
            let d = this.diffVec.subVectors(this.target, this.position).lengthSquared();
            // Have I reached initial target? 
            if (d < this.arriveTolerance) {
                this.hasTouchedInitialTarget = true; 
            }
        } else {
            this.target.copy(phoneTarget); 
        }
    } 

    evaluateRestTarget() {
        let d = this.diffVec.subVectors(this.target, this.position).lengthSquared(); 
        if (d < this.arriveTolerance) { // Have I reached? 
            // this.velocity = this.velocity.lerp(this.faceVelocity, 0.02); 
            this.isActive = false; 
        }
    }

    evaluateDeathTarget() {
        let d = this.diffVec.subVectors(this.target, this.position).lengthSquared(); 
        if (d < this.arriveTolerance) { // Have I reached? 
           // What to do when the agent has died? 
           arguments.isActive = false; 
        }
    }

    // TODO: Lerp rotation value. 
    enableExcitation(deathManager) {   
        // Am I dead? 
        if (this.deathCounter > 0) {
            Diagnostics.log(this.agentIdx + ': ' + this.deathCounter); 
            // Am I currently excited? 
            if (!this.isExcited) {
                this.setAnimation(ANIMATION_STATE.SWIM_FAST); 
                this.setRotationSpeed(ROTATION_SPEED.FAST);
                this.isExcited = true; 

                // Schedule the excitation to finish after some time. 
                Time.setTimeout(() => {
                    this.setAnimation(ANIMATION_STATE.SWIM_SLOW); 
                    this.setRotationSpeed(ROTATION_SPEED.SLOW); 
                    this.isExcited = false; 
                    this.deathCounter--; 

                    // Maybe this was the agent's last rotation. 
                    if (this.deathCounter === 0) {
                        Diagnostics.log('Initiating death sequence'); 
                        // DEAD DEAD DEAD
                        this.setRotationSpeed(ROTATION_SPEED.DEATH);
                        this.setAnimation(ANIMATION_STATE.CURL); 
                        this.setAgentSpeed(AGENT_SPEED.REST);
                        // Calculates the death target and shows the bed there. 
                        deathManager.calcDeathTarget(this.agentIdx, this.position);
                    }
                }, EXCITATION_TIME); 
            }
        }
    }

    // Set a new target on the agent. 
    setTarget(targetVector) {
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