import React from 'react'
import Radium from 'radium'
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import Liarbird from './Liarbird.js'

const OrbitControls = oc(THREE); 
var clock = new THREE.Clock();

const styles = {
    container: {
        // position: 'absolute',
        zIndex: 0,
        top: '0%',
    },
};

class World extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };

    this.ref = React.createRef(); 
    
    this.scene = new THREE.Scene(); 
    // (FOV, AspectRatio, Near Clipping, Far Clipping)
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
    // Renders the scene as a canvas element. 
    this.renderer = new THREE.WebGLRenderer({ antialias: true }); 

    // All the agents. 
    this.liarbirds = []; 
  }

  componentDidMount() {
    // Set renderer properties
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xC5C5C3);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding; 

    // Mount the canvas at the current div. 
    this.ref.current.appendChild(this.renderer.domElement); 

    // -------- Lighting ----------------
    var ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add( ambientLight );
          
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set( 0, 1, 1 ).normalize();
    this.scene.add( directionalLight );	

    // ---------- Geometry -----------------
    for (let i = 0; i < 5; i++) {
        let l = new Liarbird(this.scene); 
        this.liarbirds.push(l); 
    }

    // ---------- Camera -------------------
    this.camera.position.set(200, 200, 50); 
    var controls = new OrbitControls(this.camera); 
    // controls.enablePan = true;
    // controls.autoRotate = true; 
    // controls.autoRotateSpeed = 0.25;
    controls.enabled = true; 
    controls.enableKeys = true;

    // Render loop. 
    var initRender = () => {
      // Register this function as a callback to every repaint from the browser.
      requestAnimationFrame(initRender); 
      var delta = clock.getDelta(); 
      // Update all agents. 
      if (this.liarbirds.length > 0) {
        this.liarbirds.forEach(l => {
          l.update(delta); 
        }); 
      }
      controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    initRender();

    this.scene.traverse(obj => {
      obj.frustumCulled = false; 
    })
  }

  render() {
    return (
        <div style={styles.container} ref={this.ref} />
    );
  }

  updateRendererHeight(h) {
    this.renderer.setSize(window.innerWidth, h, true);
    this.camera.aspect = window.innerWidth/h;
    this.camera.updateProjectionMatrix();
  }
}

export default Radium(World);