// Agent.js
// Class that wraps the SceneObject. Holds the soft body that movies around in the physics world. 
// TODO: Disable collision, Make the bodies Kinematic (only velocies affect them), Turn off rotation on spheres. 

const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');
const CANNON = require('cannon');
const Utility = require('./Utility.js');

export default class Agent {
    constructor(sceneObject, t) {
        // Scene object. 
        this.sceneObject = sceneObject; 
        this.targetObject = t; 

        // Agent behavior. 
        this.position = Utility.getLastPosition(sceneObject);
        this.velocity = new CANNON.Vec3(0, 0, 0);
        this.acceleration = new CANNON.Vec3(0, 0, 0); 
        this.rotation = new CANNON.Quaternion(0, 0, 0, 0); 

        // Tweak this control how the Agent moves.
        this.maxSpeed = 0.1; 
        this.maxForce = 0.001;
        
        // Tolerance for reaching a point.
        this.arriveTolerance = 1; 
        this.slowDownTolerance = 5; 
        
        // Store target position
        this.target = Utility.getLastPosition(this.targetObject); 
    }

    // Function declaration. 
    update() {
        // Calculate steering forces for the target. 
        this.seek(); 
        
        // Update current position based on velocity. 
        this.updatePosition(); 
        
        // Rotate the object first, then update the position. 
        this.syncRotation();

        // Sync current position with the Scene object's transform. 
        this.syncPosition(); 
    }

    // Calculate new target. 
    calcTarget() {
        let wanderD = 10; // Max wander distance
        let wanderR = 3;
        let thetaChange = 5; 
        let wanderTheta = Utility.random(-thetaChange, thetaChange); 

        let newTarget = new CANNON.Vec3(0, 0, 0); 
        newTarget.copy(this.velocity);
        newTarget.normalize(); // Get the heading of the agent. 
        newTarget.mult(wanderD, newTarget); // Scale it.
        newTarget.vadd(this.position, newTarget); // Make it relative to current position.

        let azimuth = Utility.azimuth(newTarget); 
        let inclination = Utility.inclination(newTarget); // [TODO] Use this to tilt the head of the Agent

        // Calculate New Target. 
        let xPos = wanderR * Math.cos(azimuth + wanderTheta) * Math.sin(inclination);
        let yPos = wanderR * Math.sin(azimuth + wanderTheta) * Math.sin(inclination);
        let zPos = wanderR * Math.cos(inclination + wanderTheta); 
        let pOffset = new CANNON.Vec3(xPos, yPos, zPos); 
        newTarget.vadd(pOffset, newTarget);
        
        // Use this dirty logic to set bounds on the agent. 
        if (newTarget.y < 0) {
            newTarget.y = 0; 
        }
        if (newTarget.y > 20) {
            newTarget.y = 20; 
        }

        if (newTarget.x < -20) {
            newTarget.x = -20
        } 

        if (newTarget.x > 20) {
            newTarget.x = 20;
        }

        if (newTarget.z < -20) {
            newTarget.z = -20
        } 

        if (newTarget.z > 20) {
            newTarget.z = 20;
        }

        // Update target sphere's position to the target
        this.target.copy(newTarget); 

        // Set target object's position to this
        this.targetObject.transform.x = this.target.x; 
        this.targetObject.transform.y = this.target.y; 
        this.targetObject.transform.z = this.target.z; 
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

            // Logic for slowing down. 
            if (d < this.slowDownTolerance && d > this.arriveTolerance) {
                let newMaxSpeed = Utility.map_range(d, this.arriveTolerance, this.slowDownTolerance, 0.001, this.maxSpeed);
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

    syncRotation() {
        // Convert current velocity into a vector. 
        let v = Reactive.vector(this.velocity.x, this.velocity.y, this.velocity.z); 
        //v = v.reflect(Reactive.vector(0, 1, 0));  // Normalize target. 
        let pos = new CANNON.Vec3(0, 0, 0); 
        this.position.mult(10, pos); 
        pos.vadd(this.velocity, pos);

        let targetPos = Reactive.point(pos.x, pos.y, pos.z); 
        this.rotation = Reactive.quaternionLookAt(targetPos, v);

        // // Calculate rotation
        let rotEuler = this.rotation.eulerAngles; 
        this.sceneObject.transform.rotationX = rotEuler.x;
        this.sceneObject.transform.rotationY = rotEuler.y;
        this.sceneObject.transform.rotationZ = rotEuler.z;
    }
}
