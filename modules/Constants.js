export const Constants = {
    FRAME_RATE: 30,
    BACKGROUND_COLOR: [0, 0, 0],
    BOX_SIZE: 100,
    FONT_PATH: 'fonts/Orbitron-VariableFont_wght.ttf',

    BT_WIDTH: 50,
    BT_HEIGHT: 50,

    INITIAL_PLAY_ICON: 'icons/01_on-off.svg',
    PLAY_ICON: 'icons/02_play.svg',
    PAUSE_ICON: 'icons/03_pause.svg',
    REGEN_ICON_BASE: 'icons/',

    K_SENSITIVITY: 0.9,
    S_SENSITIVITY: 0.9,

    KNOB_LABELS: ["X", "Y", "Z"],
    SLIDER_LABELS: ["Gain"],
    DEFAULT_COLOR: [0, 0, 0],

    AUDIO_BUFFER_NAME: "world1",

    CACHE_EXPIRY_MINUTES: 10, // Cache expiry time for track data
    TRACK_DATA: null, // Holds the currently active track data

    /**
     * Generates a unique cache key for the given trackId.
     * Ensures the key is properly formatted.
     * @param {string} trackId
     * @returns {string} Cache key.
     */
    getCacheKey(trackId) {
        if (typeof trackId !== 'string') {
            console.error(`Invalid trackId type for cache key: ${trackId}`);
            throw new Error('Track ID must be a valid string.');
        }
        return `trackData_${trackId}`;
    },

    /**
     * Selects the appropriate audio URL based on connection speed and file availability.
     * @param {object} track
     * @returns {string|null} The selected audio file URL.
     */
    selectAudioURL(track) {
        if (!track) {
            console.warn('Track data is undefined or null.');
            return null;
        }

        const hasWAV = Boolean(track.audioFileWAVURL);
        const hasMP3 = Boolean(track.audioFileMP3URL);

        if (!hasWAV && !hasMP3) {
            console.error('No valid audio file URLs found for the track.');
            return null;
        }

        if (navigator.connection) {
            const speed = navigator.connection.downlink;

            if (speed > 1 && hasWAV) {
                console.log('High-speed connection detected. Selecting WAV file.');
                return track.audioFileWAVURL;
            }

            if (hasMP3) {
                console.log('Falling back to MP3 file.');
                return track.audioFileMP3URL;
            }
        }

        console.warn('Connection speed not detected or unsuitable. Using MP3 if available.');
        return hasMP3 ? track.audioFileMP3URL : track.audioFileWAVURL;
    },

    /**
     * Sets track data globally and caches it.
     * @param {string} trackId - The track ID.
     * @param {object} trackData - The track data to store.
     */
    setTrackData(trackId, trackData) {
        if (!trackId || typeof trackId !== 'string') {
            console.error('Track ID must be a valid string to cache data.');
            return;
        }
        console.log(`Setting track data for trackId ${trackId}:`, trackData);
        this.TRACK_DATA = trackData;

        const cacheKey = this.getCacheKey(trackId);
        lscache.set(cacheKey, trackData, this.CACHE_EXPIRY_MINUTES);
    },

    /**
     * Retrieves track data from the cache or global state.
     * @param {string} trackId - The track ID.
     * @returns {object|null} Track data or null if not found.
     */
    getTrackData(trackId) {
        if (!trackId || typeof trackId !== 'string') {
            console.error('Track ID must be a valid string to retrieve data.');
            return null;
        }

        const cacheKey = this.getCacheKey(trackId);

        if (this.TRACK_DATA && this.TRACK_DATA.trackId === trackId) {
            console.log('Using track data from Constants:', this.TRACK_DATA);
            return this.TRACK_DATA;
        }

        const cachedData = lscache.get(cacheKey);
        if (cachedData) {
            console.log('Using track data from lscache:', cachedData);
            this.TRACK_DATA = cachedData; // Update global state
            return cachedData;
        }

        console.warn(`No track data found in Constants or cache for trackId ${trackId}.`);
        return null;
    },

    /**
     * Clears the cache for a specific trackId.
     * @param {string} trackId - The track ID.
     */
    clearTrackData(trackId) {
        if (!trackId || typeof trackId !== 'string') {
            console.error('Track ID must be a valid string to clear cache data.');
            return;
        }

        const cacheKey = this.getCacheKey(trackId);
        lscache.remove(cacheKey);
        console.log(`Cleared cache for trackId: ${trackId}`);
    },

    /**
     * Calculates the body size for visualization.
     * @param {number} cellWidth
     * @param {number} cellHeight
     * @returns {number} Body size.
     */
    calculateBodySize(cellWidth, cellHeight) {
        return (cellWidth + cellHeight) * 0.0067;
    },

    FRAME_RATE_CALC() {
        return this.FRAME_RATE;
    },
};

// Exporting Constants as named exports for convenience
export const FRAME_RATE = Constants.FRAME_RATE;
export const BACKGROUND_COLOR = Constants.BACKGROUND_COLOR;
export const BOX_SIZE = Constants.BOX_SIZE;
export const FONT_PATH = Constants.FONT_PATH;
export const BT_WIDTH = Constants.BT_WIDTH;
export const BT_HEIGHT = Constants.BT_HEIGHT;
export const INITIAL_PLAY_ICON = Constants.INITIAL_PLAY_ICON;
export const PLAY_ICON = Constants.PLAY_ICON;
export const PAUSE_ICON = Constants.PAUSE_ICON;
export const REGEN_ICON_BASE = Constants.REGEN_ICON_BASE;
export const K_SENSITIVITY = Constants.K_SENSITIVITY;
export const S_SENSITIVITY = Constants.S_SENSITIVITY;
export const KNOB_LABELS = Constants.KNOB_LABELS;
export const SLIDER_LABELS = Constants.SLIDER_LABELS;
export const DEFAULT_COLOR = Constants.DEFAULT_COLOR;
export const AUDIO_BUFFER_NAME = Constants.AUDIO_BUFFER_NAME;
export const selectAudioURL = Constants.selectAudioURL;
export const setTrackData = Constants.setTrackData;
export const getTrackData = Constants.getTrackData;
export const clearTrackData = Constants.clearTrackData;
