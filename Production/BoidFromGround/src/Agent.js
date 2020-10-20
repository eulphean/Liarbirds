// Agent.js
// Class that wraps the SceneObject. Holds the soft body that movies around in the physics world. 
// TODO: Disable collision, Make the bodies Kinematic (only velocies affect them), Turn off rotation on spheres. 

const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
import * as Utility from './Utility.js';
import * as CANNON from 'cannon-es';

export default class Agent {
    constructor(sceneObject, t) {
        // Scene object. 
        this.sceneObject = sceneObject; 
        this.targetObject = t; 

        // Agent behavior. 
        this.position = Utility.getLastPosition(sceneObject); // don't need this but let it be here. 
        let vx = Utility.random(0.0001, 0.0005, true);
        this.velocity = new CANNON.Vec3(vx/10000, 0.0002, 0); 
        this.acceleration = new CANNON.Vec3(0, 0, 0); 
        this.rotation = Reactive.quaternionFromAngleAxis(0, Reactive.vector(0, 1, 0));

        // Tweak this control how the Agent moves.
        this.maxSpeed = 0.06; 
        this.maxForce = 0.05;
        
        // Tolerance for reaching a point.
        this.arriveTolerance = 0.05; 
        this.slowDownTolerance = 0.2; 

        // Group behavioral weights. 
        this.seperationWeight = 0.01; // Keep this weight high / Higher than maxForce 
        this.seperationPerceptionRad = 0.01; 

        this.cohesionWeight = 0.3; // Keep this weight high / Higher than maxForce 
        this.cohesionPerceptionRad = 0.1; 

        this.alignmentWeight = 0.001; // Keep this weight high / Higher than maxForce 
        this.alignmentPerceptionRad = 0.05; 
        
        // Store target position. 
        // this.target = Utility.getLastPosition(this.targetObject); 
        // this.initialTargetPosition = Utility.getLastPosition(this.targetObject); // Save this to be reused during spawning. 

        // Is it awake? 
        // If awake up, make visible. 
        this.awake = false; 
    }

    // Function declaration. 
    update(agents) {
        // Calculate 
        this.applyBehaviors(agents);  

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
        let steer; 

        // Seperation. 
        steer = this.seperation(agents); 
        steer.scale(this.seperationWeight, steer); 
        this.applyForce(steer); 

        // Alignment
        steer = this.align(agents); 
        steer.scale(this.alignmentWeight, steer);
        this.applyForce(steer); 

        // Cohesion 
        steer = this.cohesion(agents); 
        steer.scale(this.cohesionWeight, steer); 
        this.applyForce(steer); 
    }

    seperation(agents) {
        let vSteer = new CANNON.Vec3(0, 0, 0);
        let sum = new CANNON.Vec3(0, 0, 0); 
        let count = 0;

        // For every boid in the system, check if it's too close
        agents.forEach(a => {
            // Very important check here else there will be bugs. 
            if (a.awake) {
                let diff = this.position.vsub(a.position); 
                if (diff.length() > 0 && diff.length() < this.seperationPerceptionRad) {
                    diff.normalize(); 
                    diff.scale(1/(diff.length()), diff); // Weight the vector properly based on the distance from the target. 
                    sum.vadd(diff, sum); 
                    count++; // Keep a count of all the agents in the purview of this agent. 
                }

                // Calculate average vector away from the oncoming boid. 
                if (count > 0) {
                    sum.scale(1/count); 
                    sum.normalize(); 
                    sum = Utility.clamp(sum, this.maxSpeed); 
                    vSteer = sum.vsub(this.velocity); // Calculate desired velocity
                    vSteer = Utility.clamp(vSteer, this.maxForce); 
                }
            }
        }); 

        return vSteer; 
    }

    cohesion(agents) {
        let vSteer = new CANNON.Vec3(0, 0, 0); 
        let target = new CANNON.Vec3(0, 0, 0);   // Start with empty vector to accumulate all positions
        let count = 0;
       
        agents.forEach(a => {
            if (a.awake) {
                let diff = this.position.vsub(a.position);
                if (diff.length() > 0 && diff.length() < this.cohesionPerceptionRad) {
                    target.vadd(a.position, target); 
                    count++; 
                }
            }

            if (count > 0) {
                target.scale(1/count, target); 
                vSteer = this.seek(target); 
            }
        }); 

        return vSteer; 
    }

    // Calculate average velocity by looking at its neighbours. 
    align(agents) {
        let vSteer = new CANNON.Vec3(0, 0, 0); 
        let count = 0; 
        agents.forEach(a => {
            if (a.awake) {
                let diff = this.position.vsub(a.position); 
                if (diff.length() > 0 && diff.length() < this.alignmentPerceptionRad) {
                    vSteer.vadd(a.velocity, vSteer); 
                    count++; 
                }

                if (count > 0) {
                    vSteer.scale(1/count, vSteer); 
                    vSteer.normalize(); 
                    vSteer.scale(this.maxSpeed, vSteer); 
                    vSteer.vsub(this.velocity, vSteer); 
                    vSteer = Utility.clamp(vSteer, this.maxForce); 
                }
            }
        });

        return vSteer; 
    }

