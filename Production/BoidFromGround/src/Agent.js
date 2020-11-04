// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

import * as Utility from './Utility.js';
import { Euler, Matrix4, Quaternion, Vector3 } from 'math-ds'

// Store baked animation. 
export const BakedAnimation = {
    CURL : 0,
    SWIM_SLOW : 1,
    SWIM_FAST : 2
}; 

// Enum to set different agent agility speeds. 
// [Critical] Constants to determine how the agent moves in the space.  
// Sets this.maxForce, this.maxSpeed, this.maxSlowDownSpeed, and agent's rotationSpeed. 
const Agility = {
    LOW: {
        FORCE: 0.002,
        SPEED: 0.002,
        SLOWSPEED: 0.001,
        ROTSPEED: 5
    }, 

    MEDIUM: {
        FORCE: 0.005,
        SPEED: 0.003,
        SLOWSPEED: 0.001,
        ROTSPEED: 2
    },

    HIGH: {
        FORCE: 0.01,
        SPEED: 0.005,
        SLOWSPEED: 0.001,
        ROTSPEED: 0.5
    }
}

// State to keep track of what the agent is currently doing. 
const SeekState = {
    WORLD_TARGET: 0, 
    PHONE_TARGET: 1
}

export class Agent {
    constructor(obj) {
        // Scene object. 
        this.sceneObject = obj['agent']; 
        this.targetObject = obj['target']; 

        // Core Vec3 to determine agent's whereabouts. These should be reused aggressively to avoid the need
        // to create new Vec3s on the fly. That's expensive. 
        this.position = Utility.getLastPosition(this.sceneObject); // don't need this but let it be here. 
        this.velocity = obj['velocity']; 
        this.acceleration = new Vector3(0, 0, 0); 
        this.rotationA = new Quaternion(0, 0, 0, 0); 
        this.rotationB = new Quaternion(0, 0, 0, 0); 
        this.euler = new Euler(0, 0, 0); 
        this.mat = new Matrix4(); 
        this.target = Utility.getLastPosition(this.targetObject); 
        this.initialTargetPosition = Utility.getLastPosition(this.targetObject); // Save this to be reused during spawning. 
        this.fSteer = new Vector3(0, 0, 0); 
        this.sumVec = new Vector3(0, 0, 0); // Helper sum keeper for vector calculation. 
        this.diffVec = new Vector3(0, 0, 0); // Helper subtractor for vector calculation. 

        // Script to patch bridge variables. 
        this.currentAnimation = BakedAnimation.CURL; 
        this.animationString = 'animationNum' + obj['idx'].toString(); 
        this.rotationString = 'rotSpeed' + obj['idx'].toString();
        this.setAnimation(this.currentAnimation); 

        // Target tracking state. 
        this.seekState = SeekState.WORLD_TARGET; // Always start the world target. 

        // [Critical] Constants to determine the agent's arrival behavior.
        // Note this distance*distance
        this.arriveTolerance = 0.02 * 0.02; 
        this.slowDownTolerance = 0.10 * 0.10; 

        // When agent is awake, then it's visible, 
        // else it's sleeping and invisible by default. 
        this.awake = false; 

        // Lerp factor that we use to smooth rotations. 
        // Higher number indicates a faster rotation, whereas lower is smoother. 
        this.smoothFactor = 0.01; 

        // Flocking behavior weights. 

        // Seperation
        this.seperationWeight = 1.5; // Keep this weight high / Higher than maxForce 

        // Cohesion
        this.cohesionWeight = 1.0; // Keep this weight high / Higher than maxForce 

        // Alignment
        this.alignmentWeight = 0.2; // Keep this weight high / Higher than maxForce 

        // Randomly set this on agent creation. 
        // When it's 0, agent is not awake anymore. 
        this.deathCounter = Utility.random(2, 5);
    }

    // Function declaration. 
    update(nAgents, targetSnapshot) {
        // Calculate and apply forces for agent behaviors. 
        this.applyBehaviors(nAgents, targetSnapshot);  

        // Update local position based on current velocity and acceleration. 
        this.updatePosition(); 
        
        // Sync local rotation to scene object's rotation. 
        this.syncRotation();

        // Sync local vector position to scene object's position.
        this.syncPosition(); 
    }

    // Flocking behavior. 
    applyBehaviors(nAgents, targetSnapshot) {
        // ATTRACTOR 
        this.seekCameraTarget(targetSnapshot);
        
        // FLOCKING
        this.flock(nAgents); 
    }

    flock(nAgents) {
        if (this.seekState === SeekState.PHONE_TARGET) {
            // SEPERATION
            this.seperation(nAgents); 
            this.applyForce(); 

            // COHESION
            this.cohesion(nAgents); 
            this.applyForce(); 

            // ALIGNMENT
            this.align(nAgents); 
            this.applyForce();
        }
    }

    seekCameraTarget(targetSnapshot) {
        // Update target as soon as we know that we have reached the initial target. 
        if (this.seekState === SeekState.WORLD_TARGET) {
            let d = this.diffVec.subVectors(this.target, this.position).lengthSquared(); 
            if (d < this.arriveTolerance) {
                this.seekState = SeekState.PHONE_TARGET; 
                this.setAgentAgility(Agility.LOW);
                this.setAnimation(BakedAnimation.SWIM_SLOW); 
            }
        } else {
            this.target.set(targetSnapshot['lastTargetX'], targetSnapshot['lastTargetY'], targetSnapshot['lastTargetZ']);
        }

        this.seek(); // Calculates new fSteer.
        this.applyForce(); // Applies fSteer to the acceleration. 
    }

