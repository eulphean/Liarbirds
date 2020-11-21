import React from 'react'
import Radium from 'radium'
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import Liarbird from './Liarbird.js'
// import Stats from 'stats.js'
import { OctreeManager } from './OctreeManager.js'
import { EllipsePattern, ellipseConstructor } from './PatternManager.js'

const OrbitControls = oc(THREE); 
export const WORLD_STATE = {
  PATTERN: 0,
  FLOCK: 1
}; 

const styles = {
    container: {
        // position: 'absolute',
        zIndex: 0,
        top: '0%',
        overflowX: 'hidden',
        overflowY: 'auto'
    }
};

class World extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };

    this.ref = React.createRef(); 
    
    this.scene = new THREE.Scene(); 
    // (FOV, AspectRatio, Near Clipping, Far Clipping)
    this.camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 0.05, 10000);
    this.camera.position.set(100, 150, 150); 
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.camera.frustumCulled = false; 

    // Renders the scene as a canvas element. 
    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    }); 

    // All the agents. 
    this.liarbirds = [];

    // Octree manager for flocking. 
    this.octreeManager = new OctreeManager(); 

    // Starting state is patterns. 
    this.curWorldState = WORLD_STATE.PATTERN;

    this.controls = new OrbitControls(this.camera); 

    // this.stats = new Stats(); 

    this.clock = new THREE.Clock(); 
  }

  componentDidMount() {
    // Set renderer properties
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding; 

    // Mount the canvas at the current div. 
    this.ref.current.appendChild(this.renderer.domElement); 
    // this.ref.current.appendChild(this.stats.dom);

    // -------- Lighting ----------------
    var ambientLight = new THREE.AmbientLight(0xD7D3D3);
    ambientLight.intensity = 1.5;
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.intensity = 3.0;
    directionalLight.position.set(0, 50, 50).normalize();
    this.scene.add( ambientLight );
    this.scene.add(directionalLight);	

    // ---------- Geometry -----------------
    let minHeight = -100; 
    let maxHeight = 60; 
    let numAgents = 12; 
    let phase = [0, 0, 3, 3, 5, 5, 7, 7, 9, 9, 11, 11]; 
    let inc = (Math.abs(minHeight) + maxHeight)/numAgents; 
    let startPos = minHeight; 

    for (let i = 0; i < numAgents; i++) {
        let l = new Liarbird(this.scene, i, startPos, phase[i]); 
        this.liarbirds.push(l); 
        startPos += inc; 
    }

    // ---------- Camera -------------------
    this.controls.enablePan = false;
    // controls.autoRotate = true; 
    // controls.autoRotateSpeed = 0.1;
    this.controls.enabled = false; 
    this.controls.enableKeys = false;

    // ---------- Flock Pattern ---------------
    let o = new THREE.Vector3(0, 0, 0); // Flock around the origin. 
    let moveFactor = THREE.Math.degToRad(0.1); 
    // (Origin Vector, RadiusX, RadiusZ, Amplitude, isClockwise, MoveFactor)
    let patternObj = ellipseConstructor(o, 60, 0, 80, true, moveFactor);
    this.flockPattern = new EllipsePattern(patternObj);   

    // this.scene.add(new THREE.AxesHelper(30));
    this.initThreeRender(); 
    this.scheduleStates(); 
  }

  update() {
    // Flocking updates. 
    if (this.curWorldState === WORLD_STATE.FLOCK) {
      this.flockPattern.update(); 
      let flockTarget = this.flockPattern.getTargetPos(); 
      // Update octree manager for flocking. 
      this.octreeManager.update(flockTarget, this.liarbirds); 
    }

    var delta = this.clock.getDelta(); 
    let nAgents = []; 
    if (this.liarbirds.length > 0) {
      this.liarbirds.forEach(l => {
        // When in flock state, set same target for everybody.
        if (this.curWorldState === WORLD_STATE.FLOCK) {
          let flockTarget = this.flockPattern.getTargetPos(); 
          l.setTarget(flockTarget); 
          nAgents = this.octreeManager.getNeighbours(l.position); 
        } else {
          // We are not flocking right now, so ROSE pattern it is. 
          l.updateRosePattern(); 
        }

        // Send neighboring agents for flocking. 
        l.update(delta, nAgents); 
      }); 
    }
  }

  render() {
    return (
        <div style={styles.container} ref={this.ref} />
    );
  }

  initThreeRender() {
    // Render loop. 
    // this.stats.begin();
    this.update(); 
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    // this.stats.end();

    // Register this function as a callback to every repaint from the browser.
    requestAnimationFrame(this.initThreeRender.bind(this)); 
  }

  updateRendererHeight(h) {
    this.renderer.setSize(window.innerWidth, h, true);
    this.camera.aspect = (window.innerWidth)/h;
    this.renderer.setViewport(0, 0, window.innerWidth + 200, h+200);
    this.camera.updateProjectionMatrix();
  }

  scheduleStates() {
    setInterval(() => {
      if (this.curWorldState === WORLD_STATE.FLOCK) {
        this.curWorldState = WORLD_STATE.PATTERN; 
      } else {
        this.curWorldState = WORLD_STATE.FLOCK; 
      }
    }, 20000); 
  }
}

export default Radium(World);