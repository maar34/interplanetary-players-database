import { Constants, FRAME_RATE, BACKGROUND_COLOR, BOX_SIZE, FONT_PATH } from './constants.js';
import { Assets } from './Assets.js';
import { DataManager } from './DataManager.js';
import { PlaybackDataManager } from './PlaybackDataManager.js';
import { AudioManager } from './AudioManager.js';
import { Renderer } from './Renderer.js';
import { GUI } from './GUI.js';
import { Interaction } from './Interaction.js';

// Global Variables
let sw, sh;
let font;
let assets, dataManager, playbackDataManager, audioManager, renderer, gui, interaction;
let easycam;
let cellWidth, cellHeight;

// State for throttling GUI updates
let lastGUIUpdate = 0;
const GUI_UPDATE_INTERVAL = 100; // Update GUI every 100ms

const state = {
    distance: 1000,
    center: [0, 0, 0],
    rotation: [1.0, 0.0, 0.0, 0.0],
};

// Define player object
let player = {
    id: "",
    wavfile: "path/to/default.wav",
    mp3file: "path/to/default.mp3",
    initTime: "",
    endTime: "",
    speed: "",
    minSpeed: "",
    maxSpeed: "",
    col1: "",
    col2: "",
    iconSet: "",
    engine: "../export/d00_c01_v0.3.json",
    xTag: "",
    yTag: "",
    zTag: "",
};

// Preload function to load assets (e.g., fonts)
function preload() {
    console.log('Preloading assets...');
    try {
        font = loadFont('fonts/Orbitron-VariableFont_wght.ttf'); // Adjust relative path if needed

        window.preloadedAssets = {
            font,
            model00: loadModel('media/d6fbd28b1af1_a_spherical_exoplan.obj', true),
            model01: loadModel('media/d6fbd28b1af1_a_spherical_exoplan.obj', true),
            body00: loadImage('media/d6fbd28b1af1_a_spherical_exoplan_texture_kd.jpg'),
            body01: loadImage('media/d6fbd28b1af1_a_spherical_exoplan_texture_kd.jpg'),
        };
    } catch (error) {
        console.error('Error during preload:', error);
    }
}

function setup() {
    sw = window.innerWidth;
    sh = window.innerHeight;

    createCanvas(sw, sh, WEBGL);
    frameRate(FRAME_RATE);
    background(BACKGROUND_COLOR);

    if (font) {
        textFont(font); // Set the font for WebGL text rendering
    } else {
        console.warn('Font not loaded, using default font.');
    }

    // Initialize EasyCam
    easycam = createEasyCam();
    easycam.setState(state, 3000);

    initVariables();

    assets = new Assets(window.preloadedAssets);
    dataManager = new DataManager();
    playbackDataManager = new PlaybackDataManager();
    audioManager = new AudioManager(player);
    renderer = new Renderer(assets, audioManager, dataManager, easycam);
    gui = new GUI(playbackDataManager, easycam);
    interaction = new Interaction(gui, renderer, audioManager, playbackDataManager);

    gui.layoutGUI(sw, sh, cellWidth, cellHeight);

    initializeApp()
        .then(() => console.log('Application initialized successfully'))
        .catch((err) => console.error('Initialization failed:', err));
}

function draw() {
    background(BACKGROUND_COLOR);

    if (!font) {
        console.warn('Font not loaded, skipping text rendering.');
        return;
    }

    textFont(font); // Set the font before rendering any text
    textSize(24);   // Set the text size
    fill(255);      // Set text color
    text('Rendering with WebGL and Orbitron font!', -sw / 2 + 20, -sh / 2 + 40);

    if (renderer && typeof renderer.renderScene === 'function') {
        renderer.renderScene(
            audioManager.isInitialized ? 1 : 0,
            easycam.getPosition()[0],
            easycam.getPosition()[1],
            sw,
            sh
        );
    }

    const now = millis();
    if (now - lastGUIUpdate > GUI_UPDATE_INTERVAL) {
        const amplitude = audioManager.getAmplitude() || 0;
        const playbackState = audioManager.isPlaying ? "Playing" : "Paused";

        if (gui && typeof gui.updateGUIValues === 'function') {
            gui.updateGUIValues({
                amplitude,
                playbackState,
            });
        }

        lastGUIUpdate = now;
    }

    if (interaction && typeof interaction.update === 'function') {
        interaction.update();
    }
}

async function initializeApp() {
    try {
        console.log('Starting initialization...');

        const urlParams = new URLSearchParams(window.location.search);
        const trackId = urlParams.get('trackId');

        if (!trackId) {
            throw new Error('Missing trackId parameter in URL.');
        }

        console.log(`Fetching data for trackId: ${trackId}`);

        // Fetch and cache track data
        const dataManager = new DataManager();
        await dataManager.fetchTrackData(trackId);

        // Access the fetched/cached data
        const trackData = Constants.getTrackData();

        if (!trackData || Object.keys(trackData).length === 0) {
            throw new Error(`No data found for trackId: ${trackId}`);
        }

        console.log('Track data fetched or cached:', trackData);

        const audioManager = new AudioManager();
        await audioManager.initialize();

        console.log('App initialized.');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

// Initialize variables
function initVariables() {
    console.log('Initializing variables...');
    const cellSize = Math.min(sw, sh) / 10;
    cellWidth = cellSize;
    cellHeight = cellSize;
    console.log('Cell size calculated:', cellSize);
}

// Handle window resize events
function windowResized() {
    sw = window.innerWidth;
    sh = window.innerHeight;
    resizeCanvas(sw, sh);

    renderer.handleResize(sw, sh);
    gui.layoutGUI(sw, sh, cellWidth, cellHeight);
}

// Expose p5.js lifecycle functions to the browser
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
