import * as SparkUtility from '../Utilities/SparkUtility.js'

export class RestManager {
    constructor(sceneObjects) {
        let targets = sceneObjects['restTargets']; 
        this.restTargets = []; 
        targets.forEach(t => {
            let p = SparkUtility.getLastPosition(t);
            this.restTargets.push(p); 
        }); 
    }

    getRestTargetPosition(idx) {
        return this.restTargets[idx]; 
    }
}