import * as THREE from 'three';

export class LaserGrid {
  constructor(scene) {
    this.scene = scene;
    this.isDeactivated = false;
    this.tripCooldown = 0;

    // Timed beam state
    this.timedCycleTimer = 0;
    this.timedBeamState = 'ACTIVE'; // 'ACTIVE', 'WARNING', 'INACTIVE'
    this.timedCycleDurations = {
      ACTIVE: 3.6,
      WARNING: 0.8,
      INACTIVE: 2.4
    };

    // Z-span of the laser corridor in front of the vault door
    this.zMin = -16.4;
    this.zMax = -11.6;
    this.beamLength = this.zMax - this.zMin;
    this.centerZ = (this.zMin + this.zMax) / 2;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Common materials
    this.emitterMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.25
    });

    this.emitterLedMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    this.beamCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    this.beamGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Create 3D components
    this.createEmitterPillars();
    this.createLaserBeams();
    this.createHazardFloorLine();
    this.createOverrideTerminal();
  }

  createEmitterPillars() {
    // Left & Right Emitter Posts at zMin and zMax
    const postHeight = 3.6;
    const postGeo = new THREE.BoxGeometry(0.35, postHeight, 0.45);

    // Left Pillar (Z = -16.4)
    const leftPost = new THREE.Mesh(postGeo, this.emitterMetalMat);
    leftPost.position.set(3.6, -8.0 + postHeight / 2, this.zMin);
    this.group.add(leftPost);

    // Right Pillar (Z = -11.6)
    const rightPost = new THREE.Mesh(postGeo, this.emitterMetalMat);
    rightPost.position.set(3.6, -8.0 + postHeight / 2, this.zMax);
    this.group.add(rightPost);

    // Add glowing lens rings on each pillar for each beam height
    this.emitterLenses = [];
    const lensGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
    lensGeo.rotateX(Math.PI / 2);

    [-7.5, -6.7, -6.1, -7.2].forEach(yPos => {
      [this.zMin + 0.24, this.zMax - 0.24].forEach(zPos => {
        const lens = new THREE.Mesh(lensGeo, this.emitterLedMat);
        lens.position.set(3.6, yPos, zPos);
        this.group.add(lens);
        this.emitterLenses.push(lens);
      });
    });
  }

  createLaserBeams() {
    this.beams = [];

    // Cylinder aligned along Z axis (length along Z)
    const makeBeamMesh = (radiusCore, radiusGlow, length) => {
      const beamGroup = new THREE.Group();

      const coreGeo = new THREE.CylinderGeometry(radiusCore, radiusCore, length, 8);
      coreGeo.rotateX(Math.PI / 2);
      const core = new THREE.Mesh(coreGeo, this.beamCoreMat);
      beamGroup.add(core);

      const glowGeo = new THREE.CylinderGeometry(radiusGlow, radiusGlow, length, 8);
      glowGeo.rotateX(Math.PI / 2);
      const glow = new THREE.Mesh(glowGeo, this.beamGlowMat);
      beamGroup.add(glow);

      return { group: beamGroup, core, glow };
    };

    // Beam 1: Low fixed tripwire
    const b1 = makeBeamMesh(0.014, 0.048, this.beamLength);
    b1.group.position.set(3.3, -7.5, this.centerZ);
    this.group.add(b1.group);
    this.beams.push({
      mesh: b1,
      type: 'fixed',
      x: 3.3,
      y: -7.5,
      baseY: -7.5,
      isActive: true
    });

    // Beam 2: High fixed beam
    const b2 = makeBeamMesh(0.014, 0.048, this.beamLength);
    b2.group.position.set(3.5, -6.1, this.centerZ);
    this.group.add(b2.group);
    this.beams.push({
      mesh: b2,
      type: 'fixed',
      x: 3.5,
      y: -6.1,
      baseY: -6.1,
      isActive: true
    });

    // Beam 3: Oscillating mid beam (smooth vertical sweep)
    const b3 = makeBeamMesh(0.014, 0.048, this.beamLength);
    b3.group.position.set(3.7, -6.7, this.centerZ);
    this.group.add(b3.group);
    this.beams.push({
      mesh: b3,
      type: 'oscillating',
      x: 3.7,
      y: -6.7,
      baseY: -6.7,
      range: 0.55,
      speed: 1.5,
      phase: 0,
      isActive: true
    });

    // Beam 4: Pulsing timed beam (cycles Active -> Warning -> Inactive)
    const b4 = makeBeamMesh(0.015, 0.052, this.beamLength);
    b4.group.position.set(3.9, -7.2, this.centerZ);
    this.group.add(b4.group);
    this.beams.push({
      mesh: b4,
      type: 'timed',
      x: 3.9,
      y: -7.2,
      baseY: -7.2,
      isActive: true
    });

    this.timedBeam = this.beams[3];
  }

  createHazardFloorLine() {
    // Glowing neon red laser boundary line projected on the floor
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const lineGeo = new THREE.PlaneGeometry(0.12, this.beamLength);
    const lineMesh = new THREE.Mesh(lineGeo, lineMat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(3.3, -7.98, this.centerZ);
    this.group.add(lineMesh);
    this.hazardFloorLine = lineMesh;

    // Small laser hazard warning decal in front of the grid
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#ff0044';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    ctx.fillStyle = '#ff0044';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡ CLASS 4 INFRARED LASER GRID ⚡', 256, 44);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '22px monospace';
    ctx.fillText('LETHAL VOLTAGE • UNAUTHORIZED ACCESS PROHIBITED', 256, 88);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), signMat);
    signMesh.rotation.x = -Math.PI / 2;
    signMesh.rotation.z = Math.PI / 2;
    signMesh.position.set(2.4, -7.98, this.centerZ);
    this.group.add(signMesh);
  }

  renderTerminalScreen(isOffline = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = isOffline ? '#064e3b' : '#1e1035';
    ctx.fillRect(0, 0, 256, 160);

    ctx.strokeStyle = isOffline ? '#00ff88' : '#d946ef';
    ctx.lineWidth = 5;
    ctx.strokeRect(4, 4, 248, 152);

    ctx.fillStyle = isOffline ? '#00ff88' : '#d946ef';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isOffline ? '⚡ GRID OFFLINE ⚡' : '🟣 MASTER CLEARANCE', 128, 42);

    ctx.fillStyle = isOffline ? '#a7f3d0' : '#f5d0fe';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(isOffline ? 'ALL BEAMS DISABLED' : 'LASER GRID OVERRIDE', 128, 82);

    ctx.fillStyle = isOffline ? '#6ee7b7' : '#c084fc';
    ctx.font = '12px monospace';
    ctx.fillText(isOffline ? 'SAFE TO PROCEED' : 'SCAN MASTER KEY [E]', 128, 122);

    if (!this.terminalTexture) {
      this.terminalTexture = new THREE.CanvasTexture(canvas);
    } else {
      this.terminalTexture.image = canvas;
      this.terminalTexture.needsUpdate = true;
    }
  }

  createOverrideTerminal() {
    // Wall-mounted Cyber Terminal located on the wall beside the vault entrance
    this.terminal = {
      position: new THREE.Vector3(3.2, -8.0, -17.5),
      interactionRadius: 2.2,
      group: new THREE.Group()
    };
    this.terminal.group.position.copy(this.terminal.position);
    this.terminal.group.rotation.y = -Math.PI / 2;

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2
    });

    // Console stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.35), baseMat);
    stand.position.y = 0.6;
    this.terminal.group.add(stand);

    // Slanted screen console
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.3), baseMat);
    head.position.set(0, 1.35, 0.05);
    head.rotation.x = -0.35;
    this.terminal.group.add(head);

    // Terminal Screen Canvas Texture
    this.renderTerminalScreen(false);
    this.terminalScreenMat = new THREE.MeshBasicMaterial({ map: this.terminalTexture });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.32), this.terminalScreenMat);
    screen.position.set(0, 1.36, 0.21);
    screen.rotation.x = -0.35;
    this.terminal.group.add(screen);

    // Keycard Scanner Bezel
    const scannerMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const scannerSlot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.06), scannerMat);
    scannerSlot.position.set(0, 1.15, 0.18);
    this.terminal.group.add(scannerSlot);

    // Master Keycard Purple Reader Light
    this.scannerLedMat = new THREE.MeshBasicMaterial({ color: 0xd946ef });
    const scannerGlow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.015, 0.07), this.scannerLedMat);
    scannerGlow.position.set(0, 1.15, 0.19);
    this.terminal.group.add(scannerGlow);

    this.group.add(this.terminal.group);
  }

  update(delta, time, playerPos, onBreach) {
    if (this.tripCooldown > 0) {
      this.tripCooldown -= delta;
    }

    if (this.isDeactivated) {
      return;
    }

    // 1. Update Oscillating Beam
    for (const b of this.beams) {
      if (b.type === 'oscillating') {
        b.y = b.baseY + Math.sin(time * b.speed + b.phase) * b.range;
        b.mesh.group.position.y = b.y;
      }
    }

    // 2. Update Timed Pulsing Beam
    this.timedCycleTimer += delta;
    const dur = this.timedCycleDurations;

    if (this.timedBeamState === 'ACTIVE') {
      if (this.timedCycleTimer >= dur.ACTIVE) {
        this.timedBeamState = 'WARNING';
        this.timedCycleTimer = 0;
      }
      this.timedBeam.isActive = true;
      this.timedBeam.mesh.group.visible = true;
      this.timedBeam.mesh.glow.material.opacity = 0.45;
    } else if (this.timedBeamState === 'WARNING') {
      // Rapid flicker at 12Hz before turning off
      const flicker = Math.sin(this.timedCycleTimer * 40) > 0;
      this.timedBeam.mesh.group.visible = flicker;
      this.timedBeam.mesh.glow.material.opacity = flicker ? 0.8 : 0.1;
      this.timedBeam.isActive = flicker;

      if (this.timedCycleTimer >= dur.WARNING) {
        this.timedBeamState = 'INACTIVE';
        this.timedCycleTimer = 0;
        this.timedBeam.isActive = false;
        this.timedBeam.mesh.group.visible = false;
      }
    } else if (this.timedBeamState === 'INACTIVE') {
      this.timedBeam.isActive = false;
      this.timedBeam.mesh.group.visible = false;

      if (this.timedCycleTimer >= dur.INACTIVE) {
        this.timedBeamState = 'ACTIVE';
        this.timedCycleTimer = 0;
        this.timedBeam.isActive = true;
        this.timedBeam.mesh.group.visible = true;
        this.timedBeam.mesh.glow.material.opacity = 0.45;
      }
    }

    // 3. Collision Detection with Player
    if (!playerPos) return;

    const playerRadius = 0.42;
    const playerFootY = playerPos.y;
    const playerHeadY = playerPos.y + 1.8;

    // Check if player is within Z span of laser corridor
    if (playerPos.z < this.zMin - playerRadius || playerPos.z > this.zMax + playerRadius) {
      return;
    }

    for (const b of this.beams) {
      if (!b.isActive) continue;

      // Check distance along X
      const distToPlane = Math.abs(playerPos.x - b.x);
      if (distToPlane > playerRadius) continue;

      // Check if beam height cuts through player vertical body
      if (b.y >= playerFootY && b.y <= playerHeadY) {
        // Laser Breached!
        this.onBeamBreached(b, onBreach);
        break;
      }
    }
  }

  onBeamBreached(beam, onBreach) {
    // Flash beam white
    beam.mesh.core.material.color.setHex(0xffffff);
    beam.mesh.glow.material.color.setHex(0xffffff);
    beam.mesh.glow.material.opacity = 0.95;

    setTimeout(() => {
      beam.mesh.core.material.color.setHex(0xffffff);
      beam.mesh.glow.material.color.setHex(0xff0044);
      beam.mesh.glow.material.opacity = 0.45;
    }, 280);

    if (this.tripCooldown <= 0) {
      this.tripCooldown = 2.5; // Cooldown prevents spamming alarm
      if (onBreach) {
        onBreach();
      }
    }
  }

  deactivate() {
    this.isDeactivated = true;

    // Hide all beams
    this.beams.forEach(b => {
      b.isActive = false;
      b.mesh.group.visible = false;
    });

    // Turn lenses, screen, and scanner to safe green
    this.emitterLedMat.color.setHex(0x00ff88);
    if (this.scannerLedMat) this.scannerLedMat.color.setHex(0x00ff88);
    this.renderTerminalScreen(true);
    if (this.hazardFloorLine) {
      this.hazardFloorLine.material.color.setHex(0x00ff88);
      this.hazardFloorLine.material.opacity = 0.25;
    }
  }

  reset() {
    this.isDeactivated = false;
    this.tripCooldown = 0;
    this.timedCycleTimer = 0;
    this.timedBeamState = 'ACTIVE';

    this.beams.forEach(b => {
      b.isActive = true;
      b.mesh.group.visible = true;
    });

    this.emitterLedMat.color.setHex(0xff0044);
    if (this.scannerLedMat) this.scannerLedMat.color.setHex(0xd946ef);
    this.renderTerminalScreen(false);
    if (this.hazardFloorLine) {
      this.hazardFloorLine.material.color.setHex(0xff0044);
      this.hazardFloorLine.material.opacity = 0.75;
    }
  }
}
