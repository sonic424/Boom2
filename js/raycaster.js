let textures = {};
let wallTextureData = {};
let bloodDecals = [];
let easterEggTextures = [];
let easterEggData = {};
let particles = [];

let ceilingBloodStains = [];
let floorBloodPools = [];

function generateStainPositions() {
  ceilingBloodStains = [];
  for (let i = 0; i < 15; i++) {
    ceilingBloodStains.push({
      x: Math.floor(Math.random() * CONFIG.WIDTH),
      y: Math.floor(Math.random() * (CONFIG.HEIGHT / 4)),
      w: 6 + Math.floor(Math.random() * 8),
      h: 8 + Math.floor(Math.random() * 10)
    });
  }
  floorBloodPools = [];
  for (let i = 0; i < 15; i++) {
    floorBloodPools.push({
      x: Math.floor(Math.random() * CONFIG.WIDTH),
      y: CONFIG.HEIGHT / 2 + Math.floor(Math.random() * (CONFIG.HEIGHT / 2)),
      r: 4 + Math.floor(Math.random() * 12),
      corpse: Math.random() < 0.2 ? 1 : 0
    });
  }
}

function spawnParticles(x, y, count, color, speed, life) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * speed;
    particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: life || 0.5,
      maxLife: life || 0.5,
      color: color || '#ff4400',
      size: 1 + Math.random() * 3
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); }
  }
}

