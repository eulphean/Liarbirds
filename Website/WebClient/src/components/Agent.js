import * as THREE from 'three'
import Target from './Target.js';
import * as Utility from './Utility.js'

export default class Agent {
    constructor(scene) {
        // Construct all important variables. 
        this.position = new THREE.Vector3(0, 0, 0); // Get initial velocity
        this.velocity = new THREE.Vector3(0, 0.01, 0); 
        this.acceleration = new THREE.Vector3(0, 0, 0); 
        this.fSteer = new THREE.Vector3(0, 0, 0); 
        this.sumVec = new THREE.Vector3(0, 0, 0);
        this.rotationA = new THREE.Quaternion(); 
        this.rotationB = new THREE.Quaternion(); 
        this.target = new Target(scene); 
        
        // Force and speeds. 
        this.maxForce = 1.0; 
        this.maxSpeed = 1.0; 
        this.maxSlowDownSpeed = 0; 

        // Tolerances
        this.slowDownTolerance = 0.2 * 0.2; 
        this.arriveTolerance = 0.01 * 0.01; 

        // Velocity smooth
        this.smoothFactor = 0.001; 

        // Initial position and target.
        this.initPosition(); 
    }

    initPosition() {
        const radius = Utility.getRandomNum(0, 50);
        const theta = THREE.Math.degToRad(Utility.getRandomNum(360)); 
        const phi = THREE.Math.degToRad(Utility.getRandomNum(180)); 

        this.position.x = Math.sin(theta) * Math.cos(phi) * radius; 
        this.position.y = 0; 
        this.position.z = Math.cos(theta) * radius;
    }

    updateAgent() {
        // Behaviors. 
        this.applyBehaviors(); 

        this.updatePosition();
    }

    applyBehaviors() {
        this.seek();
        this.applyForce(); 
    }

    seek() {
        let target = this.target.getVector(); 

        this.fSteer.subVectors(target, this.position); 
        let d = this.fSteer.lengthSq();
        this.fSteer.normalize();

        if (d < this.slowDownTolerance && d > this.arriveTolerance) {
            // Start slowing down. 
            let newMaxSpeed = Utility.map_range(d, this.slowDownTolerance, this.arriveTolerance, this.maxSpeed, this.maxSlowDownSpeed); 
            this.fSteer.multiplyScalar(newMaxSpeed); 
        } else {
            // We are still trying to get to the target. 
            this.fSteer.multiplyScalar(this.maxSpeed); 
        }

        this.fSteer.sub(this.velocity); 
        //this.fSteer = MathUtility.clamp(this.fSteer, this.maxForce); 
        this.fSteer.clampLength(-99999, this.maxForce); 
    }

    applyForce() {
        this.acceleration.add(this.fSteer); 
    }

    updatePosition() {
        // // What's my target velocity? 
        this.sumVec.addVectors(this.velocity, this.acceleration); 
        
        // What's my intermediate velocity? 
        // Lerp the velocity rather than just updating straight up.
        this.velocity = this.velocity.lerp(this.sumVec, this.smoothFactor); 
        //this.velocity = MathUtility.clamp(this.velocity, this.maxSpeed); 
        this.velocity.clampLength(-9999, this.maxSpeed); 

        this.position.add(this.velocity); 

        // Reset acceleration. 
        this.acceleration.multiplyScalar(0);
    }
}