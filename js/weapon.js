let weaponSpriteData = {};
let weaponMuzzleFlash = 0;
let shellEjectTimer = 0;
let shellEjectX = 0, shellEjectY = 0;
let weaponRaiseProgress = 1;
let weaponRotation = 0;
let weaponSmoke = [];

function generateWeaponSprites() {
  function makeCanvas(w, h, fn) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    fn(ctx, w, h);
    return c;
  }

  weaponSpriteData.pistol = makeCanvas(220, 170, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const skinGrad = ctx.createRadialGradient(50, 115, 0, 50, 115, 30);
    skinGrad.addColorStop(0, '#E8B88A'); skinGrad.addColorStop(0.5, '#D4A070'); skinGrad.addColorStop(1, '#B8855A');
    ctx.fillStyle = skinGrad;
    ctx.beginPath(); ctx.ellipse(50, 110, 16, 24, 0.3, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) ctx.fillRect(38 + i * 7, 105 + i * 2, 6, 20);
    ctx.beginPath(); ctx.ellipse(58, 92, 5, 11, 0.2, 0, Math.PI * 2); ctx.fill();
    const gG = ctx.createLinearGradient(50, 92, 62, 145);
    gG.addColorStop(0, '#5A3A1A'); gG.addColorStop(0.5, '#4A2A0A'); gG.addColorStop(1, '#3A1A00');
    ctx.fillStyle = gG;
    ctx.beginPath(); ctx.moveTo(48, 92); ctx.lineTo(62, 92); ctx.lineTo(66, 142); ctx.lineTo(42, 142); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3A1A00'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const gy = 100 + i * 7; ctx.beginPath(); ctx.moveTo(45, gy); ctx.lineTo(63, gy); ctx.stroke(); }
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.moveTo(70, 84); ctx.quadraticCurveTo(76, 104, 62, 104); ctx.quadraticCurveTo(52, 104, 48, 92); ctx.lineTo(58, 90); ctx.quadraticCurveTo(62, 100, 70, 98); ctx.quadraticCurveTo(78, 96, 76, 84); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.ellipse(64, 95, 3, 6, 0, 0, Math.PI * 2); ctx.fill();
    const fG = ctx.createLinearGradient(60, 48, 130, 48);
    fG.addColorStop(0, '#555'); fG.addColorStop(0.3, '#777'); fG.addColorStop(0.7, '#888'); fG.addColorStop(1, '#666');
    ctx.fillStyle = fG;
    ctx.beginPath();
    ctx.moveTo(58, 90); ctx.lineTo(44, 90); ctx.lineTo(42, 78);
    ctx.lineTo(64, 76); ctx.quadraticCurveTo(74, 74, 82, 64);
    ctx.lineTo(150, 60); ctx.lineTo(152, 64);
    ctx.lineTo(86, 68); ctx.quadraticCurveTo(76, 80, 68, 88);
    ctx.lineTo(60, 90); ctx.closePath(); ctx.fill();
    const sG = ctx.createLinearGradient(62, 36, 170, 36);
    sG.addColorStop(0, '#444'); sG.addColorStop(0.3, '#666'); sG.addColorStop(0.5, '#777'); sG.addColorStop(0.7, '#555'); sG.addColorStop(1, '#333');
    ctx.fillStyle = sG;
    ctx.beginPath();
    ctx.moveTo(58, 78); ctx.lineTo(42, 78);
    ctx.quadraticCurveTo(42, 56, 64, 50);
    ctx.lineTo(160, 42); ctx.lineTo(172, 44); ctx.lineTo(170, 62);
    ctx.lineTo(66, 66); ctx.quadraticCurveTo(56, 66, 50, 72);
    ctx.lineTo(58, 76); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { const sx = 144 + i * 5; ctx.beginPath(); ctx.moveTo(sx, 46); ctx.lineTo(sx, 60); ctx.stroke(); }
    const bG = ctx.createLinearGradient(162, 40, 200, 40);
    bG.addColorStop(0, '#555'); bG.addColorStop(0.5, '#777'); bG.addColorStop(1, '#666');
    ctx.fillStyle = bG;
    ctx.beginPath(); ctx.moveTo(165, 44); ctx.lineTo(200, 40); ctx.lineTo(200, 46); ctx.lineTo(165, 50); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#444'; ctx.fillRect(198, 38, 8, 10); ctx.fillStyle = '#111'; ctx.fillRect(204, 40, 2, 6);
    ctx.fillStyle = '#f00'; ctx.fillRect(158, 40, 2, 5); ctx.fillRect(118, 40, 2, 3);
    ctx.fillStyle = '#222'; ctx.fillRect(110, 56, 18, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(66, 56, 95, 2); ctx.fillRect(165, 45, 30, 2);
    ctx.fillStyle = '#444'; ctx.fillRect(46, 72, 5, 6);
  });

  weaponSpriteData.shotgun = makeCanvas(220, 170, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const skinGrad = ctx.createRadialGradient(80, 108, 0, 80, 108, 28);
    skinGrad.addColorStop(0, '#E8B88A'); skinGrad.addColorStop(0.5, '#D4A070'); skinGrad.addColorStop(1, '#B8855A');
    ctx.fillStyle = skinGrad;
    ctx.beginPath(); ctx.ellipse(80, 104, 16, 22, 0.2, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) ctx.fillRect(68 + i * 7, 106 + i * 2, 5, 18);
    ctx.beginPath(); ctx.ellipse(88, 92, 6, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(44, 118, 14, 18, -0.2, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 3; i++) ctx.fillRect(32 + i * 6, 114 + i * 2, 5, 16);
    const stG = ctx.createLinearGradient(16, 100, 48, 100);
    stG.addColorStop(0, '#5A3A1A'); stG.addColorStop(0.3, '#6A4A2A'); stG.addColorStop(1, '#4A2A0A');
    ctx.fillStyle = stG;
    ctx.beginPath(); ctx.moveTo(14, 106); ctx.quadraticCurveTo(10, 116, 8, 124); ctx.lineTo(28, 126); ctx.lineTo(42, 118); ctx.lineTo(48, 108); ctx.closePath(); ctx.fill();
    const rG = ctx.createLinearGradient(44, 72, 100, 72);
    rG.addColorStop(0, '#555'); rG.addColorStop(0.3, '#777'); rG.addColorStop(0.6, '#666'); rG.addColorStop(1, '#444');
    ctx.fillStyle = rG;
    ctx.beginPath();
    ctx.moveTo(48, 104); ctx.lineTo(34, 104); ctx.lineTo(30, 94);
    ctx.quadraticCurveTo(38, 88, 50, 84);
    ctx.lineTo(108, 78); ctx.lineTo(112, 100); ctx.lineTo(76, 102); ctx.quadraticCurveTo(62, 104, 50, 104);
    ctx.closePath(); ctx.fill();
    const baG = ctx.createLinearGradient(102, 62, 200, 62);
    baG.addColorStop(0, '#555'); baG.addColorStop(0.3, '#888'); baG.addColorStop(0.7, '#777'); baG.addColorStop(1, '#555');
    ctx.fillStyle = baG;
    ctx.beginPath(); ctx.moveTo(102, 70); ctx.lineTo(196, 56); ctx.lineTo(196, 62); ctx.lineTo(102, 78); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(102, 78); ctx.lineTo(196, 62); ctx.lineTo(196, 68); ctx.lineTo(102, 84); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#222'; ctx.fillRect(102, 76, 94, 2);
    ctx.fillStyle = '#444'; ctx.fillRect(194, 54, 10, 18); ctx.fillStyle = '#111'; ctx.fillRect(200, 56, 3, 14);
    const pG = ctx.createLinearGradient(86, 80, 130, 80);
    pG.addColorStop(0, '#5A3A1A'); pG.addColorStop(0.3, '#6A4A2A'); pG.addColorStop(1, '#4A2A0A');
    ctx.fillStyle = pG;
    ctx.beginPath(); ctx.moveTo(86, 82); ctx.lineTo(132, 82); ctx.lineTo(130, 98); ctx.lineTo(88, 98); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3A1A00'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { const px = 94 + i * 9; ctx.beginPath(); ctx.moveTo(px, 84); ctx.lineTo(px, 96); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(102, 70, 88, 2); ctx.fillRect(102, 78, 88, 2);
    ctx.fillStyle = '#222'; ctx.fillRect(66, 92, 16, 3);
  });

  weaponSpriteData.plasma = makeCanvas(220, 170, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const skinGrad = ctx.createRadialGradient(52, 115, 0, 52, 115, 30);
    skinGrad.addColorStop(0, '#E8B88A'); skinGrad.addColorStop(0.5, '#D4A070'); skinGrad.addColorStop(1, '#B8855A');
    ctx.fillStyle = skinGrad;
    ctx.beginPath(); ctx.ellipse(52, 110, 16, 22, 0.3, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 4; i++) ctx.fillRect(40 + i * 7, 106 + i * 2, 5, 20);
    ctx.fillRect(62, 96, 6, 12);
    const gG = ctx.createLinearGradient(46, 94, 58, 142);
    gG.addColorStop(0, '#1A2A2A'); gG.addColorStop(0.5, '#2A3A3A'); gG.addColorStop(1, '#1A2A2A');
    ctx.fillStyle = gG;
    ctx.beginPath(); ctx.moveTo(44, 94); ctx.lineTo(60, 94); ctx.lineTo(62, 138); ctx.lineTo(42, 138); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3A5A5A'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const gy = 100 + i * 8; ctx.beginPath(); ctx.moveTo(45, gy); ctx.lineTo(59, gy); ctx.stroke(); }
    const bG = ctx.createLinearGradient(54, 48, 130, 48);
    bG.addColorStop(0, '#2A3A3A'); bG.addColorStop(0.3, '#3A5A5A'); bG.addColorStop(0.7, '#3A5A5A'); bG.addColorStop(1, '#2A3A3A');
    ctx.fillStyle = bG;
    ctx.beginPath();
    ctx.moveTo(54, 92); ctx.lineTo(42, 92); ctx.lineTo(40, 78);
    ctx.quadraticCurveTo(46, 60, 66, 52);
    ctx.lineTo(146, 40); ctx.lineTo(154, 44); ctx.lineTo(148, 64); ctx.lineTo(66, 74);
    ctx.quadraticCurveTo(50, 78, 48, 86); ctx.lineTo(54, 90); ctx.closePath(); ctx.fill();
    for (let ci = 0; ci < 3; ci++) {
      const cx = 88 + ci * 20;
      const cG = ctx.createLinearGradient(cx - 5, 46, cx + 5, 46);
      cG.addColorStop(0, '#2A3A3A'); cG.addColorStop(0.3, '#4A6A6A'); cG.addColorStop(0.7, '#4A6A6A'); cG.addColorStop(1, '#2A3A3A');
      ctx.fillStyle = cG; ctx.fillRect(cx - 5, 44, 10, 24);
      const glow = Math.sin(performance.now() * 0.003 + ci * 2) * 0.3 + 0.7;
      ctx.globalAlpha = 0.7 * glow; ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 8;
      ctx.fillRect(cx - 2, 48, 4, 16); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      ctx.strokeStyle = '#5A7A7A'; ctx.lineWidth = 1;
      for (let r = 0; r < 3; r++) ctx.strokeRect(cx - 5, 50 + r * 7, 10, 2);
    }
    const aG = ctx.createLinearGradient(146, 36, 184, 36);
    aG.addColorStop(0, '#3A5A5A'); aG.addColorStop(0.4, '#4A6A6A'); aG.addColorStop(1, '#2A3A3A');
    ctx.fillStyle = aG;
    ctx.beginPath(); ctx.moveTo(146, 38); ctx.lineTo(186, 34); ctx.lineTo(190, 36); ctx.lineTo(190, 52); ctx.lineTo(146, 58); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5A7A7A'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const rx = 154 + i * 12; ctx.beginPath(); ctx.moveTo(rx, 36); ctx.lineTo(rx + 1, 38); ctx.lineTo(rx + 1, 52); ctx.lineTo(rx, 54); ctx.stroke(); }
    ctx.fillStyle = '#00ff88'; ctx.globalAlpha = 0.35; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.ellipse(190, 44, 6, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    ctx.fillStyle = '#00ff88'; ctx.globalAlpha = 0.5; ctx.fillRect(60, 58, 12, 8); ctx.globalAlpha = 1;
    ctx.fillStyle = '#000'; ctx.fillRect(62, 60, 8, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(54, 52, 88, 2); ctx.fillRect(146, 38, 40, 2);
  });
}

