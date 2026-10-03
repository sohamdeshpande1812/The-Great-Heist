import { MathUtils } from '../utils/MathUtils.js';

export class ResultsModal {
  constructor(leaderboardView) {
    this.leaderboardView = leaderboardView;

    this.modal = document.getElementById('modal-results');
    this.titleEl = document.getElementById('results-title');
    this.badgeEl = document.getElementById('results-outcome-badge');
    this.playerNameEl = document.getElementById('res-player-name');
    this.moneyEl = document.getElementById('res-extracted-money');
    this.timeEl = document.getElementById('res-time-elapsed');
    this.lootCountEl = document.getElementById('res-loot-count');
    this.vaultStatusEl = document.getElementById('res-vault-status');
    this.scoreEl = document.getElementById('res-final-score');
    this.msgEl = document.getElementById('res-motivational-msg');

    this.btnReplay = document.getElementById('btn-res-replay');
    this.btnLeaderboard = document.getElementById('btn-res-leaderboard');
    this.btnMenu = document.getElementById('btn-res-menu');

    this.setupListeners();
  }

  setupListeners() {
    this.btnLeaderboard.addEventListener('click', () => {
      this.hide();
      this.leaderboardView.show();
    });
  }

  async show(results, onReplay, onMenu) {
    const {
      isVictory,
      playerName,
      extractedMoney,
      lootValue = extractedMoney || 0,
      timeElapsed,
      timeRemaining = 0,
      lootCount = 0,
      isVaultCracked = false,
      finalScore,
      score = finalScore || 0,
      extractionName,
      extractionRoute = extractionName || 'Standard Extraction',
      completedTime = new Date().toISOString()
    } = results;

    this.playerNameEl.textContent = (playerName || 'AGENT').toUpperCase();
    this.moneyEl.textContent = MathUtils.formatCurrency(lootValue);
    this.timeEl.textContent = MathUtils.formatTime(timeElapsed);
    this.lootCountEl.textContent = `${lootCount} Items`;
    this.vaultStatusEl.textContent = isVaultCracked ? 'CRACKED (🔓 COMPLETED)' : 'LOCKED';
    this.scoreEl.textContent = `${Number(score).toLocaleString()} PTS`;

    if (isVictory) {
      this.titleEl.textContent = '🎉 HEIST SUCCESSFUL!';
      this.titleEl.className = 'neon-green';
      this.badgeEl.textContent = `SUCCESSFUL EXTRACTION // ${extractionRoute.toUpperCase()}`;
    } else {
      this.titleEl.textContent = '🚨 TIME EXPIRED / CAUGHT!';
      this.titleEl.className = 'neon-red';
      this.badgeEl.textContent = 'MISSION TERMINATED // ONLY SECURED LOOT COUNTED';
    }

    // Temporary saving status
    this.msgEl.textContent = '💾 TRANSMITTING SCORE TO MONGODB LEADERBOARD...';
    this.modal.classList.remove('hidden');

    // Post score to /api/leaderboard via leaderboardView
    const lbResult = await this.leaderboardView.submitScore({
      playerName,
      score,
      lootValue,
      timeRemaining,
      extractionRoute,
      completedTime
    });

    const rank = lbResult.rank;
    const entries = lbResult.entries || [];

    // Motivational rank delta message
    let motivationalText = `🔥 YOU ARE RANK #${rank}!`;
    if (rank > 1 && entries[rank - 2]) {
      const nextRankEntry = entries[rank - 2];
      const nextMoney = nextRankEntry.lootValue !== undefined ? nextRankEntry.lootValue : (nextRankEntry.money || 0);
      const moneyDiff = nextMoney - lootValue;
      if (moneyDiff > 0) {
        motivationalText += ` ⚡ ${MathUtils.formatCurrency(moneyDiff)} MORE EXTRACTED TO REACH RANK #${rank - 1}!`;
      } else {
        const nextScore = Number(nextRankEntry.score) || 0;
        motivationalText += ` ⚡ JUST ${nextScore - score} MORE POINTS TO REACH RANK #${rank - 1}!`;
      }
    } else if (rank === 1) {
      motivationalText = '👑 ALL HAIL THE MASTER HEIST SPECIALIST! YOU ARE #1 ON THE LEADERBOARD!';
    }
    this.msgEl.textContent = motivationalText;

    // Button actions
    this.btnReplay.onclick = () => {
      this.hide();
      if (onReplay) onReplay();
    };

    this.btnMenu.onclick = () => {
      this.hide();
      if (onMenu) onMenu();
    };
  }

  hide() {
    this.modal.classList.add('hidden');
  }
}
