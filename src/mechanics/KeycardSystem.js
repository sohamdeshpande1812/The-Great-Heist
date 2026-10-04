import { audioManager } from '../engine/AudioManager.js';

export class KeycardSystem {
  constructor(player, facilityMap, showToast, onKeycardAcquired = null) {
    this.player = player;
    this.facilityMap = facilityMap;
    this.showToast = showToast;
    this.onKeycardAcquired = onKeycardAcquired;
  }

  update() {
    // 1. Check Keycard Pickups
    for (const keycard of this.facilityMap.keycardItems) {
      if (keycard.isCollected) continue;

      const dist = this.player.position.distanceTo(keycard.group.position);
      if (dist < 2.0) {
        keycard.collect();
        this.player.addKeycard(keycard.type);
        audioManager.playKeycardChime();

        const name = keycard.type.toUpperCase();
        this.showToast(`🔑 ${name} KEYCARD ACQUIRED! Restricted areas unlocked.`, 'success');

        if (this.onKeycardAcquired) {
          this.onKeycardAcquired(keycard.type);
        }
      }
    }

    // 2. Check Keycard Door Proximity
    for (const door of this.facilityMap.doors) {
      const dist = this.player.position.distanceTo(door.position);

      if (dist < 4.0) {
        if (door.type === 'normal') {
          if (!door.isOpen) {
            door.open();
            audioManager.playDoorOpen();
          }
        } else {
          // Keycard locked door
          if (this.player.hasKeycard(door.type)) {
            if (!door.isOpen) {
              door.open();
              audioManager.playDoorOpen();
              this.showToast(`🔓 ${door.type.toUpperCase()} DOOR UNLOCKED`, 'success');
            }
          }
        }
      } else if (dist > 5.5 && door.isOpen) {
        door.close();
      }
    }
  }

  checkDoorInteraction(door) {
    if (door.isOpen) return;

    if (door.type === 'normal' || this.player.hasKeycard(door.type)) {
      door.open();
      audioManager.playDoorOpen();
      this.showToast(`🔓 DOOR OPENED`, 'success');
    } else {
      audioManager.playTooHeavy();
      this.showToast(`🔒 LOCKED: Requires ${door.type.toUpperCase()} Keycard!`, 'warning');
    }
  }
}
