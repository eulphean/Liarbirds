
// Common pattern variables across multiple patterns. 
// Extend this class to implement your own pattern. 

const Diagnostics = require('Diagnostics'); 
import { Vector3 } from 'math-ds'
import * as SparkUtility from '../Utilities/SparkUtility'; 

class Pattern {
    constructor(patternObj) {
        this.theta_rad = 0; 
        this.amp = patternObj.amp;  
        this.isClockwise = patternObj.dir; 
        this.originPos = patternObj.pos; 
        this.originObj = patternObj.obj; 
        this.moveFactor = patternObj.move; 
        this.targetPos = new Vector3(0, 0, 0); // Agents follow this target. 
    }

    updateTheta(maxTheta) {
        // Update theta based on direction. 
        this.theta_rad = this.isClockwise ? 
            this.theta_rad + this.moveFactor : 
            this.theta_rad - this.moveFactor; 

        // Reset theta. 
        this.theta_rad = this.theta_rad >= maxTheta ? 0 : this.theta_rad;
    }

    cartesianX(r) {
        return this.originPos.x + r * Math.cos(this.theta_rad);
    }

    cartesianZ(r) {
        return this.originPos.z + r * Math.sin(this.theta_rad);
    }
    
    cartesianY(r) {
        return this.originPos.y + this.amp * Math.sin(this.theta_rad);
    }

    getTargetPos() {
        return this.targetPos; 
    }

    // Debug Only 
    // To see where we're at. 
    syncPatternObj() {
        SparkUtility.syncSceneObject(this.originObj, this.targetPos); 
    }
}

export const ellipseConstructor = (originObj, originPos, radX, radZ, amplitude, isClockwise, moveFactor) => {
    return {
        obj: originObj, // C
        pos: originPos, // C
        radx: radX,
        radz: radZ,
        amp: amplitude, // C
        dir: isClockwise, // C
        move: moveFactor // C
    }; 
}

export class EllipsePattern extends Pattern {
    constructor(patternObj) {
        super(patternObj); 
        this.radX = patternObj.radx; 
        this.radZ = patternObj.radz; 
        this.maxTheta = 2*Math.PI; 
    }

    update() {
        // Ellipse: Cartesian coordinates. 
        let xPos = this.cartesianX(this.radX); // Defines polar curve. 
        let zPos = this.cartesianZ(this.radZ); // Define polar curve. 
        let yPos = this.cartesianY(); // Defines height. 
        this.targetPos.set(xPos, yPos, zPos); 

        this.updateTheta(this.maxTheta); 
    }
}

export const roseConstructor = (originObj, originPos, radius, phase, numPetals, amplitude, isSinusoidal, isClockwise, moveFactor) => {
    return {
        obj: originObj, // C
        pos: originPos, // C
        rad: radius,
        ph: phase, 
        numP: numPetals,
        amp: amplitude, // C
        isSin: isSinusoidal,
        dir: isClockwise, // C
        move: moveFactor // C
    }
}

// r = asin(b + cTheta); 
// r = acos(b + cTheta); 
// a = radius
// b = phase
// c = numPetals
export class RosePattern extends Pattern {
    constructor(patternObj) {
        super(patternObj); 
        this.rad = patternObj.rad; 
        this.phase = patternObj.ph; 
        this.numPetals = patternObj.numP;
        this.isSin = patternObj.isSin; 
        this.maxTheta = Math.PI; 
    }

    update() {
        let xPos, yPos, zPos; 
        let r = this.isSin ? this.rad * Math.sin(this.phase + this.numPetals * this.theta_rad) : 
            this.rad * Math.cos(this.phase + this.numPetals * this.theta_rad)

        xPos = this.cartesianX(r); // Defines polar curve. 
        zPos = this.cartesianZ(r); // Defines polar curve. 
        yPos = this.cartesianY(); // Defines height. 

        this.targetPos.set(xPos, yPos, zPos); 

        this.updateTheta(this.maxTheta);
    }
}


