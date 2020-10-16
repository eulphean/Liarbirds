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
var curAgentIdx = 0; 

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
    Scene.root.findFirst('targetTracker'), // 8
    Scene.root.findFirst('AgentSpawnPoint'), // 9
    Scene.root.findFirst('door_l'), // 10
    Scene.root.findFirst('door_r'), // 11
    Scene.root.findFirst('placer') // 12
]).then(function (objects) {
    // Prepare objects. 
    let sceneObjects = prepareObjects(objects); 

    // Subscribe to interactive callbacks. 
    handleTap(sceneObjects['targetTracker'], sceneObjects['agentSpawnPoint']); 
    handlePan(sceneObjects['planeTracker']); 
    handlePinch(sceneObjects['placer']);
    handleRotate(sceneObjects['placer']); 

    // Create all objects related to animation. 
    initAnimation(sceneObjects['leftDoor'], sceneObjects['rightDoor']);

    // Prepare agent objects.  
    let agent = new Agent(sceneObjects['agent1'], sceneObjects['target1']);
    agents.push(agent); 
    agent = new Agent(sceneObjects['agent2'], sceneObjects['target2']); 
    agents.push(agent); 
    agent = new Agent(sceneObjects['agent3'], sceneObjects['target3']);
    agents.push(agent); 
    agent = new Agent(sceneObjects['agent4'], sceneObjects['target4']); 
    agents.push(agent); 

    Diagnostics.log('Setup complete'); 

    // Custom update loop to update agents in the world. 
    // 15-30 for smoothest results.  
    const timeInterval = 15;
    Time.setInterval(function () {
        agents.forEach(a => {
            if (a.awake) {
                // Update only if active. 
                a.update(); 
            }
        });
    }, timeInterval);
});

function prepareObjects(objects) {
    const a = {
        'agent1' : objects[0],
        'agent2' : objects[1],
        'agent3' : objects[2],
        'agent4' : objects[3],
        'target1' : objects[4],
        'target2' : objects[5],
        'target3' : objects[6],
        'target4' : objects[7],
        'targetTracker' : objects[8],
        'agentSpawnPoint' : Utility.getLastPosition(objects[9]), // const, so all we need is the position from this. 
        'leftDoor' : objects[10],
        'rightDoor' : objects[11],
        'placer' : objects[12]
    }

    return a; 
}

function handleTap(targetTracker, agentSpawnLocation) {
    // Event subscription. 
    TouchGestures.onTap().subscribe((gesture) => { // Note: Using ES6 closure to pass in the reference of the function, so this can access planeTracker variable.
        // Do something on tap.
        let pointOnScreen = gesture.location; // No use of this point. 

        // If tracking, tap should spawn the agents. 
        // Show the world anyway. 
        // If it's tracking it will show the world immediately. 
        // To spawn we tap. 
        // if (targetTracker.isTracking) {
            
        // }
        // if (targetTracker.isTracking) {
           
        // }
        // targetTracker.performHitTest(pointOnScreen).then(location => {
        //     if (location === null) {
        //         Diagnostics.log('Nothing found');
        //     } else {
        //         // Reset the plane tracker to track this point. 
        //         targetTracker.trackPoint(pointOnScreen); 
                
        //         spawnAgent(agentSpawnLocation); 
        //     }
        // }); 
        spawnAgent(agentSpawnLocation);
    });
}

function handlePan(planeTracker) {
    // Subcribe to panning
    // TouchGestures.onPan().subscribe((gesture) => {
    //     // Do something. 
    //     planeTracker.trackPoint(gesture.location, gesture.state); 
    // }); 
}

function handlePinch(placer) {
    const placerTransform = placer.transform; 
    TouchGestures.onPinch().subscribeWithSnapshot({
        'lastScaleX' : placerTransform.scaleX,
        'lastScaleY' : placerTransform.scaleY,
        'lastScalez' : placerTransform.scaleZ
    }, (gesture, snapshot) => {
        placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
        placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
        placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
    });
}

function handleRotate(placer) {
    const placerTransform = placer.transform; 
    TouchGestures.onRotate().subscribeWithSnapshot({
        'lastRotationY' : placerTransform.rotationY
    }, (gesture, snapshot) => {
        const rotationCorrection = gesture.rotation.mul(-1); 
        placerTransform.rotationY = rotationCorrection.add(snapshot.lastRotationY); 
    });    
}

function spawnAgent(agentSpawnLocation) {
    // Reset animation before we begin to clear previous states. 
    // Clear all subscriptions. 
    if (leftDoorDriver && rightDoorDriver) {
        leftDoorDriver.reset();
        rightDoorDriver.reset();
    }

    if (leftDoorSubscription && rightDoorSubscription) {
        leftDoorSubscription.unsubscribe();
        rightDoorSubscription.unsubscribe();
    }

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

    // Core object that starts, stops, resets, reverses the animation. 
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