// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

import { BaseAgent } from './BaseAgent.js'
import * as Utility from './Utility.js';

export class Agent extends BaseAgent {
    constructor(obj) {
        super(obj); 
         
         // Script to patch bridge variables. 
         this.currentAnimation = BakedAnimation.CURL; 
         this.animationString = 'animationNum' + obj['idx'].toString(); 
         this.rotationString = 'rotSpeed' + obj['idx'].toString();
         this.setAnimation(this.currentAnimation); 
 
         // Target tracking state. 
         this.seekState = SeekState.WORLD_TARGET; // Always start the world target. 
    }

    spawn() {
        this.setAnimation(BakedAnimation.SWIM_SLOW); 
        this.setAgentAgility(Agility.LOW);

        // Make the agent visible and awake. 
        this.sceneObject.hidden = false; 
        this.awake = true; 
    }

    setAgentAgility(agility) {
        this.maxForce = agility.FORCE; 
        this.maxSpeed = agility.SPEED;
        this.maxSlowDownSpeed = agility.SLOWSPEED;
        this.setRotationSpeed(agility.ROTSPEED);  
    }   

    setAnimation(ani) {
        Utility.setPatchVariable(this.animationString, ani);
        this.currentAnimation = ani; 
    }

    setAnimation(ani) {
        Utility.setPatchVariable(this.animationString, ani);
        this.currentAnimation = ani; 
    }

    setRotationSpeed(rotSpeed) {
        Utility.setPatchVariable(this.rotationString, rotSpeed); 
    }

    // Called when agent is within the 
    setTapUpdates() {          
        this.setAnimation(BakedAnimation.SWIM_FAST); 
        this.setAgentAgility(Agility.MEDIUM); 
        this.calcNewTarget(); 
        this.updateDeathCounter(); 

        // Scare the agent and seek the world target close to to the spawn point. 
        this.seekState = SeekState.WORLD_TARGET; 
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
}