// Main script.js
// All scene objects are collected and then operated upon. 
// TODO: Make the cannon objects kinematic. Static with no collisions
// TODO: Create a base class Scene that loads everything, maintains all the Boids
const Scene = require('Scene');
const Time = require('Time')
const CANNON = require('cannon');
import Agent from './Agent.js'


 // Reference SphereObject from Scene
Promise.all([
    Scene.root.findFirst('Sphere0'),
    Scene.root.findFirst('Sphere1'),
    Scene.root.findFirst('Sphere2')
]).then(function (objects) {
    // Create Physics world. 
    const world = new CANNON.World();
    world.gravity.set(0, 0, 0);

    // TODO: Wrap this within a loop because there will be a lot of agents that'll be discovered. 
    // Agent A
    const sphereA = objects[0];
    const agentA = new Agent(sphereA, world);

    // Agent B
    const sphereB = objects[1];
    const agentB = new Agent(sphereB, world);

    // Agent C
    const sphereC = objects[2];
    const agentC = new Agent(sphereC, world); 

    // Configure time step for Cannon
    const fixedTimeStep = 1.0 / 60.0;
    const maxSubSteps = 3;
    const timeInterval = 30;
    let lastTime;

    // Create time interval loop for cannon 
    Time.setInterval(function (time) {
        if (lastTime !== undefined) {
            // let dt = (time - lastTime) / 1000;
            // world.step(fixedTimeStep, dt, maxSubSteps)
            
            // Update agents
            // Sending in fake velocities. 
            agentA.update(0.05); 
            agentB.update(0.1);
            agentC.update(0.15); 
        }

        lastTime = time
    }, timeInterval);
});
