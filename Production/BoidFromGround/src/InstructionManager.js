// function setInstructions() {
//     switch (curInstructionState) {
//         case InstructionState.PLACE: {
//             Instruction.bind(true, InstructionState.PLACE);
//             break;
//         }

//         case InstructionState.ZOOM: {
//             Instruction.bind(true, InstructionState.ZOOM); 
//             break;
//         }

//         case InstructionState.HOLD: {
//             Instruction.bind(true, InstructionState.HOLD); 
//             break; 
//         }

//         case InstructionState.CHANGE: {
//             Instruction.bind(true, InstructionState.CHANGE);
//             break;
//         }

//         case InstructionState.NONE: {
//             Instruction.bind(false, InstructionState.PLACE); 
//             break; 
//         }

//         default : {
//             Instruction.bind(false, InstructionState.PLACE); 
//             break; 
//         }
//     }
// }


// // Instruction states. 
// let InstructionState = {
//     PLACE: 'tap_to_place',
//     ZOOM: 'pinch_to_zoom', 
//     HOLD: 'touch_hold',
//     CHANGE: 'tap_to_change',
//     NONE: 'none'
// }; 
// var curInstructionState = InstructionState.PLACE; 