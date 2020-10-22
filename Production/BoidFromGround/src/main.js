// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');
const TouchGestures = require('TouchGestures'); 
const Animation = require('Animation'); 

// Internal objects
import * as Utility from './Utility.js'; 
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

let hasTracked = false; 

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
    Scene.root.findFirst('door_r'), // 11
    Scene.root.findFirst('placer'), // 12
    Scene.root.findFirst('spawner'), // 13
    Scene.root.findFirst('Agent5'), // 14
    Scene.root.findFirst('Agent6'), // 15
    Scene.root.findFirst('Agent7'), // 16
    Scene.root.findFirst('Agent8'), // 17
    Scene.root.findFirst('Target5'), // 18
    Scene.root.findFirst('Target6'), // 19
    Scene.root.findFirst('Target7'), // 20
    Scene.root.findFirst('Target8'), // 21
    Scene.root.findFirst('bottom'), // 22
    Scene.root.findFirst('top'), // 23
    Scene.root.findFirst('forward'), // 24
    Scene.root.findFirst('backward'), // 25
    Scene.root.findFirst('left'), // 26
    Scene.root.findFirst('right'), // 27
    // Scene.root.findByPath('planeTracker0/placer/324Bins/Cube*'),
    Scene.root.findByPath('planeTracker0/placer/605Bins/Bin*')
]).then(function (objects) {
    // Prepare objects. 
    let sceneObjects = prepareObjects(objects); 
    Diagnostics.log(sceneObjects['agents'].length);
    // sceneObjects['agents'].findFirst('Agent1')
    //     .then(a => {
    //         Diagnostics.log(a); 
    //     });
    let boundary = {
        'top' : sceneObjects['top'],
        'bottom' : sceneObjects['bottom'],
        'forward' : sceneObjects['forward'],
        'backward' : sceneObjects['backward'],
        'left' : sceneObjects['left'],
        'right' : sceneObjects['right']
    }; 

    // Subscribe to interactive callbacks. 
    handleTap(sceneObjects['planeTracker'], sceneObjects['agentSpawnPoint'], sceneObjects['spawner']); 
    handlePan(sceneObjects['planeTracker']); 
    handlePinch(sceneObjects['placer']);
    handleRotate(sceneObjects['placer']); 

    // Create all objects related to animation. 
    initAnimation(sceneObjects['leftDoor'], sceneObjects['rightDoor']);

    // Push all the agents. 
    for (let i = 1; i <= 8; i++) {
        let aString = 'agent' + i.toString(); 
        let tString = 'target' + i.toString(); 
        let agent = prepareAgent(sceneObjects[aString], sceneObjects[tString], boundary);
        agents.push(agent); 
    }

    Diagnostics.log('Setup complete'); 

    // Custom update loop to update agents in the world. 
    // 15-30 for smoothest results.  
    const timeInterval = 15;
    Time.setInterval(() => { // Bind local scope. 
        agents.forEach(a => { // Bind local scope. 
            if (a.awake) {
                // Update only if active. 
                a.update(agents, boundary); 
            }
        });
    }, timeInterval);
});

function prepareAgent(agentObject, targetObject, boundary) {
    let o = {
        'agent' : agentObject, 
        'target' : targetObject,
        'boundary' : boundary
    }; 
    return new Agent(o); 
}

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
        'planeTracker' : objects[8],
        'agentSpawnPoint' : Utility.getLastPosition(objects[9]), // Static 
        'leftDoor' : objects[10],
        'rightDoor' : objects[11],
        'placer' : objects[12],
        'spawner' : objects[13],
        'agent5' : objects[14],
        'agent6' : objects[15],
        'agent7' : objects[16],
        'agent8' : objects[17],
        'target5' : objects[18],
        'target6' : objects[19],
        'target7' : objects[20],
        'target8' : objects[21],
        'bottom' : Utility.getLastPosition(objects[22]), // Static 
        'top' : Utility.getLastPosition(objects[23]), // Static 
        'forward' : Utility.getLastPosition(objects[24]), // Static 
        'backward' : Utility.getLastPosition(objects[25]), // Static 
        'left' : Utility.getLastPosition(objects[26]), // Static 
        'right' : Utility.getLastPosition(objects[27]), // Static 
        'agents' : objects[28] // Array of all agents
    }

    return a; 
}

function handleTap(planeTracker, agentSpawnLocation, spawner) {
    // Event subscription. 
    TouchGestures.onTap().subscribe((gesture) => { // Note: Using ES6 closure to pass in the reference of the function, so this can access planeTracker variable.
        // Do something on tap.
        let pointOnScreen = gesture.location; 

        // Location is a Point3D
        planeTracker.performHitTest(pointOnScreen).then(location => {
            if (location === null) {
                Diagnostics.log('Nothing found');
            } else {
                // Reset the plane tracker to track this point. 
                if (!hasTracked) {
                    planeTracker.trackPoint(pointOnScreen); 
                    hasTracked = true;
                }
                spawnAgent(agentSpawnLocation); 
            }
        }); 
    });
}

function handlePan(planeTracker) {
    // Subcribe to panning
    TouchGestures.onPan().subscribe((gesture) => {
        // Do something. 
        planeTracker.trackPoint(gesture.location, gesture.state); 
    }); 
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
    agents.forEach(a => {
        // Only spawn 2 right now. 
        // if (curAgentIdx < 4) {
            // Give them a starting push. 
            a.seek(a.initialTargetPosition); 
            a.applyForce(); 
            a.spawn(agentSpawnLocation);
        // }
        //curAgentIdx = (curAgentIdx + 1) % agents.length; 
    });
    // let a = agents[curAgentIdx]; 
    // a.spawn(agentSpawnLocation); 

    // Ensures a priority queue of activating the agents. 

    const timeInterval = 5000; 
    Time.setInterval(() => {
        agents.forEach(a => {
            if (a.awake) {
                // Calculate new target
                a.calcTarget(true); 
                a.seek(a.target); 
                a.fSteer.scale(2.0, a.fSteer); 
                a.applyForce(); 
            }
        }); 
    }, timeInterval); 

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