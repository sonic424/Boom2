const player = {
  x: 2.5, y: 2.5, angle: 0,
  health: 100,
  weapon: 'pistol',
  ammo: { pistol: Infinity, shotgun: 20, plasma: 30 },
  dashCooldown: 0, dashTimer: 0, dashCooldownActive: false,
  keys: {}, mouseDown: false, lastShotTime: 0,
  damageTimer: 0, invincibleTimer: 0,
  totalKills: 0, currentLevel: 1, levelKills: 0,
  weaponRecoil: 0, weaponKickX: 0, weaponKickY: 0,
  weaponBobX: 0, weaponBobY: 0,
  stuckTimer: 0,
  levelTime: 0
};

function resetPlayer(level) {
  const mapData = getLevelMap(level);
  const start = mapData.playerStart || { r: 22, c: 2 };
  player.x = start.c + 0.5;
  player.y = start.r + 0.5;
  player.angle = 0;
  player.health = 100;
  player.weapon = 'pistol';
  player.ammo = { pistol: Infinity, shotgun: 20, plasma: 30 };
  player.dashCooldown = 0;
  player.dashTimer = 0;
  player.dashCooldownActive = false;
  player.levelKills = 0;
  player.damageTimer = 0;
  player.invincibleTimer = 0;
  player.weaponRecoil = 0;
  player.weaponKickX = 0;
  player.weaponKickY = 0;
  player.weaponBobX = 0;
  player.weaponBobY = 0;
  player.levelTime = 0;
}

function updatePlayer(dt, mapData) {
  if (player.health <= 0) return;

  const speed = player.dashTimer > 0 ? CONFIG.DASH_SPEED : CONFIG.PLAYER_SPEED;
  const rotSpeed = CONFIG.PLAYER_ROT_SPEED;

  if (player.dashTimer > 0) {
    player.dashTimer -= dt;
    if (player.dashTimer < 0) player.dashTimer = 0;
  }
  if (player.dashCooldown > 0) {
    player.dashCooldown -= dt;
    if (player.dashCooldown < 0) player.dashCooldown = 0;
  }
  if (player.invincibleTimer > 0) {
    player.invincibleTimer -= dt;
    if (player.invincibleTimer < 0) player.invincibleTimer = 0;
  }

  if (player.keys['shift'] && !player.dashCooldownActive && player.dashCooldown <= 0 && player.dashTimer <= 0) {
    player.dashTimer = CONFIG.DASH_DURATION;
    player.dashCooldown = CONFIG.DASH_COOLDOWN;
    player.dashCooldownActive = true;
    playDash();
    setTimeout(() => { player.dashCooldownActive = false; }, 100);
  }

  let moveX = 0, moveY = 0;

  if (player.keys['w']) {
    moveX += Math.cos(player.angle) * speed * dt;
    moveY += Math.sin(player.angle) * speed * dt;
  }
  if (player.keys['s']) {
    moveX -= Math.cos(player.angle) * speed * dt;
    moveY -= Math.sin(player.angle) * speed * dt;
  }
  if (player.keys['a']) {
    moveX += Math.cos(player.angle - Math.PI / 2) * speed * dt;
    moveY += Math.sin(player.angle - Math.PI / 2) * speed * dt;
  }
  if (player.keys['d']) {
    moveX += Math.cos(player.angle + Math.PI / 2) * speed * dt;
    moveY += Math.sin(player.angle + Math.PI / 2) * speed * dt;
  }

  if (player.keys['arrowleft']) { player.angle -= rotSpeed * dt; }
  if (player.keys['arrowright']) { player.angle += rotSpeed * dt; }

  const R = PLAYER_RADIUS;
  let moved = false;

  if (moveX !== 0 || moveY !== 0) {
    const newX = player.x + moveX;
    const newY = player.y + moveY;

    if (canMoveTo(newX, player.y, R, mapData)) {
      player.x = newX; moved = true;
    } else if (player.dashTimer > 0) {
      if (canMoveTo(player.x + moveX * 0.5, player.y, R, mapData)) {
        player.x += moveX * 0.5; moved = true;
      }
    }

    if (canMoveTo(player.x, newY, R, mapData)) {
      player.y = newY; moved = true;
    } else if (player.dashTimer > 0) {
      if (canMoveTo(player.x, player.y + moveY * 0.5, R, mapData)) {
        player.y += moveY * 0.5; moved = true;
      }
    }

    if (moved) {
      player.stuckTimer = 0;
      playFootstep(dt);
    } else {
      player.stuckTimer += dt;
    }
  }

  if (player.stuckTimer > 0.5) {
    player.stuckTimer = 0;
    for (let a = 0; a < 8; a++) {
      const ra = player.angle + (Math.random() - 0.5) * Math.PI;
      const rx = player.x + Math.cos(ra) * speed * dt * 2;
      const ry = player.y + Math.sin(ra) * speed * dt * 2;
      if (canMoveTo(rx, ry, R, mapData)) {
        player.x = rx; player.y = ry; break;
      }
    }
  }

  if (player.dashTimer > 0) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.dead) continue;
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.8) {
        e.hp -= CONFIG.DASH_DAMAGE;
        e.state = 'hurt';
        e.hurtTimer = 0.2;
        playEnemyPain();
        if (e.hp <= 0) killEnemy(i);
      }
    }
  }

  if (player.damageTimer > 0) player.damageTimer -= dt;

  checkItemPickups(mapData);
}

function checkItemPickups(mapData) {
  const mx = Math.floor(player.x);
  const my = Math.floor(player.y);
  const tile = mapData[my] && mapData[my][mx];

  if (tile === 6 || tile === 12) {
    if (player.health < CONFIG.MAX_HEALTH) {
      const heal = tile === 12 ? 50 : 25;
      player.health = Math.min(player.health + heal, CONFIG.MAX_HEALTH);
      mapData[my][mx] = 0;
      playPickup();
      if (tile === 12) triggerScare();
    }
  } else if (tile === 7) {
    let added = false;
    if (player.ammo.shotgun < CONFIG.WEAPONS.shotgun.maxAmmo) {
      player.ammo.shotgun = Math.min(player.ammo.shotgun + 8, CONFIG.WEAPONS.shotgun.maxAmmo);
      added = true;
    }
    if (player.ammo.plasma < CONFIG.WEAPONS.plasma.maxAmmo) {
      player.ammo.plasma = Math.min(player.ammo.plasma + 20, CONFIG.WEAPONS.plasma.maxAmmo);
      added = true;
    }
    if (added) { mapData[my][mx] = 0; playPickup(); }
  } else if (tile === 5) {
    checkLevelComplete();
  }
}

function playerTakeDamage(dmg) {
  if (player.health <= 0 || player.invincibleTimer > 0) return;
  player.health -= dmg;
  player.damageTimer = 0.3;
  player.invincibleTimer = 0.2;
  playPlayerHurt();
  if (player.health <= 0) {
    player.health = 0;
    playPlayerDeath();
    gameOver();
  }
}
