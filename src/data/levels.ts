/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, TileType } from '../types/game';

// Helper to construct a grid filled with walls
function makeGrid(width: number, height: number): TileType[][] {
  const grid: TileType[][] = [];
  for (let y = 0; y < height; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      row.push('WALL');
    }
    grid.push(row);
  }
  return grid;
}

/* =========================================================================
   LEVEL 1: The Crypt of Whispers
   Focus: Movement fundamentals, lever switch to disarm spike corridor,
          collecting bronze key, unlocking door, finding hidden gems.
   ========================================================================= */
function createLevel1(): LevelData {
  const width = 15;
  const height = 11;
  const map = makeGrid(width, height);

  // Carve corridors (FLOOR)
  // Start area
  for (let x = 1; x <= 3; x++) map[1][x] = 'FLOOR';
  for (let y = 1; y <= 5; y++) map[y][1] = 'FLOOR';

  // Lever alcove at (1, 9)
  for (let y = 5; y <= 9; y++) map[y][1] = 'FLOOR';
  map[9][2] = 'FLOOR';

  // Central corridor & Spike trap choke point
  for (let x = 1; x <= 6; x++) map[3][x] = 'FLOOR';
  map[3][4] = 'SPIKE_TRAP';
  map[3][5] = 'SPIKE_TRAP';

  // Key chamber (North-East)
  for (let y = 1; y <= 5; y++) map[y][6] = 'FLOOR';
  for (let x = 6; x <= 9; x++) map[1][x] = 'FLOOR';
  for (let y = 1; y <= 3; y++) map[y][9] = 'FLOOR';

  // Locked Bronze Door at (6, 5) connecting to southern passage
  map[5][6] = 'DOOR_BRONZE';

  // South-east path to exit
  for (let y = 5; y <= 9; y++) map[y][6] = 'FLOOR';
  for (let x = 6; x <= 13; x++) map[7][x] = 'FLOOR';
  for (let y = 7; y >= 3; y--) map[y][13] = 'FLOOR';
  for (let x = 10; x <= 13; x++) map[3][x] = 'FLOOR';
  for (let y = 3; y <= 5; y++) map[y][10] = 'FLOOR';

  // Switch at (2, 9)
  map[9][2] = 'SWITCH';

  // Tablet at (3, 1)
  map[1][3] = 'TABLET';

  // Start & Exit
  map[1][1] = 'START';
  map[5][10] = 'EXIT';

  return {
    id: 1,
    title: 'The Crypt of Whispers',
    subtitle: 'Awakening in the Sunken Vaults',
    description: 'Deactivate the spike traps using the ancient lever, retrieve the Bronze Key from the northern armory, and unlock the exit gate.',
    difficulty: 'Novice',
    width,
    height,
    map,
    startPos: { x: 1, y: 1 },
    exitPos: { x: 10, y: 5 },
    collectibles: [
      { id: 'c1_key_bronze', type: 'KEY_BRONZE', x: 9, y: 3 },
      { id: 'c1_gem1', type: 'GEM_RUBY', x: 7, y: 1, value: 100 },
      { id: 'c1_gem2', type: 'GEM_EMERALD', x: 1, y: 7, value: 150 },
      { id: 'c1_gem3', type: 'GEM_SAPPHIRE', x: 13, y: 7, value: 200 },
      { id: 'c1_potion', type: 'POTION', x: 13, y: 9 },
      { id: 'c1_chest', type: 'CHEST', x: 13, y: 3, value: 300 },
    ],
    blocks: [],
    switches: [
      { id: 'sw1', x: 2, y: 9, isOn: false, targetIds: ['sp1', 'sp2'] },
    ],
    plates: [],
    spikes: [
      { id: 'sp1', x: 4, y: 3, isActive: true },
      { id: 'sp2', x: 5, y: 3, isActive: true },
    ],
    barriers: [],
    tablets: [
      {
        x: 3,
        y: 1,
        title: 'Stone Inscription',
        message: '“The path forward is barred by jagged steel spikes. Seek the iron lever deep within the western alcove to silence them.”',
      },
    ],
    parSteps: 34,
    parTimeSeconds: 45,
  };
}

/* =========================================================================
   LEVEL 2: The Chamber of Weights
   Focus: Pushable stone block puzzle, pressure plate mechanics,
          timed or switch-toggled rune barriers, silver key retrieval.
   ========================================================================= */
