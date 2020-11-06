// HoodManager.js
// Manages everything that happens around the hood. Primarily the following:
// 1: Manipulating the flock target for agents to animate around the hood. 
// 2: Builds and stores all the rest targets where agents will go and rest. 
// 3: Creating interesting patterns for agents by manipulating targets. 

import { Vector3 } from 'math-ds'
import * as SparkUtility from '../Utilities/SparkUtility.js'
import * as MathUtility from '../Utilities/MathUtility.js'
import { WORLD_STATE } from '../Core/World.js'

const MOVE_FACTOR_ROSE = 0.05;
const MOVE_FACTOR_ELLIPSE = 0.25; 
export class HoodManager {
    constructor(sceneObjects) {
        // Store rest targets right away. 
        this.flockTargetObj = sceneObjects['hood'][0];

        // Origin point around which actions happens.  
        this.flockTargetOrigin = SparkUtility.getLastPosition(this.flockTargetObj); 

        // Target vector, which is manipulated. 
        this.flockTargetVec = new Vector3(0, 0, 0); 

        // Polar coordinates (r, theta) 
        this.theta = 0;
    }

    update(curWorldState) {
        if (curWorldState === WORLD_STATE.FLOCK_HOOD) {
            this.ellipsePattern(0.2, 0.05); 
            // Only for debug purposes when I need to see where is the target position. 
            SparkUtility.syncSceneObject(this.flockTargetObj, this.flockTargetVec);
        }

        if (curWorldState === WORLD_STATE.PATTERN_HOOD) {
            this.roseCurvePattern(0.2, 4); 
            // Only for debug purposes when I need to see where is the target position. 
            SparkUtility.syncSceneObject(this.flockTargetObj, this.flockTargetVec);
        }
    }

    circlePattern(radius) {
        this.ellipsePattern(radius, radius); 
    }

    // k is even = 2K petals. 
    // k is odd = k petals.
    // Set yPos to give it variation in height. 
    roseCurvePattern(radius, k) {
        let r = radius; 
        let theta_rad = MathUtility.degrees_to_radians(this.theta); 
        
        // Rose-Curve: Cartesian coordinates. 
        let xPos = this.flockTargetOrigin.x + r * Math.cos(k * theta_rad) * Math.cos(theta_rad); // Defines polar curve.
        let zPos = this.flockTargetOrigin.z + r * Math.cos(k * theta_rad) * Math.sin(theta_rad); // Defines polar curve.
        let yPos = this.flockTargetOrigin.y + 0.05 * Math.sin(theta_rad); // Defines height. 
        this.flockTargetVec.set(xPos, yPos, zPos); 
        this.theta = this.theta - MOVE_FACTOR_ROSE; 
    }

    // Use this functions to create a custom animation curve for the agents. 
    ellipsePattern(radiusX, radiusZ) {
        let theta_rad = MathUtility.degrees_to_radians(this.theta); 
        
        // Ellipse: Cartesian coordinates. 
        let xPos = this.flockTargetOrigin.x + radiusX * Math.cos(theta_rad); // Defines polar curve. 
        let zPos = this.flockTargetOrigin.z + radiusZ * Math.sin(theta_rad); // Define polar curve. 
        let yPos = this.flockTargetOrigin.y + 0.05 * Math.sin(theta_rad); // Defines height. 
        this.flockTargetVec.set(xPos, yPos, zPos); 
        this.theta = this.theta - MOVE_FACTOR_ELLIPSE; 
    }
}