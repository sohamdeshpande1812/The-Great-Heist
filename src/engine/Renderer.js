import * as THREE from 'three';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06090f); // Richer deep navy cyberpunk night
    this.scene.fog = new THREE.FogExp2(0x06090f, 0.007); // Slightly tighter for indoor claustrophobia

    // Perspective Camera
    this.camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      350
    );
    this.camera.position.set(0, 5, 10);

    // High performance WebGL Renderer (no shadows — too expensive for browser)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1; // Richer darks, less washed-out whites
    this.renderer.localClippingEnabled = true;

    this.isAlarmActive = false;
    this.setupLighting();
    this.setupResizeListener();
  }

  setupLighting() {
    // 1. Bright white ambient light for crisp indoor illumination across all floors and ceilings
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    this.scene.add(this.ambientLight);

    // 2. Ambient & Hemisphere light with bright cyan-blue sky and soft ground contrast
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x64748b, 1.4);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // 3. High-angle key light for sharp architectural definition
    this.dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight1.position.set(30, 45, 20);
    this.scene.add(this.dirLight1);

    // 4. Counter fill light to keep indoor rooms clean and visible
    this.dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    this.dirLight2.position.set(-30, 35, -20);
    this.scene.add(this.dirLight2);
  }

  setAlarmState(isActive) {
    this.isAlarmActive = isActive;
    if (!isActive) {
      this.hemiLight.color.setHex(0xbae6fd);
      this.scene.background.setHex(0x0a1022);
      if (this.scene.fog) this.scene.fog.color.setHex(0x0a1022);
    } else {
      this.hemiLight.color.setHex(0xff3366);
      this.scene.background.setHex(0x240714);
      if (this.scene.fog) this.scene.fog.color.setHex(0x240714);
    }
  }

  updateAlarmLights(time) {
    if (!this.isAlarmActive) return;
    const isFlash = Math.sin(time * 7) > 0;
    this.hemiLight.color.setHex(isFlash ? 0xff0055 : 0xff6688);
  }

  setGraphicsQuality(preset) {
    if (preset === 'low') {
      this.renderer.setPixelRatio(1);
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
