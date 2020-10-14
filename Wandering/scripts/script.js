// Main script.js

// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');

// Internal objects
const Utility = require('./Utility.js'); 
import Agent from './Agent.js'; 


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
    // Prepare targets objects. 
    let t1 = objects[4]; 
    let t2 = objects[5]; 
    let t3 = objects[6]; 
    let t4 = objects[7]; 

    // Prepare agent objects.  
    let agent = new Agent(objects[0], t1);
    agents.push(agent); 
    agent = new Agent(objects[1], t2); 
    agents.push(agent); 
    agent = new Agent(objects[2], t3);
    agents.push(agent); 
    agent = new Agent(objects[3], t4); 
    agents.push(agent); 

    Diagnostics.log('Setup complete'); 

    // Use 60 or 30 for even smooth movements. 
    const timeInterval = 60;
    // Create time interval loop for cannon 
    Time.setInterval(function () {
        agents.forEach(a => {
            a.update(); 
        });
    }, timeInterval);
});