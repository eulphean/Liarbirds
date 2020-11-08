const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

import * as SparkUtility from '../Utilities/SparkUtility.js'
import * as MathUtility from '../Utilities/MathUtility.js';
import { Euler, Matrix4, Quaternion, Vector3 } from 'math-ds'
import { FLOCKING_WEIGHTS } from '../Utilities/AgentUtility.js'

export class BaseAgent {
    constructor(obj) {
         // Scene object. 
         this.sceneObject = obj['agent']; 
         this.targetObject = obj['target']; 
         this.agentIdx = obj['idx']; 
 
         // Core Vec3 to determine agent's whereabouts. These should be reused aggressively to avoid the need
         // to create new Vec3s on the fly. That's expensive. 
         this.position = SparkUtility.getLastPosition(this.sceneObject); // don't need this but let it be here. 
         this.velocity = obj['spawnState'].v; 
         this.needsPortal = obj['spawnState'].p; 
         this.acceleration = new Vector3(0, 0, 0); 
         this.rotationA = new Quaternion(0, 0, 0, 0); 
         this.rotationB = new Quaternion(0, 0, 0, 0); 
         this.euler = new Euler(0, 0, 0); 
         this.mat = new Matrix4(); 
         this.target = SparkUtility.getLastPosition(this.targetObject); 
         this.fSteer = new Vector3(0, 0, 0); 
         this.sumVec = new Vector3(0, 0, 0); // Helper sum keeper for vector calculation. 
         this.diffVec = new Vector3(0, 0, 0); // Helper subtractor for vector calculation. 
 
         // [Critical] Constants to determine the agent's arrival behavior.
         // Note this distance*distance
         this.arriveTolerance = 0.01 * 0.01; 
         this.slowDownTolerance = 0.2 * 0.2; 


         // Lerp factor that we use to smooth rotations. 
         // Higher number indicates a faster rotation, whereas lower is smoother. 
         this.smoothFactor = 0.01; 

         // Randomly set this on agent creation. 
         // When it's 0, agent performs death sequence. 
         this.deathCounter = MathUtility.random(2, 5);

         // Not active. 
         this.awake = false;
         
         this.skipPosition = false; 
    }

    // Function declaration. 
    update(nAgents) {
        // Calculate and apply forces for agent behaviors. 
        this.applyBehaviors(nAgents);  

        // Update local position based on current velocity and acceleration. 
        this.updatePosition(); 
        
        // Sync local rotation to scene object's rotation. 
        this.syncRotation();

        // Sync local vector position to scene object's position.
        this.syncPosition(); 
    }

    applyBehaviors(nAgents) {
        this.seek(); // Calculates new fSteer for current target. 
        this.applyForce(); // Applies fSteer to the acceleration. 
        
        // If there are neighbors from the Octree, I'll flock. 
        this.flock(nAgents); 
    }

    flock(nAgents) {
        if (nAgents.length > 0) {
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

    // SteerForce = VDesired - VActual
    seek() {
        this.fSteer.subVectors(this.target, this.position); 
        let d = this.fSteer.lengthSquared();
        this.fSteer.normalize();

        if (d < this.slowDownTolerance && d > this.arriveTolerance) {
            // Start slowing down. 
            let newMaxSpeed = MathUtility.map_range(d, this.slowDownTolerance, this.arriveTolerance, this.maxSpeed, this.maxSlowDownSpeed); 
            this.fSteer.multiplyScalar(newMaxSpeed); 
        } else {
            // We are still trying to get to the target. 
            this.fSteer.multiplyScalar(this.maxSpeed); 
        }

        this.fSteer.sub(this.velocity); 
        this.fSteer = MathUtility.clamp(this.fSteer, this.maxForce); 
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
        this.velocity = MathUtility.clamp(this.velocity, this.maxSpeed); 

        if (!this.skipPosition) {
            // Calculate position. 
            this.position.add(this.velocity); 
        }

        // Reset acceleration. 
        this.acceleration.multiplyScalar(0); // Reset acceleration.
    }

    syncPosition() {
        SparkUtility.syncSceneObject(this.sceneObject, this.position); 
    }

    syncRotation() {
        let azimuth = MathUtility.azimuth(this.velocity); 
        let inclination = MathUtility.inclination(this.velocity);

        MathUtility.axisRotation(0, 0, 1, azimuth - Math.PI/2, this.rotationA); 
        MathUtility.axisRotation(1, 0, 0, Math.PI/2 - inclination, this.rotationB); 

        // NOTE: A conversion from Quaternion to Euler is necessary to avoid creating a
        // new Reactive signal on every update. 
        this.rotationA.multiply(this.rotationB); 
        this.mat.makeRotationFromQuaternion(this.rotationA);
        this.euler.setFromRotationMatrix(this.mat, 'ZYX'); // OVERRIDE the rotation order because this is what Spark suppports. 

        this.sceneObject.transform.rotationX = this.euler.x; 
        this.sceneObject.transform.rotationY = this.euler.y; 
        this.sceneObject.transform.rotationZ = this.euler.z; 
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
                this.sumVec = MathUtility.clamp(this.sumVec, this.maxSpeed); 
                this.fSteer.subVectors(this.sumVec, this.velocity);
                this.fSteer = MathUtility.clamp(this.fSteer, this.maxForce); 
                this.fSteer.multiplyScalar(FLOCKING_WEIGHTS.SEPERATION); // Apply seperation weight. 
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
            this.fSteer.multiplyScalar(FLOCKING_WEIGHTS.COHESION); 
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
            MathUtility.clamp(this.fSteer, this.maxForce); 
            this.fSteer.multiplyScalar(FLOCKING_WEIGHTS.ALIGNMENT); // Apply alignment weight. 
        }
    }

    calcNewTarget() {
        // Have I reached the target or am I forcing a recalculation of the target? 
        let wanderD = 0.2; // Max wander distance
        let wanderR = 0.05;
        let thetaChange = 10; 
        let wanderTheta = MathUtility.random(-thetaChange, thetaChange); 

        // this.target.set(this.initialTargetPosition.x, this.initialTargetPosition.y, this.initialTargetPosition.z); 
        // this.target.normalize(); // Get the heading of the agent. 
        // this.target.multiplyScalar(wanderD); // Scale it.
        // this.target.add(this.initialTargetPosition); // Make it relative to the original target position. 

        let azimuth = MathUtility.azimuth(this.target); 
        let inclination = MathUtility.inclination(this.target);

        // Calculate New Target. 
        let xPos = wanderR * Math.cos(azimuth + wanderTheta);
        let yPos = wanderR * Math.sin(azimuth + wanderTheta);
        let zPos = wanderR * Math.cos(inclination + wanderTheta); 
        let pOffset = new Vector3(xPos, yPos, zPos); 
        this.target.add(pOffset); // With respect to current position 

        // Sync the target scene object to the target. 
        SparkUtility.syncSceneObject(this.targetObject, this.target); 
    }  
}