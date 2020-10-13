const CANNON = require('cannon'); 

module.exports = {
    getLastPosition(sceneObject) {
        // Acquire current agent position. 
        let posX = sceneObject.transform.x.pinLastValue(); 
        let posY = sceneObject.transform.y.pinLastValue(); 
        let posZ = sceneObject.transform.z.pinLastValue(); 
        return new CANNON.Vec3(posX, posY, posZ); 
    },

    syncSceneObject(sceneObject, targetVector) {
        sceneObject.transform.x = targetVector.x; 
        sceneObject.transform.y = targetVector.y;
        sceneObject.transform.z = targetVector.z; 
    },

    map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
}