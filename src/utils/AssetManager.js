/**
 * Asset manager - handles loading and caching of game assets
 */
export class AssetManager {
  constructor(basePath = '') {
    this.basePath = basePath;
    this.images = {};
    this.sounds = {};
  }

  /**
   * Load an image asset
   */
  loadImage(name, path) {
    const img = new Image();
    img.src = this.basePath + path;
    this.images[name] = img;
    return img;
  }

  /**
   * Load an audio asset
   */
  loadSound(name, path, volume = 0.5) {
    const audio = new Audio(this.basePath + path);
    audio.volume = volume;
    this.sounds[name] = audio;
    return audio;
  }

  /**
   * Get a loaded image
   */
  getImage(name) {
    return this.images[name];
  }

  /**
   * Get a loaded sound
   */
  getSound(name) {
    return this.sounds[name];
  }

  /**
   * Load all game assets
   */
  loadGameAssets() {
    // Load images
    this.loadImage('trex', 'assets/images/trex.png');
    this.loadImage('palm', 'assets/images/palm.png');

    // Load sounds
    this.loadSound('jump', 'assets/audio/pop.m4a', 0.5);
    this.loadSound('powerup', 'assets/audio/yumyum.m4a', 0.5);
    this.loadSound('end', 'assets/audio/end.m4a', 0.5);
    this.loadSound('hit', 'assets/audio/hit.m4a', 0.5);
    this.loadSound('beep', 'assets/audio/beep.m4a', 0.5);
    this.loadSound('bling', 'assets/audio/bling.m4a', 0.5);
    this.loadSound('dead', 'assets/audio/dead.m4a', 0.5);
    this.loadSound('yeehaw', 'assets/audio/yeehaw.m4a', 0.6);
    this.loadSound('pew', 'assets/audio/pew.m4a', 0.4);
    this.loadSound('laserbuz', 'assets/audio/laserbuz.m4a', 0.3);
    this.loadSound('whip', 'assets/audio/whip.m4a', 0.4);

    return {
      trexImg: this.getImage('trex'),
      palmImg: this.getImage('palm'),
      jumpSound: this.getSound('jump'),
      powerUpSound: this.getSound('powerup'),
      endSound: this.getSound('end'),
      hitSound: this.getSound('hit'),
      beepSound: this.getSound('beep'),
      blingSound: this.getSound('bling'),
      deadSound: this.getSound('dead'),
      yeehawSound: this.getSound('yeehaw'),
      pewSound: this.getSound('pew'),
      laserbuzSound: this.getSound('laserbuz'),
      whipSound: this.getSound('whip')
    };
  }
}
