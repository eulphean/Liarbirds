import * as THREE from 'three';
import * as Utility from './Utility';

export default class Target {
    constructor(scene) {
        let geometry = new THREE.SphereGeometry(1, 10, 10);
        let material = new THREE.MeshLambertMaterial({color: new THREE.Color(1, 0, 0), wireframe: false}); 
        this.mesh = new THREE.Mesh(geometry, material);

        const radius = Utility.getRandomNum(50, 100);
        const theta = THREE.Math.degToRad(Utility.getRandomNum(360)); 
        const phi = THREE.Math.degToRad(Utility.getRandomNum(180)); 

        this.mesh.position.x = Math.sin(theta) * Math.cos(phi) * radius; 
        this.mesh.position.y = Math.sin(theta) * Math.sin(phi) * radius;
        this.mesh.position.z = Math.cos(theta) * radius;

        scene.add(this.mesh);
    }

    getVector() {
        return this.mesh.position; 
    }
}