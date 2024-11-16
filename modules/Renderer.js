import { BodyRenderer } from './BodyRenderer.js';
import { Constants } from './constants.js';

export class Renderer {
    constructor(assets, audioManager, dataManager, easycam) {
        this.assets = assets;
        this.audioManager = audioManager;
        this.dataManager = dataManager;
        this.easycam = easycam;
        this.bodyRenderer = new BodyRenderer(1, assets, audioManager);
    }

    setBodySize(bodySize) {
        this.bodyRenderer.setBodySize(bodySize);
    }

    renderScene(playStateI, easyX, easyY, sw, sh) {
        background(Constants.BACKGROUND_COLOR);
        noStroke();

        this.bodyRenderer.renderBody(playStateI);
        this.bodyRenderer.renderMoons(playStateI);
        this.bodyRenderer.renderStars();

        this.renderHUD(easyX, easyY, sw, sh);
    }

    renderHUD(easyX, easyY, sw, sh) {
        if (!this.easycam) {
            console.warn('EasyCam instance is not defined.');
            return;
        }

        this.easycam.beginHUD();
        noFill();
        stroke(Constants.DEFAULT_COLOR);

        const margin = 10;
        strokeWeight(1.5);

        beginShape();
        vertex(margin, margin);
        vertex(sw - margin, margin);
        vertex(sw - margin, sh - margin);
        vertex(margin, sh - margin);
        vertex(margin, margin);
        endShape(CLOSE);

        fill(255);
        noStroke();
        textAlign(LEFT);
        textSize(16);
        text(`Amplitude: ${nf(this.audioManager.getAmplitude(), 1, 2)}`, margin * 2, margin * 4);

        this.easycam.endHUD();
    }

    handleResize(sw, sh) {
        const aspect = sw / sh;
        perspective(PI / 4, aspect);
        console.log(`Renderer resized: ${sw}x${sh}`);
    }
}
