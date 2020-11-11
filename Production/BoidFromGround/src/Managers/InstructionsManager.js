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

const I_TIME_1 = 5000; 
const I_TIME_2 = 3000; 

const maxTaps = 3; 
export class InstructionsManager {
    constructor() {
        this.currentState = IState.NONE;
        this.timer = null;
        this.hasInstructedForTap = false; 
        this.numTaps = 0; 

        // Bind the camera instruction. 
        Camera.captureDevicePosition.monitor({ fireOnInitialValue: true}).subscribe(e => {
            if (e.newValue === 'FRONT') {
                this.setInstruction(IState.FLIP_CAMERA, true); 
            } else {
                this.setTwoInstructions(IState.PINCH_ZOOM, IState.TAP_HOLD); 
            }
        });
    }

    setInstruction(instruction, state) {
        Instruction.bind(state, instruction); 
    }

    setTwoInstructions(first, second) {
        this.clearPrevInstruction(); 

        // First
        this.setInstruction(first, true);
        
        // Second
        this.timer = Time.setTimeout(() => {
            this.setInstruction(second, true); 
        }, I_TIME_1);
    }   

    setMultipleInstructions(first, second, third) {
        // First
        this.setInstruction(first, true);

        // Second
        this.timer = Time.setTimeout(() => {
            this.setInstruction(second, true);
            // Third
            this.timer = Time.setTimeout(() => {
                this.setInstruction(third, true); 
            }, I_TIME_1); 
        }, I_TIME_2); 
        
    }

    clearPrevInstruction() {
        // Clear any pending instruction timers. 
        if (this.timer != null) {
            Time.clearTimeout(this.timer); 
            this.timer = null;
        }   
    }

    setFutureInstruction(first, time) {
        this.timer = Time.setTimeout(() => {
            this.setInstruction(first, true)
        }, time); 
    }

    incrementTap() {
        this.numTaps++; 

        if (this.numTaps >= maxTaps) {
            this.setInstruction(IState.TAP_HOLD, true); 
        } 
    }
}