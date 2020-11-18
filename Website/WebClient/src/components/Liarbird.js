import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as Utility from './Utility.js'
import Agent from './Agent.js'
import model from '../models/jellyman.glb'; 

const loader = new GLTFLoader(); 

export default class Liarbird extends Agent {
    constructor(scene) {
        super();
        this.loadLiarbird(scene); 
    }

    loadLiarbird(scene) {
        loader.load(model, gltf=> {
            // Load useful variables. 
            this.agent = gltf.scene; 
            this.agentPosition = this.agent.position;
            this.agentScale = this.agent.scale; 
            this.agentAnimations = gltf.animations; 

            const radius = Utility.getRandomNum(50, 150);
            const theta = THREE.Math.degToRad(Utility.getRandomNum(360)); 
            const phi = THREE.Math.degToRad(Utility.getRandomNum(180)); 

            // Scale and position. 
            this.agentScale.set(30, 30, 30);
            this.agentPosition.x = Math.sin(theta) * Math.cos(phi) * radius; 
            this.agentPosition.y = 0; 
            this.agentPosition.z = Math.cos(theta) * radius;

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

            // Update position. 
            // this.agentPosition.x += 0.1;
            // this.agentPosition.y += 0.1;
        }
    }
}


