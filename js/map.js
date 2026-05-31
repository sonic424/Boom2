// MAPS[levelIndex] for 9 sequential levels (3 level sets × 3 floors)
const MAPS = [];

function getLevelMap(level) {
  if (level < 1 || level > MAPS.length) return null;
  return MAPS[level - 1];
}

function getLevelCount() {
  return MAPS.length;
}

function getLevelSetName(level) {
  const names = ['The Crypt', 'The Fortress', 'The Hell Gate'];
  const idx = Math.floor((level - 1) / 3);
  return names[Math.min(idx, 2)] || 'Unknown';
}

function getFloorInLevel(level) {
  return ((level - 1) % 3) + 1;
}

function getTotalLevels() {
  return MAPS.length;
}

function emptyMap(wallType) {
  const map = [];
  for (let y = 0; y < 24; y++) {
    map[y] = [];
    for (let x = 0; x < 24; x++) {
      map[y][x] = (y === 0 || y === 23 || x === 0 || x === 23) ? wallType : 0;
    }
  }
  return map;
}

function carve(m, y1, x1, y2, x2) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      if (y > 0 && y < 23 && x > 0 && x < 23) m[y][x] = 0;
}

// ==============================
// LEVEL SET 1: THE CRYPT
// ==============================

// --- CRYPT 1F ---
(function() {
  const m = emptyMap(1);
  // Room 1 (top-left)
  for (let y = 3; y <= 8; y++) { m[y][5] = 1; m[y][12] = 1; }
  for (let x = 5; x <= 12; x++) { m[3][x] = 1; m[8][x] = 1; }
  m[8][10] = 0;
  // Room 2 (right side)
  for (let y = 3; y <= 8; y++) { m[y][16] = 1; }
  for (let y = 3; y <= 8; y++) { for (let x = 16; x <= 22; x++) { m[y][x] = 0; } }
  // Vertical corridor
  for (let y = 12; y <= 18; y++) { m[y][6] = 1; }
  m[14][6] = 0;
  // Bottom structure
  for (let y = 14; y <= 20; y++) { m[y][12] = 1; }
  for (let x = 10; x <= 16; x++) { m[14][x] = 1; }
  for (let x = 10; x <= 16; x++) { m[20][x] = 1; }
  m[17][12] = 0;
  // Center pillar room
  for (let y = 9; y <= 13; y++) { m[y][18] = 1; }
  for (let x = 17; x <= 21; x++) { m[11][x] = 1; }
  m[11][17] = 0; m[11][21] = 0;
  // Stairs
  m[1][22] = 0; m[2][22] = 0;
  // 2x2 pillars
  m[10][19] = 17; m[10][20] = 17; m[11][19] = 17; m[11][20] = 17;
  // Torches
  m[4][6] = 18; m[7][13] = 18; m[15][7] = 18; m[19][13] = 18;
  // Barrels
  m[16][15] = 19; m[18][15] = 19;

  MAPS.push({
    name: 'Crypt 1F',
    map: m,
    wallTheme: 1,
    exitPos: { r: 2, c: 22 },
    entities: [
      { r: 2, c: 2, type: 6 }, { r: 2, c: 20, type: 7 },
      { r: 6, c: 14, type: 12 },
      { r: 5, c: 8, type: 8 }, { r: 5, c: 9, type: 8 },
      { r: 9, c: 20, type: 8 }, { r: 16, c: 14, type: 8 },
      { r: 12, c: 5, type: 9 }, { r: 18, c: 11, type: 9 },
      { r: 7, c: 1, type: 11 }, { r: 22, c: 12, type: 11 },
      { r: 15, c: 8, type: 6 }, { r: 10, c: 4, type: 7 },
      { r: 4, c: 18, type: 13 }, { r: 19, c: 18, type: 13 }
    ],
    playerStart: { r: 22, c: 2 }
  });
})();

