// HoodManager.js
// Manages everything that happens around the hood. Primarily the following:
// 1: Manipulating the flock target for agents to animate around the hood. 
// 2: Builds and stores all the rest targets where agents will go and rest. 
// 3: Creating interesting patterns for agents by manipulating targets. 

const Diagnostics = require('Diagnostics'); 

import { EllipsePattern, RosePattern, ellipseConstructor, roseConstructor} from './PatternManager'
import * as SparkUtility from '../Utilities/SparkUtility'
import * as MathUtility from '../Utilities/MathUtility'
import { WORLD_STATE } from '../Core/World'
import { RestManager } from './RestManager'

export class HoodManager {
    constructor(sceneObjects, agents) {
        // FLOCKING in the HOOD.
        let flockOriginObj = sceneObjects['hood'][0]; 
        let flockOriginPos = SparkUtility.getLastPosition(flockOriginObj); 
        let moveFactor = MathUtility.degrees_to_radians(0.32); 
        // (Origin Object, Origin Vector, RadiusX, RadiusZ, Amplitude, isClockwise, MoveFactor)
        let patternObj = ellipseConstructor(flockOriginObj, flockOriginPos, 0.06, 0.04, 0.04, true, moveFactor);
        this.flockPattern = new EllipsePattern(patternObj); 

        // // PATTERNS in the HOOD. 
        let patternOrigins = sceneObjects['patternOrigins']; 
        this.patterns = []; 
        let phase = [0, 0, 3, 3, 5, 5, 7, 7]; // Add new phase adding a new agent.
        agents.forEach(a => {
            // Setup pattern variables. 
            let obj = patternOrigins[a.agentIdx]; // Debug object in Scene Viewer
            let pos = SparkUtility.getLastPosition(obj); // Target position
            let d = a.agentIdx % 2 === 0 ? true : false; // Direction
            let isSin = d; 
            let rad = 0.07; // Radius
            let moveFactor = MathUtility.degrees_to_radians(0.15); // How fast to move
            let ph = phase[a.agentIdx]; 
            let petals = 5; 
            let amp = 0.04; 
            let patternObj = roseConstructor(obj, pos, rad, ph, petals, amp, isSin, d, moveFactor); 
            let p = new RosePattern(patternObj);
            this.patterns.push(p);  
        }); 

        // RESTING in the HOOD. 
        this.restManager = new RestManager(sceneObjects); 
    }

    update(curWorldState) {
        if (curWorldState === WORLD_STATE.FLOCK_HOOD) {
            this.flockPattern.update(); 
            this.flockPattern.syncPatternObj(); 
        }

        if (curWorldState === WORLD_STATE.PATTERN_HOOD) {
            this.patterns.forEach(p => {
                p.update(); 
                p.syncPatternObj();
            });
        }
    }

    getFlockTarget() {
        return this.flockPattern.getTargetPos(); 
    }

    getAgentPatternTarget(idx) {
        return this.patterns[idx].getTargetPos(); 
    }

    getAgentRestTarget(idx) {
        return this.restManager.getRestTargetPosition(idx); 
    }
}