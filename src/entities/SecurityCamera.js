import * as THREE from 'three';

export class SecurityCamera {
  constructor(options = {}) {
    this.position = options.position || new THREE.Vector3(0, 4.5, 0);
    this.floorY = options.floorY !== undefined ? options.floorY : (this.position.y > 6.0 ? 8.0 : (this.position.y > -2.0 ? 0.0 : -8.0));
    this.baseAngle = options.baseAngle !== undefined ? options.baseAngle : 0;
    this.tiltAngle = options.tiltAngle || 0.65; // Tilt downward
    this.detectionRange = options.range || 12;
    this.fov = options.fov || Math.PI / 3.8; // ~48 deg detection cone

    // Smooth panning patrol sweep settings
    this.sweepAngle = options.sweepAngle !== undefined ? options.sweepAngle : (Math.PI * 0.55); // ~100 deg sweep arc
    this.sweepSpeed = options.sweepSpeed || 0.75; // Radians per second (~8s full cycle)
    this.sweepPhase = options.sweepPhase !== undefined ? options.sweepPhase : 0;
    this.sweepTimer = this.sweepPhase;

    this.detectionLevel = 0; // 0 to 1
    this.detectionRate = options.detectionRate || 0.25; // ~4.0s of continuous detection required before initiating lockdown
    this.decayRate = 0.5;
    this.state = 'safe';

    // Pre-calculated mathematical constants for zero-lag performance
    this.cosTilt = Math.cos(this.tiltAngle);
    this.sinTilt = Math.sin(this.tiltAngle);
    this.rangeSq = this.detectionRange * this.detectionRange;
    this.cosHalfFov = Math.cos(this.fov / 2);

    // Initial forward vector
    this.forwardDir = new THREE.Vector3(
      Math.sin(this.baseAngle) * this.cosTilt,
      -this.sinTilt,
      Math.cos(this.baseAngle) * this.cosTilt
    );

    this.mesh = this.createMesh();
    this.mesh.position.copy(this.position);
  }