function getWeaponSprite(weapon) {
  return weaponSpriteData[weapon] || weaponSpriteData.pistol;
}

function shootWeapon() {
  const now = performance.now() / 1000;
  const wpn = CONFIG.WEAPONS[player.weapon];
  if (!wpn) return;
  if (now - player.lastShotTime < wpn.fireRate) return;
  player.lastShotTime = now;

  if (player.weapon === 'pistol') {
    if (wpn.ammo !== Infinity && player.ammo[player.weapon] <= 0) return;
    playGunshot();
    fireBullet(wpn.damage, 0);
    weaponMuzzleFlash = 0.15;
    weaponRotation = -0.08;
    player.weaponRecoil = 0.18;
    player.weaponKickX = -3 + Math.random() * 6;
    player.weaponKickY = -10;
    shellEjectTimer = 0.4;
    shellEjectX = 80 + Math.random() * 10;
    shellEjectY = -20;
    for (let i = 0; i < 3; i++) weaponSmoke.push({ x: 160, y: 20, vx: Math.random() * 30 - 15, vy: -20 - Math.random() * 30, life: 0.3, maxLife: 0.3, size: 4 + Math.random() * 4 });
  } else if (player.weapon === 'shotgun') {
    if (player.ammo.shotgun <= 0) return;
    player.ammo.shotgun--;
    playShotgun();
    for (let i = 0; i < wpn.pellets; i++) {
      const spread = (Math.random() - 0.5) * wpn.spread;
      fireBullet(wpn.damage, spread);
    }
    weaponMuzzleFlash = 0.3;
    weaponRotation = -0.15;
    player.weaponRecoil = 0.35;
    player.weaponKickX = -6 + Math.random() * 12;
    player.weaponKickY = -18;
    shellEjectTimer = 0.6;
    shellEjectX = 100 + Math.random() * 15;
    shellEjectY = -30;
    for (let i = 0; i < 6; i++) weaponSmoke.push({ x: 160, y: 20, vx: Math.random() * 40 - 20, vy: -30 - Math.random() * 40, life: 0.5, maxLife: 0.5, size: 6 + Math.random() * 6 });
  } else if (player.weapon === 'plasma') {
    if (player.ammo.plasma <= 0) return;
    player.ammo.plasma--;
    playPlasma();
    spawnProjectile(player.x, player.y, player.angle + (Math.random() - 0.5) * wpn.spread, 12, wpn.damage, 'player', 'plasma');
    weaponMuzzleFlash = 0.12;
    weaponRotation = -0.05;
    player.weaponRecoil = 0.08;
    player.weaponKickX = -2 + Math.random() * 4;
    player.weaponKickY = -5;
    for (let i = 0; i < 3; i++) weaponSmoke.push({ x: 160, y: 20, vx: Math.random() * 20 - 10, vy: -15 - Math.random() * 20, life: 0.25, maxLife: 0.25, size: 3 + Math.random() * 3, plasma: true });
  }
}

