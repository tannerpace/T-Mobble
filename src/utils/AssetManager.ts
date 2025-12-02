/**
 * Asset manager - handles loading and caching of game assets
 */

export interface LoadedGameAssets {
  trexImg: HTMLImageElement;
  palmImg: HTMLImageElement;
  jumpSound: HTMLAudioElement;
  powerUpSound: HTMLAudioElement;
  endSound: HTMLAudioElement;
  hitSound: HTMLAudioElement;
  beepSound: HTMLAudioElement;
  blingSound: HTMLAudioElement;
  deadSound: HTMLAudioElement;
  yeehawSound: HTMLAudioElement;
  pewSound: HTMLAudioElement;
  laserbuzSound: HTMLAudioElement;
  whipSound: HTMLAudioElement;
  flameSound: HTMLAudioElement;
}

export class AssetManager {
  private basePath: string;
  private images: Map<string, HTMLImageElement>;
  private sounds: Map<string, HTMLAudioElement>;

  constructor(basePath: string = '') {
    this.basePath = basePath;
    this.images = new Map();
    this.sounds = new Map();
  }

  /**
   * Load an image asset
   */
  loadImage(name: string, path: string): HTMLImageElement {
    const img = new Image();
    const fullPath = this.basePath ? this.basePath + path : (path.startsWith('/') ? path : '/' + path);
    img.src = fullPath;
    this.images.set(name, img);
    return img;
  }

  /**
   * Load an audio asset
   */
  loadSound(name: string, path: string, volume: number = 0.5): HTMLAudioElement {
    const fullPath = this.basePath ? this.basePath + path : (path.startsWith('/') ? path : '/' + path);
    const audio = new Audio(fullPath);
    audio.volume = volume;
    this.sounds.set(name, audio);
    return audio;
  }

  /**
   * Get a loaded image
   */
  getImage(name: string): HTMLImageElement | undefined {
    return this.images.get(name);
  }

  /**
   * Get a loaded sound
   */
  getSound(name: string): HTMLAudioElement | undefined {
    return this.sounds.get(name);
  }

  /**
   * Load all game assets
   */
  loadGameAssets(): LoadedGameAssets {
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
    this.loadSound('flame', 'assets/audio/flame.m4a', 0.3);

    return {
      trexImg: this.getImage('trex')!,
      palmImg: this.getImage('palm')!,
      jumpSound: this.getSound('jump')!,
      powerUpSound: this.getSound('powerup')!,
      endSound: this.getSound('end')!,
      hitSound: this.getSound('hit')!,
      beepSound: this.getSound('beep')!,
      blingSound: this.getSound('bling')!,
      deadSound: this.getSound('dead')!,
      yeehawSound: this.getSound('yeehaw')!,
      pewSound: this.getSound('pew')!,
      laserbuzSound: this.getSound('laserbuz')!,
      whipSound: this.getSound('whip')!,
      flameSound: this.getSound('flame')!
    };
  }
}
