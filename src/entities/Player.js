import * as THREE from 'three';
import { MathUtils } from '../utils/MathUtils.js';

export class Player {
  constructor(camera, physics) {
    this.camera = camera;
    this.physics = physics;

    this.position = new THREE.Vector3(0, 0, 15);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.baseSpeed = 6.5;
    this.sprintSpeed = 9.8;
    this.isGrounded = true;

    // Camera parameters
    this.yaw = 0;
    this.pitch = 0.22;
    this.cameraDistance = 4.5;
    this.cameraHeight = 2.1;

    // Inventory & Loot System (Max 10 Weight units)
    this.maxWeight = 10;
    this.carriedLoot = [];
    this.carriedWeight = 0;
    this.carriedValue = 0;
    this.securedValue = 0;
    this.totalItemsCollectedCount = 0;

    // Keycards
    this.keycards = new Set();

    // 3D Visual Mesh & Nametag
    this.playerName = 'CYBER_GHOST';
    this.mesh = this.createPlayerMesh();
    this.nametagSprite = this.createNametagSprite(this.playerName, 'OPERATIVE 01', '#00f0ff');
    this.mesh.add(this.nametagSprite);
    this.mesh.position.copy(this.position);
  }

  createPlayerMesh() {
    const group = new THREE.Group();

    // ── Material Palette ──────────────────────────────────────────────
    // Dark charcoal suit jacket
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.75, metalness: 0.05 });
    // Slightly lighter trousers
    const trouserMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.0 });
    // Black balaclava / skin
    const balaclava = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.0 });
    // White shirt visible under jacket collar
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.8, metalness: 0.0 });
    // Dark oxblood red tie
    const tieMat = new THREE.MeshStandardMaterial({ color: 0x6b0f0f, roughness: 0.7, metalness: 0.0 });
    // Dark leather shoes
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0x1a0e08, roughness: 0.6, metalness: 0.1 });
    // Light leather shoe sole
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1a, roughness: 0.9, metalness: 0.0 });
    // Gloves — dark tactical
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85, metalness: 0.0 });
    // Backpack — plain black duffel
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.85, metalness: 0.0 });
    // LED indicator on bag
    const packLedMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    this.packLedMat = packLedMat;
    // Eyes — white strip on balaclava
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xdddddd });
    // Dummy coreGlowMat so animation code still works without crashing
    const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
    this.coreGlowMat = null; // disabled — no reactor on a human

    // ── TORSO GROUP ───────────────────────────────────────────────────
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.9;
    group.add(torsoGroup);
    this.torsoGroup = torsoGroup;

    // Jacket body
    const jacket = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.3), suitMat);
    torsoGroup.add(jacket);

    // White shirt collar peek
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.06), shirtMat);
    collar.position.set(0, 0.29, 0.14);
    torsoGroup.add(collar);

    // Tie
    const tieKnot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), tieMat);
    tieKnot.position.set(0, 0.24, 0.17);
    torsoGroup.add(tieKnot);

    const tieFront = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.28, 0.03), tieMat);
    tieFront.position.set(0, 0.06, 0.17);
    torsoGroup.add(tieFront);

    // Jacket lapels (two angled panels)
    const lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.04), suitMat);
    lapelL.position.set(-0.1, 0.18, 0.16);
    lapelL.rotation.z = 0.25;
    torsoGroup.add(lapelL);
    const lapelR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.04), suitMat);
    lapelR.position.set(0.1, 0.18, 0.16);
    lapelR.rotation.z = -0.25;
    torsoGroup.add(lapelR);

    // Belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.07, 0.32), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6 }));
    belt.position.y = -0.30;
    torsoGroup.add(belt);
    const beltBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.05), new THREE.MeshStandardMaterial({ color: 0x888877, metalness: 0.8, roughness: 0.3 }));
    beltBuckle.position.set(0, -0.30, 0.18);
    torsoGroup.add(beltBuckle);

    // ── HEAD GROUP ────────────────────────────────────────────────────
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.48, 0);
    torsoGroup.add(headGroup);

    // Head — round-ish box (balaclava covered)
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.34), balaclava);
    headMesh.position.y = 0.12;
    headGroup.add(headMesh);

    // Ear bumps
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.06), balaclava);
    earL.position.set(-0.2, 0.12, 0);
    headGroup.add(earL);
    const earR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.06), balaclava);
    earR.position.set(0.2, 0.12, 0);
    headGroup.add(earR);

    // Eye slit (horizontal white strip across balaclava)
    const eyeSlit = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.03), eyeMat);
    eyeSlit.position.set(0, 0.16, 0.18);
    headGroup.add(eyeSlit);

    // Small earpiece on right ear
    const earpiece = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }));
    earpiece.rotation.z = Math.PI / 2;
    earpiece.position.set(0.22, 0.08, 0.02);
    headGroup.add(earpiece);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), balaclava);
    neck.position.set(0, 0, 0);
    headGroup.add(neck);

    // ── LEFT ARM (pivot at shoulder) ──────────────────────────────────
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.33, 1.22, 0);
    group.add(leftArmGroup);
    this.leftArmGroup = leftArmGroup;

    // Shoulder rounding
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), suitMat);
    leftArmGroup.add(shoulderL);

    // Upper arm (sleeve)
    const upperArmL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.15), suitMat);
    upperArmL.position.set(0, -0.18, 0);
    leftArmGroup.add(upperArmL);

    // Forearm (sleeve)
    const foreArmL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.13), suitMat);
    foreArmL.position.set(0, -0.44, 0);
    leftArmGroup.add(foreArmL);

    // Glove / hand
    const handL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.1), gloveMat);
    handL.position.set(0, -0.60, 0);
    leftArmGroup.add(handL);

    // ── RIGHT ARM (pivot at shoulder) ─────────────────────────────────
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.33, 1.22, 0);
    group.add(rightArmGroup);
    this.rightArmGroup = rightArmGroup;

    const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), suitMat);
    rightArmGroup.add(shoulderR);

    const upperArmR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.15), suitMat);
    upperArmR.position.set(0, -0.18, 0);
    rightArmGroup.add(upperArmR);

    const foreArmR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.13), suitMat);
    foreArmR.position.set(0, -0.44, 0);
    rightArmGroup.add(foreArmR);

    const handR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.1), gloveMat);
    handR.position.set(0, -0.60, 0);
    rightArmGroup.add(handR);

    // ── LEFT LEG (pivot at hip) ───────────────────────────────────────
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.14, 0.65, 0);
    group.add(leftLegGroup);
    this.leftLegGroup = leftLegGroup;

    const thighL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.18), trouserMat);
    thighL.position.y = -0.16;
    leftLegGroup.add(thighL);

    const shinL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.30, 0.16), trouserMat);
    shinL.position.y = -0.47;
    leftLegGroup.add(shinL);

    // Dress shoe
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.28), shoesMat);
    shoeL.position.set(0, -0.66, 0.05);
    leftLegGroup.add(shoeL);
    const soleL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.29), soleMat);
    soleL.position.set(0, -0.71, 0.05);
    leftLegGroup.add(soleL);

    // ── RIGHT LEG (pivot at hip) ──────────────────────────────────────
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.14, 0.65, 0);
    group.add(rightLegGroup);
    this.rightLegGroup = rightLegGroup;

    const thighR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.18), trouserMat);
    thighR.position.y = -0.16;
    rightLegGroup.add(thighR);

    const shinR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.30, 0.16), trouserMat);
    shinR.position.y = -0.47;
    rightLegGroup.add(shinR);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.28), shoesMat);
    shoeR.position.set(0, -0.66, 0.05);
    rightLegGroup.add(shoeR);
    const soleR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.29), soleMat);
    soleR.position.set(0, -0.71, 0.05);
    rightLegGroup.add(soleR);

    // ── DUFFEL BAG (backpack) ─────────────────────────────────────────
    const backpackGroup = new THREE.Group();
    backpackGroup.position.set(0, 0.02, -0.22);
    torsoGroup.add(backpackGroup);
    this.backpackGroup = backpackGroup;

    // Main bag body
    const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.22), bagMat);
    backpackGroup.add(packBody);

    // Bag stitching lines
    const stitchH = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x333333 }));
    stitchH.position.set(0, 0, -0.12);
    backpackGroup.add(stitchH);

    // Shoulder straps (two vertical bands on back)
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.04), new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.9 }));
    strapL.position.set(-0.12, 0, 0.12);
    torsoGroup.add(strapL);
    const strapR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.04), new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.9 }));
    strapR.position.set(0.12, 0, 0.12);
    torsoGroup.add(strapR);

    // LED indicator strip on bag
    for (let i = 0; i < 3; i++) {
      const ledBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.03), packLedMat);
      ledBar.position.set(0, 0.1 - i * 0.09, -0.13);
      backpackGroup.add(ledBar);
    }

    return group;
  }



  update(delta, input, time) {
    const dt = Math.min(delta, 0.05); // Prevent tunneling leaps during lag spikes or tab defocus

    // 1. Mouse Look & Gesture Turning
    const mouseDelta = input.consumeMouseDelta();
    this.yaw -= mouseDelta.x;
    this.pitch = MathUtils.clamp(this.pitch - mouseDelta.y, -0.5, 0.8);

    // 2. Movement
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (input.keys.forward) moveDir.add(forward);
    if (input.keys.backward) moveDir.sub(forward);
    if (input.keys.right) moveDir.add(right);
    if (input.keys.left) moveDir.sub(right);

    const isMoving = moveDir.lengthSq() > 0.001;
    if (isMoving) {
      moveDir.normalize();
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.mesh.rotation.y = targetAngle;
    }

    const currentSpeed = input.keys.sprint ? this.sprintSpeed : this.baseSpeed;

    if (isMoving) {
      this.velocity.x = moveDir.x * currentSpeed;
      this.velocity.z = moveDir.z * currentSpeed;
    } else {
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
    }

    // Gravity
    this.velocity.y += this.physics.gravity * dt;

    // 4. Update Position with separated axis resolution (gold standard for sliding along walls & solid obstacles)
    // X Movement & Collision
    this.position.x += this.velocity.x * dt;
    this.physics.resolveCollisions(this.position, 0.45, 1.8, 'x');

    // Z Movement & Collision
    this.position.z += this.velocity.z * dt;
    this.physics.resolveCollisions(this.position, 0.45, 1.8, 'z');

    // Y Movement & Gravity
    this.position.y += this.velocity.y * dt;

    // 5. Floor Grounding
    const groundY = this.physics.getGroundHeightAt(this.position.x, this.position.z, this.position.y);
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // 6. Final safety check against any remaining wall/prop overlaps
    this.physics.resolveCollisions(this.position, 0.45, 1.8);

    // Hard boundary clamping: Inner walkable boundary of facility outer perimeter walls
    // Facility outer walls: X in [-16.5, 16.5] (1m thick, inner edge at ±16.0), Z in [-22, 22] (1m thick, inner edge at ±21.5)
    // With player radius 0.45, safe bounds are X: [-15.5, 15.5], Z: [-21.0, 21.0]
    this.position.x = MathUtils.clamp(this.position.x, -15.5, 15.5);
    this.position.z = MathUtils.clamp(this.position.z, -21.0, 21.0);
    this.position.y = Math.max(-8.0, this.position.y);

    this.mesh.position.copy(this.position);

    // 7. Dynamic Running & Idle Animation
    if (isMoving && this.isGrounded) {
      const freq = input.keys.sprint ? 12.5 : 8.5;
      const legSwing = Math.sin(time * freq) * 0.65;
      const armSwing = Math.sin(time * freq) * 0.55;
      const bob = Math.abs(Math.sin(time * freq)) * 0.06;

      if (this.leftLegGroup) this.leftLegGroup.rotation.x = legSwing;
      if (this.rightLegGroup) this.rightLegGroup.rotation.x = -legSwing;
      if (this.leftArmGroup) this.leftArmGroup.rotation.x = -armSwing;
      if (this.rightArmGroup) this.rightArmGroup.rotation.x = armSwing;
      if (this.torsoGroup) this.torsoGroup.position.y = 0.95 + bob;
    } else {
      // Idle Breathing
      const idleBob = Math.sin(time * 2.5) * 0.015;
      if (this.leftLegGroup) this.leftLegGroup.rotation.x = 0;
      if (this.rightLegGroup) this.rightLegGroup.rotation.x = 0;
      if (this.leftArmGroup) this.leftArmGroup.rotation.x = Math.sin(time * 2.0) * 0.05;
      if (this.rightArmGroup) this.rightArmGroup.rotation.x = -Math.sin(time * 2.0) * 0.05;
      if (this.torsoGroup) this.torsoGroup.position.y = 0.95 + idleBob;
    }

    // Update Backpack LED color based on weight ratio
    if (this.packLedMat) {
      const weightRatio = this.carriedWeight / this.maxWeight;
      if (weightRatio >= 0.9) {
        this.packLedMat.color.setHex(0xff0055); // Red warning
      } else if (weightRatio >= 0.6) {
        this.packLedMat.color.setHex(0xffd700); // Gold caution
      } else {
        this.packLedMat.color.setHex(0x00ff88); // Safe green
      }
    }

    // Visor / Reactor core glow — breathing pulse between two shades
    if (this.coreGlowMat) {
      const pulse = (Math.sin(time * 2.2) * 0.5 + 0.5); // 0..1
      const r = Math.round(0x00 + pulse * 0x00);
      const g = Math.round(0xcc + pulse * 0x33);
      const b = Math.round(0xcc + pulse * 0x33);
      this.coreGlowMat.color.setRGB(r / 255, g / 255, b / 255);
    }

    // Sprint forward lean on torso
    if (this.torsoGroup) {
      const targetLean = (isMoving && input.keys.sprint) ? -0.1 : 0;
      this.torsoGroup.rotation.x = this.torsoGroup.rotation.x + (targetLean - this.torsoGroup.rotation.x) * 0.12;
    }

    // 8. Update Third-Person Camera (with anti-wall clipping)
    this.updateCamera();
  }

  updateCamera() {
    const behindX = Math.sin(this.yaw);
    const behindZ = Math.cos(this.yaw);
    const camDist = this.cameraDistance;

    // Desired camera position sitting behind player
    const desiredX = this.position.x + behindX * camDist * Math.cos(this.pitch * 0.5);
    let desiredY = this.position.y + this.cameraHeight - Math.sin(this.pitch) * 1.5;
    const desiredZ = this.position.z + behindZ * camDist * Math.cos(this.pitch * 0.5);

    // Ceiling and floor bounds clamp for camera Y based on current elevation
    const curY = this.position.y;
    let floorY = -8;
    let ceilY = Infinity;
    if (curY >= 12) {
      floorY = 16;
      ceilY = Infinity; // Rooftop open sky
    } else if (curY >= 4) {
      floorY = 8;
      ceilY = 13.7; // Second floor ceiling at 14.0
    } else if (curY >= -4) {
      floorY = 0;
      ceilY = 5.7;  // Ground floor ceiling at 6.0
    } else {
      floorY = -8;
      ceilY = -2.3; // Underground ceiling at -2.0
    }
    desiredY = MathUtils.clamp(desiredY, floorY + 0.35, ceilY);

    const desiredCamPos = new THREE.Vector3(desiredX, desiredY, desiredZ);

    // Focus pivot at player upper chest / head
    const pivot = new THREE.Vector3(this.position.x, this.position.y + 1.5, this.position.z);
    const camRay = new THREE.Vector3().subVectors(desiredCamPos, pivot);
    const fullDist = camRay.length();

    if (fullDist > 0.05) {
      const rayDir = camRay.clone().normalize();
      const hitDist = this.physics.raycastColliders(pivot, rayDir, fullDist);

      if (hitDist !== null) {
        // Wall or obstacle obstruction detected! Pull camera in front of the wall
        const safeDist = Math.max(0.35, hitDist - 0.28);
        const safeCamPos = pivot.clone().addScaledVector(rayDir, safeDist);
        this.camera.position.copy(safeCamPos);
      } else {
        this.camera.position.copy(desiredCamPos);
      }
    } else {
      this.camera.position.copy(desiredCamPos);
    }

    // Look target in front of player, elevated/lowered by mouse pitch
    const lookDist = 6.0;
    const lookX = this.position.x - behindX * lookDist;
    const lookY = this.position.y + 1.2 + Math.sin(this.pitch) * lookDist;
    const lookZ = this.position.z - behindZ * lookDist;

    this.camera.lookAt(lookX, lookY, lookZ);
  }

  useElevator(targetPosition) {
    this.position.copy(targetPosition);
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);
    this.updateCamera();
  }

  canCarry(weight) {
    return this.carriedWeight + weight <= this.maxWeight;
  }

  addLoot(lootItem) {
    if (!this.canCarry(lootItem.type.weight)) {
      return { success: false, reason: 'TOO_HEAVY' };
    }

    this.carriedLoot.push(lootItem);
    this.carriedWeight += lootItem.type.weight;
    this.carriedValue += lootItem.type.value;
    this.totalItemsCollectedCount++;
    lootItem.collect();

    return { success: true, item: lootItem };
  }

  dropLoot(index) {
    if (index < 0 || index >= this.carriedLoot.length) return null;
    const [item] = this.carriedLoot.splice(index, 1);
    this.carriedWeight = Math.max(0, this.carriedWeight - item.type.weight);
    this.carriedValue = Math.max(0, this.carriedValue - item.type.value);

    // Drop slightly forward in front of player at proper floor height
    const forwardOffset = new THREE.Vector3(0, 0, -1.8).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    const dropPos = this.position.clone().add(forwardOffset);
    dropPos.y = this.position.y + 0.4;
    item.respawnAt(dropPos);

    return item;
  }

  addKeycard(type) {
    this.keycards.add(type);
  }

  hasKeycard(type) {
    return this.keycards.has('master') || this.keycards.has(type);
  }

  secureCarriedLoot() {
    const securedAmount = this.carriedValue;
    this.securedValue += this.carriedValue;
    this.carriedLoot = [];
    this.carriedWeight = 0;
    this.carriedValue = 0;
    return securedAmount;
  }

  loseCarriedLoot() {
    const lostAmount = this.carriedValue;
    this.carriedLoot = [];
    this.carriedWeight = 0;
    this.carriedValue = 0;
    return lostAmount;
  }

  getCurrentFloor() {
    if (this.position.y >= 12) return 'ROOFTOP (HELIPAD)';
    if (this.position.y >= 4) return 'SECOND FLOOR (LAB/VIP)';
    if (this.position.y >= -3) return 'GROUND FLOOR (LOBBY)';
    return 'UNDERGROUND (VAULT)';
  }

  // ── Floating 3D Nametag System ───────────────────────────────────
  createNametagSprite(name = 'CYBER_GHOST', role = 'OPERATIVE 01', color = '#00f0ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    this.nametagCanvas = canvas;
    this.nametagCtx = canvas.getContext('2d');
    this.nametagTexture = new THREE.CanvasTexture(canvas);
    this.nametagTexture.minFilter = THREE.LinearFilter;
    this.nametagTexture.magFilter = THREE.LinearFilter;

    this.renderNametagCanvas(name, role, color);

    const spriteMat = new THREE.SpriteMaterial({
      map: this.nametagTexture,
      transparent: true,
      depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    // Aspect ratio 512x128 = 4:1
    sprite.scale.set(1.6, 0.4, 1);
    sprite.position.set(0, 2.28, 0); // Positioned above the operative's head
    sprite.renderOrder = 999;
    return sprite;
  }

  renderNametagCanvas(name, role = 'OPERATIVE 01', accentColor = '#00f0ff') {
    const ctx = this.nametagCtx;
    if (!ctx) return;
    const w = 512;
    const h = 128;

    ctx.clearRect(0, 0, w, h);

    // Rounded badge background
    const r = 18;
    const pad = 10;
    ctx.beginPath();
    ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
    ctx.fillStyle = 'rgba(6, 11, 24, 0.88)';
    ctx.fill();

    // Glowing border
    ctx.lineWidth = 4;
    ctx.strokeStyle = accentColor;
    ctx.stroke();

    // Corner brackets / tech accents
    ctx.fillStyle = accentColor;
    ctx.fillRect(pad, pad, 14, 4);
    ctx.fillRect(pad, pad, 4, 14);
    ctx.fillRect(w - pad - 14, pad, 14, 4);
    ctx.fillRect(w - pad - 4, pad, 4, 14);
    ctx.fillRect(pad, h - pad - 4, 14, 4);
    ctx.fillRect(pad, h - pad - 14, 4, 14);
    ctx.fillRect(w - pad - 14, h - pad - 4, 14, 4);
    ctx.fillRect(w - pad - 4, h - pad - 14, 4, 14);

    // Role text
    ctx.font = 'bold 22px "Share Tech Mono", monospace, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`⚡ ${role.toUpperCase()}`, w / 2, 20);

    // Operative Name text
    ctx.font = '900 36px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.fillText(name.toUpperCase(), w / 2, 78);
    ctx.shadowBlur = 0;

    if (this.nametagTexture) {
      this.nametagTexture.needsUpdate = true;
    }
  }

  setNametag(name, role = 'OPERATIVE 01', accentColor = '#00f0ff') {
    this.playerName = name;
    this.renderNametagCanvas(name, role, accentColor);
  }

  reset(startPosition = new THREE.Vector3(0, 0, 15), name) {
    this.position.copy(startPosition);
    this.velocity.set(0, 0, 0);
    this.carriedLoot = [];
    this.carriedWeight = 0;
    this.carriedValue = 0;
    this.securedValue = 0;
    this.totalItemsCollectedCount = 0;
    this.keycards.clear();
    this.yaw = 0;
    this.pitch = 0.25;
    this.mesh.position.copy(this.position);
    this.updateCamera();
    if (name) {
      this.setNametag(name);
    }
  }
}