// --- CRYPT 2F ---
(function() {
  const m = emptyMap(1);
  // Central hall
  for (let y = 6; y <= 17; y++) { m[y][6] = 1; m[y][17] = 1; }
  for (let x = 6; x <= 17; x++) { m[6][x] = 1; m[17][x] = 1; }
  // Inner walls
  for (let y = 9; y <= 14; y++) { m[y][10] = 1; m[y][13] = 1; }
  // Top room
  for (let y = 2; y <= 4; y++) { m[y][10] = 1; m[y][13] = 1; }
  for (let x = 10; x <= 13; x++) { m[2][x] = 1; m[4][x] = 1; }
  // Bottom area
  for (let x = 3; x <= 8; x++) { m[20][x] = 1; }
  for (let y = 20; y <= 22; y++) { m[y][3] = 1; }
  // Doors
  m[6][11] = 0; m[17][11] = 0; m[12][6] = 0;
  m[2][10] = 0; m[2][13] = 0;
  // Pillars
  m[10][15] = 17; m[13][8] = 17; m[13][15] = 17;
  // Torches
  m[7][11] = 18; m[8][12] = 18; m[15][12] = 18; m[12][9] = 18;
  m[12][14] = 18; m[11][4] = 18; m[16][7] = 18; m[7][16] = 18;
  // Barrels
  m[9][7] = 19; m[14][16] = 19;

  MAPS.push({
    name: 'Crypt 2F',
    map: m,
    wallTheme: 1,
    exitPos: { r: 2, c: 22 },
    entities: [
      { r: 2, c: 3, type: 6 }, { r: 14, c: 11, type: 6 },
      { r: 21, c: 8, type: 7 }, { r: 3, c: 11, type: 7 },
      { r: 4, c: 6, type: 8 }, { r: 7, c: 15, type: 8 },
      { r: 10, c: 8, type: 8 }, { r: 15, c: 14, type: 8 },
      { r: 8, c: 4, type: 8 },
      { r: 19, c: 5, type: 9 }, { r: 12, c: 4, type: 9 },
      { r: 18, c: 15, type: 16 }
    ],
    playerStart: { r: 22, c: 2 }
  });
})();

// --- CRYPT 3F ---
(function() {
  const m = emptyMap(1);
  // Spiral room
  for (let y = 3; y <= 10; y++) { m[y][8] = 1; m[y][15] = 1; }
  for (let x = 8; x <= 15; x++) { m[3][x] = 1; m[10][x] = 1; }
  m[10][11] = 0; m[3][11] = 0;
  // Middle wall
  for (let y = 12; y <= 20; y++) { m[y][12] = 1; }
  m[15][12] = 0;
  // Cross walls
  for (let x = 3; x <= 8; x++) { m[14][x] = 1; }
  for (let y = 16; y <= 20; y++) { m[y][6] = 1; }
  // Top-right room
  for (let y = 5; y <= 8; y++) { m[y][22] = 1; }
  for (let x = 18; x <= 22; x++) { m[5][x] = 1; m[8][x] = 1; }
  m[5][22] = 0;
  // Door
  m[12][7] = 0;
  // Exit
  m[1][2] = 0; m[2][2] = 0;
  // Pillars
  m[5][10] = 17; m[5][13] = 17; m[8][9] = 17; m[8][14] = 17;
  // Torches
  m[4][9] = 18; m[7][14] = 18; m[12][5] = 18; m[14][15] = 18;
  m[6][21] = 18; m[9][5] = 18;
  // Barrels
  m[13][6] = 19; m[18][11] = 19;

  MAPS.push({
    name: 'Crypt 3F',
    map: m,
    wallTheme: 1,
    exitPos: { r: 2, c: 2 },
    entities: [
      { r: 3, c: 3, type: 6 }, { r: 20, c: 20, type: 7 },
      { r: 6, c: 12, type: 8 }, { r: 8, c: 16, type: 8 },
      { r: 12, c: 8, type: 8 }, { r: 18, c: 14, type: 8 },
      { r: 7, c: 4, type: 8 }, { r: 15, c: 18, type: 8 },
      { r: 4, c: 20, type: 9 }, { r: 16, c: 3, type: 9 },
      { r: 9, c: 11, type: 16 }, { r: 20, c: 8, type: 16 },
      { r: 1, c: 22, type: 11 }, { r: 22, c: 1, type: 11 },
      { r: 6, c: 6, type: 13 }, { r: 14, c: 10, type: 13 }
    ],
    playerStart: { r: 22, c: 12 }
  });
})();

