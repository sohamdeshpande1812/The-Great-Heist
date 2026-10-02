import * as THREE from 'three';

export class InteractiveSafe {
  constructor(scene, position, rotation = 0, lootItem = null, options = {}) {
    this.scene = scene;
    this.position = position.clone();
    this.rotation = rotation;
    this.lootItem = lootItem;
    this.name = options.name || (lootItem && lootItem.type ? lootItem.type.name : 'Valuable Bullion');
    this.label = options.label || 'HEAVY ARMORED SAFE';
    this.interactionRadius = 3.2;

    this.isOpen = false;
    this.openProgress = 0;

    if (this.lootItem) {
      this.lootItem.inContainer = true;
    }

    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;
    this.scene.add(this.group);

    this.createModel();
  }

  createModel() {
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Heavy dark alloy steel
      metalness: 0.9,
      roughness: 0.25
    });

    const interiorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.4
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.15
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    const keypadLedMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    this.keypadLedMat = keypadLedMat;

    const width = 1.3;
    const height = 1.4;
    const depth = 1.1;
    const wallT = 0.12;

    // 1. Hollow Safe Outer Shell (Bottom, Top, Back, Left, Right)
    // Bottom
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, wallT, depth), steelMat);
    bottom.position.set(0, wallT / 2, 0);
    this.group.add(bottom);

    // Top
    const top = new THREE.Mesh(new THREE.BoxGeometry(width, wallT, depth), steelMat);
    top.position.set(0, height - wallT / 2, 0);
    this.group.add(top);

    // Back
    const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, wallT), steelMat);
    back.position.set(0, height / 2, -depth / 2 + wallT / 2);
    this.group.add(back);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, height, depth), steelMat);
    leftWall.position.set(-width / 2 + wallT / 2, height / 2, 0);
    this.group.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, height, depth), steelMat);
    rightWall.position.set(width / 2 - wallT / 2, height / 2, 0);
    this.group.add(rightWall);

    // Interior Shelf
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(width - wallT * 2, 0.05, depth - wallT * 2), interiorMat);
    shelf.position.set(0, height * 0.45, 0);
    this.group.add(shelf);

    // Interior Gold LED Lightbar (illuminates inside when cracked)
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const interiorLed = new THREE.Mesh(new THREE.BoxGeometry(width - 0.4, 0.03, 0.05), ledMat);
    interiorLed.position.set(0, height - wallT - 0.02, 0);
    this.group.add(interiorLed);

    // 2. Hinged Heavy Vault Door
    // Door pivots at left edge (x = -width / 2 + wallT)
    this.doorPivot = new THREE.Group();
    this.doorPivot.position.set(-width / 2 + wallT, 0, depth / 2);
    this.group.add(this.doorPivot);

    const doorW = width - wallT * 1.5;
    const doorH = height - wallT * 1.5;
    const doorD = 0.16;

    // Door Panel Mesh (offset so left edge is at pivot origin 0)
    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorD), steelMat);
    doorPanel.position.set(doorW / 2, height / 2, 0);
    this.doorPivot.add(doorPanel);

    // Combination Dial Wheel
    this.dial = new THREE.Group();
    this.dial.position.set(doorW * 0.4, height / 2, doorD / 2 + 0.04);
    this.doorPivot.add(this.dial);

    const dialRing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 20), goldMat);
    dialRing.rotation.x = Math.PI / 2;
    this.dial.add(dialRing);

    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.08), chromeMat);
      spoke.rotation.z = (i * Math.PI) / 4;
      this.dial.add(spoke);
    }

    // Keypad Panel
    const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.28), keypadLedMat);
    keypad.position.set(doorW * 0.75, height / 2, doorD / 2 + 0.01);
    this.doorPivot.add(keypad);

    // Chrome Locking Bolts on outer edge
    [-0.35, 0, 0.35].forEach(yOff => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 12), chromeMat);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(doorW + 0.02, height / 2 + yOff, 0);
      this.doorPivot.add(bolt);
    });
  }

  update(delta) {
    if (this.isOpen && this.openProgress < 1) {
      this.openProgress = Math.min(1, this.openProgress + delta * 2.2);

      // Swing door open on hinge (-115 degrees)
      this.doorPivot.rotation.y = -this.openProgress * (Math.PI * 0.65);
      this.dial.rotation.z += delta * 7.0;

      if (this.openProgress >= 0.6 && this.lootItem) {
        this.lootItem.inContainer = false;
      }
    }
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.keypadLedMat.color.setHex(0x00ff88); // Turn LED green
  }

  reset() {
    this.isOpen = false;
    this.openProgress = 0;
    this.doorPivot.rotation.y = 0;
    this.keypadLedMat.color.setHex(0xff0044);
    if (this.lootItem) {
      this.lootItem.inContainer = true;
    }
  }
}
