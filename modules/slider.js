export class Knob {
    /**
     * Constructs a knob object with initial values and properties.
     * @param {string} label - Label for the knob.
     * @param {number} initialX - Initial X value (0-255 range).
     * @param {number} initialY - Initial Y value (0-255 range).
     * @param {number} initialZ - Initial Z value (0-255 range).
     * @param {number} size - Size of the knob.
     * @param {number} maxY - Maximum value for the Y axis.
     * @param {number} sensitivity - Sensitivity for input changes.
     * @param {number} index - Unique index for this knob.
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

        this.positionX = 0; // X position on the canvas
        this.positionY = 0; // Y position on the canvas
    }

    /**
     * Sets the position of the knob on the canvas.
     * @param {number} x - X position on the canvas.
     * @param {number} y - Y position on the canvas.
     */
    position(x, y) {
        this.positionX = x;
        this.positionY = y;
    }

    /**
     * Draws the knob on the canvas, including its label and marker.
     */
    draw() {
        try {
            const angleY = map(this.valueY, 0, 255, 0, 360, true); // Convert Y value to rotation angle
            const knobColor = color(50, 50, 50, 200); // Customize knob color

            // Draw the knob base
            push();
            translate(this.positionX, this.positionY);

            // Rotate the knob based on valueY
            rotateZ(angleY);
            noStroke();
            fill(knobColor);
            sphere(this.size * 0.5, 12, 12); // Draw the main knob as a sphere

            // Draw knob marker
            rotateZ(90);
            stroke(255); // White marker
            strokeWeight(3);
            line(this.size * 0.5, 0, 0, 0); // Marker line
            pop();

            // Draw the label below the knob
            push();
            translate(this.positionX, this.positionY + this.size * 0.7);
            fill(255); // White text
            textSize(this.size * 0.2);
            textAlign(CENTER, CENTER);
            text(this.label, 0, 0);
            pop();
        } catch (error) {
            console.error(`Error drawing knob [${this.label}]:`, error);
        }
    }

    /**
     * Updates the knob values based on input.
     * @param {number} deltaX - Change in X position.
     * @param {number} deltaY - Change in Y position.
     */
    updateValues(deltaX, deltaY) {
        try {
            // Adjust X and Y values based on sensitivity
            this.valueX = constrain(this.valueX + deltaX * this.sensitivity, 0, 255);
            this.valueY = constrain(this.valueY + deltaY * this.sensitivity, 0, this.maxY);

            console.log(`Knob [${this.label}] updated:`, { valueX: this.valueX, valueY: this.valueY });
        } catch (error) {
            console.error(`Error updating knob [${this.label}]:`, error);
        }
    }

    /**
     * Cleans up resources related to the knob (if any).
     */
    cleanup() {
        console.log(`Cleaning up knob [${this.label}] resources.`);
        // Placeholder for removing event listeners or DOM elements
    }
}
