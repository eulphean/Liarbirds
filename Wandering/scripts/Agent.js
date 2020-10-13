// Agent.js
// Class that wraps the SceneObject. Holds the soft body that movies around in the physics world. 
// TODO: Disable collision, Make the bodies Kinematic (only velocies affect them), Turn off rotation on spheres. 

const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
const CANNON = require('cannon');
const Utility = require('./Utility.js');

export default class Agent {
    constructor(sceneObject) {
        // Scene object. 
        this.sceneObject = sceneObject; 

        // Agent behavior. 
        this.position = Utility.getLastPosition(sceneObject);
        this.velocity = new CANNON.Vec3(0, 0, 0);
        this.acceleration = new CANNON.Vec3(0, 0, 0); 
        this.rotation = new CANNON.Quaternion(0, 0, 0, 0); 
        this.yUp = new CANNON.Vec3(0, 1, 0); 
        // Set initial position. 
        this.rotation.setFromVectors(this.yUp, this.position); 

        // Tweak this control how the Agent moves.
        this.maxSpeed = 0.2; 
        this.maxForce = 0.5;
        
        // Tolerance for reaching a point.
        this.arriveTolerance = 1; 
        this.slowDownTolerance = 5; 

        //this.targetPositions = targets; 
        this.curTargetIdx = 0; 
        this.target = new CANNON.Vec3(0, 0, 0);

        // [NOTE: Can use this if we want. ]
        // this.target =  this.targetPositions[this.curTargetIdx]; 
    }

    // Function declaration. 
    update() {
        let target = this.wander(); 

        // Calculate steering forces for the target. 
        this.seek(target); 
        
        // Update current position based on velocity. 
        this.updatePosition(); 

        // Sync current position with the Scene object's transform. 
        this.syncPosition(); 

        // Sync rotation with the Scene object's rotation.
        // [TODO] Fix rotation
        this.syncRotation();
    }

    // Complete wander
    // Multiple agents
    // Update agent model and check direction switch. 
    wander() {
        let wanderD = 20; // Max wander distance
        let wanderR = 2;
        let thetaChange = Math.PI; 
        let wanderTheta = Utility.random(-thetaChange, thetaChange); 

        let newTarget = new CANNON.Vec3(0, 0, 0); 
        newTarget.copy(this.velocity);
        newTarget.normalize(); // Get the heading of the agent. 
        newTarget.mult(wanderD, newTarget); // Scale it.
        newTarget.vadd(this.position, newTarget); // Make it relative to current position.

        let heading2D = Utility.heading2D(newTarget); 
        let elevation3D = Utility.elevation3D(newTarget); // [TODO] Use this to tilt the head of the Agent

        Diagnostics.log(heading2D);

        // Calculate offset velocity. 
        let vOffset = new CANNON.Vec3(wanderR * Math.cos(wanderTheta + heading2D), wanderR * Math.sin(wanderTheta + heading2D), newTarget.z); 
        newTarget.vadd(vOffset, newTarget);
        
        // NOTE: If we want to set a minimum position for the
        // Agent, we can use this. 
        if (newTarget.y < 0) {
            newTarget.y = 0; 
        }

        if (newTarget.y > 20) {
            newTarget.y = 20; 
        }

        if (newTarget.x < 0) {
            newTarget.x = 0
        } 

        if (newTarget.x > 20) {
            newTarget.x = 20;
        }

        if (newTarget.z < 0) {
            newTarget.z = 0
        } 

        if (newTarget.z > 20) {
            newTarget.z = 20;
        }
        return newTarget; 
    }

    seek(newTarget) {
        this.target.copy(newTarget); 

        let d = this.target.vsub(this.position).length();
        let vDesired; 

        // Have arrived? 
        if (d < this.arriveTolerance) {
            // I have reached, update target (if there are fixed targets)
            // this.curTargetIdx = (this.curTargetIdx + 1) % this.targetPositions.length;
            // this.curTargetIdx = Math.floor(Math.random() * Math.floor(this.targetPositions.length));
            // this.target = this.targetPositions[this.curTargetIdx]; 
            // Don't do anything if I am arriving because I'm wandering so I can go anywhere. 
        } else  {
            // Calculate desired force. 
            vDesired = this.target.vsub(this.position);
            vDesired.normalize(); // Changes the vector in place. 

            // Logic for slowing down. 
            if (d < this.slowDownTolerance && d > this.arriveTolerance) {
                let newMaxSpeed = Utility.map_range(d, this.arriveTolerance, this.slowDownTolerance, 0.05, this.maxSpeed);
                vDesired.mult(newMaxSpeed, vDesired); 
            }
            else {
                // Do usual business
                vDesired.mult(this.maxSpeed, vDesired);
            }

            let vSteer = vDesired.vsub(this.velocity); 
            // Limit to max force. 
            if (vSteer.length() > this.maxForce) {
                vSteer.normalize(); 
                vSteer.mult(this.maxForce, vSteer); 
            }

            // Apply force. 
            this.acceleration.vadd(vSteer, this.acceleration); 
        }
    }

    updatePosition() {
        this.velocity.vadd(this.acceleration, this.velocity); 

        // Limit the velocity. 
        if (this.velocity.length() > this.maxSpeed) {
            this.velocity.normalize(); // Changes the vector in place. 
            this.velocity.mult(this.maxSpeed, this.velocity); 
        }

        // Update position. 
        this.position.vadd(this.velocity, this.position); 
        this.acceleration.mult(0, this.acceleration); // Reset acceleration.

        this.rotation.setFromVectors(this.yUp, this.velocity); 
    }

    syncPosition() {
        // Sync position to the scene object. 
        this.sceneObject.transform.x = this.position.x; 
        this.sceneObject.transform.y = this.position.y; 
        this.sceneObject.transform.z = this.position.z; 
    }

    syncRotation() {
        let rotEuler = {}; 
        this.rotation.toEuler(rotEuler); 
        this.sceneObject.transform.rotationX = rotEuler.x;
        this.sceneObject.transform.rotationY = rotEuler.y;
        this.sceneObject.transform.rotation.Z  = rotEuler.z;
    }
}
