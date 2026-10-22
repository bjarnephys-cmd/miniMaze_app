/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export type TileType =
  | 'EMPTY'
  | 'WALL'
  | 'FLOOR'
  | 'START'
  | 'EXIT'
  | 'DOOR_BRONZE'
  | 'DOOR_SILVER'
  | 'DOOR_GOLD'
  | 'DOOR_BARRIER'   // Lowered by switch/plate
  | 'SPIKE_TRAP'
  | 'PRESSURE_PLATE'
  | 'SWITCH'
  | 'TABLET'        // Inscribed stone with hints/lore
  | 'CHASM';         // Pitfall / hole

export type CollectibleType =
  | 'GEM_RUBY'
  | 'GEM_SAPPHIRE'
  | 'GEM_EMERALD'
  | 'KEY_BRONZE'
  | 'KEY_SILVER'
  | 'KEY_GOLD'
  | 'POTION'
  | 'CHEST'
  | 'RELIC';

export interface Position {
  x: number;
  y: number;
}

export interface Collectible {
  id: string;
  type: CollectibleType;
  x: number;
  y: number;
  value?: number;
  collected?: boolean;
}

export interface PushBlock {
  id: string;
  x: number;
  y: number;
  color?: string;
}

export interface SwitchElement {
  id: string;
  x: number;
  y: number;
  isOn: boolean;
  targetIds: string[]; // ids of barriers or traps it controls
}

export interface PressurePlateElement {
  id: string;
  x: number;
  y: number;
  isPressed: boolean;
  targetIds: string[]; // ids of barriers it controls
}

export interface SpikeTrapElement {
  id: string;
  x: number;
  y: number;
  isActive: boolean;
  periodMs?: number;
  controlledBySwitch?: string;
}

export interface BarrierElement {
  id: string;
  x: number;
  y: number;
  isOpen: boolean; // open = walkable, closed = wall
}

export interface TabletElement {
  x: number;
  y: number;
  title: string;
  message: string;
}

export interface SentryHazard {
  id: string;
  x: number;
  y: number;
  path: Position[];
  pathIndex: number;
  direction: 1 | -1;
  speedMs: number;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Novice' | 'Apprentice' | 'Master' | 'Procedural';
  width: number;
  height: number;
  map: TileType[][];
  startPos: Position;
  exitPos: Position;
  collectibles: Collectible[];
  blocks: PushBlock[];
  switches: SwitchElement[];
  plates: PressurePlateElement[];
  spikes: SpikeTrapElement[];
  barriers: BarrierElement[];
  tablets: TabletElement[];
  sentries?: SentryHazard[];
  parSteps: number;
  parTimeSeconds: number;
}

export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
  health: number;
  maxHealth: number;
  keys: {
    bronze: number;
    silver: number;
    gold: number;
  };
  gems: number;
  score: number;
  steps: number;
  hasRelic: boolean;
  isInvulnerable: boolean;
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  stars: number;
  bestTime: number;
  bestSteps: number;
  highScore: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  showGridCoordinates: boolean;
  showDpad: boolean;
  clickToMove: boolean;
  fogOfWar: boolean;
}
