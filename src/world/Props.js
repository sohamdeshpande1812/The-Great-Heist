import * as THREE from 'three';

export class Props {
  // Create the Unified Central Facility Glass Elevator
  static createUnifiedElevator(y, currentFloorName) {
    const group = new THREE.Group();
    group.position.set(0, y, 0);

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2
    });
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const glowCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const floorPadMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 });

    // Base glowing platform (Circular / Octagonal)
    const basePad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.2, 16), floorPadMat);
    basePad.position.y = 0.1;
    group.add(basePad);

    // 4 Corner Chrome/Steel Pillars
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.2, 8), frameMat);
      pillar.position.set(Math.cos(angle) * 2.0, 2.1, Math.sin(angle) * 2.0);
      group.add(pillar);
    }

    // Glass Enclosure Walls (Back, Left, Right)
    const backGlass = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.8, 0.08), glassMat);
    backGlass.position.set(0, 2.1, -1.5);
    group.add(backGlass);

    const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 2.8), glassMat);
    leftGlass.position.set(-1.5, 2.1, 0);
    group.add(leftGlass);

    const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 2.8), glassMat);
    rightGlass.position.set(1.5, 2.1, 0);
    group.add(rightGlass);

    // Illuminated Top Canopy
    const top = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.25, 16), frameMat);
    top.position.y = 4.2;
    group.add(top);

    const topLight = new THREE.Mesh(new THREE.CircleGeometry(1.8, 16), glowCyanMat);
    topLight.rotation.x = Math.PI / 2;
    topLight.position.y = 4.05;
    group.add(topLight);

    // Glowing Neon Floor Sign
    const signBox = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.1), frameMat);
    signBox.position.set(0, 3.8, 1.55);
    group.add(signBox);

    const signGlow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 0.12), glowCyanMat);
    signGlow.position.set(0, 3.8, 1.55);
    group.add(signGlow);

    return {
      name: `Central Elevator (${currentFloorName})`,
      currentFloorName,
      group,
      position: new THREE.Vector3(0, y, 0),
      radius: 3.2
    };
  }

  // Create an interactive Electronic Security Door
  static createSecurityDoor(options = {}) {
    const {
      position = new THREE.Vector3(0, 0, 0),
      rotation = 0,
      type = 'normal',
      width = 3.6,
      height = 3.8
    } = options;

    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    // Distinctive color themes per clearance level
    let glowColor = 0x10b981; // Normal: accessible green
    let bandColor = 0x334155; // Subtle for normal
    let clearanceText = 'UNRESTRICTED';

    if (type === 'blue') {
      glowColor = 0x00aaff;  // Vivid electric blue
      bandColor = 0x0284c7;  // Deep security blue
      clearanceText = 'BLUE CLEARANCE';
    } else if (type === 'red') {
      glowColor = 0xff1744;  // Vivid crimson red
      bandColor = 0xb91c1c;  // Deep security red
      clearanceText = 'RED CLEARANCE';
    } else if (type === 'master') {
      glowColor = 0xd946ef;  // Vivid magenta / purple
      bandColor = 0x9333ea;  // Royal master purple
      clearanceText = 'MASTER CLEARANCE';
    }

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate security frame
      metalness: 0.6,
      roughness: 0.3
    });
    const laserMat = new THREE.MeshBasicMaterial({ color: glowColor });
    const bandMat = new THREE.MeshStandardMaterial({
      color: bandColor,
      metalness: 0.4,
      roughness: 0.3
    });

    // ── Seamless Door Casing (Wall is 1.0m thick, frame is 1.04m) ────
    const wallThick = 1.04;
    const postThick = 0.16;

    // Left & Right side posts
    const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(postThick, height, wallThick), frameMat);
    leftFrame.position.set(-(width / 2 + postThick / 2), height / 2, 0);
    group.add(leftFrame);

    const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(postThick, height, wallThick), frameMat);
    rightFrame.position.set((width / 2 + postThick / 2), height / 2, 0);
    group.add(rightFrame);

    // Slim top casing trim under the lintel
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(width + postThick * 2, 0.14, wallThick), frameMat);
    topTrim.position.y = height + 0.07;
    group.add(topTrim);

    // Neon indicator line under the top frame
    const frameGlow = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, wallThick + 0.02), laserMat);
    frameGlow.position.y = height - 0.02;
    group.add(frameGlow);

    // Glowing vertical security lightbars on the door posts (both front & back)
    const glowL = new THREE.Mesh(new THREE.BoxGeometry(0.05, height - 0.2, wallThick + 0.02), laserMat);
    glowL.position.set(-width / 2 + 0.02, height / 2, 0);
    group.add(glowL);

    const glowR = new THREE.Mesh(new THREE.BoxGeometry(0.05, height - 0.2, wallThick + 0.02), laserMat);
    glowR.position.set(width / 2 - 0.02, height / 2, 0);
    group.add(glowR);

    // ── KEYCARD SCANNER TERMINALS (Mounted on door frame at eye-height: Y=1.6) ──
    const scannerBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const statusLedMat = new THREE.MeshBasicMaterial({ color: glowColor });

    // Front & Back scanners so the player sees it from both sides
    [-0.54, 0.54].forEach(zOffset => {
      const scannerMount = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.06), scannerBoxMat);
      scannerMount.position.set(width / 2 + 0.14, 1.6, zOffset);
      group.add(scannerMount);

      // Glowing Card Slot
      const cardSlot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), statusLedMat);
      cardSlot.position.set(width / 2 + 0.14, 1.66, zOffset + (zOffset > 0 ? 0.035 : -0.035));
      group.add(cardSlot);

      // Status Indicator LED
      const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), statusLedMat);
      statusLed.position.set(width / 2 + 0.14, 1.54, zOffset + (zOffset > 0 ? 0.035 : -0.035));
      group.add(statusLed);

      // Keycard Clearance Badge Plaque above door
      if (type !== 'normal') {
        const badgeMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.03), laserMat);
        badgeMesh.position.set(0, height + 0.24, zOffset);
        group.add(badgeMesh);
      }
    });

    // ── Door Leaves (sliding panels with color-coded security bands) ──
    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Dark tactical grey door surface
      metalness: 0.5,
      roughness: 0.3
    });

    const leafWidth = width / 2;
    const leftLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafWidth, height, 0.14), doorLeafMat);
    leftLeaf.position.set(-leafWidth / 2, height / 2, 0);
    group.add(leftLeaf);

    const rightLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafWidth, height, 0.14), doorLeafMat);
    rightLeaf.position.set(leafWidth / 2, height / 2, 0);
    group.add(rightLeaf);

    // Colored security band across each door leaf (bold visual indicator of required keycard)
    if (type !== 'normal') {
      const bandL = new THREE.Mesh(new THREE.BoxGeometry(leafWidth - 0.04, 0.38, 0.16), bandMat);
      bandL.position.set(0, 0, 0);
      leftLeaf.add(bandL);

      const neonStripeL = new THREE.Mesh(new THREE.BoxGeometry(leafWidth - 0.04, 0.06, 0.17), laserMat);
      neonStripeL.position.set(0, 0, 0);
      leftLeaf.add(neonStripeL);

      const bandR = new THREE.Mesh(new THREE.BoxGeometry(leafWidth - 0.04, 0.38, 0.16), bandMat);
      bandR.position.set(0, 0, 0);
      rightLeaf.add(bandR);

      const neonStripeR = new THREE.Mesh(new THREE.BoxGeometry(leafWidth - 0.04, 0.06, 0.17), laserMat);
      neonStripeR.position.set(0, 0, 0);
      rightLeaf.add(neonStripeR);
    }

    // ── Collider ──────────────────────────────────────────────────────
    const isRotated = Math.abs(Math.sin(rotation)) > 0.5;
    const halfW = width / 2;
    const halfThick = 0.35;
    const minX = isRotated ? position.x - halfThick : position.x - halfW;
    const maxX = isRotated ? position.x + halfThick : position.x + halfW;
    const minZ = isRotated ? position.z - halfW : position.z - halfThick;
    const maxZ = isRotated ? position.z + halfW : position.z + halfThick;

    const colliderBox = new THREE.Box3(
      new THREE.Vector3(minX, position.y, minZ),
      new THREE.Vector3(maxX, position.y + height, maxZ)
    );

    return {
      group,
      leftLeaf,
      rightLeaf,
      statusLedMat,
      laserMat,
      leafWidth,
      height,
      type,
      isOpen: false,
      openProgress: 0,
      position: position.clone(),
      colliderBox,
      update(delta) {
        const target = this.isOpen ? 1 : 0;
        this.openProgress += (target - this.openProgress) * Math.min(1, delta * 5);
        const retractY = this.height / 2 - this.openProgress * (this.height + 0.2);
        this.leftLeaf.position.y  = retractY;
        this.rightLeaf.position.y = retractY;
      },
      open() {
        this.isOpen = true;
        this.statusLedMat.color.setHex(0x00ff88); // Turn green when unlocked!
      },
      close() {
        this.isOpen = false;
        this.statusLedMat.color.setHex(glowColor); // Revert to keycard color when locked
      }
    };
  }

  // Create interactive Switch Console
  static createSwitchConsole(id, position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.2,
      roughness: 0.3
    });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.2, 12), bodyMat);
    base.position.y = 0.6;
    group.add(base);

    const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.7), bodyMat);
    topPanel.position.set(0, 1.25, 0);
    topPanel.rotation.x = 0.3;
    group.add(topPanel);

    const leverBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), bodyMat);
    leverBase.position.set(0, 1.3, 0);
    leverBase.rotation.x = 0.3;
    group.add(leverBase);

    const leverMat = new THREE.MeshStandardMaterial({ color: 0xff0055, roughness: 0.2 });
    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8), leverMat);
    lever.position.set(0, 1.45, 0);
    lever.rotation.x = 0.4;
    group.add(lever);

    const statusMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const statusDisc = new THREE.Mesh(new THREE.CircleGeometry(0.15, 16), statusMat);
    statusDisc.position.set(0, 1.6, 0.22);
    group.add(statusDisc);

    return {
      id,
      group,
      lever,
      leverMat,
      statusMat,
      position: position.clone(),
      isActive: false,
      activate() {
        this.isActive = true;
        this.lever.rotation.x = -0.4;
        this.leverMat.color.setHex(0x00ff88);
        this.statusMat.color.setHex(0x00ff88);
      },
      deactivate() {
        this.isActive = false;
        this.lever.rotation.x = 0.4;
        this.leverMat.color.setHex(0xff0055);
        this.statusMat.color.setHex(0xff0055);
      }
    };
  }

  // Create Giant Armored Main Vault Blast Door
  static createVaultDoor(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.4,
      roughness: 0.2
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2
    });

    // Hollow Vault Portal Frame (Left Column, Right Column, Top Lintel)
    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 1.4), steelMat);
    leftCol.position.set(-3.2, 3.25, 0);
    group.add(leftCol);

    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 1.4), steelMat);
    rightCol.position.set(3.2, 3.25, 0);
    group.add(rightCol);

    const topHeader = new THREE.Mesh(new THREE.BoxGeometry(8.0, 1.2, 1.4), steelMat);
    topHeader.position.set(0, 5.9, 0);
    group.add(topHeader);

    // Illuminated Gold Archway Trim
    const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.3, 1.42), goldTrimMat);
    trimLeft.position.set(-2.36, 2.65, 0);
    group.add(trimLeft);

    const trimRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.3, 1.42), goldTrimMat);
    trimRight.position.set(2.36, 2.65, 0);
    group.add(trimRight);

    const trimTop = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 1.42), goldTrimMat);
    trimTop.position.set(0, 5.28, 0);
    group.add(trimTop);

    // Vault Rotating Gear Door (Slides to right when opened)
    const doorGroup = new THREE.Group();
    doorGroup.position.set(0, 2.7, 0.2);
    group.add(doorGroup);

    const doorDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 24), steelMat);
    doorDisc.rotation.x = Math.PI / 2;
    doorGroup.add(doorDisc);

    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 10, 20), goldTrimMat);
    wheel.position.z = 0.35;
    doorGroup.add(wheel);

    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.1), goldTrimMat);
      spoke.rotation.z = (i * Math.PI) / 4;
      spoke.position.z = 0.35;
      doorGroup.add(spoke);
    }

    const screenMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.5), screenMat);
    screen.position.set(0, 5.6, 0.72);
    group.add(screen);

    const isRotated = Math.abs(Math.sin(rotation)) > 0.5;
    const width = 8.0;
    const height = 6.5;
    const halfW = width / 2;
    const halfThick = 1.0;
    const minX = isRotated ? position.x - halfThick : position.x - halfW;
    const maxX = isRotated ? position.x + halfThick : position.x + halfW;
    const minZ = isRotated ? position.z - halfW : position.z - halfThick;
    // When rotated (Math.PI / 2), opening is along Z from position.z - 2.4 to position.z + 2.4
    // The central sliding blast door collider (active only when closed):
    const colliderBox = new THREE.Box3(
      new THREE.Vector3(minX, position.y, isRotated ? position.z - 2.4 : minZ),
      new THREE.Vector3(maxX, position.y + height, isRotated ? position.z + 2.4 : maxZ)
    );

    // Permanent solid side columns (never unblocked when door opens):
    const sideColliders = [
      new THREE.Box3(
        new THREE.Vector3(minX, position.y, minZ),
        new THREE.Vector3(maxX, position.y + height, isRotated ? position.z - 2.4 : minZ + 1.6)
      ),
      new THREE.Box3(
        new THREE.Vector3(minX, position.y, isRotated ? position.z + 2.4 : maxZ - 1.6),
        new THREE.Vector3(maxX, position.y + height, maxZ)
      )
    ];

    return {
      group,
      doorGroup,
      wheel,
      screenMat,
      isOpen: false,
      openProgress: 0,
      position: position.clone(),
      colliderBox,
      sideColliders,
      type: 'vault',
      update(delta) {
        if (this.isOpen) {
          this.openProgress = Math.min(1, this.openProgress + delta * 0.4);
          this.wheel.rotation.z += delta * 4.0;
          this.doorGroup.position.x = this.openProgress * 5.2;
          this.screenMat.color.setHex(0x00ff88);
        }
      },
      open() {
        this.isOpen = true;
      },
      close() {
        this.isOpen = false;
        this.openProgress = 0;
        this.doorGroup.position.x = 0;
        this.screenMat.color.setHex(0xff0055);
      }
    };
  }

  // Create Extraction Portal / Beacon Zone
  static createExtractionZone(options = {}) {
    const {
      id = 'main',
      name = 'Main Exit',
      position = new THREE.Vector3(0, 0, 0),
      color = 0x00ff88,
      difficulty = 'Easy',
      radius = 4.0
    } = options;

    const group = new THREE.Group();
    group.position.copy(position);

    // Outer glowing neon perimeter boundary ring (0.35m wide)
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(radius - 0.35, radius, 48), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.095;
    group.add(ring);

    // Subtle semi-transparent interior glow (does not mask floor markings or helipad H)
    const innerFillMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const innerFill = new THREE.Mesh(new THREE.CircleGeometry(radius - 0.35, 32), innerFillMat);
    innerFill.rotation.x = -Math.PI / 2;
    innerFill.position.y = 0.092;
    group.add(innerFill);

    // 4 Directional perimeter alignment ticks
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.7), ringMat);
      tick.rotation.x = -Math.PI / 2;
      tick.rotation.z = -angle;
      tick.position.set(Math.cos(angle) * (radius - 0.15), 0.098, Math.sin(angle) * (radius - 0.15));
      group.add(tick);
    }

    // Glowing Vertical Column Light Beam
    const pillarMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 6.0, 24, 1, true), pillarMat);
    pillar.position.y = 3.0;
    group.add(pillar);

    // Glowing Top Beacon Sign
    const signMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const signRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.12, 8, 32), signMat);
    signRing.rotation.x = Math.PI / 2;
    signRing.position.y = 5.0;
    group.add(signRing);

    return {
      id,
      name,
      group,
      position: position.clone(),
      difficulty,
      radius,
      update(delta, time) {
        pillar.material.opacity = 0.28 + Math.sin(time * 3.5) * 0.12;
        signRing.position.y = 5.0 + Math.sin(time * 2.5) * 0.2;
        signRing.rotation.z += delta * 1.5;
      }
    };
  }

  // Create Keycard Item (3D pickup with vertical beacon & rotating holo-ring)
  static createKeycardMesh(type, position) {
    const group = new THREE.Group();
    group.position.copy(position);

    let color = 0x38bdf8;
    if (type === 'red') color = 0xff0055;
    if (type === 'master') color = 0xc084fc;

    const cardMat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.9,
      roughness: 0.1,
      emissive: color,
      emissiveIntensity: 1.0
    });
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.06), cardMat);
    card.position.y = 0.6;
    group.add(card);

    // Glowing Gold / Cyan Trim
    const trimMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.08), trimMat);
    chip.position.set(0, 0.68, 0);
    group.add(chip);

    // Vertical Light Column
    const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.4, 12, 1, true), beamMat);
    beam.position.y = 1.2;
    group.add(beam);

    // Rotating Holo Ring
    const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 8, 24), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.6;
    group.add(ring);

    return {
      type,
      group,
      initialPosition: position.clone(),
      isCollected: false,
      update(delta, time) {
        if (this.isCollected) return;
        group.rotation.y += delta * 1.8;
        ring.rotation.z += delta * 2.5;
        group.position.y = this.initialPosition.y + Math.sin(time * 2.8) * 0.12;
      },
      collect() {
        this.isCollected = true;
        group.visible = false;
      }
    };
  }

  // Create Server Rack with blinking lights
  static createServerRack(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.8, 1.2), bodyMat);
    body.position.y = 1.9;
    group.add(body);

    const ledColors = [0x00f0ff, 0x10b981, 0x38bdf8];
    const leds = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const mat = new THREE.MeshBasicMaterial({ color: ledColors[(r + c) % ledColors.length] });
        const dot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), mat);
        dot.position.set(-0.45 + c * 0.3, 0.6 + r * 0.5, 0.61);
        group.add(dot);
        leds.push(mat);
      }
    }

    return {
      group,
      update(delta, time) {
        if (Math.random() < 0.15) {
          const idx = Math.floor(Math.random() * leds.length);
          leds[idx].color.setHex(Math.random() > 0.5 ? 0x00f0ff : 0x10b981);
        }
      }
    };
  }

  // Create Lab Stasis Pod / Research Chamber
  static createLabStasisPod(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });

    // Base & Top
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.4, 16), metalMat);
    base.position.y = 0.2;
    group.add(base);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.1, 0.4, 16), metalMat);
    top.position.y = 3.6;
    group.add(top);

    // Glass Tube
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 3.0, 16, 1, true), glassMat);
    tube.position.y = 1.9;
    group.add(tube);

    // Core floating hologram inside
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 1), coreMat);
    core.position.y = 1.9;
    group.add(core);

    return {
      group,
      update(delta, time) {
        core.rotation.y += delta * 1.5;
        core.rotation.x += delta * 0.8;
        core.position.y = 1.9 + Math.sin(time * 2) * 0.12;
      }
    };
  }

  // Create Tech Workstation / Desk
  static createTechDesk(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Tabletop & Legs
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.2), deskMat);
    top.position.y = 1.1;
    group.add(top);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.1), deskMat);
    legL.position.set(-1.1, 0.55, 0);
    group.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.1), deskMat);
    legR.position.set(1.1, 0.55, 0);
    group.add(legR);

    // Dual Monitors
    const mon1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.05), screenMat);
    mon1.position.set(-0.4, 1.45, -0.2);
    mon1.rotation.y = 0.15;
    group.add(mon1);

    const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.05), screenMat);
    mon2.position.set(0.4, 1.45, -0.2);
    mon2.rotation.y = -0.15;
    group.add(mon2);

    return { group };
  }

  // Create Executive VIP Desk & Chair
  static createExecutiveDesk(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3, metalness: 0.1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });

    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 1.6), woodMat);
    desk.position.y = 0.55;
    group.add(desk);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(3.24, 0.06, 1.64), goldMat);
    trim.position.y = 1.08;
    group.add(trim);

    // Laptop
    const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.35), goldMat);
    laptop.position.set(0, 1.12, 0);
    group.add(laptop);

    return { group };
  }

  // Create Armored Getaway Van in Garage
  static createArmoredVan(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });

    // Chassis / Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 6.2), bodyMat);
    body.position.y = 1.8;
    group.add(body);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 0.1), glassMat);
    windshield.position.set(0, 2.2, -3.05);
    group.add(windshield);

    // Headlights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), lightMat);
    hl1.position.set(-1.0, 1.2, -3.1);
    group.add(hl1);

    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), lightMat);
    hl2.position.set(1.0, 1.2, -3.1);
    group.add(hl2);

    // 4 Wheels
    for (let x of [-1.55, 1.55]) {
      for (let z of [-1.8, 1.8]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.6, z);
        group.add(wheel);
      }
    }

    return { group };
  }

  // Create Detailed Industrial Cargo Crates Stack with Pallet & Corner Reinforcements
  static createCargoCrates(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const palletMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const crateMat1 = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 }); // Dark alloy
    const crateMat2 = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 }); // Industrial grey
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Caution orange
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 }); // Chrome brackets

    // 1. Wooden Pallet Base
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.12, 1.7), palletMat);
    pallet.position.y = 0.06;
    group.add(pallet);

    // 2. Heavy Base Crate (1.5m x 1.2m x 1.5m)
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), crateMat1);
    c1.position.y = 0.12 + 0.6;
    group.add(c1);

    // Orange Hazard Band
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.14, 1.52), stripeMat);
    s1.position.y = 0.12 + 0.6;
    group.add(s1);

    // Metal Corner Protective Brackets
    [-0.75, 0.75].forEach(x => {
      [-0.75, 0.75].forEach(z => {
        const brk = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.22, 0.12), bracketMat);
        brk.position.set(x, 0.12 + 0.6, z);
        group.add(brk);
      });
    });

    // 3. Top Stacked Secondary Crate (Rotated slightly)
    const c2Group = new THREE.Group();
    c2Group.position.set(0.1, 0.12 + 1.2 + 0.5, 0.05);
    c2Group.rotation.y = 0.25;
    group.add(c2Group);

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.1), crateMat2);
    c2Group.add(c2);

    const s2 = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.1, 1.12), stripeMat);
    c2Group.add(s2);

    return { group };
  }

  // Create Rooftop HVAC Air Ducts
  static createHVACUnit(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const hvacMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 2.8), hvacMat);
    box.position.y = 1.0;
    group.add(box);

    const fanMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.8, 12), fanMat);
    fan.rotation.x = -Math.PI / 2;
    fan.position.set(0, 2.02, 0);
    group.add(fan);

    return { group };
  }

  // Create Rooftop Satellite Dish
  static createRooftopDish(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.2 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8), metalMat);
    post.position.y = 1.25;
    group.add(post);

    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), metalMat);
    dish.position.set(0, 2.6, 0);
    dish.rotation.x = -0.5;
    dish.rotation.y = 0.8;
    group.add(dish);

    // Slim solid collider fitted tightly to the support post (0.4m x 0.4m),
    // ignoring the 2.8m diameter overhead dish up at y=2.6m so players can walk freely underneath
    const colHalf = 0.20;
    const colliderBox = new THREE.Box3(
      new THREE.Vector3(position.x - colHalf, position.y, position.z - colHalf),
      new THREE.Vector3(position.x + colHalf, position.y + 2.5, position.z + colHalf)
    );

    return {
      group,
      colliderBox,
      update(delta, time) {
        dish.rotation.y += delta * 0.2;
      }
    };
  }

  // Create Glowing Room Signboard
  static createSignboard(position, text, color = 0x00f0ff, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const neonMat = new THREE.MeshBasicMaterial({ color });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 0.15), frameMat);
    frame.position.y = 0;
    group.add(frame);

    const plate = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.45), neonMat);
    plate.position.set(0, 0, 0.08);
    group.add(plate);

    return { group };
  }

  // --- MODERN OFFICE & FACILITY FURNITURE ---

  // Modern Office Desk with Dual Curved Monitors & Accessories
  static createOfficeDesk(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const topMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.3 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const casingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6 });
    const keyMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const mugMat = new THREE.MeshStandardMaterial({ color: 0xff0055 });

    // Tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.2), topMat);
    top.position.y = 0.76;
    group.add(top);

    // Steel Legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.72, 1.1);
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-1.1, 0.36, 0);
    group.add(legL);

    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(1.1, 0.36, 0);
    group.add(legR);

    // Dual Curved Monitors
    for (let i = 0; i < 2; i++) {
      const offsetX = i === 0 ? -0.45 : 0.45;
      const rotY = i === 0 ? 0.15 : -0.15;

      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), legMat);
      stand.position.set(offsetX, 0.95, -0.25);
      group.add(stand);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.04), casingMat);
      frame.position.set(offsetX, 1.15, -0.25);
      frame.rotation.y = rotY;
      group.add(frame);

      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.39), screenMat);
      screen.position.set(offsetX, 1.15, -0.22);
      screen.rotation.y = rotY;
      group.add(screen);
    }

    // Keyboard & Mouse
    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.18), keyMat);
    keyboard.position.set(0, 0.81, 0.15);
    group.add(keyboard);

    const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.1), keyMat);
    mouse.position.set(0.35, 0.81, 0.15);
    group.add(mouse);

    // Coffee Mug
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), mugMat);
    mug.position.set(-0.7, 0.85, 0.2);
    group.add(mug);

    // Under-desk PC Tower
    const pc = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.45), casingMat);
    pc.position.set(0.85, 0.25, 0.1);
    group.add(pc);

    return { group };
  }

  // Ergonomic Mesh Cyber Office Chair
  static createOfficeChair(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.2, roughness: 0.7 });
    const plasticMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.4 });

    // 5-Star Base Center Cylinder & Wheels
    const basePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), chromeMat);
    basePillar.position.y = 0.2;
    group.add(basePillar);

    const baseStar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.04, 5), plasticMat);
    baseStar.position.y = 0.05;
    group.add(baseStar);

    // Seat Cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.5), fabricMat);
    seat.position.y = 0.42;
    group.add(seat);

    // High Ergonomic Backrest
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.06), fabricMat);
    backrest.position.set(0, 0.78, -0.22);
    group.add(backrest);

    // Headrest
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.06), plasticMat);
    headrest.position.set(0, 1.15, -0.22);
    group.add(headrest);

    // Armrests
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.3), plasticMat);
    armL.position.set(-0.28, 0.55, -0.02);
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.3), plasticMat);
    armR.position.set(0.28, 0.55, -0.02);
    group.add(armR);

    return { group };
  }

  // Executive Boardroom Conference Table with Central Hologram Projector
  static createBoardroomTable(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.3, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const holoMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 });

    // Large Conference Tabletop (6m x 2.2m)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.1, 2.4), woodMat);
    tableTop.position.y = 0.76;
    group.add(tableTop);

    // Twin Heavy Pillar Bases
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.72, 12), chromeMat);
    base1.position.set(-1.8, 0.36, 0);
    group.add(base1);

    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.72, 12), chromeMat);
    base2.position.set(1.8, 0.36, 0);
    group.add(base2);

    // Center Hologram Emitter Disc
    const holoEmitter = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.04, 16), chromeMat);
    holoEmitter.position.set(0, 0.82, 0);
    group.add(holoEmitter);

    // Floating 3D Hologram Structure (Rotating Earth/Facility Wireframe)
    const holoGeo = new THREE.IcosahedronGeometry(0.45, 1);
    const holoMesh = new THREE.Mesh(holoGeo, holoMat);
    holoMesh.position.set(0, 1.45, 0);
    group.add(holoMesh);

    return {
      group,
      update(delta, time) {
        holoMesh.rotation.y += delta * 0.8;
        holoMesh.rotation.x = Math.sin(time * 1.2) * 0.2;
        holoMesh.position.y = 1.45 + Math.sin(time * 2.0) * 0.04;
      }
    };
  }

  // Cyberpunk Lounge Sofa / Waiting Couches
  static createLoungeSofa(position, rotation = 0, color = 0x0369a1) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const leatherMat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.5 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });

    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.9), leatherMat);
    seat.position.y = 0.35;
    group.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 0.25), leatherMat);
    back.position.set(0, 0.75, -0.32);
    group.add(back);

    // Armrests
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.9), leatherMat);
    armL.position.set(-1.1, 0.6, 0);
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.9), leatherMat);
    armR.position.set(1.1, 0.6, 0);
    group.add(armR);

    // Legs
    for (let x of [-1.1, 1.1]) {
      for (let z of [-0.35, 0.35]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), chromeMat);
        leg.position.set(x, 0.1, z);
        group.add(leg);
      }
    }

    return { group };
  }

  // Beverage Vending Machine
  static createVendingMachine(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const btnMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

    // Main Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.9), bodyMat);
    body.position.y = 1.2;
    group.add(body);

    // Glass Display Window
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.3), glassMat);
    glass.position.set(-0.1, 1.45, 0.46);
    group.add(glass);

    // Illuminated Cans / Rows
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const canMat = new THREE.MeshBasicMaterial({ color: (r + c) % 2 === 0 ? 0x00f0ff : 0xffd700 });
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 6), canMat);
        can.position.set(-0.38 + c * 0.18, 1.75 - r * 0.3, 0.35);
        group.add(can);
      }
    }

    // Top Glowing Neon Header
    const header = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.22), glowMat);
    header.position.set(0, 2.22, 0.46);
    group.add(header);

    // Keypad Selection Matrix
    const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.35), btnMat);
    keypad.position.set(0.42, 1.45, 0.46);
    group.add(keypad);

    return { group };
  }

  // Office Water Cooler Dispenser
  static createWaterCooler(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.3 });
    const bottleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    const tapMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Base Stand
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.0, 0.45), bodyMat);
    base.position.y = 0.5;
    group.add(base);

    // Inverted Water Bottle
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.55, 12), bottleMat);
    bottle.position.y = 1.35;
    group.add(bottle);

    // Dispenser Taps
    const tap1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), tapMat);
    tap1.position.set(-0.08, 0.88, 0.24);
    group.add(tap1);

    const tap2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), new THREE.MeshBasicMaterial({ color: 0xff0055 }));
    tap2.position.set(0.08, 0.88, 0.24);
    group.add(tap2);

    return { group };
  }

  // Futuristic Potted Cyber Plant
  static createCyberPlant(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const potMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
    const neonGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

    // Geometric Hex Pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.65, 6), potMat);
    pot.position.y = 0.325;
    group.add(pot);

    const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.02, 6, 12), neonGlowMat);
    potRim.rotation.x = Math.PI / 2;
    potRim.position.y = 0.65;
    group.add(potRim);

    // Leaves / Foliage
    for (let i = 0; i < 7; i++) {
      const angle = (i * Math.PI * 2) / 7;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.85, 4), leafMat);
      leaf.position.set(Math.cos(angle) * 0.14, 0.95, Math.sin(angle) * 0.14);
      leaf.rotation.x = Math.sin(angle) * 0.35;
      leaf.rotation.z = -Math.cos(angle) * 0.35;
      group.add(leaf);
    }

    return { group };
  }

  // Interactive Digital Whiteboard Presentation Screen
  static createWhiteboard(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const graphMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 0.1), frameMat);
    frame.position.y = 2.4;
    group.add(frame);

    const display = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.8), new THREE.MeshBasicMaterial({ color: 0x071126 }));
    display.position.set(0, 2.4, 0.06);
    group.add(display);

    // Holographic Bar Charts on board
    for (let i = 0; i < 6; i++) {
      const h = 0.3 + (i % 3) * 0.35;
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.18, h), graphMat);
      bar.position.set(-1.0 + i * 0.35, 2.0 + h / 2, 0.08);
      group.add(bar);
    }

    return { group };
  }

  // Lobby Turnstile Security Gate
  static createTurnstileBarrier(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.65 });

    // Left & Right Pillars
    for (let x of [-0.6, 0.6]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.05, 0.9), metalMat);
      pillar.position.set(x, 0.525, 0);
      group.add(pillar);

      const light = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.85), glassMat);
      light.position.set(x, 1.06, 0);
      group.add(light);
    }

    // Glass Flap Leaves
    const flapL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.04), glassMat);
    flapL.position.set(-0.25, 0.55, 0);
    group.add(flapL);

    const flapR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.04), glassMat);
    flapR.position.set(0.25, 0.55, 0);
    group.add(flapR);

    return { group };
  }

  // High-Security Display Pedestal / Plinth for Loot (Crown, Quantum Core, Diamonds)
  static createPedestal(position, height = 1.0, glowColor = 0x00f0ff) {
    const group = new THREE.Group();
    group.position.copy(position);

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
    const glowMat = new THREE.MeshBasicMaterial({ color: glowColor });
    const glassMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.25 });

    // Hexagonal Plinth Column
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, height, 6), baseMat);
    plinth.position.y = height / 2;
    group.add(plinth);

    // Glowing Neon Rings at Top & Base
    const topRing = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.06, 6), glowMat);
    topRing.position.y = height;
    group.add(topRing);

    const baseRing = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.84, 0.08, 6), glowMat);
    baseRing.position.y = 0.04;
    group.add(baseRing);

    // Chrome Top Surface
    const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.04, 16), chromeMat);
    topPlate.position.y = height + 0.04;
    group.add(topPlate);

    // Holographic Emitter Dome / Glass Shield
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.8, 16, 1, true), glassMat);
    dome.position.y = height + 0.44;
    group.add(dome);

    return { group };
  }

  // Reinforced Heavy Vault / Office Floor Safe
  static createSafe(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const safeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const dialMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
    const keypadMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

    // Safe Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.0), safeMat);
    body.position.y = 0.7;
    group.add(body);

    // Heavy Dial
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16), dialMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(-0.2, 0.8, 0.54);
    group.add(dial);

    // Keypad LED
    const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.25), keypadMat);
    keypad.position.set(0.25, 0.8, 0.51);
    group.add(keypad);

    return { group };
  }

  // Multi-Drawer Steel Filing Cabinet
  static createFilingCabinet(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.7), steelMat);
    body.position.y = 0.9;
    group.add(body);

    for (let i = 0; i < 4; i++) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.05), handleMat);
      handle.position.set(0, 0.4 + i * 0.38, 0.37);
      group.add(handle);
    }

    return { group };
  }

  // Commercial Office Multifunction Printer / Copier
  static createPrinterStation(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const plasticMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.9), plasticMat);
    base.position.y = 0.45;
    group.add(base);

    const scanner = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 0.95), plasticMat);
    scanner.position.y = 1.05;
    group.add(scanner);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.02), screenMat);
    screen.position.set(0.35, 1.25, 0.4);
    screen.rotation.x = -0.3;
    group.add(screen);

    return { group };
  }

  // Cafeteria Dining Table with 4 Chairs
  static createDiningTable(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const tableTopMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });

    // Table
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 24), tableTopMat);
    top.position.y = 0.9;
    group.add(top);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 12), poleMat);
    pole.position.y = 0.45;
    group.add(pole);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16), poleMat);
    base.position.y = 0.02;
    group.add(base);

    // 4 Surrounding Chairs
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const dist = 1.15;
      const chairGroup = new THREE.Group();
      chairGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      chairGroup.rotation.y = -angle - Math.PI / 2;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), chairMat);
      seat.position.y = 0.5;
      chairGroup.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), chairMat);
      back.position.set(0, 0.75, -0.2);
      chairGroup.add(back);

      const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), poleMat);
      legs.position.y = 0.25;
      chairGroup.add(legs);

      group.add(chairGroup);
    }

    return { group };
  }

  // High-Tech Lab Workbench with Test Racks & Analyzers
  static createLabWorkbench(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.2 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    // Table Tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.2), metalMat);
    top.position.y = 0.95;
    group.add(top);

    // Legs
    for (let x of [-1.05, 1.05]) {
      for (let z of [-0.45, 0.45]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 8), metalMat);
        leg.position.set(x, 0.475, z);
        group.add(leg);
      }
    }

    // Equipment on Desk: Hologram Analyzer & Centrifuge
    const analyzer = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.4), metalMat);
    analyzer.position.set(-0.6, 1.15, 0);
    group.add(analyzer);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), glowMat);
    screen.position.set(-0.6, 1.2, 0.21);
    group.add(screen);

    // Test Tube Rack with Glowing Vials
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.2), metalMat);
    rack.position.set(0.6, 1.05, 0);
    group.add(rack);

    for (let i = 0; i < 4; i++) {
      const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8), tubeMat);
      vial.position.set(0.45 + i * 0.08, 1.2, 0);
      group.add(vial);
    }

    return { group };
  }

  // Pallet Stacked with Shiny Gold Bullion Bars
  static createVaultGoldPallet(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.15 });

    // Wooden Pallet Base
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 1.6), woodMat);
    pallet.position.y = 0.07;
    group.add(pallet);

    // 3 Tiers of Gold Bullion Bars
    const barW = 0.35;
    const barH = 0.12;
    const barD = 0.18;

    // Layer 1: 4x4
    for (let x = -0.55; x <= 0.55; x += barW + 0.04) {
      for (let z = -0.55; z <= 0.55; z += barD + 0.04) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, barH, barD), goldMat);
        bar.position.set(x, 0.14 + barH / 2, z);
        group.add(bar);
      }
    }

    // Layer 2: 3x3
    for (let x = -0.38; x <= 0.38; x += barW + 0.04) {
      for (let z = -0.38; z <= 0.38; z += barD + 0.04) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, barH, barD), goldMat);
        bar.position.set(x, 0.14 + barH * 1.5, z);
        group.add(bar);
      }
    }

    // Layer 3: 2x2
    for (let x = -0.2; x <= 0.2; x += barW + 0.04) {
      for (let z = -0.2; z <= 0.2; z += barD + 0.04) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, barH, barD), goldMat);
        bar.position.set(x, 0.14 + barH * 2.5, z);
        group.add(bar);
      }
    }

    return { group };
  }

  // Bank Vault Safety Deposit Box Wall
  static createSafetyDepositWall(position, width = 6, height = 3.5, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.95, roughness: 0.1 });
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.4), metalMat);
    wall.position.y = height / 2;
    group.add(wall);

    // Grid of Safety Boxes
    const cols = Math.floor(width / 0.7);
    const rows = Math.floor(height / 0.5);
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const posX = -width / 2 + 0.45 + c * 0.7;
        const posY = 0.35 + r * 0.5;

        // Keyhole & Handle
        const lock = new THREE.Mesh(new THREE.CircleGeometry(0.03, 8), chromeMat);
        lock.position.set(posX, posY, 0.21);
        group.add(lock);

        // A few open lucky deposit boxes with gold/cash
        if ((c * 3 + r * 7) % 11 === 0) {
          const openBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.3), chromeMat);
          openBox.position.set(posX, posY, 0.35);
          group.add(openBox);

          const goldGlint = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.15), goldMat);
          goldGlint.position.set(posX, posY, 0.45);
          group.add(goldGlint);
        }
      }
    }

    return { group };
  }

  // Tactical Weapon & Gear Locker Bank
  static createWeaponGearLocker(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const lockMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // 3 Lockers in a bank
    for (let i = 0; i < 3; i++) {
      const locker = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.6), steelMat);
      locker.position.set(-0.8 + i * 0.8, 1.1, 0);
      group.add(locker);

      const keypad = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.18), lockMat);
      keypad.position.set(-0.8 + i * 0.8, 1.3, 0.31);
      group.add(keypad);
    }

    return { group };
  }

  // Coffee & Snack Break Station
  static createCoffeeStation(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const machineMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.3 });
    const redGlow = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Counter Cabinet
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.7), woodMat);
    counter.position.y = 0.45;
    group.add(counter);

    // Espresso Machine
    const machine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.4), machineMat);
    machine.position.set(-0.4, 1.125, 0);
    group.add(machine);

    const led = new THREE.Mesh(new THREE.CircleGeometry(0.025, 8), redGlow);
    led.position.set(-0.4, 1.25, 0.21);
    group.add(led);

    // Microwave
    const micro = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.35), machineMat);
    micro.position.set(0.4, 1.075, 0);
    group.add(micro);

    return { group };
  }

  // --- INDUSTRIAL WAREHOUSE & DEPOT PROPS ---

  static _getHazardTexture() {
    if (Props._hazardTex) return Props._hazardTex;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f59e0b'; // Vivid amber yellow
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#0f172a'; // Deep slate black
    for (let i = -128; i < 256; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, 0);
      ctx.lineTo(i + 16 - 128, 128);
      ctx.lineTo(i - 128, 128);
      ctx.closePath();
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    Props._hazardTex = tex;
    return tex;
  }

  // High-Bay Heavy-Duty Warehouse Storage Rack with Multi-Tier Stock
  static createWarehouseRack(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const uprightMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.6, roughness: 0.3 }); // Safety Orange Uprights
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 }); // Heavy Blue Beams
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 }); // Wooden Pallets
    const binMat1 = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.3, roughness: 0.4 }); // Blue Tech Bins
    const binMat2 = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.3, roughness: 0.4 }); // Yellow Tech Bins
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 }); // Alloy Pelican Cases
    const labelMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const width = 3.6;
    const depth = 1.3;
    const height = 4.4;

    // 4 Upright Steel Posts
    [-width / 2, width / 2].forEach(x => {
      [-depth / 2, depth / 2].forEach(z => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, height, 0.1), uprightMat);
        post.position.set(x, height / 2, z);
        group.add(post);

        // Footplate
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.2), uprightMat);
        foot.position.set(x, 0.02, z);
        group.add(foot);
      });

      // Diagonal side bracing
      for (let b = 0; b < 3; b++) {
        const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, depth * 1.1, 6), beamMat);
        brace.rotation.x = Math.PI / 3 * (b % 2 === 0 ? 1 : -1);
        brace.position.set(x, 0.8 + b * 1.3, 0);
        group.add(brace);
      }
    });

    // 3 Tiers of Horizontal Cross Beams (Front & Back)
    const shelfHeights = [0.25, 1.6, 2.95];
    shelfHeights.forEach((sy, tierIdx) => {
      // Front and Back Support Beams
      [-depth / 2, depth / 2].forEach(z => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, 0.06), beamMat);
        beam.position.set(0, sy, z);
        group.add(beam);
      });

      // Shelf Wire Mesh / Decking
      const deck = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, 0.04, depth - 0.1), caseMat);
      deck.position.set(0, sy + 0.04, 0);
      group.add(deck);

      // Inventory Stock per Tier
      if (tierIdx === 0) {
        // Lower Tier: 2 Wooden Pallets with Heavy Wrapped Crates
        [-0.9, 0.9].forEach(px => {
          const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.1), woodMat);
          pallet.position.set(px, sy + 0.11, 0);
          group.add(pallet);

          const crate = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.95, 0.95), binMat1);
          crate.position.set(px, sy + 0.63, 0);
          group.add(crate);

          // Strapping band
          const band = new THREE.Mesh(new THREE.BoxGeometry(1.27, 0.04, 0.97), uprightMat);
          band.position.set(px, sy + 0.63, 0);
          group.add(band);
        });
      } else if (tierIdx === 1) {
        // Middle Tier: 4 Tech Storage Bins & Secure Pelican Cases
        [-1.2, -0.4, 0.4, 1.2].forEach((bx, i) => {
          const mat = i % 2 === 0 ? binMat2 : caseMat;
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.8), mat);
          box.position.set(bx, sy + 0.28, 0);
          group.add(box);

          const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), labelMat);
          tag.position.set(bx, sy + 0.28, 0.41);
          group.add(tag);
        });
      } else {
        // Top Tier: Sealed Drum Barrels and Component Boxes
        [-0.9, 0.9].forEach(dx => {
          const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.85, 12), binMat1);
          drum.position.set(dx, sy + 0.48, 0);
          group.add(drum);
        });
        const centerCrate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), caseMat);
        centerCrate.position.set(0, sy + 0.35, 0);
        group.add(centerCrate);
      }
    });

    return { group, width, depth, height };
  }

  // Industrial Yellow Hydraulic Pallet Jack
  static createPalletJack(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.5, roughness: 0.3 }); // Safety Yellow
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 }); // Dark Steel
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    // 1. Dual Forks (Spanning forward along +Z)
    [-0.2, 0.2].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 1.3), yellowMat);
      fork.position.set(fx, 0.06, 0.65);
      group.add(fork);

      // Front Load Roller Wheel
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 12), steelMat);
      roller.rotation.z = Math.PI / 2;
      roller.position.set(fx, 0.05, 1.22);
      group.add(roller);
    });

    // Cross-bridge connecting forks
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.2), yellowMat);
    bridge.position.set(0, 0.06, 0.1);
    group.add(bridge);

    // 2. Hydraulic Pump Unit & Steer Tower
    const pumpHousing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.45, 0.28), yellowMat);
    pumpHousing.position.set(0, 0.3, -0.05);
    group.add(pumpHousing);

    const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 12), chromeMat);
    ram.position.set(0, 0.38, -0.05);
    group.add(ram);

    // Dual Steering Wheels under pump
    [-0.12, 0.12].forEach(wx => {
      const steerWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), steelMat);
      steerWheel.rotation.z = Math.PI / 2;
      steerWheel.position.set(wx, 0.08, -0.05);
      group.add(steerWheel);
    });

    // 3. Upright Steer Handle / Tiller Arm (Angled back)
    const handleGroup = new THREE.Group();
    handleGroup.position.set(0, 0.45, -0.08);
    handleGroup.rotation.x = -Math.PI / 5;
    group.add(handleGroup);

    const handleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), steelMat);
    handleStem.position.y = 0.425;
    handleGroup.add(handleStem);

    // Loop hand grip at top
    const gripBar = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.04), steelMat);
    gripBar.position.y = 0.85;
    handleGroup.add(gripBar);

    const releaseLever = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.02), yellowMat);
    releaseLever.position.set(0.08, 0.82, 0.02);
    handleGroup.add(releaseLever);

    return { group };
  }

  // Industrial 55-Gallon Steel Storage Drums Cluster
  static createIndustrialDrums(position, count = 3) {
    const group = new THREE.Group();
    group.position.copy(position);

    const blueMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6, roughness: 0.3 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.6, roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const hazardSymbolMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    const drumConfigs = [
      { x: 0, z: 0, mat: yellowMat },
      { x: 0.65, z: 0.2, mat: blueMat },
      { x: 0.25, z: 0.65, mat: blackMat }
    ];

    drumConfigs.slice(0, count).forEach(cfg => {
      const drumGroup = new THREE.Group();
      drumGroup.position.set(cfg.x, 0, cfg.z);
      group.add(drumGroup);

      const radius = 0.3;
      const height = 0.95;

      // Drum Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 16), cfg.mat);
      body.position.y = height / 2;
      drumGroup.add(body);

      // Ribbed Steel Reinforcement Chimes
      [0.2, 0.5, 0.8, 0.95].forEach(ry => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.015, 0.015, 6, 16), cfg.mat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = ry;
        drumGroup.add(ring);
      });

      // Top Bung Hole Cap
      const bung = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), blackMat);
      bung.position.set(0.15, height + 0.015, 0.08);
      drumGroup.add(bung);

      // Hazard Warning Diamond Placard on Front
      const placard = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), hazardSymbolMat);
      placard.position.set(0, height * 0.65, radius + 0.01);
      placard.rotation.z = Math.PI / 4;
      drumGroup.add(placard);
    });

    return { group };
  }

  // High-Security Caged Vault Enclosure for Heavy Armored Safes
  static createSecurityCageVault(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const steelPostMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const meshMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.6,
      roughness: 0.4,
      wireframe: true
    });
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.6, roughness: 0.2 });
    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });

    const w = 4.4;
    const d = 3.8;
    const padH = 0.12;
    const cageH = 3.2;

    // 1. Raised Concrete Security Pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(w, padH, d), concreteMat);
    pad.position.y = padH / 2;
    group.add(pad);

    // Hazard Striped Perimeter Border Tape
    const hazardTex = Props._getHazardTexture();
    const hazardMat = new THREE.MeshBasicMaterial({ map: hazardTex });
    [-d / 2 + 0.06, d / 2 - 0.06].forEach(z => {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.12), hazardMat);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(0, padH + 0.005, z);
      group.add(strip);
    });
    [-w / 2 + 0.06, w / 2 - 0.06].forEach(x => {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(d, 0.12), hazardMat);
      strip.rotation.x = -Math.PI / 2;
      strip.rotation.z = Math.PI / 2;
      strip.position.set(x, padH + 0.005, 0);
      group.add(strip);
    });

    // 2. 4 Heavy Steel Corner Bollards (Impact Protection)
    [-w / 2 + 0.3, w / 2 - 0.3].forEach(bx => {
      [-d / 2 + 0.3, d / 2 - 0.3].forEach(bz => {
        const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.95, 12), bollardMat);
        bollard.position.set(bx, 0.475, bz);
        group.add(bollard);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), bollardMat);
        cap.position.set(bx, 0.95, bz);
        group.add(cap);
      });
    });

    // 3. Security Steel Mesh Enclosure (Back & Left/Right Sides)
    // Corner Posts
    [-w / 2 + 0.15, w / 2 - 0.15].forEach(px => {
      [-d / 2 + 0.15, d / 2 - 0.15].forEach(pz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, cageH, 0.12), steelPostMat);
        post.position.set(px, cageH / 2, pz);
        group.add(post);
      });
    });

    // Back Mesh Wall
    const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.3, cageH - 0.2, 16, 12), meshMat);
    backMesh.position.set(0, cageH / 2, -d / 2 + 0.15);
    group.add(backMesh);

    // Left Mesh Wall
    const leftMesh = new THREE.Mesh(new THREE.PlaneGeometry(d - 0.3, cageH - 0.2, 12, 12), meshMat);
    leftMesh.rotation.y = Math.PI / 2;
    leftMesh.position.set(-w / 2 + 0.15, cageH / 2, 0);
    group.add(leftMesh);

    // Right Mesh Wall
    const rightMesh = new THREE.Mesh(new THREE.PlaneGeometry(d - 0.3, cageH - 0.2, 12, 12), meshMat);
    rightMesh.rotation.y = -Math.PI / 2;
    rightMesh.position.set(w / 2 - 0.15, cageH / 2, 0);
    group.add(rightMesh);

    // 4. Overhead Gantry Beam & Security Spot Luminaire
    const topGantry = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 0.14), steelPostMat);
    topGantry.position.set(0, cageH, 0);
    group.add(topGantry);

    const cageLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.22, 12), steelPostMat);
    cageLamp.position.set(0, cageH - 0.15, 0);
    group.add(cageLamp);

    const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), lightGlowMat);
    lampBulb.position.set(0, cageH - 0.25, 0);
    group.add(lampBulb);

    return { group };
  }

  // Overhead Industrial Gantry Crane Beam across Warehouse Ceiling
  static createOverheadGantryCrane(y = 5.6, x = -15, zStart = -24, zEnd = -2) {
    const group = new THREE.Group();

    const beamMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.6, roughness: 0.3 }); // Yellow I-beam
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const length = Math.abs(zEnd - zStart);
    const centerZ = (zStart + zEnd) / 2;

    // Heavy Main Run Beam
    const mainBeam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, length), beamMat);
    mainBeam.position.set(x, y, centerZ);
    group.add(mainBeam);

    // Hoist Trolley Traveler Block
    const trolleyZ = centerZ + 2.0;
    const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.8), steelMat);
    trolley.position.set(x, y - 0.4, trolleyZ);
    group.add(trolley);

    // Steel Suspension Cable
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.8, 6), cableMat);
    cable.position.set(x, y - 1.4, trolleyZ);
    group.add(cable);

    // Forged Industrial Steel Hook
    const hookBase = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.2), beamMat);
    hookBase.position.set(x, y - 2.35, trolleyZ);
    group.add(hookBase);

    const hookRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.04, 8, 16, Math.PI * 1.5), steelMat);
    hookRing.position.set(x, y - 2.55, trolleyZ);
    group.add(hookRing);

    return { group };
  }

  // Prestige Museum / VIP Stanchions with Draped Velvet Ropes
  static createMuseumStanchions(position, width = 2.4, depth = 2.4, ropeColor = 0xdc2626, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.15 }); // Polished Gold/Brass
    const velvetMat = new THREE.MeshStandardMaterial({ color: ropeColor, roughness: 0.8 }); // Rich Velvet

    const hw = width / 2;
    const hd = depth / 2;
    const postH = 0.95;

    // 4 Polished Brass Stanchion Posts at the corners
    const postPositions = [
      { x: -hw, z: -hd },
      { x: hw, z: -hd },
      { x: -hw, z: hd },
      { x: hw, z: hd }
    ];

    postPositions.forEach(p => {
      // Weighted Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16), brassMat);
      base.position.set(p.x, 0.02, p.z);
      group.add(base);

      // Upright Pillar
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, postH, 12), brassMat);
      post.position.set(p.x, postH / 2, p.z);
      group.add(post);

      // Spherical Finial Ball Cap
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), brassMat);
      ball.position.set(p.x, postH + 0.05, p.z);
      group.add(ball);
    });

    // Draped Velvet Ropes between Back, Left, and Right (Front left open for operative access)
    // Left Rope: from (-hw, -hd) to (-hw, hd)
    const leftRope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, depth * 0.95, 8), velvetMat);
    leftRope.rotation.x = Math.PI / 2;
    leftRope.position.set(-hw, postH * 0.82, 0);
    group.add(leftRope);

    // Right Rope: from (hw, -hd) to (hw, hd)
    const rightRope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, depth * 0.95, 8), velvetMat);
    rightRope.rotation.x = Math.PI / 2;
    rightRope.position.set(hw, postH * 0.82, 0);
    group.add(rightRope);

    // Back Rope: from (-hw, -hd) to (hw, -hd)
    const backRope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, width * 0.95, 8), velvetMat);
    backRope.rotation.z = Math.PI / 2;
    backRope.position.set(0, postH * 0.82, -hd);
    group.add(backRope);

    return { group };
  }

  // Logistics & Shipping Manifest Desk Station
  static createLogisticsDesk(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.4 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });

    // Sturdy Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.0), steelMat);
    desk.position.y = 0.85;
    group.add(desk);

    // Legs
    [-0.9, 0.9].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.9), steelMat);
      leg.position.set(x, 0.425, 0);
      group.add(leg);
    });

    // Shipping Terminal & Manifest Screen
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.04), screenMat);
    screen.position.set(-0.4, 1.25, -0.2);
    group.add(screen);

    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.08), steelMat);
    stand.position.set(-0.4, 1.025, -0.2);
    group.add(stand);

    // Clipboard with Manifest Paperwork
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.45), whiteMat);
    board.position.set(0.45, 0.9, 0.1);
    group.add(board);

    // Industrial Barcode Gun Scanner
    const scanner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.16), yellowMat);
    scanner.position.set(0.1, 0.94, 0.15);
    scanner.rotation.y = 0.4;
    group.add(scanner);

    return { group };
  }

  // Modern Tempered Glass & Chrome Coffee Table (For Lobby & Lounges)
  static createGlassCoffeeTable(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      roughness: 0.05,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 });

    const w = 1.6;
    const d = 0.8;
    const h = 0.42;

    // Tempered Glass Tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), glassMat);
    top.position.y = h;
    group.add(top);

    // Chrome Perimeter Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.03, d + 0.04), chromeMat);
    frame.position.y = h - 0.02;
    group.add(frame);

    // 4 Sleek Chrome Legs
    [-w / 2 + 0.06, w / 2 - 0.06].forEach(x => {
      [-d / 2 + 0.06, d / 2 - 0.06].forEach(z => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, h, 8), chromeMat);
        leg.position.set(x, h / 2, z);
        group.add(leg);
      });
    });

    // Lower Dark Alloy Shelf
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.02, d - 0.2), shelfMat);
    shelf.position.y = h * 0.4;
    group.add(shelf);

    return { group };
  }

  // Industrial Mechanic's Tool Workbench (For Tactical Garage)
  static createMechanicWorkbench(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const pegMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.5 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });

    const w = 2.4;
    const d = 1.0;
    const benchH = 0.9;
    const totalH = 1.9;

    // Heavy Wooden / Steel Composite Tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), woodMat);
    top.position.y = benchH;
    group.add(top);

    // Steel Legs & Frame
    [-w / 2 + 0.1, w / 2 - 0.1].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, benchH, d - 0.1), steelMat);
      leg.position.set(x, benchH / 2, 0);
      group.add(leg);
    });

    // Lower Tool Shelf
    const underShelf = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.04, d - 0.2), steelMat);
    underShelf.position.y = 0.25;
    group.add(underShelf);

    // Perforated Tool Pegboard Backboard
    const pegboard = new THREE.Mesh(new THREE.BoxGeometry(w, totalH - benchH, 0.04), pegMat);
    pegboard.position.set(0, benchH + (totalH - benchH) / 2, -d / 2 + 0.02);
    group.add(pegboard);

    // Metal Heavy Vise on Right Edge
    const vise = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.25), steelMat);
    vise.position.set(w / 2 - 0.25, benchH + 0.1, 0.2);
    group.add(vise);

    // Red Metal Tool Chest on lower shelf
    const toolChest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.45), redMat);
    toolChest.position.set(-0.5, 0.45, 0);
    group.add(toolChest);

    return { group };
  }

  // Executive Office Credenza Sideboard
  static createOfficeCredenza(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    const w = 2.2;
    const h = 0.85;
    const d = 0.6;

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    body.position.y = h / 2;
    group.add(body);

    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.04, d + 0.04), topMat);
    top.position.y = h + 0.02;
    group.add(top);

    // Drawer Handles
    [-0.55, 0.55].forEach(x => {
      [0.3, 0.6].forEach(y => {
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.04), handleMat);
        handle.position.set(x, y, d / 2 + 0.02);
        group.add(handle);
      });
    });

    return { group };
  }

  // =========================================================================
  // GROUND FLOOR SPECIALTY PROPS
  // =========================================================================

  // Security Screening Arch (Walkthrough Metal Detector / Biometric Scanner)
  static createSecurityScreeningArch(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const sensorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.5 });

    // Base floor walk-pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.8), padMat);
    pad.position.y = 0.015;
    group.add(pad);

    // Left and Right Scanner Columns
    [-0.55, 0.55].forEach(x => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.5, 0.6), frameMat);
      col.position.set(x, 1.25, 0);
      group.add(col);

      // Vertical LED Sensor strip
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.2, 0.03), ledMat);
      led.position.set(x > 0 ? x - 0.09 : x + 0.09, 1.25, 0);
      group.add(led);
    });

    // Top Header Crossbar
    const header = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.3, 0.6), frameMat);
    header.position.set(0, 2.5 + 0.15, 0);
    group.add(header);

    // Digital Status Screen on Header
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.02), sensorMat);
    screen.position.set(0, 2.65, 0.31);
    group.add(screen);

    return { group };
  }

  // Interactive Information & Directory Kiosk Pillar
  static createInformationKiosk(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.8 });

    // Angled Totem Pedestal
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), bodyMat);
    base.position.y = 0.05;
    group.add(base);

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.3), bodyMat);
    pillar.position.set(0, 0.85, 0);
    group.add(pillar);

    // Angled Interactive Screen Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.1), bodyMat);
    head.position.set(0, 1.7, 0.1);
    head.rotation.x = -Math.PI * 0.18;
    group.add(head);

    const touchScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.38), screenMat);
    touchScreen.position.set(0, 1.71, 0.16);
    touchScreen.rotation.x = -Math.PI * 0.18;
    group.add(touchScreen);

    // Holographic Beacon Ring at Base
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.7, 24), glowMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    // Compact solid collider tightly fit to the totem column (0.4m x 0.4m),
    // ignoring the 1.4m wide floor ring and overhang so player can step up to the kiosk
    const colHalf = 0.20;
    const colliderBox = new THREE.Box3(
      new THREE.Vector3(position.x - colHalf, position.y, position.z - colHalf),
      new THREE.Vector3(position.x + colHalf, position.y + 1.8, position.z + colHalf)
    );

    return { group, colliderBox };
  }

  // Ultra-Thin Executive Area Rug
  static createExecutiveRug(position, width = 3.6, length = 2.4, colorHex = 0x1e293b, borderHex = 0x38bdf8) {
    const group = new THREE.Group();
    group.position.copy(position);

    const rugMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.85 });
    const borderMat = new THREE.MeshBasicMaterial({ color: borderHex });

    // Main rug field
    const rug = new THREE.Mesh(new THREE.BoxGeometry(width, 0.015, length), rugMat);
    rug.position.y = 0.008;
    group.add(rug);

    // Border piping
    const border = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.01, length + 0.08), borderMat);
    border.position.y = 0.005;
    group.add(border);

    return { group };
  }

  // Corporate Identity Feature Wall & Illuminated Emblem
  static createCorporateLogoWall(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const panelMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.15 });
    const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    // Large architectural back panel
    const panel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 0.08), panelMat);
    panel.position.set(0, 3.2, 0);
    group.add(panel);

    // Stylized Cybernetic Corporate Crest (Interlocking Diamond & Chevrons)
    const crest1 = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.65, 6), cyanMat);
    crest1.position.set(0, 3.4, 0.05);
    group.add(crest1);

    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), goldMat);
    core.position.set(0, 3.4, 0.06);
    group.add(core);

    // Corporate Typography Strip ("AEGIS GLOBAL DYNAMICS")
    const brandStrip = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.12, 0.02), cyanMat);
    brandStrip.position.set(0, 2.5, 0.05);
    group.add(brandStrip);

    return { group };
  }

  // Surveillance CCTV Video Wall (Multi-Screen Matrix)
  static createSurveillanceVideoWall(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 });
    const monitorMats = [
      new THREE.MeshBasicMaterial({ color: 0x0284c7 }), // Blue tactical feed
      new THREE.MeshBasicMaterial({ color: 0x059669 }), // Green security grid
      new THREE.MeshBasicMaterial({ color: 0x00f0ff }), // Bright cyan radar
      new THREE.MeshBasicMaterial({ color: 0xd97706 }), // Amber telemetry
      new THREE.MeshBasicMaterial({ color: 0x2563eb }), // Deep blue camera feed
      new THREE.MeshBasicMaterial({ color: 0x0f766e })  // Teal zone map
    ];

    const wallW = 4.8;
    const wallH = 2.6;

    // Back mounting chassis
    const mount = new THREE.Mesh(new THREE.BoxGeometry(wallW + 0.2, wallH + 0.2, 0.1), frameMat);
    mount.position.set(0, 2.6, 0);
    group.add(mount);

    // 3 x 2 Matrix of Big Monitors
    const cols = 3;
    const rows = 2;
    const mWidth = (wallW - 0.2) / cols;
    const mHeight = (wallH - 0.2) / rows;

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -wallW / 2 + mWidth / 2 + 0.1 + c * (mWidth + 0.05);
        const y = 1.4 + mHeight / 2 + r * (mHeight + 0.05);

        // Screen bezel
        const bezel = new THREE.Mesh(new THREE.BoxGeometry(mWidth, mHeight, 0.06), frameMat);
        bezel.position.set(x, y, 0.06);
        group.add(bezel);

        // Screen display
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(mWidth - 0.06, mHeight - 0.06), monitorMats[idx % monitorMats.length]);
        screen.position.set(x, y, 0.1);
        group.add(screen);

        // Mini status bar on bottom of screen
        const bar = new THREE.Mesh(new THREE.PlaneGeometry(mWidth - 0.15, 0.04), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        bar.position.set(x, y - mHeight / 2 + 0.06, 0.101);
        group.add(bar);

        idx++;
      }
    }

    return { group };
  }

  // Tactical Armory & Weapon Rack
  static createTacticalWeaponRack(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15 });
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 });
    const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    const w = 2.4;
    const h = 2.4;
    const d = 0.5;

    // Steel Cage Chassis
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), frameMat);
    back.position.set(0, h / 2, -d / 2 + 0.02);
    group.add(back);

    // Shelves and dividers
    [0.1, 1.1, 2.3].forEach(y => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), frameMat);
      shelf.position.set(0, y, 0);
      group.add(shelf);
    });

    // Vertical Weapon Cradles with Tactical Rifle Silhouettes
    [-0.8, -0.4, 0, 0.4].forEach(x => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), gunMat);
      barrel.position.set(x, 0.6, 0);
      group.add(barrel);

      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.14), gunMat);
      stock.position.set(x, 0.25, 0.02);
      group.add(stock);

      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.08), amberMat);
      mag.position.set(x, 0.45, 0.05);
      group.add(mag);
    });

    // Tactical Riot Shield on Right side
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.95, 0.04), shieldMat);
    shield.position.set(0.85, 0.6, 0.05);
    group.add(shield);

    // Ammo Cases on Top Shelf
    [-0.6, 0, 0.6].forEach(x => {
      const ammo = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.28), new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.6 }));
      ammo.position.set(x, 1.25, 0);
      group.add(ammo);
    });

    return { group };
  }

  // Emergency Medical Station (Wall-Mounted AED & First Aid)
  static createEmergencyMedicalStation(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const boxMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.2), boxMat);
    box.position.y = 1.5;
    group.add(box);

    // Red Cross Sign
    const crossV = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.28), redMat);
    crossV.position.set(0, 1.5, 0.105);
    group.add(crossV);

    const crossH = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.08), redMat);
    crossH.position.set(0, 1.5, 0.106);
    group.add(crossH);

    // Status Indicator
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), greenLedMat);
    led.position.set(0.14, 1.72, 0.105);
    group.add(led);

    return { group };
  }

  // Hydraulic Automotive / Vehicle Service Lift
  static createHydraulicCarLift(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.3 });
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.4 }); // Safety yellow
    const padMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });

    const postH = 4.2;
    const postSpan = 3.6;

    // Dual Heavy Lifting Posts
    [-postSpan / 2, postSpan / 2].forEach(x => {
      // Base plate
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.9), steelMat);
      base.position.set(x, 0.05, 0);
      group.add(base);

      // Main Post Column
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.35, postH, 0.45), steelMat);
      col.position.set(x, postH / 2, 0);
      group.add(col);

      // Hydraulic Chrome Ram
      const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 12), pistonMat);
      ram.position.set(x, 1.8, 0.15);
      group.add(ram);
    });

    // Overhead Synchronization Crossbar
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(postSpan + 0.4, 0.25, 0.35), steelMat);
    crossbar.position.set(0, postH - 0.1, 0);
    group.add(crossbar);

    // Lifting Carriage & Swing Arms (Raised at 1.4m inspection height)
    const carriageH = 1.4;
    [-postSpan / 2 + 0.2, postSpan / 2 - 0.2].forEach(x => {
      // Swing arms extending forward and backward
      [-1, 1].forEach(dir => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 1.4), armMat);
        arm.position.set(x > 0 ? x - 0.3 : x + 0.3, carriageH, dir * 0.7);
        arm.rotation.y = dir * (x > 0 ? -0.2 : 0.2);
        group.add(arm);

        // Rubber Lift Pad
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), padMat);
        pad.position.set(arm.position.x + (x > 0 ? -0.2 : 0.2), carriageH + 0.07, dir * 1.3);
        group.add(pad);
      });
    });

    return { group };
  }

  // Rolling Mechanics Service Cart (Red Snap-On Style)
  static createRollingToolCart(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    const w = 0.85;
    const h = 0.95;
    const d = 0.55;

    // Cart Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.15, d), redMat);
    body.position.y = h / 2 + 0.05;
    group.add(body);

    // Rubber Top Work Mat
    const topMatMesh = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.02, d - 0.04), rubberMat);
    topMatMesh.position.y = h + 0.01;
    group.add(topMatMesh);

    // Chrome Push Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, d - 0.1, 8), chromeMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(-w / 2 - 0.06, h - 0.06, 0);
    group.add(handle);

    // 4 Drawer Chrome Pull Handles
    [0.3, 0.5, 0.7, 0.85].forEach(y => {
      const pull = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.03), chromeMat);
      pull.position.set(0, y, d / 2 + 0.02);
      group.add(pull);
    });

    // 4 Casters
    [-w / 2 + 0.08, w / 2 - 0.08].forEach(x => {
      [-d / 2 + 0.08, d / 2 - 0.08].forEach(z => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), rubberMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.04, z);
        group.add(wheel);
      });
    });

    return { group };
  }

  // Interlocked Stacks of Armored Vehicle Tires
  static createTireStack(position, count = 4) {
    const group = new THREE.Group();
    group.position.copy(position);

    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.1 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 });

    const tireR = 0.44;
    const tireThick = 0.26;

    for (let i = 0; i < count; i++) {
      const tire = new THREE.Mesh(new THREE.TorusGeometry(tireR - 0.12, 0.12, 10, 20), rubberMat);
      tire.rotation.x = Math.PI / 2;
      tire.position.set((Math.random() - 0.5) * 0.04, i * tireThick + tireThick / 2, (Math.random() - 0.5) * 0.04);
      group.add(tire);

      // Steel Rim in center
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(tireR - 0.14, tireR - 0.14, 0.12, 12), rimMat);
      rim.position.copy(tire.position);
      group.add(rim);
    }

    return { group };
  }

  // Industrial Heavy Air Compressor Unit
  static createAirCompressor(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 }); // Compressor blue
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }); // Yellow coiled hose
    const gaugeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Horizontal Tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16), tankMat);
    tank.rotation.z = Math.PI / 2;
    tank.position.y = 0.45;
    group.add(tank);

    // Domed Tank Ends
    [-0.6, 0.6].forEach(x => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 8), tankMat);
      cap.position.set(x, 0.45, 0);
      group.add(cap);
    });

    // Motor and pump assembly on top
    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.35), motorMat);
    motor.position.set(-0.2, 0.9, 0);
    group.add(motor);

    // Pressure Gauge
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), gaugeMat);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(0.3, 0.85, 0.2);
    group.add(gauge);

    // Coiled Air Hose
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 16), hoseMat);
    hose.position.set(0.4, 0.5, 0.25);
    group.add(hose);

    return { group };
  }

  // Modern Fabric Acoustic Cubicle Dividers
  static createAcousticDividers(position, rotation = 0, width = 3.6) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }); // Charcoal fabric
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });

    const h = 1.35;
    const d = 0.08;

    // Main acoustic panel
    const panel = new THREE.Mesh(new THREE.BoxGeometry(width, h, d), fabricMat);
    panel.position.y = h / 2 + 0.05;
    group.add(panel);

    // Top aluminum trim
    const trim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.04, d + 0.04), trimMat);
    trim.position.y = h + 0.07;
    group.add(trim);

    // Feet brackets
    [-width / 2 + 0.3, width / 2 - 0.3].forEach(x => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.4), trimMat);
      foot.position.set(x, 0.06, 0);
      group.add(foot);
    });

    return { group };
  }

  // Global Time Zone World Clocks
  static createWallWorldClocks(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const faceMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const handMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    const cities = ['NEW YORK', 'LONDON', 'TOKYO', 'ZURICH'];
    const r = 0.22;

    cities.forEach((city, i) => {
      const x = (i - 1.5) * 0.75;

      // Clock frame
      const clock = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.04, 20), frameMat);
      clock.rotation.x = Math.PI / 2;
      clock.position.set(x, 3.2, 0);
      group.add(clock);

      // Dial Face
      const face = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r - 0.02, 0.042, 20), faceMat);
      face.rotation.x = Math.PI / 2;
      face.position.set(x, 3.2, 0.005);
      group.add(face);

      // Hands
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.015, r * 0.7, 0.05), handMat);
      hand.position.set(x, 3.2 + 0.05, 0.01);
      hand.rotation.z = (i * Math.PI) / 2.5;
      group.add(hand);

      // Under-clock City Plaque
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.02), frameMat);
      plaque.position.set(x, 2.85, 0.01);
      group.add(plaque);
    });

    return { group };
  }

  // Paper Shredder and Dual Recycling Bins
  static createPaperShredderStation(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const shredderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
    const recycleBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const recycleGreenMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    // Office Paper Shredder
    const shredder = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.4), shredderMat);
    shredder.position.set(-0.5, 0.375, 0);
    group.add(shredder);

    // Shredder paper slot
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    slot.position.set(-0.5, 0.76, 0);
    group.add(slot);

    // Blue Paper Bin
    const bin1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.6, 12), recycleBlueMat);
    bin1.position.set(0.1, 0.3, 0);
    group.add(bin1);

    // Green Can/Bottle Bin
    const bin2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.6, 12), recycleGreenMat);
    bin2.position.set(0.6, 0.3, 0);
    group.add(bin2);

    return { group };
  }

  // Modern Breakout / Huddle Table with 3 Chairs
  static createHuddleTable(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const topMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.15 });

    const r = 0.9;
    const h = 0.76;

    // Table Top
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 24), topMat);
    top.position.y = h;
    group.add(top);

    // Center Pedestal Column
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h - 0.05, 16), legMat);
    col.position.y = (h - 0.05) / 2;
    group.add(col);

    // Base Flange
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.03, 16), legMat);
    base.position.y = 0.015;
    group.add(base);

    // 3 Guest Chairs surrounding the table
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const chairPos = new THREE.Vector3(Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3);
      const chair = Props.createOfficeChair(chairPos, angle + Math.PI);
      group.add(chair.group);
    }

    return { group };
  }

  // =========================================================================
  // 2ND FLOOR SPECIALTY PROPS
  // =========================================================================

  // Chemical Biohazard Fume Hood & Containment Station
  static createBiohazardFumeHood(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 });
    const yellowHazardMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const ductMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const uvLightMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });

    const w = 1.9;
    const h = 2.4;
    const d = 1.0;

    // Lower cabinet
    const lower = new THREE.Mesh(new THREE.BoxGeometry(w, 0.9, d), steelMat);
    lower.position.y = 0.45;
    group.add(lower);

    // Upper enclosure
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, d), steelMat);
    top.position.y = h - 0.2;
    group.add(top);

    // Left and Right Walls
    [-w / 2 + 0.05, w / 2 - 0.05].forEach(x => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, d), steelMat);
      side.position.set(x, 1.45, 0);
      group.add(side);
    });

    // Glass Sash Window
    const sash = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.8, 0.04), glassMat);
    sash.position.set(0, 1.6, d / 2 - 0.05);
    group.add(sash);

    // Interior UV Sanitizer Lamp
    const uv = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, w - 0.4, 8), uvLightMat);
    uv.rotation.z = Math.PI / 2;
    uv.position.set(0, 2.15, 0);
    group.add(uv);

    // Top Exhaust Ventilation Duct
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16), ductMat);
    duct.position.set(0, h + 0.6, 0);
    group.add(duct);

    // Yellow Hazard Warning Strip
    const hazard = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.08, 0.02), yellowHazardMat);
    hazard.position.set(0, 0.86, d / 2 + 0.01);
    group.add(hazard);

    return { group };
  }

  // Centrifuge & High-Speed DNA Analyzer Terminal
  static createCentrifugeStation(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const counterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.25 });
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.85, roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    // Stainless Bench Counter
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 0.8), counterMat);
    counter.position.y = 0.425;
    group.add(counter);

    // Centrifuge Body (Domed Cylinder with Lid)
    const cf = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.35, 20), chassisMat);
    cf.position.set(-0.45, 0.85 + 0.175, 0);
    group.add(cf);

    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), chassisMat);
    lid.position.set(-0.45, 0.85 + 0.35, 0);
    group.add(lid);

    // Optical Spectrophotometer & Screen
    const spec = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.4), chassisMat);
    spec.position.set(0.45, 0.85 + 0.125, 0);
    group.add(spec);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.16), screenMat);
    screen.position.set(0.45, 0.85 + 0.22, 0.21);
    group.add(screen);

    return { group };
  }

  // Cryogenic Liquid Nitrogen Storage Dewars
  static createCryoDewars(position, count = 2) {
    const group = new THREE.Group();
    group.position.copy(position);

    const tankMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.12 });
    const blueCollarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const valveMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.7, roughness: 0.3 });

    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * 0.75;

      // Tank Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.95, 20), tankMat);
      body.position.set(x, 0.5, 0);
      group.add(body);

      // Domed top
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 8), tankMat);
      dome.position.set(x, 0.97, 0);
      group.add(dome);

      // Blue protective collar
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16), blueCollarMat);
      collar.position.set(x, 1.25, 0);
      group.add(collar);

      // Red Pressure Relief Valve
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), valveMat);
      valve.position.set(x + 0.1, 1.35, 0);
      group.add(valve);
    }

    return { group };
  }

  // Emergency Eye-Wash & Safety Decontamination Station
  static createEmergencyEyeWashStation(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }); // Safety yellow
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 }); // Safety green bowl

    // Upright water pipe
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 12), pipeMat);
    pipe.position.y = 1.25;
    group.add(pipe);

    // Eye Wash Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.12, 16), bowlMat);
    bowl.position.set(0, 1.1, 0.18);
    group.add(bowl);

    // Foot Treadle Activation Pedal
    const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 0.25), yellowMat);
    pedal.position.set(0, 0.05, 0.2);
    group.add(pedal);

    // Overhead Deluge Shower Head
    const shower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.08, 16), yellowMat);
    shower.position.set(0, 2.45, 0.3);
    group.add(shower);

    // Pull Rod Triangle
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 8), pipeMat);
    rod.position.set(0.18, 2.05, 0.3);
    group.add(rod);

    return { group };
  }

  // Retro Cyberpunk Arcade Cabinet ("CYBER HEIST")
  static createArcadeCabinet(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 });
    const sideArtMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.5 }); // Purple/Pink neon art
    const marqueeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff }); // Cyan glow marquee
    const crtScreenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Retro green game screen
    const buttonMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const coinMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.2 });

    const w = 0.8;
    const h = 1.95;
    const d = 0.85;

    // Main cabinet body
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    body.position.set(0, h / 2, 0);
    group.add(body);

    // Colorful side art panels
    [-w / 2 - 0.01, w / 2 + 0.01].forEach(x => {
      const art = new THREE.Mesh(new THREE.BoxGeometry(0.01, h - 0.1, d - 0.1), sideArtMat);
      art.position.set(x, h / 2, 0);
      group.add(art);
    });

    // Glowing Marquee Header
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, 0.22, 0.04), marqueeMat);
    marquee.position.set(0, h - 0.18, d / 2 + 0.01);
    group.add(marquee);

    // Angled CRT Screen
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.14, 0.45), crtScreenMat);
    screen.position.set(0, 1.35, d / 2 - 0.08);
    screen.rotation.x = -Math.PI * 0.1;
    group.add(screen);

    // Angled Control Panel Deck with Joysticks
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.08, 0.35), bodyMat);
    deck.position.set(0, 0.95, d / 2 + 0.08);
    deck.rotation.x = Math.PI * 0.08;
    group.add(deck);

    // Two joysticks and buttons
    [-0.2, 0.2].forEach(x => {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), coinMat);
      stick.position.set(x, 1.05, d / 2 + 0.08);
      group.add(stick);

      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), buttonMat);
      knob.position.set(x, 1.11, d / 2 + 0.08);
      group.add(knob);
    });

    // Coin Door
    const coinDoor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.02), coinMat);
    coinDoor.position.set(0, 0.45, d / 2 + 0.01);
    group.add(coinDoor);

    return { group };
  }

  // Modern Modular Break Room Kitchenette Counter
  static createBreakRoomKitchenette(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const baseCabinetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const topCounterMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15, metalness: 0.1 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const microwaveMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 });
    const digitalMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    const w = 2.8;
    const h = 0.9;
    const d = 0.75;

    // Base Cabinets
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), baseCabinetMat);
    base.position.y = h / 2;
    group.add(base);

    // Marble/Quartz Countertop
    const counter = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.05, d + 0.04), topCounterMat);
    counter.position.y = h + 0.025;
    group.add(counter);

    // Stainless Sink & Gooseneck Faucet
    const sink = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.45), steelMat);
    sink.position.set(-0.6, h + 0.051, 0);
    group.add(sink);

    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8), steelMat);
    faucet.position.set(-0.6, h + 0.22, -0.2);
    group.add(faucet);

    // Microwave Oven
    const uwave = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.42), microwaveMat);
    uwave.position.set(0.6, h + 0.225, 0);
    group.add(uwave);

    const uwaveDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), digitalMat);
    uwaveDisplay.position.set(0.8, h + 0.28, 0.211);
    group.add(uwaveDisplay);

    return { group };
  }

  // Luxury Brass & Smoked Glass Executive Bar Cart
  static createExecutiveBarCart(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.15 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.7 });
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 });
    const whiskeyMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.2 });

    const w = 1.0;
    const h = 0.85;
    const d = 0.55;

    // 4 Corner Brass Tubular Uprights
    [-w / 2 + 0.05, w / 2 - 0.05].forEach(x => {
      [-d / 2 + 0.05, d / 2 - 0.05].forEach(z => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, h, 8), brassMat);
        post.position.set(x, h / 2, z);
        group.add(post);
      });
    });

    // 2 Smoked Glass Shelves (Lower and Upper)
    [0.18, h].forEach(y => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), glassMat);
      shelf.position.y = y;
      group.add(shelf);

      // Brass Guard Rail
      const rail = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.04, d + 0.02), brassMat);
      rail.position.y = y + 0.04;
      group.add(rail);
    });

    // Crystal Whisky Decanters on Top
    [-0.2, 0.1].forEach(x => {
      const decanter = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.14), crystalMat);
      decanter.position.set(x, h + 0.14, 0);
      group.add(decanter);

      const liquor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), whiskeyMat);
      liquor.position.set(x, h + 0.09, 0);
      group.add(liquor);
    });

    // Tumbler Glasses
    [0.28, 0.38].forEach(x => {
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 12), crystalMat);
      glass.position.set(x, h + 0.065, 0.05);
      group.add(glass);
    });

    return { group };
  }

  // Tall Executive Trophy & Patent Award Display Bookcase
  static createTrophyBookcase(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.5 }); // Dark mahogany
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.15 });
    const bookColors = [0x991b1b, 0x1e3a8a, 0x065f46, 0x78350f];

    const w = 2.0;
    const h = 2.6;
    const d = 0.45;

    // Bookcase Outer Frame
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), woodMat);
    back.position.set(0, h / 2, -d / 2 + 0.02);
    group.add(back);

    [-w / 2 + 0.03, w / 2 - 0.03].forEach(x => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, d), woodMat);
      side.position.set(x, h / 2, 0);
      group.add(side);
    });

    // 4 Shelves
    const shelfYs = [0.1, 0.7, 1.35, 2.0, 2.58];
    shelfYs.forEach(y => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), woodMat);
      shelf.position.set(0, y, 0);
      group.add(shelf);
    });

    // Gold Executive Trophies & Awards on 2nd and 3rd shelves
    [-0.5, 0.5].forEach(x => {
      const trophyBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 12), woodMat);
      trophyBase.position.set(x, 1.35 + 0.05, 0);
      group.add(trophyBase);

      const trophyCup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.18, 12), goldMat);
      trophyCup.position.set(x, 1.35 + 0.17, 0);
      group.add(trophyCup);
    });

    // Stacks of Hardbound Leather Books on bottom shelf
    for (let i = 0; i < 6; i++) {
      const bMat = new THREE.MeshStandardMaterial({ color: bookColors[i % bookColors.length], roughness: 0.6 });
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.25), bMat);
      book.position.set(-0.7 + i * 0.06, 0.7 + 0.14, 0);
      group.add(book);
    }

    return { group };
  }

  // Modern Designer Sweeping Arc Floor Lamp
  static createDesignerArcLamp(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }); // Black marble
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const shadeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Heavy Marble Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.12, 16), baseMat);
    base.position.y = 0.06;
    group.add(base);

    // Vertical Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2, 8), chromeMat);
    stem.position.set(0, 1.1, 0);
    group.add(stem);

    // Overhanging Horizontal Arc Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 8), chromeMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.7, 2.2, 0);
    group.add(arm);

    // Hanging Polished Dome Shade
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), chromeMat);
    shade.rotation.x = Math.PI;
    shade.position.set(1.4, 2.1, 0);
    group.add(shade);

    // Slim solid collider fitted to marble base (0.5m x 0.5m), ignoring high overhead arc arm at y=2.2m
    const colHalf = 0.25;
    const colliderBox = new THREE.Box3(
      new THREE.Vector3(position.x - colHalf, position.y, position.z - colHalf),
      new THREE.Vector3(position.x + colHalf, position.y + 2.2, position.z + colHalf)
    );

    return { group, colliderBox };
  }

  // Massive Ultra-Wide Corporate Presentation Video Wall
  static createBoardroomVideoWall(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 }); // Blue corporate data
    const chartLineMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Green profit curve
    const soundbarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });

    const w = 6.4;
    const h = 2.4;

    // Display Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), frameMat);
    chassis.position.set(0, 3.2, 0);
    group.add(chassis);

    // Presentation Screen
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, h - 0.12), screenMat);
    screen.position.set(0, 3.2, 0.045);
    group.add(screen);

    // Graphic Chart Line across the screen
    const line = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.6, 0.04), chartLineMat);
    line.position.set(0, 3.1, 0.046);
    group.add(line);

    // Integrated PTZ Conference Soundbar beneath screen
    const soundbar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), soundbarMat);
    soundbar.position.set(0, 1.9, 0.06);
    group.add(soundbar);

    return { group };
  }

  // =========================================================================
  // UNDERGROUND SPECIALTY PROPS
  // =========================================================================

  // High-Voltage Industrial Substation Transformer
  static createHighVoltageTransformer(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const bushingMat = new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.3, roughness: 0.4 }); // Ceramic brown
    const hazardMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow lightning warning

    const w = 1.8;
    const h = 2.2;
    const d = 1.4;

    // Transformer Main Tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), tankMat);
    tank.position.y = h / 2;
    group.add(tank);

    // Cooling Radiator Fins on sides
    [-w / 2 - 0.06, w / 2 + 0.06].forEach(x => {
      const fins = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.7, d * 0.85), tankMat);
      fins.position.set(x, h / 2, 0);
      group.add(fins);
    });

    // 3 Ceramic High-Voltage Bushing Insulators on Top
    [-0.5, 0, 0.5].forEach(x => {
      const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.5, 12), bushingMat);
      bush.position.set(x, h + 0.25, 0);
      group.add(bush);

      const terminal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), tankMat);
      terminal.position.set(x, h + 0.52, 0);
      group.add(terminal);
    });

    // Hazard Placard
    const placard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.02), hazardMat);
    placard.position.set(0, h * 0.6, d / 2 + 0.01);
    placard.rotation.z = Math.PI / 4; // Diamond warning
    group.add(placard);

    return { group };
  }

  // Industrial Wall-Mounted Electrical Distribution & Breaker Panel
  static createElectricalBreakerPanel(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const panelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 });
    const switchMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 });
    const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });

    const w = 1.4;
    const h = 1.8;
    const d = 0.25;

    // Cabinet
    const cab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), panelMat);
    cab.position.y = 2.4;
    group.add(cab);

    // Analog Dials
    [-0.35, 0.35].forEach(x => {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16), dialMat);
      dial.rotation.x = Math.PI / 2;
      dial.position.set(x, 2.9, d / 2 + 0.01);
      group.add(dial);
    });

    // Master Red Knife Disconnect Switch
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.08), switchMat);
    sw.position.set(0, 2.3, d / 2 + 0.04);
    group.add(sw);

    // Vertical Electrical Conduit Pipes running up to ceiling
    [-0.4, 0, 0.4].forEach(x => {
      const cond = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), conduitMat);
      cond.position.set(x, 4.4, 0);
      group.add(cond);
    });

    return { group };
  }

  // Heavy Evidence Storage Shelving Racks with Labeled Archive Boxes
  static createEvidenceShelving(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 }); // Cardboard brown
    const tagMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White evidence tag

    const w = 2.4;
    const h = 2.4;
    const d = 0.7;

    // Steel Shelving Uprights & Tiers
    [0.1, 0.85, 1.6, 2.35].forEach(y => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), steelMat);
      shelf.position.y = y;
      group.add(shelf);

      // Populate tiers with cardboard evidence archive cartons
      if (y < 2.0) {
        [-0.75, -0.25, 0.25, 0.75].forEach(x => {
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.5), boxMat);
          box.position.set(x, y + 0.175 + 0.02, 0);
          group.add(box);

          // Tamper-evident white barcode label on box front
          const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.12), tagMat);
          tag.position.set(x, y + 0.175 + 0.02, 0.251);
          group.add(tag);
        });
      }
    });

    [-w / 2 + 0.04, w / 2 - 0.04].forEach(x => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, d), steelMat);
      post.position.set(x, h / 2, 0);
      group.add(post);
    });

    return { group };
  }

  // Heavy Wire-Mesh Wheeled Rolling Money Cart
  static createRollingMoneyCart(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 });
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2, wireframe: true });
    const billMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }); // Currency green
    const strapMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White strap bands

    const w = 1.4;
    const h = 1.3;
    const d = 0.9;

    // Heavy Steel Base Plate
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), frameMat);
    base.position.y = 0.18;
    group.add(base);

    // 4 Heavy Rubber Casters
    [-w / 2 + 0.15, w / 2 - 0.15].forEach(x => {
      [-d / 2 + 0.15, d / 2 - 0.15].forEach(z => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), frameMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.09, z);
        group.add(wheel);
      });
    });

    // Wire Mesh Enclosure Cage
    const cage = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, h - 0.2, d - 0.06), wireMat);
    cage.position.y = 0.18 + (h - 0.2) / 2;
    group.add(cage);

    // Dense Strapped Stacks of Cash inside the cart
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const x = -0.35 + col * 0.35;
        const z = -0.2 + row * 0.4;
        const y = 0.22 + 0.18;

        const stack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.32), billMat);
        stack.position.set(x, y, z);
        group.add(stack);

        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.05, 0.33), strapMat);
        strap.position.set(x, y, z);
        group.add(strap);
      }
    }

    return { group };
  }

  // =========================================================================
  // ROOFTOP SPECIALTY PROPS
  // =========================================================================

  // Industrial Stadium Helipad Floodlight Tower
  static createHelipadFloodlight(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb }); // Warm bright floodlight

    const h = 4.2;

    // Steel Mast Column
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, h, 8), mastMat);
    mast.position.y = h / 2;
    group.add(mast);

    // Cross Arm Header
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.15), mastMat);
    arm.position.set(0, h, 0);
    group.add(arm);

    // 3 Angled Stadium Floodlight Fixtures
    [-0.4, 0, 0.4].forEach(x => {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.25), lampMat);
      lamp.position.set(x, h + 0.1, 0.1);
      lamp.rotation.x = Math.PI * 0.2; // Angled down toward helipad
      group.add(lamp);

      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.16), glowMat);
      lens.position.set(x, h + 0.08, 0.23);
      lens.rotation.x = Math.PI * 0.2;
      group.add(lens);
    });

    // Slim solid collider fitted to the mast column (0.4m x 0.4m), ignoring the high overhead 1.2m crossarm at y=4.2m
    const colHalf = 0.20;
    const colliderBox = new THREE.Box3(
      new THREE.Vector3(position.x - colHalf, position.y, position.z - colHalf),
      new THREE.Vector3(position.x + colHalf, position.y + 2.4, position.z + colHalf)
    );

    return { group, colliderBox };
  }

  // Illuminated Aviation Windsock & Weather Mast
  static createAviationWindsock(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.7 }); // Safety orange
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red hazard beacon

    const h = 3.6;

    // Slender Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, h, 8), mastMat);
    mast.position.y = h / 2;
    group.add(mast);

    // Swivel Arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8), mastMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.3, h - 0.1, 0);
    group.add(arm);

    // Striped Conical Fabric Windsock
    const cone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.4, 12, 1, true), orangeMat);
    cone1.rotation.z = Math.PI / 2;
    cone1.position.set(0.5, h - 0.1, 0);
    group.add(cone1);

    const cone2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.4, 12, 1, true), whiteMat);
    cone2.rotation.z = Math.PI / 2;
    cone2.position.set(0.9, h - 0.1, 0);
    group.add(cone2);

    const cone3 = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.06, 0.4, 12, 1, true), orangeMat);
    cone3.rotation.z = Math.PI / 2;
    cone3.position.set(1.3, h - 0.1, 0);
    group.add(cone3);

    // Red Obstacle Light at Top
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), beaconMat);
    beacon.position.set(0, h + 0.08, 0);
    group.add(beacon);

    // Slim solid collider fitted to the mast pole (0.3m x 0.3m), ignoring the windsock cone in the air at y=3.6m
    const colHalf = 0.15;
    const colliderBox = new THREE.Box3(
      new THREE.Vector3(position.x - colHalf, position.y, position.z - colHalf),
      new THREE.Vector3(position.x + colHalf, position.y + 2.4, position.z + colHalf)
    );

    return { group, colliderBox };
  }

  // Communications Lattice Mast with Flashing Obstruction Beacon
  static createRooftopAntenna(position) {
    const group = new THREE.Group();
    group.position.copy(position);

    const latticeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const h = 6.2;

    // Central Spire Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, h, 8), latticeMat);
    mast.position.y = h / 2;
    group.add(mast);

    // Cross Dipoles
    [2.5, 3.8, 5.0].forEach(y => {
      const dipole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 8), latticeMat);
      dipole.rotation.z = Math.PI / 2;
      dipole.position.set(0, y, 0);
      group.add(dipole);
    });

    // Small Microwave Dish attached to mast
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16), dishMat);
    dish.rotation.x = Math.PI / 2;
    dish.position.set(0, 4.2, 0.25);
    group.add(dish);

    // Red Aviation Warning Beacon at Mast Peak
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), beaconMat);
    beacon.position.set(0, h + 0.12, 0);
    group.add(beacon);

    // Slim solid collider fitted to the antenna mast base (0.35m x 0.35m), ignoring high dipoles overhead
    const colHalf = 0.18;
    const colliderBox = new THREE.Box3(
      new THREE.Vector3(position.x - colHalf, position.y, position.z - colHalf),
      new THREE.Vector3(position.x + colHalf, position.y + 2.4, position.z + colHalf)
    );

    return { group, colliderBox };
  }

  // Rooftop Stairwell & Service Elevator Penthouse Bulkhead
  static createRooftopBulkhead(position, rotation = 0) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotation;

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4, roughness: 0.6 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const w = 3.6;
    const h = 2.8;
    const d = 3.2;

    // Concrete Service Doghouse
    const doghouse = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    doghouse.position.y = h / 2;
    group.add(doghouse);

    // Heavy Industrial Steel Service Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.08), doorMat);
    door.position.set(0, 1.1, d / 2 + 0.04);
    group.add(door);

    // Weatherproof Bulkhead Light Fixture above Door
    const light = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), lightMat);
    light.rotation.x = Math.PI / 2;
    light.position.set(0, 2.45, d / 2 + 0.1);
    group.add(light);

    return { group };
  }

  // Professional Aviation Helipad with Perfect FAA/ICAO "H" Marking & Runway Edge Lights
  static createHelipad(position = new THREE.Vector3(0, 16, 12)) {
    const group = new THREE.Group();
    group.position.copy(position);

    // 1. Raised Concrete/Steel Helipad Platform (Diameter 10.4m, Height 0.08m)
    const slabGeo = new THREE.CylinderGeometry(5.2, 5.3, 0.08, 48);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.35,
      roughness: 0.65
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    slab.position.y = 0.04;
    group.add(slab);

    // 2. High-Resolution 2048x2048 Procedural Canvas Texture for Perfect Helipad Markings
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    const cx = 1024;
    const cy = 1024;

    // Fill background with tarmac composite deck
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 2048, 2048);

    // Draw circular dark landing apron
    ctx.beginPath();
    ctx.arc(cx, cy, 980, 0, Math.PI * 2);
    ctx.fillStyle = '#151c28';
    ctx.fill();

    // Outer Hazard Perimeter Border (Alternating Safety Yellow and Charcoal sectors)
    const numSectors = 36;
    const outerR = 980;
    const innerR = 920;
    for (let i = 0; i < numSectors; i++) {
      const startAngle = (i * 2 * Math.PI) / numSectors;
      const endAngle = ((i + 1) * 2 * Math.PI) / numSectors;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = (i % 2 === 0) ? '#facc15' : '#0f172a';
      ctx.fill();
    }

    // Bold Outer White Aviation Circle Ring
    ctx.beginPath();
    ctx.arc(cx, cy, 860, 0, Math.PI * 2);
    ctx.lineWidth = 50;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Secondary Inner Guidance Circle Ring (Dashed)
    ctx.beginPath();
    ctx.arc(cx, cy, 640, 0, Math.PI * 2);
    ctx.lineWidth = 14;
    ctx.setLineDash([28, 24]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // ── THE PERFECT LETTER "H" ──────────────────────────────
    // FAA / ICAO Standard Proportions:
    // Total Height = 960px (~4.7m in world units)
    // Total Width = 600px (~2.93m in world units)
    // Stroke Thickness = 140px (~0.68m in world units)
    const hHeight = 960;
    const hWidth = 600;
    const stroke = 140;

    const leftX = cx - hWidth / 2;               // 1024 - 300 = 724
    const rightX = cx + hWidth / 2 - stroke;     // 1024 + 300 - 140 = 1184
    const topY = cy - hHeight / 2;               // 1024 - 480 = 544
    const crossY = cy - stroke / 2;              // 1024 - 70 = 954

    // Draw high-contrast black drop shadow / outline (18px)
    ctx.fillStyle = '#000000';
    ctx.fillRect(leftX - 18, topY - 18, stroke + 36, hHeight + 36);
    ctx.fillRect(rightX - 18, topY - 18, stroke + 36, hHeight + 36);
    ctx.fillRect(leftX - 18, crossY - 18, hWidth + 36, stroke + 36);

    // Draw crisp pure white "H"
    ctx.fillStyle = '#ffffff';
    // Left vertical bar
    ctx.fillRect(leftX, topY, stroke, hHeight);
    // Right vertical bar
    ctx.fillRect(rightX, topY, stroke, hHeight);
    // Horizontal crossbar connecting left and right bars
    ctx.fillRect(leftX, crossY, hWidth, stroke);

    // Aviation Text Stencils
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MAX WT 12,000 LBS', cx, cy - 720);
    ctx.fillText('PAD 01 • TOUCHDOWN AREA', cx, cy + 720);

    // Orientation Heading Arrow at Top
    ctx.beginPath();
    ctx.moveTo(cx, cy - 810);
    ctx.lineTo(cx - 30, cy - 770);
    ctx.lineTo(cx + 30, cy - 770);
    ctx.closePath();
    ctx.fillStyle = '#facc15';
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    const markMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });

    const markMesh = new THREE.Mesh(new THREE.CircleGeometry(5.1, 64), markMat);
    markMesh.rotation.x = -Math.PI / 2;
    markMesh.position.y = 0.082;
    group.add(markMesh);

    // 3. Physical Recessed Aviation Perimeter Lights (12 green perimeter runway LEDs)
    const numLights = 12;
    const lightRadius = 4.9;
    const lightGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.06, 12);
    const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    for (let i = 0; i < numLights; i++) {
      const angle = (i * 2 * Math.PI) / numLights;
      const lx = Math.cos(angle) * lightRadius;
      const lz = Math.sin(angle) * lightRadius;

      const base = new THREE.Mesh(lightGeo, fixtureMat);
      base.position.set(lx, 0.09, lz);
      group.add(base);

      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), greenLedMat);
      lens.position.set(lx, 0.13, lz);
      group.add(lens);
    }

    return { group };
  }
}



