let projectiles = [];

function spawnProjectile(sx, sy, angle, speed, damage, owner, type) {
  projectiles.push({
    x: sx, y: sy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    damage: damage,
    owner: owner,
    type: type || 'fireball',
    life: 5,
    trail: []
  });
}

function updateProjectiles(dt, mapData) {
  let i = 0;
  while (i < projectiles.length) {
    const p = projectiles[i];
    p.life -= dt;
    if (p.life <= 0) { projectiles.splice(i, 1); continue; }

    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 8) p.trail.shift();

    const steps = 4;
    let destroyed = false;
    for (let s = 0; s < steps; s++) {
      p.x += p.vx * dt / steps;
      p.y += p.vy * dt / steps;

      const mx = Math.floor(p.x);
      const my = Math.floor(p.y);
      if (my < 0 || my >= mapData.length || mx < 0 || mx >= mapData[0].length) {
        projectiles.splice(i, 1); destroyed = true; break;
      }
      const tile = mapData[my][mx];
      if (tile > 0 && tile !== 5 && tile !== 6 && tile !== 7 && tile !== 12 && tile !== 13 && tile !== 14 && tile !== 15 && tile !== 16 && tile !== 18 && tile !== 20 && tile !== 21 && tile !== 22 && tile !== 23) {
        if (tile === 19 && p.owner === 'player') {
          explodeBarrel(mx, my, mapData);
        } else {
          addBloodDecal(mx, my);
        }
        playProjectileHit();
        projectiles.splice(i, 1); destroyed = true; break;
      }

      if (p.owner !== 'player') {
        const pdx = p.x - player.x;
        const pdy = p.y - player.y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < 0.5) {
          playerTakeDamage(p.damage);
          triggerCombatScare(0.5);
          playProjectileHit();
          projectiles.splice(i, 1); destroyed = true; break;
        }
      }

      if (p.owner === 'player') {
        for (let ei = 0; ei < enemies.length; ei++) {
          const e = enemies[ei];
          if (e.dead) continue;
          const edx = p.x - e.x;
          const edy = p.y - e.y;
          if (Math.sqrt(edx * edx + edy * edy) < 0.6) {
            const actualDmg = Math.min(p.damage, e.hp);
            e.hp -= p.damage;
            e.state = 'hurt';
            e.hurtTimer = 0.3;
            playEnemyPain();
            addBloodDecal(Math.floor(e.x), Math.floor(e.y));
            spawnDamageNumber(e.x, e.y, actualDmg);
            if (e.hp <= 0) { killEnemy(ei); triggerCombatScare(0.6); }
            else { triggerCombatScare(0.3); }
            playProjectileHit();
            projectiles.splice(i, 1); destroyed = true; break;
          }
        }
        if (destroyed) break;
      }
    }
    if (!destroyed) i++;
  }
}

function renderProjectiles(ctx, zBuffer) {
  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;

  projectiles.forEach(p => {
    const dx = p.x - player.x;
    const dy = p.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.3 || dist > CONFIG.FOG_DISTANCE) return;

    const angle = Math.atan2(dy, dx);
    let diff = angle - player.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > CONFIG.HALF_FOV + 0.2) return;

    const screenX = W / 2 + (diff / CONFIG.HALF_FOV) * (W / 2);
    const centerCol = Math.round(screenX);
    if (centerCol >= 0 && centerCol < W && zBuffer[centerCol] < dist - 0.1) return;

    const size = Math.min(30 / dist, 60);
    const fog = Math.max(0, Math.min(1, 1 - (dist - 1) / CONFIG.FOG_DISTANCE));

    const coreColor = p.type === 'plasma' ? '#00ff88' : '#ff4400';
    const glowColor = p.type === 'plasma' ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,0,0.3)';

    p.trail.forEach((t, ti) => {
      const tdx = t.x - player.x;
      const tdy = t.y - player.y;
      const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
      const tangle = Math.atan2(tdy, tdx);
      let tdiff = tangle - player.angle;
      while (tdiff > Math.PI) tdiff -= Math.PI * 2;
      while (tdiff < -Math.PI) tdiff += Math.PI * 2;
      if (Math.abs(tdiff) > CONFIG.HALF_FOV + 0.3) return;
      const tsx = W / 2 + (tdiff / CONFIG.HALF_FOV) * (W / 2);
      const tsize = Math.min(15 / tdist, 30) * ((ti + 1) / p.trail.length);
      ctx.globalAlpha = fog * 0.4 * (ti / p.trail.length);
      ctx.fillStyle = coreColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(tsx, H / 2, tsize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.globalAlpha = fog;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(screenX, H / 2, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(screenX, H / 2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });
}

function explodeBarrel(mx, my, mapData) {
  mapData[my][mx] = 0;
  const cx = mx + 0.5, cy = my + 0.5;
  spawnParticles(cx, cy, 30, '#ff6600', 8, 0.8);
  spawnParticles(cx, cy, 20, '#ffcc00', 6, 0.5);
  spawnParticles(cx, cy, 15, '#884400', 4, 0.6);

  enemies.forEach(e => {
    if (e.dead) return;
    const d = Math.hypot(e.x - cx, e.y - cy);
    if (d < 4) {
      const dmg = Math.round(50 * (1 - d / 4));
      e.hp -= dmg;
      e.hurtTimer = 0.3;
      e.state = 'hurt';
      if (d > 0.5) {
        const push = 3 / d;
        e.x += (e.x - cx) / d * push;
        e.y += (e.y - cy) / d * push;
      }
      if (e.hp <= 0) {
        const idx = enemies.indexOf(e);
        if (idx >= 0) killEnemy(idx);
      }
    }
  });

  const pd = Math.hypot(player.x - cx, player.y - cy);
  if (pd < 4) {
    const dmg = Math.round(30 * (1 - pd / 4));
    playerTakeDamage(dmg);
  }
}