function fireBullet(damage, spread) {
  const angle = player.angle + spread;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  let mapX = Math.floor(player.x), mapY = Math.floor(player.y);
  const deltaDistX = Math.abs(1 / dirX);
  const deltaDistY = Math.abs(1 / dirY);
  const stepX = dirX > 0 ? 1 : -1;
  const stepY = dirY > 0 ? 1 : -1;
  let sideDistX = (stepX > 0 ? (mapX + 1 - player.x) : (player.x - mapX)) * deltaDistX;
  let sideDistY = (stepY > 0 ? (mapY + 1 - player.y) : (player.y - mapY)) * deltaDistY;
  let hit = false, maxDist = 20;
  let curDist = 0;
  const mapArr = getLevelMap(player.currentLevel).map;

  while (!hit && curDist < maxDist) {
    if (sideDistX < sideDistY) {
      curDist = sideDistX;
      sideDistX += deltaDistX;
      mapX += stepX;
    } else {
      curDist = sideDistY;
      sideDistY += deltaDistY;
      mapY += stepY;
    }
    if (mapY < 0 || mapY >= mapArr.length || mapX < 0 || mapX >= mapArr[0].length) break;
    const tile = mapArr[mapY][mapX];
    if (tile > 0 && tile !== 5 && tile !== 6 && tile !== 7 && tile !== 12 && tile !== 13 && tile !== 14 && tile !== 15 && tile !== 16 && tile !== 18 && tile !== 20 && tile !== 21 && tile !== 22 && tile !== 23) {
      hit = true;
      // Bullet impact sparks on wall
      const hitX = player.x + dirX * curDist;
      const hitY = player.y + dirY * curDist;
      spawnParticles(hitX, hitY, 4, '#ffcc88', 2, 0.3);
      spawnParticles(hitX, hitY, 3, '#888888', 1.5, 0.2);
      break;
    }
  }

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.dead) continue;
    const enemyAngle = Math.atan2(e.y - player.y, e.x - player.x);
    let diff = enemyAngle - angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const enemyDist = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
    const angularWidth = 0.3 / Math.max(enemyDist, 0.5);

    if (Math.abs(diff) < angularWidth && enemyDist <= curDist) {
      const actualDmg = Math.min(damage, e.hp);
      e.hp -= damage;
      e.state = 'hurt';
      e.hurtTimer = 0.3;
      playEnemyPain();
      spawnDamageNumber(e.x, e.y, actualDmg);
      if (e.hp <= 0) {
        killEnemy(i);
        triggerCombatScare(0.6);
      } else {
        e.alerted = true;
        triggerCombatScare(0.3);
      }
      return;
    }
  }
}

