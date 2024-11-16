export class Knob {
    /**
     * @param {string} label - Label for the knob.
     * @param {number} initialX - Initial X value.
     * @param {number} initialY - Initial Y value.
     * @param {number} initialZ - Initial Z value.
     * @param {number} size - Size of the knob.
     * @param {number} maxY - Maximum Y value for the knob.
     * @param {number} sensitivity - Sensitivity for adjustments.
     * @param {number} index - Index for identifying the knob.
     */
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

    /**
     * Sets the position of the knob on the canvas.
     * @param {number} x - X position.
     * @param {number} y - Y position.
     */
    position(x, y) {
        this.positionX = x;
        this.positionY = y;
    }

    /**
     * Draws the knob on the canvas.
     */
    draw() {
        try {
            const angleY = map(this.valueY, 0, 255, 0, 360, true);

            // Draw base knob visuals
            push();
            translate(this.positionX, this.positionY);

            // Rotate based on valueY
            rotateZ(angleY);

            // Knob body
            stroke(200); // Adjust stroke color
            strokeWeight(0.5);
            fill(0, 50); // Semi-transparent fill
            sphere(this.size * 0.5, 7, 7); // Sphere as knob base

            // Knob marker
            rotateZ(90);
            strokeWeight(3);
            stroke(255); // Marker stroke color
            line(this.size * 0.5, 0, 0, 0); // Line indicating knob direction

            pop();

            // Draw label below the knob
            push();
            translate(this.positionX, this.positionY + this.size * 0.8);
            textAlign(CENTER);
            fill(255);
            textSize(this.size * 0.15);
            text(this.label, 0, 0);
            pop();
        } catch (error) {
            console.error(`Error drawing knob (${this.label}):`, error);
        }
    }

    /**
     * Cleans up resources or event listeners for the knob.
     */
    cleanup() {
        // Placeholder for cleanup logic if needed
        console.log(`Cleaning up knob: ${this.label}`);
    }

    /**
     * Updates the knob value based on mouse or touch input.
     * @param {number} deltaX - Change in X position.
     * @param {number} deltaY - Change in Y position.
     */
    updateValue(deltaX, deltaY) {
        try {
            this.valueX = constrain(this.valueX - deltaX * this.sensitivity, 0, 255);
            this.valueY = constrain(this.valueY - deltaY * this.sensitivity, 0, this.maxY);
            console.log(`Updated knob (${this.label}):`, { valueX: this.valueX, valueY: this.valueY });
        } catch (error) {
            console.error(`Error updating knob (${this.label}):`, error);
        }
    }
}
