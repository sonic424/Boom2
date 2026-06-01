const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
let gameDt = 0.016;

const STATE = { MENU: 0, PLAYING: 1, LEVEL_COMPLETE: 2, GAME_OVER: 3, VICTORY: 4, PAUSED: 5 };
let gameState = STATE.MENU;
let lastTime = 0;
let scareActive = false;
let scareTimer = 0;
let scareFrame = 0;
let scarePrevFrame = -1;
let scareFrameTimer = 0;
let scareTransition = 1;
let scareType = 'demon';
let scareScale = 1;
let scareShakeX = 0;
let scareShakeY = 0;
let glitchTimer = 0;
let scareFrameSpeed = 0.08;
let scareImageArr = null;
let scareOverlay = document.getElementById('scareOverlay');
let scareCanvas = document.getElementById('scareCanvas');
let scareCtx = scareCanvas.getContext('2d');

const demonScareImages = ['images/wall_brick.png', 'images/wall_metal.png', 'images/wall_blood.png', 'images/12ge.png', 'images/im1212121212e.png'];
const photoScareImages = ['images/image.png', 'images/image22.png', 'images/image2121.png'];
const bloodScareImages = ['images/blood1.png', 'images/blood2.png', 'images/blood3.png'];
let loadedDemonImages = [];
let loadedPhotoImages = [];
let loadedBloodImages = [];

function loadAllImages(callback) {
  const allSrcs = demonScareImages.concat(photoScareImages).concat(bloodScareImages);
  let toLoad = allSrcs.length;
  const check = () => { toLoad--; if (toLoad <= 0 && callback) callback(); };
  demonScareImages.forEach((src, i) => {
    const img = new Image();
    img.onload = () => { loadedDemonImages[i] = img; check(); };
    img.onerror = () => { console.warn('Failed to load scare image:', src); check(); };
    img.src = src;
  });
  photoScareImages.forEach((src, i) => {
    const img = new Image();
    img.onload = () => { loadedPhotoImages[i] = img; check(); };
    img.onerror = () => { console.warn('Failed to load scare image:', src); check(); };
    img.src = src;
  });
  bloodScareImages.forEach((src, i) => {
    const img = new Image();
    img.onload = () => { loadedBloodImages[i] = img; check(); };
    img.onerror = () => { console.warn('Failed to load scare image:', src); check(); };
    img.src = src;
  });
}

function safeExitPointerLock() {
  try { document.exitPointerLock(); } catch(e) { console.warn('main.js error:', e); }
}

function getScareConfig() {
  const types = ['demon', 'photo', 'blood', 'glitch'];
  const picked = types[Math.floor(Math.random() * types.length)];
  switch (picked) {
    case 'demon': return { arr: loadedDemonImages, speed: 0.08, name: 'demon' };
    case 'photo': return { arr: loadedPhotoImages, speed: 0.1, name: 'photo' };
    case 'blood': return { arr: loadedBloodImages, speed: 0.12, name: 'blood' };
    case 'glitch': return { arr: null, speed: 0.06, name: 'glitch' };
  }
}

function triggerScare() {
  if (scareActive) return;
  scareActive = true;
  scareTimer = 0.7;
  scareFrame = 0;
  scarePrevFrame = -1;
  scareFrameTimer = 0;
  scareTransition = 0;
  scareScale = 0.92;
  scareShakeX = 0;
  scareShakeY = 0;
  glitchTimer = 0;
  const cfg = getScareConfig();
  scareType = cfg.name;
  scareFrameSpeed = cfg.speed;
  scareImageArr = cfg.arr;
  scareOverlay.style.display = 'block';
  playScare(scareType);
}

