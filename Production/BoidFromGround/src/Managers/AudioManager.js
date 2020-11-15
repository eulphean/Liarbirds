// AudioManager.js
const Audio = require('Audio'); 
const Time = require('Time'); 

const TIME_DELAY_INTERACT = 4000; 
export class AudioManager {
    constructor() {
        Promise.all([
            Audio.getAudioPlaybackController('interactAudio'),
            Audio.getAudioPlaybackController('bgAudio')
        ]).then(objects => {
            // Interactive playback controller. 
            this.interactPC = objects[0]; 
            this.interactPC.setLooping(false); 
            this.interactPC.setPlaying(false); 

            // Background playback controller. 
            this.bgPC = objects[1]; 
            this.bgPC.setLooping(false);
            this.bgPC.setPlaying(false); 
        });

        this.isBgAudioPlaying = false; 
        this.isInteractSoundPlaying = false; 
    }

    playInteractSound() {
        if (!this.isInteractSoundPlaying) {
            this.interactPC.reset(); 
            this.interactPC.setPlaying(true); 
            
            // Give it a little delay before playing the sound again. 
            Time.setTimeout(() => {
                this.isInteractSoundPlaying = false; 
            }, TIME_DELAY_INTERACT); 
        }
    }

    playBgSound() {
        if (!this.isBgAudioPlaying) {
            this.bgPC.setPlaying(true);
            this.bgPC.setLooping(true); 
            this.isBgAudioPlaying = true; 
        }
    }
}