  createMesh() {
    const group = new THREE.Group();

    // Ceiling mount base
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.3
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.25, 8), baseMat);
    group.add(base);

    // Moving Camera Head (rotates smoothly around Y during patrol sweep)
    this.head = new THREE.Group();
    this.head.position.y = -0.15;
    this.head.rotation.y = this.baseAngle;
    group.add(this.head);

    // Camera Body Box
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.65), baseMat);
    body.position.z = 0.2;
    body.rotation.x = this.tiltAngle;
    this.head.add(body);

    // Lens
    this.lensMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    this.lens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), this.lensMat);
    this.lens.rotation.x = Math.PI / 2 + this.tiltAngle;
    this.lens.position.set(0, -0.05, 0.55);
    this.head.add(this.lens);

    // Status LED indicator on side
    this.statusLedMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const statusLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this.statusLedMat);
    statusLed.position.set(0.21, 0.05, 0.2);
    this.head.add(statusLed);

    // Lightweight Volumetric Detection Cone Mesh (Basic Material, zero shadow / draw-call cost)
    const coneRadius = Math.tan(this.fov / 2) * this.detectionRange;
    const coneGeo = new THREE.ConeGeometry(coneRadius, this.detectionRange, 16, 1, true);
    coneGeo.translate(0, -this.detectionRange / 2, 0);
    coneGeo.rotateX(-Math.PI / 2);

    // Floor clipping plane: Prevents cone from penetrating through the floor slab into lower levels
    this.floorClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(this.floorY + 0.05));

    this.coneMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
      clippingPlanes: [this.floorClipPlane]
    });

    this.coneMesh = new THREE.Mesh(coneGeo, this.coneMat);
    this.coneMesh.rotation.x = this.tiltAngle;
    this.head.add(this.coneMesh);

    return group;
  }

  update(delta, time, playerPos, onAlarmTriggered) {
    // 1. Smooth Panning Sweep Motion (zero allocations, ultra-fast 60+ FPS)
    let speedMult = 1.0;
    if (this.state === 'detecting') {
      speedMult = 0.4; // Hesitates & focuses when spotting suspicious movement
    } else if (this.state === 'alert') {
      speedMult = 1.6; // Rapid alert sweep
    }

    this.sweepTimer += delta * this.sweepSpeed * speedMult;
    const sweepOffset = Math.sin(this.sweepTimer) * (this.sweepAngle / 2);
    const currentAngle = this.baseAngle + sweepOffset;

    // Rotate the 3D camera head
    if (this.head) {
      this.head.rotation.y = currentAngle;
    }

    // Update forward direction vector
    this.forwardDir.x = Math.sin(currentAngle) * this.cosTilt;
    this.forwardDir.y = -this.sinTilt;
    this.forwardDir.z = Math.cos(currentAngle) * this.cosTilt;

    // Floor Isolation Check: Cameras cannot see or render across floors (~6m height per floor)
    const isOnSameFloor = Math.abs(playerPos.y - this.floorY) <= 4.5;

    // Visibility: Only render camera / cone if player is on the same floor level
    if (this.mesh) {
      this.mesh.visible = isOnSameFloor;
    }

    if (!isOnSameFloor) {
      // Player is on another floor: smoothly decay detection and do not detect through floors
      this.detectionLevel = Math.max(0, this.detectionLevel - this.decayRate * delta);
      if (this.detectionLevel === 0 && this.state !== 'safe') {
        this.state = 'safe';
        this.coneMat.color.setHex(0x00ff88);
        this.lensMat.color.setHex(0x00ff88);
        if (this.statusLedMat) this.statusLedMat.color.setHex(0x00ff88);
        this.coneMat.opacity = 0.22;
      }
      return {
        level: this.detectionLevel,
        state: this.state
      };
    }

    // 2. Fast Detection Distance & Conical Math (Player is on the same floor)
    const dx = playerPos.x - this.position.x;
    const dy = playerPos.y - this.position.y;
    const dz = playerPos.z - this.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    let isPlayerDetected = false;

    if (distSq < this.rangeSq && distSq > 0.5) {
      const invDist = 1.0 / Math.sqrt(distSq);
      const toX = dx * invDist;
      const toY = dy * invDist;
      const toZ = dz * invDist;

      // Dot product with camera's current moving forward vector
      const dot = toX * this.forwardDir.x + toY * this.forwardDir.y + toZ * this.forwardDir.z;

      // Fast check against pre-calculated cosine of half FOV (replaces expensive Math.acos)
      if (dot >= this.cosHalfFov) {
        isPlayerDetected = true;
      }
    }

    // 3. Detection progress
    if (isPlayerDetected) {
      this.detectionLevel = Math.min(1, this.detectionLevel + this.detectionRate * delta);
    } else {
      this.detectionLevel = Math.max(0, this.detectionLevel - this.decayRate * delta);
    }

    // 4. Visual State Updates (Safe: Green -> Detecting: Yellow -> Alert: Red)
    if (this.detectionLevel >= 1) {
      if (this.state !== 'alert') {
        this.state = 'alert';
        this.coneMat.color.setHex(0xff0055);
        this.lensMat.color.setHex(0xff0055);
        if (this.statusLedMat) this.statusLedMat.color.setHex(0xff0055);
        this.coneMat.opacity = 0.5;
        if (onAlarmTriggered) onAlarmTriggered(this);
      }
    } else if (this.detectionLevel > 0.05) {
      if (this.state !== 'detecting') {
        this.state = 'detecting';
        this.coneMat.color.setHex(0xffd700);
        this.lensMat.color.setHex(0xffd700);
        if (this.statusLedMat) this.statusLedMat.color.setHex(0xffd700);
      }
      this.coneMat.opacity = 0.28 + this.detectionLevel * 0.15;
    } else {
      if (this.state !== 'safe') {
        this.state = 'safe';
        this.coneMat.color.setHex(0x00ff88);
        this.lensMat.color.setHex(0x00ff88);
        if (this.statusLedMat) this.statusLedMat.color.setHex(0x00ff88);
        this.coneMat.opacity = 0.22;
      }
    }

    return {
      level: this.detectionLevel,
      state: this.state
    };
  }
}
