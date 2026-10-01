import { MathUtils } from '../utils/MathUtils.js';

const STORAGE_KEY_SOLO = 'the_great_heist_leaderboard';
const DEFAULT_LEADERBOARD = [];

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

  // ── Local Storage Helpers ──────────────────────────────────────────
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

  // ── Submit Solo Score ──────────────────────────────────────────────
  addScore(playerName, extractedMoney, finalScore, extraDetails = {}) {
    const cleanName = (playerName || 'AGENT').toUpperCase().trim().slice(0, 20);
    const cleanMoney = Number(extractedMoney) || 0;
    const cleanScore = Math.round(finalScore) || 0;

    const newEntry = {
      name: cleanName,
      money: cleanMoney,
      score: cleanScore,
      timeElapsed: extraDetails.timeElapsed || 0,
      lootCount: extraDetails.lootCount || 0,
      isVaultCracked: Boolean(extraDetails.isVaultCracked),
      extractionName: extraDetails.extractionName || 'Standard Extraction',
      date: new Date().toISOString().split('T')[0]
    };

    const localEntries = this.getLocalEntries();
    localEntries.push(newEntry);
    localEntries.sort((a, b) => b.score - a.score || b.money - a.money);
    localEntries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    const trimmed = localEntries.slice(0, 15);
    this.saveLocalEntries(trimmed);

    const localRank = trimmed.findIndex((e) => e === newEntry) + 1;

    return {
      rank: localRank > 0 ? localRank : trimmed.length + 1,
      entries: trimmed
    };
  }

  resetScores() {
    this.saveLocalEntries(DEFAULT_LEADERBOARD);
    this.render([]);
  }

  refreshLeaderboard() {
    const entries = this.getLocalEntries();
    this.render(entries);
  }

  show() {
    const cachedEntries = this.getLocalEntries();
    this.render(cachedEntries);
    this.modal?.classList.remove('hidden');
  }

  hide() {
    this.modal?.classList.add('hidden');
  }

  render(entries) {
    const list = entries !== undefined ? entries : this.getLocalEntries();

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
      const row = document.createElement('tr');
      let medal = '';
      if (rank === 1) medal = '🥇 ';
      else if (rank === 2) medal = '🥈 ';
      else if (rank === 3) medal = '🥉 ';

      row.innerHTML = `
        <td>${medal}#${rank}</td>
        <td><strong>${entry.name}</strong></td>
        <td class="neon-gold">${MathUtils.formatCurrency(entry.money)}</td>
        <td class="neon-cyan">${Number(entry.score).toLocaleString()} PTS</td>
        <td>${entry.date || 'TODAY'}</td>
      `;
      this.tableBody.appendChild(row);
    });

    if (this.motivationalBanner && list.length >= 1) {
      const top1 = list[0];
      this.motivationalBanner.innerHTML = `👑 TOP OPERATIVE: <strong>${top1.name}</strong> leading with ${MathUtils.formatCurrency(top1.money || 0)}!`;
    }
  }
}