// export class CustomPattern extends Pattern {

// }

        // // Setup pattern targets for each agent. 


        //     this.patternTargets.push(t); 
        // }); 

        // circlePattern(targetVector, radius, heightOffset) {
        //     this.ellipsePattern(targetVector, radius, radius, heightOffset); 
        // }
    
        // // k is even = 2K petals. 
        // // k is odd = k petals.
        // // Set yPos to give it variation in height. 
        // roseCurvePattern(targetVector, radius, height, k) {
        //     let theta_rad = MathUtility.degrees_to_radians(this.theta); 
        //     let cartesianRadius = radius * Math.cos(k * theta_rad); 
    
        //     // Rose-Curve: Cartesian coordinates. 
        //     let xPos = this.flockTargetOrigin.x + cartesianRadius * Math.cos(theta_rad); // Defines polar curve.
        //     let zPos = this.flockTargetOrigin.z + cartesianRadius * Math.sin(theta_rad); // Defines polar curve.
        //     let yPos = this.flockTargetOrigin.y + height * Math.sin(theta_rad); // Defines height. 
        //     targetVector.set(xPos, yPos, zPos); 
        //     this.theta = this.theta - MOVE_FACTOR_ROSE; 
        // }
    
        // // Use this functions to create a custom animation curve for the agents. 
        // ellipsePattern(targetVector, radiusX, radiusZ, height) {
        //     let theta_rad = MathUtility.degrees_to_radians(this.theta); 
            
        //     // Ellipse: Cartesian coordinates. 
        //     let xPos = this.flockTargetOrigin.x + radiusX * Math.cos(theta_rad); // Defines polar curve. 
        //     let zPos = this.flockTargetOrigin.z + radiusZ * Math.sin(theta_rad); // Define polar curve. 
        //     let yPos = this.flockTargetOrigin.y + height * Math.sin(theta_rad); // Defines height. 
        //     targetVector.set(xPos, yPos, zPos); 
        //     this.theta = this.theta - MOVE_FACTOR_ELLIPSE; 
        // }
    
        // // NOTE: Create a custom polar pattern on desmos.com
        // customPattern(targetVector, radius, height) {
        //     let theta_rad = MathUtility.degrees_to_radians(this.theta); 
        //     let cartesianRadius = radius - Math.cos(theta_rad) * Math.sin(3*theta_rad); 
            
        //     // Rose-Curve: Cartesian coordinates. 
        //     let xPos = this.flockTargetOrigin.x + cartesianRadius * Math.cos(theta_rad); // Defines polar curve.
        //     let zPos = this.flockTargetOrigin.z + cartesianRadius * Math.sin(theta_rad); // Defines polar curve.
        //     let yPos = this.flockTargetOrigin.y + height * Math.sin(theta_rad); // Defines height. 
        //     targetVector.set(xPos, yPos, zPos); 
        //     this.theta = this.theta - MOVE_FACTOR_ROSE; 
        // }

        // if (curWorldState === WORLD_STATE.PATTERN_HOOD) {
//     //this.roseCurvePattern(0.2, 4); 
//     // this.customPattern(0.1); 
//     // Only for debug purposes when I need to see where is the target position. 
//     SparkUtility.syncSceneObject(this.flockTargetObj, this.flockTargetVec);
// }

// // PatternManager.js
// // Handles pattern making 
// export class PatternManager {
//     constructor(sceneObjects) {
//                 // this.patternTargets = []; 
//         // sceneObjects['agents'].forEach(a => {
//         //     let rIdx = MathUtility.random(0, PATTERNS.length-1); 
//         //     let t = {
//         //         vec: new Vector3 (0, 0, 0),
//         //         pat: PATTERNS[rIdx], // TODO: Pick randomly or something.  // Improve this a little bit
//         //         // Use only a single pattern I presume. 
//         //         rad: MathUtility.random(1, 3, true)/10, 
//         //         height: MathUtility.random(1, 5, true)/100
//         //     }

//     }
// }