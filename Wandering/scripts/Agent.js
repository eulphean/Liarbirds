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
        this.wanderTarget = t; 

        // Agent behavior. 
        this.position = Utility.getLastPosition(sceneObject);
        this.velocity = new CANNON.Vec3(0, 0, 0);
        this.acceleration = new CANNON.Vec3(0, 0, 0); 
        this.rotation = new CANNON.Quaternion(0, 0, 0, 0); 
        this.yUp = new CANNON.Vec3(0, 1, 0); 
        this.zUp = new CANNON.Vec3(0, 0, 1); 

        // Tweak this control how the Agent moves.
        this.maxSpeed = 0.1; 
        this.maxForce = 0.001;
        
        // Tolerance for reaching a point.
        this.arriveTolerance = 1; 
        this.slowDownTolerance = 10; 

        //this.targetPositions = targets; 
        this.curTargetIdx = 0; 
        this.target = Utility.getLastPosition(t); 
        Diagnostics.log(this.target);
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

    // Complete wander
    // Multiple agents
    // Update agent model and check direction switch. 
    wander() {
        let wanderD = 5; // Max wander distance
        let wanderR = 2;
        let thetaChange = 2; 
        let wanderTheta = Utility.random(-thetaChange, thetaChange); 

        let newTarget = new CANNON.Vec3(0, 0, 0); 
        newTarget.copy(this.velocity);
        newTarget.normalize(); // Get the heading of the agent. 
        newTarget.mult(wanderD, newTarget); // Scale it.
        newTarget.vadd(this.position, newTarget); // Make it relative to current position.

        let azimuth = Utility.azimuth(newTarget); 
        let inclination = Utility.inclination(newTarget); // [TODO] Use this to tilt the head of the Agent

        // Calculate New Target. 
        let xPos = wanderR * Math.cos(azimuth + wanderTheta);
        let yPos = wanderR * Math.sin(azimuth + wanderTheta);
        let zPos = wanderR * Math.cos(inclination); 
        let pOffset = new CANNON.Vec3(xPos, yPos, zPos); 
        newTarget.vadd(pOffset, newTarget);
        
        // NOTE: If we want to set a minimum position for the
        // Agent, we can use this. 
        if (newTarget.y < 0) {
            newTarget.y = 0; 
        }
        if (newTarget.y > 30) {
            newTarget.y = 30; 
        }

        if (newTarget.x < -30) {
            newTarget.x = -30
        } 

        if (newTarget.x > 30) {
            newTarget.x = 30;
        }

        if (newTarget.z < -30) {
            newTarget.z = -30
        } 

        if (newTarget.z > 30) {
            newTarget.z = 30;
        }

        // Update target sphere's position to the target
        this.wanderTarget.transform.x = newTarget.x; 
        this.wanderTarget.transform.y = newTarget.y; 
        this.wanderTarget.transform.z = newTarget.z; 
        return newTarget; 
    }

    seek() {
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

    syncRotation() {
        // Convert current velocity into a vector. 
        let v = Reactive.vector(this.velocity.x, this.velocity.y, this.velocity.z); 
        v = v.reflect(Reactive.vector(0, 0, 0));  // Normalize target. 
        v.normalize();

        let targetPos = Reactive.point(this.position.x, this.position.y, this.position.z); 
        this.rotation = Reactive.quaternionLookAt(targetPos, v);

        // // Calculate rotation
        let rotEuler = this.rotation.eulerAngles; 
        this.sceneObject.transform.rotationX = rotEuler.x;
        this.sceneObject.transform.rotationY = rotEuler.y;
        this.sceneObject.transform.rotationZ = rotEuler.z;
    }

    axisRotation(axis_x, axis_y, axis_z, angle_degrees) {
        var norm = Math.sqrt(axis_x * axis_x + axis_y * axis_y + axis_z * axis_z);
        axis_x /= norm;
        axis_y /= norm;
        axis_z /= norm;
        var angle_radians = angle_degrees * Math.PI / 180.0;
        var cos = Math.cos(angle_radians / 2);
        var sin = Math.sin(angle_radians / 2);
        return Reactive.quaternion(cos, axis_x * sin, axis_y * sin, axis_z * sin);
      }
}
