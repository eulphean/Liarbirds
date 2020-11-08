// AudioManager.js
const Audio = require('Audio'); 
const Diagnostics = require('Diagnostics'); 

export class AudioManager {
    constructor() {
        Audio.getAudioPlaybackController('interactAudio').then(playbackController => {
            this.interactPlaybackController = playbackController; 
            this.interactPlaybackController.setLooping(false); 
            this.interactPlaybackController.setPlaying(false); 
        });

        Audio.getAudioPlaybackController('bgAudio').then(playbackController => {
            this.bgPlaybackController = playbackController; 
            this.bgPlaybackController.setLooping(false);
            this.bgPlaybackController.setPlaying(false); 
        })

        this.isBgAudioPlaying = false; 
    }

    playInteractSound() {
        this.interactPlaybackController.reset(); 
        this.interactPlaybackController.setPlaying(true); 
    }

    playBgSound() {
        if (!this.isBgAudioPlaying) {
            Diagnostics.log('Hello'); 
            this.bgPlaybackController.setPlaying(true);
            this.bgPlaybackController.setLooping(true); 
            this.isBgAudioPlaying = true; 
        }
    }
}