function updateScare(dt) {
  if (!scareActive) return;
  scareTimer -= dt;
  glitchTimer += dt;

  // Shake decay
  scareShakeX *= 0.85;
  scareShakeY *= 0.85;
  if (Math.abs(scareShakeX) < 0.1) scareShakeX = 0;
  if (Math.abs(scareShakeY) < 0.1) scareShakeY = 0;

  if (scareType === 'glitch') {
    // Random shake during glitch
    if (Math.random() < 0.3) {
      scareShakeX = (Math.random() - 0.5) * 20;
      scareShakeY = (Math.random() - 0.5) * 14;
    }
    // Glitch advances faster
    scareFrameTimer += dt * 1.5;
    if (scareFrameTimer >= scareFrameSpeed) {
      scareFrameTimer = 0;
      scarePrevFrame = scareFrame;
      scareFrame = (scareFrame + 1) % 8;
      scareTransition = 0;
    }
  } else {
    scareFrameTimer += dt;
    if (scareFrameTimer >= scareFrameSpeed) {
      scareFrameTimer = 0;
      scarePrevFrame = scareFrame;
      scareFrame = (scareFrame + 1) % scareImageArr.length;
      scareTransition = 0;
      // Small shake on frame change
      scareShakeX = (Math.random() - 0.5) * 8;
      scareShakeY = (Math.random() - 0.5) * 5;
    }
  }

  // Transition interpolation
  scareTransition = Math.min(1, scareTransition + dt * 8);
  scareScale += (1 - scareScale) * Math.min(1, dt * 6);

  drawScare();
  if (scareTimer <= 0) { scareActive = false; scareOverlay.style.display = 'none'; }
}

function randomBW() {
  return Math.random() > 0.5 ? 255 : 0;
}

