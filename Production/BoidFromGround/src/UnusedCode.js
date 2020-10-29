

////////////// ANIMATION CODE FROM MAIN.jS //////////////////

// // Animation drivers for each door. 
// var leftDoorDriver;
// var rightDoorDriver; 

// // We use these to kick off our reverse animation logic. 
// var leftDoorSubscription; 
// var rightDoorSubscription; 

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


////////////// FLOCKING CODE FROM AGENT.JS //////////////////

    // Once the agent reaches the intial target, set the target to the phone's target. 

// trimTarget() {
//     // Check the bounds of this agent
//     let bottom = this.boundary['bottom']; 
//     let top = this.boundary['top'];
//     let left = this.boundary['left'];
//     let right = this.boundary['right'];
//     let forward = this.boundary['forward'];
//     let backward = this.boundary['backward']; 

//     if (this.target.x > left.x) {
//         this.target.x = left.x; 
//     }

//     if (this.target.x < right.x) {
//         this.target.x = right.x; 
//     }

//     if (this.target.y > top.y) {
//         this.target.y = top.y; 
//     }

//     if (this.target.y < bottom.y) {
//         this.target.y = bottom.y; 
//     }

//     if (this.target.z > forward.z) {
//         this.target.z = forward.z; 
//     }

//     if (this.target.z < backward.z) {
//         this.target.z = backward.z; 
//     }
// }


    // // Uses the agent's current position and current velocity (heading) to calculate a 
    // // new target position. Extremely critical that agent's current position and current 
    // // velocity are set correctly, else the calculated target will be somewhere unexpected. 
    // // We can force the agent to calculate a new target. 
    // calcTarget(forceRecal = false) {
    //     // Have I reached the target or am I forcing a recalculation of the target? 
    //     let d = this.target.vsub(this.position).lengthSquared(); 
    //     if (d < this.arriveTolerance || forceRecal) {
    //         let wanderD = 0.20; // Max wander distance
    //         let wanderR = 0.05;
    //         let thetaChange = 5; 
    //         let wanderTheta = Utility.random(-thetaChange, thetaChange); 
    
    //         this.target.set(this.velocity.x, this.velocity.y, this.velocity.z); 
    //         this.target.normalize(); // Get the heading of the agent. 
    //         this.target.scale(wanderD, this.target); // Scale it.
    //         this.target.vadd(this.position, this.target); // Make it relative to current position.
    
    //         let azimuth = Utility.azimuth(this.target); 
    //         let inclination = Utility.inclination(this.target); // [TODO] Use this to tilt the head of the Agent
    
    //         // Calculate New Target. 
    //         let xPos = wanderR * Math.cos(azimuth + wanderTheta);
    //         let yPos = wanderR * Math.sin(azimuth + wanderTheta);
    //         let zPos = wanderR * Math.cos(inclination + wanderTheta); 
    //         let pOffset = new CANNON.Vec3(xPos, yPos, zPos); 
    //         this.target.vadd(pOffset, this.target); // With respect to current position 

    //         // Check if the target is over-extending our bounds. 
    //         // Trim the target (for debugging turn on the sync object below to see where the next target is)
    //         //this.trimTarget(); 

    //         // Sync the target scene object to the target. 
    //         Utility.syncSceneObject(this.targetObject, this.target); 
    //     } else {
    //         // Still trying to get to the target. 
    //     }
    // }  

            // // Seperation
        // this.seperation(agents); 
        // this.applyForce(); 
        
        // // // Cohesion
        // this.cohesion(agents);
        // this.applyForce(); 

        // this.align(agents); 
        // this.applyForce(); 

        // this.seek(this.initialTargetPosition);
        // this.applyForce();
        
        // Flocking coordination. 
        // // Seperation. 


        // // Alignment
        // steer = this.align(agents); 
        // steer.scale(this.alignmentWeight, steer);
        // this.applyForce(steer); 

        // // Cohesion 
        // steer = this.cohesion(agents); 
        // steer.scale(this.cohesionWeight, steer); 
        // this.applyForce(steer); 


        // seperation(agents) {
        //     let count = 0;
        //     this.fSteer.set(0, 0, 0); // Reset fSteer
    
        //     // For every boid in the system, check if it's within the seperation radius. 
        //     agents.forEach(a => {
        //         // Very important check here else there will be bugs. 
        //         if (a.awake) {
        //             let diff = this.position.vsub(a.position); 
        //             // This is a locality query. 
        //             if (diff.length() > 0 && diff.length() < this.seperationPerceptionRad) {
        //                 diff.normalize(); 
        //                 diff.scale(1/diff.length(), diff); // Weight the vector properly based on the distance from the target. 
        //                 this.sumVec.vadd(diff, this.sumVec); 
        //                 count++; // Keep a count of all the agents in the purview of this agent. 
        //             }
        //         }
        //     }); 
    
        //     // Calculate average vector away from the oncoming boid. 
        //     if (count > 0) {
        //         this.sumVec.scale(1/count); 
        //         if (this.sumVec.lengthSquared() > 0) {
        //             this.sumVec.normalize(); 
        //             this.sumVec = Utility.clamp(this.sumVec, this.maxSpeed); 
        //             this.sumVec.vsub(this.velocity, this.fSteer);
        //             this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
        //             this.fSteer.scale(this.seperationWeight, this.fSteer); // Apply seperation weight. 
        //         }
        //     } else {
        //         this.fSteer.set(0, 0, 0); 
        //     }
        // }
    
        // cohesion(agents) {
        //     let count = 0;
        //     this.target.set(0, 0, 0); 
    
        //     agents.forEach(a => {
        //         if (a.awake) {
        //             let d = this.position.distanceTo(a.position); 
        //             if (d > 0 && d < this.cohesionPerceptionRad) {
        //                 this.target.vadd(a.position, this.target); 
        //                 count++; 
        //             }
        //         }
        //     }); 
    
        //     if (count > 0) {
        //         this.target.scale(1/count, this.target); 
        //         this.seek(); 
        //         this.fSteer.scale(this.cohesionWeight, this.fSteer); // Apply cohesion weight. 
        //     } else {
        //         this.fSteer.set(0, 0, 0); 
        //     }
        // }
    
        // // Calculate average velocity by looking at its neighbours. 
        // align(agents) {
        //     let count = 0; 
        //     agents.forEach(a => {
        //         if (a.awake) {
        //             let d = this.position.distanceTo(a.position) 
        //             if (d > 0 && d < this.alignmentPerceptionRad) {
        //                 this.fSteer.vadd(a.velocity, this.fSteer); 
        //                 count++; 
        //             }
        //         }
        //     });
    
        //     if (count > 0) {
        //         // Calculate average. 
        //         this.fSteer.scale(1/count, this.fSteer); 
        //         this.fSteer.normalize(); 
        //         this.fSteer.scale(this.maxSpeed, this.fSteer); 
        //         this.fSteer.vsub(this.velocity, this.fSteer); 
        //         this.fSteer = Utility.clamp(this.fSteer, this.maxForce); 
        //         this.fSteer.scale(this.alignmentWeight, this.fSteer); // Apply alignment weight. 
        //     } else {
        //         this.fSteer.set(0, 0, 0); 
        //     }
        // }