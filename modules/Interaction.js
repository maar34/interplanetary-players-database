// modules/Interaction.js

import { Constants } from './constants.js';

export class Interaction {
    /**
     * @param {GUI} gui - Instance of GUI class
     * @param {Renderer} renderer - Instance of Renderer class
     * @param {AudioManager} audioManager - Instance of AudioManager class
     * @param {PlaybackDataManager} playbackDataManager - Instance of PlaybackDataManager class
     */
    constructor(gui, renderer, audioManager, playbackDataManager) {
        this.gui = gui;
        this.renderer = renderer;
        this.audioManager = audioManager;
        this.playbackDataManager = playbackDataManager;

        // Assuming knobs and sliders are managed by GUI and accessible via gui.knobs and gui.sliders
        this.knobs = gui.knobs || [];
        this.sliders = gui.sliders || [];
        this.cellWidth = gui.cellWidth;
        this.cellHeight = gui.cellHeight;
        this.sw = gui.sw;
        this.sh = gui.sh;

        this.prevTouchX = 0;
        this.prevTouchY = 0;

        this.setupEventHandlers();
    }

    /**
     * Sets up event handlers for user interactions.
     */
    setupEventHandlers() {
        // Bind global p5.js event handlers
        window.mousePressed = () => this.handleMousePressed();
        window.touchStarted = () => this.handleTouchStarted();
        window.mouseDragged = () => this.handleMouseDragged();
        window.mouseReleased = () => this.handleMouseReleased();
        window.touchEnded = () => this.handleTouchEnded();
        window.touchMoved = () => this.handleTouchMoved();
        window.mouseWheel = (event) => this.handleMouseWheel(event);

        // Bind Play button to initialize and toggle playback
        this.gui.buttons.play.mousePressed(async () => {
            if (!this.audioManager.isInitialized) {
                try {
                    await this.audioManager.initialize();
                    this.audioManager.isInitialized = true;
                } catch (error) {
                    console.error('Failed to initialize AudioManager:', error);
                    return;
                }
            }
            this.audioManager.togglePlayState();
        });

        // Bind Regen button or other buttons if necessary
        this.gui.buttons.regen.mousePressed(() => {
            // Handle Regen button functionality
            console.log('Regen button pressed.');
            // Implement regeneration logic as needed
        });
    }

    /**
     * Handles mouse press events.
     */
    handleMousePressed() {
        // Example playback data management
        const songName = 'Song A';
        const artistName = 'Artist A';
        const playCount = 1;
        const playDuration = 25;
        const system_rightascension = 123.45;
        const system_declination = 67.89;
        const userId = 'user1';
        const playerId = 232341;

        this.playbackDataManager.savePlaybackData(
            userId, playerId, songName, artistName, playCount, playDuration, system_rightascension, system_declination
        );

        const playbackData = this.playbackDataManager.getPlaybackData(playerId);
        if (playbackData.length > 0) {
            console.log('Initialize player with:', playbackData);
        }

        print(playbackData);

        // Handle knob dragging
        this.knobs.forEach(knob => {
            knob.isDragging = dist(mouseX, mouseY, knob.x, knob.y) < knob.size / 2;
        });

        // Handle slider dragging
        this.sliders.forEach(slider => {
            let d = dist(mouseX, mouseY, slider.x, slider.y + slider.sliderValue);
            if (d < slider.handleRadius) {
                slider.isDragging = true;
                // Update gain based on slider
                slider.onDragStart && slider.onDragStart();
            }
        });

        return false; // Prevent default behavior
    }

    /**
     * Handles touch start events.
     */
    handleTouchStarted() {
        if (touches.length === 0) return;
        this.prevTouchX = touches[0].x;
        this.prevTouchY = touches[0].y;

        this.knobs.forEach(knob => {
            knob.isDragging = dist(touches[0].x, touches[0].y, knob.x, knob.y) < knob.size / 2;
        });

        this.sliders.forEach(slider => {
            let d = dist(touches[0].x, touches[0].y, slider.x, slider.y + slider.sliderValue);
            if (d < slider.handleRadius) {
                slider.isDragging = true;
                // Update gain based on slider
                slider.onDragStart && slider.onDragStart();
            }
        });

        return false; // Prevent default behavior
    }