// ==============================
// LEVEL SET 2: THE FORTRESS
// ==============================

// --- FORTRESS 1F ---
(function() {
  const m = emptyMap(2);
  // Large hall
  for (let y = 4; y <= 10; y++) { m[y][4] = 1; m[y][10] = 1; }
  for (let x = 4; x <= 10; x++) { m[4][x] = 1; m[10][x] = 1; }
  // Interior pillars
  m[6][6] = 1; m[6][8] = 1; m[8][6] = 1; m[8][8] = 1;
  // Right wing
  for (let y = 3; y <= 8; y++) { m[y][16] = 1; }
  for (let x = 16; x <= 20; x++) { m[3][x] = 1; m[8][x] = 1; }
  m[5][16] = 0; m[6][16] = 0;
  // Bottom corridor
  for (let y = 14; y <= 20; y++) { m[y][8] = 1; }
  m[17][8] = 0;
  // Guard room
  for (let y = 16; y <= 20; y++) { m[y][14] = 1; m[y][20] = 1; }
  for (let x = 14; x <= 20; x++) { m[16][x] = 1; m[20][x] = 1; }
  m[16][14] = 0; m[16][20] = 0; m[20][14] = 0;
  // Doors
  m[10][7] = 0; m[17][14] = 0; m[16][15] = 0; m[16][19] = 0; m[19][14] = 0;
  // Pillars
  m[7][7] = 17; m[7][9] = 17; m[17][16] = 17; m[19][18] = 17;
  // Torches
  m[5][7] = 18; m[5][9] = 18; m[9][5] = 18; m[9][9] = 18;
  m[7][5] = 18; m[7][16] = 18; m[15][9] = 18;
  // Barrels
  m[12][9] = 19; m[17][11] = 19; m[19][15] = 19;

  MAPS.push({
    name: 'Fortress 1F',
    map: m,
    wallTheme: 2,
    exitPos: { r: 2, c: 12 },
    entities: [
      { r: 2, c: 3, type: 6 }, { r: 21, c: 21, type: 7 }, { r: 15, c: 4, type: 7 },
      { r: 3, c: 1, type: 11 }, { r: 22, c: 22, type: 11 },
      { r: 5, c: 5, type: 8 }, { r: 7, c: 18, type: 8 },
      { r: 12, c: 6, type: 8 }, { r: 18, c: 10, type: 8 },
      { r: 6, c: 12, type: 8 },
      { r: 4, c: 18, type: 9 }, { r: 9, c: 6, type: 9 },
      { r: 18, c: 17, type: 10 },
      { r: 12, c: 17, type: 16 }
    ],
    playerStart: { r: 22, c: 2 }
  });
})();

// --- FORTRESS 2F ---
(function() {
  const m = emptyMap(2);
  // Central arena
  for (let y = 5; y <= 18; y++) { m[y][5] = 1; m[y][18] = 1; }
  for (let x = 5; x <= 18; x++) { m[5][x] = 1; m[18][x] = 1; }
  // Cross barriers
  for (let y = 9; y <= 14; y++) { m[y][11] = 1; }
  for (let x = 8; x <= 15; x++) { m[11][x] = 1; }
  m[11][11] = 0; m[11][12] = 0;
  // Top gallery
  for (let x = 8; x <= 15; x++) { m[2][x] = 1; m[3][x] = 1; }
  // Bottom cells
  for (let x = 2; x <= 6; x++) { m[21][x] = 1; }
  for (let y = 20; y <= 22; y++) { m[y][3] = 1; }
  for (let x = 18; x <= 22; x++) { m[21][x] = 1; }
  // Cardinal doors
  m[5][11] = 0; m[18][11] = 0; m[11][5] = 0; m[11][18] = 0;
  // Pillars
  m[8][8] = 17; m[8][14] = 17; m[14][8] = 17; m[14][14] = 17;
  // Torches
  m[6][7] = 18; m[6][16] = 18; m[17][7] = 18; m[17][16] = 18;
  m[9][6] = 18; m[14][6] = 18; m[9][17] = 18; m[14][17] = 18;
  m[3][10] = 18; m[3][13] = 18; m[21][5] = 18; m[21][20] = 18;
  // Barrels
  m[10][13] = 19; m[13][10] = 19;

  MAPS.push({
    name: 'Fortress 2F',
    map: m,
    wallTheme: 2,
    exitPos: { r: 2, c: 20 },
    entities: [
      { r: 3, c: 3, type: 6 }, { r: 20, c: 20, type: 7 }, { r: 12, c: 3, type: 7 },
      { r: 1, c: 1, type: 11 },
      { r: 7, c: 7, type: 8 }, { r: 7, c: 16, type: 8 },
      { r: 10, c: 14, type: 8 }, { r: 15, c: 8, type: 8 },
      { r: 20, c: 5, type: 9 }, { r: 14, c: 4, type: 9 },
      { r: 8, c: 12, type: 16 }, { r: 17, c: 15, type: 16 },
      { r: 6, c: 10, type: 10 }
    ],
    playerStart: { r: 22, c: 2 }
  });
})();

