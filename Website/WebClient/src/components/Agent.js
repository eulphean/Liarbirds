import * as THREE from 'three'
// import Target from './Target'
import * as Utility from './Utility'
import { RosePattern, roseConstructor} from './PatternManager'

const FLOCKING_WEIGHTS = {
    SEPERATION: 5.0,
    COHESION: 1.5,
    ALIGNMENT: 1.5
}

export default class Agent {
    constructor(scene, i, startY, phase) {
        this.idx = i; 
        // Construct all important variables. 
        this.position = new THREE.Vector3(0, 0, 0); // Get initial velocity
        this.velocity = new THREE.Vector3(0, -0.3, 0); 
        this.acceleration = new THREE.Vector3(0, 0, 0); 
        this.fSteer = new THREE.Vector3(0, 0, 0); 
        this.sumVec = new THREE.Vector3(0, 0, 0);
        this.diffVec = new THREE.Vector3(0, 0, 0); 
        this.rotationA = new THREE.Quaternion(); 
        this.rotationB = new THREE.Quaternion(); 

        this.initialPatternPosition = new THREE.Vector3(0, startY, 0); 

        this.target = new THREE.Vector3(0, 0, 0); 
  
        // Force and speeds. 
        this.maxForce = 1.5; 
        this.maxSpeed = 1.5; 
        this.maxSlowDownSpeed = 0; 

        // Tolerances
        this.slowDownTolerance = 0.2 * 0.2; 
        this.arriveTolerance = 0.01 * 0.01; 

        // Velocity smooth
        this.smoothFactor = 0.001; 

        // Initial position and target.
        this.initPosition(startY); 

        // Create a polar pattern. 
        this.setupPattern(phase);
    }

    initPosition(startY) {
        this.position.x = startY 
        this.position.z = 0; 
        this.position.y = 175;
    }

    setupPattern(phase) {
        // Setup pattern variables. 
        let pos = this.initialPatternPosition.clone(); // Target position
        let d = this.idx % 2 === 0 ? true : false; // Direction
        let isSin = d; 
        let rad = 50; // Radius
        let moveFactor = THREE.Math.degToRad(0.1); // How fast to move
        let petals = 5; 
        let amp = 20; 
        let patternObj = roseConstructor(pos, rad, phase, petals, amp, isSin, d, moveFactor); 
        this.rosePattern = new RosePattern(patternObj); 
    }

    updateAgent(nAgents) {
        // Behaviors. 
        this.applyBehaviors(nAgents);
        this.updatePosition();
    }

    applyBehaviors(nAgents) {
        this.seek();
        this.applyForce(); 

        this.flock(nAgents); 
    }

    flock(nAgents) {
        if (nAgents.length > 0) {
            // Seperation
            this.seperation(nAgents);
            this.applyForce();

            // Cohesion
            this.cohesion(nAgents);
            this.applyForce();

            // Alignment
            this.align(nAgents); 
            this.applyForce(); 
        }
    }

    seek() {
        this.fSteer.subVectors(this.target, this.position); 
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
            if (this.sumVec.lengthSq() > 0) {
                this.sumVec.normalize(); 
                this.sumVec.clampLength(-99999, this.maxSpeed);
                this.fSteer.subVectors(this.sumVec, this.velocity);
                this.fSteer.clampLength(-99999, this.maxForce); 
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
            this.fSteer.clampLength(-99999, this.maxForce); 
            this.fSteer.multiplyScalar(FLOCKING_WEIGHTS.ALIGNMENT); // Apply alignment weight. 
        }
    }
}