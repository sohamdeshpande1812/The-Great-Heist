import { audioManager } from '../engine/AudioManager.js';

export class MainMenu {
  constructor(options = {}) {
    this.onStartGame = options.onStartGame;
    this.onSettingsChanged = options.onSettingsChanged;
    this.onResumeSession = options.onResumeSession;

    // Screens & Modals
    this.mainMenuScreen = document.getElementById('main-menu');
    this.htpModal = document.getElementById('modal-how-to-play');
    this.settingsModal = document.getElementById('modal-settings');
    this.pauseModal = document.getElementById('modal-pause');

    // Inputs
    this.nameInput = document.getElementById('player-name-input');
    this.nameInputWrapper = document.getElementById('name-input-wrapper');
    this.nameErrorMsg = document.getElementById('name-error-msg');
    this.nameStatusHint = document.getElementById('name-status-hint');
    this.diffSelect = document.getElementById('difficulty-select');

    // Menu Buttons
    this.btnPlay = document.getElementById('btn-play');
    this.btnResumeSession = document.getElementById('btn-resume-session');
    this.btnHowToPlay = document.getElementById('btn-how-to-play');
    this.btnLeaderboard = document.getElementById('btn-leaderboard');
    this.btnSettings = document.getElementById('btn-settings');

    // How to Play Modal Buttons
    this.btnCloseHtp = document.getElementById('btn-close-htp');
    this.btnHtpGotIt = document.getElementById('btn-htp-got-it');

    // Settings Inputs
    this.masterVol = document.getElementById('setting-master-volume');
    this.sfxVol = document.getElementById('setting-sfx-volume');
    this.musicVol = document.getElementById('setting-music-volume');
    this.sensSlider = document.getElementById('setting-sensitivity');
    this.graphicsPreset = document.getElementById('setting-graphics');
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.btnSaveSettings = document.getElementById('btn-save-settings');
    this.settingGestureEnable = document.getElementById('setting-gesture-enable');
    this.settingGesturePip = document.getElementById('setting-gesture-pip');

    // Fixed Operative Control Protocol (3 Hand Gestures + Mouse)
    this.controlScheme = 'gesture';

    // Pause Modal Buttons
    this.btnResume = document.getElementById('btn-resume');
    this.btnPauseSave = document.getElementById('btn-pause-save');
    this.btnPauseLoad = document.getElementById('btn-pause-load');
    this.btnPauseHtp = document.getElementById('btn-pause-htp');
    this.btnAbort = document.getElementById('btn-abort');

    this.setupListeners();
    this.setupNameValidation();
    this.initClock();
    this.initCardTilt();
    this.initMenuParticles();
    this.setupAudioInteractions();
  }