// --- FORTRESS 3F ---
(function() {
  const m = emptyMap(2);
  // Main hall
  for (let y = 3; y <= 12; y++) { m[y][6] = 1; m[y][17] = 1; }
  for (let x = 6; x <= 17; x++) { m[3][x] = 1; m[12][x] = 1; }
  // Balcony
  for (let y = 14; y <= 20; y++) { m[y][8] = 1; m[y][15] = 1; }
  for (let x = 8; x <= 15; x++) { m[14][x] = 1; m[20][x] = 1; }
  // Middle obstruction
  for (let y = 6; y <= 9; y++) { m[y][11] = 1; }
  for (let x = 10; x <= 13; x++) { m[8][x] = 1; }
  m[7][11] = 0; m[8][11] = 0;
  // Doors
  m[12][11] = 0; m[14][9] = 0; m[14][14] = 0; m[15][8] = 0; m[20][9] = 0; m[20][14] = 0;
  // Pillars
  m[7][9] = 17; m[7][14] = 17; m[10][9] = 17; m[10][14] = 17;
  // Torches
  m[4][9] = 18; m[4][14] = 18; m[11][9] = 18; m[11][14] = 18;
  m[15][9] = 18; m[15][14] = 18; m[19][9] = 18; m[19][14] = 18;
  // Barrels
  m[8][12] = 19; m[18][12] = 19;
  // Exit
  m[1][1] = 0; m[2][1] = 0;

  MAPS.push({
    name: 'Fortress 3F',
    map: m,
    wallTheme: 2,
    exitPos: { r: 2, c: 1 },
    entities: [
      { r: 2, c: 22, type: 6 }, { r: 21, c: 2, type: 7 }, { r: 9, c: 4, type: 7 },
      { r: 1, c: 22, type: 11 }, { r: 21, c: 22, type: 11 },
      { r: 5, c: 8, type: 8 }, { r: 5, c: 15, type: 8 },
      { r: 8, c: 14, type: 8 }, { r: 10, c: 8, type: 8 },
      { r: 16, c: 10, type: 9 }, { r: 16, c: 13, type: 9 },
      { r: 18, c: 5, type: 9 },
      { r: 6, c: 13, type: 16 },
      { r: 18, c: 18, type: 10 }
    ],
    playerStart: { r: 22, c: 12 }
  });
})();

// ==============================
// LEVEL SET 3: THE HELL GATE
// ==============================

