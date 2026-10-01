import { audioManager } from '../engine/AudioManager.js';

export class ExtractionSystem {
  constructor(player, facilityMap, onExtractionPrompt) {
    this.player = player;
    this.facilityMap = facilityMap;
    this.onExtractionPrompt = onExtractionPrompt;
    this.activeZone = null;
  }

  update() {
    let nearestZone = null;

    for (const zone of this.facilityMap.extractionZones) {
      const dist = this.player.position.distanceTo(zone.position);
      if (dist < zone.radius) {
        nearestZone = zone;
        break;
      }
    }

    this.activeZone = nearestZone;
    return this.activeZone;
  }

  getExtractionBonus(zoneId) {
    if (zoneId === 'helipad') return 1500;
    if (zoneId === 'garage') return 600;
    return 200; // main
  }

  promptExtraction() {
    if (!this.activeZone) return;
    this.onExtractionPrompt(this.activeZone);
  }
}
