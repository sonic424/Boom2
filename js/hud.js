let faceCanvas = {};

let hudMessage = '';
let hudMessageTimer = 0;
let hudMessageColor = '#ffcc00';

function generateFaceTextures() {
  const states = ['normal', 'hit', 'hurt', 'angry', 'dead'];
  states.forEach(state => {
    const c = document.createElement('canvas');
    c.width = 48; c.height = 48;
    const ctx = c.getContext('2d');

    ctx.fillStyle = state === 'dead' ? '#666' : '#cc9966';
    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, Math.PI * 2);
    ctx.fill();

    if (state === 'dead') {
      ctx.fillStyle = '#333';
      ctx.fillRect(12, 18, 8, 4);
      ctx.fillRect(28, 18, 8, 4);
      ctx.fillStyle = '#000';
      ctx.font = '20px monospace';
      ctx.fillText('X', 12, 32);
      ctx.fillText('X', 29, 32);
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(14, 18, 8, 8);
      ctx.fillRect(28, 18, 8, 8);
      ctx.fillStyle = state === 'angry' ? '#f00' : '#333';
      ctx.fillRect(state === 'angry' ? 15 : 16, state === 'hit' ? 24 : 20, 5, state === 'hit' ? 3 : 5);
      ctx.fillRect(state === 'angry' ? 29 : 30, state === 'hit' ? 24 : 20, 5, state === 'hit' ? 3 : 5);
    }

    ctx.fillStyle = '#000';
    if (state === 'normal') { ctx.fillRect(16, 32, 16, 3); }
    else if (state === 'hit') { ctx.beginPath(); ctx.arc(24, 34, 6, 0, Math.PI); ctx.fill(); }
    else if (state === 'hurt') { ctx.fillRect(18, 30, 12, 5); ctx.fillRect(16, 28, 4, 3); ctx.fillRect(28, 28, 4, 3); }
    else if (state === 'angry') { ctx.fillRect(16, 30, 16, 5); ctx.fillStyle = '#fff'; ctx.fillRect(16, 26, 16, 2); }
    else if (state === 'dead') { ctx.fillRect(16, 34, 16, 2); }

    faceCanvas[state] = c;
  });
}

function getFaceState() {
  if (player.health <= 0) return 'dead';
  if (player.health <= 25) return 'angry';
  if (player.health <= 50) return 'hurt';
  if (player.damageTimer > 0) return 'hit';
  return 'normal';
}

