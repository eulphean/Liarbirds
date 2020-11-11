// DeathManager.js

import * as SparkUtility from '../Utilities/SparkUtility.js'
import { Vector3 } from 'math-ds'

export class DeathManager {
    constructor(sceneObjects) {
        this.deathBedObjects = sceneObjects['deathBeds']; 
        this.targets = [];
        this.deathBedObjects.forEach(d => {
            let t = new Vector3(0, 0, 0); 
            this.targets.push(t); 
        }); 
    }
    
    calcDeathTarget(idx, position){
        // Show death bed. 
        let deathBed = this.deathBedObjects[idx];
        deathBed.hidden = false; 

        let d = position.y - 0; 
        let y; 
        if (d > 0) {
            if (d > 0.1) {
                y = 0; 
            } else {
                y = position.y - 0.1; 
            }
        } else {
            y = position.y - 0.1;
        }

        // Calculate death target based on current position. 
        // y is 0 = to make the agent fall on the ground. 
        this.targets[idx].set(position.x, y, position.z);  
        
        // Move the death bed to the target. 
        SparkUtility.syncSceneObject(deathBed, this.targets[idx]); 

        // Reset the position slightly for the agents (offset, rock)
        this.targets[idx].set(position.x + 0.01, y-0.0003, position.z - 0.003); 
    }
    
    getDeathTarget(idx) {
        return this.targets[idx]; 
    }
}