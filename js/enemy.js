let enemies = [];
let enemySprites = {};
let totalEnemies = 0;

const SW = 128, SH = 192, AC = 8, ER = 0.35;

const ENEMY_COLORS = {
  imp:    { skin:'#CC5533', dark:'#8B3A22', light:'#E07755', eye:'#ff4400', horn:'#664422' },
  demon:  { skin:'#338833', dark:'#226622', light:'#44BB44', eye:'#ff0000' },
  baron:  { skin:'#663399', dark:'#4D2673', light:'#8844BB', eye:'#00ffff', cloth:'#552288' },
  spectre:{ skin:'#4488cc', dark:'#336699', light:'#66AAEE', eye:'#ffffff' }
};

function generateEnemySprites() {
  const types = ['imp','demon','baron','spectre'];
  types.forEach(type => {
    enemySprites[type] = new Array(AC * CONFIG.ANIM_FRAMES);
    const fn = type === 'imp' ? drawImp : type === 'demon' ? drawDemon : type === 'baron' ? drawBaron : drawSpectre;
    for (let a = 0; a <= 4; a++) {
      for (let f = 0; f < CONFIG.ANIM_FRAMES; f++) {
        const c = document.createElement('canvas');
        c.width = SW; c.height = SH;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        fn(ctx, SW, SH, a, f);
        enemySprites[type][a * CONFIG.ANIM_FRAMES + f] = c;
      }
      if (a > 0 && a < 4) {
        for (let f = 0; f < CONFIG.ANIM_FRAMES; f++) {
          const m = document.createElement('canvas');
          m.width = SW; m.height = SH;
          const mctx = m.getContext('2d');
          mctx.imageSmoothingEnabled = true;
          mctx.scale(-1, 1);
          mctx.drawImage(enemySprites[type][a * CONFIG.ANIM_FRAMES + f], -SW, 0);
          enemySprites[type][(8 - a) * CONFIG.ANIM_FRAMES + f] = m;
        }
      }
    }
  });
}

function gradEllipse(ctx, x, y, rx, ry, base, dark, light) {
  const r = Math.max(rx, ry);
  const g = ctx.createRadialGradient(x - rx*0.3, y - ry*0.3, 0, x, y, r);
  g.addColorStop(0, light||base); g.addColorStop(0.5, base); g.addColorStop(1, dark||base);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI*2);
  ctx.fill();
}

function drawLimb(ctx, x1, y1, x2, y2, t, base, dark, light) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(a);
  const g = ctx.createLinearGradient(0, -t/2, 0, t/2);
  g.addColorStop(0, dark||base); g.addColorStop(0.3, base);
  g.addColorStop(0.5, light||base); g.addColorStop(0.7, base); g.addColorStop(1, dark||base);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, t/2, len/2, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

