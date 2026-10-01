import * as THREE from 'three';

export const MathUtils = {
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  formatCurrency(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  },

  formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  distance2D(x1, z1, x2, z2) {
    const dx = x1 - x2;
    const dz = z1 - z2;
    return Math.sqrt(dx * dx + dz * dz);
  },

  randomRange(min, max) {
    return min + Math.random() * (max - min);
  },

  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
};
