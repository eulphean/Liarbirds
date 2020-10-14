// Main script.js
// All scene objects are collected and then operated upon. 

// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');

// Internal objects
const Utility = require('./Utility.js'); 
import Agent from './Agent.js'; 

// Targets where the agent needs to go. 
var targetObjs = []; 

let agents = []; 

 // Reference SphereObject from Scene
Promise.all([
    Scene.root.findFirst('Agent0'),
    Scene.root.findFirst('Agent1'),
    Scene.root.findFirst('Agent2'),
    Scene.root.findFirst('Agent3'),
    Scene.root.findFirst('Target1'),
    Scene.root.findFirst('Target2'),
    Scene.root.findFirst('Target3'),
    Scene.root.findFirst('Target4'),
]).then(function (objects) {
    // Add targets. 
    let t1 = objects[4]; 
    let t2 = objects[5]; 
    let t3 = objects[6]; 
    let t4 = objects[7]; 

    // Prepare agents. 
    let agent = new Agent(objects[0], t1);
    agents.push(agent); 
    agent = new Agent(objects[1], t2); 
    agents.push(agent); 
    agent = new Agent(objects[2], t3);
    agents.push(agent); 
    agent = new Agent(objects[3], t4); 
    agents.push(agent); 

    Diagnostics.log('Setup complete'); 

    const timeInterval = 60;
    // Create time interval loop for cannon 
    Time.setInterval(function () {
        agents.forEach(a => {
            a.update(); 
        });
    }, timeInterval);
});

// function prepareTargets(objects) {
//     let targets = []; 
    
//     // Store all targets objects.  
//     targetObjs.push(objects[1]); 
//     targetObjs.push(objects[2]);
//     targetObjs.push(objects[3]); 
//     targetObjs.push(objects[4]);
//     targetObjs.push(objects[5]);

//     // Extract positions. 
//     targetObjs.forEach(t => {
//         targets.push(Utility.getLastPosition(t));
//     });
//     return targets; 
// }