const CONFIG = {
  WIDTH: 640,
  HEIGHT: 480,
  FOV: Math.PI / 3,
  HALF_FOV: Math.PI / 6,
  TEX_SIZE: 64,
  MAP_SIZE: 24,
  TILE_SIZE: 1,
  PLAYER_SPEED: 4.5,
  PLAYER_ROT_SPEED: 3,
  MOUSE_SENSITIVITY: 0.003,
  DASH_SPEED: 18,
  DASH_DURATION: 0.15,
  DASH_COOLDOWN: 2,
  DASH_DAMAGE: 5,
  MAX_HEALTH: 100,
  FOG_DISTANCE: 24,
  FLOORS_PER_LEVEL: 3,
  TOTAL_LEVEL_SETS: 3,
  ANIM_FRAMES: 8,
  WEAPONS: {
    pistol: { name: 'Pistol', damage: 20, fireRate: 0.35, ammo: Infinity, spread: 0, key: '1' },
    shotgun: { name: 'Shotgun', damage: 30, fireRate: 0.7, ammo: 20, maxAmmo: 60, spread: 0.08, pellets: 5, key: '2' },
    plasma: { name: 'Plasma Gun', damage: 35, fireRate: 0.12, ammo: 30, maxAmmo: 100, spread: 0.01, key: '3' }
  },
  ENEMIES: {
    imp: { hp: 30, speed: 2, damage: 12, attackRange: 7, attackCooldown: 1.5, type: 'ranged', score: 100 },
    demon: { hp: 150, speed: 2.5, damage: 25, attackRange: 1.5, attackCooldown: 0.8, type: 'melee', score: 200 },
    baron: { hp: 100, speed: 1.5, damage: 30, attackRange: 6, attackCooldown: 2, type: 'ranged', score: 300 },
    spectre: { hp: 60, speed: 2.5, damage: 18, attackRange: 1.5, attackCooldown: 1, type: 'melee', score: 150 }
  },
  TILES: {
    EMPTY: 0, WALL1: 1, WALL2: 2, WALL3: 3, WALL4: 4,
    EXIT: 5, HEALTH: 6, AMMO: 7, IMP: 8, DEMON: 9, BARON: 10, EASTER_EGG: 11,
    SCARE_HEALTH: 12, GORE: 13, STAIRS_UP: 14, STAIRS_DOWN: 15, SPECTRE: 16,
    PILLAR: 17, TORCH: 18, BARREL: 19,
    CORPSE: 20, HEAD: 21, GUTS: 22, COBWEB: 23, SKELETON: 24, STATUE: 25
  },
  COLORS: {
    WALL1: '#5A1A1A',
    WALL2: '#3A2A2A',
    WALL3: '#2A2A2A',
    WALL4: '#4A1A2A',
    HUD_BG: 'rgba(0,0,0,0.7)',
    HEALTH_BAR: '#00ff00',
    HEALTH_LOW: '#ff0000',
    AMMO_TEXT: '#ffaa00'
  }
};
