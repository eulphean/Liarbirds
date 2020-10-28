// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');
const TouchGestures = require('TouchGestures'); 
const Animation = require('Animation'); 

// Internal objects
import * as Utility from './Utility.js'; 
import Agent from './Agent.js'; 

// All agents in the world. 
var agents = []; 
var curAgentIdx = 0; 
var staggerTime = 1000; // Delay between the release of each agent. Sync it with the animation from Phil. 

// Animation drivers for each door. 
var leftDoorDriver;
var rightDoorDriver; 

// We use these to kick off our reverse animation logic. 
var leftDoorSubscription; 
var rightDoorSubscription; 

let hasTracked = false; 

// Use a wild card (*) to read the entire tree. 
// The hierarchy of the obtained array matches the hierarchy of 
// the elements in the scene viewer. 
Promise.all([
    Scene.root.findFirst('planeTracker'),
    Scene.root.findFirst('placer'),
    Scene.root.findByPath('planeTracker/placer/agents/*'),
    Scene.root.findByPath('planeTracker/placer/targets/*'),
    Scene.root.findByPath('planeTracker/placer/boundary/*'),
    Scene.root.findByPath('planeTracker/placer/spawner/*'),
    Scene.root.findFirst('planeTarget'),
    Scene.root.findFirst('camTarget')
]).then(function (objects) {
    let sceneObjects = prepareObjects(objects); 
    let spawner = sceneObjects['spawner']; let camTarget = sceneObjects['camTarget']; let planeTarget = sceneObjects['planeTarget']; 

    // Reactive bind for a target infront of the camera
    let t = camTarget.worldTransform; 
    planeTarget.worldTransform.position = t.position; 

    let spawnPoint = Utility.getLastPosition(spawner[0]);
    handleTap(sceneObjects['planeTracker'], spawnPoint); 
    
    let sceneAgents = sceneObjects['agents']; 
    let sceneTargets = sceneObjects['targets']; 
    for (let i = 0; i < sceneAgents.length; i++) {
        let agent = prepareAgent(sceneAgents[i], sceneTargets[i]);
        agents.push(agent); 
    }
    
    Diagnostics.log('Setup complete'); 

    // // Custom update loop to update agents in the world. 
    // // 15-30 for smoothest results.  
    const timeInterval = 15;
    Time.setInterval(() => { // Bind local scope. 
        agents.forEach(a => { // Bind local scope. 
            if (a.awake) {
                // Update only if active. 
                a.update(agents); 
            }
        });
    }, timeInterval);
});

function prepareAgent(sceneAgent, sceneTarget) {
    let o = {
        'agent' : sceneAgent, 
        'target' : sceneTarget
    }; 
    return new Agent(o); 
}

function prepareObjects(objects) {
    const a = {
        'planeTracker' : objects[0],
        'placer' : objects[1],
        'agents' : objects[2],
        'targets' : objects[3],
        'boundary' : objects[4],
        'spawner' : objects[5],
        'planeTarget': objects[6],
        'camTarget' : objects[7]
    }
    return a; 
}

function handleTap(planeTracker, spawnPoint) {
    // Event subscription. 
    TouchGestures.onTap().subscribe((gesture) => { // Note: Using ES6 closure to pass in the reference of the function, so this can access planeTracker variable.
        // Do something on tap.
        let pointOnScreen = gesture.location; 

        // Location is a Point3D. 
        planeTracker.performHitTest(pointOnScreen).then(location => {
            if (location === null) {
                Diagnostics.log('Nothing found');
            } else {
                // Don't retrack if the plane has already been tracked. 
                if (!hasTracked) {
                    planeTracker.trackPoint(pointOnScreen); 
                    hasTracked = true; // Plane is tracked. Stick with it. 
                }

                // [TODO] Check if I have already spawned agents or currently spawning agents. 
                // If yes, skip this call. 
                releaseNextAgent(spawnPoint); 
            }
        }); 
    });
}

function releaseNextAgent(spawnPoint) {
    // Recursively call itself till it's done staggering all the agents. 
    let a = agents[curAgentIdx];
    a.spawn(spawnPoint);
    curAgentIdx++; 

    if (curAgentIdx < agents.length) {
        Time.setTimeout(() => {
            releaseNextAgent(spawnPoint); 
        }, staggerTime); 
    }
}



