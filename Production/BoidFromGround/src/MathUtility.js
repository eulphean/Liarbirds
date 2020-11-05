// Utility.js 
// Helper module to do calculations, sceneObjects syncs and other updates.

const Reactive = require('Reactive'); 
import { Vector3 } from 'math-ds'; 
const Patches = require('Patches'); 
const Diagnostics = require('Diagnostics');

const map_range = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

const random = (min, max, isDecimal = false) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    if (isDecimal) {
        return (Math.random() * (max - min) + min).toFixed(3);
    } else {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

const azimuth = (v) => {
    return Math.atan2(v.y, v.x);
}

const inclination = (v) => {
    return Math.acos(v.z / v.length());
}

const radians_to_degrees = (radians) => {
    return radians * (180/Math.PI);
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
    inclination,
    azimuth,
    random,
    map_range
}