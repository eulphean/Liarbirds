// AudioManager.js
const Audio = require('Audio'); 

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
    }

    playInteractSound() {
        this.interactPC.reset(); 
        this.interactPC.setPlaying(true); 
    }

    playBgSound() {
        if (!this.isBgAudioPlaying) {
            this.bgPC.setPlaying(true);
            this.bgPC.setLooping(true); 
            this.isBgAudioPlaying = true; 
        }
    }
}