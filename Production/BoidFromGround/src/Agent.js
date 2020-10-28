// Agent.js
// Class that wraps the SceneObject. Holds the soft body that movies around in the physics world. 
// TODO: Disable collision, Make the bodies Kinematic (only velocies affect them), Turn off rotation on spheres. 

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
    update(agents) {
        // Calculate 
        this.applyBehaviors();  

        // Update current position based on velocity. 
        this.updatePosition(); 

        // [Animation Hook] for the movement of wings, etc. 
        
        // Rotate the object first, then update the position. 
        this.syncRotation();

        // Sync current position with the Scene object's transform. 
        this.syncPosition(); 
    }

    // Flocking behavior. 
    applyBehaviors(agents) {
        // // Seperation
        // this.seperation(agents); 
        // this.applyForce(); 
        
        // // // Cohesion
        // this.cohesion(agents);
        // this.applyForce(); 

        // this.align(agents); 
        // this.applyForce(); 

        // this.seek(this.initialTargetPosition);
        // this.applyForce();


        // Have I reached a target? 
       // this.calcTarget(); 
        this.seek(); // Calculates new fSteer.
        this.applyForce(); // Applies fSteer to the acceleration. 
        
        // Flocking coordination. 
        // // Seperation. 


        // // Alignment
        // steer = this.align(agents); 
        // steer.scale(this.alignmentWeight, steer);
        // this.applyForce(steer); 

        // // Cohesion 
        // steer = this.cohesion(agents); 
        // steer.scale(this.cohesionWeight, steer); 
        // this.applyForce(steer); 
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
}

// trimTarget() {
//     // Check the bounds of this agent
//     let bottom = this.boundary['bottom']; 
//     let top = this.boundary['top'];
//     let left = this.boundary['left'];
//     let right = this.boundary['right'];
//     let forward = this.boundary['forward'];
//     let backward = this.boundary['backward']; 

//     if (this.target.x > left.x) {
//         this.target.x = left.x; 
//     }

//     if (this.target.x < right.x) {
//         this.target.x = right.x; 
//     }

//     if (this.target.y > top.y) {
//         this.target.y = top.y; 
//     }

//     if (this.target.y < bottom.y) {
//         this.target.y = bottom.y; 
//     }

//     if (this.target.z > forward.z) {
//         this.target.z = forward.z; 
//     }

//     if (this.target.z < backward.z) {
//         this.target.z = backward.z; 
//     }
// }


// seperation(agents) {
//     let count = 0;
//     this.fSteer.set(0, 0, 0); // Reset fSteer

//     // For every boid in the system, check if it's too close
//     agents.forEach(a => {
//         // Very important check here else there will be bugs. 
//         if (a.awake) {
//             let diff = this.position.vsub(a.position); 
//             // This is a locality query. 
//             if (diff.length() > 0 && diff.length() < this.seperationPerceptionRad) {
//                 diff.normalize(); 
//                 diff.scale(1/diff.length(), diff); // Weight the vector properly based on the distance from the target. 
//                 this.sumVec.vadd(diff, this.sumVec); 
//                 count++; // Keep a count of all the agents in the purview of this agent. 
//             }
//         }
//     }); 

//     // Calculate average vector away from the oncoming boid. 
//     if (count > 0) {
//         this.sumVec.scale(1/count); 

//         if (this.sumVec.lengthSquared() > 0) {
//             this.sumVec.normalize(); 
//             this.sumVec = Utility.clamp(this.sumVec, this.maxSpeed); 
//             this.sumVec.vsub(this.velocity, this.fSteer); // Calculate desired force. 
//             this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
//             this.fSteer.scale(this.seperationWeight, this.fSteer); // Apply seperation weight. 
//         }
//     } else {
//         this.fSteer.set(0, 0, 0); 
//     }
// }

// cohesion(agents) {
//     let count = 0;
//     this.target.set(0, 0, 0); 

//     agents.forEach(a => {
//         if (a.awake) {
//             let d = this.position.distanceTo(a.position); 
//             if (d > 0 && d < this.cohesionPerceptionRad) {
//                 this.target.vadd(a.position, this.target); 
//                 count++; 
//             }
//         }
//     }); 

//     if (count > 0) {
//         this.target.scale(1/count, this.target); 
//         this.seek(this.target); 
//         this.fSteer.scale(this.cohesionWeight, this.fSteer);
//     } else {
//         this.fSteer.set(0, 0, 0); 
//     }
// }

// // Calculate average velocity by looking at its neighbours. 
// align(agents) {
//     let count = 0; 
//     agents.forEach(a => {
//         if (a.awake) {
//             let d = this.position.distanceTo(a.position) 
//             if (d > 0 && d < this.alignmentPerceptionRad) {
//                 this.fSteer.vadd(a.velocity, this.fSteer); 
//                 count++; 
//             }
//         }
//     });

//     if (count > 0) {
//         // Calculate average. 
//         this.fSteer.scale(1/count, this.fSteer); 
//         this.fSteer.normalize(); 
//         this.fSteer.scale(this.maxSpeed, this.fSteer); 
//         this.fSteer.vsub(this.velocity, this.fSteer); 
//         this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
//         this.fSteer.scale(this.cohesionWeight, this.fSteer); 
//     } else {
//         this.fSteer.set(0, 0, 0); 
//     }
// }

    // // Uses the agent's current position and current velocity (heading) to calculate a 
    // // new target position. Extremely critical that agent's current position and current 
    // // velocity are set correctly, else the calculated target will be somewhere unexpected. 
    // // We can force the agent to calculate a new target. 
    // calcTarget(forceRecal = false) {
    //     // Have I reached the target or am I forcing a recalculation of the target? 
    //     let d = this.target.vsub(this.position).lengthSquared(); 
    //     if (d < this.arriveTolerance || forceRecal) {
    //         let wanderD = 0.20; // Max wander distance
    //         let wanderR = 0.05;
    //         let thetaChange = 5; 
    //         let wanderTheta = Utility.random(-thetaChange, thetaChange); 
    
    //         this.target.set(this.velocity.x, this.velocity.y, this.velocity.z); 
    //         this.target.normalize(); // Get the heading of the agent. 
    //         this.target.scale(wanderD, this.target); // Scale it.
    //         this.target.vadd(this.position, this.target); // Make it relative to current position.
    
    //         let azimuth = Utility.azimuth(this.target); 
    //         let inclination = Utility.inclination(this.target); // [TODO] Use this to tilt the head of the Agent
    
    //         // Calculate New Target. 
    //         let xPos = wanderR * Math.cos(azimuth + wanderTheta);
    //         let yPos = wanderR * Math.sin(azimuth + wanderTheta);
    //         let zPos = wanderR * Math.cos(inclination + wanderTheta); 
    //         let pOffset = new CANNON.Vec3(xPos, yPos, zPos); 
    //         this.target.vadd(pOffset, this.target); // With respect to current position 

    //         // Check if the target is over-extending our bounds. 
    //         // Trim the target (for debugging turn on the sync object below to see where the next target is)
    //         //this.trimTarget(); 

    //         // Sync the target scene object to the target. 
    //         Utility.syncSceneObject(this.targetObject, this.target); 
    //     } else {
    //         // Still trying to get to the target. 
    //     }
    // }  