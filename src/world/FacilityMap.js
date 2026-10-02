import * as THREE from 'three';
import { Props } from './Props.js';
import { LootItem } from '../entities/LootItem.js';
import { SecurityCamera } from '../entities/SecurityCamera.js';
import { LaserGrid } from '../entities/LaserGrid.js';
import { GlassCase } from '../entities/GlassCase.js';
import { InteractiveSafe } from '../entities/InteractiveSafe.js';

function createGridTexture(bgColor, lineColor, dotColor, size = 256, lineWidth = 3) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fill Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Grid border lines
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(0, 0, size, size);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, size - 16, size - 16);

  // Corner tech dots
  if (dotColor) {
    ctx.fillStyle = dotColor;
    const r = 4;
    ctx.beginPath();
    ctx.arc(8, 8, r, 0, Math.PI * 2);
    ctx.arc(size - 8, 8, r, 0, Math.PI * 2);
    ctx.arc(8, size - 8, r, 0, Math.PI * 2);
    ctx.arc(size - 8, size - 8, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createWallTexture(bgColor, lineColor, accentColor, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Subtle horizontal panel seam
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, size, size);

  ctx.beginPath();
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();

  // Tech accent strip
  if (accentColor) {
    ctx.fillStyle = accentColor;
    ctx.fillRect(12, 12, size - 24, 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Wood plank floor — horizontal planks with grain variation
function createWoodFloorTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const plankH = size / 6; // 6 planks per tile
  const plankColors = ['#8B6347', '#7A5538', '#96704F', '#7D5B3C', '#8E6645', '#7B5739'];

  for (let i = 0; i < 6; i++) {
    const y = i * plankH;
    const baseColor = plankColors[i % plankColors.length];
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, y, size, plankH - 1.5);

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.lineWidth = 0.8;
    for (let g = 0; g < 8; g++) {
      const gy = y + (g / 8) * plankH;
      ctx.beginPath();
      ctx.moveTo(0, gy + (Math.random() - 0.5) * 3);
      ctx.lineTo(size, gy + (Math.random() - 0.5) * 3);
      ctx.stroke();
    }

    // Subtle highlight on top of plank
    const grad = ctx.createLinearGradient(0, y, 0, y + plankH);
    grad.addColorStop(0, 'rgba(255,255,255,0.08)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.04)');
    grad.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, size, plankH - 1.5);

    // Plank gap line
    ctx.fillStyle = '#3d2b1a';
    ctx.fillRect(0, y + plankH - 1.5, size, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Modern large-format tile floor (light grey/beige corporate tiles)
function createModernTileTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Tile base — warm light concrete/beige
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#c0bdb8');
  bg.addColorStop(0.5, '#b8b5b0');
  bg.addColorStop(1, '#b0ada8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Subtle surface texture noise
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Grout lines — 2×2 tile grid
  ctx.strokeStyle = '#8a8782';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);
  ctx.beginPath();
  ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
  ctx.stroke();

  // Inner bevel highlight on each tile
  const tileSize = size / 2;
  for (let tx = 0; tx < 2; tx++) {
    for (let ty = 0; ty < 2; ty++) {
      const ox = tx * tileSize + 4;
      const oy = ty * tileSize + 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, tileSize - 8, tileSize - 8);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Dark concrete texture for underground
function createConcreteTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2a2825';
  ctx.fillRect(0, 0, size, size);
  // Noise spots
  for (let i = 0; i < 600; i++) {
    const alpha = Math.random() * 0.06;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  // Crack lines
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, size, size);
  ctx.beginPath();
  ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
  ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}


export class FacilityMap {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;

    this.doors = [];
    this.elevators = [];
    this.lootItems = [];
    this.keycardItems = [];
    this.cameras = [];
    this.extractionZones = [];
    this.propsList = [];

    this.switchA = null;
    this.switchB = null;
    this.vaultDoor = null;
    this.vaultPackageLoot = null;
    this.laserGrid = null;
    this.glassCases = [];
    this.safes = [];

    this.materials = this.createMaterials();
    this.buildMap();
  }

  createMaterials() {
    // Ground floor — warm oak wood planks
    const groundFloorTex = createWoodFloorTexture(512);
    groundFloorTex.repeat.set(10, 10);

    // 2nd floor — modern large format tiles
    const secondFloorTex = createModernTileTexture(512);
    secondFloorTex.repeat.set(8, 8);

    // Underground — dark raw concrete
    const ugFloorTex = createConcreteTexture(256);
    ugFloorTex.repeat.set(20, 20);

    // Rooftop — dark tarmac/concrete
    const roofFloorTex = createConcreteTexture(256);
    roofFloorTex.repeat.set(16, 16);

    // Grey ceiling — mid grey tile grid
    const ceilingTex = createGridTexture('#9ca3af', '#6b7280', null, 256, 2);
    ceilingTex.repeat.set(20, 20);

    // Walls — darker grey (charcoal-grey, clearly dark)
    const wallTex = createWallTexture('#4b5563', '#374151', 'rgba(56, 189, 248, 0.25)', 256);
    wallTex.repeat.set(4, 2);

    // Accent wall — slightly lighter charcoal
    const accentWallTex = createWallTexture('#6b7280', '#4b5563', 'rgba(0, 240, 255, 0.3)', 256);
    accentWallTex.repeat.set(4, 2);

    return {
      floorGround: new THREE.MeshStandardMaterial({
        map: groundFloorTex,
        roughness: 0.6,
        metalness: 0.0,
        side: THREE.DoubleSide
      }),
      floorSecond: new THREE.MeshStandardMaterial({
        map: secondFloorTex,
        roughness: 0.4,
        metalness: 0.05,
        side: THREE.DoubleSide
      }),
      floorUnderground: new THREE.MeshStandardMaterial({
        map: ugFloorTex,
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide
      }),
      floorRooftop: new THREE.MeshStandardMaterial({
        map: roofFloorTex,
        roughness: 0.9,
        metalness: 0.0,
        side: THREE.DoubleSide
      }),
      ceiling: new THREE.MeshStandardMaterial({
        map: ceilingTex,
        roughness: 0.7,
        metalness: 0.05,
        side: THREE.DoubleSide
      }),
      wallMain: new THREE.MeshStandardMaterial({
        map: wallTex,
        roughness: 0.6,
        metalness: 0.05
      }),
      wallAccent: new THREE.MeshStandardMaterial({
        map: accentWallTex,
        roughness: 0.5,
        metalness: 0.1
      }),
      glass: new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45
      }),
      lightStripCyan: new THREE.MeshBasicMaterial({ color: 0x00f0ff }),
      lightStripGold: new THREE.MeshBasicMaterial({ color: 0xffd700 })
    };
  }



  buildMap() {
    this.buildFloorsAndCeilings();
    this.buildGroundFloor();
    this.buildSecondFloor();
    this.buildUndergroundFloor();
    this.buildRooftop();
    this.buildElevators();
    this.spawnLootAndKeycards();
    this.spawnSecurityCameras();
    this.spawnExtractionZones();
    this.buildPolishDetails();
  }

  // ─── POLISH PASS: Corridor strips, baseboards, skyline, vault lights ──────
  buildPolishDetails() {
    const stripMat = this.materials.lightStripCyan;
    const goldMat  = this.materials.lightStripGold;

    // ---- Corridor ceiling neon strips (long glowing tubes overhead) ----
    // Ground floor: central corridor (X -4.5..4.5, Z -22..22)
    const corridorStripGnd = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 44), stripMat);
    corridorStripGnd.position.set(0, 5.9, 0);
    this.scene.add(corridorStripGnd);

    // 2nd floor corridor
    const corridorStrip2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 44), stripMat);
    corridorStrip2.position.set(0, 13.9, 0);
    this.scene.add(corridorStrip2);

    // Underground corridor
    const corridorStripUG = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 44), new THREE.MeshBasicMaterial({ color: 0xc084fc }));
    corridorStripUG.position.set(0, -2.05, 0);
    this.scene.add(corridorStripUG);

    // ---- Baseboard neon accent strips at floor level along outer corridor walls ----
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x00c8dd });
    // Ground floor east/west corridors (Z direction)
    [[-4.4, 0], [4.4, 0]].forEach(([x, y]) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 44), baseMat);
      base.position.set(x, y + 0.04, 0);
      this.scene.add(base);
    });
    // 2nd floor
    [[-4.4, 8], [4.4, 8]].forEach(([x, y]) => {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 44), baseMat);
      base.position.set(x, y + 0.04, 0);
      this.scene.add(base);
    });

    // ---- Rooftop: Cyberpunk sky backdrop + city skyline silhouettes ----
    const skyColor = new THREE.MeshBasicMaterial({ color: 0x06090f, side: THREE.BackSide });
    const skyDome = new THREE.Mesh(new THREE.SphereGeometry(180, 16, 8), skyColor);
    skyDome.position.y = 16;
    this.scene.add(skyDome);

    // City skyline silhouette blocks in the far distance
    const silMat = new THREE.MeshBasicMaterial({ color: 0x0d1520 });
    const buildings = [
      { x: -80, h: 40, w: 10 }, { x: -65, h: 55, w: 8 }, { x: -50, h: 30, w: 12 },
      { x: -35, h: 62, w: 7 },  { x: -20, h: 45, w: 10 }, { x: 20, h: 48, w: 9 },
      { x: 35, h: 38, w: 11 },  { x: 50, h: 65, w: 6 },   { x: 65, h: 35, w: 13 },
      { x: 80, h: 52, w: 8 }
    ];
    buildings.forEach(b => {
      const sil = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, 2), silMat);
      sil.position.set(b.x, 16 + b.h / 2, -90);
      this.scene.add(sil);
    });
    // Side silhouettes
    const buildingsSide = [
      { z: -70, h: 44, w: 9 }, { z: -50, h: 58, w: 7 }, { z: -30, h: 35, w: 11 },
      { z: 30, h: 50, w: 8 },  { z: 50, h: 42, w: 10 }, { z: 70, h: 60, w: 7 }
    ];
    buildingsSide.forEach(b => {
      const sil = new THREE.Mesh(new THREE.BoxGeometry(2, b.h, b.w), silMat);
      sil.position.set(-90, 16 + b.h / 2, b.z);
      this.scene.add(sil);
    });

    // ---- Underground Vault: 4 dramatic PointLights (no shadows, low cost) ----
    const vaultLight1 = new THREE.PointLight(0xc084fc, 1.8, 18); // Purple glow
    vaultLight1.position.set(15, -5, -14);
    this.scene.add(vaultLight1);

    const vaultLight2 = new THREE.PointLight(0x00f0ff, 1.2, 14); // Cyan glow
    vaultLight2.position.set(-5, -5, -14);
    this.scene.add(vaultLight2);

    const vaultLight3 = new THREE.PointLight(0xffd700, 1.0, 12); // Gold glow inside vault
    vaultLight3.position.set(20, -5.5, -18);
    this.scene.add(vaultLight3);

    const vaultLight4 = new THREE.PointLight(0xff0055, 0.8, 10); // Red danger glow near vault door
    vaultLight4.position.set(5, -6, -12);
    this.scene.add(vaultLight4);
  }


  addWall(x, y, z, width, height, depth, material = this.materials.wallMain) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y + height / 2, z);
    this.scene.add(mesh);

    const halfW = width / 2;
    const halfD = depth / 2;
    const box = new THREE.Box3(
      new THREE.Vector3(x - halfW, y, z - halfD),
      new THREE.Vector3(x + halfW, y + height, z + halfD)
    );
    this.physics.addCollider(box);
    return mesh;
  }

  addDoor(options = {}) {
    const door = Props.createSecurityDoor(options);
    this.scene.add(door.group);
    this.doors.push(door);
    this.physics.addDoor(door);
    return door;
  }

  // Registers a prop in the scene and automatically adds a solid obstacle collider in Physics
  addSolidProp(prop, margin = 0.02) {
    const group = prop.group || prop;
    this.scene.add(group);
    if (prop.update) {
      this.propsList.push(prop);
    }

    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    const height = box.max.y - box.min.y;

    // Discrete floor heights: Underground (-8), Ground (0), Second Floor (8), Rooftop (16)
    const floorLevels = [-8, 0, 8, 16];
    const distToFloor = Math.min(...floorLevels.map(f => Math.abs(box.min.y - f)));

    // Only add solid colliders for ground/floor objects of substantial height (exclude flat floor rugs & ceiling fixtures)
    if (height > 0.22 && distToFloor <= 2.2) {
      const colBox = new THREE.Box3(
        new THREE.Vector3(box.min.x + margin, box.min.y, box.min.z + margin),
        new THREE.Vector3(box.max.x - margin, Math.min(box.max.y, box.min.y + 2.4), box.max.z - margin)
      );
      this.physics.addCollider(colBox);
    }
    return prop;
  }

  buildFloorsAndCeilings() {
    const w = 33.0; // Compact building width: X from -16.5 to +16.5
    const d = 44.0; // Compact building length: Z from -22.0 to +22.0

    // 1. Underground Floor (Y = -8) & Ceiling (Y = -2)
    const floorUG = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.materials.floorUnderground);
    floorUG.rotation.x = -Math.PI / 2;
    floorUG.position.y = -8;
    this.scene.add(floorUG);

    const ceilUG = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.materials.ceiling);
    ceilUG.rotation.x = Math.PI / 2;
    ceilUG.position.y = -2.0;
    this.scene.add(ceilUG);

    // 2. Ground Floor (Y = 0) & Ceiling (Y = 6.0)
    const floorGround = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.materials.floorGround);
    floorGround.rotation.x = -Math.PI / 2;
    floorGround.position.y = 0;
    this.scene.add(floorGround);

    const ceilGround = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.materials.ceiling);
    ceilGround.rotation.x = Math.PI / 2;
    ceilGround.position.y = 6.0;
    this.scene.add(ceilGround);

    // 3. Second Floor (Y = 8) & Ceiling (Y = 14.0)
    const floor2 = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.materials.floorSecond);
    floor2.rotation.x = -Math.PI / 2;
    floor2.position.y = 8;
    this.scene.add(floor2);

    const ceil2 = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.materials.ceiling);
    ceil2.rotation.x = Math.PI / 2;
    ceil2.position.y = 14.0;
    this.scene.add(ceil2);

    // 4. Rooftop (Y = 16) - Open sky
    const floorRoof = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.materials.floorRooftop);
    floorRoof.rotation.x = -Math.PI / 2;
    floorRoof.position.y = 16;
    this.scene.add(floorRoof);

    // Airtight Outer Perimeter Boundary Walls for Each Level (Height 6m per floor)
    const levels = [-8, 0, 8];
    levels.forEach(y => {
      this.addWall(0, y, 22, 33, 6, 1);     // North Outer Wall
      this.addWall(0, y, -22, 33, 6, 1);    // South Outer Wall
      this.addWall(-16.5, y, 0, 1, 6, 44);  // West Outer Wall (Room width = 12m)
      this.addWall(16.5, y, 0, 1, 6, 44);   // East Outer Wall (Room width = 12m)
    });
  }

  buildGroundFloor() {
    const y = 0;
    const h = 6.0;

    // --- GAPLESS CENTRAL CORRIDOR (West X = -4.5, East X = 4.5, Spanning Z: -22 to 22) ---
    // West Corridor Wall: Door at Z=12 (Security HQ), Door at Z=-12 (Storage Depot)
    this.addWall(-4.5, y, 17.9, 1, h, 8.2);        // Z: 13.8 to 22.0
    this.addWall(-4.5, y + 3.8, 12, 1, 2.2, 3.6);  // Lintel over Sec Door (Z: 10.2 to 13.8)
    this.addWall(-4.5, y, 0, 1, h, 20.4);          // Z: -10.2 to 10.2
    this.addWall(-4.5, y + 3.8, -12, 1, 2.2, 3.6); // Lintel over Storage Door (Z: -13.8 to -10.2)
    this.addWall(-4.5, y, -17.9, 1, h, 8.2);       // Z: -22.0 to -13.8

    // East Corridor Wall: Door at Z=12 (Garage), Door at Z=-12 (Admin Office)
    this.addWall(4.5, y, 17.9, 1, h, 8.2);         // Z: 13.8 to 22.0
    this.addWall(4.5, y + 3.8, 12, 1, 2.2, 3.6);   // Lintel over Garage Door (Z: 10.2 to 13.8)
    this.addWall(4.5, y, 0, 1, h, 20.4);           // Z: -10.2 to 10.2
    this.addWall(4.5, y + 3.8, -12, 1, 2.2, 3.6);  // Lintel over Admin Door (Z: -13.8 to -10.2)
    this.addWall(4.5, y, -17.9, 1, h, 8.2);        // Z: -22.0 to -13.8

    // Compact Room Divider Walls at Z = 0 (Width 12.0m per room)
    this.addWall(-10.5, y, 0, 12.0, h, 1); // West Divider (X: -16.5 to -4.5)
    this.addWall(10.5, y, 0, 12.0, h, 1);  // East Divider (X: 4.5 to 16.5)

    // --- 1. GRAND LOBBY & MAIN CORRIDOR ---
    // Corporate Identity Feature Wall behind reception desk
    const logoWall = Props.createCorporateLogoWall(new THREE.Vector3(0, y, 21.8), Math.PI);
    this.addSolidProp(logoWall);

    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.2, 1.2), this.materials.wallAccent);
    desk.position.set(0, y + 0.6, 18);
    this.scene.add(desk);
    this.physics.addBoxColliderFromMesh(desk);

    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(0, y, 19.2), Math.PI));

    // Security Screening Arch (Walkthrough Metal Detector / Biometric Scanner)
    this.addSolidProp(Props.createSecurityScreeningArch(new THREE.Vector3(0, y, 20.2), 0));

    this.addSolidProp(Props.createTurnstileBarrier(new THREE.Vector3(-1.8, y, 21.2), 0));
    this.addSolidProp(Props.createTurnstileBarrier(new THREE.Vector3(1.8, y, 21.2), 0));

    // Interactive Information Kiosk Pillar
    this.addSolidProp(Props.createInformationKiosk(new THREE.Vector3(-2.8, y, 10), Math.PI / 4));

    // Executive Area Rug under Lounge (Not solid)
    this.scene.add(Props.createExecutiveRug(new THREE.Vector3(0, y, 6), 5.2, 3.0, 0x0f172a, 0x00f0ff).group);

    this.addSolidProp(Props.createLoungeSofa(new THREE.Vector3(-2.4, y, 6), Math.PI / 2));
    this.addSolidProp(Props.createLoungeSofa(new THREE.Vector3(2.4, y, 6), -Math.PI / 2));
    this.addSolidProp(Props.createGlassCoffeeTable(new THREE.Vector3(0, y, 6)));

    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(-2.8, y, 14)));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(2.8, y, 14)));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(-2.8, y, -6)));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(2.8, y, -6)));

    // --- 2. SECURITY HQ [COMPACT 12m x 22m] (North-West, X: -16.5 to -4.5, Z: 0 to 22) ---
    this.addDoor({ position: new THREE.Vector3(-4.5, y, 12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(-4.5, y + 4.6, 12), 'SECURITY HQ', 0x38bdf8, Math.PI / 2).group);

    // Surveillance CCTV Video Wall on North Wall
    this.addSolidProp(Props.createSurveillanceVideoWall(new THREE.Vector3(-10.5, y, 21.7), 0));

    // Tactical Armory on West Wall
    this.addSolidProp(Props.createTacticalWeaponRack(new THREE.Vector3(-16.0, y, 18), Math.PI / 2));

    // Emergency First Aid & AED Station
    this.scene.add(Props.createEmergencyMedicalStation(new THREE.Vector3(-4.9, y, 18), -Math.PI / 2).group);

    // Workstations & Command Desks (All Solid)
    this.addSolidProp(Props.createTechDesk(new THREE.Vector3(-10.5, y, 16), Math.PI));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(-10.5, y, 14.8), 0));

    this.addSolidProp(Props.createTechDesk(new THREE.Vector3(-14.2, y, 11), Math.PI / 2));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(-13.0, y, 11), -Math.PI / 2));

    this.addSolidProp(Props.createTechDesk(new THREE.Vector3(-10.5, y, 6), 0));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(-10.5, y, 7.2), Math.PI));

    // 3 Server Racks along West wall
    for (let i = 0; i < 3; i++) {
      this.addSolidProp(Props.createServerRack(new THREE.Vector3(-16.0, y, 5 + i * 3)));
    }

    this.addSolidProp(Props.createWeaponGearLocker(new THREE.Vector3(-14.2, y, 21.4), 0));
    this.addSolidProp(Props.createWhiteboard(new THREE.Vector3(-6.8, y, 21.7), 0));
    this.addSolidProp(Props.createFilingCabinet(new THREE.Vector3(-5.0, y, 21.4), 0));
    this.addSolidProp(Props.createWaterCooler(new THREE.Vector3(-5.0, y, 7)));

    // --- 3. STORAGE & SUPPLY DEPOT [BLUE KEYCARD] [COMPACT 12m x 22m] (South-West, X: -16.5 to -4.5, Z: -22 to 0) ---
    this.addDoor({ position: new THREE.Vector3(-4.5, y, -12), rotation: Math.PI / 2, type: 'blue' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(-4.5, y + 4.6, -12), 'STORAGE & DEPOT [BLUE]', 0x00f0ff, Math.PI / 2).group);

    // Overhead Industrial Gantry Crane along Ceiling
    this.scene.add(Props.createOverheadGantryCrane(y + 5.6, -10.5, -20, -2).group);

    // High-Bay Industrial Pallet Racks (All Solid)
    this.addSolidProp(Props.createWarehouseRack(new THREE.Vector3(-12.0, y, -21.4), 0));
    this.addSolidProp(Props.createWarehouseRack(new THREE.Vector3(-16.0, y, -15), Math.PI / 2));
    this.addSolidProp(Props.createWarehouseRack(new THREE.Vector3(-12.0, y, -0.6), Math.PI));

    // High-Security Caged Vault Enclosure (Structure rendered with open walk-in front)
    const cageVault = Props.createSecurityCageVault(new THREE.Vector3(-14.5, y, -8), Math.PI / 2);
    this.scene.add(cageVault.group);

    // Colliders ONLY for the three perimeter wire-mesh walls (West back, South side, North side)
    // The entire front entrance facing East (X >= -12.6) is completely open and unobstructed!
    this.physics.addCollider(new THREE.Box3(new THREE.Vector3(-16.5, y, -10.2), new THREE.Vector3(-16.0, y + 3.2, -5.8))); // Back mesh wall
    this.physics.addCollider(new THREE.Box3(new THREE.Vector3(-16.5, y, -10.2), new THREE.Vector3(-12.6, y + 3.2, -9.8))); // South mesh wall
    this.physics.addCollider(new THREE.Box3(new THREE.Vector3(-16.5, y, -6.2), new THREE.Vector3(-12.6, y + 3.2, -5.8))); // North mesh wall

    // Palletized Gold & Pallet Jack
    this.addSolidProp(Props.createVaultGoldPallet(new THREE.Vector3(-10.5, y, -8), 0));
    this.addSolidProp(Props.createPalletJack(new THREE.Vector3(-8.2, y, -8), -Math.PI / 2));

    // Logistics Desk & Crates
    this.addSolidProp(Props.createLogisticsDesk(new THREE.Vector3(-7.2, y, -15), Math.PI / 2));
    this.addSolidProp(Props.createIndustrialDrums(new THREE.Vector3(-7.0, y, -19), 3));
    this.addSolidProp(Props.createIndustrialDrums(new THREE.Vector3(-15.5, y, -11), 3));
    this.addSolidProp(Props.createCargoCrates(new THREE.Vector3(-15.5, y, -20.5), 0.2));
    this.addSolidProp(Props.createCargoCrates(new THREE.Vector3(-7.5, y, -4), -0.3));
    this.addSolidProp(Props.createWeaponGearLocker(new THREE.Vector3(-6.5, y, -21.4), 0));

    // --- 4. TACTICAL GARAGE [COMPACT 12m x 22m] (North-East, X: 4.5 to 16.5, Z: 0 to 22) ---
    this.addDoor({ position: new THREE.Vector3(4.5, y, 12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(4.5, y + 4.6, 12), 'GARAGE EXIT', 0xffd700, -Math.PI / 2).group);

    this.addSolidProp(Props.createArmoredVan(new THREE.Vector3(10.5, y, 8), 0));
    this.addSolidProp(Props.createHydraulicCarLift(new THREE.Vector3(11.0, y, 17), 0));

    // Mechanic Workbench & Tools along East Wall
    this.addSolidProp(Props.createMechanicWorkbench(new THREE.Vector3(15.8, y, 19), -Math.PI / 2));
    this.addSolidProp(Props.createRollingToolCart(new THREE.Vector3(15.8, y, 16.5), -Math.PI / 2));

    // Tactical Tire Stacks & Compressor
    this.addSolidProp(Props.createTireStack(new THREE.Vector3(16.0, y, 13), 4));
    this.addSolidProp(Props.createTireStack(new THREE.Vector3(16.0, y, 14.5), 3));
    this.addSolidProp(Props.createAirCompressor(new THREE.Vector3(15.8, y, 21.2), -Math.PI / 2));

    this.addSolidProp(Props.createCargoCrates(new THREE.Vector3(7.0, y, 19)));
    this.addSolidProp(Props.createFilingCabinet(new THREE.Vector3(5.0, y, 7), Math.PI / 2));

    // --- 5. ADMINISTRATIVE OFFICE BULLPEN [COMPACT 12m x 22m] (South-East, X: 4.5 to 16.5, Z: -22 to 0) ---
    this.addDoor({ position: new THREE.Vector3(4.5, y, -12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(4.5, y + 4.6, -12), 'ADMIN OFFICE', 0x38bdf8, -Math.PI / 2).group);

    // Global World Clocks on North feature wall
    this.scene.add(Props.createWallWorldClocks(new THREE.Vector3(10.5, y, -0.6), Math.PI).group);

    // Acoustic Cubicle Dividers
    this.addSolidProp(Props.createAcousticDividers(new THREE.Vector3(10.5, y, -12), 0, 7.5));
    this.addSolidProp(Props.createAcousticDividers(new THREE.Vector3(10.5, y, -8), Math.PI / 2, 2.4));
    this.addSolidProp(Props.createAcousticDividers(new THREE.Vector3(10.5, y, -16), Math.PI / 2, 2.4));

    // Workstation Pods (All Solid)
    this.addSolidProp(Props.createOfficeDesk(new THREE.Vector3(8.0, y, -8), 0));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(8.0, y, -6.8), Math.PI));

    this.addSolidProp(Props.createOfficeDesk(new THREE.Vector3(13.0, y, -8), 0));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(13.0, y, -6.8), Math.PI));

    this.addSolidProp(Props.createOfficeDesk(new THREE.Vector3(8.0, y, -16), 0));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(8.0, y, -14.8), Math.PI));

    this.addSolidProp(Props.createOfficeDesk(new THREE.Vector3(13.0, y, -16), 0));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(13.0, y, -14.8), Math.PI));

    // Huddle Table & Sideboards
    this.addSolidProp(Props.createHuddleTable(new THREE.Vector3(7.5, y, -4.5)));
    this.addSolidProp(Props.createOfficeCredenza(new THREE.Vector3(16.0, y, -9), -Math.PI / 2));
    this.addSolidProp(Props.createPaperShredderStation(new THREE.Vector3(16.0, y, -15.5), -Math.PI / 2));
    this.addSolidProp(Props.createPrinterStation(new THREE.Vector3(16.0, y, -12.5), -Math.PI / 2));
    this.addSolidProp(Props.createCoffeeStation(new THREE.Vector3(7.5, y, -21.4), 0));
    this.addSolidProp(Props.createFilingCabinet(new THREE.Vector3(16.0, y, -21.2), -Math.PI / 2));
    this.addSolidProp(Props.createFilingCabinet(new THREE.Vector3(16.0, y, -4), -Math.PI / 2));
    this.addSolidProp(Props.createWaterCooler(new THREE.Vector3(5.5, y, -4)));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(16.0, y, -7)));
  }

  buildSecondFloor() {
    const y = 8;
    const h = 6.0;

    // --- GAPLESS CENTRAL CORRIDOR WALLS (West X = -4.5, East X = 4.5, Spanning Z: -22 to 22) ---
    this.addWall(-4.5, y, 17.9, 1, h, 8.2);        // Z: 13.8 to 22.0
    this.addWall(-4.5, y + 3.8, 12, 1, 2.2, 3.6);  // Lintel over Lab Door (Z: 10.2 to 13.8)
    this.addWall(-4.5, y, 0, 1, h, 20.4);          // Z: -10.2 to 10.2
    this.addWall(-4.5, y + 3.8, -12, 1, 2.2, 3.6); // Lintel over Break Room Door (Z: -13.8 to -10.2)
    this.addWall(-4.5, y, -17.9, 1, h, 8.2);       // Z: -22.0 to -13.8

    this.addWall(4.5, y, 17.9, 1, h, 8.2);         // Z: 13.8 to 22.0
    this.addWall(4.5, y + 3.8, 12, 1, 2.2, 3.6);   // Lintel over VIP Door (Z: 10.2 to 13.8)
    this.addWall(4.5, y, 0, 1, h, 20.4);           // Z: -10.2 to 10.2
    this.addWall(4.5, y + 3.8, -12, 1, 2.2, 3.6);  // Lintel over Boardroom Door (Z: -13.8 to -10.2)
    this.addWall(4.5, y, -17.9, 1, h, 8.2);        // Z: -22.0 to -13.8

    // Compact Dividing Walls at Z = 0 (Width 12.0m per room)
    this.addWall(-10.5, y, 0, 12.0, h, 1); // West Divider (X: -16.5 to -4.5)
    this.addWall(10.5, y, 0, 12.0, h, 1);  // East Divider (X: 4.5 to 16.5)

    // --- 1. BIO-CYBER RESEARCH LAB [COMPACT 12m x 22m] (North-West, X: -16.5 to -4.5, Z: 0 to 22) ---
    this.addDoor({ position: new THREE.Vector3(-4.5, y, 12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(-4.5, y + 4.6, 12), 'RESEARCH LAB', 0x38bdf8, Math.PI / 2).group);

    // Biohazard Chemical Fume Hood & Containment Station on West wall
    this.addSolidProp(Props.createBiohazardFumeHood(new THREE.Vector3(-15.8, y, 6), Math.PI / 2));

    // High-Speed Centrifuge & DNA Analyzer Terminal
    this.addSolidProp(Props.createCentrifugeStation(new THREE.Vector3(-10.5, y, 5.8), Math.PI));

    // Cryogenic Liquid Nitrogen Storage Dewars
    this.addSolidProp(Props.createCryoDewars(new THREE.Vector3(-6.5, y, 6), 2));

    // Emergency Eye-Wash & Safety Decontamination Station
    this.scene.add(Props.createEmergencyEyeWashStation(new THREE.Vector3(-5.0, y, 16), -Math.PI / 2).group);

    // 3 Lab Stasis Pods along North wall (All Solid)
    this.addSolidProp(Props.createLabStasisPod(new THREE.Vector3(-14.5, y, 20.5)));
    this.addSolidProp(Props.createLabStasisPod(new THREE.Vector3(-10.5, y, 20.5)));
    this.addSolidProp(Props.createLabStasisPod(new THREE.Vector3(-6.5, y, 20.5)));

    // Lab Workbenches (All Solid)
    this.addSolidProp(Props.createLabWorkbench(new THREE.Vector3(-14.0, y, 10), 0));
    this.addSolidProp(Props.createLabWorkbench(new THREE.Vector3(-7.5, y, 10), 0));

    // Tech Desks with Chairs (All Solid)
    this.addSolidProp(Props.createTechDesk(new THREE.Vector3(-15.2, y, 15), Math.PI / 2));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(-14.0, y, 15), -Math.PI / 2));

    this.addSolidProp(Props.createTechDesk(new THREE.Vector3(-6.8, y, 15), -Math.PI / 2));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(-8.0, y, 15), Math.PI / 2));

    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(-5.5, y, 20.5)));

    // --- 2. BREAK ROOM & EMPLOYEE LOUNGE [COMPACT 12m x 22m] (South-West, X: -16.5 to -4.5, Z: -22 to 0) ---
    this.addDoor({ position: new THREE.Vector3(-4.5, y, -12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(-4.5, y + 4.6, -12), 'BREAK ROOM & LOUNGE', 0x00ff88, Math.PI / 2).group);

    // Retro Cyberpunk Arcade Cabinet ("CYBER HEIST")
    this.addSolidProp(Props.createArcadeCabinet(new THREE.Vector3(-15.8, y, -14), Math.PI / 2));

    // Modern Modular Kitchenette Counter with Sink & Microwave
    this.addSolidProp(Props.createBreakRoomKitchenette(new THREE.Vector3(-12.5, y, -21.4), 0));
    this.addSolidProp(Props.createCoffeeStation(new THREE.Vector3(-7.5, y, -21.4), 0));

    // Dining Tables with Chairs (All Solid)
    this.addSolidProp(Props.createDiningTable(new THREE.Vector3(-13.0, y, -10)));
    this.addSolidProp(Props.createDiningTable(new THREE.Vector3(-8.5, y, -10)));

    // Vending Machines on West wall
    this.addSolidProp(Props.createVendingMachine(new THREE.Vector3(-15.8, y, -18), Math.PI / 2));
    this.addSolidProp(Props.createVendingMachine(new THREE.Vector3(-15.8, y, -6), Math.PI / 2));

    // Lounge Area Rug & Coffee Table
    this.scene.add(Props.createExecutiveRug(new THREE.Vector3(-8.5, y, -16), 3.4, 2.6, 0x064e3b, 0x10b981).group);
    this.addSolidProp(Props.createGlassCoffeeTable(new THREE.Vector3(-8.5, y, -16)));
    this.addSolidProp(Props.createLoungeSofa(new THREE.Vector3(-6.5, y, -16), -Math.PI / 2));

    this.addSolidProp(Props.createWaterCooler(new THREE.Vector3(-15.8, y, -4)));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(-5.5, y, -21.0)));

    // --- 3. VIP EXECUTIVE SUITE [RED KEYCARD] [COMPACT 12m x 22m] (North-East, X: 4.5 to 16.5, Z: 0 to 22) ---
    this.addDoor({ position: new THREE.Vector3(4.5, y, 12), rotation: Math.PI / 2, type: 'red' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(4.5, y + 4.6, 12), 'VIP SUITE [RED]', 0xff0055, -Math.PI / 2).group);

    // Executive Area Rug under CEO Desk
    this.scene.add(Props.createExecutiveRug(new THREE.Vector3(10.5, y, 18), 4.8, 3.8, 0x450a0a, 0xffd700).group);

    // Luxury Brass & Smoked Glass Executive Bar Cart
    this.addSolidProp(Props.createExecutiveBarCart(new THREE.Vector3(15.8, y, 15), -Math.PI / 2));

    // Tall Executive Trophy & Patent Award Display Bookcase
    this.addSolidProp(Props.createTrophyBookcase(new THREE.Vector3(15.8, y, 18.5), -Math.PI / 2));

    // Modern Designer Sweeping Arc Floor Lamp
    this.addSolidProp(Props.createDesignerArcLamp(new THREE.Vector3(6.5, y, 16), 0));

    // Executive CEO Desk & Chairs (All Solid)
    this.addSolidProp(Props.createExecutiveDesk(new THREE.Vector3(10.5, y, 18), Math.PI));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(10.5, y, 19.5), 0));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(9.0, y, 16.5), 0));
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(12.0, y, 16.5), 0));

    this.addSolidProp(Props.createWhiteboard(new THREE.Vector3(10.5, y, 21.7), 0));
    this.addSolidProp(Props.createLoungeSofa(new THREE.Vector3(6.5, y, 8), Math.PI / 2, 0xff0055));
    this.addSolidProp(Props.createFilingCabinet(new THREE.Vector3(15.8, y, 11), -Math.PI / 2));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(15.8, y, 5)));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(6.0, y, 21)));

    // --- 4. CORPORATE BOARDROOM [COMPACT 12m x 22m] (South-East, X: 4.5 to 16.5, Z: -22 to 0) ---
    this.addDoor({ position: new THREE.Vector3(4.5, y, -12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(4.5, y + 4.6, -12), 'CORPORATE BOARDROOM', 0x38bdf8, -Math.PI / 2).group);

    // Executive Navy & Cyan Boardroom Area Rug under Conference Table
    this.scene.add(Props.createExecutiveRug(new THREE.Vector3(10.5, y, -12.0), 4.6, 8.8, 0x0f172a, 0x00f0ff).group);

    // Conference Table (Rotated along Z-axis so it runs gracefully down the length of the room!)
    this.addSolidProp(Props.createBoardroomTable(new THREE.Vector3(10.5, y, -12.0), Math.PI / 2));

    // 8 Executive Leather Chairs neatly aligned along the long sides of the table
    const chairZOffsets = [-2.1, -0.7, 0.7, 2.1];
    chairZOffsets.forEach(oz => {
      // West side chairs (facing East toward table)
      this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(8.9, y, -12.0 + oz), Math.PI / 2));
      // East side chairs (facing West toward table)
      this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(12.1, y, -12.0 + oz), -Math.PI / 2));
    });

    // Executive Head & Foot Chairs
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(10.5, y, -8.3), Math.PI));  // Head of table facing South
    this.addSolidProp(Props.createOfficeChair(new THREE.Vector3(10.5, y, -15.7), 0));       // Foot of table facing North

    // Massive Presentation Video Wall on South Feature Wall (Direct sightline for everyone at the table)
    this.addSolidProp(Props.createBoardroomVideoWall(new THREE.Vector3(10.5, y, -21.7), 0));

    // North Feature Wall Display Backdrop for the Imperial Crown Exhibit
    this.addSolidProp(Props.createCorporateLogoWall(new THREE.Vector3(10.5, y, -0.6), Math.PI));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(7.2, y, -1.8)));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(13.8, y, -1.8)));

    // Overhead Exhibition Spotlight focused on the Imperial Crown
    const crownSpot = new THREE.SpotLight(0xffd700, 2.5, 12, Math.PI / 4, 0.35);
    crownSpot.position.set(10.5, y + 5.8, -2.2);
    crownSpot.target.position.set(10.5, y + 1.0, -2.2);
    this.scene.add(crownSpot);
    this.scene.add(crownSpot.target);

    // Executive Catering Buffet Sideboard Credenza on East Wall
    this.addSolidProp(Props.createOfficeCredenza(new THREE.Vector3(15.8, y, -12.0), -Math.PI / 2));
    this.addSolidProp(Props.createTrophyBookcase(new THREE.Vector3(15.8, y, -17.5), -Math.PI / 2));

    // Executive Hospitality Bar on West Wall
    this.addSolidProp(Props.createCoffeeStation(new THREE.Vector3(5.2, y, -6.0), Math.PI / 2));
    this.addSolidProp(Props.createWaterCooler(new THREE.Vector3(5.2, y, -18.0)));
    this.addSolidProp(Props.createWhiteboard(new THREE.Vector3(5.2, y, -20.0), Math.PI / 2));
    this.addSolidProp(Props.createCyberPlant(new THREE.Vector3(15.8, y, -21)));
  }

  buildUndergroundFloor() {
    const y = -8;
    const h = 6.0;

    // --- GAPLESS CENTRAL CORRIDOR WALLS (X = -4.5 & X = 4.5, Spanning Z: -22 to 22) ---
    // West Corridor Wall: Doorway at Z=12 (Switch B), Doorway at Z=-12 (Master Evidence)
    this.addWall(-4.5, y, 17.9, 1, h, 8.2);        // Z: 13.8 to 22.0
    this.addWall(-4.5, y + 3.8, 12, 1, 2.2, 3.6);  // Lintel over Switch B Door (Z: 10.2 to 13.8)
    this.addWall(-4.5, y, 0, 1, h, 20.4);          // Z: -10.2 to 10.2
    this.addWall(-4.5, y + 3.8, -12, 1, 2.2, 3.6); // Lintel over Master Evidence Door (Z: -13.8 to -10.2)
    this.addWall(-4.5, y, -17.9, 1, h, 8.2);       // Z: -22.0 to -13.8

    // East Corridor Wall: Doorway at Z=12 (Switch A), Doorway at Z=-14 (Vault Blast Door)
    this.addWall(4.5, y, 17.9, 1, h, 8.2);         // Z: 13.8 to 22.0
    this.addWall(4.5, y + 3.8, 12, 1, 2.2, 3.6);   // Lintel over Switch A Door (Z: 10.2 to 13.8)
    this.addWall(4.5, y, 0.1, 1, h, 20.2);         // Z: -10.0 to 10.2
    this.addWall(4.5, y + 4.8, -14, 1, 1.2, 8.0);  // Lintel over Vault Blast Door (width 8.0)
    this.addWall(4.5, y, -20.0, 1, h, 4.0);        // Z: -22.0 to -18.0

    // Compact Room Dividers at Z = 0 (Width 12.0m per room)
    this.addWall(-10.5, y, 0, 12.0, h, 1); // West Divider (X: -16.5 to -4.5)
    this.addWall(10.5, y, 0, 12.0, h, 1);  // East Divider (X: 4.5 to 16.5)

    // --- 1. SWITCH B POWER SUBSTATION [COMPACT 12m x 22m] (North-West, X: -16.5 to -4.5, Z: 0 to 22) ---
    this.addDoor({ position: new THREE.Vector3(-4.5, y, 12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(-4.5, y + 4.6, 12), 'SWITCH B CONSOLE', 0x00ff88, Math.PI / 2).group);

    // High-Voltage Industrial Substation Transformer
    this.addSolidProp(Props.createHighVoltageTransformer(new THREE.Vector3(-13.5, y, 6), 0));

    // Industrial Electrical Distribution & Breaker Panel on West wall
    this.addSolidProp(Props.createElectricalBreakerPanel(new THREE.Vector3(-16.0, y, 14), Math.PI / 2));

    this.switchB = Props.createSwitchConsole('B', new THREE.Vector3(-10.5, y, 12), Math.PI / 2);
    this.addSolidProp(this.switchB);

    for (let i = 0; i < 3; i++) {
      this.addSolidProp(Props.createServerRack(new THREE.Vector3(-16.0, y, 6 + i * 4)));
    }
    this.addSolidProp(Props.createTechDesk(new THREE.Vector3(-10.5, y, 19), Math.PI));

    // --- 2. SWITCH A AUXILIARY REACTOR [COMPACT 12m x 22m] (North-East, X: 4.5 to 16.5, Z: 0 to 22) ---
    this.addDoor({ position: new THREE.Vector3(4.5, y, 12), rotation: Math.PI / 2, type: 'normal' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(4.5, y + 4.6, 12), 'SWITCH A CONSOLE', 0x00ff88, -Math.PI / 2).group);

    // High-Voltage Industrial Substation Transformer
    this.addSolidProp(Props.createHighVoltageTransformer(new THREE.Vector3(13.5, y, 6), 0));

    // Industrial Electrical Distribution & Breaker Panel on East wall
    this.addSolidProp(Props.createElectricalBreakerPanel(new THREE.Vector3(16.0, y, 14), -Math.PI / 2));

    this.switchA = Props.createSwitchConsole('A', new THREE.Vector3(10.5, y, 12), -Math.PI / 2);
    this.addSolidProp(this.switchA);

    for (let i = 0; i < 3; i++) {
      this.addSolidProp(Props.createServerRack(new THREE.Vector3(16.0, y, 6 + i * 4)));
    }
    this.addSolidProp(Props.createTechDesk(new THREE.Vector3(10.5, y, 19), Math.PI));

    // --- 3. HIGH-SECURITY EVIDENCE LOCKUP [MASTER KEYCARD] [COMPACT 12m x 22m] (South-West, X: -16.5 to -4.5, Z: -22 to 0) ---
    this.addDoor({ position: new THREE.Vector3(-4.5, y, -12), rotation: Math.PI / 2, type: 'master' });
    this.scene.add(Props.createSignboard(new THREE.Vector3(-4.5, y + 4.6, -12), 'MASTER EVIDENCE', 0xc084fc, Math.PI / 2).group);

    // Evidence Storage Shelving Racks with Labeled Archive Boxes
    this.addSolidProp(Props.createEvidenceShelving(new THREE.Vector3(-12.0, y, -21.4), 0));
    this.addSolidProp(Props.createEvidenceShelving(new THREE.Vector3(-16.0, y, -16), Math.PI / 2));
    this.addSolidProp(Props.createWeaponGearLocker(new THREE.Vector3(-16.0, y, -11), Math.PI / 2));
    this.addSolidProp(Props.createCargoCrates(new THREE.Vector3(-10.5, y, -16)));

    // --- 4. THE FORTIFIED HIGH-SECURITY MAIN VAULT [COMPACT 12m x 22m] (South-East, X: 4.5 to 16.5, Z: -22 to 0) ---
    // Giant Armored Vault Blast Door - Mounted in East Corridor Wall at X = 4.5, Z = -14
    this.vaultDoor = Props.createVaultDoor(new THREE.Vector3(4.5, y, -14), Math.PI / 2);
    this.scene.add(this.vaultDoor.group);
    this.physics.addDoor(this.vaultDoor); // Solid physics collider blocks entry when closed!

    // High-Tech Infrared Laser Grid guarding Vault Entrance
    this.laserGrid = new LaserGrid(this.scene);

    this.scene.add(Props.createSignboard(new THREE.Vector3(4.5, y + 5.2, -14), 'HIGH SECURITY MAIN VAULT', 0xffd700, -Math.PI / 2).group);

    // Heavy Wire-Mesh Wheeled Rolling Money Cart packed with cash bundles
    this.addSolidProp(Props.createRollingMoneyCart(new THREE.Vector3(10.5, y, -14), 0));

    // 4 Pallets of 3-Tier Gleaming Gold Bullion Pyramids
    this.addSolidProp(Props.createVaultGoldPallet(new THREE.Vector3(8.5, y, -6), 0));
    this.addSolidProp(Props.createVaultGoldPallet(new THREE.Vector3(13.5, y, -6), 0));
    this.addSolidProp(Props.createVaultGoldPallet(new THREE.Vector3(8.5, y, -20), 0));
    this.addSolidProp(Props.createVaultGoldPallet(new THREE.Vector3(13.5, y, -20), 0));

    // Bank Vault Safety Deposit Box Walls along South and East Walls
    const depositWallSouth = Props.createSafetyDepositWall(new THREE.Vector3(10.5, y, -21.6), 11.5, 4.0, 0);
    this.addSolidProp(depositWallSouth);

    const depositWallEast = Props.createSafetyDepositWall(new THREE.Vector3(16.0, y, -11), 21.0, 4.0, -Math.PI / 2);
    this.addSolidProp(depositWallEast);
  }

  buildRooftop() {
    const y = 16;
    const h = 1.6;

    // Perimeter safety railings (Matching compact footprint: X from -16.5 to +16.5, Z from -22 to +22)
    this.addWall(0, y, -22, 33, h, 0.6, this.materials.glass);
    this.addWall(0, y, 22, 33, h, 0.6, this.materials.glass);
    this.addWall(-16.5, y, 0, 0.6, h, 44, this.materials.glass);
    this.addWall(16.5, y, 0, 0.6, h, 44, this.materials.glass);

    // High-Fidelity Aviation Helipad with Perfect FAA/ICAO "H" Marking & Runway Edge Lights
    const helipad = Props.createHelipad(new THREE.Vector3(0, y, 12));
    this.scene.add(helipad.group);

    // 4 Helipad Stadium Floodlight Towers (All Solid)
    this.addSolidProp(Props.createHelipadFloodlight(new THREE.Vector3(-5.5, y, 6), Math.PI * 0.25));
    this.addSolidProp(Props.createHelipadFloodlight(new THREE.Vector3(5.5, y, 6), -Math.PI * 0.25));
    this.addSolidProp(Props.createHelipadFloodlight(new THREE.Vector3(-5.5, y, 18), Math.PI * 0.75));
    this.addSolidProp(Props.createHelipadFloodlight(new THREE.Vector3(5.5, y, 18), -Math.PI * 0.75));

    // Illuminated Aviation Windsock & Weather Mast
    this.addSolidProp(Props.createAviationWindsock(new THREE.Vector3(-7.5, y, 20)));

    // Communications Lattice Antenna Mast with Flashing Obstruction Beacon
    this.addSolidProp(Props.createRooftopAntenna(new THREE.Vector3(0, y, 21)));

    // Rooftop Elevator / Stairwell Bulkhead Structure
    this.addSolidProp(Props.createRooftopBulkhead(new THREE.Vector3(0, y, -6), 0));

    // Rooftop Industrial HVAC Units
    this.addSolidProp(Props.createHVACUnit(new THREE.Vector3(-10.0, y, -14)));
    this.addSolidProp(Props.createHVACUnit(new THREE.Vector3(10.0, y, -14)));

    // Rotating Satellite Dishes
    this.addSolidProp(Props.createRooftopDish(new THREE.Vector3(-13.0, y, 14)));
    this.addSolidProp(Props.createRooftopDish(new THREE.Vector3(13.0, y, 14)));
  }

  buildElevators() {
    this.elevators = [];
    const floorLevels = [
      { y: 0, name: 'Ground Floor' },
      { y: 8, name: '2nd Floor' },
      { y: -8, name: 'Underground Vault' },
      { y: 16, name: 'Rooftop Helipad' }
    ];

    floorLevels.forEach(lvl => {
      const lift = Props.createUnifiedElevator(lvl.y, lvl.name);
      this.scene.add(lift.group);
      this.elevators.push(lift);

      // Add solid glass enclosure walls (left, right, back) so player cannot walk through the elevator glass!
      const y = lvl.y;
      // Back glass wall (Z = -1.5, X: -1.4 to +1.4)
      this.physics.addCollider(new THREE.Box3(
        new THREE.Vector3(-1.4, y, -1.6),
        new THREE.Vector3(1.4, y + 4.0, -1.4)
      ));
      // Left glass wall (X = -1.5, Z: -1.4 to +1.4)
      this.physics.addCollider(new THREE.Box3(
        new THREE.Vector3(-1.6, y, -1.4),
        new THREE.Vector3(-1.4, y + 4.0, 1.4)
      ));
      // Right glass wall (X = 1.5, Z: -1.4 to +1.4)
      this.physics.addCollider(new THREE.Box3(
        new THREE.Vector3(1.4, y, -1.4),
        new THREE.Vector3(1.6, y + 4.0, 1.4)
      ));
    });
  }

  spawnLootAndKeycards() {
    // 1. 🔵 BLUE KEYCARD: Inside Ground Floor Security HQ on the Supervisor Tech Desk
    const blueKc = Props.createKeycardMesh('blue', new THREE.Vector3(-10.5, 1.2, 16));
    this.scene.add(blueKc.group);
    this.keycardItems.push(blueKc);

    // 2. 🔴 RED KEYCARD: Inside 2nd Floor Bio-Cyber Research Lab on Lab Workbench Analyzer
    const redKc = Props.createKeycardMesh('red', new THREE.Vector3(-14.0, 9.2, 10));
    this.scene.add(redKc.group);
    this.keycardItems.push(redKc);

    // 3. 🟣 MASTER KEYCARD: Inside 2nd Floor VIP CEO Suite on the CEO Executive Desk!
    // (Player unlocks VIP Suite with Red Keycard, and claims the Master Keycard inside!)
    const masterKc = Props.createKeycardMesh('master', new THREE.Vector3(10.5, 9.2, 18));
    this.scene.add(masterKc.group);
    this.keycardItems.push(masterKc);

    // --- 1. GLASS DISPLAY CASES (Crowns, Diamonds, Prototypes, Vault Package) ---
    // All cases are positioned in dedicated museum, gallery, and security exhibit locations
    // framed with elegant brass stanchions & velvet ropes — NEVER clipping into desks or furniture!
    const glassCaseConfigs = [
      // 1. Ground Floor Storage & Supply Depot (Central High-Value Inspection Platform)
      {
        type: 'DIAMOND',
        casePos: new THREE.Vector3(-10.5, 0, -15),
        lootPos: new THREE.Vector3(-10.5, 1.2, -15),
        name: 'Depot Contraband Diamond',
        glowColor: 0x00f0ff,
        hasStanchions: true,
        ropeColor: 0xf59e0b
      },

      // 2. Ground Floor Security HQ (North Evidence Showcase, clear of all desks)
      {
        type: 'PROTOTYPE',
        casePos: new THREE.Vector3(-8.0, 0, 20),
        lootPos: new THREE.Vector3(-8.0, 1.2, 20),
        name: 'Security Prototype Microchip',
        glowColor: 0x10b981,
        hasStanchions: true,
        ropeColor: 0x0284c7
      },

      // 3. Ground Floor Admin Office (Executive Display Niche, clear of employee desks)
      {
        type: 'DIAMOND',
        casePos: new THREE.Vector3(10.5, 0, -20.5),
        lootPos: new THREE.Vector3(10.5, 1.2, -20.5),
        name: 'Corporate Showcase Diamond',
        glowColor: 0x00f0ff,
        hasStanchions: true,
        ropeColor: 0x0284c7
      },

      // 4. Ground Floor Tactical Garage (Maintenance Inspection Pedestal)
      {
        type: 'DIAMOND',
        casePos: new THREE.Vector3(14.5, 0, 19),
        lootPos: new THREE.Vector3(14.5, 1.2, 19),
        name: 'Smuggled Garage Diamond',
        glowColor: 0x00f0ff,
        hasStanchions: true,
        ropeColor: 0xf59e0b
      },

      // 5. 2nd Floor Bio-Cyber Lab (Central Cleanroom Quarantine Showcase)
      {
        type: 'PROTOTYPE',
        casePos: new THREE.Vector3(-10.5, 8.0, 15),
        lootPos: new THREE.Vector3(-10.5, 9.2, 15),
        name: 'Quantum Neural Prototype A',
        glowColor: 0x10b981,
        hasStanchions: true,
        ropeColor: 0x10b981
      },

      // 6. 2nd Floor Bio-Cyber Lab (Cleanroom Aisle Specimen Station B)
      {
        type: 'PROTOTYPE',
        casePos: new THREE.Vector3(-14.0, 8.0, 5.5),
        lootPos: new THREE.Vector3(-14.0, 9.2, 5.5),
        name: 'Quantum Neural Prototype B',
        glowColor: 0x10b981,
        hasStanchions: true,
        ropeColor: 0x10b981
      },

      // 7. 2nd Floor Corporate Boardroom (North Feature Wall Exhibit, clear of conference table)
      {
        type: 'CROWN',
        casePos: new THREE.Vector3(10.5, 8.0, -2.2),
        lootPos: new THREE.Vector3(10.5, 9.2, -2.2),
        name: 'Boardroom Imperial Crown',
        glowColor: 0xffd700,
        hasStanchions: true,
        ropeColor: 0xdc2626,
        stanchionW: 2.2,
        stanchionD: 2.2,
        stanchionRot: Math.PI
      },

      // 8. 2nd Floor VIP CEO Suite (Executive Corner Showcase, clear of sofas and desk)
      {
        type: 'CROWN',
        casePos: new THREE.Vector3(14.5, 8.0, 8),
        lootPos: new THREE.Vector3(14.5, 9.2, 8),
        name: 'CEO Royal Crown',
        glowColor: 0xffd700,
        hasStanchions: true,
        ropeColor: 0xff0055
      },

      // 9. Underground Vault Centerpiece A (Main Vault Center)
      {
        type: 'VAULT_PACKAGE',
        casePos: new THREE.Vector3(10.5, -8.0, -10),
        lootPos: new THREE.Vector3(10.5, -6.8, -10),
        name: 'Vault Package Briefcase',
        glowColor: 0xa855f7,
        hasStanchions: true,
        ropeColor: 0xa855f7
      },

      // 10. Underground Vault Centerpiece B (Main Vault Center)
      {
        type: 'CROWN',
        casePos: new THREE.Vector3(10.5, -8.0, -18),
        lootPos: new THREE.Vector3(10.5, -6.8, -18),
        name: 'Royal Vault Crown',
        glowColor: 0xffd700,
        hasStanchions: true,
        ropeColor: 0xffd700
      },

      // 11. Underground Master Evidence Lockup (Evidence Pedestal)
      {
        type: 'CROWN',
        casePos: new THREE.Vector3(-12.0, -8.0, -12),
        lootPos: new THREE.Vector3(-12.0, -6.8, -12),
        name: 'Evidence Royal Crown',
        glowColor: 0xc084fc,
        hasStanchions: true,
        ropeColor: 0xc084fc
      }
    ];

    glassCaseConfigs.forEach(cfg => {
      const loot = new LootItem(cfg.type, cfg.lootPos);
      this.scene.add(loot.mesh);
      this.lootItems.push(loot);
      if (cfg.type === 'VAULT_PACKAGE') {
        this.vaultPackageLoot = loot;
      }

      const glassCase = new GlassCase(this.scene, cfg.casePos, loot, {
        name: cfg.name,
        glowColor: cfg.glowColor
      });
      this.glassCases.push(glassCase);

      // Register solid obstacle collider for glass case pedestal
      const colBox = new THREE.Box3(
        new THREE.Vector3(cfg.casePos.x - 0.7, cfg.casePos.y, cfg.casePos.z - 0.7),
        new THREE.Vector3(cfg.casePos.x + 0.7, cfg.casePos.y + 2.0, cfg.casePos.z + 0.7)
      );
      this.physics.addCollider(colBox);

      if (cfg.hasStanchions) {
        const stanchions = Props.createMuseumStanchions(
          cfg.casePos,
          cfg.stanchionW || 2.4,
          cfg.stanchionD || 2.4,
          cfg.ropeColor || 0xdc2626,
          cfg.stanchionRot || 0
        );
        this.scene.add(stanchions.group);
      }
    });

    // --- 2. INTERACTIVE HEAVY SAFES (Gold Coins, Bullion, Safe Diamonds) ---
    const safeConfigs = [
      // Ground Floor: Storage & Supply Depot (Inside High-Security Caged Vault!)
      { type: 'GOLD', lootPos: new THREE.Vector3(-12.8, 0.45, -8), safePos: new THREE.Vector3(-13.0, 0, -8), rot: Math.PI / 2, name: 'Storage Vault Safe' },
      // Ground Floor: Security HQ
      { type: 'GOLD', lootPos: new THREE.Vector3(-15.6, 0.45, 14), safePos: new THREE.Vector3(-15.8, 0, 14), rot: Math.PI / 2, name: 'Security HQ Safe' },
      // Ground Floor: Admin Finance
      { type: 'GOLD', lootPos: new THREE.Vector3(15.6, 0.45, -20), safePos: new THREE.Vector3(15.8, 0, -20), rot: -Math.PI / 2, name: 'Administrative Floor Safe' },
      // 2nd Floor: VIP CEO Suite
      { type: 'DIAMOND', lootPos: new THREE.Vector3(15.6, 8.45, 20), safePos: new THREE.Vector3(15.8, 8.0, 20), rot: -Math.PI / 2, name: 'Executive VIP Floor Safe' },
      // Underground: Master Evidence Lockup
      { type: 'DIAMOND', lootPos: new THREE.Vector3(-15.6, -7.55, -20), safePos: new THREE.Vector3(-15.8, -8.0, -20), rot: Math.PI / 2, name: 'Evidence Lockup Safe' },
      // Underground: Power Substation B
      { type: 'GOLD', lootPos: new THREE.Vector3(-15.6, -7.55, 16), safePos: new THREE.Vector3(-15.8, -8.0, 16), rot: Math.PI / 2, name: 'Substation B Safe' },
      // Underground: Auxiliary Reactor A
      { type: 'GOLD', lootPos: new THREE.Vector3(15.6, -7.55, 16), safePos: new THREE.Vector3(15.8, -8.0, 16), rot: -Math.PI / 2, name: 'Reactor A Safe' }
    ];

    safeConfigs.forEach(cfg => {
      const loot = new LootItem(cfg.type, cfg.lootPos);
      this.scene.add(loot.mesh);
      this.lootItems.push(loot);

      const safe = new InteractiveSafe(this.scene, cfg.safePos, cfg.rot, loot, {
        name: cfg.name,
        label: cfg.name.toUpperCase()
      });
      this.safes.push(safe);

      // Register solid obstacle collider for armored safe
      const safeBox = new THREE.Box3(
        new THREE.Vector3(cfg.safePos.x - 0.75, cfg.safePos.y, cfg.safePos.z - 0.75),
        new THREE.Vector3(cfg.safePos.x + 0.75, cfg.safePos.y + 1.5, cfg.safePos.z + 0.75)
      );
      this.physics.addCollider(safeBox);
    });

    // --- 3. LOOSE LOOT ITEMS ---
    const looseLootSpawns = [
      // Ground Floor:
      { type: 'WATCH', pos: new THREE.Vector3(1.0, 1.25, 18.0) },      // In luxury case on Reception Counter
      { type: 'GOLD', pos: new THREE.Vector3(0, 0.44, 6) },            // In open lockbox on Lobby Glass Coffee Table (NOT on sofas!)
      { type: 'WATCH', pos: new THREE.Vector3(-10.5, 1.15, 16) },      // On Commander Desk in Security HQ
      { type: 'GOLD', pos: new THREE.Vector3(-12.0, 1.65, -21.4) },    // On Storage Warehouse High-Bay Rack 1
      { type: 'GOLD', pos: new THREE.Vector3(-15.8, 1.65, -15) },      // On Storage Warehouse High-Bay Rack 2
      { type: 'GOLD', pos: new THREE.Vector3(-10.5, 0.55, -8) },       // On Gold Bullion Pallet beside Pallet Jack
      { type: 'WATCH', pos: new THREE.Vector3(-7.2, 0.9, -15) },       // On Logistics Shipping Desk
      { type: 'WATCH', pos: new THREE.Vector3(15.6, 0.95, 19) },       // In plain sight on Garage Mechanic's Workbench
      { type: 'GOLD', pos: new THREE.Vector3(7.6, 0.45, 8.0) },        // In open lockbox beside Getaway Van walkway
      { type: 'WATCH', pos: new THREE.Vector3(15.8, 0.9, -9) },        // In luxury case on Admin Credenza Sideboard
      { type: 'GOLD', pos: new THREE.Vector3(8.0, 0.85, -8) },         // On Admin Bullpen Desk
      { type: 'GOLD', pos: new THREE.Vector3(7.5, 0.95, -21.4) },      // On Admin Coffee Station Counter

      // 2nd Floor:
      { type: 'GOLD', pos: new THREE.Vector3(-7.5, 8.95, -21.4) },     // On Break Room Coffee Counter
      { type: 'WATCH', pos: new THREE.Vector3(-15.6, 8.95, -18) },     // On Break Room Vending Change Tray
      { type: 'WATCH', pos: new THREE.Vector3(10.0, 8.85, 18) },       // In luxury case on CEO Executive Desk
      { type: 'GOLD', pos: new THREE.Vector3(15.6, 8.95, 15) },        // On VIP Bar Cart
      { type: 'GOLD', pos: new THREE.Vector3(15.6, 8.95, -12.0) },      // On Boardroom Credenza Sideboard

      // Underground Vault Level:
      { type: 'DIAMOND', pos: new THREE.Vector3(-10.5, -6.8, 12) },    // In Switch B Control Console
      { type: 'DIAMOND', pos: new THREE.Vector3(10.5, -6.8, 12) },     // In Switch A Control Console
      { type: 'PROTOTYPE', pos: new THREE.Vector3(-12.0, -6.8, -21.4) }, // On Evidence Shelving
      { type: 'GOLD', pos: new THREE.Vector3(8.5, -6.8, -6) },         // On Vault Gold Pallet 1
      { type: 'GOLD', pos: new THREE.Vector3(13.5, -6.8, -6) },        // On Vault Gold Pallet 2
      { type: 'GOLD', pos: new THREE.Vector3(8.5, -6.8, -20) },        // On Vault Gold Pallet 3
      { type: 'GOLD', pos: new THREE.Vector3(13.5, -6.8, -20) },       // On Vault Gold Pallet 4
      { type: 'DIAMOND', pos: new THREE.Vector3(10.5, -6.6, -21.2) },  // Open Safety Deposit Box 1
      { type: 'DIAMOND', pos: new THREE.Vector3(15.6, -6.6, -11) },    // Open Safety Deposit Box 2

      // Rooftop:
      { type: 'DIAMOND', pos: new THREE.Vector3(-10.0, 17.5, -14) },   // In HVAC Inspection Box 1
      { type: 'WATCH', pos: new THREE.Vector3(10.0, 17.5, -14) },      // In HVAC Inspection Box 2
      { type: 'PROTOTYPE', pos: new THREE.Vector3(-13.0, 17.0, 14) },  // Classified Radar Datacore
      { type: 'GOLD', pos: new THREE.Vector3(6.5, 16.4, 18) }          // Smuggler Stash near Helipad
    ];

    looseLootSpawns.forEach(item => {
      const loot = new LootItem(item.type, item.pos);
      this.scene.add(loot.mesh);
      this.lootItems.push(loot);
    });
  }

  spawnSecurityCameras() {
    // Strategic Security Cameras ONLY in restricted zones (Lobby spawn is 100% safe!)
    const camConfigs = [
      // Ground Floor: Deep restricted zones only
      { position: new THREE.Vector3(-15.0, 4.8, 20), baseAngle: -Math.PI / 2, range: 9, sweepAngle: Math.PI * 0.55, sweepSpeed: 0.75, sweepPhase: 0 },   // Inside Security HQ
      { position: new THREE.Vector3(15.0, 4.8, 6), baseAngle: Math.PI / 2, range: 9, sweepAngle: Math.PI * 0.55, sweepSpeed: 0.8, sweepPhase: 1.5 },     // Inside Garage Approach

      // Second Floor: Corridors
      { position: new THREE.Vector3(0, 12.8, 12), baseAngle: Math.PI, range: 10, sweepAngle: Math.PI * 0.6, sweepSpeed: 0.7, sweepPhase: 0.8 },        // 2F North corridor sweep
      { position: new THREE.Vector3(0, 12.8, -12), baseAngle: 0, range: 10, sweepAngle: Math.PI * 0.6, sweepSpeed: 0.72, sweepPhase: 2.2 },            // 2F South corridor sweep

      // Underground: Substation & Vault Approach
      { position: new THREE.Vector3(0, -3.0, 12), baseAngle: 0, range: 10, sweepAngle: Math.PI * 0.55, sweepSpeed: 0.75, sweepPhase: 1.0 },              // UG North Corridor sweep
      { position: new THREE.Vector3(-3.8, -3.0, -14), baseAngle: Math.PI / 2, range: 9, sweepAngle: Math.PI * 0.55, sweepSpeed: 0.75, sweepPhase: 1.8 }, // Directly In Front of Vault Door
      { position: new THREE.Vector3(15.0, -3.0, 20), baseAngle: Math.PI / 2, range: 8, sweepAngle: Math.PI * 0.5, sweepSpeed: 0.85, sweepPhase: 2.8 },    // Switch A Reactor room
      { position: new THREE.Vector3(-15.0, -3.0, 20), baseAngle: -Math.PI / 2, range: 8, sweepAngle: Math.PI * 0.5, sweepSpeed: 0.85, sweepPhase: 0.3 }    // Switch B Substation room
    ];

    camConfigs.forEach(cfg => {
      const cam = new SecurityCamera(cfg);
      this.scene.add(cam.mesh);
      this.cameras.push(cam);
    });
  }

  spawnExtractionZones() {
    // 1. 🟢 Main Exit (Ground Floor Main Entrance)
    const mainExit = Props.createExtractionZone({
      id: 'main',
      name: 'Main Lobby Entrance',
      position: new THREE.Vector3(0, 0, 20),
      color: 0x00ff88,
      difficulty: 'Easy'
    });
    this.scene.add(mainExit.group);
    this.extractionZones.push(mainExit);

    // 2. 🟡 Garage Exit (Ground Floor East Garage)
    const garageExit = Props.createExtractionZone({
      id: 'garage',
      name: 'Garage Security Gate',
      position: new THREE.Vector3(14.5, 0, 8),
      color: 0xffd700,
      difficulty: 'Medium'
    });
    this.scene.add(garageExit.group);
    this.extractionZones.push(garageExit);

    // 3. 🔴 Rooftop Helipad (Rooftop Deck at Z = 12)
    const helipadExit = Props.createExtractionZone({
      id: 'helipad',
      name: 'Rooftop Helipad',
      position: new THREE.Vector3(0, 16, 12),
      color: 0xff0055,
      difficulty: 'Hard',
      radius: 4.5
    });
    this.scene.add(helipadExit.group);
    this.extractionZones.push(helipadExit);
  }

  update(delta, time, playerPos, onLaserBreach) {
    this.doors.forEach(d => d.update(delta));
    if (this.glassCases) this.glassCases.forEach(gc => gc.update(delta));
    if (this.safes) this.safes.forEach(s => s.update(delta));
    this.lootItems.forEach(l => l.update(delta, time));
    this.keycardItems.forEach(k => k.update(delta, time));
    this.extractionZones.forEach(e => e.update(delta, time));
    if (this.propsList) {
      this.propsList.forEach(p => {
        if (p && p.update) p.update(delta, time);
      });
    }
    if (this.vaultDoor) this.vaultDoor.update(delta);
    if (this.laserGrid) this.laserGrid.update(delta, time, playerPos, onLaserBreach);
  }

  reset() {
    if (this.glassCases) this.glassCases.forEach(gc => gc.reset());
    if (this.safes) this.safes.forEach(s => s.reset());

    this.lootItems.forEach(l => {
      l.isCollected = false;
      l.mesh.visible = true;
      l.mesh.position.copy(l.initialPosition);
    });

    this.keycardItems.forEach(k => {
      k.isCollected = false;
      k.group.visible = true;
    });

    this.doors.forEach(d => d.close());
    if (this.switchA) this.switchA.deactivate();
    if (this.switchB) this.switchB.deactivate();
    if (this.laserGrid) this.laserGrid.reset();
    if (this.vaultDoor) {
      this.vaultDoor.isOpen = false;
      this.vaultDoor.openProgress = 0;
      this.vaultDoor.doorGroup.position.x = 0;
      this.vaultDoor.screenMat.color.setHex(0xff0055);
    }
  }
}