function renderParticles(ctx) {
  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
  particles.forEach(p => {
    const dx = p.x - player.x;
    const dy = p.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.2 || dist > CONFIG.FOG_DISTANCE) return;
    const angle = Math.atan2(dy, dx);
    let diff = angle - player.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > CONFIG.HALF_FOV + 0.2) return;
    const sx = W / 2 + (diff / CONFIG.HALF_FOV) * (W / 2);
    const size = Math.min(p.size * 20 / dist, p.size * 5);
    const alpha = (p.life / p.maxLife) * 0.8;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sx, H / 2, size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function generateTextures() {
  const T = CONFIG.TEX_SIZE;

  function createTex(id, drawFn) {
    const c = document.createElement('canvas');
    c.width = T; c.height = T;
    const ctx = c.getContext('2d');
    drawFn(ctx, T);
    textures[id] = c;
    wallTextureData[id] = ctx.getImageData(0, 0, T, T).data;
  }

  createTex(1, (ctx, s) => {
    ctx.fillStyle = '#3A1A1A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#2A0A0A';
    for (let y = 0; y < s; y += 12) {
      ctx.fillRect(0, y, s, 2);
      let off = (Math.floor(y / 12) % 2) * 10;
      for (let x = off; x < s; x += 20) ctx.fillRect(x, y, 2, 12);
    }
    ctx.fillStyle = '#6A0000';
    for (let i = 0; i < 12; i++) {
      let bx = (i * 37 + 13) % s, by = (i * 53 + 7) % s;
      ctx.fillRect(bx, by, 3, 5 + (i % 3) * 3);
    }
    ctx.fillStyle = '#3A0000';
    for (let i = 0; i < 8; i++) {
      let bx = (i * 41 + 17) % s, by = (i * 29 + 11) % s;
      ctx.beginPath(); ctx.arc(bx, by, 4 + i % 3, 0, Math.PI * 2); ctx.fill();
    }
  });

  createTex(2, (ctx, s) => {
    ctx.fillStyle = '#2A2A2A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#1A1A1A';
    for (let y = 0; y < s; y += 8) ctx.fillRect(0, y, s, 1);
    for (let x = 0; x < s; x += 8) ctx.fillRect(x, 0, 1, s);
    ctx.fillStyle = '#1A1A1A';
    for (let i = 0; i < 5; i++) {
      let cx = (i * 31 + 11) % s, cy = (i * 43 + 19) % s;
      for (let j = 0; j < 8; j++) {
        ctx.fillRect(cx, cy, 1, 1);
        cx += ((j * 7 + 3) % 5 - 2) * 0.5;
        cy += ((j * 11 + 5) % 5 - 2) * 0.5;
      }
    }
  });

  createTex(3, (ctx, s) => {
    ctx.fillStyle = '#2A2A2A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#4A4A4A';
    for (let x = 6; x < s; x += 16)
      for (let y = 6; y < s; y += 16) {
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      }
    ctx.fillStyle = '#5A3A1A';
    for (let i = 0; i < 10; i++) {
      let rx = (i * 23 + 7) % s, ry = (i * 47 + 13) % s;
      ctx.fillRect(rx, ry, 3 + i % 3, 2 + i % 4);
    }
    ctx.fillStyle = '#5A0000';
    ctx.fillRect(s / 2 - 5, 0, 10, s / 3);
  });

  createTex(4, (ctx, s) => {
    ctx.fillStyle = '#3A1A1A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#5A2030';
    for (let y = 0; y < s; y += 6)
      for (let x = 0; x < s; x += 6)
        if ((x + y) % 12 === 0) ctx.fillRect(x, y, 6, 6);
    ctx.strokeStyle = '#8A3040'; ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      let sx = (i * 53 + 29) % s, sy = (i * 37 + 11) % s;
      ctx.moveTo(sx, sy);
      for (let j = 0; j < 5; j++) ctx.lineTo(sx + ((j * 13 + 7) % 11 - 5) * 1.2, sy + ((j * 17 + 3) % 11 - 5) * 1.2);
      ctx.stroke();
    }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s / 2, s / 2, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(s / 2, s / 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(s / 2, s / 2, 2, 0, Math.PI * 2); ctx.fill();
  });

  createTex(13, (ctx, s) => {
    ctx.fillStyle = '#1A0A0A'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 8; i++) {
      let bx = (i * 37 + 13) % s, by = (i * 53 + 7) % s;
      ctx.fillStyle = '#8A0000'; ctx.beginPath();
      ctx.arc(bx, by, 5 + i % 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#AA4444'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      let gx = (i * 23 + 5) % s, gy = (i * 17 + 10) % s;
      ctx.moveTo(gx, gy);
      for (let j = 0; j < 8; j++) {
        gx += (j % 2 === 0 ? 1 : -1) * 6;
        gy += ((j * 7 + 3) % 9 - 4) * 3;
        ctx.lineTo(gx, gy);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#DDCCBB';
    for (let i = 0; i < 3; i++) {
      let bx = (i * 31 + 11) % s, by = (i * 43 + 19) % s;
      ctx.fillRect(bx - 5, by - 2, 10, 4);
      ctx.fillRect(bx - 2, by - 5, 4, 10);
    }
    ctx.fillStyle = '#AA0000';
    for (let i = 0; i < 6; i++) {
      let dx = (i * 19 + 7) % s;
      ctx.fillRect(dx - 2, s - 10 - i * 3, 4, 8 + i * 2);
    }
  });

  createTex(14, (ctx, s) => {
    ctx.fillStyle = '#3A3A3A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#5A5A5A';
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 11, 0, 8, s);
    ctx.fillStyle = '#2A2A2A';
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 11 + 2, 0, 4, s);
    ctx.fillStyle = '#FFAA00'; ctx.globalAlpha = 0.3;
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 11, 0, 8, 3);
    ctx.globalAlpha = 1;
  });

  createTex(15, (ctx, s) => {
    ctx.fillStyle = '#3A3A3A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 11, 0, 8, s);
    ctx.fillStyle = '#2266FF'; ctx.globalAlpha = 0.3;
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 11, s - 3, 8, 3);
    ctx.globalAlpha = 1;
  });

  createTex(11, (ctx, s) => {
    ctx.fillStyle = '#2A1A1A'; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#664422'; ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, s - 4, s - 4);
    ctx.strokeRect(6, 6, s - 12, s - 12);
    ctx.strokeStyle = '#884433';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#AA5533';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const a2 = ((i + 2) * 2 * Math.PI / 5) - Math.PI / 2;
      ctx.moveTo(s / 2 + Math.cos(a1) * 12, s / 2 + Math.sin(a1) * 12);
      ctx.lineTo(s / 2 + Math.cos(a2) * 12, s / 2 + Math.sin(a2) * 12);
    }
    ctx.stroke();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 1.5, 0, Math.PI * 2); ctx.fill();
  });

  createTex(17, (ctx, s) => {
    ctx.fillStyle = '#4A4A5A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#3A3A4A';
    for (let x = 0; x < s; x += 4) for (let y = 0; y < s; y += 4) {
      if ((x + y) % 8 === 0) ctx.fillRect(x, y, 4, 4);
    }
    ctx.strokeStyle = '#5A5A6A'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#3A3A4A'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#6A6A7A';
    ctx.fillRect(s / 2 - 6, 0, 12, s);
    ctx.fillRect(0, s / 2 - 6, s, 12);
  });

  createTex(19, (ctx, s) => {
    ctx.fillStyle = '#5A3A1A'; ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#3A2A0A'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#4A2A0A'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#4A2A0A';
    ctx.fillRect(s / 2 - 10, 0, 20, 6);
    ctx.fillRect(s / 2 - 10, s - 6, 20, 6);
    ctx.fillStyle = '#7A5A2A';
    ctx.fillRect(s / 2 - 8, 2, 16, 4);
    ctx.fillRect(s / 2 - 8, s - 4, 16, 4);
    ctx.fillStyle = '#3A1A0A';
    ctx.beginPath(); ctx.arc(s / 2, s / 2, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6A4A1A';
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      ctx.fillRect(s / 2 + Math.cos(a) * 10 - 2, s / 2 + Math.sin(a) * 10 - 1, 4, 2);
    }
  });

  createTex(24, (ctx, s) => {
    ctx.fillStyle = '#2A2A2A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#1A1A1A';
    for (let y = 0; y < s; y += 6) ctx.fillRect(0, y, s, 1);
    ctx.fillStyle = '#DDCCBB';
    ctx.fillRect(s / 2 - 3, s * 0.15, 6, 10);
    ctx.beginPath(); ctx.arc(s / 2, s * 0.12, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(s / 2 - 6, s * 0.3, 12, 8);
    ctx.fillRect(s / 2 - 2, s * 0.38, 4, 30);
    ctx.fillRect(s / 2 - 2, s * 0.3, 20, 3);
    ctx.fillRect(s / 2 - 18, s * 0.3, 20, 3);
    ctx.fillRect(s / 2 - 2, s * 0.68, 8, 20);
    ctx.fillRect(s / 2 - 6, s * 0.68, 8, 20);
    ctx.fillStyle = '#AA0000';
    ctx.beginPath(); ctx.arc(s / 2, s * 0.45, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s / 2 - 4, s * 0.55, 4, 0, Math.PI * 2); ctx.fill();
  });

  createTex(25, (ctx, s) => {
    ctx.fillStyle = '#3A3A3A'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#2A2A2A';
    for (let y = 0; y < s; y += 8) ctx.fillRect(0, y, s, 1);
    ctx.fillStyle = '#5A5A5A';
    ctx.fillRect(s / 2 - 12, s * 0.15, 24, 40);
    ctx.fillStyle = '#4A4A4A';
    ctx.beginPath(); ctx.arc(s / 2, s * 0.12, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5A5A5A';
    ctx.fillRect(s / 2 - 16, s * 0.35, 32, 6);
    ctx.fillRect(s / 2 - 4, s * 0.55, 8, 30);
    ctx.fillRect(s / 2 + 4, s * 0.55, 8, 30);
    ctx.fillRect(s / 2 - 12, s * 0.55, 8, 30);
    ctx.fillRect(s / 2 - 20, s * 0.55, 8, 30);
    ctx.fillStyle = '#6A6A6A';
    ctx.fillRect(s / 2 - 10, s * 0.2, 20, 3);
  });

  generateStainPositions();
}

function loadEasterEggImages(callback) {
  const files = ['images/12ge.png','images/2112.png','images/im1212121212e.png','images/im21ge.png'];
  let loaded = 0;
  const T = CONFIG.TEX_SIZE;
  files.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      easterEggTextures[i] = img;
      const c = document.createElement('canvas');
      c.width = T; c.height = T;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, T, T);
      textures['egg'+i] = c;
      easterEggData['egg'+i] = ctx.getImageData(0, 0, T, T).data;
      loaded++;
      if (loaded === files.length && callback) callback();
    };
    img.onerror = () => { loaded++; if (loaded === files.length && callback) callback(); };
    img.src = src;
  });
}

