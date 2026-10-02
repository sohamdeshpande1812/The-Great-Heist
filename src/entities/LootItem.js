import * as THREE from 'three';

export const LOOT_TYPES = {
  GOLD: {
    id: 'gold',
    name: 'Gold Coins',
    value: 1000,
    weight: 2,
    color: 0xffd700,
    glowColor: 0xffaa00,
    icon: '🪙',
    description: 'A heavy stack of pure bullion cyber-credits.'
  },
  DIAMOND: {
    id: 'diamond',
    name: 'Flawless Diamond',
    value: 5000,
    weight: 1,
    color: 0x00f0ff,
    glowColor: 0x00ffff,
    icon: '💎',
    description: 'High-purity crystalline gemstone.'
  },
  PROTOTYPE: {
    id: 'prototype',
    name: 'Prototype Device',
    value: 8000,
    weight: 5,
    color: 0x10b981,
    glowColor: 0x34d399,
    icon: '📱',
    description: 'Classified neural interface prototype.'
  },
  WATCH: {
    id: 'watch',
    name: 'Luxury Chrono-Watch',
    value: 10000,
    weight: 2,
    color: 0xf59e0b,
    glowColor: 0xfbbf24,
    icon: '⌚',
    description: 'Bespoke diamond-encrusted chronometer.'
  },
  CROWN: {
    id: 'crown',
    name: 'Royal Crown',
    value: 15000,
    weight: 4,
    color: 0xffd700,
    glowColor: 0xf43f5e,
    icon: '👑',
    description: 'Ancient artifact adorned with ruby photon crystals.'
  },
  VAULT_PACKAGE: {
    id: 'vault_package',
    name: 'Vault Package',
    value: 30000,
    weight: 10,
    color: 0xa855f7,
    glowColor: 0xc084fc,
    icon: '💼',
    description: 'The ultimate classified biometric briefcase from the Main Vault.'
  }
};

export class LootItem {
  constructor(typeKey, position) {
    this.type = LOOT_TYPES[typeKey] || LOOT_TYPES.GOLD;
    this.initialPosition = position.clone();
    this.mesh = this.createMesh();
    this.mesh.position.copy(position);
    this.isCollected = false;
    this.inContainer = false;
    this.interactionRadius = 2.8;
  }

