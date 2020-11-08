import { Agent } from '../Core/Agent'
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
    SEPERATION: 3.0,
    COHESION: 1.0,
    ALIGNMENT: 2.0
}

// Sets this.maxForce, this.maxSpeed, this.maxSlowDownSpeed, and agent's rotationSpeed. 
const AGENT_SPEED = {
    DEATH: {
        FORCE: 0.001,
        SPEED: 0.001,
        SLOWSPEED: 0
    },

    LOW: {
        FORCE: 0.002,
        SPEED: 0.002,
        SLOWSPEED: 0.0001
    }, 

    MEDIUM: {
        FORCE: 0.004,
        SPEED: 0.004,
        SLOWSPEED: 0.0001
    },

    HIGH: {
        FORCE: 0.01,
        SPEED: 0.005,
        SLOWSPEED: 0.001
    }
}

const prepareAgent = (sceneAgent, sceneTarget, idx, spawnState) => {
    let o = {
        'agent' : sceneAgent, 
        'target' : sceneTarget,
        'idx' : idx, 
        'spawnState' : spawnState
    }; 
    return new Agent(o); 
}

// Every object has initial velocity and a flag
// that indicates if it uses the portal or not. 
// We use this to sync the agents to the portal 
// animation. 
const prepareSpawnStates = () => {
    return [
        {
            v: new Vector3(0, 0.001, 0), // Agent0
            p: true
        },
        {
            v: new Vector3(-0.001, 0, 0), // Agent1 
            p: false
        },
        {
            v: new Vector3(-0.001, 0, 0), // Agent2
            p: false
        },
        {
            v: new Vector3(-0.001, 0, 0), // Agent3
            p: false
        },
        {
            v: new Vector3(0, 0.001, 0), // Agent4
            p: true
        }
    ]; 
}

export {
    ANIMATION_STATE, 
    ROTATION_SPEED,
    FLOCKING_WEIGHTS,
    AGENT_SPEED,
    prepareAgent,
    prepareSpawnStates
}