function drawWeapon(ctx, dt) {
  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

  // Recoil decay
  if (player.weaponRecoil > 0) {
    player.weaponRecoil -= dt;
    if (player.weaponRecoil < 0) player.weaponRecoil = 0;
  }

  const recoilFactor = player.weaponRecoil;
  if (recoilFactor > 0) {
    player.weaponKickY += 40 * dt;
    player.weaponKickX *= 0.7;
    weaponRotation *= 0.85;
  } else {
    player.weaponKickY += (0 - (player.weaponKickY || 0)) * Math.min(1, 10 * dt);
    player.weaponKickX = (player.weaponKickX || 0) * Math.pow(0.2, dt);
    weaponRotation *= Math.pow(0.1, dt);
  }

  // Movement bob
  const isMoving = player.keys['w'] || player.keys['s'] || player.keys['a'] || player.keys['d'];
  if (isMoving) {
    const t = performance.now() * 0.008;
    player.weaponBobX = Math.sin(t) * 5;
    player.weaponBobY = Math.abs(Math.cos(t)) * 4;
  } else {
    if (player.weaponBobX > 0.1) player.weaponBobX -= player.weaponBobX * Math.min(1, 6 * dt);
    else player.weaponBobX = 0;
    if (player.weaponBobY > 0.1) player.weaponBobY -= player.weaponBobY * Math.min(1, 6 * dt);
    else player.weaponBobY = 0;
  }

  // Idle sway
  const swayT = performance.now() * 0.001;
  const idleSwayX = Math.sin(swayT * 0.4) * 1.5;
  const idleSwayY = Math.sin(swayT * 0.25) * 0.8;

  // Barrel smoke particles
  for (let i = weaponSmoke.length - 1; i >= 0; i--) {
    const s = weaponSmoke[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 10 * dt;
    s.life -= dt;
    if (s.life <= 0) { weaponSmoke.splice(i, 1); continue; }
    const alpha = (s.life / s.maxLife) * 0.5;
    const size = s.size * (1 + (1 - s.life / s.maxLife) * 2);
    const sx = W / 2 + 50 + s.x;
    const sy = H - 70 + s.y;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.plasma ? '#00ff88' : '#888888';
    ctx.shadowColor = s.plasma ? '#00ff88' : '#666666';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Muzzle flash
  if (weaponMuzzleFlash > 0) {
    weaponMuzzleFlash -= dt;
    const intensity = Math.max(0, weaponMuzzleFlash / 0.2);
    const flashSize = 40 + Math.abs(Math.sin(performance.now() * 0.05)) * 30;
    const fx = W / 2 + 75;
    const fy = H - 90 + (player.weaponKickY || 0) + (player.weaponBobY || 0);
    ctx.save();
    ctx.shadowColor = player.weapon === 'plasma' ? '#00ff88' : '#ffff00';
    ctx.shadowBlur = 45 * intensity;
    const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, flashSize * 0.8);
    fg.addColorStop(0, '#ffffff');
    fg.addColorStop(0.15, player.weapon === 'plasma' ? '#44ffaa' : '#ffcc00');
    fg.addColorStop(0.5, player.weapon === 'plasma' ? '#00ff88' : '#ff8800');
    fg.addColorStop(1, 'rgba(255,200,0,0)');
    ctx.fillStyle = fg;
    ctx.globalAlpha = intensity;
    ctx.beginPath();
    ctx.arc(fx, fy, flashSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = intensity * 0.8;
    ctx.beginPath();
    ctx.arc(fx, fy, flashSize * 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Outer glow spikes
    ctx.globalAlpha = intensity * 0.3;
    ctx.shadowBlur = 30;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const sd = flashSize * 0.6;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * sd, fy + Math.sin(a) * sd, flashSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Shell ejection
  if (shellEjectTimer > 0) {
    shellEjectTimer -= dt;
    shellEjectY += 150 * dt;
    shellEjectX += Math.sin(shellEjectTimer * 20) * 2;
    const sx = W / 2 + 30 + shellEjectX;
    const sy = H - 90 + shellEjectY;
    ctx.save();
    ctx.fillStyle = '#ccaa44';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 3;
    const shellAngle = shellEjectTimer * 30;
    ctx.translate(sx, sy);
    ctx.rotate(shellAngle);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }

  // Draw weapon sprite with rotation
  const sprite = getWeaponSprite(player.weapon);
  if (!sprite) return;

  const spriteScale = 0.85;
  const sw = sprite.width * spriteScale;
  const sh = sprite.height * spriteScale;
  const wx = W / 2 - sw * 0.5;
  const wy = H - sh + 5;
  const kx = (player.weaponKickX || 0) + (player.weaponBobX || 0) + idleSwayX;
  const ky = (player.weaponKickY || 0) + (player.weaponBobY || 0) + idleSwayY;

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(W / 2 + 40 + kx, H - 5 + ky, 50, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw weapon with rotation
  ctx.save();
  ctx.translate(W / 2 + kx, H + ky);
  ctx.rotate(weaponRotation);
  ctx.drawImage(sprite, -sw * 0.5, -sh, sw, sh);
  ctx.restore();
}


