export class Assets {
  constructor(preloadedAssets) {
      this.models = {
          model00: preloadedAssets.model00,
          model01: preloadedAssets.model01,
      };
      this.textures = {
          body00: preloadedAssets.body00,
          body01: preloadedAssets.body01,
      };
  }

  getModel(key) {
      if (!this.models[key]) {
          console.warn(`Model "${key}" is missing.`);
      }
      return this.models[key];
  }

  getTexture(key) {
      if (!this.textures[key]) {
          console.warn(`Texture "${key}" is missing.`);
      }
      return this.textures[key];
  }
}
