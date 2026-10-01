export class Minimap {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.size = 160;
    this.worldScale = 1.8; // pixels per world unit
  }

  render(player, facilityMap) {
    const { ctx, size, worldScale } = this;
    const centerX = size / 2;
    const centerY = size / 2;

    // Clear background
    ctx.fillStyle = '#060b18';
    ctx.fillRect(0, 0, size, size);

    // Draw radar grid rings
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.stroke();

    const currentFloor = player.getCurrentFloor();
    let currentY = player.position.y;

    // Transform world coord to minimap canvas coord centered on player
    const toCanvas = (wx, wz) => {
      const rx = (wx - player.position.x) * worldScale;
      const rz = (wz - player.position.z) * worldScale;
      return {
        x: centerX + rx,
        y: centerY + rz
      };
    };

    // Draw Extraction Zones
    facilityMap.extractionZones.forEach(zone => {
      // Check if zone is approximately on current floor level
      if (Math.abs(zone.position.y - currentY) < 4.0) {
        const pt = toCanvas(zone.position.x, zone.position.z);
        ctx.fillStyle = zone.id === 'main' ? '#00ff88' : zone.id === 'garage' ? '#ffd700' : '#ff0055';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Loot Items on current floor
    facilityMap.lootItems.forEach(loot => {
      if (!loot.isCollected && Math.abs(loot.mesh.position.y - currentY) < 3.5) {
        const pt = toCanvas(loot.mesh.position.x, loot.mesh.position.z);
        ctx.fillStyle = loot.type.id === 'vault_package' ? '#a855f7' : '#00f0ff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Keycards on current floor
    facilityMap.keycardItems.forEach(kc => {
      if (!kc.isCollected && Math.abs(kc.group.position.y - currentY) < 3.5) {
        const pt = toCanvas(kc.group.position.x, kc.group.position.z);
        ctx.fillStyle = kc.type === 'blue' ? '#38bdf8' : kc.type === 'red' ? '#ff0055' : '#c084fc';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Player Indicator (Cyan glowing circle with directional triangle)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-player.yaw);

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