function drawHUD(ctx, dt) {
  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, H - 60, W, 60);

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, 28);

  const faceState = getFaceState();
  const face = faceCanvas[faceState] || faceCanvas.normal;
  if (face) { ctx.drawImage(face, 20, H - 55, 40, 40); }

  ctx.fillStyle = '#fff';
  ctx.font = '12px monospace';
  ctx.fillText('HEALTH', 70, H - 40);
  const healthPct = player.health / CONFIG.MAX_HEALTH;
  const healthColor = healthPct > 0.5 ? '#00ff00' : healthPct > 0.25 ? '#ffff00' : '#ff0000';
  ctx.fillStyle = healthColor;
  ctx.font = 'bold 24px monospace';
  ctx.fillText(Math.floor(player.health) + '%', 70, H - 18);

  ctx.fillStyle = '#333';
  ctx.fillRect(160, H - 50, 120, 16);
  const barWidth = 120 * healthPct;
  if (barWidth > 0) {
    ctx.fillStyle = healthColor;
    ctx.fillRect(160, H - 50, barWidth, 16);
  }
  ctx.strokeStyle = '#555';
  ctx.strokeRect(160, H - 50, 120, 16);

  ctx.fillStyle = '#fff';
  ctx.font = '12px monospace';
  ctx.fillText('AMMO', 310, H - 40);
  const wpnConfig = CONFIG.WEAPONS[player.weapon];
  const ammoCount = player.ammo[player.weapon];
  const maxAmmo = wpnConfig ? wpnConfig.maxAmmo || Infinity : Infinity;
  ctx.fillStyle = ammoCount === Infinity ? '#ffaa00' : ammoCount <= 0 ? '#ff0000' : '#ffaa00';
  ctx.font = 'bold 24px monospace';
  ctx.fillText(
    ammoCount === Infinity ? 'INF' : Math.floor(ammoCount) + (maxAmmo !== Infinity ? '/' + maxAmmo : ''),
    310, H - 18
  );

  ctx.fillStyle = '#fff';
  ctx.font = '12px monospace';
  ctx.fillText('WEAPON', 470, H - 40);
  const weaponNames = { pistol: 'PISTOL', shotgun: 'SHOTGUN', plasma: 'PLASMA' };
  ctx.fillStyle = '#ffaa00';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(weaponNames[player.weapon] || 'PISTOL', 470, H - 18);

  ctx.font = '10px monospace';
  ['pistol', 'shotgun', 'plasma'].forEach((w, i) => {
    const x = 540 + i * 30;
    ctx.fillStyle = player.weapon === w ? '#ffaa00' : '#555';
    ctx.fillText((i + 1) + ':' + w[0].toUpperCase(), x, H - 45);
    const a = player.ammo[w];
    ctx.fillStyle = player.weapon === w ? '#ffaa00' : '#444';
    ctx.fillText(a === Infinity ? 'INF' : Math.floor(a), x, H - 32);
  });

  const levelData = getLevelMap(player.currentLevel);
  ctx.fillStyle = '#888';
  ctx.font = '11px monospace';
  ctx.fillText('LEVEL: ' + player.currentLevel + ' - ' + (levelData?.name || ''), 10, 16);

  ctx.fillStyle = '#ff4444';
  ctx.fillText('KILLS: ' + player.levelKills + '/' + totalEnemies, 300, 16);

  if (player.dashCooldown > 0) {
    ctx.fillStyle = '#666';
    ctx.fillRect(W - 80, 6, 60, 14);
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(W - 80, 6, 60 * (1 - player.dashCooldown / CONFIG.DASH_COOLDOWN), 14);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText('DASH', W - 76, 17);
  } else {
    ctx.fillStyle = '#4488ff';
    ctx.font = '10px monospace';
    ctx.fillText('DASH READY', W - 85, 16);
  }

  if (player.damageTimer > 0) {
    ctx.fillStyle = `rgba(255,0,0,${Math.min(player.damageTimer * 0.5, 0.4)})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (hudMessage && hudMessageTimer > 0) {
    ctx.save();
    ctx.fillStyle = hudMessageColor || '#ffcc00';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    const msgAlpha = Math.min(1, hudMessageTimer);
    ctx.globalAlpha = msgAlpha;
    ctx.fillText(hudMessage, W / 2, H / 2 - 60);
    ctx.restore();
    ctx.textAlign = 'left';
  }

  // Low health heartbeat pulse
  if (player.health > 0 && player.health <= 25) {
    const hp = player.health / 25;
    const pulseT = performance.now() * 0.004;
    const pulse = Math.abs(Math.sin(pulseT)) * (1 - hp * 0.7);
    const pulseR = Math.max(0, pulse * 0.25);
    ctx.save();
    ctx.fillStyle = 'rgba(180,0,0,' + pulseR + ')';
    ctx.fillRect(0, 0, W, H);
    // Side vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
    vg.addColorStop(0, 'rgba(255,0,0,0)');
    vg.addColorStop(0.6, 'rgba(255,0,0,0)');
    vg.addColorStop(1, 'rgba(200,0,0,' + (pulseR * 0.8) + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  ctx.fillStyle = '#666';
  ctx.font = '10px monospace';
  ctx.fillText('FLOOR ' + getFloorInLevel(player.currentLevel) + '/' + CONFIG.FLOORS_PER_LEVEL, W - 150, 16);
  ctx.fillStyle = '#444';
  ctx.font = '9px monospace';
  ctx.fillText(getLevelSetName(player.currentLevel), W - 150, 26);

  // Animated demon face indicator
  if (typeof loadedDemonImages !== 'undefined' && loadedDemonImages.length > 0) {
    const fi = Math.floor(performance.now() * 0.01) % loadedDemonImages.length;
    const fImg = loadedDemonImages[fi];
    if (fImg) {
      ctx.save();
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 6;
      ctx.drawImage(fImg, W - 48, 2, 24, 24);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff4400';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DEMON', W - 36, 30);
      ctx.textAlign = 'left';
      ctx.restore();
    }
  }

  drawMinimap(ctx);
  drawPortalIndicator(ctx);
  drawCrosshair(ctx);
  drawWeapon(ctx, dt);
}

function drawPortalIndicator(ctx) {
  const mapData = getLevelMap(player.currentLevel);
  if (!mapData) return;
  const mm = mapData.map;
  let ex = -1, ey = -1;
  for (let y = 0; y < mm.length && ex === -1; y++) {
    for (let x = 0; x < mm[0].length && ex === -1; x++) {
      if (mm[y][x] === 5) { ex = x + 0.5; ey = y + 0.5; }
    }
  }
  if (ex === -1) return;

  const dx = ex - player.x;
  const dy = ey - player.y;
  const dist = Math.hypot(dx, dy);
  const angleToPortal = Math.atan2(dy, dx);
  let diff = angleToPortal - player.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
  const cx = W / 2, cy = H / 2;

  // Arrow blinks when close
  const blink = Math.sin(performance.now() * 0.005 * Math.max(1, 4 - dist)) > 0;
  if (!blink && dist < 2) return;

  ctx.save();
  if (Math.abs(diff) > Math.PI * 0.4) {
    // Portal off-screen — show arrow at edge
    const arrowX = Math.max(30, Math.min(W - 30, cx + (diff / Math.PI) * W * 0.45));
    const arrowY = 50;
    const arrowAngle = diff > 0 ? Math.PI / 2 : -Math.PI / 2;

    ctx.translate(arrowX, arrowY);
    ctx.rotate(arrowAngle);
    ctx.fillStyle = dist < 3 ? '#44ff88' : '#ffcc00';
    ctx.shadowColor = dist < 3 ? '#44ff88' : '#ffcc00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(-5, 4); ctx.lineTo(0, 1); ctx.lineTo(5, 4); ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', 0, 16);
    ctx.textAlign = 'left';
  } else {
    // Portal on screen — draw chevron above crosshair
    const sx = cx + (diff / CONFIG.HALF_FOV) * (W / 2);
    ctx.translate(sx, cy - 40);
    ctx.fillStyle = dist < 3 ? '#44ff88' : '#ffcc00';
    ctx.shadowColor = dist < 3 ? '#44ff88' : '#ffcc00';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▼', 0, 0);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }
  ctx.restore();
}

function drawCrosshair(ctx) {
  const cx = CONFIG.WIDTH / 2;
  const cy = CONFIG.HEIGHT / 2;
  const spread = Math.min(12, 4 + player.weaponRecoil * 30);
  const gap = 6 + spread;

  ctx.save();
  ctx.shadowColor = 'rgba(255,255,255,0.3)';
  ctx.shadowBlur = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - gap - spread, cy);
  ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy);
  ctx.lineTo(cx + gap + spread, cy);
  ctx.moveTo(cx, cy - gap - spread);
  ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap);
  ctx.lineTo(cx, cy + gap + spread);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,0,0,0.6)';
  ctx.shadowColor = 'rgba(255,0,0,0.4)';
  ctx.shadowBlur = 3;
  ctx.fillRect(cx - 1, cy - 1, 3, 3);
  ctx.restore();
}

function drawMinimap(ctx) {
  const mapData = getLevelMap(player.currentLevel);
  if (!mapData) return;
  const mm = mapData.map;
  const mmSize = 110;
  const mmX = CONFIG.WIDTH - mmSize - 6;
  const mmY = CONFIG.HEIGHT - mmSize - 64;
  const cellSize = Math.floor(mmSize / CONFIG.MAP_SIZE);

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
  ctx.strokeStyle = '#cc4444';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);

  const wallColors = { 1: '#884444', 2: '#666666', 3: '#777755', 4: '#994455', 11: '#ffcc00', 13: '#553333', 14: '#884444', 15: '#884444' };

  for (let y = 0; y < mm.length; y++) {
    for (let x = 0; x < mm[0].length; x++) {
      const t = mm[y][x];
      const px = mmX + x * cellSize;
      const py = mmY + y * cellSize;
      if (t > 0 && t !== 5 && t !== 6 && t !== 7 && t !== 12 && t !== 16 && t !== 18 && t !== 20 && t !== 21 && t !== 22 && t !== 23) {
        ctx.fillStyle = wallColors[t] || '#444';
        ctx.fillRect(px, py, cellSize, cellSize);
      } else if (t === 18) {
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(px, py, cellSize, cellSize);
      } else if (t === 20) {
        ctx.fillStyle = '#884444';
        ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);
      } else if (t === 21) {
        ctx.fillStyle = '#CCBBAA';
        ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);
      } else if (t === 22) {
        ctx.fillStyle = '#AA0000';
        ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);
      } else if (t === 23) {
        ctx.fillStyle = '#888888';
        ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);
      } else if (t === 5) {
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(px, py, cellSize, cellSize);
      } else if (t === 6 || t === 12) {
        ctx.fillStyle = '#00ff44';
        ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);
      } else if (t === 7) {
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(px + 1, py + 1, cellSize - 1, cellSize - 1);
      }
    }
  }

  enemies.forEach(e => {
    if (e.dead) return;
    const ex = mmX + e.x * cellSize;
    const ey = mmY + e.y * cellSize;
    ctx.fillStyle = e.type === 'spectre' ? '#4488ff' : e.type === 'baron' ? '#cc66ff' : '#ff4444';
    ctx.beginPath();
    ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const px = mmX + player.x * cellSize;
  const py = mmY + player.y * cellSize;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(px, py, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + Math.cos(player.angle) * 7, py + Math.sin(player.angle) * 7);
  ctx.stroke();
  ctx.restore();
}
