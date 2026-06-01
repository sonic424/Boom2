function bfsPathfind(startX, startY, targetX, targetY, map) {
  const MAP_S = CONFIG.MAP_SIZE;
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  const tx = Math.floor(targetX);
  const ty = Math.floor(targetY);

  if (sx === tx && sy === ty) return null;

  const queue = [{ x: sx, y: sy }];
  const visited = new Set();
  const parent = {};
  visited.add(sx + ',' + sy);

  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.x === tx && cur.y === ty) break;

    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (let d = 0; d < dirs.length; d++) {
      const nx = cur.x + dirs[d][0];
      const ny = cur.y + dirs[d][1];
      const key = nx + ',' + ny;
      if (nx >= 0 && nx < MAP_S && ny >= 0 && ny < MAP_S && !visited.has(key)) {
        if (canMoveTo(nx + 0.5, ny + 0.5, ENEMY_RADIUS, map)) {
          visited.add(key);
          parent[key] = cur;
          queue.push({ x: nx, y: ny });
        }
      }
    }
  }

  const targetKey = tx + ',' + ty;
  if (!(targetKey in parent)) return null;

  const path = [];
  let cur = { x: tx, y: ty };
  while (cur) {
    path.unshift(cur);
    const key = cur.x + ',' + cur.y;
    cur = parent[key] || null;
  }

  if (path.length >= 2) {
    return { x: path[1].x + 0.5, y: path[1].y + 0.5 };
  }
  return null;
}