// [NOTE] UNUSED USEFUL Animation code in case we need to drive animation using scripts. 

// function setupAnimation(leftDoor, rightDoor) {
//     // Same for both the doors. 
//     const driverParams = {
//         durationMilliseconds: 700, 
//         loopCount: 1,
//         mirror: false // Open and Close seperate animation
//     };

//     // Defines the 'behavior of the animation' 
//     const leftSampler = Animation.samplers.linear(0, -0.06); 
//     const rightSampler = Animation.samplers.linear(0, 0.06);

//     // Core object that starts, stops, resets, reverses the animation. 
//     leftDoorDriver = Animation.timeDriver(driverParams); 
//     rightDoorDriver = Animation.timeDriver(driverParams); 

//     // Actual animation object to will be driven with time. 
//     let leftDoorAni = Animation.animate(leftDoorDriver, leftSampler); 
//     let rightDoorAni = Animation.animate(rightDoorDriver, rightSampler); 

//     // Assign the ani objects. 
//     leftDoor.transform.z = leftDoorAni; 
//     rightDoor.transform.z = rightDoorAni; 
// }

// function leftAnimationComplete() {
//     // Unsusbscribe to future callbacks. 
//     // If we don't unsubscribe, the reverse animation will get stuck in an infinite loop. 
//     leftDoorSubscription.unsubscribe(); 
//     leftDoorDriver.reverse();
// }

// function rightAnimationComplete() {
//     // Unsusbscribe to future callbacks. 
//     // If we don't unsubscribe, the reverse animation will get stuck in an infinite loop. 
//     rightDoorSubscription.unsubscribe(); 
//     rightDoorDriver.reverse(); 
// }


// function spawnAgents(spawnPoint) {
//     // Reset animation before we begin to clear previous states. 
//     // Clear all subscriptions. 
//     // if (leftDoorDriver && rightDoorDriver) {
//     //     leftDoorDriver.reset();
//     //     rightDoorDriver.reset();
//     // }

//     // if (leftDoorSubscription && rightDoorSubscription) {
//     //     leftDoorSubscription.unsubscribe();
//     //     rightDoorSubscription.unsubscribe();
//     // }


//     // Start animation again. 
//     //leftDoorDriver.start(); 
//     //rightDoorDriver.start(); 

//     //leftDoorSubscription = leftDoorDriver.onCompleted().subscribe(leftAnimationComplete); 
//     //rightDoorSubscription = rightDoorDriver.onCompleted().subscribe(rightAnimationComplete); 
// }



// [NOTE] UNUSED USEFUL Gesture code, which we should integrate at some point of time. 
// function handlePan(planeTracker) {
//     // Subcribe to panning
//     TouchGestures.onPan().subscribe((gesture) => {
//         // Do something. 
//         planeTracker.trackPoint(gesture.location, gesture.state); 
//     }); 
// }

// function handlePinch(placer) {
//     const placerTransform = placer.transform; 
//     TouchGestures.onPinch().subscribeWithSnapshot({
//         'lastScaleX' : placerTransform.scaleX,
//         'lastScaleY' : placerTransform.scaleY,
//         'lastScalez' : placerTransform.scaleZ
//     }, (gesture, snapshot) => {
//         placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
//         placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
//         placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
//     });
// }

// function handleRotate(placer) {
//     const placerTransform = placer.transform; 
//     TouchGestures.onRotate().subscribeWithSnapshot({
//         'lastRotationY' : placerTransform.rotationY
//     }, (gesture, snapshot) => {
//         const rotationCorrection = gesture.rotation.mul(-1); 
//         placerTransform.rotationY = rotationCorrection.add(snapshot.lastRotationY); 
//     });    
// }


    // // spawn the agent at curAgentId
    // agents.forEach(a => {
    //     // Only spawn 2 right now. 
    //     // if (curAgentIdx < 4) {
    //         // Give them a starting push. 
    //         a.seek(a.initialTargetPosition); 
    //         a.applyForce(); 
    //         a.spawn(agentSpawnLocation);
    //     // }
    //     //curAgentIdx = (curAgentIdx + 1) % agents.length; 
    // });