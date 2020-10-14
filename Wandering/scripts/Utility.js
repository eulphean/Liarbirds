const Reactive = require('Reactive'); 

module.exports = {
    getLastPosition(sceneObject) {
        // Acquire current agent position. 
        let posX = sceneObject.transform.x.pinLastValue(); 
        let posY = sceneObject.transform.y.pinLastValue(); 
        let posZ = sceneObject.transform.z.pinLastValue(); 
        return Reactive.vector(posX, posY, posZ); 
    },

    syncSceneObject(sceneObject, targetVector) {
        sceneObject.transform.x = targetVector.x; 
        sceneObject.transform.y = targetVector.y;
        sceneObject.transform.z = targetVector.z; 
    },

    map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    },

    random(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
    },

    // This is also the heading2D of the vector
    azimuth(v) {
        let y = v.y.pinLastValue();
        let x = v.x.pinLastValue();
        return Math.atan2(y, x); 
    },

    // Phi is the angle into the z plane (This is angle from the Z axis)
    // Math.asin (To get elevation angle from X-Y plan)
    // Check this link for the formulas 
    // https://stackoverflow.com/questions/23856489/pvector-heading-for-3d-rotation
    inclination(v) {
        let z = v.z.pinLastValue();
        let mag = v.magnitude().pinLastValue();
        //return Math.acos(v.z / v.length()); 
        return Math.acos(z / mag);
    },

    radians_to_degrees(radians)
    {
        return radians * (180/Math.PI);
    }
}