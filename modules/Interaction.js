export class Interaction {
    constructor(gui, renderer, audioManager, playbackDataManager) {
        this.gui = gui;
        this.renderer = renderer;
        this.audioManager = audioManager;
        this.playbackDataManager = playbackDataManager;

        this.knobs = gui.knobs || [];
        this.sliders = gui.sliders || [];

        this.prevTouchX = 0;
        this.prevTouchY = 0;

        this.validateGUIButtons();
        this.setupEventHandlers();
    }

    /**
     * Validates the existence of required GUI buttons.
     */
    validateGUIButtons() {
        const requiredButtons = ['play', 'regen'];
        requiredButtons.forEach((buttonName) => {
            if (!this.gui.buttons[buttonName]) {
                console.error(`${buttonName.charAt(0).toUpperCase() + buttonName.slice(1)} button is not defined in GUI.`);
            }
        });
    }

    /**
     * Sets up all event handlers for interaction.
     */
    setupEventHandlers() {
        try {
            // Global event handlers
            window.mousePressed = () => this.handleMousePressed();
            window.mouseDragged = () => this.handleMouseDragged();
            window.mouseReleased = () => this.handleMouseReleased();

            // Button-specific handlers
            this.setupButtonHandlers();
        } catch (error) {
            console.error('Error setting up event handlers:', error);
        }
    }

    /**
     * Sets up button-specific event handlers.
     */
    setupButtonHandlers() {
        if (this.gui.buttons.play) {
            this.gui.buttons.play.mousePressed(async () => {
                try {
                    if (!this.audioManager.isInitialized) {
                        console.log('AudioManager is not initialized. Initializing now...');
                        await this.audioManager.initialize();
                    }

                    if (typeof this.audioManager.togglePlayState === 'function') {
                        await this.audioManager.togglePlayState();
                    } else {
                        console.error('togglePlayState is not defined in AudioManager.');
                    }
                } catch (error) {
                    console.error('Error toggling play state:', error);
                }
            });
        }

        if (this.gui.buttons.regen) {
            this.gui.buttons.regen.mousePressed(() => {
                console.log('Regen button pressed.');
                // Add regeneration logic here
            });
        }
    }

    /**
     * Updates interaction logic for knobs and sliders.
     */
    update() {
        try {
            this.knobs.forEach((knob) => {
                // Add knob-specific update logic if needed
            });

            this.sliders.forEach((slider) => {
                // Add slider-specific update logic if needed
            });
        } catch (error) {
            console.error('Error updating interaction elements:', error);
        }
    }

    /**
     * Handles mouse press events for knobs and sliders.
     */
    handleMousePressed() {
        try {
            this.knobs.forEach((knob) => {
                knob.isDragging = dist(mouseX, mouseY, knob.x, knob.y) < knob.size / 2;
            });

            this.sliders.forEach((slider) => {
                slider.isDragging = dist(mouseX, mouseY, slider.x, slider.y + slider.sliderValue) < slider.handleRadius;
            });
        } catch (error) {
            console.error('Error handling mouse press:', error);
        }
    }

    /**
     * Handles mouse drag events for knobs and sliders.
     */
    handleMouseDragged() {
        try {
            this.knobs.forEach((knob) => {
                if (knob.isDragging) {
                    knob.valueX = constrain(knob.valueX + (mouseX - pmouseX), 0, 255);
                }
            });

            this.sliders.forEach((slider) => {
                if (slider.isDragging) {
                    slider.sliderValue = constrain(mouseY - slider.y, -slider.sliderHeight / 2, slider.sliderHeight / 2);
                }
            });
        } catch (error) {
            console.error('Error handling mouse drag:', error);
        }
    }

    /**
     * Handles mouse release events to stop dragging.
     */
    handleMouseReleased() {
        try {
            this.knobs.forEach((knob) => (knob.isDragging = false));
            this.sliders.forEach((slider) => (slider.isDragging = false));
        } catch (error) {
            console.error('Error handling mouse release:', error);
        }
    }
}
