// modules/GUI.js

import { Constants } from './constants.js';

export class GUI {
    constructor(playbackDataManager) {
        this.playbackDataManager = playbackDataManager;

        this.buttons = {};
        this.knobs = [];    // Initialize knobs array
        this.sliders = [];   // Initialize sliders array
        this.textElements = {};

        // Initialize GUI components
        this.initButtons();
        this.initKnobs();
        this.initSliders();
        this.initTextElements();
    }

    /**
     * Initializes GUI buttons with error handling for assets.
     */
    initButtons() {
        try {
            // Initialize Play Button
            this.buttons.play = createButton('Play');
            this.styleButton(this.buttons.play);

            // Initialize Regen Button
            this.buttons.regen = createButton('Regen');
            this.styleButton(this.buttons.regen);

            // Initialize X, Y, Z Buttons (if needed)
            const labels = Constants.KNOB_LABELS;
            labels.forEach((label) => {
                const button = createButton(label);
                this.styleButton(button);
                this.buttons[label.toLowerCase()] = button;
            });
        } catch (error) {
            console.error('Error initializing buttons:', error);
        }
    }

    /**
     * Applies common styles to buttons.
     * @param {object} button - The button DOM element to style.
     */
    styleButton(button) {
        button.style('width', `${Constants.BT_WIDTH}px`);
        button.style('height', `${Constants.BT_HEIGHT}px`);
        button.style('background-color', 'transparent');
        button.style('border', 'none');
        button.style('color', 'white');
        button.style('font-size', '16px');
        button.style('cursor', 'pointer');
    }

    /**
     * Initializes GUI knobs.
     */
    initKnobs() {
        try {
            // Example initialization of knobs
            Constants.KNOB_LABELS.forEach(label => {
                let knob = {
                    label: label,
                    x: 100, // Example position, adjust as needed
                    y: 100, // Example position, adjust as needed
                    size: 50, // Example size
                    valueX: 128,
                    valueY: 128,
                    valueZ: 128,
                    isDragging: false
                };
                this.knobs.push(knob);
            });
            console.log('Knobs initialized:', this.knobs);
        } catch (error) {
            console.error('Error initializing knobs:', error);
        }
    }

    /**
     * Initializes GUI sliders.
     */
    initSliders() {
        try {
            // Example initialization of sliders
            Constants.SLIDER_LABELS.forEach(label => {
                let slider = {
                    label: label,
                    x: 200, // Example position, adjust as needed
                    y: 200, // Example position, adjust as needed
                    sliderHeight: 100, // Example height
                    sliderValue: 0,
                    handleRadius: 10,
                    isDragging: false,
                    onDragStart: null // Placeholder for drag start handler
                };
                this.sliders.push(slider);
            });
            console.log('Sliders initialized:', this.sliders);
        } catch (error) {
            console.error('Error initializing sliders:', error);
        }
    }

    /**
     * Initializes GUI text elements.
     */
    initTextElements() {
        try {
            this.textElements.distanceLabel = createP('Distance:');
            this.textElements.xLabel = createP('X:');
            this.textElements.yLabel = createP('Y:');
            this.textElements.zLabel = createP('Z:');
            this.textElements.distanceValue = createP('0');
            this.textElements.xValue = createP('0');
            this.textElements.yValue = createP('0');
            this.textElements.zValue = createP('0');
        } catch (error) {
            console.error('Error initializing text elements:', error);
        }
    }

    /**
     * Positions and styles GUI elements.
     */
    layoutGUI(sw, sh, cellWidth, cellHeight) {
        try {
            // Position Buttons
            this.buttons.play.position(cellWidth, sh - cellHeight * 2);
            this.buttons.regen.position(
                sw - cellWidth - cellHeight,
                sh - cellHeight * 2
            );

            // Position Knobs
            this.knobs.forEach((knob, index) => {
                const screenX = cellWidth + (index * (cellWidth + 10));
                const screenY = sh / 2;
                knob.x = screenX;
                knob.y = screenY;
            });

            // Position Sliders
            this.sliders.forEach((slider, index) => {
                const screenX = cellWidth + (index * (cellWidth + 10));
                const screenY = sh / 2 + 100; // Adjust as needed
                slider.x = screenX;
                slider.y = screenY;
            });

            // Style and Position Text
            const guiTextSize = Math.min(sw, sh) * 0.027;
            const yoffset = cellHeight * 0.5;

            this.textElements.distanceLabel.position(cellWidth, yoffset);
            this.textElements.xLabel.position(cellWidth, yoffset + cellHeight * 0.5);
            this.textElements.yLabel.position(cellWidth, yoffset + cellHeight * 1);
            this.textElements.zLabel.position(cellWidth, yoffset + cellHeight * 1.5);

            this.textElements.distanceValue.position(3.5 * cellWidth, yoffset);
            this.textElements.xValue.position(3.5 * cellWidth, yoffset + cellHeight * 0.5);
            this.textElements.yValue.position(3.5 * cellWidth, yoffset + cellHeight * 1);
            this.textElements.zValue.position(3.5 * cellWidth, yoffset + cellHeight * 1.5);

            Object.values(this.textElements).forEach((elem) => {
                elem.style('color', 'white');
                elem.style('font-size', `${guiTextSize}px`);
            });
        } catch (error) {
            console.error('Error positioning GUI elements:', error);
        }
    }

    /**
     * Updates GUI values based on data.
     * @param {object} data 
     */
    updateGUIValues(data) {
        if (!data) {
            console.warn('updateGUIValues called with null or undefined data');
            return;
        }

        try {
            this.textElements.distanceValue.html(nf(data.worldI_dist, 1, 2));
            this.textElements.xValue.html(nf(data.xDataM, 1, 2));
            this.textElements.yValue.html(nf(data.yDataM, 1, 2));
            this.textElements.zValue.html(nf(data.zDataV, 1, 2));
        } catch (error) {
            console.error('Error updating GUI values:', error);
        }
    }

    /**
     * Draw method for GUI.
     */
    draw() {
        // Implement any dynamic GUI drawing if needed
        // For example, drawing knobs and sliders
        this.knobs.forEach(knob => {
            push();
            translate(knob.x, knob.y);
            fill(255);
            ellipse(0, 0, knob.size);
            pop();
        });

        this.sliders.forEach(slider => {
            push();
            translate(slider.x, slider.y);
            stroke(255);
            line(0, -slider.sliderHeight / 2, 0, slider.sliderHeight / 2);
            fill(255, 0, 0);
            ellipse(0, slider.sliderValue, slider.handleRadius * 2);
            pop();
        });
    }

    /**
     * Cleans up GUI elements.
     */
    cleanup() {
        try {
            Object.values(this.buttons).forEach((button) => button.remove());
            Object.values(this.textElements).forEach((elem) => elem.remove());
            // Remove knobs and sliders if necessary
            this.knobs = [];
            this.sliders = [];
        } catch (error) {
            console.error('Error cleaning up GUI elements:', error);
        }
    }

    /**
     * Initialize additional GUI elements if needed
     */
    initialize() {
        // If any additional initialization is needed
        console.log('GUI initialized');
    }
}
