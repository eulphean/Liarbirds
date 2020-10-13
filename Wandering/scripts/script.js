// Main script.js
// All scene objects are collected and then operated upon. 

// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');

// Third Party libraries
const CANNON = require('cannon');

// Internal objects
const Utility = require('./Utility.js'); 
import Agent from './Agent.js'; 

// Targets where the agent needs to go. 
var targetObjs = []; 

 // Reference SphereObject from Scene
Promise.all([
    Scene.root.findFirst('Agent'),
    Scene.root.findFirst('Target1'),
    Scene.root.findFirst('Target2'),
    Scene.root.findFirst('Target3'),
    Scene.root.findFirst('Target4'),
    Scene.root.findFirst('Target5'),
]).then(function (objects) {
    var targetPositions = prepareTargets(objects); 
    const agent = new Agent(objects[0], targetPositions);

    Diagnostics.log('Setup complete'); 

    const timeInterval = 60;
    // Create time interval loop for cannon 
    Time.setInterval(function () {
        agent.update(); 
    }, timeInterval);
});

function prepareTargets(objects) {
    let targets = []; 
    
    // Store all targets objects.  
    targetObjs.push(objects[1]); 
    targetObjs.push(objects[2]);
    targetObjs.push(objects[3]); 
    targetObjs.push(objects[4]);
    targetObjs.push(objects[5]);

    // Extract positions. 
    targetObjs.forEach(t => {
        targets.push(Utility.getLastPosition(t));
    });
    return targets; 
}