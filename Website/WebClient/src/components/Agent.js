import * as Utility from './Utility.js'
import * as THREE from 'three'

export default class Agent {
    constructor() {
        const col = new THREE.Color(Math.random(1), Math.random(1), Math.random(1));
        const geometry = new THREE.ConeGeometry(5, 10, 10);
        const material = new THREE.MeshLambertMaterial({color: col.getHex(), wireframe: true}); // Needs a light in the scene to show. 
        this.mesh = new THREE.Mesh(geometry, material); 

        const radius = Utility.getRandomNum(200, 500);
        const theta = THREE.Math.degToRad(Utility.getRandomNum(360)); 
        const phi = THREE.Math.degToRad(Utility.getRandomNum(180)); 
        
        // Set position using spherical coordinates. 
        this.mesh.position.x = Math.sin(theta) * Math.cos(phi) * radius; 
        this.mesh.position.y = Math.sin(theta) * Math.sin(phi) * radius;
        this.mesh.position.z = Math.cos(theta) * radius; 
    }
}