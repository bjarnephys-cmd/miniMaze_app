/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Position, TileType, BarrierElement, PushBlock } from '../types/game';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export function findPath(
  start: Position,
  target: Position,
  map: TileType[][],
  barriers: BarrierElement[],
  blocks: PushBlock[],
  hasKeys: { bronze: number; silver: number; gold: number }
): Position[] {
  if (start.x === target.x && start.y === target.y) return [];

  const height = map.length;
  const width = map[0].length;

  if (target.y < 0 || target.y >= height || target.x < 0 || target.x >= width) {
    return [];
  }

  // Helper to check if a tile is walkable
  const isWalkable = (x: number, y: number): boolean => {
    if (y < 0 || y >= height || x < 0 || x >= width) return false;
    const tile = map[y][x];

    if (tile === 'WALL' || tile === 'CHASM' || tile === 'EMPTY') return false;

    // Check locked doors if player can pass
    if (tile === 'DOOR_BRONZE' && hasKeys.bronze <= 0) return false;
    if (tile === 'DOOR_SILVER' && hasKeys.silver <= 0) return false;
    if (tile === 'DOOR_GOLD' && hasKeys.gold <= 0) return false;

    // Check barriers
    const barrier = barriers.find((b) => b.x === x && b.y === y);
    if (barrier && !barrier.isOpen) return false;

    // Push blocks block pathfinding unless pushing (for click-to-move, avoid walk-into block)
    const block = blocks.find((b) => b.x === x && b.y === y);
    if (block) return false;

    return true;
  };

  if (!isWalkable(target.x, target.y)) {
    return [];
  }

  const openList: Node[] = [];
  const closedSet = new Set<string>();

  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h: Math.abs(target.x - start.x) + Math.abs(target.y - start.y),
    f: Math.abs(target.x - start.x) + Math.abs(target.y - start.y),
    parent: null,
  };

  openList.push(startNode);

  const keyOf = (x: number, y: number) => `${x},${y}`;

  const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ];

  while (openList.length > 0) {
    // Pick lowest f
    let bestIdx = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[bestIdx].f) {
        bestIdx = i;
      }
    }

    const current = openList.splice(bestIdx, 1)[0];

    if (current.x === target.x && current.y === target.y) {
      // Reconstruct path
      const path: Position[] = [];
      let curr: Node | null = current;
      while (curr && (curr.x !== start.x || curr.y !== start.y)) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      return path.reverse();
    }

    closedSet.add(keyOf(current.x, current.y));

    for (const dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const nKey = keyOf(nx, ny);

      if (closedSet.has(nKey)) continue;
      if (!isWalkable(nx, ny)) continue;

      const gScore = current.g + 1;
      const existingOpen = openList.find((n) => n.x === nx && n.y === ny);

      if (!existingOpen) {
        const hScore = Math.abs(target.x - nx) + Math.abs(target.y - ny);
        openList.push({
          x: nx,
          y: ny,
          g: gScore,
          h: hScore,
          f: gScore + hScore,
          parent: current,
        });
      } else if (gScore < existingOpen.g) {
        existingOpen.g = gScore;
        existingOpen.f = gScore + existingOpen.h;
        existingOpen.parent = current;
      }
    }
  }

  return [];
}
