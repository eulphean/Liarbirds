// Agent.js
// Core class that represents the agent. 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

import * as Utility from './Utility.js';
import * as CANNON from 'cannon-es';
import Octree from './Octree.js'

export default class Agent {
    constructor(obj) {
        // Scene object. 
        this.sceneObject = obj['agent']; 
        this.targetObject = obj['target']; 

        // Core Vec3 to determine agent's whereabouts. These should be reused aggressively to avoid the need
        // to create new Vec3s on the fly. That's expensive. 
        this.position = Utility.getLastPosition(this.sceneObject); // don't need this but let it be here. 
        this.velocity = new CANNON.Vec3(0, 0, 0); 
        this.acceleration = new CANNON.Vec3(0, 0, 0); 
        this.rotation = Reactive.quaternionFromAngleAxis(0, Reactive.vector(0, 1, 0));
        this.target = Utility.getLastPosition(this.targetObject); 
        this.initialTargetPosition = Utility.getLastPosition(this.targetObject); // Save this to be reused during spawning. 
        this.fSteer = new CANNON.Vec3(0, 0, 0); 
        this.sumVec = new CANNON.Vec3(0, 0, 0); // Use for behaviors. 

        // [Critical] Constants to determine how the agent moves. 
        // maxForce determines the maximum acceleration
        // maxSpeed determines the maximum velocity
        this.maxSpeed = 0.01; 
        this.maxSlowDownSpeed = 0; 
        this.maxForce = 0.01;
        
        // [Critical] Constants to determine the agent's arrival behavior.
        // Note this distance*distance
        this.arriveTolerance = 0.05 * 0.05; 
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
        this.seperationWeight = 1.5; // Keep this weight high / Higher than maxForce 

        // Cohesion
        this.cohesionWeight = 0.1; // Keep this weight high / Higher than maxForce 

        // Alignment
        this.alignmentWeight = 2.0; // Keep this weight high / Higher than maxForce 
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
            let d = this.target.vsub(this.position).lengthSquared(); 
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
        this.target.vsub(this.position, this.fSteer); 
        let d = this.fSteer.lengthSquared();
        this.fSteer.normalize();

        if (d < this.slowDownTolerance && d > this.arriveTolerance) {
            // Start slowing down. 
            let newMaxSpeed = Utility.map_range(d, this.arriveTolerance, this.slowDownTolerance, this.maxSlowDownSpeed, this.maxSpeed); 
            this.fSteer.scale(newMaxSpeed, this.fSteer); 
        } else {
            // We are still trying to get to the target. 
            this.fSteer.scale(this.maxSpeed, this.fSteer); 
        }

        this.fSteer.vsub(this.velocity, this.fSteer); 
        this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
    }

    applyForce() {
        this.acceleration.vadd(this.fSteer, this.acceleration); 
    }  

    updatePosition() {
        // What's my target velocity? 
        let targetVelocity = this.velocity.vadd(this.acceleration); 
        
        // What's my intermediate velocity? 
        // Lerp the velocity rather than just updating straight up.
        this.velocity.lerp(targetVelocity, this.smoothFactor, this.velocity); 
        this.velocity = Utility.clamp(this.velocity, this.maxSpeed); 

        // Calculate position. 
        this.position.vadd(this.velocity, this.position); 

        this.acceleration.scale(0, this.acceleration); // Reset acceleration.
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

        if (nAgents.length > 0) {
            nAgents.forEach(a => {
                let diff = this.position.vsub(a.position); 
                diff.normalize(); 
                diff.scale(1/diff.length(), diff); // Weight the vector properly based on the distance from the target. 
                this.sumVec.vadd(diff, this.sumVec); 
            });
            
            // Calculate desired force using the average desired velocity 
            this.sumVec.scale(1/nAgents.length); 
            if (this.sumVec.lengthSquared() > 0) {
                this.sumVec.normalize(); 
                this.sumVec = Utility.clamp(this.sumVec, this.maxSpeed); 
                this.sumVec.vsub(this.velocity, this.fSteer);
                this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
                this.fSteer.scale(this.seperationWeight, this.fSteer); // Apply seperation weight. 
            }
        }
    }

    // Receives neighboring agents using Octree calculations. 
    cohesion(nAgents) {
        this.target.set(0, 0, 0); 
        this.fSteer.set(0, 0, 0); 

        if (nAgents.length > 0) {
            nAgents.forEach(a => {
                this.target.vadd(a.position, this.target); 
            }); 

            this.target.scale(1/nAgents.length, this.target); 
            this.seek(); // Seek the new target
            this.fSteer.scale(this.cohesionWeight, this.fSteer); 
        }
    }

    // Receives neighboring agents using Octree calculations. 
    align(nAgents) {
        this.fSteer.set(0, 0, 0); 

        if (nAgents.length > 0) {
            nAgents.forEach(a => {
                this.fSteer.vadd(a.velocity, this.fSteer); 
            }); 
        
            this.fSteer.scale(1/nAgents.length, this.fSteer); 
            this.fSteer.normalize(); 
            this.fSteer.scale(this.maxSpeed, this.fSteer); 
            this.fSteer.vsub(this.velocity, this.fSteer); 
            this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
            this.fSteer.scale(this.alignmentWeight, this.fSteer); // Apply alignment weight. 
        }
    }
}