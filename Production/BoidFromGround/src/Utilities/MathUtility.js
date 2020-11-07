// Utility.js 
// Helper module to do calculations, sceneObjects syncs and other updates.

const Reactive = require('Reactive'); 
const Patches = require('Patches'); 
const Diagnostics = require('Diagnostics');

const map_range = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

const random = (min, max, isDecimal = false) => {
    if (isDecimal) {
        return (Math.random() * (max - min) + min).toFixed(3);
    } else {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

(Math.random() * (0.120 - 0.0200) + 0.0200).toFixed(4)

const azimuth = (v) => {
    return Math.atan2(v.y, v.x);
}

const inclination = (v) => {
    return Math.acos(v.z / v.length());
}

const radians_to_degrees = (radians) => {
    return radians * (180/Math.PI);
}

const degrees_to_radians = (degrees) => {
    return degrees * (Math.PI/180);
}

const axisRotation = (axis_x, axis_y, axis_z, angle_radians, q) => {
    var norm = Math.sqrt(axis_x * axis_x + axis_y * axis_y + axis_z * axis_z);
    axis_x /= norm;
    axis_y /= norm;
    axis_z /= norm;
    var cos = Math.cos(angle_radians / 2);
    var sin = Math.sin(angle_radians / 2);
    q.set(axis_x * sin, axis_y * sin, axis_z * sin, cos); 
    //return Reactive.quaternion(cos, axis_x * sin, axis_y * sin, axis_z * sin);
}

const clamp = (vector, maxMag) => {
    let length = vector.length(); 
    let m = length > maxMag ? maxMag/length : 1.0; 
    vector.multiplyScalar(m); 
    return vector; 
}

export {
    clamp,
    axisRotation,
    radians_to_degrees,
    degrees_to_radians,
    inclination,
    azimuth,
    random,
    map_range
}