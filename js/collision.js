const PLAYER_RADIUS = 0.25;
const ENEMY_RADIUS = 0.35;

function canMoveTo(x, y, radius, map) {
  const xMin = Math.floor(x - radius);
  const xMax = Math.floor(x + radius);
  const yMin = Math.floor(y - radius);
  const yMax = Math.floor(y + radius);
  for (let my = yMin; my <= yMax; my++) {
    for (let mx = xMin; mx <= xMax; mx++) {
      if (my < 0 || my >= map.length || mx < 0 || mx >= map[0].length) return false;
      const t = map[my][mx];
      if (t > 0 && t !== 5 && t !== 6 && t !== 7 && t !== 12 && t !== 13 && t !== 14 && t !== 15 && t !== 16 && t !== 18 && t !== 20 && t !== 21 && t !== 22 && t !== 23) return false;
    }
  }
  return true;
}
