import { audioManager } from '../engine/AudioManager.js';

export class VaultPuzzle {
  constructor(facilityMap, securitySystem, showToast) {
    this.facilityMap = facilityMap;
    this.securitySystem = securitySystem;
    this.showToast = showToast;

    this.isVaultUnlocked = false;
    this.syncWindowDuration = 22; // seconds
    this.syncTimer = 0;
    this.firstActivatedSwitch = null;
  }

  update(delta) {
    if (this.isVaultUnlocked) return;

    // Countdown active sync window
    if (this.syncTimer > 0) {
      this.syncTimer -= delta;

      if (this.syncTimer <= 0) {
        // Time window expired! Reset switches
        this.resetSwitches();
        this.showToast('⏱️ VAULT SYNC TIMEOUT: Both switches must be flipped within the window!', 'warning');
        audioManager.playTooHeavy();
      }
    }
  }

  activateSwitch(switchObj) {
    if (this.isVaultUnlocked) return;
    if (switchObj.isActive) return;

    switchObj.activate();
    audioManager.playSwitchClick();

    if (!this.firstActivatedSwitch) {
      // First switch activated
      this.firstActivatedSwitch = switchObj.id;
      this.syncTimer = this.syncWindowDuration;
      const otherSwitch = switchObj.id === 'A' ? 'SWITCH B' : 'SWITCH A';
      this.showToast(`⚡ SWITCH ${switchObj.id} ENGAGED! Reach ${otherSwitch} in ${Math.round(this.syncTimer)}s!`, 'success');
    } else {
      // Second switch activated within window!
      this.unlockVault();
    }
  }

  unlockVault() {
    this.isVaultUnlocked = true;
    this.syncTimer = 0;

    // Open Vault Blast Door
    if (this.facilityMap.vaultDoor) {
      this.facilityMap.vaultDoor.open();
    }

    audioManager.playVaultOpenRumble();
    this.showToast('🔓 VAULT OPENED! The Vault Package is exposed!', 'success');

    // Play cosmetic alarm siren without triggering lockdown
    this.securitySystem.triggerCosmeticAlarm(25);
  }

  resetSwitches() {
    this.syncTimer = 0;
    this.firstActivatedSwitch = null;
    if (this.facilityMap.switchA) this.facilityMap.switchA.deactivate();
    if (this.facilityMap.switchB) this.facilityMap.switchB.deactivate();
  }

  reset() {
    this.isVaultUnlocked = false;
    this.resetSwitches();
  }

  getStatus() {
    return {
      isVaultUnlocked: this.isVaultUnlocked,
      switchA: this.facilityMap.switchA ? this.facilityMap.switchA.isActive : false,
      switchB: this.facilityMap.switchB ? this.facilityMap.switchB.isActive : false,
      syncTimer: Math.max(0, Math.ceil(this.syncTimer)),
      hasActiveTimer: this.syncTimer > 0
    };
  }
}
