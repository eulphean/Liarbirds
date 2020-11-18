import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Agent from './Agent.js'
import model from '../models/jellyman.glb'; 

const loader = new GLTFLoader(); 

export default class Liarbird extends Agent {
    constructor(scene) {
        super(scene);
        this.loadLiarbird(scene); 
    }

    loadLiarbird(scene) {
        loader.load(model, gltf=> {
            // Load useful variables. 
            this.jellyman = gltf.scene; 

            // Agent is the parent object. 
            this.agent = new THREE.Group();
            this.agent.add(this.jellyman); 
            // Move the pivot close to its neck. 
            this.jellyman.position.set(0, -1.5, 0);
    
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

    update(delta) {
        // Animation update. 
        if (this.animationMixer) {
            this.animationMixer.update(delta);

            // Behaviors. 
            this.updateAgent(); 

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
        // Sync the rotation of the agent with the actual
        // agent scene.
        // this.agentRotation.x += 0.01; 
    }
}


