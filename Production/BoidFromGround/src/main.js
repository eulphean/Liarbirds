// main.js
// Entry level file to do things. 
// Spark Libraries
const Scene = require('Scene');
const Time = require('Time')
const Diagnostics = require('Diagnostics');
const TouchGestures = require('TouchGestures'); 
const Animation = require('Animation'); 
import { Vector3 } from 'math-ds'; 

// Internal helpers
import * as Utility from './Utility.js'; 
import { Agent, BakedAnimation } from './Agent.js'; 
import Octree from './Octree.js';

// All agents in the world. 
var agents = []; 
var curAgentIdx = 0; 
var staggerTime = 2000; // Delay between the release of each agent. Sync it with the animation from Phil. 
var maxAgentsToSpawn = 4; // Debug parameter to control number of agents. 

// Boolean that helps us from retracking the plane on multiple taps. 
var hasTracked = false; 

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
    handlePan(sceneObjects['planeTracker'], sceneObjects['camTarget']); 
    handleLongPress(sceneObjects['planeTracker']); 

    // REACTIVE bind the focal target object to the cam target object in plane tracker. 
    let camTarget = sceneObjects['camTarget']; let focalTarget = sceneObjects['focalTarget']; 
    bindFocalTarget(focalTarget, camTarget); 

    // Setup spawner. 
    let spawner = sceneObjects['spawner'];
    let spawnPoint = Utility.getLastPosition(spawner[0]);
    handleTap(sceneObjects['camTarget']); 
    
    // Setup agents. 
    let sceneAgents = sceneObjects['agents']; 
    let sceneTargets = sceneObjects['targets']; 
    for (let i = 0; i < maxAgentsToSpawn; i++) {
        let agent = prepareAgent(sceneAgents[i], sceneTargets[i], i);
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

function prepareAgent(sceneAgent, sceneTarget, i) {
    let o = {
        'agent' : sceneAgent, 
        'target' : sceneTarget,
        'idx' : i
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

function handleLongPress(planeTracker) {
    TouchGestures.onLongPress(planeTracker).subscribe(gesture => {
        releaseNextAgent(); 
    });
}

function handleTap(camTarget) {
    //Event subscription. 
    TouchGestures.onTap().subscribeWithSnapshot({
        'lastX' : camTarget.transform.x,
        'lastY' : camTarget.transform.y,
        'lastZ' : camTarget.transform.z
    }, (gesture, snapshot) => { // Note: Using ES6 closure to pass in the reference of the function, so this can access planeTracker variable.
        // Do something on tap.
        let focalTarget = new Vector3(snapshot['lastX'], snapshot['lastY'], snapshot['lastZ']); 
        let points = octree.scanForPoints(focalTarget, boundary); 
        if (points.length > 0) {
            Diagnostics.log('Found Something');        
            points.forEach(n => {
                let a = n['data']; 
                a.setAnimation(BakedAnimation.SWIM_FAST); 
                a.setRotationSpeed(1);
                // TODO: Calculate a dispersion target aware from the current position. 
                a.calcNewTarget(snapshot); 
                a.maxForce = 0.005; 
                a.maxSpeed = 0.005;
            }); 
        } else {
            Diagnostics.log('Found nothing');
        }
    });
}

function releaseNextAgent(spawnPoint) {
    if (curAgentIdx < agents.length) {
        // Recursively call itself till it's done staggering all the agents. 
        let a = agents[curAgentIdx];
        a.spawn(spawnPoint);
        curAgentIdx++; 

        // Recursively invoke itself until we are done releasing all the agents. 
        // Time.setTimeout(() => {
        //     releaseNextAgent(spawnPoint); 
        // }, staggerTime); 
    }
}


function handlePan(planeTracker, camTarget) {
    // Use this to create a 3D point on the screen. But
    // we are also changing the plane's location based on panning. 
    // TouchGestures.onPan(camTarget).subscribe(gesture => {
    //     let t = Scene.unprojectToFocalPlane(gesture.location); 
    //     camTarget.transform.x = t.x;
    //     camTarget.transform.y = t.y; 
    //     camTarget.transform.z = t.z; 
    // }); 


    // Subcribe to planning. 
    TouchGestures.onPan(planeTracker).subscribe((gesture) => {
        Diagnostics.log('Plane tracker'); 
        // Move the plane. 
        planeTracker.trackPoint(gesture.location, gesture.state); 
    }); 
}

// Add rotations.
// Improve calc target to disperse the agents. 
// Add more agents. 
// Add dying state.
// Improve starting flow a little. 
// Add instructions. 