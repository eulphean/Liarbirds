import { Vector3 } from 'math-ds'
const Patches = require('Patches');

const getLastPosition = (sceneObject) => {
    // Acquire current agent position. 
    let posX = sceneObject.transform.x.pinLastValue(); 
    let posY = sceneObject.transform.y.pinLastValue(); 
    let posZ = sceneObject.transform.z.pinLastValue(); 
    return new Vector3(posX, posY, posZ);
}

const syncSceneObject = (sceneObject, targetVector) => {
    sceneObject.transform.x = targetVector.x; 
    sceneObject.transform.y = targetVector.y;
    sceneObject.transform.z = targetVector.z; 
}

const setPatchVariable = (string, num) => {
    Patches.inputs.setScalar(string, num); 
}


export {
    getLastPosition,
    syncSceneObject,
    setPatchVariable
}