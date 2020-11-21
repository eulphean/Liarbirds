import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Agent from './Agent.js'
import model from '../models/jellyman.glb'; 
import * as Utility from './Utility';

const loader = new GLTFLoader(); 

export default class Liarbird extends Agent {
    constructor(scene, idx, startY, phase) {
        super(scene, idx, startY, phase);
        this.loadLiarbird(scene); 
    }

    loadLiarbird(scene) {
        loader.load(model, gltf=> {
            // Set important gltf properties.  
            this.jellyman = gltf.scene; 
            // Move the pivot close to its neck. 
            this.jellyman.position.set(0, -1.5, 0);
            this.jellyman.frustumCulled = false;

            // Agent is the parent object. 
            this.agent = new THREE.Group();
            this.agent.add(this.jellyman); 
            this.agent.frustumCulled = false;
            this.agent.castShadow = true;
            this.agent.receiveShadow = true; 

            this.agentRotation = this.agent.rotation; 
            this.agentScale = this.agent.scale; 
            this.agentAnimations = gltf.animations; 

            // Scale
            this.agentScale.set(25, 25, 25);

            // Animation. 
            this.animationMixer = new THREE.AnimationMixer(this.agent); 
            var action = this.animationMixer.clipAction(this.agentAnimations[0]);
            action.play(); 

            // Add it to the scene. 
            scene.add(this.agent); 
        }, undefined, function ( error ) {
            console.error( error );
        }); 
    }

    update(delta, nAgents) {
        // Animation update. 
        if (this.animationMixer) {
            this.animationMixer.update(delta);

            // Behaviors. 
            this.updateAgent(nAgents); 

            // Sync rotation and position. 
            this.syncPosition();
            this.syncRotation(); 
        }
    }

    syncPosition() {
        // Sync position of the agent with 
        // the actual agent scene. 
        this.agent.position.copy(this.position);
    }

    syncRotation() {
        // Agent rotation
        let azimuth, inclination; 
        azimuth = Utility.azimuth(this.velocity); 
        inclination = Utility.inclination(this.velocity);

        Utility.axisRotation(0, 0, 1, azimuth - Math.PI/2, this.rotationA); 
        Utility.axisRotation(1, 0, 0, Math.PI/2 - inclination, this.rotationB); 
                    
        this.rotationA.multiply(this.rotationB);
        this.agent.setRotationFromQuaternion(this.rotationA);

        // Jellyman rotation
        this.jellyman.rotation.y += 0.05;
    }

    updateRosePattern() {
         // Pattern updates.
         this.rosePattern.update();
         this.setTarget(this.rosePattern.getTargetPos()); 
    }

    setTarget(target) {
        this.target.copy(target);
    }
}