function drawScare() {
  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
  const ctx = scareCtx;
  ctx.clearRect(0, 0, W, H);

  if (scareType === 'glitch') {
    // Procedural glitch/static effect
    for (let i = 0; i < 60; i++) {
      const bx = Math.random() * W;
      const by = Math.random() * H;
      const bw = 20 + Math.random() * 200;
      const bh = 2 + Math.random() * 8;
      ctx.fillStyle = 'rgb(' + randomBW() + ',' + randomBW() + ',' + randomBW() + ')';
      ctx.fillRect(bx, by, bw, bh);
    }

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1);
    }

    // Flash a face/demon image occasionally
    if (Math.sin(glitchTimer * 30) > 0.7 && loadedDemonImages.length > 0) {
      const fi = Math.floor(Math.random() * loadedDemonImages.length);
      ctx.globalAlpha = 0.4 + Math.random() * 0.3;
      ctx.drawImage(loadedDemonImages[fi], (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, W + Math.random() * 30, H + Math.random() * 20);
      ctx.globalAlpha = 1;
    }

    // Glitch bars
    for (let i = 0; i < 5; i++) {
      const gy = Math.random() * H;
      const gh = 4 + Math.random() * 12;
      const gi = Math.floor(Math.random() * loadedDemonImages.length);
      if (loadedDemonImages[gi]) {
        ctx.drawImage(loadedDemonImages[gi], (Math.random() - 0.5) * 30, gy, W, gh);
      }
    }
    return;
  }

  // Image-based scares with smooth transitions
  const arr = scareImageArr;
  if (!arr || arr.length === 0) return;

  const currImg = arr[scareFrame];
  if (!currImg) return;

  const t = scareTransition; // 0..1
  const scale = scareScale;
  const sx = scareShakeX;
  const sy = scareShakeY;
  const cw = W * scale;
  const ch = H * scale;
  const cx = (W - cw) / 2 + sx;
  const cy = (H - ch) / 2 + sy;

  // Draw current frame with scale + shake
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.drawImage(currImg, cx, cy, cw, ch);
  ctx.restore();

  // Draw previous frame fading out
  if (scarePrevFrame >= 0 && t < 1 && scarePrevFrame < arr.length) {
    const prevImg = arr[scarePrevFrame];
    if (prevImg) {
      ctx.save();
      ctx.globalAlpha = 1 - t;
      const ps = scale * (0.95 + t * 0.05);
      const pw = W * ps;
      const ph = H * ps;
      ctx.drawImage(prevImg, (W - pw) / 2 + sx, (H - ph) / 2 + sy, pw, ph);
      ctx.restore();
    }
  }

  // Blood splatter overlay on top for extra impact
  if (scareType === 'blood') {
    ctx.save();
    ctx.globalAlpha = 0.15 * Math.sin(glitchTimer * 20) * t;
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

function triggerCombatScare(intensity) {
  combatScareTimer = 0.15 + intensity * 0.15;
  combatScareIntensity = Math.min(1, (combatScareIntensity || 0) + intensity * 0.4);
}

function spawnDamageNumber(x, y, dmg) {
  damageNumbers.push({
    x, y,
    dmg: Math.round(dmg),
    life: 1.0,
    maxLife: 1.0,
    vy: -30
  });
}

function startNewGame() {
  try {
    initAudio();
    loadAllSounds();
    player.totalKills = 0;
    lastScareCheckAngle = -999;
    hideAllScreens();
    startLevel(1);
  } catch(e) {
    console.error('startNewGame error:', e);
    hideAllScreens();
    document.getElementById('menuScreen').style.display = 'flex';
    gameState = STATE.MENU;
  }
}

function startLevel(level) {
  loadLevel(level);
  gameState = STATE.PLAYING;
  hideAllScreens();
  setTimeout(() => { try { stopMusic(); startMusic(); } catch(e) { console.warn('main.js error:', e); } }, 100);
  try { pointerLock(); } catch(e) { console.warn('pointerLock error:', e); }
}

function loadLevel(level) {
  stopShooting();
  const levelNum = Math.max(1, Math.min(level, getLevelCount()));
  player.currentLevel = levelNum;
  const levelData = getLevelMap(levelNum);
  if (!levelData) {
    showHudMessage('ERROR: No map data for level ' + levelNum, 3);
    return;
  }
  projectiles = [];

  for (let y = 0; y < levelData.map.length; y++) {
    for (let x = 0; x < levelData.map[0].length; x++) {
      levelData.map[y][x] = MAPS_ORIG[levelNum - 1][y][x];
    }
  }

  levelData.entities.forEach(ent => {
    if (ent.type === 11 || ent.type === 6 || ent.type === 7 || ent.type === 12 || ent.type === 13 || ent.type === 20 || ent.type === 21 || ent.type === 22 || ent.type === 23 || ent.type === 24 || ent.type === 25) {
      levelData.map[ent.r][ent.c] = ent.type;
    }
  });

  resetPlayer(levelNum);
  spawnEnemies(levelData);
}

function hideAllScreens() {
  ['menuScreen','gameoverScreen','levelCompleteScreen','victoryScreen','pauseScreen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function gameOver() {
  stopShooting();
  gameState = STATE.GAME_OVER;
  document.getElementById('deathKills').textContent = player.levelKills;
  document.getElementById('deathLevel').textContent = player.currentLevel;
  document.getElementById('gameoverScreen').style.display = 'flex';
  stopMusic();
  safeExitPointerLock();
}


function showHudMessage(msg, duration) {
  hudMessage = msg;
  hudMessageTimer = duration || 2;
}

function checkLevelComplete() {
  try {
    stopShooting();
    const alive = enemies.filter(e => !e.dead).length;
    if (alive > 0) {
      showHudMessage('KILL ALL ENEMIES TO EXIT', 2);
      return;
    }

    if (player.currentLevel >= getLevelCount()) {
      gameState = STATE.VICTORY;
      document.getElementById('vicKills').textContent = player.totalKills;
      document.getElementById('vicHealth').textContent = Math.floor(player.health) + '%';
      const vmins = Math.floor(player.levelTime / 60);
      const vsecs = Math.floor(player.levelTime % 60);
      document.getElementById('vicTime').textContent = vmins + ':' + (vsecs < 10 ? '0' : '') + vsecs;
      document.getElementById('victoryScreen').style.display = 'flex';
      stopMusic();
      safeExitPointerLock();
    } else {
      const nextLevel = player.currentLevel + 1;
      document.getElementById('lvlKills').textContent = player.levelKills;
      document.getElementById('lvlHealth').textContent = Math.floor(player.health) + '%';
      const mins = Math.floor(player.levelTime / 60);
      const secs = Math.floor(player.levelTime % 60);
      document.getElementById('lvlTime').textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
      const lvlName = document.getElementById('lvlLevelName');
      const ld = getLevelMap(player.currentLevel);
      if (lvlName && ld) lvlName.textContent = ld.name || '';
      document.getElementById('levelCompleteScreen').style.display = 'flex';
      gameState = STATE.LEVEL_COMPLETE;
      player.currentLevel = nextLevel;
      safeExitPointerLock();
    }
  } catch(e) {
    showHudMessage('ERROR: ' + e.message, 3);
  }
}

function goToMenu() {
  gameState = STATE.MENU;
  hideAllScreens();
  document.getElementById('menuScreen').style.display = 'flex';
  stopMusic();
  safeExitPointerLock();
}

function pointerLock() {
  canvas.requestPointerLock();
}

let lastScareCheckAngle = -999;

// Damage numbers
let damageNumbers = [];

// Combat scare state
let combatScareTimer = 0;
let combatScareIntensity = 0;

function randomScareCheck() {
  const angleDiff = Math.abs(player.angle - lastScareCheckAngle);
  if (angleDiff > 0.5) {
    lastScareCheckAngle = player.angle;
    if (Math.random() < 0.02 && !scareActive) triggerScare();
  }
}

function updatePlaying(dt) {
  const mapData = getLevelMap(player.currentLevel);
  if (!mapData) return;
  updatePlayer(dt, mapData.map);
  updateEnemies(dt, mapData.map);
  updateProjectiles(dt, mapData.map);
  updateScare(dt);
  updateBloodDecals(dt);
  randomScareCheck();

  // Combat scare decay
  if (combatScareTimer > 0) combatScareTimer -= dt;
  combatScareIntensity *= Math.max(0, 1 - dt * 2);

  // Damage numbers
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const dn = damageNumbers[i];
    dn.life -= dt;
    dn.y += dn.vy * dt;
    dn.vy += 40 * dt;
    if (dn.life <= 0) damageNumbers.splice(i, 1);
  }

  if (hudMessageTimer > 0) {
    hudMessageTimer -= dt;
    if (hudMessageTimer <= 0) { hudMessage = ''; hudMessageTimer = 0; }
  }
}

function render() {
  const mapData = getLevelMap(player.currentLevel);
  if (!mapData) return;
  renderFrame(ctx, mapData.map);
  drawHUD(ctx, gameDt);

  // Combat scare overlay
  if (combatScareTimer > 0) {
    const ci = Math.min(1, combatScareIntensity);
    // Red vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
    vg.addColorStop(0, 'rgba(255,0,0,0)');
    vg.addColorStop(0.5, 'rgba(100,0,0,0)');
    vg.addColorStop(0.85, 'rgba(180,0,0,' + (ci * 0.3) + ')');
    vg.addColorStop(1, 'rgba(200,0,0,' + (ci * 0.5) + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // Screen shake
    if (ci > 0.3) {
      const shake = ci * 4;
      ctx.save();
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      ctx.restore();
    }
  }

  // Damage numbers (3D projected)
  for (const dn of damageNumbers) {
    const dx = dn.x - player.x;
    const dy = dn.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.5 || dist > 15) continue;
    const angle = Math.atan2(dy, dx) - player.angle;
    let a = angle;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    if (Math.abs(a) > Math.PI * 0.45) continue;
    const screenX = W / 2 + (a / (Math.PI * 0.45)) * (W / 2);
    const size = Math.min(40 / dist, 24);
    const alpha = Math.min(1, dn.life / dn.maxLife * 2);
    const bobY = -size * 0.5 * (1 - dn.life / dn.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold ' + Math.floor(size) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(dn.dmg, screenX, H / 2 + bobY);
    ctx.fillStyle = '#fff';
    ctx.fillText(dn.dmg, screenX - 1, H / 2 + bobY - 1);
    ctx.restore();
  }
}

function gameLoop(timestamp) {
  gameDt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  const dt = gameDt;

  try {
    if (gameState === STATE.PLAYING) {
      player.levelTime += dt;
      try { updatePlaying(dt); } catch(e) { console.warn('main.js error:', e); }
      render();
    } else if (gameState === STATE.PAUSED) {
      render();
    } else if (gameState === STATE.MENU) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
    } else if (gameState === STATE.GAME_OVER || gameState === STATE.VICTORY) {
      render();
    }
  } catch(e) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
  }

  requestAnimationFrame(gameLoop);
}