  setupListeners() {
    // Start Game
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        const validName = this.validateName(true);
        if (!validName) {
          return; // Block start until a new name is entered!
        }

        try {
          audioManager.ensureContext();
          audioManager.playKeycardChime();
        } catch (err) {
          console.warn('Audio start error:', err);
        }

        const difficulty = (this.diffSelect && this.diffSelect.value) || 'normal';

        this.hideMainMenu();

        if (this.onStartGame) {
          this.onStartGame({
            name: validName,
            difficulty,
            controlScheme: 'gesture'
          });
        }
      });
    }

    // Resume Session
    if (this.btnResumeSession) {
      this.btnResumeSession.addEventListener('click', () => {
        if (this.onResumeSession) {
          this.onResumeSession();
        }
      });
    }

    // How to Play
    if (this.btnHowToPlay) {
      this.btnHowToPlay.addEventListener('click', () => {
        this.htpModal.classList.remove('hidden');
      });
    }
    if (this.btnCloseHtp) {
      this.btnCloseHtp.addEventListener('click', () => {
        this.htpModal.classList.add('hidden');
      });
    }
    if (this.btnHtpGotIt) {
      this.btnHtpGotIt.addEventListener('click', () => {
        this.htpModal.classList.add('hidden');
      });
    }

    // Settings
    if (this.btnSettings) {
      this.btnSettings.addEventListener('click', () => {
        this.settingsModal.classList.remove('hidden');
      });
    }
    if (this.btnCloseSettings) {
      this.btnCloseSettings.addEventListener('click', () => {
        this.settingsModal.classList.add('hidden');
      });
    }
    if (this.btnSaveSettings) {
      this.btnSaveSettings.addEventListener('click', () => {
        this.applySettings();
        this.settingsModal.classList.add('hidden');
      });
    }

    // Settings Sliders
    if (this.masterVol) {
      this.masterVol.addEventListener('input', (e) => {
        const valEl = document.getElementById('val-master-vol');
        if (valEl) valEl.textContent = `${e.target.value}%`;
      });
    }
    if (this.sfxVol) {
      this.sfxVol.addEventListener('input', (e) => {
        const valEl = document.getElementById('val-sfx-vol');
        if (valEl) valEl.textContent = `${e.target.value}%`;
      });
    }
    if (this.musicVol) {
      this.musicVol.addEventListener('input', (e) => {
        const valEl = document.getElementById('val-music-vol');
        if (valEl) valEl.textContent = `${e.target.value}%`;
      });
    }
    if (this.sensSlider) {
      this.sensSlider.addEventListener('input', (e) => {
        const valEl = document.getElementById('val-sens');
        if (valEl) valEl.textContent = `${e.target.value}`;
      });
    }

    // Pause Modal Buttons
    if (this.btnPauseHtp) {
      this.btnPauseHtp.addEventListener('click', () => {
        this.htpModal.classList.remove('hidden');
      });
    }
  }

  applySettings() {
    const master = this.masterVol ? Number(this.masterVol.value) / 100 : 0.8;
    const sfx = this.sfxVol ? Number(this.sfxVol.value) / 100 : 0.9;
    const music = this.musicVol ? Number(this.musicVol.value) / 100 : 0.65;
    const sens = this.sensSlider ? Number(this.sensSlider.value) : 5;
    const graphics = this.graphicsPreset ? this.graphicsPreset.value : 'high';
    const gesturePip = this.settingGesturePip ? this.settingGesturePip.value : 'show';

    audioManager.setMasterVolume(master);
    audioManager.setSfxVolume(sfx);
    audioManager.setMusicVolume(music);

    if (this.onSettingsChanged) {
      this.onSettingsChanged({ sens, graphics, gesturePip });
    }
  }

  showMainMenu() {
    if (this.mainMenuScreen) {
      this.mainMenuScreen.classList.add('active');
      this.mainMenuScreen.classList.remove('hidden');
    }
    if (this.particlesControl) {
      this.particlesControl.start();
    }
    this.validateName(false);
  }

  setupNameValidation() {
    if (!this.nameInput) return;

    // Check on input keystrokes
    this.nameInput.addEventListener('input', () => {
      const val = this.nameInput.value.trim();
      if (!val || val.toUpperCase() === 'CYBER_GHOST') {
        if (this.nameStatusHint) {
          this.nameStatusHint.textContent = 'NEW NAME REQUIRED';
          this.nameStatusHint.classList.remove('hint-valid');
          this.nameStatusHint.classList.add('hint-required');
        }
      } else {
        this.clearNameError();
        if (this.nameStatusHint) {
          this.nameStatusHint.textContent = '✓ CALLSIGN READY';
          this.nameStatusHint.classList.remove('hint-required');
          this.nameStatusHint.classList.add('hint-valid');
        }
      }
    });

    // Support pressing Enter inside the input to start
    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.btnPlay) {
          this.btnPlay.click();
        }
      }
    });
  }

  validateName(showFeedback = false) {
    const raw = this.nameInput ? this.nameInput.value.trim() : '';
    const upper = raw.toUpperCase();

    if (!raw) {
      if (showFeedback) {
        this.showNameError('⚠️ Please enter a codename to start the heist!');
      }
      return null;
    }

    if (upper === 'CYBER_GHOST') {
      if (showFeedback) {
        this.showNameError('⚠️ Default callsign "CYBER_GHOST" is compromised. You must enter a new callsign!');
      }
      return null;
    }

    if (raw.length < 2) {
      if (showFeedback) {
        this.showNameError('⚠️ Callsign must be at least 2 characters long!');
      }
      return null;
    }

    this.clearNameError();
    return raw;
  }

  showNameError(message) {
    if (this.nameErrorMsg) {
      this.nameErrorMsg.textContent = message;
      this.nameErrorMsg.classList.remove('hidden');
    }
    if (this.nameInputWrapper) {
      this.nameInputWrapper.classList.remove('input-error');
      // Force DOM reflow to re-trigger CSS shake animation
      void this.nameInputWrapper.offsetWidth;
      this.nameInputWrapper.classList.add('input-error');
    }
    if (this.nameStatusHint) {
      this.nameStatusHint.textContent = 'NEW NAME REQUIRED';
      this.nameStatusHint.classList.remove('hint-valid');
      this.nameStatusHint.classList.add('hint-required');
    }
    if (this.nameInput) {
      this.nameInput.focus();
    }
    try {
      audioManager.playAccessDenied();
    } catch (e) {}
  }

  clearNameError() {
    if (this.nameErrorMsg) {
      this.nameErrorMsg.classList.add('hidden');
    }
    if (this.nameInputWrapper) {
      this.nameInputWrapper.classList.remove('input-error');
    }
  }

  hideMainMenu() {
    if (this.mainMenuScreen) {
      this.mainMenuScreen.classList.remove('active');
      this.mainMenuScreen.classList.add('hidden');
    }
    if (this.particlesControl) {
      this.particlesControl.stop();
    }
  }

  initClock() {
    const clockEl = document.getElementById('hud-live-clock');
    if (!clockEl) return;
    const update = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}:${s} UTC`;
    };
    update();
    setInterval(update, 1000);
  }

  initCardTilt() {
    const card = document.getElementById('player-dossier-card');
    if (!card) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let isHovered = false;

    card.addEventListener('mouseenter', () => {
      isHovered = true;
      try { audioManager.playUiHover(); } catch (e) {}
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Gentle 3D perspective tilt
      targetRotY = (x / (rect.width / 2)) * 5.5;
      targetRotX = -(y / (rect.height / 2)) * 5.5;
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRotX = 0;
      targetRotY = 0;
    });

    const updateTilt = () => {
      currentRotX += (targetRotX - currentRotX) * 0.12;
      currentRotY += (targetRotY - currentRotY) * 0.12;

      if (Math.abs(currentRotX) > 0.01 || Math.abs(currentRotY) > 0.01 || isHovered) {
        card.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateY(-2px)`;
      } else {
        card.style.transform = '';
      }
      requestAnimationFrame(updateTilt);
    };
    requestAnimationFrame(updateTilt);
  }

  initMenuParticles() {
    const canvas = document.getElementById('menu-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let isRunning = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.35 - Math.random() * 0.75,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.55 + 0.25,
        color: Math.random() > 0.3 ? '#00f0ff' : '#fbbf24'
      });
    }

    let mouse = { x: -999, y: -999 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      // Draw faint cyber constellation lines
      for (let i = 0; i < count; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) {
            const alpha = (1 - distSq / 10000) * 0.16;
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Subtle mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const force = ((130 - dist) / 130) * 0.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    this.particlesControl = {
      start: () => {
        if (!isRunning) {
          isRunning = true;
          animId = requestAnimationFrame(render);
        }
      },
      stop: () => {
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
      }
    };
  }

  setupAudioInteractions() {
    const interactiveElements = document.querySelectorAll(
      '#main-menu button, #main-menu .stat-chip, #main-menu .gesture-legend-item'
    );
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        try { audioManager.playUiHover(); } catch (e) {}
      });
      if (el.tagName === 'BUTTON' && el.id !== 'btn-play') {
        el.addEventListener('click', () => {
          try { audioManager.playUiClick(); } catch (e) {}
        });
      }
    });
  }

  showPauseModal(onResume, onAbort, onSave, onLoad, activeSessionId = null) {
    this.pauseModal.classList.remove('hidden');

    const pauseSessionIdEl = document.getElementById('pause-session-id-text');
    const btnPauseCopy = document.getElementById('btn-pause-copy-id');
    const sessionId = activeSessionId || localStorage.getItem('the_great_heist_last_session_id') || 'HEIST-ACTIVE';
    if (pauseSessionIdEl) {
      pauseSessionIdEl.textContent = sessionId;
    }
    if (btnPauseCopy) {
      btnPauseCopy.onclick = async () => {
        try {
          await navigator.clipboard.writeText(sessionId);
          btnPauseCopy.textContent = '✅ COPIED';
          setTimeout(() => {
            if (btnPauseCopy) btnPauseCopy.textContent = '📋 COPY';
          }, 2000);
        } catch (e) {
          window.prompt('Copy Session ID:', sessionId);
        }
      };
    }

    this.btnResume.onclick = () => {
      this.pauseModal.classList.add('hidden');
      if (onResume) onResume();
    };
    this.btnAbort.onclick = () => {
      this.pauseModal.classList.add('hidden');
      if (onAbort) onAbort();
    };
    if (this.btnPauseSave) {
      this.btnPauseSave.onclick = () => {
        if (onSave) onSave();
      };
    }
    if (this.btnPauseLoad) {
      this.btnPauseLoad.onclick = () => {
        if (onLoad) onLoad();
      };
    }
  }

  hidePauseModal() {
    this.pauseModal.classList.add('hidden');
  }
}