    spawn(spawnLocation) {
        if (this.awake) {
            // Reset first. 
            this.hardReset(); 
        }

        // Update position to spawn point. 
        this.position.copy(Utility.getLastPosition(spawnLocation)); 

        // Make the agent visible and awake. 
        this.sceneObject.hidden = false; 
        this.awake = true; 
    }

    hardReset() {
        // Reset all the parameters to original parameters. 
        this.velocity.set(0, 0, 0); 
        this.acceleration.set(0, 0, 0); 
        // this.target.copy(this.initialTargetPosition); 
    }

    seek(target) {
        let d = target.vsub(this.position).length();
        let vDesired;
        // Calculate desired force. 
        vDesired = target.vsub(this.position);
        vDesired.normalize(); // Changes the vector in place. 
        vDesired.scale(this.maxSpeed, vDesired);

        // Slow down logic (Arrival logic)
        if (d < this.slowDownTolerance && d > this.arriveTolerance) {
            // // Diagnostics.log('Slowing down'); 
            let newMaxSpeed = Utility.map_range(d, this.arriveTolerance, this.slowDownTolerance, 0.05, this.maxSpeed); 
            vDesired.scale(newMaxSpeed, vDesired); 
        }
        else {
            // Usual scaling. 
            vDesired.scale(this.maxSpeed, vDesired); 
        }

        let vSteer = vDesired.vsub(this.velocity); 
        vSteer = Utility.clamp(vSteer, this.maxForce); 
        return vSteer;  
    }

    applyForce(steer) {
        this.acceleration.vadd(steer, this.acceleration); 
    }

        // Calculate new target. 
     calcTarget() {
        let wanderD = 0.5; // Max wander distance
        let wanderR = 0.25;
        let thetaChange = Math.PI/2; 
        let wanderTheta = Utility.random(-thetaChange, thetaChange); 

        let newTarget = new CANNON.Vec3(this.velocity.x, this.velocity.y, this.velocity.z); 
        newTarget.normalize(); // Get the heading of the agent. 
        newTarget.scale(wanderD, newTarget); // Scale it.
        newTarget.vadd(this.position, newTarget); // Make it relative to current position.

        let azimuth = Utility.azimuth(newTarget); 
        let inclination = Utility.inclination(newTarget); // [TODO] Use this to tilt the head of the Agent

        // Calculate New Target. 
        let xPos = wanderR * Math.cos(azimuth + wanderTheta);
        let yPos = wanderR * Math.sin(azimuth + wanderTheta);
        let zPos = wanderR * Math.cos(inclination); 
        let pOffset = new CANNON.Vec3(xPos, yPos, zPos); 
        newTarget.vadd(pOffset, newTarget); // With respect to current position 
        
        // TODO: Optimize this dirty logic to give a dimension box in the beginning. 
        // Use this dirty logic to set bounds on the agent. 
        if (newTarget.y < 0.05) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), 0, newTarget.z.pinLastValue()); 
            newTarget.y = 0.05; 
        }
        if (newTarget.y > 0.35) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), 20, newTarget.z.pinLastValue()); 
            newTarget.y = 0.35; 
        }

        if (newTarget.x < -0.35) {
            //newTarget = Reactive.vector(-20, newTarget.y.pinLastValue(), newTarget.z.pinLastValue()); 
            newTarget.x = -0.35; 
        } 

        if (newTarget.x > 0.35) {
            //newTarget = Reactive.vector(20, newTarget.y.pinLastValue(), newTarget.z.pinLastValue()); 
            newTarget.x = 0.35;
        }

        if (newTarget.z < -0.35) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), newTarget.y.pinLastValue(), -20); 
            newTarget.z = -0.35; 
        } 

        if (newTarget.z > 0.35) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), newTarget.y.pinLastValue(), 20); 
            newTarget.z = 0.35; 
        }

        // Update target sphere's position to the target
        this.target.copy(newTarget); 
        // Set target object's position to this
        Utility.syncSceneObject(this.targetObject, this.target); 
    }    

    updatePosition() {
        // Update velocity. 
        this.velocity.vadd(this.acceleration, this.velocity); 
        this.velocity = Utility.clamp(this.velocity, this.maxSpeed); 

        // Calculate position. 
        this.position.vadd(this.velocity, this.position); 
        this.acceleration.scale(0, this.acceleration); // Reset acceleration.
    }

    syncPosition() {
        Utility.syncSceneObject(this.sceneObject, this.position); 
    }

    syncRotation() {
        let azimuth = Utility.azimuth(this.velocity); 
        let inclination = Utility.inclination(this.velocity);

        // Yaw / Roll (rotate around Z-axis)
        let r = Utility.axisRotation(0, 0, 1, azimuth - Math.PI/2); 

        // Pitch (rotate by Elevation around X-axis)
        r = r.mul(Utility.axisRotation(1, 0, 0, Math.PI/2 - inclination)); 
        this.sceneObject.transform.rotation = r;  
    }
}