function keyName(e) {
  const c = e.code;
  const map = {
    'KeyW':'w','KeyA':'a','KeyS':'s','KeyD':'d',
    'ArrowLeft':'arrowleft','ArrowRight':'arrowright','ArrowUp':'arrowup','ArrowDown':'arrowdown',
    'ShiftLeft':'shift','ShiftRight':'shift','Space':' ','KeyP':'p','Escape':'esc'
  };
  return map[c] || (c.length === 1 ? c.toLowerCase() : '');
}

document.addEventListener('keydown', (e) => {
  const name = keyName(e);

  if (name === 'p' || name === 'esc') {
    if (gameState === STATE.PLAYING) {
      gameState = STATE.PAUSED;
      document.getElementById('pauseScreen').style.display = 'flex';
      safeExitPointerLock();
      return;
    } else if (gameState === STATE.PAUSED) {
      gameState = STATE.PLAYING;
      document.getElementById('pauseScreen').style.display = 'none';
      pointerLock();
      return;
    }
  }

  if (name) player.keys[name] = true;
  if (gameState !== STATE.PLAYING) return;
  if (e.code === 'Digit1') { player.weapon = 'pistol'; }
  if (e.code === 'Digit2') { player.weapon = 'shotgun'; }
  if (e.code === 'Digit3') { player.weapon = 'plasma'; }
  if (name === ' ') { shootWeapon(); }
});

