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
var maxAgentsToSpawn = 8; // Debug parameter to control number of agents. 

// Animation drivers for each door. 
var leftDoorDriver;
var rightDoorDriver; 

// We use these to kick off our reverse animation logic. 
var leftDoorSubscription; 
var rightDoorSubscription; 

// Boolean that helps us from retracking the plane on multiple taps. 
let hasTracked = false; 

// Use a wild card (*) to read the entire tree. 
// Array Hierarchy = Scene Viewer Hierarchy
Promise.all([
    Scene.root.findFirst('planeTracker'),
    Scene.root.findFirst('placer'),
    Scene.root.findByPath('planeTracker/placer/agents/*'),
    Scene.root.findByPath('planeTracker/placer/targets/*'),
    Scene.root.findByPath('planeTracker/placer/boundary/*'),
    Scene.root.findByPath('planeTracker/placer/spawner/*'),
    Scene.root.findFirst('camTarget'),
    Scene.root.findFirst('focalTarget')
]).then(function (objects) {
    let sceneObjects = prepareObjects(objects); 
    let spawner = sceneObjects['spawner']; let camTarget = sceneObjects['camTarget']; let focalTarget = sceneObjects['focalTarget']; 

    // REACTIVE bind the focal target object to the cam target object in plane tracker
    let t = focalTarget.worldTransform; 
    camTarget.worldTransform.position = t.position; 

    let spawnPoint = Utility.getLastPosition(spawner[0]);
    handleTap(sceneObjects['planeTracker'], spawnPoint); 
    
    let sceneAgents = sceneObjects['agents']; 
    let sceneTargets = sceneObjects['targets']; 
    for (let i = 0; i < sceneAgents.length; i++) {
        let agent = prepareAgent(sceneAgents[i], sceneTargets[i]);
        agents.push(agent); 
    }
    
    Diagnostics.log('Setup complete. Beginning Update.'); 

    // // Custom update loop to update agents in the world. 
    // // 15-30 for smoothest results.  
    const timeInterval = 15;
    Time.setIntervalWithSnapshot({
            'lastTargetX' : camTarget.transform.x,
            'lastTargetY' : camTarget.transform.y,
            'lastTargetZ' : camTarget.transform.z
        }, (elapsedTime, snapshot) => { // Bind local scope. 
        agents.forEach(a => { // Bind local scope. 
            if (a.awake) {
                a.update(agents, snapshot); 
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
        'camTarget': objects[6],
        'focalTarget' : objects[7]
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

                releaseNextAgent(spawnPoint); 
            }
        }); 
    });
}

function releaseNextAgent(spawnPoint) {
    if (curAgentIdx < maxAgentsToSpawn) {
        // Recursively call itself till it's done staggering all the agents. 
        let a = agents[curAgentIdx];
        a.spawn(spawnPoint);
        curAgentIdx++; 

        Time.setTimeout(() => {
            releaseNextAgent(spawnPoint); 
        }, staggerTime); 
    }
}