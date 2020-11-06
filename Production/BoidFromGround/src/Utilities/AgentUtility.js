import { Agent } from '../Core/Agent.js'
import { Vector3 } from 'math-ds'

const ANIMATION_STATE = {
    CURL : 0,
    SWIM_SLOW : 1,
    SWIM_FAST : 2
}; 

const ROTATION_SPEED = {
    NONE: 0, 
    FAST: 1,
    SLOW: 3, 
    VERYSLOW: 5
}

const FLOCKING_WEIGHTS = {
    SEPERATION: 3.5,
    COHESION: 2.0,
    ALIGNMENT: 2.0
}

// Sets this.maxForce, this.maxSpeed, this.maxSlowDownSpeed, and agent's rotationSpeed. 
const AGENT_SPEED = {
    LOW: {
        FORCE: 0.002,
        SPEED: 0.002,
        SLOWSPEED: 0.001
    }, 

    MEDIUM: {
        FORCE: 0.005,
        SPEED: 0.003,
        SLOWSPEED: 0.001
    },

    HIGH: {
        FORCE: 0.01,
        SPEED: 0.005,
        SLOWSPEED: 0.001
    }
}

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
    ANIMATION_STATE, 
    ROTATION_SPEED,
    FLOCKING_WEIGHTS,
    AGENT_SPEED,
    prepareAgent,
    prepareInitialAgentVelocities
}