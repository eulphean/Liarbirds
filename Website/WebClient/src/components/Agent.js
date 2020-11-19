import * as THREE from 'three'
import Target from './Target'
import * as Utility from './Utility'
import { EllipsePattern, ellipseConstructor } from './PatternManager'

export default class Agent {
    constructor(scene, i, startY) {
        this.idx = i; 
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
        this.maxForce = 3.0; 
        this.maxSpeed = 3.0; 
        this.maxSlowDownSpeed = 0; 

        // Tolerances
        this.slowDownTolerance = 0.2 * 0.2; 
        this.arriveTolerance = 0.01 * 0.01; 

        // Velocity smooth
        this.smoothFactor = 0.001; 

        // Initial position and target.
        this.initPosition(startY); 

        // Create a polar pattern. 
        this.setupPattern();
    }

    initPosition(startY) {
        // const radius = Utility.getRandomNum(-300, 300);
        // const theta = THREE.Math.degToRad(Utility.getRandomNum(360)); 
        // const phi = THREE.Math.degToRad(Utility.getRandomNum(180)); 

        //this.position.x = Math.sin(theta) * Math.cos(phi) * radius;
        this.position.x = 0;  
        // this.position.y = Math.sin(theta) * Math.sin(phi) * radius;
        this.position.z = 0; 
        //this.position.z = Math.cos(theta) * radius;
        this.position.y = startY;
    }

    setupPattern() {
        let o = this.position.clone(); 
        let moveFactor = THREE.Math.degToRad(0.3); 
        let d = this.idx % 2 === 0 ? true : false; 
        // (Origin Vector, RadiusX, RadiusZ, Amplitude, isClockwise, MoveFactor)
        let patternObj = ellipseConstructor(o, 30, 30, 10, d, moveFactor);
        this.pattern = new EllipsePattern(patternObj);   
    }

    updateAgent() {
        // Behaviors. 
        this.applyBehaviors();
        this.updatePosition();

        // Pattern
        this.pattern.update(); 
        this.target.setVector(this.pattern.getTargetPos());
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