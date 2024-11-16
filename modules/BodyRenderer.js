// js/BodyRenderer.js

export class BodyRenderer {
  constructor(bodySize, assets, audioManager) {
      this.setBodySize(bodySize);
      this.assets = assets;
      this.audioManager = audioManager;

      this.starPos = [];
      this.amp_history = [];
      this.lastPositions = [
          {x: 0, z: 0},
          {x: 0, z: 0},
          {x: 0, z: 0},
          {x: 0, z: 0}
      ];
      this.initStarPositions();
      this.planetRotation = 0;
  }

  setBodySize(bodySize) {
      this.bodySize = bodySize;
      this.ringDiameter = 70 * this.bodySize;
      this.ringWidth = 3 * this.bodySize;
      this.moonSize = 0.07 * this.bodySize;
      this.planetSize = 0.66 * this.bodySize;
  }

  initStarPositions() {
      for (let i = 0; i < 150; i++) {
          let theta = random(180); // Random angle between 0 and PI
          let phi = random(360); // Random angle between 0 and TWO_PI
          let pos = createVector(
              2000 * sin(theta) * cos(phi),
              2000 * cos(theta),
              2000 * sin(theta) * sin(phi)
          );
          let brightness = random(50, 100);
          let size = random(1, 3); // Random star size
          this.starPos.push([pos, brightness, size]);
      }
  }

  renderBody(playStateI, amplitud, device) {
      this.amp_history.push(amplitud);
      push();

      // Material and lighting
      specularMaterial(60, 100, 50);
      shininess(50);
      texture(this.assets.getTexture('body00'));

      ambientLight(50);
      ambientLight(30, 30, 30); // Slight ambient light
      pointLight(255, 255, 255, 200, 200, 200); // White point light
      directionalLight(255, 255, 0, -1, 0, 0); // Yellow directional light
      spotLight(255, 255, 255, -200, -200, 400, 0, 0, -1, 16, 50); // Spotlight

      // Render the main planet model
      push();
      scale(this.planetSize);
      rotateX(180);

      if (playStateI === 1) {
          this.planetRotation -= 0.02;
      }
      rotateZ(this.planetRotation);

      noStroke();
      model(this.assets.getModel('model00'));
      pop();

      // Render the ring
      push();
      strokeWeight(1.5);
      noFill();

      const angleIncrement = 360 / this.amp_history.length;
      const diameter = this.ringDiameter;

      beginShape();
      rotateX(-14);

      for (let i = 0; i < this.amp_history.length; i++) {
          let angle = i * angleIncrement;
          let cosAngle = cos(angle);
          let sinAngle = sin(angle);

          let r2 = diameter + map(this.amp_history[i], -0.4, 0.4, diameter, 1);
          let x2 = r2 * cosAngle;
          let y2 = r2 * sinAngle;

          let hue2 = map(this.amp_history[i], -1, 1, 150, 0);

          stroke(hue2, 80, 80);
          vertex(x2, 0, y2);
      }
      endShape(CLOSE);

      if (this.amp_history.length > 360) {
          this.amp_history.shift();
      }

      pop();
      pop();
  }

  renderMoons(playStateI, bodySize, device) {
      this.t = millis();  
      if (playStateI) this.t2 = 45 + (this.t / 150000 * 360 / TWO_PI);

      this.lastPositions[0].x = 260 * bodySize * cos(this.t2);
      this.lastPositions[0].z = 260 * bodySize * sin(this.t2);

      this.lastPositions[1].x = 260 * bodySize * cos(this.t2 + 180);
      this.lastPositions[1].z = 260 * bodySize * sin(this.t2 + 180);

      this.lastPositions[2].x = 260 * bodySize * cos(this.t2 + 90);
      this.lastPositions[2].z = 260 * bodySize * sin(this.t2 + 90);

      this.lastPositions[3].x = 260 * bodySize * cos(this.t2 + 270);
      this.lastPositions[3].z = 260 * bodySize * sin(this.t2 + 270);

      rotateX(-14);

      // Render all moons
      for (let pos of this.lastPositions) {
          push();
          translate(pos.x, 0, pos.z);
          scale(this.moonSize);
          texture(this.assets.getTexture('body01'));
          model(this.assets.getModel('model01'));
          pop();
      }
  }

  stars() {
      push();
      noStroke();
      for (let i = 0; i < this.starPos.length; i++) {
          let pos = this.starPos[i][0];
          let brightness = this.starPos[i][1];
          let size = this.starPos[i][2];

          let twinkle = brightness + sin(millis() * 0.001 + i);
          push();
          translate(pos.x, pos.y, pos.z);
          strokeWeight(size); 
          stroke(twinkle);
          point(0, 0, 0);
          pop();
      }
      pop();
  }
}
