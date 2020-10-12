// Agent.js
// Class that wraps the SceneObject. Holds the soft body that movies around in the physics world. 
// TODO: Disable collision, Make the bodies Kinematic (only velocies affect them), Turn off rotation on spheres. 

// Wrapper for the Boid object
const CANNON = require('cannon');
const Reactive = require('Reactive'); 
const Diagnostics = require('Diagnostics');

export default class Agent {
    constructor(sceneObject, world) {
        // This.declarations
        this.sceneObject = sceneObject; 
        this.world = world; 

        // Common soft body properties
        this.radius = 2.5; 
        this.mass = 3; 
        this.softBody = this.createSoftBody();

        // Initialize the binding for soft body's position to the scene object's transform. 

    }

    createSoftBody() {
        // Acquire current agent position. 
        let posX = this.sceneObject.transform.x.pinLastValue(); 
        let posY = this.sceneObject.transform.y.pinLastValue(); 
        let posZ = this.sceneObject.transform.z.pinLastValue(); 

        let curPos = new CANNON.Vec3(posX, posY, posZ); 

        // Prepare the sphere props and create the body. 
        // let sphereProps = {
        //     mass: this.mass,
        //     position: curPos, // Set the initial position. 
        //     radius: this.radius,
        //     shape: new CANNON.Sphere(this.radius),
        // }
        // let body = new CANNON.Body(sphereProps); 

        // Add the body to the world. 
        // this.world.addBody(body); 
        return curPos; 
    }

    // // Function declaration.
    update(velocity) {
        let v =  Reactive.vector(0, velocity, 0); 
        // Update scene object's velocity
        // this.softBodyPos.y.add(Reactive.val(velocity));
        //this.softBody.position.y = this.softBody.position.y + velocity;
        this.softBody.y = this.softBody.y + velocity;
        // Diagnostics.log(this.softBody.position); 

        // this.sceneObject.transform.x = this.softBodyPos.x; 
        this.sceneObject.transform.y = this.softBody.y;
        // this.sceneObject.transform.z = this.softBodyPos.z; 
    }
}