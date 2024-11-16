import { Constants } from './constants.js';

export class AudioManager {
    constructor() {
        this.context = null;
        this.device = null;
        this.amplitude = 0;
        this.isInitialized = false;
        this.isPlaying = false; // Track playback state
        this.resumeRequested = false; // Tracks if context resume was requested
        this.initializedDuringPlay = false; // Flag for initialization during play
        this.parameters = {}; // Store RNBO parameters
        this.knobs = []; // External GUI knobs
        this.sliders = []; // External GUI sliders
    }

    /**
     * Initializes the RNBO device and loads the audio buffer.
     * This can be triggered manually or during playback.
     */
    async initialize() {
        try {
            if (this.isInitialized) {
                console.warn('AudioManager is already initialized.');
                return;
            }

            console.log('Initializing AudioManager...');

            const trackData = Constants.getTrackData();
            console.log('Fetched track data in AudioManager:', trackData);

            if (!trackData || !trackData.soundEngineJSONURL) {
                console.warn('No valid engine JSON URL found. Using fallback.');
                trackData.soundEngineJSONURL = 'path/to/default_engine.json';
            }

            console.log(`Fetching patch from: ${trackData.soundEngineJSONURL}`);
            const patcherResponse = await fetch(trackData.soundEngineJSONURL);
            if (!patcherResponse.ok) {
                throw new Error(`Failed to fetch patcher: ${patcherResponse.statusText}`);
            }

            const patcher = await patcherResponse.json();
            const WAContext = window.AudioContext || window.webkitAudioContext;
            this.context = new WAContext();

            // Device is initialized but not resumed yet
            this.device = await RNBO.createDevice({ context: this.context, patcher });
            this.device.node.connect(this.context.destination);

            await this.loadAudioBuffer(trackData);
            this.mapRNBOParameters();
            this.initializeControls(trackData);
            this.subscribeToEvents();

            this.isInitialized = true;
            console.log('AudioManager initialized successfully.');
        } catch (error) {
            console.error('Error initializing AudioManager:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Maps RNBO parameters to control inputs.
     */
    mapRNBOParameters() {
        if (!this.device) {
            console.error('RNBO device not initialized.');
            return;
        }

        const parameterIds = ['inputX', 'inputY', 'inputZ', 'inputGain'];
        this.parameters = parameterIds.reduce((params, id) => {
            const param = this.device.parametersById.get(id);
            if (param) {
                params[id] = param;
            } else {
                console.warn(`Parameter ${id} not found in RNBO device.`);
            }
            return params;
        }, {});
    }

    /**
     * Initializes external controls like knobs and sliders.
     */
    initializeControls(trackData) {
        const ksteps = 10; // Number of steps in knobs/sliders
        const centerValue = (ksteps - 1) / 2;
        console.log('Track data for controls initialization:', trackData);

        // Use default ranges if trackData properties are missing or malformed
        const defaultRange = [-100, 100];
        const xRange = trackData.soundEngineParams?.xParam || { label: 'Speed', min: defaultRange[0], max: defaultRange[1] };
        const yRange = trackData.soundEngineParams?.yParam || { label: 'Tremolo', min: defaultRange[0], max: defaultRange[1] };
        const zRange = trackData.soundEngineParams?.zParam || { label: 'SpaceReverb', min: defaultRange[0], max: defaultRange[1] };

        if (this.parameters.inputX) {
            this.parameters.inputX.value = this.mapValue(centerValue, 0, ksteps - 1, xRange.min, xRange.max);
        }
        if (this.parameters.inputY) {
            this.parameters.inputY.value = this.mapValue(centerValue, 0, ksteps - 1, yRange.min, yRange.max);
        }
        if (this.parameters.inputZ) {
            this.parameters.inputZ.value = this.mapValue(centerValue, 0, ksteps - 1, zRange.min, zRange.max);
        }
        if (this.parameters.inputGain) {
            this.parameters.inputGain.value = this.mapValue(0, -220, 220, 0, 1);
        }

        this.knobs = [
            { id: 'X', valueY: centerValue },
            { id: 'Y', valueY: centerValue },
            { id: 'Z', valueY: centerValue }
        ];
        this.sliders = [{ id: 'Gain', sliderValue: 0 }];
    }

    /**
     * Resumes the AudioContext during playback if required.
     */
    async resumeContextIfNeeded() {
        if (this.context && this.context.state === 'suspended') {
            console.log('Resuming AudioContext...');
            await this.context.resume();
            this.resumeRequested = true;
        }
    }

    /**
     * Loads the audio buffer dynamically based on the selected file.
     */
    async loadAudioBuffer(trackData) {
        try {
            const audioURL = Constants.selectAudioURL(trackData);
            console.log(`Fetching audio file from: ${audioURL}`);
            const fileResponse = await fetch(audioURL, { cache: 'reload' });

            if (!fileResponse.ok) {
                throw new Error(`Failed to fetch audio file: ${fileResponse.status} ${fileResponse.statusText}`);
            }

            const arrayBuffer = await fileResponse.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            await this.device.setDataBuffer(Constants.AUDIO_BUFFER_NAME, audioBuffer);

            console.log('Audio buffer loaded successfully.');
        } catch (error) {
            console.error('Error loading audio buffer:', error);
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

        this.device.messageEvent.subscribe((event) => {
            if (event.tag === 'amp' && typeof event.payload === 'number') {
                this.amplitude = event.payload;
                //console.log(`Amplitude updated: ${this.amplitude}`);
            } else {
               // console.warn('Unexpected event payload:', event);
            }
        });
    }

    /**
     * Plays the audio. If not initialized, initializes the AudioManager first.
     */
    async togglePlayState() {
        try {
            if (!this.isInitialized) {
                console.log('AudioManager not initialized. Initializing now...');
                this.initializedDuringPlay = true;
                await this.initialize();
            }

            await this.resumeContextIfNeeded();

            const playEvent = new RNBO.MessageEvent(RNBO.TimeNow, 'play', [1]);
            this.device.scheduleEvent(playEvent);

            this.isPlaying = true;
            console.log('Playback started.');
        } catch (error) {
            console.error('Error starting playback:', error);
        }
    }



    /**
     * Pauses the audio.
     */
    async pause() {
        try {
            if (!this.device || !this.context) {
                console.error('Device or AudioContext not initialized.');
                return;
            }

            const pauseEvent = new RNBO.MessageEvent(RNBO.TimeNow, 'play', [0]);
            this.device.scheduleEvent(pauseEvent);

            if (this.context.state === 'running') {
                await this.context.suspend();
            }

            this.isPlaying = false;
            console.log('Playback paused.');
        } catch (error) {
            console.error('Error pausing playback:', error);
        }
    }

    /**
     * Maps a value from one range to another.
     */
    mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    /**
     * Retrieves the current amplitude.
     * @returns {number} Amplitude value.
     */
    getAmplitude() {
        return typeof this.amplitude === 'number' ? this.amplitude : 0;
    }

    /**
     * Cleans up the AudioContext and device.
     */
    async cleanup() {
        try {
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
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}
