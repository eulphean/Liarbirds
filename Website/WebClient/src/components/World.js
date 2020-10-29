import React from 'react'
import Radium from 'radium'
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import Agent from './Agent.js'

const OrbitControls = oc(THREE)

const styles = {
    container: {
        display: 'flex'
    },
};

class World extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };

    this.ref = React.createRef(); 
    this.scene = new THREE.Scene(); 
   
    // // (FOV, AspectRatio, Near Clipping, Far Clipping)
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);
    
    // Renders the scene as a canvas element. 
    this.renderer = new THREE.WebGLRenderer(); 

    this.agents = []; 
  }

  componentDidMount() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Mount the canvas at the current div. 
    this.ref.current.appendChild(this.renderer.domElement); 

    var col = new THREE.Color("rgba(188, 141, 190, 1)"); 

    // -------- Lighting ----------------
    var light = new THREE.AmbientLight('0x404040'); 
    this.scene.add(light);

    // ---------- Geometry -----------------


    for (let i = 0; i < 100; i++) {
        let a = new Agent(); 
        this.agents.push(a); 
        this.scene.add(a.mesh); 
    }

    console.log(this.agents.length);

    // ---------- Camera -------------------
    this.camera.position.set(200, 200, 200); 
    var controls = new OrbitControls(this.camera); 
    controls.enablePan = true;
    controls.autoRotate = true; 
    controls.autoRotateSpeed = 0.25;
    controls.enabled = true; 
    controls.enableKeys = true;

    // Render loop. 
    var render = () => {
      // Register this function as a callback to every repaint from the browser.
      requestAnimationFrame(render); 
      controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    render();
  }

  render() {
    return (
        <div ref={this.ref} />
    );
  }
}

export default Radium(World);