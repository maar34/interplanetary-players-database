// modules/Assets.js

export class Assets {
    constructor() {
      this.font1 = null;
      this.model00 = null;
      this.body00 = null;
      this.model01 = null;
      this.body01 = null;
    }
  
    async loadAll() {
      try {
        // Load fonts
        this.font1 = await loadFont('fonts/Orbitron-VariableFont_wght.ttf');
        
        // Load 3D models and textures
        this.model00 = await loadModel('media/d6fbd28b1af1_a_spherical_exoplan.obj', true);
        this.body00 = await loadImage('media/d6fbd28b1af1_a_spherical_exoplan_texture_kd.jpg');
        this.model01 = await loadModel('media/d6fbd28b1af1_a_spherical_exoplan.obj', true);
        this.body01 = await loadImage('media/d6fbd28b1af1_a_spherical_exoplan_texture_kd.jpg');
        
        console.log('All assets loaded successfully.');
      } catch (error) {
        console.error('Error loading assets:', error);
        throw error;
      }
    }
  
    getFont1() {
      return this.font1;
    }
  
    getModel00() {
      return this.model00;
    }
  
    getBody00() {
      return this.body00;
    }
  
    getModel01() {
      return this.model01;
    }
  
    getBody01() {
      return this.body01;
    }
  }
  