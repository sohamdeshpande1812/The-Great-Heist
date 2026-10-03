import { MathUtils } from '../utils/MathUtils.js';

const STORAGE_KEY_SOLO = 'the_great_heist_leaderboard';
const API_URL = '/api/leaderboard';

export class LeaderboardView {
  constructor() {
    this.modal = document.getElementById('modal-leaderboard');
    this.tableBody = document.getElementById('leaderboard-body');
    this.tableHead = document.getElementById('lb-table-head');
    this.motivationalBanner = document.getElementById('lb-motivational-banner');
    this.statusPill = document.getElementById('lb-db-status');

    this.btnClose = document.getElementById('btn-close-lb');
    this.btnBack = document.getElementById('btn-lb-back');
    this.btnReset = document.getElementById('btn-reset-lb');
    this.btnRefresh = document.getElementById('btn-refresh-lb');

    this.cachedEntries = [];
    this.setupListeners();
  }

  setupListeners() {
    this.btnClose?.addEventListener('click', () => this.hide());
    this.btnBack?.addEventListener('click', () => this.hide());
    this.btnReset?.addEventListener('click', () => this.resetScores());
    this.btnRefresh?.addEventListener('click', () => {
      this.refreshLeaderboard();
    });
  }

  // ── Database Connection Status UI Helper ───────────────────────────
  setStatus(statusClass, label) {
    if (!this.statusPill) return;
    this.statusPill.className = `db-status-pill ${statusClass}`;
    const textEl = this.statusPill.querySelector('.status-text');
    if (textEl) {
      textEl.textContent = label;
    }
  }