function castRay(angle, mapData) {
  angle = angle % (Math.PI * 2);
  if (angle < 0) angle += Math.PI * 2;

  const right = angle > Math.PI * 1.5 || angle < Math.PI * 0.5;
  const up = angle > Math.PI && angle < Math.PI * 2;

  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  let mapX = Math.floor(player.x);
  let mapY = Math.floor(player.y);

  const deltaDistX = dirX === 0 ? 1e30 : Math.abs(1 / dirX);
  const deltaDistY = dirY === 0 ? 1e30 : Math.abs(1 / dirY);

  let stepX, stepY, sideDistX, sideDistY;
  if (right) { stepX = 1; sideDistX = (mapX + 1 - player.x) * deltaDistX; }
  else { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; }
  if (!up) { stepY = 1; sideDistY = (mapY + 1 - player.y) * deltaDistY; }
  else { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; }

  let hit = false, side = 0, wallType = 0, maxSteps = 64;

  while (!hit && maxSteps-- > 0) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX; mapX += stepX; side = 0;
    } else {
      sideDistY += deltaDistY; mapY += stepY; side = 1;
    }
    if (mapY < 0 || mapY >= mapData.length || mapX < 0 || mapX >= mapData[0].length) break;
    const tile = mapData[mapY][mapX];
    if (tile > 0 && tile !== 5 && tile !== 6 && tile !== 7 && tile !== 12 && tile !== 13 && tile !== 14 && tile !== 15 && tile !== 16 && tile !== 18 && tile !== 20 && tile !== 21 && tile !== 22 && tile !== 23) {
      hit = true; wallType = tile;
    }
  }

  if (!hit) return { dist: 1e30, wallType: 0, wallX: 0, side: 0, mapX: 0, mapY: 0 };

  let perpDist;
  if (side === 0) perpDist = (mapX - player.x + (1 - stepX) / 2) / dirX;
  else perpDist = (mapY - player.y + (1 - stepY) / 2) / dirY;
  if (perpDist < 0.01) perpDist = 0.01;

  let wallX;
  if (side === 0) wallX = player.y + perpDist * dirY;
  else wallX = player.x + perpDist * dirX;
  wallX -= Math.floor(wallX);

  return { dist: perpDist, wallType, wallX, side, mapX, mapY };
}

