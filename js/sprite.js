function renderSprites(ctx, zBuffer, mapData) {
  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

  let spriteList = [];

  enemies.forEach(e => {
    if (e.dead && (e.deathTimer || 0) <= 0) return;
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    spriteList.push({
      x: e.x, y: e.y, dist, angle,
      type: e.dead ? 'dead' : 'enemy',
      enemy: e
    });
  });

  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[0].length; x++) {
      const tile = mapData[y][x];
      if (tile === 6 || tile === 12) {
        const dx = x + 0.5 - player.x;
        const dy = y + 0.5 - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        spriteList.push({ x: x + 0.5, y: y + 0.5, dist, angle, type: tile === 12 ? 'medkit' : 'health' });
      } else if (tile === 7) {
        const dx = x + 0.5 - player.x;
        const dy = y + 0.5 - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        spriteList.push({ x: x + 0.5, y: y + 0.5, dist, angle, type: 'ammo' });
      } else if (tile === 5) {
        const dx = x + 0.5 - player.x;
        const dy = y + 0.5 - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        spriteList.push({ x: x + 0.5, y: y + 0.5, dist, angle, type: 'exit' });
      } else if (tile === 18) {
        const dx = x + 0.5 - player.x;
        const dy = y + 0.5 - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        spriteList.push({ x: x + 0.5, y: y + 0.5, dist, angle, type: 'torch', gridX: x, gridY: y });
      } else if (tile === 20 || tile === 21 || tile === 22 || tile === 23) {
        const dx = x + 0.5 - player.x;
        const dy = y + 0.5 - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const typeMap = { 20: 'corpse', 21: 'head', 22: 'guts', 23: 'cobweb' };
        spriteList.push({ x: x + 0.5, y: y + 0.5, dist, angle, type: typeMap[tile], gridX: x, gridY: y });
      }
    }
  }

  spriteList.sort((a, b) => b.dist - a.dist);

  spriteList.forEach(sprite => {
    if (sprite.dist < 0.1) return;

    let angleDiff = sprite.angle - player.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    if (Math.abs(angleDiff) > CONFIG.HALF_FOV + 0.2) return;

    const screenX = W / 2 + (angleDiff / CONFIG.HALF_FOV) * (W / 2);
    const safeDist = Math.max(sprite.dist, 0.4);
    const baseHeight = Math.min(H / safeDist * 1.6, H * 0.92);
    const spriteHeight = baseHeight;
    const spriteWidth = baseHeight * 0.67;

    const centerCol = Math.round(screenX);
    if (centerCol >= 0 && centerCol < W && zBuffer[centerCol] < sprite.dist - 0.1) return;

    const fogFactor = Math.max(0, Math.min(1, 1 - (sprite.dist - 1) / CONFIG.FOG_DISTANCE));

    if (sprite.type === 'enemy' || sprite.type === 'dead') {
      const e = sprite.enemy;
      const frames = enemySprites[e.type];
      if (!frames) return;

      const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
      let a = angleToPlayer;
      if (a < 0) a += Math.PI * 2;
      const frameIndex = Math.round(a / (Math.PI * 2) * 8) % 8;

      const tex = frames[frameIndex * CONFIG.ANIM_FRAMES + e.frame];
      if (!tex) return;

      const drawX = screenX - spriteWidth / 2;
      const drawY = H / 2 - spriteHeight / 2;

      if (sprite.type === 'dead') {
        ctx.globalAlpha = fogFactor * 0.5;
        const deathBob = Math.sin((e.deathTimer || 0) * 8) * 3;
        ctx.drawImage(tex, drawX, drawY + spriteHeight * 0.15 + deathBob, spriteWidth, spriteHeight * 0.85);
        ctx.globalAlpha = 1;
        return;
      }

      if (e.type === 'spectre') {
        const pulse = Math.sin(performance.now() * 0.003) * 0.15 + 0.35;
        ctx.globalAlpha = fogFactor * pulse;
      } else {
        ctx.globalAlpha = fogFactor;
      }

      const bobY = Math.sin(performance.now() * 0.005 + e.frame * 1.5) * 3;
      ctx.drawImage(tex, drawX, drawY + bobY, spriteWidth, spriteHeight);

      if (e.hurtTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.3 * fogFactor;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(drawX, drawY, spriteWidth, spriteHeight);
        ctx.restore();
      }

      const savedAlpha = ctx.globalAlpha;
      ctx.globalAlpha = 1;
      if (e.hp < e.maxHp && sprite.dist < 8) {
        const barW = spriteWidth * 0.7;
        const barH = 4;
        const barX = drawX + spriteWidth * 0.15;
        const barY = drawY - 6;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        ctx.fillStyle = e.hp / e.maxHp > 0.5 ? '#00ff00' : e.hp / e.maxHp > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barW * (e.hp / e.maxHp), barH);
      }
      ctx.globalAlpha = savedAlpha;

    } else if (sprite.type === 'health') {
      const size = Math.min(24 / sprite.dist, 48);
      ctx.globalAlpha = fogFactor;
      const t = performance.now() * 0.003;
      const pulse = Math.sin(t * 2) * 3;
      ctx.fillStyle = '#00cc44';
      ctx.shadowColor = '#00ff44';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(screenX, H / 2 + pulse, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = (size * 0.7) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', screenX, H / 2 + size / 4 + pulse);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'medkit') {
      const size = Math.min(28 / sprite.dist, 52);
      ctx.globalAlpha = fogFactor;
      const t = performance.now() * 0.003;
      const pulse = Math.sin(t * 2.5) * 3;
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff0044';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(screenX, H / 2 + pulse, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = (size * 0.6) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', screenX, H / 2 + size / 4 + pulse);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'ammo') {
      const size = Math.min(24 / sprite.dist, 48);
      ctx.globalAlpha = fogFactor;
      const t = performance.now() * 0.002;
      const pulse = Math.sin(t * 3) * 2;
      ctx.fillStyle = '#cc8800';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 6;
      ctx.fillRect(screenX - size / 2, H / 2 - size / 2 + pulse, size, size);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      ctx.font = (size * 0.7) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('A', screenX, H / 2 + size / 4 + pulse);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'torch') {
      const size = Math.min(32 / sprite.dist, 64);
      ctx.globalAlpha = fogFactor;
      const t = performance.now() * 0.004;
      const flicker = Math.sin(t * 5.3) * 0.15 + Math.sin(t * 11.7) * 0.08;
      const flameH = size * (1.2 + flicker);
      const flameW = size * 0.4 * (1 + Math.sin(t * 7.1) * 0.1);
      const pulse = Math.sin(t * 2.3) * size * 0.04;

      // Glow
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 20 + Math.sin(t * 6.7) * 8;
      const g = ctx.createRadialGradient(screenX, H / 2 + pulse, 0, screenX, H / 2 + pulse, size * 0.8);
      g.addColorStop(0, 'rgba(255,200,50,' + (0.4 + flicker * 0.5) + ')');
      g.addColorStop(0.4, 'rgba(255,100,0,' + (0.3 + flicker * 0.3) + ')');
      g.addColorStop(0.7, 'rgba(200,50,0,' + (0.15 + flicker * 0.1) + ')');
      g.addColorStop(1, 'rgba(100,20,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(screenX, H / 2 + pulse, flameW * 0.8, flameH * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Flame core
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 12;
      const coreG = ctx.createRadialGradient(screenX - flameW * 0.1, H / 2 - flameH * 0.2 + pulse, 0, screenX, H / 2 + pulse, flameW * 0.5);
      coreG.addColorStop(0, '#ffffaa');
      coreG.addColorStop(0.3, '#ff8800');
      coreG.addColorStop(0.7, '#ff4400');
      coreG.addColorStop(1, '#882200');
      ctx.fillStyle = coreG;
      ctx.beginPath();
      ctx.ellipse(screenX - flameW * 0.05, H / 2 - flameH * 0.1 + pulse, flameW * 0.35, flameH * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Embers
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#ff8800';
      for (let i = 0; i < 4; i++) {
        const ei = (i + t * 2) % 4;
        const ex = screenX + Math.sin(t * 3.7 + i * 2) * flameW * 0.3;
        const ey = H / 2 - Math.abs(Math.sin(t * 2.1 + i * 1.7)) * flameH * 0.4 + pulse;
        const es = 1 + (1 - (t % 1)) * 2;
        ctx.fillStyle = i % 2 === 0 ? '#ffaa00' : '#ff6600';
        ctx.beginPath();
        ctx.arc(ex, ey, es, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'corpse') {
      const size = Math.min(28 / sprite.dist, 52);
      ctx.globalAlpha = fogFactor * 0.9;
      const t = performance.now() * 0.001;
      const sway = Math.sin(t * 0.5 + sprite.gridX * 3) * 1;
      ctx.fillStyle = '#8B6914';
      ctx.save();
      ctx.translate(screenX + sway, H / 2 + size * 0.2);
      ctx.scale(1.4, 0.5);
      ctx.beginPath(); ctx.ellipse(0, 0, size * 0.5, size * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#DDCCBB';
      ctx.beginPath(); ctx.arc(screenX + size * 0.3, H / 2 - size * 0.05, size * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#CC3333';
      ctx.beginPath();
      ctx.ellipse(screenX - size * 0.1, H / 2 + size * 0.15, size * 0.25, size * 0.12, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'head') {
      const size = Math.min(20 / sprite.dist, 38);
      ctx.globalAlpha = fogFactor * 0.9;
      const t = performance.now() * 0.001;
      const roll = Math.sin(t * 0.8 + sprite.gridX * 5) * 0.15;
      ctx.save();
      ctx.translate(screenX, H / 2 + size * 0.15);
      ctx.rotate(roll);
      ctx.fillStyle = '#DDCCBB';
      ctx.beginPath(); ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(-size * 0.1, -size * 0.05, size * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(size * 0.1, -size * 0.05, size * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#AA0000';
      ctx.fillRect(-size * 0.08, size * 0.12, size * 0.16, size * 0.06);
      ctx.restore();
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'guts') {
      const size = Math.min(26 / sprite.dist, 48);
      ctx.globalAlpha = fogFactor * 0.85;
      const t = performance.now() * 0.001;
      ctx.fillStyle = '#AA0000';
      ctx.beginPath();
      ctx.ellipse(screenX, H / 2 + size * 0.1, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#CC2222';
      for (let i = 0; i < 5; i++) {
        const gx = screenX + Math.sin(t * 0.3 + i * 1.5) * size * 0.2;
        const gy = H / 2 + Math.cos(t * 0.4 + i * 2) * size * 0.08 + size * 0.1;
        ctx.beginPath();
        ctx.ellipse(gx, gy, size * 0.08, size * 0.04, i * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'cobweb') {
      const size = Math.min(30 / sprite.dist, 56);
      ctx.globalAlpha = fogFactor * 0.4;
      const t = performance.now() * 0.001;
      const sway = Math.sin(t * 0.6 + sprite.gridX * 2) * 2;
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(screenX - size * 0.4 + sway, H / 2 - size * 0.4);
      ctx.lineTo(screenX + size * 0.4 + sway, H / 2 - size * 0.4);
      ctx.lineTo(screenX + size * 0.4 + sway, H / 2 + size * 0.1);
      ctx.lineTo(screenX - size * 0.4 + sway, H / 2 + size * 0.1);
      ctx.closePath();
      ctx.stroke();
      for (let i = 1; i < 4; i++) {
        const lx = screenX - size * 0.4 + (size * 0.8 * i / 4) + sway;
        ctx.beginPath();
        ctx.moveTo(lx, H / 2 - size * 0.4);
        ctx.lineTo(lx + Math.sin(t + i) * 2, H / 2 + size * 0.1);
        ctx.stroke();
      }
      for (let i = 1; i < 3; i++) {
        const ly = H / 2 - size * 0.4 + (size * 0.5 * i / 3);
        ctx.beginPath();
        ctx.moveTo(screenX - size * 0.4 + sway, ly);
        ctx.lineTo(screenX + size * 0.4 + sway, ly + Math.sin(t + i) * 1.5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

    } else if (sprite.type === 'exit') {
      ctx.globalAlpha = fogFactor;
      const t = performance.now() * 0.003;

      const angleDiff = sprite.angle - player.angle;
      const perpDist = sprite.dist * Math.cos(angleDiff);
      if (perpDist < 0.3) { ctx.globalAlpha = 1; return; }
      const portalH = H / perpDist;
      const portalW = portalH * 0.55;

      const drawY = (H - portalH) / 2;
      const drawX = screenX - portalW / 2;

      // Portal glow behind
      const glowG = ctx.createRadialGradient(screenX, H / 2, 0, screenX, H / 2, portalW * 0.9);
      glowG.addColorStop(0, 'rgba(68,136,255,0.15)');
      glowG.addColorStop(0.5, 'rgba(34,68,200,0.08)');
      glowG.addColorStop(1, 'rgba(0,34,136,0)');
      ctx.fillStyle = glowG;
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 40;
      ctx.fillRect(drawX - portalW * 0.3, drawY, portalW * 1.6, portalH);
      ctx.shadowBlur = 0;

      // Portal frame (energy borders)
      const borderPulse = Math.sin(t * 2) * 0.08 + 1;
      ctx.strokeStyle = 'rgba(100,180,255,0.7)';
      ctx.lineWidth = 4 * borderPulse;
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 15;
      ctx.strokeRect(drawX + 4, drawY + 4, portalW - 8, portalH - 8);
      ctx.shadowBlur = 0;

      // Inner energy field
      const fieldG = ctx.createLinearGradient(0, drawY, 0, drawY + portalH);
      fieldG.addColorStop(0, 'rgba(50,100,255,0.05)');
      fieldG.addColorStop(0.3, 'rgba(80,160,255,0.15)');
      fieldG.addColorStop(0.5, 'rgba(150,200,255,0.2)');
      fieldG.addColorStop(0.7, 'rgba(80,160,255,0.15)');
      fieldG.addColorStop(1, 'rgba(50,100,255,0.05)');
      ctx.fillStyle = fieldG;
      ctx.fillRect(drawX + 6, drawY + 6, portalW - 12, portalH - 12);

      // Rippling energy lines
      ctx.strokeStyle = 'rgba(150,200,255,0.25)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const waveY = drawY + portalH * (0.15 + i * 0.23) + Math.sin(t * 3 + i * 1.5) * portalH * 0.03;
        ctx.beginPath();
        ctx.moveTo(drawX + 6, waveY);
        for (let x = 0; x <= portalW - 12; x += 2) {
          const wy = waveY + Math.sin((x / portalW) * Math.PI * 4 + t * 2 + i) * 3;
          ctx.lineTo(drawX + 6 + x, wy);
        }
        ctx.stroke();
      }

      // Central bright core
      ctx.shadowColor = '#66aaff';
      ctx.shadowBlur = 20;
      const coreG = ctx.createRadialGradient(screenX, H / 2, 0, screenX, H / 2, portalW * 0.2);
      coreG.addColorStop(0, 'rgba(180,220,255,0.4)');
      coreG.addColorStop(0.5, 'rgba(100,180,255,0.2)');
      coreG.addColorStop(1, 'rgba(50,100,255,0)');
      ctx.fillStyle = coreG;
      ctx.beginPath();
      ctx.ellipse(screenX, H / 2, portalW * 0.2, portalH * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sparkles
      for (let i = 0; i < 8; i++) {
        const angle = t * 2 + i * 0.785;
        const radX = portalW * (0.2 + Math.sin(t * 3 + i * 1.3) * 0.15);
        const radY = portalH * (0.2 + Math.cos(t * 2.5 + i * 0.9) * 0.12);
        const sx = screenX + Math.cos(angle) * radX;
        const sy = H / 2 + Math.sin(angle * 0.6) * radY;
        ctx.fillStyle = 'rgba(180,220,255,' + (0.25 + Math.sin(t * 4 + i * 2) * 0.15) + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + Math.sin(t * 5 + i) * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  });

  renderProjectiles(ctx, zBuffer);
}
