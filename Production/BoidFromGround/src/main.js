// main.js
// Entry level file to do things. 
// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');
const TouchGestures = require('TouchGestures'); 
const Animation = require('Animation'); 
const Patches = require('Patches'); 
const Reactive = require('Reactive');

// Internal helpers
import * as Utility from './Utility.js'; 
import Agent from './Agent.js'; 
import Octree from './Octree.js';

// All agents in the world. 
var agents = []; 
var curAgentIdx = 0; 
var staggerTime = 2000; // Delay between the release of each agent. Sync it with the animation from Phil. 
var maxAgentsToSpawn = 9; // Debug parameter to control number of agents. 

// Boolean that helps us from retracking the plane on multiple taps. 
var hasTracked = false; 

// After interactionTime, we can start interacting with the agents. 
var agentInteractionTime = 10000;  // 10 seconds
var activateInteraction = false; 

// Octree handler
var octree; 
var boundary = 0.1; 

// Use a wild card (*) to read the entire tree. 
// Array Hierarchy = Scene Viewer Hierarchy
Promise.all([
    Scene.root.findFirst('planeTracker'),
    Scene.root.findFirst('placer'),
    Scene.root.findByPath('planeTracker/placer/agents/*'),
    Scene.root.findByPath('planeTracker/placer/targets/*'),
    Scene.root.findByPath('planeTracker/placer/spawner/*'),
    Scene.root.findFirst('camTarget'),
    Scene.root.findFirst('focalTarget')
]).then(function (objects) {
    let sceneObjects = prepareObjects(objects); 
    
    // Pan using script. 
    handlePan(sceneObjects['planeTracker']); 

    // REACTIVE bind the focal target object to the cam target object in plane tracker. 
    let camTarget = sceneObjects['camTarget']; let focalTarget = sceneObjects['focalTarget']; 
    bindFocalTarget(focalTarget, camTarget); 

    // Setup spawner. 
    let spawner = sceneObjects['spawner'];
    let spawnPoint = Utility.getLastPosition(spawner[0]);
    handleTap(sceneObjects['planeTracker'], spawnPoint); 
    
    // Setup agents. 
    let sceneAgents = sceneObjects['agents']; 
    let sceneTargets = sceneObjects['targets']; 
    for (let i = 0; i < sceneAgents.length; i++) {
        let agent = prepareAgent(sceneAgents[i], sceneTargets[i]);
        agents.push(agent); 
    }
    
    Diagnostics.log('Setup complete -> Begin Update loop.'); 

    // // Custom update loop to update agents in the world. 
    // // 15-30 for smoothest results.  
    const timeInterval = 15;
    Time.setIntervalWithSnapshot({
            'lastTargetX' : camTarget.transform.x,
            'lastTargetY' : camTarget.transform.y,
            'lastTargetZ' : camTarget.transform.z
        }, (elapsedTime, snapshot) => { // Bind local scope. 
        
        // Recreate a new tree with every iteration (much faster than updating an existing one)
        octree = new Octree(snapshot, boundary); 
        agents.forEach(a => {
            if (a.awake) {
                let p = a.position; 
                octree.insertPoint(p, a); 
            }
        }); 

        agents.forEach(a => { // Bind local scope. 
            if (a.awake) {
                // Get agents within a radius. 
                let neighbours = octree.scanForPoints(a.position, 0.05); 
                
                // Extract agent data from the return object. 
                let nAgents = []; 
                neighbours.forEach(n => {
                    let a = n['data']; 
                    nAgents.push(a); 
                }); 
                
                // Send neighboring agent. 
                a.update(nAgents, snapshot); 
            }
        });
    }, timeInterval);
});

function bindFocalTarget(focalTarget, camTarget) {
    let t = focalTarget.worldTransform; 
    camTarget.worldTransform.position = t.position; 
}

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
        'spawner' : objects[4],
        'camTarget': objects[5],
        'focalTarget' : objects[6]
    }
    return a; 
}

function handleTap(planeTracker, spawnPoint) {
    // Event subscription. 
    TouchGestures.onTap().subscribe((gesture) => { // Note: Using ES6 closure to pass in the reference of the function, so this can access planeTracker variable.
        // Do something on tap.
        let pointOnScreen = gesture.location; 

        // if (!hasTracked) {
        //     // Location is a Point3D. 
        //     planeTracker.performHitTest(pointOnScreen).then(location => {
        //         if (location === null) {
        //             Diagnostics.log('Nothing found');
        //         } else {
        //             // Don't retrack if the plane has already been tracked. 
        //             planeTracker.trackPoint(pointOnScreen); 
        //             hasTracked = true; // Plane is tracked. Stick with it. 
        //             //releaseNextAgent(spawnPoint);
        //             // Make objects visible
        //             // Then I should be able to scale things. 
        //         }
        //     }); 
        // }

        // if (hasTracked)
        // releaseNextAgent(spawnPoint);

        if (activateInteraction) {
            // Pick a random agent
            // Do something to it. 
            let idx = Utility.random(0, agents.length);
            
            // [HOOK] Into the patch editor to do something with this agent. 
            // Use this to trigger something in the patch editor. 
            Patches.inputs.setScalarValue('agentNum', idx); 
            Patches.inputs.setScalarValue('animationNum', idx+1); 
        } else {
            // Enables agent interaction after agentInteractionTime
            Time.setTimeout(() => {
                activateInteraction = true; 
                Diagnostics.log('Agent Interaction is now enabled'); 
            }, agentInteractionTime); 
        }
    });
}

function releaseNextAgent(spawnPoint) {
    if (curAgentIdx < maxAgentsToSpawn) {
        // Recursively call itself till it's done staggering all the agents. 
        let a = agents[curAgentIdx];
        a.spawn(spawnPoint);
        curAgentIdx++; 

        // Recursively invoke itself until we are done releasing all the agents. 
        Time.setTimeout(() => {
            releaseNextAgent(spawnPoint); 
        }, staggerTime); 
    }
}


function handlePan(planeTracker) {
    // Subcribe to planning. 
    TouchGestures.onPan(planeTracker).subscribe((gesture) => {
        // Move the plane. 
        planeTracker.trackPoint(gesture.location, gesture.state); 
    }); 
}