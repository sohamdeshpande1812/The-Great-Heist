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
  }

  setupListeners() {
    // Start Game
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        try {
          audioManager.ensureContext();
          audioManager.playKeycardChime();
        } catch (err) {
          console.warn('Audio start error:', err);
        }

        const name = (this.nameInput && this.nameInput.value.trim()) || 'CYBER_GHOST';
        const difficulty = (this.diffSelect && this.diffSelect.value) || 'normal';

        this.hideMainMenu();

        if (this.onStartGame) {
          this.onStartGame({
            name,
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
  }

  hideMainMenu() {
    if (this.mainMenuScreen) {
      this.mainMenuScreen.classList.remove('active');
      this.mainMenuScreen.classList.add('hidden');
    }
  }

  showPauseModal(onResume, onAbort, onSave, onLoad) {
    this.pauseModal.classList.remove('hidden');
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
