import { MathUtils } from '../utils/MathUtils.js';
import { Minimap } from '../world/Minimap.js';
import { audioManager } from '../engine/AudioManager.js';

export class HUD {
  constructor() {
    // Elements
    this.hudOverlay = document.getElementById('hud');
    this.playerNameEl = document.getElementById('hud-player-name');
    this.carriedLootEl = document.getElementById('hud-carried-loot');
    this.securedLootEl = document.getElementById('hud-secured-loot');
    this.weightFillEl = document.getElementById('hud-weight-fill');
    this.weightTextEl = document.getElementById('hud-weight-text');
    this.timerEl = document.getElementById('hud-timer');
    this.securityStatusEl = document.getElementById('hud-security-status');
    this.floorNameEl = document.getElementById('hud-floor-name');

    // Keycard slots
    this.kcBlue = document.getElementById('kc-blue');
    this.kcRed = document.getElementById('kc-red');
    this.kcMaster = document.getElementById('kc-master');

    // Vault status
    this.vSwitchA = document.getElementById('v-switch-a');
    this.vSwitchB = document.getElementById('v-switch-b');
    this.vSyncTimer = document.getElementById('v-sync-timer');

    // Crosshair & Interaction
    this.interactionPrompt = document.getElementById('interaction-prompt');
    this.interactionText = document.getElementById('interaction-text');

    // Detection meter
    this.detectionContainer = document.getElementById('detection-meter-container');
    this.detectionFill = document.getElementById('detection-meter-fill');

    // Toast Container
    this.toastContainer = document.getElementById('toast-container');

    // Inventory popup
    this.invPopup = document.getElementById('inventory-popup');
    this.invList = document.getElementById('inventory-items-list');
    this.invWeightCount = document.getElementById('inv-weight-count');
    this.btnCloseInv = document.getElementById('btn-close-inv');

    this.onDropItem = null;
    this.onInventoryToggleCallback = null;
    this.lastInventorySnapshot = null;
    this.lastPlayer = null;

    // Alarm vignette
    this.alarmVignette = document.getElementById('alarm-vignette');

    // Minimap
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapLevel = document.getElementById('minimap-level');
    this.minimap = new Minimap(this.minimapCanvas);

    // Gesture PIP HUD Elements
    this.webcamPip = document.getElementById('webcam-hud-pip');
    this.videoEl = document.getElementById('gesture-webcam');
    this.canvasEl = document.getElementById('gesture-canvas');
    this.gestureStatusPill = document.getElementById('gesture-status-pill');
    this.gestureIconEl = document.getElementById('gesture-icon');
    this.gestureNameEl = document.getElementById('gesture-name');
    this.gestureSteerIndicator = document.getElementById('gesture-steer-indicator');
    this.pipCamDot = document.getElementById('pip-cam-dot');
    this.btnToggleCamPip = document.getElementById('btn-toggle-cam-pip');
    this.btnCloseCamPip = document.getElementById('btn-close-cam-pip');
    this.btnGestureHudToggle = document.getElementById('btn-gesture-hud-toggle');

    this.onToggleGestureCallback = null;
    this.isGestureActive = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.btnToggleCamPip?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePipMinimize();
    });

    this.btnCloseCamPip?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.webcamPip?.classList.add('hidden');
    });
    this.btnCloseInv.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleInventory(false);
    });

    document.getElementById('btn-inventory-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleInventory();
    });

    // Event delegation on inventory list so DROP buttons always work 100% reliably
    this.invList.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropBtn = e.target.closest('.btn-drop-item');
      if (!dropBtn) return;
      const index = parseInt(dropBtn.getAttribute('data-index'), 10);
      if (!isNaN(index) && this.onDropItem) {
        this.onDropItem(index);
        if (this.lastPlayer) {
          this.renderInventoryList(this.lastPlayer);
        }
      }
    });
  }

  show() {
    this.hudOverlay.classList.remove('hidden');
  }

  hide() {
    this.hudOverlay.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  showInteractionPrompt(text) {
    this.interactionText.textContent = text;
    this.interactionPrompt.classList.remove('hidden');
  }

  hideInteractionPrompt() {
    this.interactionPrompt.classList.add('hidden');
  }

  toggleInventory(forceState = null) {
    const isHidden = this.invPopup.classList.contains('hidden');
    const newState = forceState !== null ? forceState : isHidden;

    if (newState) {
      this.invPopup.classList.remove('hidden');
      if (this.lastPlayer) {
        this.renderInventoryList(this.lastPlayer);
      }
    } else {
      this.invPopup.classList.add('hidden');
    }

    if (this.onInventoryToggleCallback) {
      this.onInventoryToggleCallback(newState);
    }
  }

  update(player, matchTimeRemaining, securityState, vaultStatus, facilityMap, onDropItem) {
    this.lastPlayer = player;
    this.onDropItem = onDropItem;

    // 1. Loot & Weight
    this.carriedLootEl.textContent = MathUtils.formatCurrency(player.carriedValue);
    this.securedLootEl.textContent = MathUtils.formatCurrency(player.securedValue);

    const weightPercent = (player.carriedWeight / player.maxWeight) * 100;
    this.weightFillEl.style.width = `${weightPercent}%`;
    this.weightTextEl.textContent = `${player.carriedWeight} / ${player.maxWeight}`;

    if (player.carriedWeight >= player.maxWeight) {
      this.weightFillEl.classList.add('warning');
    } else {
      this.weightFillEl.classList.remove('warning');
    }

    // 2. Match Timer
    this.timerEl.textContent = MathUtils.formatTime(matchTimeRemaining);
    const timerPanel = this.timerEl.closest('.timer-panel');
    if (matchTimeRemaining <= 120) {
      timerPanel.classList.add('urgent');
    } else {
      timerPanel.classList.remove('urgent');
    }

    // 3. Security Status Badge
    if (securityState.state === 'alert') {
      this.securityStatusEl.className = 'security-badge alert';
      const secLeft = Math.max(1, Math.ceil(securityState.alarmTimer || 0));
      this.securityStatusEl.innerHTML = `<span class="status-dot"></span><span class="status-text">🔴 LOCKDOWN (${secLeft}s)</span>`;
      this.alarmVignette.classList.remove('hidden');
    } else if (securityState.state === 'detecting') {
      this.securityStatusEl.className = 'security-badge detecting';
      this.securityStatusEl.innerHTML = '<span class="status-dot"></span><span class="status-text">🟡 DETECTING</span>';
      this.alarmVignette.classList.add('hidden');
    } else {
      this.securityStatusEl.className = 'security-badge safe';
      this.securityStatusEl.innerHTML = '<span class="status-dot"></span><span class="status-text">🟢 SAFE</span>';
      this.alarmVignette.classList.add('hidden');
    }

    // 4. Detection Alert Bar
    if (securityState.detectionRatio > 0.05 && !securityState.isAlarmActive) {
      this.detectionContainer.classList.remove('hidden');
      this.detectionFill.style.width = `${securityState.detectionRatio * 100}%`;
    } else {
      this.detectionContainer.classList.add('hidden');
    }

    // 5. Active Floor
    const floor = player.getCurrentFloor();
    this.floorNameEl.textContent = floor;
    this.minimapLevel.textContent = floor.split(' ')[0];

    // 6. Keycard Indicators
    this.kcBlue.className = `keycard-slot ${player.keycards.has('blue') || player.keycards.has('master') ? 'active' : ''}`;
    this.kcRed.className = `keycard-slot ${player.keycards.has('red') || player.keycards.has('master') ? 'active' : ''}`;
    this.kcMaster.className = `keycard-slot ${player.keycards.has('master') ? 'active' : ''}`;

    // 7. Vault Switch Indicators
    this.vSwitchA.className = `v-switch ${vaultStatus.switchA ? 'active' : ''}`;
    this.vSwitchA.querySelector('.v-state').textContent = vaultStatus.switchA ? 'ACTIVE' : 'OFF';

    this.vSwitchB.className = `v-switch ${vaultStatus.switchB ? 'active' : ''}`;
    this.vSwitchB.querySelector('.v-state').textContent = vaultStatus.switchB ? 'ACTIVE' : 'OFF';

    if (vaultStatus.hasActiveTimer) {
      this.vSyncTimer.classList.remove('hidden');
      this.vSyncTimer.textContent = `SYNC WINDOW: ${vaultStatus.syncTimer}s`;
    } else {
      this.vSyncTimer.classList.add('hidden');
    }

    // 8. Render Minimap
    this.minimap.render(player, facilityMap);

    // 9. Update Inventory Panel ONLY when opened or when items change
    if (!this.invPopup.classList.contains('hidden')) {
      const snapshot = player.carriedLoot.map(i => i.type.id).join('|');
      if (this.lastInventorySnapshot !== snapshot) {
        this.lastInventorySnapshot = snapshot;
        this.renderInventoryList(player);
      }
    } else {
      this.lastInventorySnapshot = null;
    }
  }

  renderInventoryList(player) {
    this.invWeightCount.textContent = player.carriedWeight;
    this.invList.innerHTML = '';

    if (player.carriedLoot.length === 0) {
      this.invList.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 18px 8px; font-size: 13px;">🎒 Bag is empty.<br>Explore rooms to pick up loot [E]!</div>';
      return;
    }

    player.carriedLoot.forEach((loot, idx) => {
      const row = document.createElement('div');
      row.className = 'inv-item-row';
      row.innerHTML = `
        <div class="inv-item-info">
          <span class="inv-item-name">${loot.type.icon} ${loot.type.name}</span>
          <span class="inv-item-stats">${MathUtils.formatCurrency(loot.type.value)} • ${loot.type.weight} Weight</span>
        </div>
        <button class="btn-drop-item" data-index="${idx}" title="Drop this item [or press Q]">DROP</button>
      `;
      this.invList.appendChild(row);
    });
  }

  togglePipMinimize() {
    if (!this.webcamPip) return;
    this.webcamPip.classList.toggle('minimized');
    const isMin = this.webcamPip.classList.contains('minimized');
    if (this.btnToggleCamPip) {
      this.btnToggleCamPip.textContent = isMin ? '□' : '_';
    }
  }

  setGestureActive(active) {
    this.isGestureActive = active;
    if (this.btnGestureHudToggle) {
      if (active) {
        this.btnGestureHudToggle.classList.add('active');
        this.btnGestureHudToggle.innerHTML = '🖐️ GESTURES [G]: <span class="neon-green">ON</span>';
      } else {
        this.btnGestureHudToggle.classList.remove('active');
        this.btnGestureHudToggle.innerHTML = '🖐️ GESTURES [G]: OFF';
      }
    }
    if (this.webcamPip) {
      if (active) {
        this.webcamPip.classList.remove('hidden');
      } else {
        this.webcamPip.classList.add('hidden');
      }
    }
  }

  updateGestureTelemetry(gestureName, details = null) {
    if (!this.gestureStatusPill || !this.gestureIconEl || !this.gestureNameEl) return;

    this.gestureStatusPill.className = 'gesture-badge';

    switch (gestureName) {
      case 'FORWARD':
      case 'PALM_FORWARD':
        this.gestureIconEl.textContent = '🖐️';
        this.gestureNameEl.textContent = 'FORWARD';
        this.gestureStatusPill.classList.add('forward');
        break;
      case 'PINCH':
      case 'PINCH_INTERACT':
      case 'PINCH_LOOT':
        this.gestureIconEl.textContent = '👌';
        this.gestureNameEl.textContent = 'INTERACT / LOOT';
        this.gestureStatusPill.classList.add('interact');
        break;
      case 'IDLE':
      case 'FIST_STOP':
        this.gestureIconEl.textContent = '✊';
        this.gestureNameEl.textContent = 'IDLE';
        this.gestureStatusPill.classList.add('stop');
        break;
      case 'NO_HAND':
        this.gestureIconEl.textContent = '🔍';
        this.gestureNameEl.textContent = 'SEARCHING HAND';
        break;
      default:
        this.gestureIconEl.textContent = '🖐️';
        this.gestureNameEl.textContent = gestureName || 'IDLE';
        break;
    }

    if (this.gestureSteerIndicator) {
      this.gestureSteerIndicator.style.left = '50%';
    }
  }

  setGestureStatus(status, message = '') {
    if (!this.pipCamDot || !this.gestureNameEl) return;
    if (status === 'TRACKING') {
      this.pipCamDot.className = 'pip-pulse-dot';
      this.gestureNameEl.textContent = 'TRACKING LIVE';
    } else if (status === 'LOADING_MODEL' || status === 'STARTING_CAMERA') {
      this.pipCamDot.className = 'pip-pulse-dot warning';
      this.gestureNameEl.textContent = 'CONNECTING...';
    } else if (status === 'CAMERA_DENIED' || status === 'ERROR') {
      this.pipCamDot.className = 'pip-pulse-dot danger';
      this.gestureNameEl.textContent = 'CAM ERROR';
      this.showToast(`⚠️ Webcam: ${message || 'Permission denied'}`, 'danger');
    } else if (status === 'STOPPED') {
      this.pipCamDot.className = 'pip-pulse-dot warning';
      this.gestureNameEl.textContent = 'STANDBY';
    }
  }
}
