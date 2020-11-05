import { Agent } from './Agent.js'
import { Vector3 } from 'math-ds'

const prepareAgent = (sceneAgent, sceneTarget, idx, velocity) => {
    let o = {
        'agent' : sceneAgent, 
        'target' : sceneTarget,
        'idx' : idx, 
        'velocity' : velocity
    }; 
    return new Agent(o); 
}

const prepareInitialAgentVelocities = () => {
    return [
        new Vector3(-0.001, 0, 0), // Agent0
        new Vector3(-0.001, 0, 0), // Agent1 
        new Vector3(-0.001, 0, 0), // Agent2
        new Vector3(-0.001, 0, 0), // Agent3
        new Vector3(0, 0.001, 0) // Agent4
    ]; 
}

export {
    prepareAgent,
    prepareInitialAgentVelocities
}