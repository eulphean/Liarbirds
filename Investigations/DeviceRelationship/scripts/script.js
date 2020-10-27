const Scene = require('Scene');
const Diagnostics = require('Diagnostics');
const DeviceMotion = require('DeviceMotion');
 
 // Reference SphereObject from Scene
 Promise.all([
     Scene.root.findFirst('PlaneTarget'),
     Scene.root.findFirst('CamTarget')
 ]).then(function (objects) {
     let localTarget = objects[0];	
     let cameraTarget = objects[1]; 

     let localTargetTransform = localTarget.worldTransform; 
     let cameraTargetTransform = cameraTarget.worldTransform; 

     localTargetTransform.position = cameraTargetTransform.position;
 });