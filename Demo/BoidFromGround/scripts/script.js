// Main script.js

// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');
const TouchGestures = require('TouchGestures'); 
const Animation = require('Animation'); 

// Internal objects
const Utility = require('./Utility.js'); 
import Agent from './Agent.js'; 

// Global variable because we need to access it 
// from a lot of place in this file. 
var agents = []; 
var planeTracker; 
var curAgentIdx = 0; 
var agentSpawnLocation; 

// Animation drivers for each door. 
var leftDoorDriver;
var rightDoorDriver; 
// We use these to kick off our reverse animation logic. 
var leftDoorSubscription; 
var rightDoorSubscription; 

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
    Scene.root.findFirst('AgentSpawnPoint'), // 9
    Scene.root.findFirst('door_l'), // 10
    Scene.root.findFirst('door_r') // 11
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
    let doorLeft = objects[10]; 
    let doorRight = objects[11]; 

    // Create all objects related to animation. 
    initAnimation(doorLeft, doorRight);

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

    // Custom update loop to 
    // 15-30 for smoothest results.  
    const timeInterval = 15;
    // Create time interval loop for cannon 
    Time.setInterval(function () {
        agents.forEach(a => {
            if (a.awake) {
                // Update only if active. 
                a.update(); 
            }
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
                
                //[Animation hook] for the floor opening up. 
                // When animation ends, spawn the agent. 
                spawnAgent(); 
            }
        }); 
    });
}

function spawnAgent() {
    // Reset animation before we begin to clear previous states. 
    leftDoorDriver.reset();
    rightDoorDriver.reset();

    // Start animation again. 
    leftDoorDriver.start(); 
    rightDoorDriver.start(); 

    leftDoorSubscription = leftDoorDriver.onCompleted().subscribe(leftAnimationComplete); 
    rightDoorSubscription = rightDoorDriver.onCompleted().subscribe(rightAnimationComplete); 

    // spawn the agent at curAgentId
    let a = agents[curAgentIdx]; 
    a.spawn(agentSpawnLocation); 

    // Ensures a priority queue of activating the agents. 
    curAgentIdx = (curAgentIdx + 1) % agents.length; 
}

function initAnimation(leftDoor, rightDoor) {
    // Same for both the doors. 
    const driverParams = {
        durationMilliseconds: 700, 
        loopCount: 1,
        mirrot: false // Open and Close seperate animation
    };

    // Defines the 'behavior of the animation' 
    const leftSampler = Animation.samplers.linear(0, -0.06); 
    const rightSampler = Animation.samplers.linear(0, 0.06);

    // Core object that drives the animation. 
    leftDoorDriver = Animation.timeDriver(driverParams); 
    rightDoorDriver = Animation.timeDriver(driverParams); 

    // Actual animation object to will be driven with time. 
    let leftDoorAni = Animation.animate(leftDoorDriver, leftSampler); 
    let rightDoorAni = Animation.animate(rightDoorDriver, rightSampler); 

    // Assign the ani objects. 
    leftDoor.transform.z = leftDoorAni; 
    rightDoor.transform.z = rightDoorAni; 
}

function leftAnimationComplete() {
    // Unsusbscribe to future callbacks. 
    // If we don't unsubscribe, the reverse animation will get stuck in an infinite loop. 
    leftDoorSubscription.unsubscribe(); 
    leftDoorDriver.reverse();
}

function rightAnimationComplete() {
    // Unsusbscribe to future callbacks. 
    // If we don't unsubscribe, the reverse animation will get stuck in an infinite loop. 
    rightDoorSubscription.unsubscribe(); 
    rightDoorDriver.reverse(); 
}