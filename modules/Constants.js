// modules/constants.js

export const Constants = {
    FRAME_RATE: 30,
    BACKGROUND_COLOR: [50, 50, 50],
    BOX_SIZE: 100,
    FONT_PATH: 'fonts/Orbitron-VariableFont_wght.ttf', // Ensure this path is correct

    // GUI Button Dimensions
    BT_WIDTH: 50,  // Adjust as needed
    BT_HEIGHT: 50, // Adjust as needed

    INITIAL_PLAY_ICON: 'icons/01_on-off.svg',
    PLAY_ICON: 'icons/02_play.svg',
    PAUSE_ICON: 'icons/03_pause.svg',
    REGEN_ICON_BASE: 'icons/',

    // Sensitivity settings
    K_SENSITIVITY: 0.9,
    S_SENSITIVITY: 0.9,

    // Labels
    KNOB_LABELS: ["X", "Y", "Z"],
    SLIDER_LABELS: ["Gain"],

    // Color Schemes
    DEFAULT_COLOR: [0, 0, 0],

    // Other Constants
    AUDIO_BUFFER_NAME: "world1",

    // Function to select audio URL based on network speed
    selectAudioURL: function(card) {
        if (navigator.connection) {
            const speed = navigator.connection.downlink;
            return speed > 1 ? card.mp3file : card.wavfile;
        }
        return card.mp3file;
    },

    // Function to calculate body size based on window dimensions
    calculateBodySize: function(cellWidth, cellHeight) {
        return (cellWidth + cellHeight) * 0.0067;
    },

    // Frame Rate Calculation
    FRAME_RATE_CALC: function() {
        return Constants.FRAME_RATE;
    },
};

// Direct exports for convenience
export const FRAME_RATE = Constants.FRAME_RATE;
export const BACKGROUND_COLOR = Constants.BACKGROUND_COLOR;
export const BOX_SIZE = Constants.BOX_SIZE;
export const FONT_PATH = Constants.FONT_PATH;