// --- HELL 1F ---
(function() {
  const m = emptyMap(4);
  // Pentagram room
  for (let y = 4; y <= 19; y++) { m[y][5] = 4; m[y][18] = 4; }
  for (let x = 5; x <= 18; x++) { m[4][x] = 4; m[19][x] = 4; }
  // Parallel barriers
  for (let y = 8; y <= 15; y++) { m[y][9] = 4; m[y][14] = 4; }
  // Center pillars
  m[11][11] = 4; m[11][12] = 4;
  // Top corridor
  for (let x = 8; x <= 15; x++) { m[2][x] = 4; m[3][x] = 4; }
  // Bottom cells
  for (let x = 2; x <= 5; x++) { m[22][x] = 4; }
  for (let x = 18; x <= 22; x++) { m[22][x] = 4; }
  // Cardinal doors
  m[4][11] = 0; m[19][11] = 0; m[11][5] = 0; m[11][18] = 0;
  // Pillars
  m[10][10] = 17; m[10][13] = 17; m[13][10] = 17; m[13][13] = 17;
  // Torches
  m[7][6] = 18; m[7][17] = 18; m[9][10] = 18; m[9][13] = 18;
  m[14][10] = 18; m[14][13] = 18; m[16][6] = 18; m[16][17] = 18;
  m[3][2] = 18; m[3][21] = 18;
  // Barrels
  m[5][12] = 19; m[18][12] = 19;

  MAPS.push({
    name: 'Hell 1F',
    map: m,
    wallTheme: 4,
    exitPos: { r: 1, c: 11 },
    entities: [
      { r: 2, c: 2, type: 6 }, { r: 2, c: 21, type: 7 }, { r: 22, c: 11, type: 7 },
      { r: 1, c: 1, type: 11 }, { r: 1, c: 22, type: 11 }, { r: 21, c: 22, type: 11 },
      { r: 6, c: 7, type: 8 }, { r: 6, c: 16, type: 8 },
      { r: 10, c: 6, type: 8 }, { r: 13, c: 7, type: 8 },
      { r: 10, c: 17, type: 8 }, { r: 13, c: 16, type: 8 },
      { r: 17, c: 8, type: 9 }, { r: 17, c: 15, type: 9 },
      { r: 12, c: 7, type: 10 }, { r: 12, c: 16, type: 10 },
      { r: 8, c: 11, type: 16 }, { r: 15, c: 11, type: 16 },
      { r: 11, c: 8, type: 13 }, { r: 11, c: 15, type: 13 }
    ],
    playerStart: { r: 22, c: 11 }
  });
})();

// --- HELL 2F ---
(function() {
  const m = emptyMap(4);
  // Torture chamber (top-left)
  for (let y = 3; y <= 10; y++) { m[y][4] = 4; m[y][10] = 4; }
  for (let x = 4; x <= 10; x++) { m[3][x] = 4; m[10][x] = 4; }
  // Blood pool room (top-right)
  for (let y = 3; y <= 10; y++) { m[y][14] = 4; m[y][20] = 4; }
  for (let x = 14; x <= 20; x++) { m[3][x] = 4; m[10][x] = 4; }
  // Bottom caves
  for (let y = 14; y <= 20; y++) { m[y][6] = 4; m[y][18] = 4; }
  for (let x = 6; x <= 18; x++) { m[14][x] = 4; m[20][x] = 4; }
  // Connections
  for (let x = 7; x <= 9; x++) { m[7][x] = 0; }
  for (let x = 15; x <= 17; x++) { m[7][x] = 0; }
  for (let x = 9; x <= 13; x++) { m[17][x] = 0; }
  m[8][12] = 0; m[9][12] = 0;
  // Doors
  m[10][7] = 0; m[10][17] = 0; m[14][12] = 0; m[20][12] = 0;
  m[17][6] = 0; m[17][18] = 0;
  // Pillars
  m[5][7] = 17; m[5][17] = 17; m[17][8] = 17; m[17][16] = 17;
  // Torches
  m[5][5] = 18; m[5][19] = 18; m[9][5] = 18; m[9][19] = 18;
  m[16][10] = 18; m[16][14] = 18;
  // Barrels
  m[8][9] = 19; m[10][16] = 19;

  MAPS.push({
    name: 'Hell 2F',
    map: m,
    wallTheme: 4,
    exitPos: { r: 2, c: 1 },
    entities: [
      { r: 3, c: 22, type: 6 }, { r: 13, c: 22, type: 6 },
      { r: 22, c: 3, type: 7 },
      { r: 1, c: 22, type: 11 },
      { r: 5, c: 6, type: 8 }, { r: 5, c: 18, type: 8 },
      { r: 8, c: 5, type: 8 }, { r: 16, c: 8, type: 8 },
      { r: 16, c: 15, type: 8 }, { r: 19, c: 16, type: 8 },
      { r: 6, c: 12, type: 9 }, { r: 12, c: 16, type: 9 },
      { r: 18, c: 7, type: 9 }, { r: 18, c: 17, type: 9 },
      { r: 12, c: 8, type: 16 }, { r: 12, c: 15, type: 16 },
      { r: 5, c: 11, type: 10 },
      { r: 9, c: 9, type: 13 }, { r: 8, c: 16, type: 13 }, { r: 16, c: 12, type: 13 }
    ],
    playerStart: { r: 22, c: 12 }
  });
})();

