import * as THREE from 'three';

export class GlassCase {
  constructor(scene, position, lootItem, options = {}) {
    this.scene = scene;
    this.position = position.clone();
    this.lootItem = lootItem;
    this.name = options.name || (lootItem && lootItem.type ? lootItem.type.name : 'Valuable Treasure');
    this.glowColor = options.glowColor || 0x00f0ff;
    this.interactionRadius = 2.5;

    this.isOpen = false;
    this.openProgress = 0;

    // Lock the loot inside until opened
    if (this.lootItem) {
      this.lootItem.inContainer = true;
    }

    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.scene.add(this.group);

    this.createModel();
  }

  createModel() {
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.2
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    const glowMat = new THREE.MeshBasicMaterial({ color: this.glowColor });

    const glassMat = new THREE.MeshStandardMaterial({
      color: this.glowColor,
      transparent: true,
      opacity: 0.28,
      roughness: 0.1,
      metalness: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 1. Plinth Pedestal Base (Hexagonal Column)
    const plinthH = 0.9;
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.82, plinthH, 6), baseMat);
    plinth.position.y = plinthH / 2;
    this.group.add(plinth);

    // Glowing Base & Top Collar Rings
    const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 6), glowMat);
    baseRing.position.y = 0.04;
    this.group.add(baseRing);

    const topRing = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.06, 6), glowMat);
    topRing.position.y = plinthH;
    this.group.add(topRing);

    // Display Velvet Platform
    const velvetMat = new THREE.MeshStandardMaterial({ color: 0x1e1035, roughness: 0.8 });
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.08, 16), velvetMat);
    platform.position.y = plinthH + 0.04;
    this.group.add(platform);

    // 2. Pneumatic Guide Rails (Vertical chrome rods on sides)
    [-0.52, 0.52].forEach(x => {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 8), chromeMat);
      rod.position.set(x, plinthH + 0.7, 0);
      this.group.add(rod);
    });

    // 3. Moveable Glass Hood / Lid Group (Lifts up on open)
    this.lidGroup = new THREE.Group();
    this.lidGroup.position.set(0, plinthH + 0.04, 0);
    this.group.add(this.lidGroup);

    // Glass Enclosure Box
    const glassW = 1.1;
    const glassH = 0.95;
    const glassD = 1.1;
    const glassBox = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, glassD), glassMat);
    glassBox.position.set(0, glassH / 2, 0);
    this.lidGroup.add(glassBox);

    // Chrome Top Cap
    const cap = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.06, 0.06, glassD + 0.06), chromeMat);
    cap.position.set(0, glassH + 0.03, 0);
    this.lidGroup.add(cap);

    // Neon Edge Trim on Cap
    const capNeon = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.08, 0.02, glassD + 0.08), glowMat);
    capNeon.position.set(0, glassH + 0.06, 0);
    this.lidGroup.add(capNeon);

    // Vertical Frame Corner Brackets
    [
      [-glassW / 2, -glassD / 2],
      [glassW / 2, -glassD / 2],
      [-glassW / 2, glassD / 2],
      [glassW / 2, glassD / 2]
    ].forEach(([cx, cz]) => {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, glassH, 0.04), chromeMat);
      rib.position.set(cx, glassH / 2, cz);
      this.lidGroup.add(rib);
    });

    // Small High-Tech Laser Lock Disc on Front
    const lockMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    this.lockDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), lockMat);
    this.lockDisc.rotation.x = Math.PI / 2;
    this.lockDisc.position.set(0, 0.12, glassD / 2 + 0.02);
    this.lidGroup.add(this.lockDisc);
  }

  update(delta) {
    if (this.isOpen && this.openProgress < 1) {
      this.openProgress = Math.min(1, this.openProgress + delta * 2.2);
      // Smoothly lift the glass hood up 0.95m
      this.lidGroup.position.y = 0.94 + this.openProgress * 0.95;

      if (this.openProgress >= 0.7 && this.lootItem) {
        this.lootItem.inContainer = false;
      }
    }
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    if (this.lockDisc) {
      this.lockDisc.material.color.setHex(0x00ff88); // Lock turns green
    }
  }

  reset() {
    this.isOpen = false;
    this.openProgress = 0;
    this.lidGroup.position.y = 0.94;
    if (this.lockDisc) {
      this.lockDisc.material.color.setHex(0xef4444);
    }
    if (this.lootItem) {
      this.lootItem.inContainer = true;
    }
  }
}
