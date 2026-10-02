import * as THREE from 'three';
import { Renderer } from './engine/Renderer.js';
import { InputManager } from './engine/InputManager.js';
import { physics } from './engine/Physics.js';
import { audioManager } from './engine/AudioManager.js';
import { FacilityMap } from './world/FacilityMap.js';
import { Player } from './entities/Player.js';
import { SecuritySystem } from './mechanics/SecuritySystem.js';
import { KeycardSystem } from './mechanics/KeycardSystem.js';
import { VaultPuzzle } from './mechanics/VaultPuzzle.js';
import { ExtractionSystem } from './mechanics/ExtractionSystem.js';
import { HUD } from './ui/HUD.js';
import { MainMenu } from './ui/MainMenu.js';
import { LeaderboardView } from './ui/LeaderboardView.js';
import { ResultsModal } from './ui/ResultsModal.js';
import { MathUtils } from './utils/MathUtils.js';
import { GestureController } from './engine/GestureController.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'EXTRACT_PROMPT', 'GAME_OVER'

    // Core Engine Subsystems
    this.renderer = new Renderer(this.canvas);
    this.input = new InputManager(this.canvas);
    this.gestureController = new GestureController(this.input);
    this.isGestureControlActive = false;
    this.facilityMap = new FacilityMap(this.renderer.scene, physics);
    this.player = new Player(this.renderer.camera, physics);

    // UI Subsystems
    this.hud = new HUD();
    this.leaderboardView = new LeaderboardView();
    this.resultsModal = new ResultsModal(this.leaderboardView);

    // Setup Gesture Controller Handlers
    this.gestureController.onGestureDetected = (gesture, details) => {
      this.hud.updateGestureTelemetry(gesture, details);
    };
    this.gestureController.onStatusChanged = (status, msg) => {
      this.hud.setGestureStatus(status, msg);
    };
    this.hud.onToggleGestureCallback = (enable) => {
      this.toggleGestureControl(enable);
    };

    // Mechanics Subsystems
    this.securitySystem = new SecuritySystem(this.renderer, (msg, type) => this.hud.showToast(msg, type));
    this.keycardSystem = new KeycardSystem(this.player, this.facilityMap, (msg, type) => this.hud.showToast(msg, type));
    this.vaultPuzzle = new VaultPuzzle(this.facilityMap, this.securitySystem, (msg, type) => this.hud.showToast(msg, type));
    this.extractionSystem = new ExtractionSystem(this.player, this.facilityMap, (zone) => this.onExtractionZoneTriggered(zone));

    // Game Session Stats
    this.playerName = 'CYBER_GHOST';
    this.difficulty = 'normal';
    this.matchDuration = 900; // 15 minutes default
    this.timeRemaining = 900;
    this.timeElapsed = 0;

    // Timer tracking
    this.lastTime = performance.now();

    // Extraction Modal Elements
    this.extractModal = document.getElementById('modal-extract-confirm');
    this.extractPointLabel = document.getElementById('extract-point-label');
    this.extractModalCarried = document.getElementById('extract-modal-carried');
    this.extractModalSecured = document.getElementById('extract-modal-secured');
    this.extractModalTotal = document.getElementById('extract-modal-total');

    // Elevator Modal Elements
    this.elevatorModal = document.getElementById('modal-elevator');

    this.activeExtractZone = null;
    this.currentInteractive = null;

    this.initMainMenu();
    this.setupInputCallbacks();
    this.setupExtractionModalListeners();
    this.setupElevatorModalListeners();
    this.setupQuickHUDButtons();

    // Add Player Mesh to Scene
    this.renderer.scene.add(this.player.mesh);

    // Start Main Render / Game Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initMainMenu() {
    this.mainMenu = new MainMenu({
      onStartGame: (cfg) => this.startGame(cfg),
      onSettingsChanged: (cfg) => {
        if (cfg.sens) this.input.setSensitivity(cfg.sens);
        if (cfg.graphics) this.renderer.setGraphicsQuality(cfg.graphics);
        if (cfg.gesturePip === 'minimized') {
          this.hud.webcamPip?.classList.add('minimized');
        } else if (cfg.gesturePip === 'hidden') {
          this.hud.webcamPip?.classList.add('hidden');
        } else if (cfg.gesturePip === 'show' && this.isGestureControlActive) {
          this.hud.webcamPip?.classList.remove('hidden');
          this.hud.webcamPip?.classList.remove('minimized');
        }
      }
    });

    document.getElementById('btn-leaderboard').addEventListener('click', () => {
      this.leaderboardView.show();
    });
  }

  setupInputCallbacks() {
    this.input.callbacks.onInteract = () => {
      if (this.state !== 'PLAYING') return;
      this.handlePlayerInteraction();
    };

    this.input.callbacks.onQuickDrop = () => {
      if (this.state === 'PLAYING' && this.player.carriedLoot.length > 0) {
        const dropped = this.player.dropLoot(this.player.carriedLoot.length - 1);
        if (dropped) {
          audioManager.playDoorOpen();
          this.hud.showToast(`🗑️ Dropped ${dropped.type.name} (-${dropped.type.weight}W)`, 'info');
        }
      }
    };

    this.input.callbacks.onToggleInventory = () => {
      if (this.state === 'PLAYING') {
        this.hud.toggleInventory();
      }
    };

    this.hud.onInventoryToggleCallback = (isOpen) => {
      if (isOpen) {
        this.input.exitPointerLock();
      } else {
        if (this.state === 'PLAYING') {
          this.input.requestPointerLock();
        }
      }
    };

    this.input.callbacks.onToggleHowToPlay = () => {
      if (this.state === 'PLAYING') {
        const modal = document.getElementById('modal-how-to-play');
        const isHidden = modal.classList.contains('hidden');
        if (isHidden) {
          modal.classList.remove('hidden');
          this.input.exitPointerLock();
        } else {
          modal.classList.add('hidden');
          this.input.requestPointerLock();
        }
      }
    };

    let lastMovementReminderTime = 0;
    this.input.callbacks.onKeyboardMovementAttempt = () => {
      const now = performance.now();
      if (now - lastMovementReminderTime > 3500 && this.state === 'PLAYING') {
        lastMovementReminderTime = now;
        this.hud.showToast('🖐️ Operative is controlled using 3 Hand Gestures + Mouse Look (Open Palm = Walk, Pinch = Interact, Fist = Stop)', 'info');
      }
    };

    this.input.callbacks.onToggleGesture = () => {
      if (this.state === 'PLAYING' && this.hud.webcamPip) {
        this.hud.webcamPip.classList.toggle('hidden');
      }
    };

    this.input.callbacks.onEscape = () => {
      if (this.state === 'PLAYING') {
        if (!this.elevatorModal.classList.contains('hidden')) {
          this.closeElevatorModal();
          return;
        }
        if (!this.hud.invPopup.classList.contains('hidden')) {
          this.hud.toggleInventory(false);
          return;
        }
        if (!document.getElementById('modal-how-to-play').classList.contains('hidden')) {
          document.getElementById('modal-how-to-play').classList.add('hidden');
          this.input.requestPointerLock();
          return;
        }
        this.pauseGame();
      }
    };

    this.canvas.addEventListener('click', () => {
      if (this.state === 'PLAYING' && this.hud.invPopup.classList.contains('hidden') && this.elevatorModal.classList.contains('hidden')) {
        this.input.requestPointerLock();
      }
    });
  }

  setupElevatorModalListeners() {
    const floorButtons = this.elevatorModal.querySelectorAll('.elevator-floor-btn');
    floorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const floorKey = btn.getAttribute('data-floor');
        if (floorKey === 'rooftop') {
          const hasHelipadAccess = (this.player.hasKeycard('blue') && this.player.hasKeycard('red')) || this.player.hasKeycard('master');
          if (!hasHelipadAccess) {
            audioManager.playAccessDenied();
            this.hud.showToast('🔒 ACCESS DENIED: Rooftop Helipad requires BOTH Blue & Red Keycards!', 'danger');
            return;
          }
        }
        const targetY = parseFloat(btn.getAttribute('data-y'));
        const floorTitle = btn.querySelector('.floor-title').textContent;
        this.travelToFloor(targetY, floorTitle);
      });
    });

    document.getElementById('btn-close-elevator').addEventListener('click', () => {
      this.closeElevatorModal();
    });

    document.getElementById('btn-cancel-elevator').addEventListener('click', () => {
      this.closeElevatorModal();
    });
  }

  openElevatorModal() {
    const hasHelipadAccess = (this.player.hasKeycard('blue') && this.player.hasKeycard('red')) || this.player.hasKeycard('master');
    const roofBtn = this.elevatorModal.querySelector('.elevator-floor-btn[data-floor="rooftop"]');
    if (roofBtn) {
      const titleEl = roofBtn.querySelector('.floor-title');
      const descEl = roofBtn.querySelector('.floor-desc');
      if (hasHelipadAccess) {
        roofBtn.classList.remove('locked');
        if (titleEl) titleEl.textContent = '🔓 ROOFTOP HELIPAD (CLEARANCE VERIFIED)';
        if (descEl) descEl.textContent = 'Helipad Extraction Zone [High Risk / Top Bonus]';
      } else {
        roofBtn.classList.add('locked');
        if (titleEl) titleEl.textContent = '🔒 ROOFTOP HELIPAD (LOCKED)';
        if (descEl) descEl.textContent = 'REQUIRES BOTH BLUE & RED KEYCARDS TO UNLOCK ELEVATOR ACCESS';
      }
    }

    this.elevatorModal.classList.remove('hidden');
    this.input.exitPointerLock();
  }

  closeElevatorModal() {
    this.elevatorModal.classList.add('hidden');
    if (this.state === 'PLAYING') {
      this.input.requestPointerLock();
    }
  }

  travelToFloor(targetY, floorName) {
    this.closeElevatorModal();
    this.player.useElevator(new THREE.Vector3(0, targetY, 0));
    audioManager.playDoorOpen();
    this.hud.showToast(`🛗 ELEVATOR ARRIVED: ${floorName.toUpperCase()}`, 'success');
  }

  setupExtractionModalListeners() {
    document.getElementById('btn-extract-and-finish').addEventListener('click', () => {
      this.finishHeistWithExtraction();
    });

    document.getElementById('btn-extract-and-continue').addEventListener('click', () => {
      this.secureAndContinueHeist();
    });

    document.getElementById('btn-cancel-extract').addEventListener('click', () => {
      this.extractModal.classList.add('hidden');
      this.state = 'PLAYING';
      this.input.requestPointerLock();
    });
  }

  setupQuickHUDButtons() {
    document.getElementById('btn-controls-quick').addEventListener('click', () => {
      document.getElementById('modal-how-to-play').classList.remove('hidden');
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      this.pauseGame();
    });
  }

  async toggleGestureControl(enable = true) {
    this.isGestureControlActive = Boolean(enable);
    this.hud.setGestureActive(this.isGestureControlActive);

    if (this.isGestureControlActive) {
      const video = document.getElementById('gesture-webcam');
      const canvas = document.getElementById('gesture-canvas');
      this.hud.showToast('🖐️ NEURAL HAND TRACKER: INITIALIZING...', 'info');
      const ok = await this.gestureController.start(video, canvas);
      if (ok) {
        this.hud.showToast('✅ NEURAL TRACKER ACTIVE: Open Palm = Walk, Pinch = Interact, Fist = Stop, Mouse = Aim!', 'success');
      } else {
        this.hud.showToast('⚠️ Could not start webcam tracking. Please grant camera permissions.', 'danger');
      }
    } else {
      this.gestureController.stop();
    }
  }

  startGame(config = {}) {
    this.playerName = (config && config.name) || 'CYBER_GHOST';
    this.difficulty = (config && config.difficulty) || 'normal';

    // Start Webcam Gesture Tracking (Player is controlled solely using 3 hand gestures + mouse)
    this.toggleGestureControl(true);

    // 15 minutes match duration (difficulty-adjusted)
    if (this.difficulty === 'easy') {
      this.matchDuration = 1080; // 18 mins
    } else if (this.difficulty === 'hard') {
      this.matchDuration = 720; // 12 mins
    } else {
      this.matchDuration = 900; // 15 mins
    }

    this.timeRemaining = this.matchDuration;
    this.timeElapsed = 0;

    // Reset components
    this.player.reset(new THREE.Vector3(0, 0, 10), this.playerName);
    const nameEl = document.getElementById('hud-player-name');
    if (nameEl) {
      nameEl.textContent = this.playerName.toUpperCase();
    }
    
    this.facilityMap.reset();
    this.securitySystem.reset();
    this.vaultPuzzle.reset();

    this.state = 'PLAYING';
    this.hud.show();
    this.hud.toggleInventory(false);
    this.input.requestPointerLock();
    try {
      audioManager.startMusic();
    } catch (e) {
      console.warn('Could not start music automatically:', e);
    }
    this.hud.showToast('🏢 FACILITY INFILTRATED: Collect loot & find keycards!', 'info');
  }

  pauseGame() {
    this.state = 'PAUSED';
    this.input.exitPointerLock();
    this.mainMenu.showPauseModal(
      () => {
        // Resume
        this.state = 'PLAYING';
        this.input.requestPointerLock();
      },
      () => {
        // Abort to menu
        this.state = 'MENU';
        if (this.isGestureControlActive) {
          this.gestureController.stop();
          this.hud.setGestureActive(false);
        }
        this.hud.hide();
        this.mainMenu.showMainMenu();
        audioManager.stopMusic();
        audioManager.stopAlarm();
      }
    );
  }

  onExtractionZoneTriggered(zone) {
    this.activeExtractZone = zone;
    this.state = 'EXTRACT_PROMPT';
    this.input.exitPointerLock();

    this.extractPointLabel.textContent = `${zone.name.toUpperCase()} (${zone.difficulty.toUpperCase()} ROUTE)`;
    this.extractModalCarried.textContent = MathUtils.formatCurrency(this.player.carriedValue);
    this.extractModalSecured.textContent = MathUtils.formatCurrency(this.player.securedValue);
    this.extractModalTotal.textContent = MathUtils.formatCurrency(this.player.securedValue + this.player.carriedValue);

    this.extractModal.classList.remove('hidden');
  }

  secureAndContinueHeist() {
    const secured = this.player.secureCarriedLoot();
    audioManager.playPickupLoot(25000);
    this.hud.showToast(`💵 ${MathUtils.formatCurrency(secured)} SECURED PERMANENTLY! Carrying capacity cleared.`, 'success');
    this.extractModal.classList.add('hidden');
    this.state = 'PLAYING';
    this.input.requestPointerLock();
  }

  finishHeistWithExtraction() {
    this.extractModal.classList.add('hidden');
    this.state = 'GAME_OVER';
    this.input.exitPointerLock();

    const finalSecured = this.player.securedValue + this.player.carriedValue;
    this.player.secureCarriedLoot();

    if (this.isGestureControlActive) {
      this.gestureController.stop();
      this.hud.setGestureActive(false);
    }

    audioManager.stopMusic();
    audioManager.stopAlarm();
    audioManager.playVictoryFanfare();

    // Score calculation
    const timeBonus = Math.round(Math.max(0, this.timeRemaining) * 4);
    const vaultBonus = this.vaultPuzzle.isVaultUnlocked ? 2000 : 0;
    const extractionBonus = this.extractionSystem.getExtractionBonus(this.activeExtractZone ? this.activeExtractZone.id : 'main');
    const finalScore = Math.round(finalSecured / 10) + timeBonus + vaultBonus + extractionBonus;

    this.hud.hide();
    this.resultsModal.show(
      {
        isVictory: true,
        playerName: this.playerName,
        extractedMoney: finalSecured,
        timeElapsed: this.timeElapsed,
        lootCount: this.player.totalItemsCollectedCount,
        isVaultCracked: this.vaultPuzzle.isVaultUnlocked,
        finalScore,
        extractionName: this.activeExtractZone ? this.activeExtractZone.name : 'Main Exit'
      },
      () => this.startGame({ name: this.playerName, difficulty: this.difficulty }),
      () => {
        this.state = 'MENU';
        this.mainMenu.showMainMenu();
      }
    );
  }

  onMatchTimeExpired() {
    this.state = 'GAME_OVER';
    this.input.exitPointerLock();

    // Carried loot is lost! Only secured loot counts
    const lostLoot = this.player.loseCarriedLoot();

    if (this.isGestureControlActive) {
      this.gestureController.stop();
      this.hud.setGestureActive(false);
    }

    audioManager.stopMusic();
    audioManager.stopAlarm();
    audioManager.playBustedSound();

    if (lostLoot > 0) {
      this.hud.showToast(`🚨 HEIST TIME EXPIRED: ${MathUtils.formatCurrency(lostLoot)} in carried loot was lost!`, 'warning');
    }

    const finalSecured = this.player.securedValue;
    const vaultBonus = this.vaultPuzzle.isVaultUnlocked ? 1500 : 0;
    const finalScore = Math.round(finalSecured / 10) + vaultBonus;

    this.hud.hide();
    this.resultsModal.show(
      {
        isVictory: false,
        playerName: this.playerName,
        extractedMoney: finalSecured,
        timeElapsed: this.matchDuration,
        lootCount: this.player.totalItemsCollectedCount,
        isVaultCracked: this.vaultPuzzle.isVaultUnlocked,
        finalScore,
        extractionName: 'Time Expired'
      },
      () => this.startGame({ name: this.playerName, difficulty: this.difficulty }),
      () => {
        this.state = 'MENU';
        this.mainMenu.showMainMenu();
      }
    );
  }

  handlePlayerInteraction() {
    if (!this.currentInteractive) return;

    const { type, object } = this.currentInteractive;

    if (type === 'loot') {
      if (this.securitySystem.isAlarmActive) {
        audioManager.playAccessDenied();
        const secLeft = Math.max(1, Math.ceil(this.securitySystem.alarmTimer));
        this.hud.showToast(`🚨 FACILITY LOCKDOWN: Looting disabled for ${secLeft}s!`, 'danger');
        return;
      }
      const res = this.player.addLoot(object);
      if (res.success) {
        audioManager.playPickupLoot(object.type.value);
        this.hud.showToast(`💰 Picked up ${object.type.name} (+${MathUtils.formatCurrency(object.type.value)})`, 'success');
      } else if (res.reason === 'TOO_HEAVY') {
        audioManager.playTooHeavy();
        this.hud.showToast('⚠️ TOO HEAVY! Inventory exceeds 10 Weight units. Drop an item [I] first.', 'warning');
      }
    } else if (type === 'glass_case') {
      if (this.securitySystem.isAlarmActive) {
        audioManager.playAccessDenied();
        const secLeft = Math.max(1, Math.ceil(this.securitySystem.alarmTimer));
        this.hud.showToast(`🚨 FACILITY LOCKDOWN: Display case locks jammed for ${secLeft}s!`, 'danger');
        return;
      }
      object.open();
      audioManager.playGlassCaseOpen();
      this.hud.showToast(`🔓 Opened display case! ${object.name} exposed.`, 'success');
    } else if (type === 'safe') {
      if (this.securitySystem.isAlarmActive) {
        audioManager.playAccessDenied();
        const secLeft = Math.max(1, Math.ceil(this.securitySystem.alarmTimer));
        this.hud.showToast(`🚨 FACILITY LOCKDOWN: Safe tumblers locked for ${secLeft}s!`, 'danger');
        return;
      }
      object.open();
      audioManager.playSafeCrack();
      this.hud.showToast(`🔓 Cracked safe! ${object.name} revealed.`, 'success');
    } else if (type === 'door') {
      this.keycardSystem.checkDoorInteraction(object);
    } else if (type === 'elevator') {
      this.openElevatorModal();
    } else if (type === 'switch') {
      this.vaultPuzzle.activateSwitch(object);
    } else if (type === 'laser_terminal') {
      if (object.isDeactivated) {
        this.hud.showToast('ℹ️ Laser Grid is already offline.', 'info');
        return;
      }
      const hasKeycard = this.player.keycards.has('master');
      if (hasKeycard) {
        object.deactivate();
        audioManager.playLaserDeactivated();
        this.hud.showToast('⚡ MASTER CLEARANCE VERIFIED: Laser grid permanently deactivated!', 'success');
      } else {
        audioManager.playAccessDenied();
        this.hud.showToast('🔒 ACCESS DENIED: Master Keycard required to shut off laser grid!', 'warning');
      }
    } else if (type === 'extract') {
      this.onExtractionZoneTriggered(object);
    }
  }

  checkInteractionTarget() {
    let nearestInteractive = null;
    let minDist = 3.6;

    const isLockdown = this.securitySystem.isAlarmActive;
    const secLeft = Math.max(1, Math.ceil(this.securitySystem.alarmTimer));

    // 1. Check Glass Display Cases
    if (this.facilityMap.glassCases) {
      for (const gc of this.facilityMap.glassCases) {
        if (gc.isOpen) continue;
        const dist = this.player.position.distanceTo(gc.position);
        if (dist < gc.interactionRadius && dist < minDist) {
          minDist = dist;
          nearestInteractive = {
            type: 'glass_case',
            object: gc,
            promptText: isLockdown
              ? `🔒 LOCKDOWN: CASE LOCKED (${secLeft}s)`
              : `OPEN DISPLAY CASE [${gc.name.toUpperCase()}]`
          };
        }
      }
    }

    // 2. Check Armored Safes
    if (this.facilityMap.safes) {
      for (const safe of this.facilityMap.safes) {
        if (safe.isOpen) continue;
        const dist = this.player.position.distanceTo(safe.position);
        if (dist < safe.interactionRadius && dist < minDist) {
          minDist = dist;
          nearestInteractive = {
            type: 'safe',
            object: safe,
            promptText: isLockdown
              ? `🔒 LOCKDOWN: SAFE LOCKED (${secLeft}s)`
              : `CRACK SAFE [${safe.name.toUpperCase()}]`
          };
        }
      }
    }

    // 3. Check Loot Items (Only if not contained inside an unopened case/safe)
    for (const loot of this.facilityMap.lootItems) {
      if (loot.isCollected || loot.inContainer) continue;
      const dist = this.player.position.distanceTo(loot.mesh.position);
      if (dist < loot.interactionRadius && dist < minDist) {
        minDist = dist;
        nearestInteractive = {
          type: 'loot',
          object: loot,
          promptText: isLockdown
            ? `🔒 LOCKDOWN: LOOTING LOCKED (${secLeft}s)`
            : `PICK UP ${loot.type.name.toUpperCase()} (${MathUtils.formatCurrency(loot.type.value)} | W:${loot.type.weight})`
        };
      }
    }

    // 2. Check Switch A & Switch B
    if (this.facilityMap.switchA && !this.facilityMap.switchA.isActive) {
      const distA = this.player.position.distanceTo(this.facilityMap.switchA.position);
      if (distA < 2.5 && distA < minDist) {
        minDist = distA;
        nearestInteractive = {
          type: 'switch',
          object: this.facilityMap.switchA,
          promptText: 'ACTIVATE SWITCH A'
        };
      }
    }

    if (this.facilityMap.switchB && !this.facilityMap.switchB.isActive) {
      const distB = this.player.position.distanceTo(this.facilityMap.switchB.position);
      if (distB < 2.5 && distB < minDist) {
        minDist = distB;
        nearestInteractive = {
          type: 'switch',
          object: this.facilityMap.switchB,
          promptText: 'ACTIVATE SWITCH B'
        };
      }
    }

    // 3. Check Central Unified Elevator
    for (const lift of this.facilityMap.elevators) {
      const dist = this.player.position.distanceTo(lift.position);
      if (dist < lift.radius && dist < minDist) {
        minDist = dist;
        nearestInteractive = {
          type: 'elevator',
          object: lift,
          promptText: 'USE CENTRAL ELEVATOR (SELECT FLOOR)'
        };
      }
    }

    // 4. Check Laser Override Terminal
    if (this.facilityMap.laserGrid && this.facilityMap.laserGrid.terminal) {
      const term = this.facilityMap.laserGrid.terminal;
      const dist = this.player.position.distanceTo(term.position);
      if (dist < term.interactionRadius && dist < minDist) {
        minDist = dist;
        const isDeactivated = this.facilityMap.laserGrid.isDeactivated;
        const hasKeycard = this.player.keycards.has('master');
        nearestInteractive = {
          type: 'laser_terminal',
          object: this.facilityMap.laserGrid,
          promptText: isDeactivated
            ? '⚡ LASER GRID: OFFLINE'
            : hasKeycard
              ? 'SHUT OFF LASER GRID [MASTER KEYCARD READY]'
              : 'LASER OVERRIDE TERMINAL [REQUIRES MASTER KEYCARD]'
        };
      }
    }

    // 5. Check Extraction Zones
    for (const zone of this.facilityMap.extractionZones) {
      const dist = this.player.position.distanceTo(zone.position);
      if (dist < zone.radius && dist < minDist) {
        minDist = dist;
        nearestInteractive = {
          type: 'extract',
          object: zone,
          promptText: `EXTRACT LOOT AT ${zone.name.toUpperCase()}`
        };
      }
    }

    this.currentInteractive = nearestInteractive;

    if (this.currentInteractive) {
      this.hud.showInteractionPrompt(this.currentInteractive.promptText);
    } else {
      this.hud.hideInteractionPrompt();
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    const time = now / 1000;

    if (this.state === 'PLAYING') {
      // 1. Update Match Timer
      this.timeRemaining -= delta;
      this.timeElapsed += delta;

      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.onMatchTimeExpired();
        return;
      }

      // 2. Update Player
      this.player.update(delta, this.input, time);


      // Footsteps audio check
      if (this.player.isGrounded && (this.input.keys.forward || this.input.keys.backward || this.input.keys.left || this.input.keys.right)) {
        if (!this.lastFootstepTime || time - this.lastFootstepTime > (this.input.keys.sprint ? 0.26 : 0.38)) {
          this.lastFootstepTime = time;
          audioManager.playFootstep();
        }
      }

      // 3. Update Facility Map Props & Laser Grid
      this.facilityMap.update(
        delta,
        time,
        this.player.position,
        () => {
          audioManager.playLaserZap();
          this.securitySystem.triggerAlarm('LASER_TRIPPED');
        }
      );

      // 4. Update Mechanics
      this.keycardSystem.update();
      this.vaultPuzzle.update(delta);

      // 5. Update Security & Cameras
      const securityState = this.securitySystem.update(delta, this.facilityMap.cameras, this.player.position);
      this.renderer.updateAlarmLights(time);

      // 6. Check Extraction Proximity
      this.extractionSystem.update();

      // 7. Check Interaction Target
      this.checkInteractionTarget();

      // 8. Update HUD
      const vaultStatus = this.vaultPuzzle.getStatus();
      this.hud.update(
        this.player,
        this.timeRemaining,
        securityState,
        vaultStatus,
        this.facilityMap,
        (dropIndex) => {
          const dropped = this.player.dropLoot(dropIndex);
          if (dropped) {
            audioManager.playDoorOpen();
            this.hud.showToast(`Dropped ${dropped.type.name}`, 'info');
          }
        }
      );
    }

    // Always render 3D Scene
    this.renderer.render();
  }
}

// Instantiate Game on DOM Ready
function initGame() {
  if (!window.gameInstance) {
    window.gameInstance = new Game();
    window.game = window.gameInstance;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
