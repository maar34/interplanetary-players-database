import { Constants } from './constants.js';

export class GUI {
    constructor(playbackDataManager, easycam) {
        this.playbackDataManager = playbackDataManager;
        this.easycam = easycam;

        this.buttons = {};
        this.knobs = [];
        this.sliders = [];
        this.textElements = {};

        this.initButtons();
        this.initKnobs();
        this.initSliders();
        this.initTextElements();
    }

    initButtons() {
        try {
            this.buttons.play = createButton('Play');
            this.styleButton(this.buttons.play);

            this.buttons.regen = createButton('Regen');
            this.styleButton(this.buttons.regen);

            Constants.KNOB_LABELS.forEach((label) => {
                const button = createButton(label);
                this.styleButton(button);
                this.buttons[label.toLowerCase()] = button;
            });
        } catch (error) {
            console.error('Error initializing buttons:', error);
        }
    }

    styleButton(button) {
        button.style('width', `${Constants.BT_WIDTH}px`);
        button.style('height', `${Constants.BT_HEIGHT}px`);
        button.style('background-color', 'transparent');
        button.style('border', 'none');
        button.style('color', 'white');
        button.style('font-size', '16px');
        button.style('cursor', 'pointer');
    }

    initKnobs() {
        Constants.KNOB_LABELS.forEach((label, index) => {
            const knob = {
                label,
                x: 150 + index * 100,
                y: 400,
                size: 50,
                valueX: 128,
                valueY: 128,
                isDragging: false,
            };
            this.knobs.push(knob);
        });
    }

    initSliders() {
        Constants.SLIDER_LABELS.forEach((label, index) => {
            const slider = {
                label,
                x: 200 + index * 150,
                y: 500,
                sliderHeight: 120,
                sliderValue: 0,
                handleRadius: 10,
                isDragging: false,
            };
            this.sliders.push(slider);
        });
    }

    initTextElements() {
        this.textElements.distanceLabel = createP('Distance:');
        this.textElements.xLabel = createP('X:');
        this.textElements.yLabel = createP('Y:');
        this.textElements.zLabel = createP('Z:');
        this.textElements.distanceValue = createP('0');
        this.textElements.xValue = createP('0');
        this.textElements.yValue = createP('0');
        this.textElements.zValue = createP('0');
    }

    layoutGUI(sw, sh, cellWidth, cellHeight) {
        try {
            this.buttons.play.position(cellWidth, sh - cellHeight * 2);
            this.buttons.regen.position(sw - cellWidth - cellHeight, sh - cellHeight * 2);

            this.textElements.distanceLabel.position(cellWidth, cellHeight * 0.5);
            this.textElements.xLabel.position(cellWidth, cellHeight);
            this.textElements.yLabel.position(cellWidth, cellHeight * 1.5);
            this.textElements.zLabel.position(cellWidth, cellHeight * 2);

            this.textElements.distanceValue.position(cellWidth * 3, cellHeight * 0.5);
            this.textElements.xValue.position(cellWidth * 3, cellHeight);
            this.textElements.yValue.position(cellWidth * 3, cellHeight * 1.5);
            this.textElements.zValue.position(cellWidth * 3, cellHeight * 2);
        } catch (error) {
            console.error('Error positioning GUI elements:', error);
        }
    }

    updateGUIValues(data) {
        try {
            if (!data) return;
    
            // Validate and sanitize data before using it
            const amplitude = typeof data.amplitude === "number" ? data.amplitude : 0;
            const playbackState = data.playbackState ? data.playbackState.toString() : "Unknown";
    
            this.textElements.distanceValue.html(nf(amplitude, 1, 2));
            this.textElements.xValue.html(playbackState);
        } catch (error) {
            console.error('Error updating GUI values:', error);
        }
    }
    
    draw() {
        this.drawHUD();
    }

    drawHUD() {
        if (!this.easycam) {
            console.error('Easycam is not defined.');
            return;
        }

        this.easycam.beginHUD();
        this.knobs.forEach((knob) => {
            push();
            translate(knob.x, knob.y);
            fill(255);
            ellipse(0, 0, knob.size);
            pop();
        });

        this.sliders.forEach((slider) => {
            push();
            translate(slider.x, slider.y);
            stroke(255);
            line(0, -slider.sliderHeight / 2, 0, slider.sliderHeight / 2);
            fill(255, 0, 0);
            ellipse(0, slider.sliderValue, slider.handleRadius * 2);
            pop();
        });
        this.easycam.endHUD();
    }
}