document.addEventListener('keyup', (e) => {
  const name = keyName(e);
  if (name) player.keys[name] = false;
});

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    player.mouseDown = true;
    if (gameState === STATE.PLAYING) {
      if (document.pointerLockElement !== canvas) canvas.requestPointerLock();
      shootWeapon();
      startShooting();
    }
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (e.button === 0) { player.mouseDown = false; stopShooting(); }
});

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === canvas && gameState === STATE.PLAYING) {
    player.angle += e.movementX * CONFIG.MOUSE_SENSITIVITY;
  }
});

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== canvas && gameState === STATE.PLAYING) {
    gameState = STATE.PAUSED;
    document.getElementById('pauseScreen').style.display = 'flex';
  }
});

let shootInterval = null;
function startShooting() {
  if (shootInterval) return;
  const wpn = CONFIG.WEAPONS[player.weapon];
  const rate = Math.max(80, (wpn ? wpn.fireRate * 1000 * 0.5 : 80));
  shootInterval = setInterval(() => {
    if (player.mouseDown && gameState === STATE.PLAYING) shootWeapon();
  }, rate);
}
function stopShooting() {
  if (shootInterval) { clearInterval(shootInterval); shootInterval = null; }
}

document.getElementById('btnNewGame').addEventListener('click', startNewGame);
document.getElementById('btnRestart').addEventListener('click', () => {
  player.currentLevel = 1;
  player.totalKills = 0;
  lastScareCheckAngle = -999;
  startLevel(1);
});
document.getElementById('btnMenu').addEventListener('click', goToMenu);
document.getElementById('btnVictoryMenu').addEventListener('click', goToMenu);
document.getElementById('btnNextLevel').addEventListener('click', () => {
  lastScareCheckAngle = -999;
  startLevel(player.currentLevel);
});

function init() {
  try {
    generateTextures();
    generateWeaponSprites();
    generateEnemySprites();
    generateFaceTextures();
    loadAllImages(() => {
      try { loadEasterEggImages(() => {}); } catch(e) { console.warn('main.js error:', e); }
    });
    loadAnimatedFrames(() => {});
    document.getElementById('menuScreen').style.display = 'flex';
    requestAnimationFrame(gameLoop);
  } catch(e) {
    console.error('init error:', e);
    document.getElementById('menuScreen').style.display = 'flex';
    requestAnimationFrame(gameLoop);
  }
}

init();