  // ── Local Storage Fallback Cache ───────────────────────────────────
  getLocalEntries() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SOLO);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  }

  saveLocalEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY_SOLO, JSON.stringify(entries));
    } catch (e) {}
  }

  // ── Fetch Top 10 Scores (GET /api/leaderboard) ──────────────────────
  async fetchScores() {
    this.setStatus('status-checking', 'CONNECTING TO MONGODB...');

    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const entries = Array.isArray(data) ? data : (data.data || []);

      // Assign ranks to the top 10 items
      entries.forEach((item, idx) => {
        item.rank = idx + 1;
      });

      this.cachedEntries = entries;
      this.saveLocalEntries(entries);
      this.setStatus('status-online', 'MONGODB CLOUD DATABASE');
      return entries;
    } catch (err) {
      console.warn('Leaderboard API GET error, falling back to local cache:', err);
      this.setStatus('status-offline', 'OFFLINE // LOCAL CACHE');
      return this.getLocalEntries();
    }
  }

  // ── Submit Score (POST /api/leaderboard) ───────────────────────────
  async submitScore({
    playerName,
    score,
    lootValue,
    timeRemaining,
    extractionRoute,
    completedTime
  }) {
    const cleanName = (playerName || 'AGENT').toUpperCase().trim().slice(0, 20);
    const cleanScore = Math.round(Number(score)) || 0;
    const cleanLootValue = Number(lootValue) || 0;
    const cleanTimeRemaining = Math.max(0, Math.round(Number(timeRemaining) || 0));
    const cleanRoute = extractionRoute || 'Standard Extraction';
    const cleanCompletedTime = completedTime || new Date().toISOString();

    const payload = {
      playerName: cleanName,
      score: cleanScore,
      lootValue: cleanLootValue,
      timeRemaining: cleanTimeRemaining,
      extractionRoute: cleanRoute,
      completedTime: cleanCompletedTime
    };

    let entries = [];
    let serverSuccess = false;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        serverSuccess = true;
        // Fetch fresh top 10 from MongoDB after saving
        entries = await this.fetchScores();
      } else {
        console.warn(`Leaderboard POST returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('Leaderboard API POST error, backing up locally:', err);
    }

    // Keep local cache updated as backup
    const localEntries = this.getLocalEntries();
    const localEntry = {
      playerName: cleanName,
      name: cleanName,
      score: cleanScore,
      lootValue: cleanLootValue,
      money: cleanLootValue,
      timeRemaining: cleanTimeRemaining,
      extractionRoute: cleanRoute,
      completedTime: cleanCompletedTime,
      date: new Date().toISOString().split('T')[0]
    };
    localEntries.push(localEntry);
    localEntries.sort((a, b) => b.score - a.score || (b.lootValue || b.money) - (a.lootValue || a.money));
    localEntries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    const trimmed = localEntries.slice(0, 10);
    this.saveLocalEntries(trimmed);

    if (!serverSuccess || !entries.length) {
      entries = trimmed;
    }

    // Determine current operative rank
    let rank = entries.findIndex(
      (e) => (e.playerName || e.name) === cleanName && Number(e.score) === cleanScore
    ) + 1;

    if (rank <= 0) {
      rank = entries.length + 1;
    }

    return {
      rank,
      entries
    };
  }

  // ── Backward Compatible addScore wrapper ───────────────────────────
  async addScore(playerName, extractedMoney, finalScore, extraDetails = {}) {
    return await this.submitScore({
      playerName,
      score: finalScore,
      lootValue: extractedMoney,
      timeRemaining: extraDetails.timeRemaining || 0,
      extractionRoute: extraDetails.extractionName || extraDetails.extractionRoute || 'Standard Extraction',
      completedTime: extraDetails.completedTime || new Date().toISOString()
    });
  }

  resetScores() {
    this.saveLocalEntries([]);
    this.cachedEntries = [];
    this.render([]);
  }

  async refreshLeaderboard() {
    this.renderLoading();
    const entries = await this.fetchScores();
    this.render(entries);
  }

  renderLoading() {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 2.5rem; color: var(--neon-cyan, #00f0ff); font-family: monospace; font-size: 0.95rem;">
          ⚡ INFILTRATING SECURE SERVER // RETRIEVING TOP OPERATIVES...
        </td>
      </tr>
    `;
  }

  async show() {
    this.modal?.classList.remove('hidden');

    // Display cached records if available to avoid an empty table flash
    if (this.cachedEntries && this.cachedEntries.length > 0) {
      this.render(this.cachedEntries);
    } else {
      const local = this.getLocalEntries();
      if (local && local.length > 0) {
        this.render(local);
      } else {
        this.renderLoading();
      }
    }

    // Fetch and render the latest top 10 scores from MongoDB API
    const freshEntries = await this.fetchScores();
    this.render(freshEntries);
  }

  hide() {
    this.modal?.classList.add('hidden');
  }

  render(entries) {
    const list = entries !== undefined ? entries : (this.cachedEntries.length > 0 ? this.cachedEntries : this.getLocalEntries());

    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    if (!list || list.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="5" style="text-align:center; padding: 2.5rem; color: #94a3b8; font-family: monospace; font-size: 0.95rem;">
          📡 NO HEIST RECORDS FOUND — INFILTRATE AND SECURE YOUR FIRST HIGH SCORE!
        </td>
      `;
      this.tableBody.appendChild(emptyRow);
      if (this.motivationalBanner) {
        this.motivationalBanner.innerHTML = '🏆 BE THE FIRST OPERATIVE TO ENTER THE HALL OF FAME!';
      }
      return;
    }

    list.forEach((entry, idx) => {
      const rank = entry.rank || idx + 1;
      const name = entry.playerName || entry.name || 'AGENT';
      const money = entry.lootValue !== undefined ? entry.lootValue : (entry.money || 0);
      const score = Number(entry.score) || 0;

      let dateStr = 'TODAY';
      if (entry.completedTime) {
        try {
          dateStr = new Date(entry.completedTime).toISOString().split('T')[0];
        } catch (e) {
          dateStr = 'TODAY';
        }
      } else if (entry.date) {
        dateStr = entry.date;
      }

      const row = document.createElement('tr');
      let medal = '';
      if (rank === 1) medal = '🥇 ';
      else if (rank === 2) medal = '🥈 ';
      else if (rank === 3) medal = '🥉 ';

      row.innerHTML = `
        <td>${medal}#${rank}</td>
        <td><strong>${name}</strong></td>
        <td class="neon-gold">${MathUtils.formatCurrency(money)}</td>
        <td class="neon-cyan">${score.toLocaleString()} PTS</td>
        <td>${dateStr}</td>
      `;
      this.tableBody.appendChild(row);
    });

    if (this.motivationalBanner && list.length >= 1) {
      const top1 = list[0];
      const topName = top1.playerName || top1.name || 'OPERATIVE';
      const topMoney = top1.lootValue !== undefined ? top1.lootValue : (top1.money || 0);
      this.motivationalBanner.innerHTML = `👑 TOP OPERATIVE: <strong>${topName}</strong> leading with ${MathUtils.formatCurrency(topMoney)}!`;
    }
  }
}
