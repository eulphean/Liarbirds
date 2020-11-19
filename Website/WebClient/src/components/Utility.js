const getRandomNum = (max = 0, min = 0) => {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

const map_range = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

const azimuth = (v) => {
    return Math.atan2(v.y, v.x);
}

const inclination = (v) => {
    return Math.acos(v.z / v.length());
}

const axisRotation = (axis_x, axis_y, axis_z, angle_radians, q) => {
    var norm = Math.sqrt(axis_x * axis_x + axis_y * axis_y + axis_z * axis_z);
    axis_x /= norm;
    axis_y /= norm;
    axis_z /= norm;
    var cos = Math.cos(angle_radians / 2);
    var sin = Math.sin(angle_radians / 2);
    q.set(axis_x * sin, axis_y * sin, axis_z * sin, cos); 
}

export {
    getRandomNum,
    map_range,
    azimuth,
    inclination,
    axisRotation
}