// HoodManager.js
// Manages everything that happens around the hood. Primarily the following:
// 1: Manipulating the flock target for agents to animate around the hood. 
// 2: Builds and stores all the rest targets where agents will go and rest. 
// 3: Creating interesting patterns for agents by manipulating targets. 

const Diagnostics = require('Diagnostics'); 
import { Vector3 } from 'math-ds'
import * as SparkUtility from '../Utilities/SparkUtility.js'
import * as MathUtility from '../Utilities/MathUtility.js'
import { WORLD_STATE } from '../Core/World.js'

const MOVE_FACTOR_ROSE = 0.05;
const MOVE_FACTOR_ELLIPSE = 0.05; 

const PATTERNS = ['circle', 'ellipse', 'rose', 'custom']; 
export class HoodManager {
    constructor(sceneObjects) {
        // Get flock target object and use that to calculate origin of the polar world. 
        this.flockTargetObj = sceneObjects['hood'][0];

        // Origin point around which actions happens.  
        this.flockTargetOrigin = SparkUtility.getLastPosition(this.flockTargetObj); 

        // Target vector, which is manipulated. 
        this.flockTargetVec = new Vector3(0, 0, 0); 

        // Setup pattern targets for each agent. 
        this.patternTargets = []; 
        sceneObjects['agents'].forEach(a => {
            let rIdx = MathUtility.random(0, PATTERNS.length-1); 
            let t = {
                vec: new Vector3 (0, 0, 0),
                pat: PATTERNS[rIdx], // TODO: Pick randomly or something.  // Improve this a little bit
                // Use only a single pattern I presume. 
                rad: MathUtility.random(1, 3, true)/10, 
                height: MathUtility.random(1, 5, true)/100
            }

            this.patternTargets.push(t); 
        }); 

        // Polar coordinates (r, theta) 
        this.theta = 0;
    }

    getFlockTarget() {
        return this.flockTargetVec; 
    }

    getAgentTarget(idx) {
        return this.patternTargets[idx].vec; 
    }

    update(curWorldState) {
        if (curWorldState === WORLD_STATE.FLOCK_HOOD) {
            this.ellipsePattern(this.flockTargetVec, 0.2, 0.05, 0.05); 
            // Only for debug purposes when I need to see where is the target position. 
            SparkUtility.syncSceneObject(this.flockTargetObj, this.flockTargetVec);
        }

        if (curWorldState === WORLD_STATE.PATTERN_HOOD) {
            this.patternTargets.forEach(t => {
                let pattern = t.pat; 
                switch (pattern) {
                    case 'circle': {
                        this.circlePattern(t.vec, t.rad, t.height); 
                        break;
                    }

                    case 'ellipse': {
                        // TODO: Figure out radius situation. 
                        this.ellipsePattern(t.vec, t.rad, t.rad, t.height); 
                        break; 
                    }

                    case 'rose': {
                        this.roseCurvePattern(t.vec, t.rad, t.height, 3); 
                        break; 
                    }

                    case 'custom': {
                        this.customPattern(t.vec, t.rad, t.height); 
                        break; 
                    }

                    default: {
                        this.circlePattern(t.vec, t.rad, t.height); 
                        break; 
                    }
                }
            }); 
        }
    }

    circlePattern(targetVector, radius, heightOffset) {
        this.ellipsePattern(targetVector, radius, radius, heightOffset); 
    }

    // k is even = 2K petals. 
    // k is odd = k petals.
    // Set yPos to give it variation in height. 
    roseCurvePattern(targetVector, radius, height, k) {
        let theta_rad = MathUtility.degrees_to_radians(this.theta); 
        let cartesianRadius = radius * Math.cos(k * theta_rad); 

        // Rose-Curve: Cartesian coordinates. 
        let xPos = this.flockTargetOrigin.x + cartesianRadius * Math.cos(theta_rad); // Defines polar curve.
        let zPos = this.flockTargetOrigin.z + cartesianRadius * Math.sin(theta_rad); // Defines polar curve.
        let yPos = this.flockTargetOrigin.y + height * Math.sin(theta_rad); // Defines height. 
        targetVector.set(xPos, yPos, zPos); 
        this.theta = this.theta - MOVE_FACTOR_ROSE; 
    }

    // Use this functions to create a custom animation curve for the agents. 
    ellipsePattern(targetVector, radiusX, radiusZ, height) {
        let theta_rad = MathUtility.degrees_to_radians(this.theta); 
        
        // Ellipse: Cartesian coordinates. 
        let xPos = this.flockTargetOrigin.x + radiusX * Math.cos(theta_rad); // Defines polar curve. 
        let zPos = this.flockTargetOrigin.z + radiusZ * Math.sin(theta_rad); // Define polar curve. 
        let yPos = this.flockTargetOrigin.y + height * Math.sin(theta_rad); // Defines height. 
        targetVector.set(xPos, yPos, zPos); 
        this.theta = this.theta - MOVE_FACTOR_ELLIPSE; 
    }

    // NOTE: Create a custom polar pattern on desmos.com
    customPattern(targetVector, radius, height) {
        let theta_rad = MathUtility.degrees_to_radians(this.theta); 
        let cartesianRadius = radius - Math.cos(theta_rad) * Math.sin(3*theta_rad); 
        
        // Rose-Curve: Cartesian coordinates. 
        let xPos = this.flockTargetOrigin.x + cartesianRadius * Math.cos(theta_rad); // Defines polar curve.
        let zPos = this.flockTargetOrigin.z + cartesianRadius * Math.sin(theta_rad); // Defines polar curve.
        let yPos = this.flockTargetOrigin.y + height * Math.sin(theta_rad); // Defines height. 
        targetVector.set(xPos, yPos, zPos); 
        this.theta = this.theta - MOVE_FACTOR_ROSE; 
    }
}

// if (curWorldState === WORLD_STATE.PATTERN_HOOD) {
//     //this.roseCurvePattern(0.2, 4); 
//     // this.customPattern(0.1); 
//     // Only for debug purposes when I need to see where is the target position. 
//     SparkUtility.syncSceneObject(this.flockTargetObj, this.flockTargetVec);
// }