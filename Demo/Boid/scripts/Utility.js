// Utility.js 
// Helper module to do calculations, sceneObjects syncs and other updates. 

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
        return Math.atan2(v.y, v.x); 
    },

    // Phi is the angle into the z plane. Also, called inclination.
    // https://stackoverflow.com/questions/23856489/pvector-heading-for-3d-rotation
    inclination(v) {
        return Math.acos(v.z / v.length());
    },

    radians_to_degrees(radians)
    {
        return radians * (180/Math.PI);
    },

    axisRotation(axis_x, axis_y, axis_z, angle_radians) {
        var norm = Math.sqrt(axis_x * axis_x + axis_y * axis_y + axis_z * axis_z);
        axis_x /= norm;
        axis_y /= norm;
        axis_z /= norm;
        //var angle_radians = angle_degrees * Math.PI / 180.0;
        var cos = Math.cos(angle_radians / 2);
        var sin = Math.sin(angle_radians / 2);
        return Reactive.quaternion(cos, axis_x * sin, axis_y * sin, axis_z * sin);
      }
}