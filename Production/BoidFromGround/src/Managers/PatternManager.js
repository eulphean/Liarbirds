
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