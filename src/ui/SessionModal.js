import { MathUtils } from '../utils/MathUtils.js';

/**
 * SessionModal handles saving and resuming game sessions via MongoDB Atlas.
 */
export class SessionModal {
  constructor(options = {}) {
    this.onSave = options.onSave;
    this.onLoad = options.onLoad;
    this.onShowToast = options.onShowToast;

    // Modal DOM Elements
    this.modal = document.getElementById('modal-session');
    this.modalTitle = document.getElementById('session-modal-title');
    this.statusPill = document.getElementById('session-db-status');
    this.sectionSave = document.getElementById('section-save-session');
    this.sectionLoad = document.getElementById('section-load-session');

    this.currentSessionIdDisplay = document.getElementById('current-session-id-display');
    this.currentStatsContainer = document.getElementById('session-current-stats');
    this.sessionIdInput = document.getElementById('session-id-input');

    this.recentContainer = document.getElementById('session-recent-container');
    this.recentSessionIdText = document.getElementById('recent-session-id-text');
    this.recentSessionMeta = document.getElementById('recent-session-meta');

    this.feedbackMsg = document.getElementById('session-feedback-msg');

    this.btnConfirmSave = document.getElementById('btn-confirm-save-session');
    this.btnConfirmLoad = document.getElementById('btn-confirm-load-session');
    this.btnCopyId = document.getElementById('btn-copy-session-id');
    this.btnPasteId = document.getElementById('btn-paste-session-id');
    this.btnRecentLoad = document.getElementById('btn-recent-session-load');
    this.btnClose = document.getElementById('btn-close-session');
    this.btnCancel = document.getElementById('btn-session-cancel');

    this.currentSessionId = null;
    this.setupListeners();
  }