function updateBloodDecals(dt) {
  bloodDecals.forEach(d => { d.life -= dt; });
  bloodDecals = bloodDecals.filter(d => d.life > 0);
  updateParticles(dt);
}

function addBloodDecal(x, y) {
  bloodDecals.push({ x, y, life: 5 });
  if (bloodDecals.length > 50) bloodDecals.shift();
  spawnParticles(x + 0.5, y + 0.5, 6, '#aa0000', 2, 0.4);
}

let pixelBuffer = null;

function getPixelBuffer() {
  if (!pixelBuffer) {
    pixelBuffer = document.createElement('canvas');
    pixelBuffer.width = CONFIG.WIDTH;
    pixelBuffer.height = CONFIG.HEIGHT;
  }
  return pixelBuffer;
}

function renderFrame(ctx, mapData) {
  const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
  const T = CONFIG.TEX_SIZE;
  const buf = getPixelBuffer();
  const bctx = buf.getContext('2d');
  const imgData = bctx.createImageData(W, H);
  const data = imgData.data;

  const level = player.currentLevel;
  const isFortress = level >= 4 && level <= 6;
  const isHell = level >= 7;

  for (let y = 0; y < H / 2; y++) {
    const t = y / (H / 2);
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      let brightness;
      if (isHell) {
        const flicker = Math.sin(x * 0.1 + y * 0.05) * 3;
        brightness = Math.floor(8 + t * 8 + (x % 6) * 1.5 + flicker);
      } else {
        brightness = Math.floor(15 + t * 10 + (x % 8) * 2);
      }
      data[idx] = Math.min(255, brightness);
      data[idx + 1] = isHell ? Math.min(255, brightness - 8) : Math.min(255, brightness - 5);
      data[idx + 2] = isHell ? Math.min(255, brightness - 12) : Math.min(255, brightness - 10);
      data[idx + 3] = 255;
    }
  }

  if (isFortress) {
    for (let y = 0; y < H / 2; y += 16) {
      for (let x = 0; x < W; x += 32) {
        for (let i = x; i < W && i < x + 32; i++) {
          if (y < H / 2) {
            const idx = ((y) * W + i) * 4;
            data[idx] = Math.max(0, data[idx] - 20);
            data[idx + 1] = Math.max(0, data[idx + 1] - 15);
            data[idx + 2] = Math.max(0, data[idx + 2] - 10);
          }
        }
        if ((x / 32 + y / 16) % 2 === 0) {
          const lx = x + 16, ly = y + 8;
          if (lx < W && ly < H / 2) {
            const idx = (ly * W + lx) * 4;
            data[idx] = Math.min(255, data[idx] + 60);
            data[idx + 1] = Math.min(255, data[idx + 1] + 50);
            data[idx + 2] = Math.min(255, data[idx + 2] + 30);
          }
        }
      }
    }
  }

  if (isHell) {
    for (let y = 0; y < H / 2; y += 8) {
      for (let x = 0; x < W; x += 8) {
        const px = x + 2, py = y + 2;
        if (px < W && py < H / 2) {
          const idx = (py * W + px) * 4;
          if ((x + y) % 16 === 0) {
            data[idx] = Math.min(255, data[idx] + 20);
            data[idx + 1] = Math.max(0, data[idx + 1] - 10);
            data[idx + 2] = Math.max(0, data[idx + 2] - 15);
          }
        }
      }
    }
  }

  ceilingBloodStains.forEach(st => {
    for (let dy = 0; dy < st.h; dy++) {
      for (let dx = 0; dx < st.w; dx++) {
        const px = st.x + dx, py = st.y + dy;
        if (px >= 0 && px < W && py >= 0 && py < H / 2) {
          const idx = (py * W + px) * 4;
          const dist = Math.sqrt((dx - st.w / 2) ** 2 + (dy - st.h / 2) ** 2);
          const alpha = Math.max(0, 1 - dist / Math.max(st.w, st.h));
          if (alpha > 0.4) {
            data[idx] = Math.max(0, data[idx] - 40);
            data[idx + 1] = Math.max(0, data[idx + 1] - 30);
            data[idx + 2] = Math.max(0, data[idx + 2] - 20);
          }
        }
      }
    }
  });

  for (let y = H / 2; y < H; y++) {
    const t = (y - H / 2) / (H / 2);
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      if (isHell) {
        const crack = ((x + y * 3) % 13 < 11) ? 1 : 0;
        const r = Math.min(255, Math.floor(35 + t * 30 + crack * 12));
        const g = Math.min(255, Math.floor(10 + t * 8 + crack * 3));
        const b = Math.min(255, Math.floor(8 + t * 5 + crack * 2));
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
      } else {
        const brick = ((x + y * 3) % 16 < 14) ? 1 : 0;
        const r = Math.min(255, Math.floor(25 + t * 25 + brick * 15));
        const g = Math.min(255, Math.floor(15 + t * 10 + brick * 5));
        const b = Math.min(255, Math.floor(15 + t * 8 + brick * 3));
        data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 255;
      }
    }
  }

  floorBloodPools.forEach(fp => {
    if (fp.corpse) {
      for (let dy = -3; dy < 3; dy++) {
        for (let dx = -8; dx < 8; dx++) {
          const xx = fp.x + dx, yy = fp.y + dy;
          if (xx >= 0 && xx < W && yy >= H / 2 && yy < H) {
            const body = (Math.abs(dy * 3) + Math.abs(dx)) < 6;
            if (body) {
              const idx = (yy * W + xx) * 4;
              data[idx] = Math.max(30, data[idx] - 40);
              data[idx + 1] = Math.max(10, data[idx + 1] - 30);
              data[idx + 2] = Math.max(10, data[idx + 2] - 20);
            }
          }
        }
      }
    }
    for (let dy = -fp.r; dy < fp.r; dy++) {
      for (let dx = -fp.r * 1.5; dx < fp.r * 1.5; dx++) {
        const xx = fp.x + dx, yy = fp.y + dy;
        if (xx >= 0 && xx < W && yy >= H / 2 && yy < H) {
          const dist = Math.sqrt(dx * dx + (dy * 0.7) ** 2);
          if (dist < fp.r) {
            const idx = (yy * W + xx) * 4;
            const alpha = 1 - dist / fp.r;
            if (alpha > 0.3) {
              data[idx] = Math.max(20, data[idx] - 50 * alpha);
              data[idx + 1] = Math.max(5, data[idx + 1] - 35 * alpha);
              data[idx + 2] = Math.max(5, data[idx + 2] - 25 * alpha);
            }
          }
        }
      }
    }
  });

  const zBuffer = new Float32Array(W);

  for (let x = 0; x < W; x++) {
    const rayAngle = player.angle - CONFIG.HALF_FOV + (x / W) * CONFIG.FOV;
    const result = castRay(rayAngle, mapData);
    zBuffer[x] = result.dist;

    if (!result.wallType || result.dist > 50) continue;

    const wallHeight = Math.min(H / result.dist, H * 2);
    const wallTop = Math.max(0, Math.floor(H / 2 - wallHeight / 2));
    const wallBot = Math.min(H, Math.ceil(H / 2 + wallHeight / 2));

    let fogFactor = Math.max(0, Math.min(1, 1 - (result.dist - 1) / CONFIG.FOG_DISTANCE));
    if (isHell) fogFactor *= 0.85;

    let texData = null;
    const wt = result.wallType;

    if (wt === 11 && easterEggData['egg0']) {
      const eggIndex = ((result.mapX * 7 + result.mapY * 13) % 4);
      texData = easterEggData['egg' + eggIndex] || wallTextureData[1];
    } else if ((wt === 14 || wt === 15 || wt === 16) && wallTextureData[wt]) {
      texData = wallTextureData[wt];
    } else {
      texData = wallTextureData[wt] || wallTextureData[1];
    }

    if (texData) {
      const texX = Math.min(T - 1, Math.max(0, Math.floor(result.wallX * T)));
      const shade = result.side === 1 ? 0.7 : 1;
      for (let y = wallTop; y < wallBot; y++) {
        const texY = Math.min(T - 1, Math.max(0, Math.floor(((y - wallTop) / wallHeight) * T)));
        const srcIdx = (texY * T + texX) * 4;
        const dstIdx = (y * W + x) * 4;
        data[dstIdx] = Math.min(255, Math.floor(texData[srcIdx] * fogFactor * shade));
        data[dstIdx + 1] = Math.min(255, Math.floor(texData[srcIdx + 1] * fogFactor * shade));
        data[dstIdx + 2] = Math.min(255, Math.floor(texData[srcIdx + 2] * fogFactor * shade));
        data[dstIdx + 3] = 255;
      }
    } else {
      const r = Math.floor(50 * fogFactor);
      const g = Math.floor(30 * fogFactor);
      const b = Math.floor(30 * fogFactor);
      for (let y = wallTop; y < wallBot; y++) {
        const dstIdx = (y * W + x) * 4;
        data[dstIdx] = r; data[dstIdx + 1] = g; data[dstIdx + 2] = b; data[dstIdx + 3] = 255;
      }
    }
  }

  bloodDecals.forEach(d => {
    if (d.life <= 0) return;
    const dx = d.x + 0.5 - player.x;
    const dy = d.y + 0.5 - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    let diff = angle - player.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > CONFIG.HALF_FOV) return;
    const sx = W / 2 + (diff / CONFIG.HALF_FOV) * (W / 2);
    const sxr = Math.round(sx);
    if (sxr >= 0 && sxr < W && zBuffer[sxr] < dist - 0.1) return;
    const size = Math.min(60 / dist, 40);
    const fog = Math.max(0, Math.min(1, 1 - dist / CONFIG.FOG_DISTANCE));
    if (fog <= 0) return;
    ctx.globalAlpha = fog * Math.min(1, d.life / 3);
    ctx.fillStyle = '#4A0000';
    ctx.beginPath(); ctx.arc(sx, H / 2, size, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });

  bctx.putImageData(imgData, 0, 0);
  ctx.drawImage(buf, 0, 0);
  renderSprites(ctx, zBuffer, mapData);
  renderParticles(ctx);
}
