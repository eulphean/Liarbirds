// Agent.js
// Class that wraps the SceneObject. Holds the soft body that movies around in the physics world. 
// TODO: Disable collision, Make the bodies Kinematic (only velocies affect them), Turn off rotation on spheres. 

const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
const Utility = require('./Utility.js');
const CANNON = require('cannon');

export default class Agent {
    constructor(sceneObject, t) {
        // Scene object. 
        this.sceneObject = sceneObject; 
        this.targetObject = t; 

        // Agent behavior. 
        this.position = Utility.getLastPosition(sceneObject); // don't need this but let it be here. 
        this.velocity = new CANNON.Vec3(0, 1, 0); 
        this.acceleration = new CANNON.Vec3(0, 0, 0); 
        this.rotation = Reactive.quaternionFromAngleAxis(0, Reactive.vector(0, 1, 0));

        // Tweak this control how the Agent moves.
        this.maxSpeed = 0.1; 
        this.maxForce = 0.1;
        
        // Tolerance for reaching a point.
        this.arriveTolerance = 0.05; 
        this.slowDownTolerance = 0.2; 
        
        // Store target position. 
        this.target = Utility.getLastPosition(this.targetObject); 
        this.initialTargetPosition = Utility.getLastPosition(this.targetObject); // Save this to be reused during spawning. 

        // Is it awake? 
        // If awake up, make visible. 
        this.awake = false; 
    }

    // Function declaration. 
    update() {
        // Calculate steering forces for the target. 
        this.seek(); 
        
        // Update current position based on velocity. 
        this.updatePosition(); 

        // [Animation Hook] for the movement of wings, etc. 
        
        // Rotate the object first, then update the position. 
        this.syncRotation();

        // Sync current position with the Scene object's transform. 
        this.syncPosition(); 
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
        this.velocity.set(0, 1, 0); 
        this.acceleration.set(0, 0, 0); 
        this.target.copy(this.initialTargetPosition); 
    }

    seek() {
        let d = this.target.vsub(this.position).length();
        let vDesired; 

        // Have arrived? 
        if (d < this.arriveTolerance) {
            this.calcTarget();
        } else  {
            // Calculate desired force. 
            vDesired = this.target.vsub(this.position);
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

            // Apply force. 
            this.acceleration.vadd(vSteer, this.acceleration); 
        }
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
        if (newTarget.y < 0) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), 0, newTarget.z.pinLastValue()); 
            newTarget.y = 0; 
        }
        if (newTarget.y > 1) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), 20, newTarget.z.pinLastValue()); 
            newTarget.y = 1; 
        }

        if (newTarget.x < -0.5) {
            //newTarget = Reactive.vector(-20, newTarget.y.pinLastValue(), newTarget.z.pinLastValue()); 
            newTarget.x = -0.5; 
        } 

        if (newTarget.x > 0.5) {
            //newTarget = Reactive.vector(20, newTarget.y.pinLastValue(), newTarget.z.pinLastValue()); 
            newTarget.x = 0.5;
        }

        if (newTarget.z < -0.5) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), newTarget.y.pinLastValue(), -20); 
            newTarget.z = -0.5; 
        } 

        if (newTarget.z > 0.5) {
            //newTarget = Reactive.vector(newTarget.x.pinLastValue(), newTarget.y.pinLastValue(), 20); 
            newTarget.z = 0.5; 
        }

        // Update target sphere's position to the target
        this.target.copy(newTarget); 
        // Set target object's position to this
        Utility.syncSceneObject(this.targetObject, this.target); 
    }    

    updatePosition() {
        this.velocity.vadd(this.acceleration, this.velocity); 
        this.velocity = Utility.clamp(this.velocity, this.maxSpeed); 

        // Update position. 
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
        this.sceneObject.transform.rotation = r; 

        // Pitch (rotate by Elevation around X-axis)
        r = r.mul(Utility.axisRotation(1, 0, 0, Math.PI/2 - inclination)); 
        this.sceneObject.transform.rotation = r;  
    }
}
