import React from 'react'
import Radium from 'radium'
import * as THREE from 'three'
import oc from 'three-orbit-controls'
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

    this.mount = React.createRef(); 
    this.scene = new THREE.Scene(); 
   
    // // There are different types of camera in ThreeJs
    // // (FOV, AspectRatio, Near Clipping, Far Clipping)
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000 );
    
    // Renders the scene as a canvas element. 
    this.renderer = new THREE.WebGLRenderer(); 
  }

  componentDidMount() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Mount the canvas at the current div. 
    this.mount.current.appendChild(this.renderer.domElement); 

    var col = new THREE.Color("rgba(188, 141, 190, 1)"); 

    // -------- Lighting ----------------
    var light = new THREE.AmbientLight('0x404040'); 
    this.scene.add(light);

    // ---------- Geometry -----------------
    var geometry = new THREE.ConeGeometry(5, 10, 10);
    var material = new THREE.MeshLambertMaterial({color: col.getHex(), wireframe: true}); // Needs a light in the scene to show. 

    for (let i = 0; i < 100; i++) {
        let xPos = Math.floor(Math.random() * 500);
        let zPos = Math.floor(Math.random() * 500); 
        console.log(xPos + ',' + zPos);
        let c = new THREE.Mesh(geometry, material); 
        c.position.set(xPos, 0, zPos); 
        this.scene.add(c); 
    }

    // ---------- Camera -------------------
    this.camera.position.set(200, 200, 200); 
    // Orbital controls. 
    var controls = new OrbitControls(this.camera); 
    controls.enablePan = true;

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
        <div ref={this.mount} />
    );
  }
}

export default Radium(World);