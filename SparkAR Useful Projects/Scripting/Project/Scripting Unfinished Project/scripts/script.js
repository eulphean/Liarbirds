const Scene = require('Scene');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures'); 

const sceneRoot = Scene.root; 

// Combine all the promises into a single promise.
// Apply all calculations after I've acquired these objects. 
Promise.all([
	sceneRoot.findFirst('base_jnt'),
	sceneRoot.findFirst('speaker_left_jnt'),
	sceneRoot.findFirst('speaker_right_jnt'),
	sceneRoot.findFirst('planeTracker0'),
	sceneRoot.findFirst('placer')
  ])
  .then(function(objects) {
  	const base = objects[0];
  	const speakerLeft = objects[1]; 
  	const speakerRight = objects[2]; 
  	const planeTracker = objects[3]; 
  	const placer = objects[4];

	const baseDriverParameters = {
		durationMilliseconds: 400,
		loopCount: Infinity,
		mirror: true
	}; 

	// Create the Time Driver
	const baseDriver = Animation.timeDriver(baseDriverParameters); 
	baseDriver.start(); 

	// Sampler (to keep track of a start and end of the animation)
	const baseSampler = Animation.samplers.easeInQuint(0.9, 1); 
	const baseAnimation = Animation.animate(baseDriver, baseSampler); 

	// Applying the animation to the base. 
	const baseTransform = base.transform; // Returns the transform signal

	baseTransform.scaleX = baseAnimation; 
	baseTransform.scaleY = baseAnimation; 
	baseTransform.scaleZ = baseAnimation; 

	// Speakers animation. 
	const speakerDriverParameters = {
		durationMilliseconds: 200,
		loopCount: Infinity, 
		mirror: true
	}; 

	const speakerDriver = Animation.timeDriver(speakerDriverParameters);
	speakerDriver.start(); 

	const speakerSampler = Animation.samplers.easeOutElastic(0.7, 0.85); 
	const speakerAnimation = Animation.animate(speakerDriver, speakerSampler); 

	const speakerLeftTransform = speakerLeft.transform; 
	speakerLeftTransform.scaleX = speakerAnimation;
	speakerLeftTransform.scaleY = speakerAnimation;
	speakerLeftTransform.scaleZ = speakerAnimation;

	const speakerRightTransform = speakerRight.transform; 
	speakerRightTransform.scaleX = speakerAnimation;
	speakerRightTransform.scaleY = speakerAnimation;
	speakerRightTransform.scaleZ = speakerAnimation;

	// Subcribe to panning
	TouchGestures.onPan().subscribe(function(gesture) {
		// Do something. 
		planeTracker.trackPoint(gesture.location, gesture.state); 
	}); 

	const placerTransform = placer.transform; 
	// Scaling
	TouchGestures.onPinch().subscribeWithSnapshot({
		'lastScaleX' : placerTransform.scaleX,
		'lastScaleY' : placerTransform.scaleY,
		'lastScalez' : placerTransform.scaleZ
	}, function(gesture, snapshot) {
		placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
		placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
		placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
	});

	TouchGestures.onRotate().subscribeWithSnapshot({
		'lastRotationY' : placerTransform.rotationY
	}, function(gesture, snapshot) {
		const rotationCorrection = gesture.rotation.mul(-1); 
		placerTransform.rotationY = rotationCorrection.add(snapshot.lastRotationY); 
	});
  }); 
