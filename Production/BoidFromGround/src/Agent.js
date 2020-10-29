// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

import * as Utility from './Utility.js';
import { Vector3 } from 'math-ds'

export default class Agent {
    constructor(obj) {
        // Scene object. 
        this.sceneObject = obj['agent']; 
        this.targetObject = obj['target']; 

        // Core Vec3 to determine agent's whereabouts. These should be reused aggressively to avoid the need
        // to create new Vec3s on the fly. That's expensive. 
        this.position = Utility.getLastPosition(this.sceneObject); // don't need this but let it be here. 
        this.velocity = new Vector3(0, 0, 0); 
        this.acceleration = new Vector3(0, 0, 0); 
        this.rotation = Reactive.quaternionFromAngleAxis(0, Reactive.vector(0, 1, 0));
        this.target = Utility.getLastPosition(this.targetObject); 
        this.initialTargetPosition = Utility.getLastPosition(this.targetObject); // Save this to be reused during spawning. 
        this.fSteer = new Vector3(0, 0, 0); 
        this.sumVec = new Vector3(0, 0, 0); // Helper sum keeper  for vector calculation. 
        this.diffVec = new Vector3(0, 0, 0); // Helper subtractor for vector calculation. 

        // [Critical] Constants to determine how the agent moves. 
        // maxForce determines the maximum acceleration
        // maxSpeed determines the maximum velocity
        this.maxSpeed = 0.002; 
        this.maxSlowDownSpeed = 0; 
        this.maxForce = 0.005;
        
        // [Critical] Constants to determine the agent's arrival behavior.
        // Note this distance*distance
        this.arriveTolerance = 0.02 * 0.02; 
        this.slowDownTolerance = 0.15 * 0.15; 

        // When agent is awake, then it's visible, 
        // else it's sleeping and invisible by default. 
        this.awake = false; 

        this.hasReachedInitialTarget = false; 

        // Lerp factor that we use to smooth rotations. 
        // Higher number indicates a faster rotation, whereas lower is smoother. 
        this.smoothFactor = 0.02; 

        // Flocking behavior weights. 

        // Seperation
        this.seperationWeight = 0.5; // Keep this weight high / Higher than maxForce 

        // Cohesion
        this.cohesionWeight = 0.3; // Keep this weight high / Higher than maxForce 

        // Alignment
        this.alignmentWeight = 0.5; // Keep this weight high / Higher than maxForce 
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
        if (this.hasReachedInitialTarget) {
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
        if (!this.hasReachedInitialTarget) {
            let d = this.diffVec.subVectors(this.target, this.position).lengthSquared(); 
            if (d < this.arriveTolerance) {
                this.hasReachedInitialTarget = true; 
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

    // [CAUTION] Do not modify this function. 
    syncRotation() {
        let azimuth = Utility.azimuth(this.velocity); 
        let inclination = Utility.inclination(this.velocity);

        // Yaw / Roll (rotate around Z-axis)
        let r = Utility.axisRotation(0, 0, 1, azimuth - Math.PI/2); 

        // Pitch (rotate by Elevation around X-axis)
        r = r.mul(Utility.axisRotation(1, 0, 0, Math.PI/2 - inclination)); // Accumulate rotation using Quaternions. 
        this.sceneObject.transform.rotation = r;  // Assign rotation.
    }

    spawn(spawnLocation) {
        if (this.awake) {
            // Reset first. 
            this.hardReset(); 
        }

        // Update position to spawn point. 
        this.position.copy(spawnLocation); 

        // Make the agent visible and awake. 
        this.sceneObject.hidden = false; 
        this.awake = true; 
    }

    hardReset() {
        // Reset all the parameters to original parameters. 
        this.velocity.set(0, 0, 0); 
        this.acceleration.set(0, 0, 0); 
        this.target.copy(this.initialTargetPosition); 
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
}