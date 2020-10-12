// script.js
 
 const Scene = require('Scene');
 const Time = require('Time')
 const CANNON = require('cannon');
 
 // Reference SphereObject from Scene
 Promise.all([
     Scene.root.findFirst('Sphere0'),
     Scene.root.findFirst('plane0')
 ]).then(function (objects) {
     const sphere = objects[0];
     const plane = objects[1];
 
     // Create cannon world and setting gravity
     const world = new CANNON.World();
     world.gravity.set(0, -9.8, 0);
 
     // Create sphere body and setting its shape and properties
     const radius = 5;
     const sphereProps = {
         mass: 3,
         position: new CANNON.Vec3(0, 200, 0),
         radius: radius,
         shape: new CANNON.Sphere(radius),
     }
 
     const sphereBody = new CANNON.Body(sphereProps);
     world.addBody(sphereBody);
 
     // Create ground body and settings its shape and properties
     const groundProps = {
         mass: 0,
         position: new CANNON.Vec3(0, 0, 0),
         shape: new CANNON.Plane(),
     }
     const groundBody = new CANNON.Body(groundProps);
 
     // Rotate the ground so it is flat (facing upwards)
     const angle = -Math.PI / 2;
     const xAxis = new CANNON.Vec3(1, 0, 0);
     groundBody.quaternion.setFromAxisAngle(xAxis, angle);
 
     world.addBody(groundBody);
 
     // Configure time step for Cannon
     const fixedTimeStep = 1.0 / 60.0;
     const maxSubSteps = 3;
     const timeInterval = 30;
     let lastTime;
 
     // Create time interval loop for cannon 
     Time.setInterval(function (time) {
         if (lastTime !== undefined) {
             let dt = (time - lastTime) / 1000;
             world.step(fixedTimeStep, dt, maxSubSteps)

             plane.transform.x = groundBody.position.x;
             plane.transform.y = groundBody.position.y;
             plane.transform.z = groundBody.position.z; 

             var newRot = {};
			 var rot = groundBody.quaternion.toEuler(newRot);

    		 plane.transform.rotationX = newRot.x
    		 plane.transform.rotationY = newRot.y
             plane.transform.rotationZ = newRot.z
 
             sphere.transform.x = sphereBody.position.x;
             sphere.transform.y = sphereBody.position.y;
             sphere.transform.z = sphereBody.position.z;
         }
 
         lastTime = time
     }, timeInterval);
 });