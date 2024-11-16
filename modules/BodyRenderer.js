export class BodyRenderer {
    constructor(bodySize, assets, audioManager) {
        this.setBodySize(bodySize);
        this.assets = assets;
        this.audioManager = audioManager;

        this.starPos = [];
        this.ampHistory = [];
        this.lastPositions = Array(4).fill({ x: 0, z: 0 });
        this.planetRotation = 0;

        this.initStarPositions();
    }

    setBodySize(bodySize) {
        this.bodySize = bodySize;
        this.ringDiameter = 70 * bodySize;
        this.ringWidth = 3 * bodySize;
        this.moonSize = 0.07 * bodySize;
        this.planetSize = 0.66 * bodySize;
    }

    initStarPositions() {
        for (let i = 0; i < 150; i++) {
            const theta = random(180);
            const phi = random(360);
            const position = createVector(
                2000 * sin(theta) * cos(phi),
                2000 * cos(theta),
                2000 * sin(theta) * sin(phi)
            );
            const brightness = random(50, 100);
            const size = random(1, 3);

            this.starPos.push({ position, brightness, size });
        }
    }

    renderStars() {
        push();
        noStroke();

        this.starPos.forEach(({ position, brightness, size }, index) => {
            const twinkle = brightness + sin(millis() * 0.001 + index);
            push();
            translate(position.x, position.y, position.z);
            strokeWeight(size);
            stroke(twinkle);
            point(0, 0, 0);
            pop();
        });

        pop();
    }

    renderBody(playStateI) {
        const amplitude = this.audioManager.getAmplitude();
        this.ampHistory.push(amplitude);

        push();

        // Apply materials and lighting
        this.applyMaterialAndLighting();

        // Render the planet
        this.renderPlanet(playStateI);

        // Render the ring
        this.renderRing();

        pop();

        if (this.ampHistory.length > 360) {
            this.ampHistory.shift();
        }
    }

    applyMaterialAndLighting() {
        specularMaterial(60, 100, 50);
        shininess(50);
        const textureObj = this.assets.getTexture('body00');
        if (textureObj) {
            texture(textureObj);
        } else {
            console.warn('Texture "body00" is missing. Applying default material.');
        }

        ambientLight(50, 50, 50);
        pointLight(255, 255, 255, 200, 200, 200);
        directionalLight(255, 255, 0, -1, 0, 0);
        spotLight(255, 255, 255, -200, -200, 400, 0, 0, -1, 16, 50);
    }

    renderPlanet(playStateI) {
        push();
        scale(this.planetSize);
        rotateX(180);

        // Rotate planet if playing
        if (playStateI === 1) {
            this.planetRotation -= 0.02;
        }
        rotateZ(this.planetRotation);

        noStroke();
        const modelObj = this.assets.getModel('model00');
        if (modelObj) {
            model(modelObj);
        } else {
            console.warn('Model "model00" is missing. Skipping planet rendering.');
        }
        pop();
    }

    renderRing() {
        push();
        strokeWeight(1.5);
        noFill();

        const angleIncrement = 360 / this.ampHistory.length;

        beginShape();
        rotateX(-14);

        for (let i = 0; i < this.ampHistory.length; i++) {
            const angle = i * angleIncrement;
            const cosAngle = cos(angle);
            const sinAngle = sin(angle);

            const radius = this.ringDiameter + map(this.ampHistory[i], -0.4, 0.4, this.ringDiameter, 1);
            const x = radius * cosAngle;
            const y = radius * sinAngle;

            const hue = map(this.ampHistory[i], -1, 1, 150, 0);
            stroke(hue, 80, 80);
            vertex(x, 0, y);
        }
        endShape(CLOSE);
        pop();
    }

    renderMoons(playStateI) {
        const t = millis();
        const t2 = playStateI ? 45 + (t / 150000 * 360 / TWO_PI) : 45;

        // Calculate moon positions
        for (let i = 0; i < 4; i++) {
            const angle = t2 + i * 90;
            this.lastPositions[i] = {
                x: 260 * this.bodySize * cos(angle),
                z: 260 * this.bodySize * sin(angle),
            };
        }

        rotateX(-14);

        // Render moons
        this.lastPositions.forEach(({ x, z }) => {
            push();
            translate(x, 0, z);
            scale(this.moonSize);

            // Get texture and model
            const textureObj = this.assets.getTexture('body01');
            if (textureObj) {
                texture(textureObj);
            } else {
                console.warn('Texture "body01" is missing. Applying default material.');
                noFill();
            }

            const modelObj = this.assets.getModel('model01');
            if (modelObj) {
                model(modelObj);
            } else {
                console.warn('Model "model01" is missing. Skipping moon rendering.');
            }
            pop();
        });
    }
}
