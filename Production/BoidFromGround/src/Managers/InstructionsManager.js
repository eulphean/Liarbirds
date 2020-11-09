// InstructionsManager.js
const Camera = require('CameraInfo'); 
const Instruction = require('Instruction'); 
const Diagnostics = require('Diagnostics'); 
const Time = require('Time');

export const IState = {
    FLIP_CAMERA: 'flip_camera',
    PINCH_ZOOM: 'pinch_to_zoom', 
    TAP_HOLD: 'touch_hold', 
    TAP_CHANGE: 'tap_to_change',
    SOUND_ON: 'effect_include_sound',
    MOVE_CLOSER: 'move_camera_closer'
}

const PINCH_TIME = 3000; 
export class InstructionsManager {
    constructor() {
        this.currentState = IState.NONE;
        this.timer = null;
        this.hasInstructedForTap = false; 

        // Bind the camera instruction. 
        Camera.captureDevicePosition.monitor({ fireOnInitialValue: true}).subscribe(e => {
            if (e.newValue === 'FRONT') {
                this.setInstruction(IState.FLIP_CAMERA, true); 
            } else {
                this.setInstructionWithTimer(IState.PINCH_ZOOM, IState.TAP_HOLD, PINCH_TIME); 
            }
        });
    }

    setInstruction(instruction, state) {
        Instruction.bind(state, instruction); 
    }

    setInstructionWithTimer(currentState, nextState, time) {
        this.clearTimer(); 
        this.setInstruction(currentState, true); 

        // Schedule next instruction. 
        Time.setTimeout(() => {
            Diagnostics.log(nextState); 
            this.setInstruction(nextState, true); 
        }, time); 
    }   

    clearTimer() {
        // Clear any pending instruction timers. 
        if (this.timer != null) {
            Time.clearTimeout(this.timer); 
            this.timer = null;
        }   
    }

    // Only executes once. 
    update(phoneTarget, octreeManager) {
        // Just do this instruction pnce. 
        if (!this.hasInstructedForTap) {
            let agents = octreeManager.getAgentsNearPhone(phoneTarget); 
            if (agents.length > 0) {
                this.setInstructionWithTimer(IState.TAP_CHANGE, IState.TAP_HOLD, 5000); 
                this.hasInstructedForTap = true; 
            }
        }
    }
}