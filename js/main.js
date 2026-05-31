const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
let gameDt = 0.016;

const STATE = { MENU: 0, PLAYING: 1, LEVEL_COMPLETE: 2, GAME_OVER: 3, VICTORY: 4, PAUSED: 5 };
let gameState = STATE.MENU;
let lastTime = 0;
let scareActive = false;
let scareTimer = 0;
let scareOverlay = document.getElementById('scareOverlay');
let scareImg = document.getElementById('scareImg');

const scareImages = ['images/image.png', 'images/image22.png', 'images/image2121.png'];
let loadedScareImages = [];

function loadAllImages(callback) {
  let toLoad = scareImages.length;
  const check = () => { toLoad--; if (toLoad <= 0 && callback) callback(); };
  scareImages.forEach((src, i) => {
    const img = new Image();
    img.onload = () => { loadedScareImages[i] = img; check(); };
    img.onerror = () => { console.warn('Failed to load scare image:', src); check(); };
    img.src = src;
  });
}

function safeExitPointerLock() {
  try { document.exitPointerLock(); } catch(e) { console.warn('main.js error:', e); }
}

function triggerScare() {
  if (scareActive) return;
  scareActive = true;
  scareTimer = 0.35;
  const idx = Math.floor(Math.random() * loadedScareImages.length);
  const img = loadedScareImages[idx];
  if (img) { scareImg.src = img.src; scareOverlay.style.display = 'block'; }
  playScare();
}

function updateScare(dt) {
  if (!scareActive) return;
  scareTimer -= dt;
  if (scareTimer <= 0) { scareActive = false; scareOverlay.style.display = 'none'; }
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
    document.getElementById('menuScreen').style.display = 'flex';
    requestAnimationFrame(gameLoop);
  } catch(e) {
    console.error('init error:', e);
    document.getElementById('menuScreen').style.display = 'flex';
    requestAnimationFrame(gameLoop);
  }
}

init();
