// HoodManager.js
// Manages everything that happens around the hood. Primarily the following:
// 1: Manipulating the flock target for agents to circle around the hood. 
// 2: Builds and stores all the rest targets where agents will go and rest. 
// 3: Creating interesting patterns for agents by manipulating targets. 

import { Vector3 } from 'math-ds'
import * as SparkUtility from '../Utilities/SparkUtility.js'
import * as MathUtility from '../Utilities/MathUtility.js'
import { WORLD_STATE } from '../Core/World.js'

export class HoodManager {
    constructor(sceneObjects) {
        // Store rest targets right away. 
        this.flockTargetObj = sceneObjects['hood'][0]; 
        this.flockTargetOrigin = SparkUtility.getLastPosition(this.flockTargetObj); 
        this.flockTargetVec = new Vector3(0, 0, 0); 
        this.azimuth = 0;
        this.targetRadius = 0.2;  
    }

    update(curWorldState) {
        if (curWorldState === WORLD_STATE.FLOCK_HOOD) {
            let azi_rad = MathUtility.degrees_to_radians(this.azimuth); 
            let xPos = this.flockTargetOrigin.x + this.targetRadius * Math.cos(azi_rad);
            let zPos = this.flockTargetOrigin.z + this.targetRadius * Math.sin(azi_rad); 
            this.flockTargetVec.set(xPos, this.flockTargetOrigin.y, zPos); 
            this.azimuth = this.azimuth - 0.25; 
    
            // This flockTarget is what I need to as the target of the agents
            // And then flock the agents aronnd that point. 
            SparkUtility.syncSceneObject(this.flockTargetObj, this.flockTargetVec);
        }
    }
}