// --- HELL 3F ---
(function() {
  const m = emptyMap(4);
  // The throne of hell
  for (let y = 3; y <= 10; y++) { m[y][3] = 4; m[y][10] = 4; }
  for (let x = 3; x <= 10; x++) { m[3][x] = 4; m[10][x] = 4; }
  // Second ring
  for (let y = 6; y <= 8; y++) { m[y][6] = 4; m[y][8] = 4; }
  for (let x = 6; x <= 8; x++) { m[6][x] = 4; m[8][x] = 4; }
  // Outer ring
  for (let y = 14; y <= 20; y++) { m[y][5] = 4; m[y][18] = 4; }
  for (let x = 5; x <= 18; x++) { m[14][x] = 4; m[20][x] = 4; }
  // Connections
  for (let x = 6; x <= 8; x++) { m[12][x] = 4; }
  m[12][7] = 0;
  m[12][16] = 0; m[13][16] = 0;
  for (let x = 15; x <= 17; x++) { m[12][x] = 4; }
  // Exit at top
  m[1][1] = 0; m[2][1] = 0;
  // Doors
  m[10][5] = 0;
  m[8][3] = 0;
  m[4][11] = 0;
  m[14][11] = 0;
  m[20][11] = 0;
  m[17][5] = 0;
  m[17][18] = 0;
  // Pillars
  m[5][6] = 17; m[5][8] = 17; m[9][6] = 17; m[9][8] = 17;
  m[16][8] = 17; m[16][16] = 17;
  // Torches
  m[4][6] = 18; m[4][7] = 18; m[5][4] = 18; m[9][4] = 18;
  m[15][6] = 18; m[15][17] = 18; m[19][6] = 18; m[19][17] = 18;
  // Barrels
  m[18][8] = 19; m[18][16] = 19;

  MAPS.push({
    name: 'Hell 3F',
    map: m,
    wallTheme: 4,
    exitPos: { r: 2, c: 1 },
    entities: [
      { r: 22, c: 2, type: 6 }, { r: 22, c: 22, type: 7 },
      { r: 4, c: 5, type: 8 }, { r: 4, c: 8, type: 8 },
      { r: 7, c: 4, type: 8 }, { r: 7, c: 5, type: 8 },
      { r: 15, c: 7, type: 8 }, { r: 15, c: 16, type: 8 },
      { r: 19, c: 7, type: 8 }, { r: 19, c: 16, type: 8 },
      { r: 5, c: 17, type: 9 }, { r: 8, c: 15, type: 9 },
      { r: 16, c: 6, type: 9 }, { r: 16, c: 17, type: 9 },
      { r: 18, c: 10, type: 9 }, { r: 7, c: 12, type: 16 },
      { r: 13, c: 12, type: 16 }, { r: 17, c: 12, type: 16 },
      { r: 4, c: 14, type: 10 }, { r: 11, c: 18, type: 10 },
      { r: 2, c: 11, type: 7 }, { r: 6, c: 5, type: 13 },
      { r: 5, c: 9, type: 13 }, { r: 9, c: 5, type: 13 },
      { r: 9, c: 9, type: 13 }, { r: 15, c: 12, type: 13 },
      { r: 1, c: 22, type: 11 }, { r: 22, c: 1, type: 11 },
      { r: 12, c: 1, type: 11 }
    ],
    playerStart: { r: 22, c: 12 }
  });
})();

const MAPS_ORIG = MAPS.map(l => l.map.map(row => [...row]));
