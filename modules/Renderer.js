// modules/Renderer.js

import { BodyRenderer } from './BodyRenderer.js';
import { Constants } from './constants.js';

export class Renderer {
  constructor(assets, audioManager, dataManager) {
    this.assets = assets;
    this.audioManager = audioManager;
    this.dataManager = dataManager;
    this.bodyRenderer = new BodyRenderer(1); // Initialize with default body size
  }

  /**
   * Sets the body size based on window dimensions.
   * @param {number} bodySize 
   */
  setBodySize(bodySize) {
    this.bodyRenderer.setBodySize(bodySize);
  }

  /**
   * Renders the main 3D scene.
   */
  renderScene(playStateI, easyX, easyY, sw, sh) {
    background(0, 0, 0);
    noStroke();

    this.bodyRenderer.renderBody(this.audioManager.getAmplitude(), playStateI);
    this.bodyRenderer.renderMoons(playStateI);
    this.bodyRenderer.stars();
    
    this.renderHUD(easyX, easyY, sw, sh);
  }

  /**
   * Renders the Heads-Up Display (HUD).
   */
  renderHUD(easyX, easyY, sw, sh) {
    easycam.beginHUD();
    noFill();
    stroke(Constants.DEFAULT_COLOR);
    
    const margin = 3.3;
    strokeWeight(1.5);
    beginShape();
    vertex(margin, margin);
    vertex(sw * 0.86, margin);
    vertex(sw - margin, sh * 0.14);
    vertex(sw - margin, sh - margin);
    vertex(sw * 0.14, sh - margin);
    vertex(margin, sh - margin);
    vertex(margin, margin);
    endShape();
    
    easycam.endHUD();
  }

  /**
   * Renders the loading screen.
   * @param {string} showText 
   */
  renderLoadingGUI(showText, cardColor, bodySize) {
    textAlign(CENTER);
    fill(cardColor); 
    push();
    translate(0, -30, 150 * bodySize);
    text(showText, 0, 0);
    pop();
  }

  /**
   * Handles window resize events.
   * @param {number} sw - New screen width.
   * @param {number} sh - New screen height.
   */
  handleResize(sw, sh) {
    // Adjust perspective or other rendering settings if needed
    const aspect = sw / sh;
    if (sh > sw) {
      const fovy = 2 * atan(sh / 2 / Constants.wMaxD);
      perspective(fovy, aspect);
    } else {
      perspective(45, aspect);
    }
    // Update any other necessary rendering parameters
  }
}
