// Agent.js
// Class that wraps the SceneObject. Holds the soft body that movies around in the physics world. 
// TODO: Disable collision, Make the bodies Kinematic (only velocies affect them), Turn off rotation on spheres. 

const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
const CANNON = require('cannon');
const Utility = require('./Utility.js');

export default class Agent {
    constructor(sceneObject, targets) {
        // Scene object. 
        this.sceneObject = sceneObject; 

        // Agent behavior. 
        this.position = Utility.getLastPosition(sceneObject);
        this.velocity = new CANNON.Vec3(0, 0, 0);
        this.acceleration = new CANNON.Vec3(0, 0, 0); 

        // Tweak this control how the Agent moves.
        this.maxSpeed = 0.2; 
        this.maxForce = 0.7;
        
        // Tolerance for reaching a point.
        this.arriveTolerance = 1; 
        this.slowDownTolerance = 5; 

        // Choose target
        // [TODO] Send a target with update. Agent shouldn't worry about this. 
        this.targetPositions = targets; 
        this.curTargetIdx = 0; 
        this.target = new CANNON.Vec3(0, 0, 0);
        // this.target =  this.targetPositions[this.curTargetIdx]; 
    }

    // Function declaration. 
    update() {
        let target = this.wander(); 

        // Calculate steering forces for the target. 
        this.seek(target); 
        
        // Update current position based on velocity. 
        this.updatePosition(); 

        // Sync current position with the Scene Object's transform. 
        this.syncPosition(); 
    }

    // Complete wander
    // Multiple agents
    // Update agent model and check direction switch. 
    wander() {
        let wanderD = 25; // Max wander distance
        let wanderR = 5;
        let thetaChange = 90.0; 
        let wanderTheta = Utility.random(-thetaChange, thetaChange); 

        let curVelocity = new CANNON.Vec3(0, 0, 0); 
        curVelocity.copy(this.velocity);
        curVelocity.normalize(); // Get the heading of the agent. 
        curVelocity.mult(wanderD, curVelocity); // Scale it.
        curVelocity.vadd(this.position, curVelocity); // Make it relative to current position.

        let heading2D = Utility.heading2D(curVelocity); 
        let elevation3D = Utility.elevation3D(curVelocity); // [TODO] Use this to tilt the head of the Agent

        // Calculate offset velocity. 
        let vOffset = new CANNON.Vec3(wanderR * Math.cos(wanderTheta + heading2D), wanderR * Math.sin(wanderTheta + heading2D), curVelocity.z); 
        curVelocity.vadd(vOffset, curVelocity); 
        
        // NOTE: If we want to set a minimum position for the
        // Agent, we can use this. 
        if (curVelocity.y < 0) {
            curVelocity.y = 0; 
        }
        return curVelocity; 
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
    }

    syncPosition() {
        // Sync position to the scene object. 
        this.sceneObject.transform.x = this.position.x; 
        this.sceneObject.transform.y = this.position.y; 
        this.sceneObject.transform.z = this.position.z; 
    }
}
