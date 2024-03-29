// main.js
// Entry level file that sets up all the objects. 
const Scene = require('Scene');
const Diagnostics = require('Diagnostics');
const TouchGestures = require('TouchGestures'); 
const Time = require('Time'); 

import { World } from './Core/World'

var world;
// Use a wild card (*) to read the entire tree. 
// Array Hierarchy = Scene Viewer Hierarchy
Promise.all([
    Scene.root.findFirst('planeTracker'),
    Scene.root.findFirst('placer'),
    Scene.root.findByPath('planeTracker/placer/agents/*'),
    Scene.root.findByPath('planeTracker/placer/targets/*'),
    Scene.root.findByPath('planeTracker/placer/spawner/*'),
    Scene.root.findByPath('planeTracker/placer/hood/*'),
    Scene.root.findByPath('planeTracker/placer/hood/restTargets/*'),
    Scene.root.findByPath('planeTracker/placer/hood/patternOrigins/*'),
    Scene.root.findByPath('planeTracker/placer/deathBeds/*'),
    Scene.root.findFirst('camTarget'),
    Scene.root.findFirst('focalTarget')
]).then(objects => {
    let sceneObjects = prepareSceneObjects(objects); 

    // Handle interactive gestures. 
    handleTap(sceneObjects['agents']); 
    handlePan(sceneObjects['planeTracker'], sceneObjects['camTarget']); 
    handleLongPress(sceneObjects['planeTracker']); 

    // Initial reactive bindings. 
    bindFocalTarget(sceneObjects['focalTarget'], sceneObjects['camTarget']); 

    // Setup agents, octree, etc. 
    world = new World(sceneObjects); 

    Diagnostics.log('Setup complete -> Begin Update loop.'); 

    // Setup an update loop here. 
    const timeInterval = 15;
    Time.setIntervalWithSnapshot({
        'lastTargetX' : sceneObjects['camTarget'].transform.x,
        'lastTargetY' : sceneObjects['camTarget'].transform.y,
        'lastTargetZ' : sceneObjects['camTarget'].transform.z,
    }, (elapsedTime, snapshot) => {
        world.update(snapshot); 
    }, timeInterval);
});

// REACTIVE bind the focal target object to the cam target object in plane tracker. 
function bindFocalTarget(focalTarget, camTarget) {
    let t = focalTarget.worldTransform; 
    camTarget.worldTransform.position = t.position; 
}

function prepareSceneObjects(objects) {
    const a = {
        'planeTracker' : objects[0],
        'placer' : objects[1],
        'agents' : objects[2],
        'targets' : objects[3],
        'spawner' : objects[4],
        'hood' : objects[5],
        'restTargets' : objects[6],
        'patternOrigins' : objects[7],
        'deathBeds' : objects[8],
        'camTarget': objects[9],
        'focalTarget' : objects[10],
        'hd' : objects[11],
        'rTarget' : objects[12]
    }
    return a; 
}

function handlePan(planeTracker) {
    // Subcribe to planning. 
    TouchGestures.onPan(planeTracker).subscribe((gesture) => {
        // Move the plane. 
        planeTracker.trackPoint(gesture.location, gesture.state); 
    }); 
}

function handleLongPress(planeTracker) {
    TouchGestures.onLongPress(planeTracker).subscribe(gesture => {
        // Hand it off to world. 
        world.handleLongPress(); 
    });
}

function handleTap(agents) {
    // onTap subscription for each agent. 
    agents.forEach(a => {
        TouchGestures.onTap(a).subscribe((gesture) => {
            let idx = a.name.split('.')[1]; 
            world.handleTap(idx); 
        }); 
    }); 
}