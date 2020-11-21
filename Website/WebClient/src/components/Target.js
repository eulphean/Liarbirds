import * as THREE from 'three';

export default class Target {
    constructor(scene) {
        let geometry = new THREE.SphereGeometry(1, 10, 10);
        let material = new THREE.MeshLambertMaterial({color: new THREE.Color(1, 0, 0), wireframe: false}); 
        this.mesh = new THREE.Mesh(geometry, material);

        scene.add(this.mesh);
    }

    getVector() {
        return this.mesh.position; 
    }

    setVector(v) {
        this.mesh.position.copy(v);
    }
}