    // SteerForce = VDesired - VActual
    seek() {
        // If target hasn't changed, we don't seek. 
        this.fSteer.subVectors(this.target, this.position); 
        let d = this.fSteer.lengthSquared();
        this.fSteer.normalize();

        if (d < this.slowDownTolerance && d > this.arriveTolerance) {
            // Start slowing down. 
            let newMaxSpeed = Utility.map_range(d, this.slowDownTolerance, this.arriveTolerance, this.maxSpeed, this.maxSlowDownSpeed); 
            this.fSteer.multiplyScalar(newMaxSpeed); 
        } else {
            // We are still trying to get to the target. 
            this.fSteer.multiplyScalar(this.maxSpeed); 
        }

        this.fSteer.sub(this.velocity); 
        this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
    }

    applyForce() {
        this.acceleration.add(this.fSteer); 
    }  

    updatePosition() {
        // What's my target velocity? 
        this.sumVec.addVectors(this.velocity, this.acceleration); 
        
        // What's my intermediate velocity? 
        // Lerp the velocity rather than just updating straight up.
        this.velocity = this.velocity.lerp(this.sumVec, this.smoothFactor); 
        this.velocity = Utility.clamp(this.velocity, this.maxSpeed); 

        // Calculate position. 
        this.position.add(this.velocity); 

        // Reset acceleration. 
        this.acceleration.multiplyScalar(0); // Reset acceleration.
    }

    syncPosition() {
        Utility.syncSceneObject(this.sceneObject, this.position); 
    }

    syncRotation() {
        let azimuth = Utility.azimuth(this.velocity); 
        let inclination = Utility.inclination(this.velocity);

        Utility.axisRotation(0, 0, 1, azimuth - Math.PI/2, this.rotationA); 
        Utility.axisRotation(1, 0, 0, Math.PI/2 - inclination, this.rotationB); 

        // NOTE: A conversion from Quaternion to Euler is necessary to avoid creating a
        // new Reactive signal on every update. 
        this.rotationA.multiply(this.rotationB); 
        this.mat.makeRotationFromQuaternion(this.rotationA);
        this.euler.setFromRotationMatrix(this.mat, 'ZYX'); // OVERRIDE the rotation order because this is what Spark suppports. 

        this.sceneObject.transform.rotationX = this.euler.x; 
        this.sceneObject.transform.rotationY = this.euler.y; 
        this.sceneObject.transform.rotationZ = this.euler.z; 
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

    // Receives neighboring agents using Octree calculations. 
    seperation(nAgents) {
        this.fSteer.set(0, 0, 0); 
        this.sumVec.set(0, 0, 0); 

        if (nAgents.length > 0) {
            nAgents.forEach(a => {
                this.diffVec.subVectors(this.position, a.position); 
                this.diffVec.normalize(); 
                this.diffVec.divideScalar(this.diffVec.length());  // Weight the vector properly based on the distance from the target. 
                this.sumVec.add(this.diffVec); 
            });
            
            // Calculate desired force using the average desired velocity 
            this.sumVec.divideScalar(nAgents.length); 
            if (this.sumVec.lengthSquared() > 0) {
                this.sumVec.normalize(); 
                this.sumVec = Utility.clamp(this.sumVec, this.maxSpeed); 
                this.fSteer.subVectors(this.sumVec, this.velocity);
                this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
                this.fSteer.multiplyScalar(this.seperationWeight); // Apply seperation weight. 
            }
        }
    }

    // Receives neighboring agents using Octree calculations. 
    cohesion(nAgents) {
        this.target.set(0, 0, 0); 
        this.fSteer.set(0, 0, 0); 

        if (nAgents.length > 0) {
            nAgents.forEach(a => {
                this.target.add(a.position); 
            }); 

            this.target.divideScalar(nAgents.length); 
            this.seek(); // Seek the new target
            this.fSteer.multiplyScalar(this.cohesionWeight); 
        }
    }

    // Receives neighboring agents using Octree calculations. 
    align(nAgents) {
        this.fSteer.set(0, 0, 0); 

        if (nAgents.length > 0) {
            nAgents.forEach(a => {
                this.fSteer.add(a.velocity); 
            }); 
        
            this.fSteer.divideScalar(nAgents.length); 
            this.fSteer.normalize(); 
            this.fSteer.multiplyScalar(this.maxSpeed); 
            this.fSteer.sub(this.velocity); 
            Utility.clamp(this.fSteer, this.maxForce); 
            this.fSteer.multiplyScalar(this.alignmentWeight); // Apply alignment weight. 
        }
    }

    calcNewTarget() {
        // Have I reached the target or am I forcing a recalculation of the target? 
        let wanderD = 0.2; // Max wander distance
        let wanderR = 0.05;
        let thetaChange = 10; 
        let wanderTheta = Utility.random(-thetaChange, thetaChange); 

        this.target.set(this.initialTargetPosition.x, this.initialTargetPosition.y, this.initialTargetPosition.z); 
        // this.target.normalize(); // Get the heading of the agent. 
        // this.target.multiplyScalar(wanderD); // Scale it.
        // this.target.add(this.initialTargetPosition); // Make it relative to the original target position. 

        let azimuth = Utility.azimuth(this.target); 
        let inclination = Utility.inclination(this.target);

        // Calculate New Target. 
        let xPos = wanderR * Math.cos(azimuth + wanderTheta);
        let yPos = wanderR * Math.sin(azimuth + wanderTheta);
        let zPos = wanderR * Math.cos(inclination + wanderTheta); 
        let pOffset = new Vector3(xPos, yPos, zPos); 
        this.target.add(pOffset); // With respect to current position 

        // Sync the target scene object to the target. 
        Utility.syncSceneObject(this.targetObject, this.target); 
    }  
}