// modules/AudioManager.js

import { Constants } from './constants.js';

export class AudioManager {
    constructor(card) {
        this.card = card;
        this.context = null;
        this.device = null;
        this.isFirstPlay = true;
        this.amplitud = 0;
        this.isInitialized = false;
    }

    /**
     * Initializes the RNBO device and loads the audio buffer.
     */
    async initialize() {
        try {
            const patchExportURL = `export/${this.card.engine}`;
            const response = await fetch(patchExportURL);
            if (!response.ok) {
                throw new Error(`Failed to fetch patcher from ${patchExportURL}: ${response.status} ${response.statusText}`);
            }
            const patcher = await response.json();
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.device = await RNBO.createDevice({ context: this.context, patcher });
            this.device.node.connect(this.context.destination);
            
            await this.loadAudioBuffer();
            this.subscribeToEvents();

            console.log('AudioManager initialized successfully.');
        } catch (error) {
            console.error('Error initializing AudioManager:', error);
            throw error;
        }
    }

    /**
     * Loads the audio buffer based on network speed.
     */
    async loadAudioBuffer() {
        try {
            const audioURL = Constants.selectAudioURL(this.card);
            const fileResponse = await fetch(audioURL, { cache: 'reload' });
            if (!fileResponse.ok) {
                throw new Error(`Network response was not OK for audio file: ${audioURL}`);
            }
            const arrayBuf = await fileResponse.arrayBuffer();
            if (!(arrayBuf instanceof ArrayBuffer)) {
                throw new Error("Fetched data is not a valid ArrayBuffer");
            }
            const audioBuf = await this.context.decodeAudioData(arrayBuf);
            await this.device.setDataBuffer(Constants.AUDIO_BUFFER_NAME, audioBuf);
            console.log('Audio buffer loaded successfully.');
        } catch (error) {
            console.error('Error loading audio buffer:', error);
            throw error;
        }
    }

    /**
     * Subscribes to RNBO device events.
     */
    subscribeToEvents() {
        if (!this.device) {
            console.error('Device not initialized.');
            return;
        }
        this.device.messageEvent.subscribe((ev) => {
            if (ev.tag === "amp" && typeof ev.payload === 'number') {
                this.amplitud = ev.payload;
            }
        });
    }

    /**
     * Plays the audio.
     */
    play() {
        if (!this.device) {
            console.error('Device not initialized.');
            return;
        }
        const messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, "play", [1]);
        this.device.scheduleEvent(messageEvent);
        console.log('Playback started.');
    }

    /**
     * Pauses the audio.
     */
    pause() {
        if (!this.device) {
            console.error('Device not initialized.');
            return;
        }
        const messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, "play", [0]);
        this.device.scheduleEvent(messageEvent);
        this.context.suspend().then(() => {
            console.log('Playback paused.');
        }).catch(err => {
            console.error('Failed to suspend AudioContext:', err);
        });
    }

    /**
     * Toggles playback state.
     */
    togglePlayState() {
        if (this.isFirstPlay) {
            this.play();
            this.isFirstPlay = false;
        } else {
            this.pause();
            this.isFirstPlay = true;
        }
    }

    /**
     * Retrieves the current amplitude.
     * @returns {number} Amplitude value.
     */
    getAmplitude() {
        return this.amplitud;
    }

    /**
     * Cleans up the AudioContext and device.
     */
    async cleanup() {
        if (this.device) {
            await this.device.node.disconnect();
            this.device = null;
            console.log('RNBO device disconnected.');
        }
        if (this.context) {
            await this.context.close();
            this.context = null;
            console.log('AudioContext closed.');
        }
    }
}
