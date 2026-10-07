import { audioManager } from '../engine/AudioManager.js';

export class SecuritySystem {
  constructor(renderer, showToast) {
    this.renderer = renderer;
    this.showToast = showToast;

    this.state = 'safe'; // 'safe', 'detecting', 'alert'
    this.maxDetectionRatio = 0; // 0 to 1
    this.isAlarmActive = false;
    this.alarmTimer = 0;
    this.alarmDuration = 30; // 30 seconds alert mode
    this.cosmeticAlarmTimer = 0;
  }

  update(delta, cameras, playerPos) {
    let highestDetection = 0;

    cameras.forEach(cam => {
      const res = cam.update(delta, 0, playerPos, () => {
        this.triggerAlarm('CAMERA_DETECTED');
      });
      if (res.level > highestDetection) {
        highestDetection = res.level;
      }
    });

    this.maxDetectionRatio = highestDetection;

    // Update continuous audio hum based on detection
    if (!this.isAlarmActive) {
      audioManager.updateDetectionHum(this.maxDetectionRatio);
    }

    // Alarm countdown timer
    if (this.isAlarmActive) {
      this.alarmTimer -= delta;
      if (this.alarmTimer <= 0) {
        this.clearAlarm();
      }
    }

    // Cosmetic alarm countdown (plays alarm sound without lockdown)
    if (this.cosmeticAlarmTimer > 0) {
      this.cosmeticAlarmTimer -= delta;
      if (this.cosmeticAlarmTimer <= 0 && !this.isAlarmActive) {
        audioManager.stopAlarm();
      }
    }

    // Determine current general state
    if (this.isAlarmActive) {
      this.state = 'alert';
    } else if (this.maxDetectionRatio > 0.05) {
      this.state = 'detecting';
    } else {
      this.state = 'safe';
    }

    return {
      state: this.state,
      detectionRatio: this.maxDetectionRatio,
      isAlarmActive: this.isAlarmActive,
      alarmTimer: this.alarmTimer
    };
  }

  triggerCosmeticAlarm(duration = 20) {
    if (this.isAlarmActive) return;
    this.cosmeticAlarmTimer = duration;
    audioManager.startAlarm();
  }

  triggerAlarm(reason = 'SECURITY_BREACH') {
    if (this.isAlarmActive) {
      this.alarmTimer = this.alarmDuration; // refresh
      return;
    }

    this.isAlarmActive = true;
    this.alarmTimer = this.alarmDuration;
    this.state = 'alert';

    this.renderer.setAlarmState(true);
    audioManager.updateDetectionHum(0);
    audioManager.startAlarm();

    if (reason === 'VAULT_BREACH') {
      this.showToast('🚨 MAJOR FACILITY ALERT: Vault security triggered! All looting locked for 30s!', 'warning');
    } else if (reason === 'LASER_TRIPPED') {
      this.showToast('⚡ LASER BREACH: Vault tripwire tripped! Facility lockdown — looting disabled for 30s!', 'danger');
    } else {
      this.showToast('🚨 SECURITY ALERT: Camera spotted intrusion! Facility lockdown — looting disabled for 30s!', 'warning');
    }
  }

  clearAlarm() {
    this.isAlarmActive = false;
    this.alarmTimer = 0;
    this.cosmeticAlarmTimer = 0;
    this.state = 'safe';
    this.renderer.setAlarmState(false);
    audioManager.stopAlarm();
    audioManager.stopDetectionHum();
    this.showToast('🟢 Facility security alert subsiding.', 'success');
  }

  reset() {
    this.clearAlarm();
    this.state = 'safe';
    this.maxDetectionRatio = 0;
    this.cosmeticAlarmTimer = 0;
    audioManager.stopDetectionHum();
  }
}
