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

  show(results, onReplay, onMenu) {
    const {
      isVictory,
      playerName,
      extractedMoney,
      timeElapsed,
      lootCount,
      isVaultCracked,
      finalScore,
      extractionName
    } = results;

    const lbResult = this.leaderboardView.addScore(playerName, extractedMoney, finalScore, {
      timeElapsed,
      lootCount,
      isVaultCracked,
      extractionName
    });
    const rank = lbResult.rank;
    const entries = lbResult.entries;
    this.playerNameEl.textContent = playerName.toUpperCase();

    this.moneyEl.textContent = MathUtils.formatCurrency(extractedMoney);
    this.timeEl.textContent = MathUtils.formatTime(timeElapsed);
    this.lootCountEl.textContent = `${lootCount} Items`;
    this.vaultStatusEl.textContent = isVaultCracked ? 'CRACKED (🔓 COMPLETED)' : 'LOCKED';
    this.scoreEl.textContent = `${finalScore.toLocaleString()} PTS`;

    if (isVictory) {
      this.titleEl.textContent = '🎉 HEIST SUCCESSFUL!';
      this.titleEl.className = 'neon-green';
      this.badgeEl.textContent = `SUCCESSFUL EXTRACTION // ${extractionName.toUpperCase()}`;
    } else {
      this.titleEl.textContent = '🚨 TIME EXPIRED / CAUGHT!';
      this.titleEl.className = 'neon-red';
      this.badgeEl.textContent = 'MISSION TERMINATED // ONLY SECURED LOOT COUNTED';
    }

    // Motivational rank delta message
    let motivationalText = `🔥 YOU ARE RANK #${rank}!`;
    if (rank > 1 && entries[rank - 2]) {
      const nextRankEntry = entries[rank - 2];
      const moneyDiff = nextRankEntry.money - extractedMoney;
      if (moneyDiff > 0) {
        motivationalText += ` ⚡ ${MathUtils.formatCurrency(moneyDiff)} MORE EXTRACTED TO REACH RANK #${rank - 1}!`;
      } else {
        motivationalText += ` ⚡ JUST ${nextRankEntry.score - finalScore} MORE POINTS TO REACH RANK #${rank - 1}!`;
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

    this.modal.classList.remove('hidden');
  }

  hide() {
    this.modal.classList.add('hidden');
  }
}
