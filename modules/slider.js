// js/Knob.js

export class Knob {
    constructor(label, initialX, initialY, initialZ, size, maxY, sensitivity, index) {
        this.label = label;
        this.valueX = initialX;
        this.valueY = initialY;
        this.valueZ = initialZ;
        this.size = size;
        this.maxY = maxY;
        this.sensitivity = sensitivity;
        this.isDragging = false;
        this.index = index;
        this.positionX = 0;
        this.positionY = 0;
    }

    position(x, y) {
        this.positionX = x;
        this.positionY = y;
    }

    draw() {
        let angleY = map(this.valueY, 0, 255, 0, 360, true);
        stroke(Constants.CARD_COLOR);
        strokeWeight(0.5);
        push();
        translate(this.positionX, this.positionY);
        rotateZ(angleY);
        fill(0, 50);
        sphere(this.size * 0.5, 7, 7); // Draw a sphere for the knob
        rotateZ(90);
        strokeWeight(3);
        line(this.size * 0.5, 0, 0, 0);
        pop();
    }

    cleanup() {
        // Remove any event listeners or DOM elements if necessary
    }
}
