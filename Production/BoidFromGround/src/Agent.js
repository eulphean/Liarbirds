// Agent.js
// Core class that represents the agent. 
// [TODO] Activate 
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
import * as Utility from './Utility.js';
import * as CANNON from 'cannon-es';

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
        this.maxSpeed = 0.005; 
        this.maxSlowDownSpeed = 0.0005; 
        this.maxForce = 0.01;
        
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
        this.smoothFactor = 0.03; 

        // Flocking behavior weights. 

        // Seperation
        this.seperationWeight = 0.03; // Keep this weight high / Higher than maxForce 
        this.seperationPerceptionRad = 0.04; 

        // Cohesion
        this.cohesionWeight = 0.02; // Keep this weight high / Higher than maxForce 
        this.cohesionPerceptionRad = 0.15; 

        // Alignment
        this.alignmentWeight = 0.005; // Keep this weight high / Higher than maxForce 
        this.alignmentPerceptionRad = 0.15; 
    }

    // Function declaration. 
    update(agents, camTarget) {
        // Calculate and apply forces for agent behaviors. 
        this.applyBehaviors(agents, camTarget);  

        // Update local position based on current velocity and acceleration. 
        this.updatePosition(); 
        
        // Sync local rotation to scene object's rotation. 
        this.syncRotation();

        // Sync local vector position to scene object's position.
        this.syncPosition(); 
    }

    // Flocking behavior. 
    applyBehaviors(agents, camTarget) {
        this.seekCameraTarget(camTarget);
    }

    seekCameraTarget(camTarget) {
        // Update target as soon as we know that we have reached the initial target. 
        if (!this.hasReachedInitialTarget) {
            let d = this.target.vsub(this.position).lengthSquared(); 
            if (d < this.arriveTolerance) {
                this.hasReachedInitialTarget = true; 
            }
        } else {
            this.target.set(camTarget['lastTargetX'], camTarget['lastTargetY'], camTarget['lastTargetZ']);
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
}