function createLevel2(): LevelData {
  const width = 17;
  const height = 13;
  const map = makeGrid(width, height);

  // Start chamber (1,1) to (3,3)
  for (let x = 1; x <= 3; x++) {
    for (let y = 1; y <= 3; y++) {
      map[y][x] = 'FLOOR';
    }
  }

  // Corridor going south into block puzzle chamber
  for (let y = 3; y <= 7; y++) map[y][2] = 'FLOOR';

  // Block puzzle room (x: 2 to 6, y: 7 to 11)
  for (let x = 2; x <= 6; x++) {
    for (let y = 7; y <= 11; y++) {
      map[y][x] = 'FLOOR';
    }
  }

  // Pressure Plate at (5, 9)
  map[9][5] = 'PRESSURE_PLATE';

  // Connecting passage from puzzle room to center corridor
  for (let x = 6; x <= 9; x++) map[9][x] = 'FLOOR';

  // Barrier at (8, 9) controlled by pressure plate
  map[9][8] = 'DOOR_BARRIER';

  // Center sanctuary (x: 8 to 11, y: 1 to 5)
  for (let y = 1; y <= 9; y++) map[y][9] = 'FLOOR';
  for (let x = 8; x <= 11; x++) map[3][x] = 'FLOOR';

  // Silver Key at (11, 3)
  // Silver Door at (13, 7)
  map[7][13] = 'DOOR_SILVER';

  // Eastern hallway leading to exit
  for (let y = 5; y <= 11; y++) map[y][13] = 'FLOOR';
  for (let x = 13; x <= 15; x++) map[11][x] = 'FLOOR';
  for (let y = 11; y >= 5; y--) map[y][15] = 'FLOOR';
  map[5][15] = 'EXIT';

  // Secret lever room (x: 10 to 12, y: 9 to 11)
  for (let x = 9; x <= 12; x++) map[11][x] = 'FLOOR';
  map[11][12] = 'SWITCH';

  // Periodic spikes in eastern passage
  map[9][13] = 'SPIKE_TRAP';
  map[10][13] = 'SPIKE_TRAP';

  // Tablet at (2, 1)
  map[1][2] = 'TABLET';

  map[1][1] = 'START';

  return {
    id: 2,
    title: 'The Chamber of Weights',
    subtitle: 'Mechanisms of the Golem Builders',
    description: 'Push the heavy runestone onto the pressure plate to lower the energy barrier. Claim the Silver Key and bypass the active spikes.',
    difficulty: 'Apprentice',
    width,
    height,
    map,
    startPos: { x: 1, y: 1 },
    exitPos: { x: 15, y: 5 },
    collectibles: [
      { id: 'c2_key_silver', type: 'KEY_SILVER', x: 11, y: 3 },
      { id: 'c2_gem1', type: 'GEM_EMERALD', x: 3, y: 11, value: 150 },
      { id: 'c2_gem2', type: 'GEM_SAPPHIRE', x: 9, y: 1, value: 200 },
      { id: 'c2_gem3', type: 'GEM_RUBY', x: 15, y: 11, value: 250 },
      { id: 'c2_chest', type: 'CHEST', x: 10, y: 11, value: 400 },
      { id: 'c2_potion', type: 'POTION', x: 13, y: 5 },
    ],
    blocks: [
      { id: 'blk1', x: 3, y: 9 },
    ],
    switches: [
      { id: 'sw2_secret', x: 12, y: 11, isOn: false, targetIds: ['sp2_1', 'sp2_2'] },
    ],
    plates: [
      { id: 'plt1', x: 5, y: 9, isPressed: false, targetIds: ['bar1'] },
    ],
    spikes: [
      { id: 'sp2_1', x: 13, y: 9, isActive: true, periodMs: 2400 },
      { id: 'sp2_2', x: 13, y: 10, isActive: true, periodMs: 2400 },
    ],
    barriers: [
      { id: 'bar1', x: 8, y: 9, isOpen: false },
    ],
    tablets: [
      {
        x: 2,
        y: 1,
        title: 'Runed Tablet of Mechanics',
        message: '“The glowing floor plate requires sustained mass. Push the heavy cubic rune block directly onto the plate to keep the passage unlocked.”',
      },
    ],
    parSteps: 48,
    parTimeSeconds: 65,
  };
}

/* =========================================================================
   LEVEL 3: The Labyrinth of the Ancient Warden
   Focus: Multi-switch logic gate, dual push blocks, moving patrol hazard,
          ancient relic artifact collection, gold door boss exit.
   ========================================================================= */