    /**
     * Handles mouse drag events.
     */
    handleMouseDragged() {
        this.knobs.forEach(knob => {
            if (knob.isDragging) {
                this.updateKnobValue(knob, mouseX, mouseY);
            }
        });

        this.sliders.forEach(slider => {
            if (slider.isDragging) {
                slider.sliderValue = constrain(mouseY - slider.y, -slider.sliderHeight / 2, slider.sliderHeight / 2);
                const gain = map(slider.sliderValue, slider.sliderHeight / 2, -slider.sliderHeight / 2, 0, 1);
                this.audioManager.device.parametersById.get("inputGain").value = gain;
                this.gui.updateGUIValues({
                    worldI_dist: this.audioManager.device.parametersById.get("inputZ").value,
                    xDataM: this.audioManager.device.parametersById.get("inputX").value,
                    yDataM: this.audioManager.device.parametersById.get("inputY").value,
                    zDataV: this.audioManager.device.parametersById.get("inputZ").value,
                });
            }
        });
    }

    /**
     * Handles mouse wheel events to adjust Z knob.
     * @param {object} event 
     */
    handleMouseWheel(event) {
        this.knobs.forEach(knob => {
            if (dist(mouseX, mouseY, knob.x, knob.y) < knob.size / 2) {
                let deltaZ = event.delta * Constants.K_SENSITIVITY;
                knob.valueZ = constrain(knob.valueZ - deltaZ, 0, 255);
                // Update distance based on Z knob
                const wMinD = 600;
                const wMaxD = 1700;
                const worldI_dist = map(knob.valueZ, 0, 255, wMinD, wMaxD);
                // Assuming you have a method to set distance
                // e.g., this.renderer.setDistance(worldI_dist);
                console.log(`World Distance Updated: ${worldI_dist}`);
            }
        });
    }

    /**
     * Handles mouse release events.
     */
    handleMouseReleased() {
        this.knobs.forEach(knob => knob.isDragging = false);
        this.sliders.forEach(slider => slider.isDragging = false);
    }

    /**
     * Handles touch end events.
     */
    handleTouchEnded() {
        this.knobs.forEach(knob => knob.isDragging = false);
        this.sliders.forEach(slider => slider.isDragging = false);
        return false; // Prevent default behavior
    }

    /**
     * Handles touch move events.
     */
    handleTouchMoved() {
        if (touches.length === 0) return;

        this.knobs.forEach(knob => {
            if (knob.isDragging) {
                this.updateKnobValue(knob, touches[0].x, touches[0].y);
            }
        });

        this.sliders.forEach(slider => {
            if (slider.isDragging) {
                slider.sliderValue = constrain(touches[0].y - slider.y, -slider.sliderHeight / 2, slider.sliderHeight / 2);
                const gain = map(slider.sliderValue, slider.sliderHeight / 2, -slider.sliderHeight / 2, 0, 1);
                this.audioManager.device.parametersById.get("inputGain").value = gain;
                this.gui.updateGUIValues({
                    worldI_dist: this.audioManager.device.parametersById.get("inputZ").value,
                    xDataM: this.audioManager.device.parametersById.get("inputX").value,
                    yDataM: this.audioManager.device.parametersById.get("inputY").value,
                    zDataV: this.audioManager.device.parametersById.get("inputZ").value,
                });
            }
        });

        this.prevTouchX = touches[0].x;
        this.prevTouchY = touches[0].y;

        return false; // Prevent default behavior
    }

    /**
     * Updates knob values based on cursor position.
     * @param {object} knob 
     * @param {number} currentX 
     * @param {number} currentY 
     */
    updateKnobValue(knob, currentX, currentY) {
        let deltaX = currentX - pmouseX;
        let deltaY = currentY - pmouseY;

        knob.valueX = constrain(knob.valueX - deltaX * Constants.K_SENSITIVITY, 0, 255);
        knob.valueY = constrain(knob.valueY - deltaY * Constants.K_SENSITIVITY, 0, 255);

        if (knob.label === "X") {
            // Update X-related parameters
            console.log(`Knob X Updated: ${knob.valueX}`);
        } else if (knob.label === "Y") {
            // Update Y-related parameters
            console.log(`Knob Y Updated: ${knob.valueY}`);
        } else if (knob.label === "Z") {
            // Update Z-related parameters
            console.log(`Knob Z Updated: ${knob.valueZ}`);
        }

        // Update GUI or other components as needed
    }

    /**
     * Update method for the Interaction class.
     */
    update() {
        // Implement any per-frame updates if necessary
        // Currently, event handlers manage the interactions
    }
}