  setupListeners() {
    this.btnClose?.addEventListener('click', () => this.hide());
    this.btnCancel?.addEventListener('click', () => this.hide());

    // Copy current session ID to clipboard
    this.btnCopyId?.addEventListener('click', async () => {
      const id = this.currentSessionIdDisplay?.textContent;
      if (!id || id === 'NOT STARTED') return;

      try {
        await navigator.clipboard.writeText(id);
        if (this.onShowToast) {
          this.onShowToast(`📋 Session ID copied: ${id}`, 'info');
        }
        this.btnCopyId.textContent = '✅ COPIED';
        setTimeout(() => {
          if (this.btnCopyId) this.btnCopyId.textContent = '📋 COPY';
        }, 2000);
      } catch (err) {
        // Fallback prompt
        window.prompt('Copy Session ID:', id);
      }
    });

    // Paste from clipboard into input
    this.btnPasteId?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && this.sessionIdInput) {
          this.sessionIdInput.value = text.trim();
          this.sessionIdInput.focus();
        }
      } catch (err) {
        if (this.sessionIdInput) this.sessionIdInput.focus();
      }
    });

    // Load recent session
    this.btnRecentLoad?.addEventListener('click', () => {
      const recentId = localStorage.getItem('the_great_heist_last_session_id');
      if (recentId && this.sessionIdInput) {
        this.sessionIdInput.value = recentId;
        this.handleLoad(recentId);
      }
    });

    // Confirm Save
    this.btnConfirmSave?.addEventListener('click', () => {
      this.handleSave();
    });

    // Confirm Load
    this.btnConfirmLoad?.addEventListener('click', () => {
      const id = this.sessionIdInput?.value.trim();
      if (!id) {
        this.showFeedback('Please enter a valid Session ID to resume.', 'warning');
        return;
      }
      this.handleLoad(id);
    });

    // Enter key triggers load
    this.sessionIdInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const id = this.sessionIdInput.value.trim();
        if (id) this.handleLoad(id);
      }
    });
  }

  setDbStatus(statusClass, label) {
    if (!this.statusPill) return;
    this.statusPill.className = `db-status-pill ${statusClass}`;
    const textEl = this.statusPill.querySelector('.status-text');
    if (textEl) {
      textEl.textContent = label;
    }
  }

  showFeedback(message, type = 'info') {
    if (!this.feedbackMsg) return;
    this.feedbackMsg.className = `session-feedback-msg ${type}`;
    this.feedbackMsg.textContent = message;
    this.feedbackMsg.classList.remove('hidden');
  }

  hideFeedback() {
    if (!this.feedbackMsg) return;
    this.feedbackMsg.classList.add('hidden');
    this.feedbackMsg.textContent = '';
  }

  async handleSave() {
    if (!this.onSave) return;
    this.hideFeedback();

    if (this.btnConfirmSave) {
      this.btnConfirmSave.disabled = true;
      this.btnConfirmSave.innerHTML = '<span>⏳ SAVING TO MONGODB ATLAS...</span>';
    }
    this.setDbStatus('status-checking', 'SAVING SESSION...');

    try {
      const result = await this.onSave();
      this.setDbStatus('status-online', 'SAVED IN MONGODB');
      this.showFeedback(`✅ Session saved successfully! Session ID: ${result.sessionId}`, 'success');

      if (this.currentSessionIdDisplay) {
        this.currentSessionIdDisplay.textContent = result.sessionId;
      }

      this.updateRecentDisplay(result.sessionId);

      setTimeout(() => {
        this.hide();
      }, 1400);
    } catch (err) {
      console.error('Save session error:', err);
      this.setDbStatus('status-offline', 'SAVE ERROR');
      this.showFeedback(`❌ Failed to save session: ${err.message}`, 'danger');
    } finally {
      if (this.btnConfirmSave) {
        this.btnConfirmSave.disabled = false;
        this.btnConfirmSave.innerHTML = '<span>💾 SAVE MISSION STATE</span>';
      }
    }
  }

  async handleLoad(sessionId) {
    if (!this.onLoad) return;
    this.hideFeedback();

    if (this.btnConfirmLoad) {
      this.btnConfirmLoad.disabled = true;
      this.btnConfirmLoad.innerHTML = '<span>⏳ RETRIEVING FROM CLOUD...</span>';
    }
    this.setDbStatus('status-checking', 'CONNECTING TO MONGODB...');

    try {
      await this.onLoad(sessionId);
      this.setDbStatus('status-online', 'SESSION RESTORED');
      this.showFeedback(`⚡ Session loaded! Restoring operative...`, 'success');
      setTimeout(() => {
        this.hide();
      }, 600);
    } catch (err) {
      console.error('Load session error:', err);
      this.setDbStatus('status-offline', 'NOT FOUND / ERROR');
      this.showFeedback(`❌ Could not load session: ${err.message}`, 'danger');
    } finally {
      if (this.btnConfirmLoad) {
        this.btnConfirmLoad.disabled = false;
        this.btnConfirmLoad.innerHTML = '<span>⚡ RESUME MISSION</span>';
      }
    }
  }

  updateRecentDisplay(specificId = null) {
    const recentId = specificId || localStorage.getItem('the_great_heist_last_session_id');
    if (recentId && this.recentContainer && this.recentSessionIdText) {
      this.recentContainer.classList.remove('hidden');
      this.recentSessionIdText.textContent = recentId;

      let metaText = 'Saved Session';
      try {
        const metaRaw = localStorage.getItem('the_great_heist_last_session_meta');
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          metaText = `${meta.floor || 'Facility'} • ₹${(meta.secured || 0).toLocaleString()} Secured • ${meta.time || ''}`;
        }
      } catch (e) {}

      if (this.recentSessionMeta) {
        this.recentSessionMeta.textContent = metaText;
      }
    } else if (this.recentContainer) {
      this.recentContainer.classList.add('hidden');
    }
  }

  show(options = {}) {
    const { mode = 'both', game = null } = options;
    this.hideFeedback();

    // Configure visibility according to mode
    if (mode === 'save') {
      this.sectionSave?.classList.remove('hidden');
      this.sectionLoad?.classList.add('hidden');
      if (this.modalTitle) this.modalTitle.textContent = '💾 SAVE HEIST SESSION';
    } else if (mode === 'load') {
      this.sectionSave?.classList.add('hidden');
      this.sectionLoad?.classList.remove('hidden');
      if (this.modalTitle) this.modalTitle.textContent = '📂 RESUME SAVED HEIST';
    } else {
      this.sectionSave?.classList.remove('hidden');
      this.sectionLoad?.classList.remove('hidden');
      if (this.modalTitle) this.modalTitle.textContent = '💾 CLOUD SESSION MANAGER';
    }

    // Populate Current Session ID
    const activeSessionId = (game && game.sessionId) || localStorage.getItem('the_great_heist_last_session_id') || 'HEIST-ACTIVE';
    if (this.currentSessionIdDisplay) {
      this.currentSessionIdDisplay.textContent = activeSessionId;
    }

    // Populate Active Stats Summary
    if (this.currentStatsContainer && game && (game.state === 'PLAYING' || game.state === 'PAUSED')) {
      const floor = game.player ? game.player.getCurrentFloor() : 'GROUND FLOOR';
      const carried = game.player ? MathUtils.formatCurrency(game.player.carriedValue) : '₹0';
      const secured = game.player ? MathUtils.formatCurrency(game.player.securedValue) : '₹0';
      const timeLeft = MathUtils.formatTime(game.timeRemaining);

      this.currentStatsContainer.innerHTML = `
        <div class="session-stat-pill"><strong>FLOOR:</strong> ${floor}</div>
        <div class="session-stat-pill"><strong>TIME:</strong> ${timeLeft}</div>
        <div class="session-stat-pill"><strong>CARRIED:</strong> ${carried}</div>
        <div class="session-stat-pill"><strong>SECURED:</strong> ${secured}</div>
      `;
    } else if (this.currentStatsContainer) {
      this.currentStatsContainer.innerHTML = `
        <div class="session-stat-pill">Start or resume a heist to track live progress.</div>
      `;
    }

    this.updateRecentDisplay();
    this.setDbStatus('status-online', 'MONGODB ATLAS CLOUD');

    if (this.sessionIdInput) {
      this.sessionIdInput.value = '';
    }

    this.modal?.classList.remove('hidden');
  }

  hide() {
    this.modal?.classList.add('hidden');
    this.hideFeedback();
  }
}