  createMesh() {
    const group = new THREE.Group();

    switch (this.type.id) {
      case 'gold': {
        // High-Security Open Lockbox with Stacked 24K Minted Gold Bullion
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 });
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.96,
          roughness: 0.15,
          emissive: 0x553300
        });
        const latchMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
        const ledMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });

        // Compact Security Lockbox Chassis (0.38m x 0.1m x 0.28m)
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.28), boxMat);
        box.position.y = 0.04;
        group.add(box);

        // Chrome Corner Brackets
        [-0.19, 0.19].forEach(x => {
          [-0.14, 0.14].forEach(z => {
            const brk = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.04), latchMat);
            brk.position.set(x, 0.045, z);
            group.add(brk);
          });
        });

        // 3 Stacked Bars of Minted Gold Bullion inside
        [-0.09, 0.09].forEach(x => {
          const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.2), goldMat);
          bar1.position.set(x, 0.08, 0);
          group.add(bar1);
        });
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.2), goldMat);
        topBar.position.set(0, 0.12, 0);
        group.add(topBar);

        // LED Indicator Bar on Front
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.015, 0.02), ledMat);
        led.position.set(0, 0.06, 0.142);
        group.add(led);
        break;
      }

      case 'diamond': {
        // Prestige Velvet Display Stand with Floating Diamond
        const standMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
        const velvetMat = new THREE.MeshStandardMaterial({ color: 0x1e1035, roughness: 0.7 });
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0x00f0ff,
          emissive: 0x0088aa,
          metalness: 0.2,
          roughness: 0.05
        });
        const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Octagonal Plinth Base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.06, 8), standMat);
        base.position.y = 0.03;
        group.add(base);

        const velvet = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), velvetMat);
        velvet.position.y = 0.065;
        group.add(velvet);

        // Brilliant Floating Diamond Gem
        this.gemMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), gemMat);
        this.gemMesh.position.y = 0.26;
        group.add(this.gemMesh);

        // Sparkle Core Glint
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), glintMat);
        star.position.y = 0.26;
        group.add(star);
        break;
      }

      case 'prototype': {
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.8,
          roughness: 0.3
        });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.65), bodyMat);
        body.position.y = 0.03;
        group.add(body);

        const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.52), screenMat);
        screen.rotation.x = -Math.PI / 2;
        screen.position.y = 0.065;
        group.add(screen);
        break;
      }

      case 'watch': {
        // Luxury Open Watch Presentation Case with Contoured Velvet Cushion & Swiss Watch
        const caseOuterMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 }); // Piano black / carbon
        const velvetMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.8 }); // Deep Crimson Velvet
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.95,
          roughness: 0.12,
          emissive: 0x553300
        });
        const dialFaceMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 }); // Sunburst Blue Dial
        const handMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const glintMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });

        // 1. Open Luxury Presentation Box (0.3m x 0.26m x 0.08m)
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.26), caseOuterMat);
        box.position.y = 0.04;
        group.add(box);

        // Open Hinged Lid (Angled back at 115 degrees)
        const lid = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.26), caseOuterMat);
        lid.position.set(0, 0.16, -0.18);
        lid.rotation.x = -Math.PI * 0.4;
        group.add(lid);

        // Interior Velvet Bed
        const velvetBed = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.22), velvetMat);
        velvetBed.position.set(0, 0.07, 0);
        group.add(velvetBed);

        // Contoured Watch Pillow
        const pillow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12), velvetMat);
        pillow.rotation.z = Math.PI / 2;
        pillow.position.set(0, 0.11, 0);
        group.add(pillow);

        // 2. The Luxury Watch itself
        // Circular Gold Casing & Bezel
        const watchBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 20), goldMat);
        watchBezel.position.set(0, 0.16, 0);
        group.add(watchBezel);

        // Sunburst Dial Face
        const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.032, 20), dialFaceMat);
        dial.position.set(0, 0.162, 0);
        group.add(dial);

        // Watch Hands
        const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.005, 0.035), handMat);
        hourHand.position.set(0, 0.18, 0.015);
        group.add(hourHand);

        const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.005, 0.048), handMat);
        minHand.position.set(0.018, 0.18, 0);
        minHand.rotation.y = Math.PI / 3;
        group.add(minHand);

        // Gold Link Bracelet curved around pillow
        const bracelet = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 16), goldMat);
        bracelet.rotation.y = Math.PI / 2;
        bracelet.position.set(0, 0.11, 0);
        group.add(bracelet);

        // Glowing Star Glint (Visible beacon!)
        this.gemMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), glintMat);
        this.gemMesh.position.set(0, 0.22, 0);
        group.add(this.gemMesh);
        break;
      }

      case 'crown': {
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.96,
          roughness: 0.12,
          emissive: 0x553300
        });
        const velvetMat = new THREE.MeshStandardMaterial({
          color: 0x581c87, // Deep Imperial Purple Velvet Cap
          roughness: 0.85
        });
        const rubyMat = new THREE.MeshStandardMaterial({
          color: 0xe11d48, // Crimson Ruby Gemstones
          metalness: 0.8,
          roughness: 0.1,
          emissive: 0x880015
        });
        const pearlMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          metalness: 0.3,
          roughness: 0.2
        });

        // 1. Royal Purple Velvet Inner Cap (Dome)
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), velvetMat);
        cap.position.y = 0.12;
        group.add(cap);

        // 2. Gold Circlet Base Band
        const circlet = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.08, 24, 1, true), goldMat);
        circlet.position.y = 0.12;
        group.add(circlet);

        // Pearl & Ruby Studded Trim on Circlet
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const isRuby = i % 3 === 0;
          const gem = new THREE.Mesh(
            new THREE.SphereGeometry(0.018, 8, 8),
            isRuby ? rubyMat : pearlMat
          );
          gem.position.set(Math.cos(angle) * 0.235, 0.12, Math.sin(angle) * 0.235);
          group.add(gem);
        }

        // 3. 8 Alternating Crown Peaks: 4 Cross Pattée & 4 Fleur-de-lis Spikes
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const px = Math.cos(angle) * 0.22;
          const pz = Math.sin(angle) * 0.22;

          if (i % 2 === 0) {
            // Cross Finial with center Ruby
            const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.015), goldMat);
            crossV.position.set(px, 0.19, pz);
            crossV.rotation.y = -angle;
            group.add(crossV);

            const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.015), goldMat);
            crossH.position.set(px, 0.20, pz);
            crossH.rotation.y = -angle;
            group.add(crossH);

            const ruby = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), rubyMat);
            ruby.position.set(px * 1.05, 0.20, pz * 1.05);
            group.add(ruby);
          } else {
            // Fleur-de-lis Crest Spike
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 6), goldMat);
            spike.position.set(px, 0.18, pz);
            group.add(spike);
          }
        }

        // 4. 4 Elegant Sweeping Gold Imperial Arches converging at the crest
        for (let i = 0; i < 2; i++) {
          const arch = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.014, 8, 16, Math.PI), goldMat);
          arch.rotation.y = i * (Math.PI / 2);
          arch.position.y = 0.14;
          group.add(arch);
        }

        // 5. Sovereign's Orb & Cross Summit at top peak
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), goldMat);
        orb.position.y = 0.36;
        group.add(orb);

        const orbCross = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.01), goldMat);
        orbCross.position.y = 0.40;
        group.add(orbCross);

        const orbCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.01), goldMat);
        orbCrossH.position.y = 0.405;
        group.add(orbCrossH);

        // Pulsing Golden Gem Beacon Glint above Crown
        this.gemMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.035),
          new THREE.MeshBasicMaterial({ color: 0xffd700 })
        );
        this.gemMesh.position.set(0, 0.46, 0);
        group.add(this.gemMesh);
        break;
      }

      case 'vault_package': {
        const caseMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.9,
          roughness: 0.2,
          emissive: 0x330044
        });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.35), caseMat);
        body.position.y = 0.38;
        group.add(body);

        const bandMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
        const band1 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.08, 0.38), bandMat);
        band1.position.y = 0.38;
        group.add(band1);
        break;
      }
    }

    return group;
  }

  update(delta, time) {
    if (this.isCollected || !this.mesh) return;
    if (this.gemMesh) {
      this.gemMesh.rotation.y += delta * 2.0;
    }
  }

  collect() {
    this.isCollected = true;
    if (this.mesh) {
      this.mesh.visible = false;
    }
  }

  respawnAt(position) {
    this.isCollected = false;
    this.mesh.position.copy(position);
    this.initialPosition.copy(position);
    this.mesh.visible = true;
  }
}