// ---- IMP ----
function drawImp(ctx, w, h, a, frame) {
  const C = ENEMY_COLORS.imp;
  const ang = a * Math.PI / 4;
  const cx = w/2, cy = h/2;
  const f = a === 2 || a === 6 ? 0.45 : a === 1 || a === 3 || a === 5 || a === 7 ? 0.7 : 1;
  const wp = Math.sin(frame / CONFIG.ANIM_FRAMES * Math.PI * 2);

  // Back leg
  const bl1 = { x: cx + (-10+6*(a-2))*0.3 + wp*6, y: cy+20 + wp*8 };
  const bl2 = { x: cx + (-10+6*(a-2))*0.3 + wp*10, y: cy+60 - Math.abs(wp)*4 };
  drawLimb(ctx, bl1.x, bl1.y, bl2.x, bl2.y, 10*f, C.dark, '#5A2010', C.dark);

  // Torso
  const ty = cy - 10 - Math.abs(wp)*3;
  gradEllipse(ctx, cx + (a-2)*3*f, ty, 22*f, 32, C.skin, C.dark, C.light);

  // Back arm
  const ba1 = { x: cx + (-18+10*(a-2))*0.3*f - wp*4, y: ty-12 - wp*2 };
  const ba2 = { x: cx + (-22+14*(a-2))*0.3*f - wp*6, y: ty+10 - wp*4 };
  drawLimb(ctx, ba1.x, ba1.y, ba2.x, ba2.y, 8*f, C.dark, '#5A2010', C.dark);

  // Front arm
  const fa1 = { x: cx + (18-10*(a-2))*0.3*f + wp*4, y: ty-12 - wp*2 };
  const fa2 = { x: cx + (26-14*(a-2))*0.3*f + wp*6, y: ty+10 - wp*4 };
  drawLimb(ctx, fa1.x, fa1.y, fa2.x, fa2.y, 8*f, C.skin, C.dark, C.light);

  // Front leg
  const fl1 = { x: cx + (10-6*(a-2))*0.3*f - wp*6, y: cy+20 - wp*8 };
  const fl2 = { x: cx + (12-8*(a-2))*0.3*f - wp*10, y: cy+60 - Math.abs(wp)*4 };
  drawLimb(ctx, fl1.x, fl1.y, fl2.x, fl2.y, 10*f, C.skin, C.dark, C.light);

  // Head
  const hx = cx + (a-2)*2*f, hy = ty - 36 - Math.abs(wp)*2;
  gradEllipse(ctx, hx, hy, 14*f, 16, C.skin, C.dark, C.light);

  // Horns
  if (a <= 1 || a >= 6) {
    ctx.fillStyle = C.horn;
    ctx.beginPath(); ctx.moveTo(hx-10*f, hy-10); ctx.lineTo(hx-14*f, hy-26); ctx.lineTo(hx-6*f, hy-14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx+10*f, hy-10); ctx.lineTo(hx+14*f, hy-26); ctx.lineTo(hx+6*f, hy-14); ctx.fill();
  } else if (a <= 3 || a >= 5) {
    ctx.fillStyle = C.horn;
    ctx.beginPath(); ctx.moveTo(hx-2, hy-12); ctx.lineTo(hx-6, hy-28); ctx.lineTo(hx+2, hy-16); ctx.fill();
  }

  // Eyes
  if (a <= 1 || a >= 6) {
    ctx.shadowColor = C.eye; ctx.shadowBlur = 6;
    ctx.fillStyle = C.eye;
    ctx.beginPath(); ctx.arc(hx-5*f, hy-2, 3*f, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx+5*f, hy-2, 3*f, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(hx-5*f, hy-2, 1.5*f, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx+5*f, hy-2, 1.5*f, 0, Math.PI*2); ctx.fill();
  } else if (a <= 3 || a >= 5) {
    ctx.shadowColor = C.eye; ctx.shadowBlur = 6;
    ctx.fillStyle = C.eye;
    ctx.beginPath(); ctx.arc(hx+2, hy-2, 3*f, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(hx+2, hy-2, 1.5*f, 0, Math.PI*2); ctx.fill();
  }

  // Mouth
  if (a <= 1 || a >= 6) {
    ctx.fillStyle = '#000';
    ctx.fillRect(hx-6*f, hy+6, 12*f, 3);
    ctx.fillStyle = '#f00';
    ctx.fillRect(hx-4*f, hy+5, 8*f, 1);
  } else if (a <= 3 || a >= 5) {
    ctx.fillStyle = '#000';
    ctx.fillRect(hx-2, hy+6, 4, 3);
  }

  // Claws
  ctx.fillStyle = '#664422';
  ctx.fillRect(fa2.x-3*f, fa2.y-2, 6*f, 4);
}

// ---- DEMON ----
function drawDemon(ctx, w, h, a, frame) {
  const C = ENEMY_COLORS.demon;
  const cx = w/2, cy = h/2;
  const f = a === 2 || a === 6 ? 0.45 : a === 1 || a === 3 || a === 5 || a === 7 ? 0.7 : 1;
  const wp = Math.sin(frame / CONFIG.ANIM_FRAMES * Math.PI * 2);

  const ty = cy - Math.abs(wp)*3;
  gradEllipse(ctx, cx + (a-2)*4*f, ty + 5, 28*f, 38, C.skin, C.dark, C.light);

  // Belly
  gradEllipse(ctx, cx + (a-2)*3*f, ty + 18, 20*f, 22, C.skin, '#1A4A1A', C.light);

  // Back leg
  drawLimb(ctx, cx + (-14+8*(a-2))*0.3*f + wp*8, ty+32 + wp*6, cx + (-16+10*(a-2))*0.3*f + wp*12, ty+68 - Math.abs(wp)*4, 14*f, C.dark, '#1A4A1A', C.dark);
  // Front leg
  drawLimb(ctx, cx + (14-8*(a-2))*0.3*f - wp*8, ty+32 - wp*6, cx + (18-10*(a-2))*0.3*f - wp*12, ty+68 - Math.abs(wp)*4, 14*f, C.skin, C.dark, C.light);

  // Back arm
  drawLimb(ctx, cx + (-24+12*(a-2))*0.3*f - wp*5, ty-16 - wp*3, cx + (-34+16*(a-2))*0.3*f - wp*8, ty+8 - wp*5, 12*f, C.dark, '#1A4A1A', C.dark);
  // Front arm
  drawLimb(ctx, cx + (24-12*(a-2))*0.3*f + wp*5, ty-16 - wp*3, cx + (36-16*(a-2))*0.3*f + wp*8, ty+8 - wp*5, 12*f, C.skin, C.dark, C.light);

  // Head (small, sunken)
  const hx = cx + (a-2)*2*f, hy = ty - 40 - Math.abs(wp)*2;
  gradEllipse(ctx, hx, hy, 16*f, 14, C.skin, C.dark, C.light);

  // Eyes
  if (a <= 1 || a >= 6) {
    ctx.shadowColor = C.eye; ctx.shadowBlur = 8;
    ctx.fillStyle = C.eye;
    ctx.beginPath(); ctx.arc(hx-6*f, hy-2, 4*f, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx+6*f, hy-2, 4*f, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.shadowColor = C.eye; ctx.shadowBlur = 8;
    ctx.fillStyle = C.eye;
    ctx.beginPath(); ctx.arc(hx+2, hy-2, 4*f, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Teeth
  if (a <= 1 || a >= 6) {
    ctx.fillStyle = '#fff';
    for (let i = -3; i <= 3; i++) ctx.fillRect(hx + i*4*f - 1, hy+6, 2, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(hx-2, hy+9, 4, 3);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(hx-2, hy+6, 3, 4);
  }
}

// ---- BARON ----
function drawBaron(ctx, w, h, a, frame) {
  const C = ENEMY_COLORS.baron;
  const cx = w/2, cy = h/2;
  const f = a === 2 || a === 6 ? 0.4 : a === 1 || a === 3 || a === 5 || a === 7 ? 0.65 : 1;
  const wp = Math.sin(frame / CONFIG.ANIM_FRAMES * Math.PI * 2);

  const ty = cy - 12 - Math.abs(wp)*3;

  // Cape/back cloth
  ctx.fillStyle = C.cloth;
  ctx.beginPath();
  ctx.moveTo(cx + (-24+10*(a-2))*0.2*f, ty-10);
  ctx.lineTo(cx + (-30+14*(a-2))*0.2*f, ty+70 + Math.abs(wp)*6);
  ctx.lineTo(cx + (30-14*(a-2))*0.2*f, ty+70 + Math.abs(wp)*6);
  ctx.lineTo(cx + (24-10*(a-2))*0.2*f, ty-10);
  ctx.closePath();
  ctx.fill();

  const ty2 = cy - Math.abs(wp)*3;
  gradEllipse(ctx, cx + (a-2)*4*f, ty2, 26*f, 40, C.skin, C.dark, C.light);

  // Back arm
  drawLimb(ctx, cx + (-24+12*(a-2))*0.3*f - wp*5, ty2-18 - wp*3, cx + (-32+16*(a-2))*0.3*f - wp*8, ty2+12 - wp*5, 12*f, C.dark, '#3A1860', C.dark);
  // Front arm
  drawLimb(ctx, cx + (24-12*(a-2))*0.3*f + wp*5, ty2-18 - wp*3, cx + (34-16*(a-2))*0.3*f + wp*8, ty2+12 - wp*5, 12*f, C.skin, C.dark, C.light);

  // Legs
  drawLimb(ctx, cx + (-12+6*(a-2))*0.3*f + wp*8, ty2+36 + wp*6, cx + (-14+8*(a-2))*0.3*f + wp*12, ty2+72 - Math.abs(wp)*4, 12*f, C.dark, '#3A1860', C.dark);
  drawLimb(ctx, cx + (12-6*(a-2))*0.3*f - wp*8, ty2+36 - wp*6, cx + (16-8*(a-2))*0.3*f - wp*12, ty2+72 - Math.abs(wp)*4, 12*f, C.skin, C.dark, C.light);

  // Head (no neck, face in torso)
  const hx = cx + (a-2)*2*f, hy = ty2 - 44 - Math.abs(wp)*2;
  gradEllipse(ctx, hx, hy, 18*f, 18, C.skin, C.dark, C.light);

  // Horns
  ctx.fillStyle = '#8877AA';
  ctx.beginPath(); ctx.moveTo(hx-12*f, hy-6); ctx.lineTo(hx-18*f, hy-28); ctx.lineTo(hx-8*f, hy-10); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx+12*f, hy-6); ctx.lineTo(hx+18*f, hy-28); ctx.lineTo(hx+8*f, hy-10); ctx.fill();

  // Eyes (cyan glow)
  if (a <= 1 || a >= 6) {
    ctx.shadowColor = C.eye; ctx.shadowBlur = 12;
    ctx.fillStyle = C.eye;
    ctx.beginPath(); ctx.arc(hx-6*f, hy-2, 4*f, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx+6*f, hy-2, 4*f, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(hx-6*f, hy-2, 2*f, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx+6*f, hy-2, 2*f, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.shadowColor = C.eye; ctx.shadowBlur = 12;
    ctx.fillStyle = C.eye;
    ctx.beginPath(); ctx.arc(hx+2, hy-2, 4*f, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Mouth
  ctx.fillStyle = '#000';
  ctx.fillRect(hx-8*f, hy+8, 16*f, 4);
  ctx.fillStyle = '#f00';
  ctx.fillRect(hx-6*f, hy+7, 12*f, 1);

  // Armor details
  ctx.strokeStyle = '#A080C0';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 18*f + (a-2)*3*f, ty2-4, 36*f, 24);
}

// ---- SPECTRE ----
function drawSpectre(ctx, w, h, a, frame) {
  const C = ENEMY_COLORS.spectre;
  const cx = w/2, cy = h/2;
  const f = a === 2 || a === 6 ? 0.4 : a === 1 || a === 3 || a === 5 || a === 7 ? 0.65 : 1;
  const wp = Math.sin(frame / CONFIG.ANIM_FRAMES * Math.PI * 2);

  ctx.save();
  ctx.globalAlpha = 0.55;

  // Wispy body
  const ty = cy - 8 - Math.abs(wp)*4;
  const bodyW = 20*f + Math.abs(wp)*3, bodyH = 40 + Math.abs(wp)*5;
  const g = ctx.createRadialGradient(cx + (a-2)*3*f, ty, 0, cx + (a-2)*3*f, ty, bodyW);
  g.addColorStop(0, C.light); g.addColorStop(0.6, C.skin); g.addColorStop(1, 'rgba(68,136,204,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx + (a-2)*3*f, ty, bodyW, bodyH, 0, 0, Math.PI*2);
  ctx.fill();

  // Tendrils
  ctx.strokeStyle = C.skin;
  ctx.lineWidth = 4*f;
  ctx.globalAlpha = 0.35;
  for (let i = -2; i <= 2; i++) {
    const tx = cx + i*8*f + (a-2)*2*f + wp*4;
    ctx.beginPath();
    ctx.moveTo(tx, ty+30);
    ctx.quadraticCurveTo(tx + Math.sin(a + i + wp)*10, ty+60 + wp*8, tx + Math.cos(a+i*2 + wp)*15, ty+80 + Math.abs(wp)*6);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.55;

  // Head
  const hx = cx + (a-2)*2*f, hy = ty - 36 - Math.abs(wp)*2;
  gradEllipse(ctx, hx, hy, 16*f, 16, C.skin, C.dark, C.light);

  // Eyes
  ctx.globalAlpha = 0.9;
  ctx.shadowColor = C.eye; ctx.shadowBlur = 10;
  ctx.fillStyle = C.eye;
  if (a <= 1 || a >= 6) {
    ctx.beginPath(); ctx.arc(hx-6*f, hy-2, 3*f, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx+6*f, hy-2, 3*f, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(hx+2, hy-2, 3*f, 0, Math.PI*2); ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.restore();
}

function spawnEnemies(levelData) {
  if (typeof enemies !== 'undefined') { enemies.forEach(e => { if (e.baronTimeout) { clearTimeout(e.baronTimeout); e.baronTimeout = null; } }); }
  enemies = [];
  totalEnemies = 0;
  player.levelKills = 0;
  if (!levelData || !levelData.entities) return;

  levelData.entities.forEach(ent => {
    const type = ent.type;
    let enemyType = null;
    let hp = 0;
    if (type === 8) { enemyType = 'imp'; hp = CONFIG.ENEMIES.imp.hp; }
    else if (type === 9) { enemyType = 'demon'; hp = CONFIG.ENEMIES.demon.hp; }
    else if (type === 10) { enemyType = 'baron'; hp = CONFIG.ENEMIES.baron.hp; }
    else if (type === 16) { enemyType = 'spectre'; hp = CONFIG.ENEMIES.spectre.hp; }
    if (!enemyType) return;

    totalEnemies++;
    const ex = ent.c + 0.5, ey = ent.r + 0.5;
    let sx = ex, sy = ey;
    const map = levelData.map;
    if (map) {
      if (!isWalkable(ex, ey, map)) {
        let found = false;
        for (let r = 1; r < 20 && !found; r++) {
          for (let dy = -r; dy <= r && !found; dy++) {
            for (let dx = -r; dx <= r && !found; dx++) {
              const nx = Math.floor(ex) + dx, ny = Math.floor(ey) + dy;
              if (nx > 0 && nx < map[0].length - 1 && ny > 0 && ny < map.length - 1 && isWalkable(nx+0.5, ny+0.5, map)) {
                sx = nx + 0.5; sy = ny + 0.5; found = true;
              }
            }
          }
        }
        if (!found) {
          const start = levelData.playerStart || { r: 22, c: 2 };
          sx = start.c + 0.5; sy = start.r + 0.5;
        }
      }
    }

    enemies.push({
      x: sx, y: sy,
      type: enemyType,
      hp, maxHp: hp,
      state: 'idle', alerted: false,
      hurtTimer: 0, attackTimer: 0,
      frame: 0, frameTimer: 0,
      dead: false, deathTimer: 0,
      baronTimeout: null,
      painSoundTimer: 0,
      stuckTimer: 0,
      lastPathTime: 0,
      pathTarget: null
  });
});

}

function isWalkable(x, y, map) {
  return canMoveTo(x, y, ENEMY_RADIUS, map);
}

function killEnemy(index) {
  const e = enemies[index];
  if (!e || e.dead) return;
  if (e.baronTimeout) { clearTimeout(e.baronTimeout); e.baronTimeout = null; }
  e.dead = true;
  e.deathTimer = 0.5;
  player.levelKills++;
  player.totalKills++;
  playEnemyDeath();
  addBloodDecal(Math.floor(e.x), Math.floor(e.y));
  checkAllEnemiesDead();
}

function checkAllEnemiesDead() {
  if (enemies.filter(e => !e.dead).length === 0) openExit();
}

function openExit() {
  const mapData = getLevelMap(player.currentLevel);
  if (!mapData) return;
  const exitPos = MAPS[player.currentLevel - 1] && MAPS[player.currentLevel - 1].exitPos;
  if (exitPos) {
    mapData.map[exitPos.r][exitPos.c] = 5;
  } else {
    for (let y = 1; y < mapData.map.length - 1; y++) {
      for (let x = 1; x < mapData.map[0].length - 1; x++) {
        if (mapData.map[y][x] === 0 && Math.hypot(x - player.x, y - player.y) > 5) {
          mapData.map[y][x] = 5; return;
        }
      }
    }
  }
}

function updateEnemies(dt, mapData) {
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.dead) {
      e.deathTimer -= dt;
      continue;
    }

    if (e.hurtTimer > 0) e.hurtTimer -= dt;
    if (e.attackTimer > 0) e.attackTimer -= dt;
    if (e.painSoundTimer > 0) e.painSoundTimer -= dt;

    e.frameTimer += dt;
    if (e.frameTimer > 0.12) {
      e.frame = (e.frame + 1) % CONFIG.ANIM_FRAMES;
      e.frameTimer = 0;
    }

    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 12 && !e.alerted) {
      e.alerted = true;
      e.state = 'chase';
      playMonsterSound();
    }

    if (!e.alerted) continue;

    const config = CONFIG.ENEMIES[e.type];
    if (!config) continue;

    if (dist < config.attackRange && e.attackTimer <= 0) {
      e.state = 'attack';
      enemyAttack(e, i);
      e.attackTimer = config.attackCooldown;
      playMonsterSound();
    } else {
      e.state = 'chase';
      const speed = config.speed * dt;

      let targetX = player.x;
      let targetY = player.y;
      const distDirect = Math.hypot(targetX - e.x, targetY - e.y);

      if (distDirect > 3) {
        const now = performance.now() / 1000;
        if (now - e.lastPathTime > 0.6 || !e.pathTarget) {
          e.lastPathTime = now;
          e.pathTarget = bfsPathfind(e.x, e.y, targetX, targetY, mapData);
        }
        if (e.pathTarget) {
          targetX = e.pathTarget.x;
          targetY = e.pathTarget.y;
        }
      } else {
        e.pathTarget = null;
      }

      const angle = Math.atan2(targetY - e.y, targetX - e.x);
      const moveX = Math.cos(angle) * speed;
      const moveY = Math.sin(angle) * speed;

      let moved = false;

      if (isWalkable(e.x + moveX, e.y, mapData)) {
        e.x += moveX; moved = true;
      }
      if (isWalkable(e.x, e.y + moveY, mapData)) {
        e.y += moveY; moved = true;
      }

      if (moved) {
        e.stuckTimer = 0;
      } else {
        e.stuckTimer += dt;
      }

      if (e.stuckTimer > 0.8) {
        e.stuckTimer = 0;
        e.pathTarget = null;
        for (let a = 0; a < 8; a++) {
          const ra = angle + (Math.random() - 0.5) * Math.PI;
          const rx = e.x + Math.cos(ra) * speed * 3;
          const ry = e.y + Math.sin(ra) * speed * 3;
          if (isWalkable(rx, ry, mapData)) {
            e.x = rx; e.y = ry; break;
          }
        }
      }
    }

    // Push enemies apart
    for (let j = i + 1; j < enemies.length; j++) {
      const o = enemies[j];
      if (o.dead) continue;
      const dx2 = e.x - o.x, dy2 = e.y - o.y;
      const d2 = Math.hypot(dx2, dy2);
      if (d2 < 0.8 && d2 > 0.01) {
        const push = (0.8 - d2) * 0.3;
        const nx = dx2 / d2, ny = dy2 / d2;
        e.x += nx * push; e.y += ny * push;
        o.x -= nx * push; o.y -= ny * push;
      }
    }
  }
}

function enemyAttack(enemy, index) {
  const config = CONFIG.ENEMIES[enemy.type];
  if (!config) return;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  if (enemy.type === 'demon' || enemy.type === 'spectre') {
    if (dist < 1.5) playerTakeDamage(config.damage);
  } else if (dist < config.attackRange) {
    spawnProjectile(enemy.x, enemy.y, angle, 6, config.damage, 'enemy', 'fireball');
    playProjectileShoot();
  }

  if (enemy.type === 'baron') {
    enemy.baronTimeout = setTimeout(() => {
      if (enemy.dead) return;
      const dist2 = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist2 < config.attackRange) {
        const angle2 = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        spawnProjectile(enemy.x, enemy.y, angle2, 6, config.damage, 'enemy', 'fireball');
        playProjectileShoot();
      }
    }, 300);
  }
}
