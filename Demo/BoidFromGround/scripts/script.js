// Main script.js

// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');
const TouchGestures = require('TouchGestures'); 

// Internal objects
const Utility = require('./Utility.js'); 
import Agent from './Agent.js'; 


var agents = []; 
// Global variable because we need to access it 
// from a lot of place in this root. 
var planeTracker; 
var curAgentIdx = 0; 
var agentSpawnLocation; 

 // Reference SphereObject from Scene
Promise.all([
    Scene.root.findFirst('Agent1'), // 0
    Scene.root.findFirst('Agent2'), // 1
    Scene.root.findFirst('Agent3'), // 2
    Scene.root.findFirst('Agent4'), // 3
    Scene.root.findFirst('Target1'), // 4
    Scene.root.findFirst('Target2'), // 5
    Scene.root.findFirst('Target3'), // 6
    Scene.root.findFirst('Target4'), // 7
    Scene.root.findFirst('planeTracker0'), // 8
    Scene.root.findFirst('AgentSpawnPoint') // 9
]).then(function (objects) {
    // Subscribe to callbacks. 
    handleTap(); 

    // Prepare target objects. 
    let t1 = objects[4]; 
    let t2 = objects[5]; 
    let t3 = objects[6]; 
    let t4 = objects[7]; 
    planeTracker = objects[8]; 
    agentSpawnLocation = Utility.getLastPosition(objects[9]); // Get the agent  

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

    // Use 60 or 30 for smooth movements. 
    const timeInterval = 60;
    // Create time interval loop for cannon 
    Time.setInterval(function () {
        agents.forEach(a => {
            a.update(); 
        });
    }, timeInterval);
});

function handleTap() {
    // Event subscription. 
    TouchGestures.onTap().subscribe(function(gesture) {
        // Do something on tap.
        let pointOnScreen = gesture.location; 

        // Location is a Point3D
        planeTracker.performHitTest(pointOnScreen).then(location => {
            if (location === null) {
                Diagnostics.log('Nothing found');
            } else {
                // Reset the plane tracker to track this point. 
                planeTracker.trackPoint(pointOnScreen); 
                
                // TODO: Drive animation. 
                // When animation ends, activate agent. 
                spawnAgent(); 
            }
        }); 
    });
}

function spawnAgent() {
    // spawn the agent at curAgentId
    let a = agents[curAgentIdx]; 
    a.spawn(agentSpawnLocation); 

    // Ensures a priority queue of activating the agents. 
    curAgentIdx = (curAgentIdx + 1) % agents.length; 
}