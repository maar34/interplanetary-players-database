// modules/Main.js

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

const state = {
    distance: 1000,
    center: [0, 0, 0],
    rotation: [1., 0., 0., 0.],
};

// Define card object
let card = {
    id: "",
    wavfile: "path/to/default.wav", // Set actual paths
    mp3file: "path/to/default.mp3", // Set actual paths
    initTime: "",
    endTime: "",
    speed: "",
    minSpeed: "",
    maxSpeed: "",
    col1: "",
    col2: "",
    iconSet: "", 
    engine: "defaultEngine", // Ensure this corresponds to a valid export
    xTag: "",
    yTag: "",
    zTag: ""
};

// Preload function to load assets (e.g., fonts)
function preload() {
    font = loadFont(FONT_PATH); // Load the font
    console.log('Font loaded:', FONT_PATH);
}

// Setup function to initialize the environment
function setup() {
    sw = window.innerWidth;
    sh = window.innerHeight;
    console.log('Setup called');

    createCanvas(sw, sh, WEBGL);
    frameRate(FRAME_RATE);
    background(BACKGROUND_COLOR);
    textFont(font);
    textSize(16);

    // Initialize EasyCam
    easycam = createEasyCam();
    easycam.setState(state, 3000);
    console.log('EasyCam initialized');

    // Initialize dimensions
    initVariables();

    // Initialize modules
    assets = new Assets();
    dataManager = new DataManager();
    playbackDataManager = new PlaybackDataManager();
    audioManager = new AudioManager(card); // Pass 'card'
    renderer = new Renderer(assets, audioManager, dataManager);
    gui = new GUI(playbackDataManager); // Pass 'playbackDataManager' to GUI
    interaction = new Interaction(gui, renderer, audioManager, playbackDataManager); // Pass all required parameters

    // Log to verify initialization
    console.log('Modules initialized:', {
        assets,
        dataManager,
        playbackDataManager,
        audioManager,
        renderer,
        gui,
        interaction,
    });

    // Initialize GUI layout
    gui.layoutGUI(sw, sh, cellWidth, cellHeight);

    // Begin asynchronous application initialization
    initializeApp()
        .then(() => console.log('Application initialized successfully'))
        .catch((err) => console.error('Initialization failed:', err));
}

// Draw function to render the scene
function draw() {
    background(BACKGROUND_COLOR);

    // Draw a rotating box as a placeholder
    push();
    rotateY(frameCount * 0.01);
    box(BOX_SIZE);
    pop();

    // Render GUI and other components
    if (gui && typeof gui.draw === 'function') {
        gui.draw();
    } else {
        console.warn('GUI.draw() is not a function');
    }

    if (interaction && typeof interaction.update === 'function') {
        interaction.update();
    } else {
        console.warn('interaction.update() is not a function');
    }

    // Avoid excessive console logging for performance
    // console.log('Drawing frame');
}

// Asynchronous initialization logic
async function initializeApp() {
    try {
        console.log('Starting initialization...');
        
        // Load assets
        await assets.loadAll();
        console.log('Assets loaded');

        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const g = urlParams.get('g');
        console.log('URL parameter g:', g);

        // Load data
        if (g) {
            await dataManager.loadData(g);
            console.log('Data loaded with g:', g, 'card.engine:', card.engine);
        } else {
            console.warn('URL parameter g not found. Loading default data.');
            await dataManager.loadData('defaultG'); // Replace 'defaultG' with an actual default value if needed
            console.log('Data loaded with default g: defaultG, card.engine:', card.engine);
        }

        // Ensure 'card.engine' is set
        if (!card.engine) {
            console.warn('card.engine not set. Setting to default.');
            card.engine = 'defaultEngine'; // Replace with a valid default engine
        }

        // Removed AudioManager initialization from here

        // Initialize GUI if needed
        await gui.initialize(); // Ensure GUI has initialize()

        // Initialize Interaction if needed
        await interaction.initialize();
        console.log('Interaction initialized');
    } catch (error) {
        console.error('Error initializing app:', error);
        throw error;
    }
}

// Utility function to initialize dimensions and constants
function initVariables() {
    console.log('Initializing variables...');
    // Example for layout-related calculations
    const cellSize = Math.min(sw, sh) / 10;
    cellWidth = cellSize;
    cellHeight = cellSize;
    console.log('Cell size calculated:', cellSize);
}

// Expose p5.js lifecycle functions to the browser
window.preload = preload;
window.setup = setup;
window.draw = draw;