function createLevel3(): LevelData {
  const width = 19;
  const height = 15;
  const map = makeGrid(width, height);

  // Carve main starting wing
  for (let x = 1; x <= 4; x++) map[1][x] = 'FLOOR';
  for (let y = 1; y <= 5; y++) map[y][3] = 'FLOOR';

  // Western block room
  for (let x = 1; x <= 5; x++) {
    for (let y = 5; y <= 8; y++) {
      map[y][x] = 'FLOOR';
    }
  }

  // Pressure plates in western room
  map[6][1] = 'PRESSURE_PLATE';
  map[8][5] = 'PRESSURE_PLATE';

  // Hallway from west room to central grand corridor
  for (let x = 5; x <= 9; x++) map[7][x] = 'FLOOR';

  // Barriers blocking central access
  map[7][8] = 'DOOR_BARRIER';

  // Central hall (x: 8 to 11, y: 1 to 13)
  for (let y = 1; y <= 13; y++) {
    map[y][9] = 'FLOOR';
    map[y][10] = 'FLOOR';
  }

  // Relic Vault in the far North-East
  for (let x = 11; x <= 17; x++) map[2][x] = 'FLOOR';
  for (let y = 2; y <= 6; y++) map[y][16] = 'FLOOR';
  for (let x = 14; x <= 17; x++) map[6][x] = 'FLOOR';
  map[6][14] = 'DOOR_BRONZE';

  // Southern wing with Gold Key & switch
  for (let x = 5; x <= 9; x++) map[12][x] = 'FLOOR';
  for (let y = 10; y <= 13; y++) map[y][5] = 'FLOOR';
  map[13][5] = 'SWITCH';

  // Eastern exit sanctum
  for (let x = 11; x <= 17; x++) map[11][x] = 'FLOOR';
  for (let y = 11; y <= 13; y++) map[y][17] = 'FLOOR';
  map[11][13] = 'DOOR_GOLD';
  map[13][17] = 'EXIT';

  // Traps in central hall
  map[4][9] = 'SPIKE_TRAP';
  map[4][10] = 'SPIKE_TRAP';
  map[10][9] = 'SPIKE_TRAP';
  map[10][10] = 'SPIKE_TRAP';

  // Tablet at (3, 1)
  map[1][2] = 'TABLET';

  map[1][1] = 'START';

  return {
    id: 3,
    title: 'The Labyrinth of the Ancient Warden',
    subtitle: 'Sanctum of the Arcane Relic',
    description: 'Solve the dual-plate puzzle, dodge the patrolling spectral warden, recover the Bronze and Gold keys, and secure the legendary Ancient Talisman!',
    difficulty: 'Master',
    width,
    height,
    map,
    startPos: { x: 1, y: 1 },
    exitPos: { x: 17, y: 13 },
    collectibles: [
      { id: 'c3_key_bronze', type: 'KEY_BRONZE', x: 5, y: 10 },
      { id: 'c3_key_gold', type: 'KEY_GOLD', x: 17, y: 6 },
      { id: 'c3_relic', type: 'RELIC', x: 16, y: 2, value: 1000 },
      { id: 'c3_gem1', type: 'GEM_EMERALD', x: 1, y: 8, value: 150 },
      { id: 'c3_gem2', type: 'GEM_RUBY', x: 9, y: 1, value: 200 },
      { id: 'c3_gem3', type: 'GEM_SAPPHIRE', x: 17, y: 2, value: 250 },
      { id: 'c3_chest', type: 'CHEST', x: 10, y: 13, value: 500 },
      { id: 'c3_potion', x: 16, y: 4, type: 'POTION' },
    ],
    blocks: [
      { id: 'blk3_1', x: 2, y: 7 },
      { id: 'blk3_2', x: 4, y: 7 },
    ],
    switches: [
      { id: 'sw3_spikes', x: 5, y: 13, isOn: false, targetIds: ['sp3_1', 'sp3_2', 'sp3_3', 'sp3_4'] },
    ],
    plates: [
      { id: 'plt3_1', x: 1, y: 6, isPressed: false, targetIds: ['bar3_1'] },
      { id: 'plt3_2', x: 5, y: 8, isPressed: false, targetIds: ['bar3_1'] },
    ],
    spikes: [
      { id: 'sp3_1', x: 9, y: 4, isActive: true },
      { id: 'sp3_2', x: 10, y: 4, isActive: true },
      { id: 'sp3_3', x: 9, y: 10, isActive: true },
      { id: 'sp3_4', x: 10, y: 10, isActive: true },
    ],
    barriers: [
      { id: 'bar3_1', x: 8, y: 7, isOpen: false },
    ],
    sentries: [
      {
        id: 'sentry1',
        x: 9,
        y: 6,
        path: [
          { x: 9, y: 6 },
          { x: 9, y: 8 },
          { x: 10, y: 8 },
          { x: 10, y: 6 },
        ],
        pathIndex: 0,
        direction: 1,
        speedMs: 650,
      },
    ],
    tablets: [
      {
        x: 2,
        y: 1,
        title: 'Inscription of the Warden',
        message: '“Two rune blocks must weigh down both ancient floor plates together to breach the inner sanctum. Beware the wandering spectral warden who guards the grand hall.”',
      },
    ],
    parSteps: 68,
    parTimeSeconds: 90,
  };
}

export const LEVELS: LevelData[] = [
  createLevel1(),
  createLevel2(),
  createLevel3(),
];

export function getLevelById(id: number): LevelData | undefined {
  const found = LEVELS.find((l) => l.id === id);
  if (!found) return undefined;
  // Return deep clone so mutations in a game session don't poison static definitions
  return JSON.parse(JSON.stringify(found));
}
